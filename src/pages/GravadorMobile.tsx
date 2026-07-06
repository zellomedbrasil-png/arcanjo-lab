import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mic, Square, Loader2, Check, RefreshCw, AlertCircle, Smartphone, Wifi, Radio } from 'lucide-react';
import { SyncService, type SyncMessage } from '../services/syncService';
import {
  getTranscriptionEngine, setTranscriptionEngine, TRANSCRIPTION_ENGINES,
  transcribeAudioBlob, isTimeoutAbort, type TranscriptionEngine,
} from '../services/transcription';
import { startLiveSpeech, isLiveSpeechSupported, type LiveSpeechController } from '../services/liveSpeech';
import { toast } from '../lib/toast';

export default function GravadorMobile() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room') || '';

  const [connected, setConnected] = useState(false);
  const [pacienteNome, setPacienteNome] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcriptionText, setTranscriptionText] = useState('');
  const [error, setError] = useState<string | null>(() => roomId ? null : 'Código de sala (room) inválido ou ausente na URL.');
  const [selectedEngine, setSelectedEngine] = useState<TranscriptionEngine>(() => getTranscriptionEngine());
  const [interimText, setInterimText] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const syncServiceRef = useRef<SyncService | null>(null);
  const liveControllerRef = useRef<LiveSpeechController | null>(null);
  // Mantém a tela do celular acesa durante a gravação — tela apagada pode
  // pausar o MediaRecorder em vários aparelhos Android/iOS.
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);

  const acquireWakeLock = async () => {
    try {
      const nav = navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> } };
      if (nav.wakeLock) {
        wakeLockRef.current = await nav.wakeLock.request('screen');
      }
    } catch {
      // Sem suporte ou permissão — segue sem manter a tela acesa.
    }
  };

  const releaseWakeLock = async () => {
    try {
      await wakeLockRef.current?.release();
    } catch {
      // já liberado
    } finally {
      wakeLockRef.current = null;
    }
  };

  // Auto-connect to Room
  useEffect(() => {
    if (!roomId) {
      return;
    }

    const sync = new SyncService(roomId);
    syncServiceRef.current = sync;

    console.log(`[MobileMic] Connecting to room: ${roomId}`);

    const unsubscribe = sync.subscribe(
      (msg: SyncMessage) => {
        if (msg.type === 'DESKTOP_READY') {
          setConnected(true);
          if (msg.payload?.pacienteNome) {
            setPacienteNome(msg.payload.pacienteNome);
          }
        } else if (msg.type === 'PATIENT_SYNC') {
          // Qualquer mensagem do desktop comprova que o pareamento está ativo
          setConnected(true);
          if (msg.payload?.pacienteNome) {
            setPacienteNome(msg.payload.pacienteNome);
          } else {
            setPacienteNome('');
          }
        }
      },
      (err) => {
        console.error('[MobileMic] Sync error:', err);
        setConnected(false);
      }
    );

    return () => {
      unsubscribe();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (liveControllerRef.current) {
        liveControllerRef.current.stop();
        liveControllerRef.current = null;
      }
      releaseWakeLock();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // O navegador solta o wake lock quando o app vai para segundo plano;
  // ao voltar durante uma gravação, readquire para a tela seguir acesa.
  useEffect(() => {
    if (!isRecording) return;
    const onVisibility = () => {
      if (document.visibilityState === 'visible') acquireWakeLock();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  // Periodic announcement to desktop, stopping once connected
  useEffect(() => {
    if (!roomId || connected) {
      return;
    }

    const announceConnection = async () => {
      if (syncServiceRef.current) {
        await syncServiceRef.current.publish({ type: 'MOBILE_CONNECTED' });
      }
    };

    // Retry connection announcement a few times to ensure desktop receives it
    announceConnection();
    const announceInterval = setInterval(announceConnection, 3000);

    return () => {
      clearInterval(announceInterval);
    };
  }, [roomId, connected]);

  // Recording timer is handled directly inside startRecording/stopRecording to avoid useEffect setState lints

  const formatTime = (timeInSeconds: number) => {
    const mins = Math.floor(timeInSeconds / 60);
    const secs = timeInSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Ditado ao vivo (Web Speech / Google): envia cada trecho finalizado ao desktop.
  const liveAccumRef = useRef('');

  // Reset idempotente do estado do ditado ao vivo (fim, erro fatal ou stop).
  const finalizeLive = async () => {
    liveControllerRef.current = null;
    setInterimText('');
    setIsRecording(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    await releaseWakeLock();
    if (syncServiceRef.current) {
      await syncServiceRef.current.publish({
        type: 'RECORDING_STATUS',
        payload: { isRecording: false, isTranscribing: false }
      });
    }
  };

  const startLiveDictation = async () => {
    if (!isLiveSpeechSupported()) {
      setError('Ditado ao vivo indisponível neste navegador. Use o Chrome do Android ou troque para Whisper.');
      toast.error('Ditado ao vivo indisponível aqui.');
      return;
    }
    setError(null);
    liveAccumRef.current = '';
    try {
      liveControllerRef.current = startLiveSpeech({
        lang: 'pt-BR',
        onPartial: (t) => setInterimText(t),
        onFinal: (t) => {
          setInterimText('');
          liveAccumRef.current = liveAccumRef.current ? `${liveAccumRef.current} ${t}` : t;
          setTranscriptionText(liveAccumRef.current);
          // Envia só o trecho novo — o desktop concatena no prontuário.
          syncServiceRef.current?.publish({ type: 'TRANSCRIPTION_RESULT', payload: { text: t } });
        },
        onError: (m) => { setError(m); toast.error(m); },
        // Fim da sessão reseta a UI — evita ficar preso em "gravando".
        onEnd: () => { finalizeLive(); },
      });
      setIsRecording(true);
      setRecordingTime(0);
      await acquireWakeLock();
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      if (syncServiceRef.current) {
        await syncServiceRef.current.publish({ type: 'RECORDING_STATUS', payload: { isRecording: true } });
      }
      toast.success('Ditado ao vivo iniciado...');
    } catch {
      await finalizeLive();
      setError('Erro ao iniciar o ditado ao vivo.');
      toast.error('Falha no ditado ao vivo.');
    }
  };

  const startRecording = async () => {
    if (selectedEngine === 'google-live') {
      await startLiveDictation();
      return;
    }

    audioChunksRef.current = [];
    setError(null);

    // Secure context check for microphone access
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Gravação de áudio indisponível. A gravação requer uma conexão segura (HTTPS) ou localhost para acessar o microfone do celular.');
      toast.error('Microfone indisponível (requer HTTPS).');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Determine the best supported mime-type for the device
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/aac',
        'audio/wav'
      ];
      
      let selectedMimeType = '';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedMimeType = type;
          break;
        }
      }

      console.log(`[MobileMic] Recording with mime-type: ${selectedMimeType}`);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType || undefined
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: selectedMimeType || 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        await transcreverAudio(audioBlob, selectedMimeType);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      await acquireWakeLock();
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      
      // Notify desktop that recording started
      if (syncServiceRef.current) {
        await syncServiceRef.current.publish({
          type: 'RECORDING_STATUS',
          payload: { isRecording: true }
        });
      }
      
      toast.success('Gravação iniciada...');
    } catch (err) {
      console.error(err);
      setError('Erro ao acessar microfone. Verifique se deu permissão de áudio ao navegador no seu celular.');
      toast.error('Sem permissão de microfone.');
    }
  };

  const stopRecording = async () => {
    // Ditado ao vivo: encerra o reconhecimento; o texto já foi enviado em trechos.
    if (liveControllerRef.current) {
      liveControllerRef.current.stop();
      await finalizeLive();
      return;
    }

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      await releaseWakeLock();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      // Notify desktop that recording stopped and is transcribing
      if (syncServiceRef.current) {
        await syncServiceRef.current.publish({
          type: 'RECORDING_STATUS',
          payload: { isRecording: false, isTranscribing: true }
        });
      }
    }
  };

  const transcreverAudio = async (audioBlob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    const engine = getTranscriptionEngine() === 'gemini' ? 'gemini' : 'whisper';
    toast.info(engine === 'gemini' ? 'Transcrevendo com Gemini...' : 'Transcrevendo áudio com Whisper...');
    try {
      const text = await transcribeAudioBlob(audioBlob, mimeType, engine);
      if (text && text.trim()) {
        setTranscriptionText(text);
        toast.success('Áudio transcrito com sucesso!');

        // Send transcription to Desktop
        if (syncServiceRef.current) {
          const success = await syncServiceRef.current.publish({
            type: 'TRANSCRIPTION_RESULT',
            payload: { text: text.trim() }
          });
          if (success) {
            toast.success('Enviado para o prontuário!');
          } else {
            toast.error('Erro ao espelhar com o computador.');
          }
        }
      } else {
        setError('Não foi possível identificar fala no áudio.');
        toast.error('Nenhuma fala detectada.');
      }
    } catch (err: unknown) {
      console.error('[MobileMic] Transcription error:', err);
      const errMsg = isTimeoutAbort(err)
        ? 'Tempo limite na transcrição. Tente novamente ou grave um trecho menor.'
        : (err instanceof Error ? err.message : 'Erro de rede ou limite de cota atingido.');
      setError(`Erro na transcrição: ${errMsg}`);
      toast.error('Falha ao transcrever.');
      
      // Notify desktop of failure
      if (syncServiceRef.current) {
        await syncServiceRef.current.publish({
          type: 'RECORDING_STATUS',
          payload: { isRecording: false, isTranscribing: false }
        });
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  const triggerAI = async (action: 'SOAP' | 'JUSTIFICATIVA') => {
    if (!syncServiceRef.current) return;
    toast.info(`Solicitando geração de ${action} no computador...`);
    const success = await syncServiceRef.current.publish({
      type: 'TRIGGER_AI',
      payload: { action }
    });
    if (success) {
      toast.success('Solicitado!');
    } else {
      toast.error('Falha ao comunicar com o computador.');
    }
  };

  if (error && !roomId) {
    return (
      <div className="min-h-dvh bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4 animate-bounce" />
        <h1 className="text-xl font-bold font-display text-white mb-2">Sala não Encontrada</h1>
        <p className="text-sm text-slate-400 max-w-sm leading-relaxed">{error}</p>
        <p className="text-xs text-slate-500 mt-6">Escaneie o QR Code exibido na tela do prontuário no seu computador.</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100 flex flex-col justify-between px-6 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] font-sans">
      
      {/* Header / Connection Status */}
      <header className="flex items-center justify-between border-b border-slate-900 pb-4">
        <div className="flex items-center gap-2">
          <Smartphone className="text-indigo-400 h-5 w-5" />
          <span className="text-sm font-bold font-display tracking-tight text-white">Gravador Remoto</span>
        </div>
        
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
          connected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'bg-amber-500/10 text-amber-400 border border-amber-500/25 animate-pulse'
        }`}>
          {connected ? (
            <>
              <Wifi size={12} />
              Conectado
            </>
          ) : (
            <>
              <RefreshCw size={12} className="animate-spin" />
              Sincronizando...
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center items-center py-8 space-y-8">
        
        {/* Patient Label */}
        <div className="text-center space-y-1">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Consulta Atual</p>
          <h2 className="text-lg font-bold text-white font-display">
            {pacienteNome ? pacienteNome : <span className="text-slate-400 italic">Prontuário sem paciente</span>}
          </h2>
          {roomId && (
            <p className="text-[10px] font-mono text-indigo-400/70 bg-indigo-500/5 px-2 py-0.5 rounded-full inline-block">
              Sala: {roomId}
            </p>
          )}
        </div>

        {/* Pulse Visualizer & Record Button */}
        <div className="relative flex items-center justify-center h-48 w-48">
          {/* Animated pulsing background circles */}
          {isRecording && (
            <>
              <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping" />
              <div className="absolute inset-4 rounded-full bg-red-500/20 animate-pulse duration-1000" />
              <div className="absolute inset-8 rounded-full bg-red-500/30 animate-pulse duration-700" />
            </>
          )}
          {isTranscribing && (
            <div className="absolute inset-0 rounded-full border border-indigo-500/30 border-t-indigo-500 animate-spin" />
          )}

          {/* Core Button */}
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="relative h-32 w-32 rounded-full bg-red-600 hover:bg-red-700 text-white flex flex-col items-center justify-center shadow-lg shadow-red-950/50 border-4 border-red-500/30 transition-all active:scale-95 cursor-pointer"
            >
              <Square size={36} fill="white" className="mb-2" />
              <span className="text-xs font-bold tracking-widest">{formatTime(recordingTime)}</span>
            </button>
          ) : isTranscribing ? (
            <div className="relative h-32 w-32 rounded-full bg-slate-900 text-indigo-400 flex flex-col items-center justify-center border-4 border-indigo-500/20">
              <Loader2 size={36} className="animate-spin mb-1" />
              <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-300">
                {getTranscriptionEngine() === 'gemini' ? 'Gemini...' : 'Whisper...'}
              </span>
            </div>
          ) : (
            <button
              onClick={startRecording}
              className="relative h-32 w-32 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex flex-col items-center justify-center shadow-lg shadow-indigo-950/50 border-4 border-indigo-500/30 transition-all active:scale-95 cursor-pointer"
            >
              <Mic size={40} className="mb-1" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {selectedEngine === 'google-live' ? 'Ditar' : 'Gravar'}
              </span>
            </button>
          )}
        </div>

        {/* Status description */}
        <div className="text-center max-w-xs px-4">
          {isRecording ? (
            selectedEngine === 'google-live' ? (
              <p className="text-sm text-emerald-400 font-medium flex items-center justify-center gap-1.5">
                <Radio size={14} className="animate-pulse" /> Ditando ao vivo...
              </p>
            ) : (
              <p className="text-sm text-red-400 font-medium animate-pulse flex items-center justify-center gap-1.5">
                <Radio size={14} /> Gravando áudio...
              </p>
            )
          ) : isTranscribing ? (
            <p className="text-sm text-indigo-400 font-medium">Processando e transcrevendo com IA...</p>
          ) : (
            <p className="text-sm text-slate-400 leading-relaxed">
              Toque no botão e comece a falar. O áudio será enviado e preenchido no computador na hora.
            </p>
          )}
        </div>

        {/* Texto do ditado ao vivo (parcial) */}
        {isRecording && selectedEngine === 'google-live' && interimText && (
          <div className="w-full max-w-sm bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 text-left">
            <p className="text-xs text-emerald-200/90 leading-relaxed">{interimText}</p>
          </div>
        )}

        {/* Live status error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 max-w-xs text-xs text-red-400 flex items-start gap-2">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Last transcription review */}
        {transcriptionText && (
          <div className="w-full max-w-sm bg-slate-900/50 border border-slate-900 rounded-xl p-4 space-y-2 text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Última Transcrição</span>
            <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{transcriptionText}</p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
              <Check size={12} /> Enviado ao Prontuário
            </div>
          </div>
        )}
      </main>

      {/* Actions Footer */}
      <footer className="space-y-3 pt-4 border-t border-slate-900">
        {/* Seletor de motor de transcrição */}
        <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Voz:</label>
          <select
            value={selectedEngine}
            disabled={isRecording || isTranscribing}
            onChange={(e) => {
              const val = e.target.value as TranscriptionEngine;
              if (val === 'google-live' && !isLiveSpeechSupported()) {
                toast.error('Ditado ao vivo indisponível neste navegador (use o Chrome).');
                return;
              }
              setSelectedEngine(val);
              setTranscriptionEngine(val);
              const eng = TRANSCRIPTION_ENGINES.find((x) => x.id === val);
              toast.info(`Transcrição: ${eng?.label ?? val}`);
            }}
            className="flex-1 bg-transparent text-xs font-bold text-slate-200 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {TRANSCRIPTION_ENGINES.map((eng) => (
              <option key={eng.id} value={eng.id} className="bg-slate-900 text-slate-200">
                {eng.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => triggerAI('SOAP')}
            disabled={!connected || isRecording || isTranscribing}
            className="flex items-center justify-center gap-1.5 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-slate-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-bold border border-slate-800 transition-all cursor-pointer"
          >
            Gerar SOAP
          </button>
          <button
            onClick={() => triggerAI('JUSTIFICATIVA')}
            disabled={!connected || isRecording || isTranscribing}
            className="flex items-center justify-center gap-1.5 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-slate-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-bold border border-slate-800 transition-all cursor-pointer"
          >
            Gerar Justificativa
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-650 leading-relaxed">
          Arcanjo.Lab Mobile Link — {TRANSCRIPTION_ENGINES.find((e) => e.id === selectedEngine)?.label ?? 'Transcrição'}
        </p>
      </footer>

    </div>
  );
}

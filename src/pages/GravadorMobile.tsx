import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mic, Square, Loader2, Check, RefreshCw, AlertCircle, Smartphone, Wifi, Radio } from 'lucide-react';
import { SyncService, type SyncMessage } from '../services/syncService';
import { groq } from '../config/groq';
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
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const syncServiceRef = useRef<SyncService | null>(null);

  // Auto-connect to Room
  useEffect(() => {
    if (!roomId) {
      setError('Código de sala (room) inválido ou ausente na URL.');
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

    // Announce connection to Desktop
    const announceConnection = async () => {
      await sync.publish({ type: 'MOBILE_CONNECTED' });
    };

    // Retry connection announcement a few times to ensure desktop receives it
    announceConnection();
    const announceInterval = setInterval(announceConnection, 3000);

    return () => {
      unsubscribe();
      clearInterval(announceInterval);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [roomId]);

  // Handle Recording Timer
  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  }, [isRecording]);

  const formatTime = (timeInSeconds: number) => {
    const mins = Math.floor(timeInSeconds / 60);
    const secs = timeInSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    audioChunksRef.current = [];
    setError(null);
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
      setError('Erro ao acessar microfone. Verifique as permissões de áudio do seu celular.');
      toast.error('Sem permissão de microfone.');
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
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
    toast.info('Transcrevendo áudio com Whisper...');
    try {
      // Extract extension from mimeType (e.g. "audio/webm;codecs=opus" -> "webm", "audio/mp4" -> "mp4")
      let extension = 'webm';
      if (mimeType) {
        const cleanMime = mimeType.split(';')[0];
        extension = cleanMime.split('/')[1] || 'webm';
      }
      
      // Map common web container formats to Whisper supported extensions
      if (extension === 'x-m4a' || extension === 'aac') {
        extension = 'm4a';
      }

      console.log(`[MobileMic] Creating transcription file with extension: audio.${extension}`);
      const file = new File([audioBlob], `audio.${extension}`, { type: mimeType || 'audio/webm' });
      
      const transcription = await groq.audio.transcriptions.create({
        file: file,
        model: 'whisper-large-v3',
        language: 'pt',
      });

      const text = transcription.text;
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
    } catch (err: any) {
      console.error('[MobileMic] Transcription error:', err);
      const msg = err?.message || 'Erro de rede ou limite de cota atingido.';
      setError(`Erro na transcrição: ${msg}`);
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
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4 animate-bounce" />
        <h1 className="text-xl font-bold font-display text-white mb-2">Sala não Encontrada</h1>
        <p className="text-sm text-slate-400 max-w-sm leading-relaxed">{error}</p>
        <p className="text-xs text-slate-500 mt-6">Escaneie o QR Code exibido na tela do prontuário no seu computador.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 font-sans">
      
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
              <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-300">Whisper...</span>
            </div>
          ) : (
            <button
              onClick={startRecording}
              className="relative h-32 w-32 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex flex-col items-center justify-center shadow-lg shadow-indigo-950/50 border-4 border-indigo-500/30 transition-all active:scale-95 cursor-pointer"
            >
              <Mic size={40} className="mb-1" />
              <span className="text-xs font-bold uppercase tracking-wider">Gravar</span>
            </button>
          )}
        </div>

        {/* Status description */}
        <div className="text-center max-w-xs px-4">
          {isRecording ? (
            <p className="text-sm text-red-400 font-medium animate-pulse flex items-center justify-center gap-1.5">
              <Radio size={14} /> Gravando áudio...
            </p>
          ) : isTranscribing ? (
            <p className="text-sm text-indigo-400 font-medium">Processando e transcrevendo com IA...</p>
          ) : (
            <p className="text-sm text-slate-400 leading-relaxed">
              Toque no botão e comece a falar. O áudio será enviado e preenchido no computador na hora.
            </p>
          )}
        </div>

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
          Arcanjo.Lab Mobile Link — Whisper-large-v3 Transcription Expert.
        </p>
      </footer>

    </div>
  );
}

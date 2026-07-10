import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mic, Square, Loader2, Check, RefreshCw, AlertCircle, Smartphone, Wifi, Radio, Send, Trash2, Download, ShieldCheck, ClipboardPaste } from 'lucide-react';
import { SyncService, transcriptDedupeKey, type SyncMessage } from '../services/syncService';
import {
  getTranscriptionEngine, setTranscriptionEngine, TRANSCRIPTION_ENGINES,
  transcribeSegments, isTimeoutAbort, type TranscriptionEngine,
} from '../services/transcription';
import { SegmentedRecorder } from '../services/segmentedRecorder';
import { startLiveSpeech, isLiveSpeechSupported, type LiveSpeechController } from '../services/liveSpeech';
import { toast } from '../lib/toast';
import {
  saveRecording, updateRecording, deleteRecording, listRecordings,
  purgeOldRecordings, requestPersistentStorage, recordingToBlob,
  resetStaleTranscribing, type StoredRecording,
} from '../services/recordingVault';

// Limita qualquer promessa (ex.: escrita no IndexedDB) a `ms`: se não resolver a
// tempo, segue em frente. Evita que uma operação local pendurada trave o fluxo
// de transcrição — causa da UI presa girando que exigia recarregar a página.
function settleWithin<T>(p: Promise<T>, ms = 6000): Promise<T | undefined> {
  return Promise.race([
    Promise.resolve(p).catch(() => undefined),
    new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), ms)),
  ]);
}

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

  // Cofre local (IndexedDB): gravações salvas no próprio celular como rede de
  // segurança — sobrevivem a falha de transcrição, queda de rede ou recarga.
  const [savedRecordings, setSavedRecordings] = useState<StoredRecording[]>([]);
  const [resendingId, setResendingId] = useState<string | null>(null);
  // Se a última transcrição chegou de fato ao computador (espelhada).
  const [lastMirrored, setLastMirrored] = useState(true);
  const pacienteNomeRef = useRef('');
  // Trava síncrona de transcrição em andamento (single-flight). Ref, não estado,
  // para não depender do ciclo de render — impede reenvios sobrepostos.
  const transcribingRef = useRef(false);
  // Rede de segurança final: se algo travar além do esperado, destrava a UI.
  const watchdogRef = useRef<number | null>(null);
  // Token de posse da execução atual: quando o watchdog encerra uma execução,
  // ela deixa de ser "dona" da UI — seu término tardio não desfaz o estado novo.
  const runSeqRef = useRef(0);

  const segRecorderRef = useRef<SegmentedRecorder | null>(null);
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

  const refreshVault = async () => {
    try {
      setSavedRecordings(await listRecordings());
    } catch {
      // cofre indisponível (ex.: modo privativo) — segue sem a lista
    }
  };

  // Atualiza a gravação NA TELA na hora (estado em memória) e persiste no
  // IndexedDB em segundo plano, com limite de tempo. A UI nunca mais depende de
  // uma escrita local lenta/travada para refletir o que de fato aconteceu —
  // era isso que deixava o selo "Enviando..." eterno mesmo após o envio.
  const patchVault = (id: string, patch: Partial<Omit<StoredRecording, 'id'>>) => {
    setSavedRecordings((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    void settleWithin(updateRecording(id, patch), 10_000);
  };

  // Inicializa o cofre local: pede armazenamento persistente, reconcilia
  // gravações presas em "Enviando..." de sessões interrompidas, apaga as
  // antigas/já enviadas (mantém leve) e carrega o que ainda está guardado.
  useEffect(() => {
    (async () => {
      await requestPersistentStorage();
      await settleWithin(resetStaleTranscribing());
      await settleWithin(purgeOldRecordings());
      await refreshVault();
    })();
  }, []);

  // Mantém o nome do paciente atualizado para os handlers assíncronos do cofre.
  useEffect(() => {
    pacienteNomeRef.current = pacienteNome;
  }, [pacienteNome]);

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
      if (segRecorderRef.current) {
        segRecorderRef.current.abort();
        segRecorderRef.current = null;
      }
      if (watchdogRef.current) { clearTimeout(watchdogRef.current); watchdogRef.current = null; }
      releaseWakeLock();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // O navegador solta o wake lock quando o app vai para segundo plano; ao voltar
  // durante a gravação OU a transcrição, readquire para a tela seguir acesa
  // (evita que o upload seja abortado pelo bloqueio do celular).
  useEffect(() => {
    if (!isRecording && !isTranscribing) return;
    const onVisibility = () => {
      if (document.visibilityState === 'visible') acquireWakeLock();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, isTranscribing]);

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

    setError(null);

    // Secure context check for microphone access
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Gravação de áudio indisponível. A gravação requer uma conexão segura (HTTPS) ou localhost para acessar o microfone do celular.');
      toast.error('Microfone indisponível (requer HTTPS).');
      return;
    }

    try {
      // Gravador segmentado: áudio de voz (~20 kbps) em partes ≤5 min, nunca
      // estoura o limite do proxy. Consulta curta = 1 segmento (sem cortes).
      const recorder = new SegmentedRecorder();
      segRecorderRef.current = recorder;
      await recorder.start();

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
      segRecorderRef.current = null;
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

    if (segRecorderRef.current && isRecording) {
      const recorder = segRecorderRef.current;
      segRecorderRef.current = null;
      setIsRecording(false);
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

      // Mantém a tela acesa DURANTE a transcrição — se o celular bloquear/for
      // para segundo plano, o navegador aborta o upload (causa do "Request was aborted").
      const capturedSeconds = recordingTime;
      try {
        const { segments, mimeType } = await recorder.stop();

        // REDE DE SEGURANÇA: grava o áudio no cofre local ANTES de transcrever.
        // Se a transcrição falhar (rede/timeout/cota/tela bloqueada), o áudio
        // continua salvo no celular para reenviar ou baixar — nunca se perde.
        // A escrita é LIMITADA POR TEMPO: um IndexedDB travado (comum no iOS
        // depois de bloquear a tela) não pode mais segurar a transcrição.
        let saved: StoredRecording | null = null;
        const hasAudio = segments.some((s) => s && s.size > 0);
        if (hasAudio) {
          saved = (await settleWithin(saveRecording({
            patientName: pacienteNomeRef.current,
            mimeType,
            segments,
            durationSec: capturedSeconds,
          }), 8000)) ?? null;
          if (saved) {
            const rec = saved;
            setSavedRecordings((prev) => [rec, ...prev.filter((r) => r.id !== rec.id)]);
          } else {
            console.warn('[MobileMic] Cofre local indisponível — transcrevendo sem backup.');
          }
        }

        await transcreverAudio(segments, mimeType, saved?.id ?? null);
      } finally {
        await releaseWakeLock();
      }
    }
  };

  const transcreverAudio = async (segments: Blob[], mimeType: string, recordingId: string | null) => {
    // Single-flight: uma transcrição por vez. Trava síncrona (ref) — imune ao
    // atraso do render que antes deixava o 2º/3º reenvio escapar do guard.
    if (transcribingRef.current) {
      toast.info('Aguarde a transcrição atual terminar.');
      return;
    }
    transcribingRef.current = true;
    const runId = ++runSeqRef.current;
    const stillOwner = () => runSeqRef.current === runId;
    setIsTranscribing(true);

    // Watchdog: mesmo num travamento imprevisto, a UI se destrava sozinha depois
    // do teto — o usuário nunca mais precisa recarregar a página para reenviar.
    // Teto proporcional ao áudio: gravações longas (vários segmentos) ganham
    // mais tempo antes do corte, em vez de serem interrompidas no meio.
    const watchdogMs = 240_000 + Math.max(0, segments.length - 1) * 120_000;
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
    watchdogRef.current = window.setTimeout(() => {
      if (!stillOwner()) return;
      // Invalida a execução atual: se ela terminar depois, não mexe mais na UI.
      runSeqRef.current++;
      watchdogRef.current = null;
      transcribingRef.current = false;
      setIsTranscribing(false);
      setResendingId(null);
      if (recordingId) {
        patchVault(recordingId, { status: 'failed', error: 'Tempo esgotado no envio. Toque em Reenviar.' });
      }
      setError('A transcrição demorou demais e foi interrompida. O áudio segue salvo — toque em Reenviar.');
      toast.error('Transcrição interrompida por tempo. Reenvie.');
    }, watchdogMs);

    const engine = getTranscriptionEngine() === 'gemini' ? 'gemini' : 'whisper';
    toast.info(engine === 'gemini' ? 'Transcrevendo com Gemini...' : 'Transcrevendo áudio com Whisper...');
    try {
      // Selo "Enviando..." é otimista (memória primeiro, banco em segundo plano).
      if (recordingId) patchVault(recordingId, { status: 'transcribing', error: undefined });

      const text = await transcribeSegments(segments, mimeType, engine);
      if (text && text.trim()) {
        const clean = text.trim();
        if (stillOwner()) {
          setTranscriptionText(clean);
          setError(null);
          toast.success('Áudio transcrito com sucesso!');
        }

        // Envia ao desktop. dedupeKey torna o envio idempotente: se este mesmo
        // texto for reenviado (ex.: pelo botão Gerar SOAP), o desktop não duplica.
        let mirrored = false;
        if (syncServiceRef.current) {
          mirrored = await syncServiceRef.current.publish({
            type: 'TRANSCRIPTION_RESULT',
            payload: { text: clean, dedupeKey: transcriptDedupeKey(clean) },
          });
          if (stillOwner()) {
            setLastMirrored(mirrored);
            if (mirrored) {
              toast.success('Enviado para o prontuário!');
            } else {
              toast.error('Não chegou ao computador — use "Enviar p/ Queixa" ou Reenviar.');
            }
          }
        }
        // Só marca 'sent' (descartável pela limpeza) quando o texto chegou ao
        // computador. Se não espelhou, mantém 'failed' para permitir reenviar.
        if (recordingId) {
          patchVault(recordingId, mirrored
            ? { status: 'sent', transcript: clean, error: undefined }
            : { status: 'failed', transcript: clean, error: 'Transcrito, mas não chegou ao computador. Use "Enviar p/ Queixa" ou Reenviar.' });
        }
      } else {
        if (recordingId) patchVault(recordingId, { status: 'failed', error: 'Nenhuma fala detectada.' });
        if (stillOwner()) {
          setError('Não foi possível identificar fala no áudio.');
          toast.error('Nenhuma fala detectada.');
        }
      }
    } catch (err: unknown) {
      console.error('[MobileMic] Transcription error:', err);
      const errMsg = isTimeoutAbort(err)
        ? 'Tempo limite na transcrição. Tente novamente ou grave um trecho menor.'
        : (err instanceof Error ? err.message : 'Erro de rede ou limite de cota atingido.');

      if (recordingId) patchVault(recordingId, { status: 'failed', error: errMsg });

      if (stillOwner()) {
        setError(`Erro na transcrição: ${errMsg}`);
        toast.error(recordingId
          ? 'Falha ao transcrever — áudio salvo no celular para reenviar.'
          : 'Falha ao transcrever.');
      }

      // Notify desktop of failure
      if (syncServiceRef.current) {
        await syncServiceRef.current.publish({
          type: 'RECORDING_STATUS',
          payload: { isRecording: false, isTranscribing: false }
        });
      }
    } finally {
      // Só a execução "dona" destrava a UI — se o watchdog já encerrou esta
      // execução (e outro reenvio pode estar rodando), o término tardio é inócuo.
      if (stillOwner()) {
        if (watchdogRef.current) { clearTimeout(watchdogRef.current); watchdogRef.current = null; }
        transcribingRef.current = false;
        setIsTranscribing(false);
      }
    }
  };

  // Reenvia uma gravação guardada: retranscreve o áudio salvo e espelha de novo.
  const handleResend = async (rec: StoredRecording) => {
    // Guard síncrono via ref — não depende do estado (que podia estar defasado).
    if (isRecording || transcribingRef.current || resendingId) return;
    setResendingId(rec.id);
    setError(null);
    await acquireWakeLock();
    try {
      await transcreverAudio(rec.segments, rec.mimeType, rec.id);
    } finally {
      await releaseWakeLock();
      setResendingId(null);
    }
  };

  // Exclui uma gravação do cofre (após confirmação).
  const handleDelete = async (rec: StoredRecording) => {
    if (!window.confirm('Excluir esta gravação salva no celular? Esta ação não pode ser desfeita.')) return;
    try {
      await settleWithin(deleteRecording(rec.id), 8000);
      // Remove direto da lista em memória — reler o banco aqui poderia trazer de
      // volta um status antigo por cima do estado otimista da tela.
      setSavedRecordings((prev) => prev.filter((r) => r.id !== rec.id));
      toast.success('Gravação excluída.');
    } catch {
      toast.error('Não foi possível excluir.');
    }
  };

  // Baixa o áudio salvo para o aparelho — backup manual definitivo.
  const handleDownload = (rec: StoredRecording) => {
    try {
      const blob = recordingToBlob(rec);
      const url = URL.createObjectURL(blob);
      const ext = (rec.mimeType.split(';')[0].split('/')[1] || 'webm').replace('x-m4a', 'm4a');
      const stamp = new Date(rec.createdAt).toISOString().slice(0, 19).replace(/[:T]/g, '-');
      const nome = (rec.patientName || 'consulta').replace(/[^\p{L}\p{N}]+/gu, '_').slice(0, 40);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arcanjo_${nome}_${stamp}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      toast.success('Baixando áudio...');
    } catch {
      toast.error('Não foi possível baixar o áudio.');
    }
  };

  // Copia o texto transcrito no celular direto para o campo "Queixa / Contexto
  // Clínico" do computador. Idempotente: se este mesmo texto já chegou lá, o
  // desktop ignora (dedupeKey) — não duplica. É o resgate manual de um clique
  // para quando o espelhamento automático falhou.
  const enviarParaQueixa = async () => {
    if (!syncServiceRef.current) return;
    const text = (
      transcriptionText.trim() ||
      savedRecordings.find((r) => r.transcript && r.transcript.trim())?.transcript ||
      ''
    ).trim();
    if (!text) {
      toast.error('Nenhum texto transcrito para enviar ainda. Grave ou reenvie primeiro.');
      return;
    }
    toast.info('Enviando texto para a Queixa...');
    const ok = await syncServiceRef.current.publish({
      type: 'TRANSCRIPTION_RESULT',
      payload: { text, dedupeKey: transcriptDedupeKey(text) },
    });
    if (ok) {
      setLastMirrored(true);
      toast.success('Texto enviado para a Queixa no computador!');
    } else {
      toast.error('Falha ao comunicar com o computador. Verifique a conexão e tente de novo.');
    }
  };

  const triggerAI = async (action: 'SOAP' | 'JUSTIFICATIVA') => {
    if (!syncServiceRef.current) return;
    toast.info(`Solicitando geração de ${action} no computador...`);

    // Garantia extra de entrega: reenvia o texto da ÚLTIMA TRANSCRIÇÃO junto do
    // pedido de IA. Se o espelhamento anterior falhou, o texto chega agora; se já
    // chegou, o dedupeKey faz o desktop ignorar — sem duplicar no prontuário.
    const text = transcriptionText.trim();
    if (text) {
      await syncServiceRef.current.publish({
        type: 'TRANSCRIPTION_RESULT',
        payload: { text, dedupeKey: transcriptDedupeKey(text) },
      });
    }

    const success = await syncServiceRef.current.publish({
      type: 'TRIGGER_AI',
      payload: { action }
    });
    if (success) {
      toast.success(text ? 'Texto reenviado e geração solicitada!' : 'Solicitado!');
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
            {lastMirrored ? (
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                <Check size={12} /> Enviado ao Prontuário
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold">
                <AlertCircle size={12} /> Não chegou ao computador — toque em "Enviar p/ Queixa"
              </div>
            )}
          </div>
        )}

        {/* Cofre local de gravações — rede de segurança contra perda de áudio */}
        {savedRecordings.length > 0 && (
          <div className="w-full max-w-sm bg-slate-900/40 border border-slate-800 rounded-xl p-3 space-y-2 text-left">
            <div className="flex items-center gap-1.5 pb-1">
              <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Gravações salvas no celular
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed pb-1">
              Guardadas neste aparelho como backup. Apagam sozinhas depois de enviadas. Se algo falhar, reenvie ou baixe.
            </p>
            {savedRecordings.map((rec) => {
              const busy = resendingId === rec.id;
              const sizeMb = (rec.sizeBytes / (1024 * 1024)).toFixed(1);
              const when = new Date(rec.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              const statusMeta: Record<string, { label: string; cls: string }> = {
                pending: { label: 'Guardada', cls: 'bg-slate-700/40 text-slate-300' },
                transcribing: { label: 'Enviando...', cls: 'bg-indigo-500/15 text-indigo-300' },
                sent: { label: 'Enviada', cls: 'bg-emerald-500/15 text-emerald-300' },
                failed: { label: 'Falhou — reenvie', cls: 'bg-red-500/15 text-red-300' },
              };
              const meta = statusMeta[rec.status] ?? statusMeta.pending;
              return (
                <div key={rec.id} className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">
                        {rec.patientName || 'Consulta sem paciente'}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {when} · {formatTime(rec.durationSec)} · {sizeMb} MB
                      </p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${meta.cls}`}>
                      {busy ? 'Enviando...' : meta.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleResend(rec)}
                      disabled={busy || isRecording || isTranscribing || !!resendingId}
                      className="flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold bg-indigo-600/90 hover:bg-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      {busy ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                      Reenviar
                    </button>
                    <button
                      onClick={() => handleDownload(rec)}
                      disabled={busy}
                      className="flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <Download size={12} /> Baixar
                    </button>
                    <button
                      onClick={() => handleDelete(rec)}
                      disabled={busy}
                      className="flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-red-900/60 text-red-300 disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} /> Excluir
                    </button>
                  </div>
                  {rec.status === 'failed' && rec.error && (
                    <p className="text-[9px] text-red-400/80 leading-snug">{rec.error}</p>
                  )}
                </div>
              );
            })}
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

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => triggerAI('SOAP')}
            disabled={!connected || isRecording || isTranscribing}
            className="flex items-center justify-center gap-1.5 py-3 px-2 bg-slate-900 hover:bg-slate-800 text-slate-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-[11px] font-bold border border-slate-800 transition-all cursor-pointer"
          >
            Gerar SOAP
          </button>
          <button
            onClick={enviarParaQueixa}
            disabled={!connected || isRecording || isTranscribing}
            className="flex flex-col items-center justify-center gap-0.5 py-2 px-2 bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-[11px] font-bold border border-indigo-500/40 transition-all cursor-pointer"
          >
            <ClipboardPaste size={14} />
            Enviar p/ Queixa
          </button>
          <button
            onClick={() => triggerAI('JUSTIFICATIVA')}
            disabled={!connected || isRecording || isTranscribing}
            className="flex items-center justify-center gap-1.5 py-3 px-2 bg-slate-900 hover:bg-slate-800 text-slate-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-[11px] font-bold border border-slate-800 transition-all cursor-pointer"
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

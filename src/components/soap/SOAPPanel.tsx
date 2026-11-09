import { useState, useRef, useEffect, useMemo } from 'react';
import { useElapsedTimer } from '../../hooks/useElapsedTimer';
import { useAppStore } from '../../store/useAppStore';
import { callAI, getLastUsedModel, getDefaultModelId, AI_MODELS, cancelAIRequest } from '../../config/gemini';
import {
  getTranscriptionEngine, setTranscriptionEngine, TRANSCRIPTION_ENGINES,
  transcribeSegments, isTimeoutAbort, type TranscriptionEngine,
} from '../../services/transcription';
import { SegmentedRecorder } from '../../services/segmentedRecorder';
import { startLiveSpeech, isLiveSpeechSupported, type LiveSpeechController } from '../../services/liveSpeech';
import { getErrorMessage } from '../../lib/errors';
import { toast } from '../../lib/toast';
import { Loader2, Wand2, ClipboardList, Check, Mic, Square, Smartphone, Radio, ShieldAlert, Activity, HelpCircle, Settings2, ChevronDown } from 'lucide-react';
import { cleanSoapMarkdown, juntarAlertasSOAP, separarAlertasSOAP } from '../../lib/formatters';
import { buildMensagemSOAP, buildPacienteContexto, nomesProcedimentos, type ModalidadeConsulta } from '../../lib/aiContext';
import { SYSTEM_PROMPT_JUSTIFICATIVA, SYSTEM_PROMPT_SOAP } from './prompts';
import DuvidaClinicaPanel from './DuvidaClinicaPanel';

type AbaProntuario = 'SOAP' | 'DUVIDA';
const ABA_KEY = 'arcanjo-prontuario-aba';
const AJUSTES_KEY = 'arcanjo-prontuario-ajustes';
const ABAS_PRONTUARIO: { id: AbaProntuario; nome: string; Icon: typeof ClipboardList }[] = [
  { id: 'SOAP', nome: 'Nota SOAP', Icon: ClipboardList },
  { id: 'DUVIDA', nome: 'Dúvida clínica', Icon: HelpCircle },
];

const lerLocal = (chave: string): string | null => {
  try {
    return localStorage.getItem(chave);
  } catch {
    return null; // localStorage indisponível
  }
};
const gravarLocal = (chave: string, valor: string) => {
  try {
    localStorage.setItem(chave, valor);
  } catch {
    // sem localStorage (aba anônima, bloqueio): só não lembra a escolha
  }
};
const lerAba = (): AbaProntuario => (lerLocal(ABA_KEY) === 'DUVIDA' ? 'DUVIDA' : 'SOAP');

/** Nome do motor de voz sem os emojis do rótulo. */
const nomeMotor = (label: string) => label.replace(/\s*\p{Extended_Pictographic}️?/gu, '').trim();

const ESCALAS = [
  { nome: 'Bristol (Fezes)', keywords: ['bristol', 'cíbalos'] },
  { nome: 'Roma IV (Gastroenterologia)', keywords: ['roma iv', 'roma 4', 'constipação funcional', 'dispepsia funcional', 'síndrome do intestino irritável'] },
  { nome: 'Los Angeles (Esofagite)', keywords: ['los angeles', 'grau a', 'grau b', 'grau c', 'grau d'] },
  { nome: 'Sydney/OLGA (Gastrite)', keywords: ['sydney', 'olga', 'olgis'] },
  { nome: 'Forrest (HDA)', keywords: ['forrest'] },
  { nome: 'FIB-4 (Fibrose Hepática)', keywords: ['fib-4', 'fib4'] },
  { nome: 'Katz (Funcionalidade)', keywords: ['katz'] },
  { nome: 'Lawton (Funcionalidade)', keywords: ['lawton'] },
  { nome: 'FRAIL / Fried (Fragilidade)', keywords: ['frail', 'fried', 'fragilidade'] },
];

const DROGAS_BEERS = ['amitriptilina', 'clonazepam', 'diazepam', 'alprazolam', 'bromazepam', 'zolpidem', 'glimepirida', 'metoclopramida'];
const AINES_IDOSO = ['diclofenaco', 'nimesulida', 'ibuprofeno'];

// Análise clínica da nota SOAP: alerta Beers/STOPP, escalas citadas e CIDs.
function analisarSOAP(texto: string) {
  if (!texto) return { alertBeers: null as string | null, escalas: [] as string[], cids: [] as string[] };
  const textLower = texto.toLowerCase();
  const temBeers =
    textLower.includes('beers') ||
    textLower.includes('stopp') ||
    DROGAS_BEERS.some((d) => textLower.includes(d)) ||
    (textLower.includes('idoso') && AINES_IDOSO.some((d) => textLower.includes(d)));
  const alertBeers = temBeers
    ? 'Possível risco terapêutico/medicamento inapropriado detectado (Critérios de Beers 2023 / STOPP-START). Avalie desprescrição ou ajuste de dose.'
    : null;
  const escalas = ESCALAS.filter((e) => e.keywords.some((k) => textLower.includes(k))).map((e) => e.nome);
  // B12 não é categoria da CID-10: na nota, é a vitamina.
  const NAO_CID = new Set(['B12']);
  const cids = Array.from(new Set(texto.match(/\b[A-Z]\d{2}(?:\.\d)?\b/g) || [])).filter((c) => !NAO_CID.has(c));
  return { alertBeers, escalas, cids };
}

export default function SOAPPanel() {
  const [isLoadingJust, setIsLoadingJust] = useState(false);
  const [isLoadingSoap, setIsLoadingSoap] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aba, setAba] = useState<AbaProntuario>(lerAba);
  const [ajustesAbertos, setAjustesAbertos] = useState(() => lerLocal(AJUSTES_KEY) === '1');
  const [copied, setCopied] = useState(false);
  const elapsedJust = useElapsedTimer(isLoadingJust);
  const elapsedSoap = useElapsedTimer(isLoadingSoap);

  const trocarAba = (nova: AbaProntuario) => {
    setAba(nova);
    gravarLocal(ABA_KEY, nova);
  };
  const alternarAjustes = () => {
    setAjustesAbertos((v) => {
      gravarLocal(AJUSTES_KEY, v ? '0' : '1');
      return !v;
    });
  };

  // Seletores por campo — o painel é grande e reage a texto digitado (queixa,
  // SOAP). Assinando o store inteiro, cada tecla re-renderizava o painel
  // inteiro por causa de campos que ele nem usa naquele momento.
  const pacienteNome = useAppStore((s) => s.pacienteNome);
  const pacienteIdade = useAppStore((s) => s.pacienteIdade);
  const genero = useAppStore((s) => s.genero);
  const examesSelecionados = useAppStore((s) => s.examesSelecionados);
  const procedimentosSelecionados = useAppStore((s) => s.procedimentosSelecionados);
  const procedimentosPersonalizados = useAppStore((s) => s.procedimentosPersonalizados);
  const soap = useAppStore((s) => s.soap);
  const queixa = useAppStore((s) => s.queixa);
  const tipoGuia = useAppStore((s) => s.tipoGuia);
  const convenio = useAppStore((s) => s.convenio);
  const modalidadeConsulta = useAppStore((s) => s.modalidadeConsulta);
  const iaModel = useAppStore((s) => s.iaModel);
  const syncStatus = useAppStore((s) => s.syncStatus);
  // Ações: referência estável, nunca disparam re-render.
  const setSoap = useAppStore((s) => s.setSoap);
  const setQueixa = useAppStore((s) => s.setQueixa);
  const setJustificativa = useAppStore((s) => s.setJustificativa);
  const setIaModel = useAppStore((s) => s.setIaModel);
  const adicionarConsultaAoHistorico = useAppStore((s) => s.adicionarConsultaAoHistorico);
  const setPaciente = useAppStore((s) => s.setPaciente);
  const setIsPairingModalOpen = useAppStore((s) => s.setIsPairingModalOpen);

  // Uma vez por mudança da nota, não a cada render.
  const partesSoap = useMemo(() => separarAlertasSOAP(soap), [soap]);
  const analise = useMemo(() => analisarSOAP(soap), [soap]);
  const alertasMedico = useMemo(
    () => (partesSoap.alertas || '').split(/\r?\n/).map((l) => l.replace(/^-\s*/, '').trim()).filter(Boolean),
    [partesSoap.alertas]
  );
  const temAuditoria = !!soap.trim() && (!!analise.alertBeers || analise.escalas.length > 0 || analise.cids.length > 0);

  const handleCopy = () => {
    // Só a nota: os alertas são para o médico e não vão para o prontuário.
    navigator.clipboard.writeText(partesSoap.nota.trim());
    setCopied(true);
    toast.success('Nota SOAP copiada!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Estados para Gravação de Áudio
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Seletor de modelo de IA — armazena o model ID diretamente
  const [selectedModelId, setSelectedModelId] = useState<string>(() => getDefaultModelId());

  // Seletor de motor de transcrição (Whisper / Ditado ao vivo Google / Gemini)
  const [selectedEngine, setSelectedEngine] = useState<TranscriptionEngine>(() => getTranscriptionEngine());
  const [interimText, setInterimText] = useState('');
  const liveControllerRef = useRef<LiveSpeechController | null>(null);

  const handleProcessMobileTranscription = async (text: string) => {
    if (!text || !text.trim()) return;
    setQueixa(queixa.trim() ? `${queixa}\n${text}` : text);
    if (pacienteNome.trim()) {
      adicionarConsultaAoHistorico(pacienteNome.trim(), text);
    }
  };

  const segRecorderRef = useRef<SegmentedRecorder | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      // Encerra o ditado ao vivo caso o painel seja desmontado gravando.
      if (liveControllerRef.current) {
        liveControllerRef.current.stop();
        liveControllerRef.current = null;
      }
      if (segRecorderRef.current) {
        segRecorderRef.current.abort();
        segRecorderRef.current = null;
      }
    };
  }, []);

  const formatTime = (timeInSeconds: number) => {
    const mins = Math.floor(timeInSeconds / 60);
    const secs = timeInSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setRecordingTime(0);
    timerIntervalRef.current = window.setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const clearTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  // Reset idempotente do estado do ditado — chamado no fim/erro da sessão.
  const finalizeLive = () => {
    liveControllerRef.current = null;
    setInterimText('');
    setIsRecording(false);
    clearTimer();
  };

  // Ditado ao vivo (Web Speech / Google) — texto em tempo real, sem gravar blob.
  const startLiveDictation = () => {
    if (!isLiveSpeechSupported()) {
      toast.error('Ditado ao vivo indisponível neste navegador. Use Chrome/Edge ou troque o motor para Whisper.');
      return;
    }
    try {
      liveControllerRef.current = startLiveSpeech({
        lang: 'pt-BR',
        onPartial: (t) => setInterimText(t),
        onFinal: (t) => {
          setInterimText('');
          // Lê a queixa mais recente do store para não sobrescrever chunks anteriores.
          const prev = useAppStore.getState().queixa;
          setQueixa(prev.trim() ? `${prev} ${t}` : t);
        },
        onError: (m) => { setError(m); toast.error(m); },
        // Fim da sessão (stop, erro fatal ou fim natural) reseta a UI —
        // impede que o painel fique preso em "gravando".
        onEnd: () => finalizeLive(),
      });
      setIsRecording(true);
      startTimer();
      toast.success('Ditado ao vivo iniciado — pode falar.');
    } catch (err) {
      finalizeLive();
      toast.error(getErrorMessage(err, 'Falha ao iniciar o ditado ao vivo.'));
    }
  };

  const startRecording = async () => {
    if (selectedEngine === 'google-live') {
      startLiveDictation();
      return;
    }

    try {
      // Gravador segmentado (voz ~20 kbps, partes ≤5 min): nunca estoura o
      // limite do proxy. Consulta curta = 1 segmento (sem cortes).
      const recorder = new SegmentedRecorder();
      segRecorderRef.current = recorder;
      await recorder.start();

      setIsRecording(true);
      startTimer();
      toast.success('Gravação iniciada...');
    } catch (err) {
      console.error(err);
      segRecorderRef.current = null;
      toast.error('Não foi possível acessar o microfone. Verifique as permissões.');
    }
  };

  const stopRecording = async () => {
    // Ditado ao vivo: encerra o reconhecimento (onEnd faz o reset da UI).
    if (liveControllerRef.current) {
      liveControllerRef.current.stop();
      finalizeLive();
      toast.success('Ditado finalizado.');
      return;
    }
    if (segRecorderRef.current && isRecording) {
      const recorder = segRecorderRef.current;
      segRecorderRef.current = null;
      setIsRecording(false);
      clearTimer();
      // Usa o motor salvo no seletor; 'google-live' não chega aqui (é tempo real).
      const saved = getTranscriptionEngine();
      const engine = saved === 'google-live' ? 'whisper' : saved;
      const { segments, mimeType } = await recorder.stop();
      await transcreverAudio(segments, mimeType, engine);
    }
  };

  const transcreverAudio = async (segments: Blob[], mimeType: string, engine: Exclude<TranscriptionEngine, 'google-live'>) => {
    setIsTranscribing(true);
    toast.info(
      engine === 'gemini' ? 'Transcrevendo com Gemini...'
      : engine === 'gpt4o' ? 'Transcrevendo com GPT-4o...'
      : 'Transcrevendo com Whisper...'
    );
    try {
      const text = await transcribeSegments(segments, mimeType, engine);
      if (text && text.trim()) {
        toast.success('Áudio transcrito com sucesso!');
        await handleProcessMobileTranscription(text);
      } else {
        toast.error('Não foi possível detectar fala no áudio.');
      }
    } catch (err: unknown) {
      console.error(err);
      if (isTimeoutAbort(err)) {
        toast.error('Tempo limite na transcrição. Tente novamente ou grave um trecho menor.');
      } else {
        toast.error(getErrorMessage(err, 'Erro ao transcrever o áudio.'));
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  const buildContext = () => {
    const isLab = tipoGuia === 'LABORATORIO';
    const examesStr = isLab
      ? `Exames laboratoriais: ${examesSelecionados.join(', ') || 'nenhum'}`
      : `Procedimentos: ${nomesProcedimentos(procedimentosSelecionados, procedimentosPersonalizados).join(', ') || 'nenhum'}`;
    return `${buildPacienteContexto({ pacienteNome, pacienteIdade, genero })}
${examesStr}
Queixa clínica: "${queixa}"`;
  };

  const gerarJustificativa = async () => {
    if (!queixa.trim()) { setError('Informe a queixa clínica.'); return; }
    setIsLoadingJust(true);
    setError(null);
    try {
      const content = await callAI(
        {
          prompt: buildContext(),
          systemInstruction: SYSTEM_PROMPT_JUSTIFICATIVA,
          // Streaming: preenche o campo progressivamente conforme o texto chega
          onDelta: (textSoFar) => setJustificativa(textSoFar.toUpperCase()),
        },
        selectedModelId
      );
      setJustificativa(content.toUpperCase());
      setIaModel(getLastUsedModel());
      toast.success('Justificativa clínica gerada');
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Erro ao gerar justificativa.');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoadingJust(false);
    }
  };

  const gerarSOAP = async () => {
    if (!queixa.trim()) { setError('Informe a queixa clínica.'); return; }
    setIsLoadingSoap(true);
    setError(null);
    trocarAba('SOAP'); // abre a aba antes para o texto aparecer progressivamente
    try {
      const content = await callAI(
        {
          prompt: buildMensagemSOAP(
            { pacienteIdade, genero, convenio, tipoGuia, examesSelecionados, procedimentosSelecionados, procedimentosPersonalizados, queixa },
            modalidadeConsulta
          ),
          systemInstruction: SYSTEM_PROMPT_SOAP,
          // Streaming: a nota aparece na tela conforme o texto chega
          onDelta: (textSoFar) => setSoap(cleanSoapMarkdown(textSoFar)),
        },
        selectedModelId
      );
      setSoap(cleanSoapMarkdown(content));
      setIaModel(getLastUsedModel());
      toast.success('Nota SOAP gerada');
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Erro ao gerar SOAP.');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoadingSoap(false);
    }
  };

  const modeloAtual = AI_MODELS.find((m) => m.id === selectedModelId);
  const motorAtual = TRANSCRIPTION_ENGINES.find((e) => e.id === selectedEngine);
  const ocupado = isRecording || isTranscribing;
  const btn = 'flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer disabled:cursor-not-allowed';

  return (
    <div className="space-y-5">
      {/* Consulta: queixa + captura + geração */}
      <section className="rounded-lg border border-neutral-border bg-white overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-neutral-border bg-slate-50/60">
          <h2 className="text-sm font-bold text-neutral-text">Queixa / contexto clínico</h2>
          <div className="inline-flex rounded-md border border-neutral-border bg-white p-0.5" role="group" aria-label="Modalidade da consulta">
            {([
              ['PRESENCIAL', 'Presencial'],
              ['TELEMEDICINA', 'Telemedicina'],
            ] as [ModalidadeConsulta, string][]).map(([id, nome]) => (
              <button
                key={id}
                type="button"
                aria-pressed={modalidadeConsulta === id}
                onClick={() => setPaciente({ modalidadeConsulta: id })}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  modalidadeConsulta === id ? 'bg-blue-50 text-blue-700' : 'text-neutral-text-muted hover:text-neutral-text'
                }`}
              >
                {nome}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-3">
          <textarea
            value={queixa}
            onChange={(e) => setQueixa(e.target.value)}
            placeholder="Ex: Paciente 78a, astenia há 2 meses, perda de 4kg, HAS e DM2."
            className="w-full rounded-lg border border-neutral-border text-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-y placeholder:text-gray-400 leading-relaxed h-24 lg:h-28"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}

          {/* Ações: captura à esquerda, geração à direita */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
            {isRecording ? (
              <button type="button" onClick={stopRecording} title="Parar gravação de áudio" className={`${btn} bg-red-600 hover:bg-red-700 text-white animate-pulse`}>
                <Square size={12} fill="white" />
                {selectedEngine === 'google-live' ? 'Parar ditado' : 'Parar'} {formatTime(recordingTime)}
              </button>
            ) : isTranscribing ? (
              <button type="button" disabled className={`${btn} bg-accent-emerald/70 text-white`}>
                <Loader2 size={13} className="animate-spin" />
                Transcrevendo…
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                disabled={isLoadingJust || isLoadingSoap}
                title={selectedEngine === 'google-live' ? 'Ditar ao vivo pelo microfone do computador' : 'Gravar consulta pelo microfone do computador'}
                className={`${btn} bg-accent-emerald text-white hover:bg-accent-emerald/90 disabled:opacity-40`}
              >
                <Mic size={13} />
                {selectedEngine === 'google-live' ? 'Ditar' : 'Gravar'}
              </button>
            )}

            {syncStatus === 'recording' ? (
              <span className={`${btn} bg-red-500 text-white animate-pulse cursor-default`}>
                <Radio size={13} />
                Celular gravando
              </span>
            ) : syncStatus === 'transcribing' ? (
              <span className={`${btn} bg-blue-500 text-white cursor-default`}>
                <Loader2 size={13} className="animate-spin" />
                Celular transcrevendo
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setIsPairingModalOpen(true)}
                title="Espelhar e gravar áudio pelo celular"
                className={`${btn} border ${
                  syncStatus === 'connected'
                    ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                    : 'border-neutral-border bg-white text-neutral-text hover:bg-slate-50'
                }`}
              >
                <Smartphone size={13} />
                {syncStatus === 'connected' ? 'Celular conectado' : 'Celular'}
              </button>
            )}

            <span className="hidden sm:block flex-1" />

            <button
              type="button"
              onClick={isLoadingJust ? cancelAIRequest : gerarJustificativa}
              disabled={!isLoadingJust && (!queixa.trim() || ocupado)}
              title={isLoadingJust ? 'Parar a geração' : 'Gerar indicação clínica para a guia'}
              className={`${btn} border disabled:opacity-40 ${
                isLoadingJust ? 'border-red-500 bg-red-500 text-white hover:bg-red-600' : 'border-neutral-border bg-white text-neutral-text hover:bg-slate-50'
              }`}
            >
              {isLoadingJust ? <Square size={12} fill="white" /> : <Wand2 size={13} />}
              {isLoadingJust ? `Parar${elapsedJust ? ` ${elapsedJust}s` : ''}` : 'Indicação'}
            </button>
            <button
              type="button"
              onClick={isLoadingSoap ? cancelAIRequest : gerarSOAP}
              disabled={!isLoadingSoap && (!queixa.trim() || ocupado)}
              title={isLoadingSoap ? 'Parar a geração' : 'Gerar nota SOAP para o prontuário'}
              className={`${btn} text-white disabled:opacity-40 ${isLoadingSoap ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isLoadingSoap ? <Square size={12} fill="white" /> : <ClipboardList size={13} />}
              {isLoadingSoap ? `Parar${elapsedSoap ? ` ${elapsedSoap}s` : ''}` : 'Nota SOAP'}
            </button>
          </div>

          <button
            type="button"
            onClick={alternarAjustes}
            aria-expanded={ajustesAbertos}
            title="Modelo de IA e motor de voz"
            className="flex items-center gap-1.5 text-[11px] text-neutral-text-muted hover:text-neutral-text transition-colors cursor-pointer"
          >
            <Settings2 size={12} />
            {modeloAtual?.badge ?? selectedModelId} · {motorAtual ? nomeMotor(motorAtual.label) : selectedEngine}
            <ChevronDown size={12} className={`transition-transform ${ajustesAbertos ? 'rotate-180' : ''}`} />
          </button>

          {ajustesAbertos && (
            <div className="grid gap-2 sm:grid-cols-2 rounded-lg border border-neutral-border bg-slate-50/60 p-2.5">
              <label className="flex items-center gap-2 text-[11px] font-semibold text-neutral-text-muted">
                IA
                <select
                  value={selectedModelId}
                  title={modeloAtual?.note}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedModelId(val);
                    gravarLocal('arcanjo_selected_model', val);
                    const m = AI_MODELS.find((m) => m.id === val);
                    toast.info(`Modelo: ${m?.badge ?? val}`);
                  }}
                  className="min-w-0 flex-1 rounded-md border border-neutral-border bg-white px-2 py-1 text-xs font-semibold text-neutral-text outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
                >
                  {AI_MODELS.map((m) => (
                    <option key={m.id} value={m.id} title={m.note}>
                      {m.badge}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-[11px] font-semibold text-neutral-text-muted">
                Voz
                <select
                  value={selectedEngine}
                  title={motorAtual?.note}
                  disabled={ocupado}
                  onChange={(e) => {
                    const val = e.target.value as TranscriptionEngine;
                    if (val === 'google-live' && !isLiveSpeechSupported()) {
                      toast.error('Ditado ao vivo indisponível neste navegador (use Chrome/Edge).');
                      return;
                    }
                    setSelectedEngine(val);
                    setTranscriptionEngine(val);
                    const eng = TRANSCRIPTION_ENGINES.find((x) => x.id === val);
                    toast.info(`Transcrição: ${eng ? nomeMotor(eng.label) : val}`);
                  }}
                  className="min-w-0 flex-1 rounded-md border border-neutral-border bg-white px-2 py-1 text-xs font-semibold text-neutral-text outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {TRANSCRIPTION_ENGINES.map((eng) => (
                    <option key={eng.id} value={eng.id} title={eng.note}>
                      {nomeMotor(eng.label)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {/* Texto do ditado ao vivo (parcial) — feedback em tempo real */}
          {isRecording && selectedEngine === 'google-live' && (
            <div className="flex items-start gap-2 rounded-lg border border-accent-emerald/30 bg-accent-emerald/5 px-3 py-2">
              <Radio size={13} className="mt-0.5 shrink-0 animate-pulse text-accent-emerald" />
              <p className="text-xs leading-relaxed text-gray-600">
                <span className="font-semibold text-accent-emerald">Ouvindo… </span>
                {interimText || 'fale que o texto aparece no campo de queixa em tempo real.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Saídas: uma aba por vez */}
      <section className="rounded-lg border border-neutral-border bg-white p-4">
        <div className="mb-4 flex items-center gap-3">
          <div role="tablist" aria-label="Nota e dúvidas" className="flex flex-1 gap-1 overflow-x-auto rounded-lg border border-neutral-border bg-slate-50 p-1 scrollbar-none">
            {ABAS_PRONTUARIO.map(({ id, nome, Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={aba === id}
                onClick={() => trocarAba(id)}
                className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  aba === id ? 'bg-white text-blue-700 shadow-sm' : 'text-neutral-text-muted hover:text-neutral-text'
                }`}
              >
                <Icon size={13} />
                {nome}
                {id === 'SOAP' && soap.trim() && <span className="h-1.5 w-1.5 rounded-full bg-green-500" />}
              </button>
            ))}
          </div>
          {aba === 'SOAP' && (
            <button
              type="button"
              onClick={handleCopy}
              disabled={!partesSoap.nota.trim()}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${
                copied ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {copied ? <Check size={13} /> : <ClipboardList size={13} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          )}
        </div>

        {aba === 'SOAP' && (
          <div className="space-y-3">
            {temAuditoria && (
              <div className="space-y-2">
                {analise.alertBeers && (
                  <p className="flex items-start gap-2 rounded-lg border border-red-200/70 bg-red-50 px-3 py-2 text-[11px] leading-relaxed text-red-800">
                    <ShieldAlert size={13} className="mt-px shrink-0 text-red-600" />
                    <span>
                      <strong>Beers / STOPP:</strong> {analise.alertBeers}
                    </span>
                  </p>
                )}
                {(analise.escalas.length > 0 || analise.cids.length > 0) && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {analise.escalas.map((e) => (
                      <span key={e} className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                        <Activity size={10} />
                        {e}
                      </span>
                    ))}
                    {analise.cids.map((c) => (
                      <span key={c} className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                        CID {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {alertasMedico.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
                <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  <ShieldAlert size={12} className="text-amber-600" />
                  Alertas para o médico · não vão para o prontuário
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-amber-900">
                  {alertasMedico.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </div>
            )}

            <textarea
              value={partesSoap.nota}
              onChange={(e) => setSoap(juntarAlertasSOAP(e.target.value, partesSoap.alertas))}
              placeholder="A nota S-O-A-P aparece aqui ao gerar, ou digite direto."
              className="w-full rounded-lg border border-neutral-border text-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-y leading-relaxed text-gray-800 placeholder:text-gray-400 h-72 lg:h-[28rem]"
            />
            <p className="flex justify-between gap-2 text-[11px] text-neutral-text-muted">
              <span>Não vai para a guia de exames.</span>
              {soap.trim() && iaModel && <span className="font-mono">{iaModel}</span>}
            </p>
          </div>
        )}

        {/* Fica montada escondida: trocar de aba não apaga a resposta. */}
        <div hidden={aba !== 'DUVIDA'}>
          <DuvidaClinicaPanel modelId={selectedModelId} />
        </div>
      </section>
    </div>
  );
}

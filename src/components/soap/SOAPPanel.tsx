import { useState, useRef, useEffect } from 'react';
import { useElapsedTimer } from '../../hooks/useElapsedTimer';
import { useAppStore } from '../../store/useAppStore';
import { callGemini, getLastUsedModel } from '../../config/gemini';
import { groq } from '../../config/groq';
import { getErrorMessage } from '../../lib/errors';
import { toast } from '../../lib/toast';
import { Loader2, Wand2, ClipboardList, FileText, ChevronDown, ChevronUp, X, Check, Save, Trash2, Calendar, Mic, Square } from 'lucide-react';
import type { ConsultaGravada } from '../../types';

const SYSTEM_PROMPT_JUSTIFICATIVA = `Você é um médico geriatra e gastroenterologista sênior, com expertise em auditoria médica de convênios.
Gere UMA ÚNICA FRASE curta e objetiva (máximo 2-3 linhas) de "Indicação Clínica / Justificativa" para o campo obrigatório da guia de exame do convênio.

FORMATO OBRIGATÓRIO:
"INVESTIGAÇÃO DE [queixa principal] EM PACIENTE [idade/perfil clínico] COM [comorbidades relevantes]. SOLICITO [exames/procedimento] PARA [objetivo diagnóstico]. CID-10: [código mais adequado]."

REGRAS:
- Tudo em MAIÚSCULAS
- Inclua SEMPRE o CID-10 mais adequado ao final
- Se houver comorbidades (HAS, DM2, dislipidemia), mencione-as APENAS se estiverem citadas explicitamente no caso do paciente.
- REGRA ABSOLUTA DE SEGURANÇA: NÃO invente comorbidades, sintomas secundários ou histórico médico fictício na indicação clínica. Baseie-se unicamente nas informações de entrada fornecidas.
- Para idosos, mencione "PACIENTE IDOSO" ou "PACIENTE GERIÁTRICO"
- Seja profissional e objetivo — esta justificativa será auditada pelo convênio
- NÃO use formato SOAP, NÃO use bullet points
- Apenas uma frase clínica direta em português`;

const SYSTEM_PROMPT_SOAP = `Você é um médico geriatra e gastroenterologista sênior.
Gere uma nota clínica estruturada no formato SOAP em português, concisa e profissional.

Formato:
S (Subjetivo): queixa e história do paciente, incluindo tempo de evolução, medicações em uso
O (Objetivo): dados clínicos relevantes, sinais vitais quando pertinente
A (Avaliação): hipóteses diagnósticas com CID-10, diagnósticos diferenciais
P (Plano): conduta proposta, incluindo exames solicitados, medicações, orientações e retorno

REGRAS:
- Para pacientes idosos (≥60 anos), considere polifarmácia, risco de queda, Critérios de Beers
- Inclua CID-10 nas hipóteses diagnósticas
- Mencione interações medicamentosas relevantes se houver
- REGRA ABSOLUTA DE SEGURANÇA: NÃO invente comorbidades (ex: diabetes, hipertensão), sintomas adicionais ou dados vitais que não foram relatados na queixa de entrada. O prontuário deve ser conciso e fiel apenas às informações fornecidas.
- Seja conciso mas completo`;

export default function SOAPPanel() {
  const [isLoadingJust, setIsLoadingJust] = useState(false);
  const [isLoadingSoap, setIsLoadingSoap] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [soapExpanded, setSoapExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const elapsedJust = useElapsedTimer(isLoadingJust);
  const elapsedSoap = useElapsedTimer(isLoadingSoap);

  const handleCopy = () => {
    navigator.clipboard.writeText(soap);
    setCopied(true);
    toast.success('Nota SOAP copiada!');
    setTimeout(() => setCopied(false), 2000);
  };

  const {
    pacienteNome, genero, examesSelecionados, procedimentosSelecionados,
    soap, setSoap,
    queixa, setQueixa,
    justificativa, setJustificativa,
    tipoGuia, iaModel, setIaModel,
    consultasGravadas, gravarConsulta, removerConsultaGravada, adicionarConsultaAoHistorico, limparConsultasGravadas, setPaciente,
  } = useAppStore();

  // Estados para Gravação de Áudio
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const formatTime = (timeInSeconds: number) => {
    const mins = Math.floor(timeInSeconds / 60);
    const secs = timeInSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        await transcreverAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      toast.success('Gravação iniciada...');
    } catch (err) {
      console.error(err);
      toast.error('Não foi possível acessar o microfone. Verifique as permissões.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const transcreverAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    toast.info('Enviando áudio para transcrição...');
    try {
      const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
      
      const transcription = await groq.audio.transcriptions.create({
        file: file,
        model: 'whisper-large-v3',
        language: 'pt',
      });

      const text = transcription.text;
      if (text && text.trim()) {
        setQueixa(text);
        toast.success('Áudio transcrito com sucesso!');

        const nome = pacienteNome.trim();
        if (nome) {
          adicionarConsultaAoHistorico(nome, text);
          toast.success('Consulta adicionada ao histórico!');
        }
      } else {
        toast.error('Não foi possível detectar fala no áudio.');
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Erro ao transcrever o áudio.');
      console.error(err);
      toast.error(msg);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleGravarConsulta = () => {
    const success = gravarConsulta();
    if (success) {
      toast.success('Consulta salva no histórico!');
    } else {
      toast.error('Preencha o nome do paciente e a queixa.');
    }
  };

  const handleCarregarConsulta = (consulta: ConsultaGravada) => {
    setPaciente({ pacienteNome: consulta.nome });
    setQueixa(consulta.queixa);
    toast.success(`Consulta de ${consulta.nome} carregada`);
  };

  const buildContext = () => {
    const isLab = tipoGuia === 'LABORATORIO';
    const examesStr = isLab
      ? `Exames laboratoriais: ${examesSelecionados.join(', ') || 'nenhum'}`
      : `Procedimento: ${procedimentosSelecionados.join(', ') || tipoGuia}`;
    return `Paciente: ${pacienteNome || 'não informado'} | Gênero: ${genero === 'M' ? 'Masculino' : 'Feminino'}
${examesStr}
Queixa clínica: "${queixa}"`;
  };

  const gerarJustificativa = async () => {
    if (!queixa.trim()) { setError('Informe a queixa clínica.'); return; }
    setIsLoadingJust(true);
    setError(null);
    try {
      const content = await callGemini({
        prompt: buildContext(),
        systemInstruction: SYSTEM_PROMPT_JUSTIFICATIVA,
      });
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
    try {
      const content = await callGemini({
        prompt: buildContext(),
        systemInstruction: SYSTEM_PROMPT_SOAP,
      });
      setSoap(content);
      setIaModel(getLastUsedModel());
      setSoapExpanded(true);
      toast.success('Nota SOAP gerada');
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Erro ao gerar SOAP.');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoadingSoap(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">

      {/* Queixa / Contexto Clínico */}
      <div className="space-y-3">
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Queixa / Contexto Clínico
          </label>
          <textarea
            value={queixa}
            onChange={(e) => setQueixa(e.target.value)}
            rows={3}
            placeholder="Ex: Paciente 78a, astenia há 2 meses, perda de 4kg, HAS e DM2."
            className="w-full border border-gray-200 rounded-xl text-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 resize-y placeholder:text-gray-400 bg-gray-50/10 focus:bg-white transition-all font-medium leading-relaxed"
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>

        {/* Botões do Prontuário */}
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={gerarJustificativa}
            disabled={isLoadingJust || !queixa.trim() || isRecording || isTranscribing}
            title="Gerar indicação clínica para a guia"
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm whitespace-nowrap cursor-pointer hover:shadow"
          >
            {isLoadingJust ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
            {isLoadingJust ? (elapsedJust ? `${elapsedJust}s…` : '…') : 'Justificativa'}
          </button>
          <button
            onClick={gerarSOAP}
            disabled={isLoadingSoap || !queixa.trim() || isRecording || isTranscribing}
            title="Gerar nota SOAP para prontuário"
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm whitespace-nowrap cursor-pointer hover:shadow"
          >
            {isLoadingSoap ? <Loader2 size={13} className="animate-spin" /> : <ClipboardList size={13} />}
            {isLoadingSoap ? (elapsedSoap ? `${elapsedSoap}s…` : '…') : 'SOAP'}
          </button>

          <div className="flex-grow" />

          {/* Botão de Gravar Áudio (Consulta por voz) */}
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm whitespace-nowrap animate-pulse cursor-pointer hover:shadow"
              title="Parar gravação de áudio"
            >
              <Square size={13} fill="white" />
              Parar ({formatTime(recordingTime)})
            </button>
          ) : isTranscribing ? (
            <button
              disabled
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 text-white text-xs font-semibold rounded-xl disabled:opacity-75 transition-all shadow-sm whitespace-nowrap"
            >
              <Loader2 size={13} className="animate-spin" />
              Transcrevendo...
            </button>
          ) : (
            <button
              onClick={startRecording}
              disabled={isLoadingJust || isLoadingSoap}
              title="Gravar consulta por voz (transcrição automática)"
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm whitespace-nowrap cursor-pointer hover:shadow"
            >
              <Mic size={13} />
              Gravar Consulta
            </button>
          )}

          {/* Botão de Salvamento Manual no Histórico */}
          <button
            onClick={handleGravarConsulta}
            disabled={!pacienteNome.trim() || !queixa.trim() || isRecording || isTranscribing}
            title="Salvar consulta de texto no histórico"
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm whitespace-nowrap cursor-pointer hover:shadow"
          >
            <Save size={13} />
            Salvar Texto
          </button>
        </div>
      </div>

      {/* Indicação Clínica — sempre visível para edição manual */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <FileText size={12} className="text-indigo-500" />
            <label className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
              Indicação Clínica
              <span className="ml-1.5 font-normal text-gray-400 normal-case">(impressa na guia)</span>
            </label>
          </div>
          {justificativa && (
            <button onClick={() => setJustificativa('')} className="text-gray-300 hover:text-red-400 transition-colors" title="Limpar">
              <X size={13} />
            </button>
          )}
        </div>
        <textarea
          value={justificativa}
          onChange={(e) => setJustificativa(e.target.value)}
          rows={3}
          placeholder="Gerada automaticamente ou escreva manualmente..."
          className="w-full border-2 border-indigo-200 bg-indigo-50/30 rounded-xl text-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none placeholder:text-gray-400 font-medium"
        />
      </div>

      {/* SOAP — colapsível discreto */}
      <div className="border border-indigo-100/80 rounded-xl overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setSoapExpanded(!soapExpanded)}
          className="w-full flex items-center justify-between px-3 py-2 bg-indigo-50/40 hover:bg-indigo-50 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <ClipboardList size={12} className="text-indigo-500" />
            <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">
              Nota SOAP — Prontuário Clínico (Fácil Cópia)
            </span>
            {soap && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Pronta</span>
                {iaModel && (
                  <span className="text-[9px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-mono font-medium">
                    {iaModel}
                  </span>
                )}
              </div>
            )}
          </div>
          {soapExpanded ? <ChevronUp size={13} className="text-indigo-400" /> : <ChevronDown size={13} className="text-indigo-400" />}
        </button>
        {soapExpanded && (
          <div className="p-3 bg-white space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-400 font-medium">
                Edite a nota abaixo e clique no botão para copiar com formatação limpa:
              </span>
              {soap.trim() && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                    copied
                      ? 'bg-green-600 text-white shadow-green-100'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
                  }`}
                >
                  {copied ? <Check size={13} /> : <ClipboardList size={13} />}
                  {copied ? 'Copiado!' : 'Copiar Nota SOAP'}
                </button>
              )}
            </div>
            <textarea
              value={soap}
              onChange={(e) => setSoap(e.target.value)}
              rows={14}
              placeholder="A nota SOAP (S/O/A/P) aparecerá aqui ao ser gerada pela IA ou digitada..."
              className="w-full border border-gray-200 rounded-xl text-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50/30 resize-y font-sans leading-relaxed text-gray-800 placeholder:text-gray-400 focus:bg-white transition-all"
            />
            <div className="flex justify-between items-center text-[10px] text-gray-400">
              <span>Nota clínica no padrão S-O-A-P. Não é impressa na guia de exames.</span>
              {soap.trim() && (
                <span className="font-semibold text-indigo-500">Pronta para colar em outros sistemas</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Consultas Gravadas (Histórico das últimas 10) */}
      {consultasGravadas && consultasGravadas.length > 0 && (
        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-gray-50/50 p-3.5 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-gray-100 pb-1.5 mb-1.5">
            <div className="flex items-center gap-1.5">
              <Save size={12} className="text-emerald-500" />
              <h4 className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                Últimas Consultas Gravadas ({consultasGravadas.length})
              </h4>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm('Tem certeza que deseja apagar todo o histórico de consultas gravadas?')) {
                  limparConsultasGravadas();
                  toast.success('Histórico apagado com sucesso');
                }
              }}
              className="text-[10px] text-gray-400 hover:text-red-500 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              title="Apagar todo o histórico"
            >
              <Trash2 size={10} />
              Limpar Histórico
            </button>
          </div>
          <div className="grid gap-2">
            {consultasGravadas.map((c, i) => (
              <div
                key={`${c.nome}-${c.data}`}
                className="group flex items-center justify-between gap-3 p-2 bg-white rounded-lg border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => handleCarregarConsulta(c)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-xs text-gray-800 truncate">
                      {c.nome}
                    </span>
                    <span className="text-[9px] text-gray-400 font-medium whitespace-nowrap flex items-center gap-0.5">
                      <Calendar size={10} />
                      {new Date(c.data).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate group-hover:text-gray-700" title={c.queixa}>
                    {c.queixa}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removerConsultaGravada(i);
                    toast.success('Registro removido');
                  }}
                  className="text-gray-300 hover:text-red-500 p-1.5 rounded-md hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Remover do histórico"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

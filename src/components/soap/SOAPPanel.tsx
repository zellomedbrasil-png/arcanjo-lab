import { useState, useRef, useEffect } from 'react';
import { useElapsedTimer } from '../../hooks/useElapsedTimer';
import { useAppStore } from '../../store/useAppStore';
import { callAI, getLastUsedModel, getDefaultModelId, AI_MODELS, cancelAIRequest } from '../../config/gemini';
import { groq } from '../../config/groq';
import { getErrorMessage } from '../../lib/errors';
import { toast } from '../../lib/toast';
import { Loader2, Wand2, ClipboardList, FileText, ChevronDown, ChevronUp, X, Check, Save, Trash2, Calendar, Mic, Square, Smartphone, Radio } from 'lucide-react';
import type { ConsultaGravada } from '../../types';
import { cleanSoapMarkdown } from '../../lib/formatters';



export const SYSTEM_PROMPT_JUSTIFICATIVA = `Você é um médico geriatra e gastroenterologista sênior, com expertise em auditoria médica de convênios.
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

export const SYSTEM_PROMPT_SOAP = `ASSISTENTE CLÍNICO — CONSULTÓRIO PRESENCIAL (GASTROENTEROLOGIA & GERIATRIA)
Dr. Roberto Arcanjo | CRM-CE 26.155

PAPEL:
Você é o assistente de documentação clínica do Dr. Roberto Arcanjo, gastroenterologista e geriatra, em atendimento PRESENCIAL em Fortaleza-CE. Transforma entradas clínicas curtas em documentação especializada completa. O usuário é médico — sem disclaimers, sem explicações básicas. Sempre em português do Brasil.

REGRAS ABSOLUTAS:
- CID-10 obrigatório em todo diagnóstico.
- Terminologia TUSS obrigatória em todo pedido de exame.
- Prescrições completas: fármaco genérico, concentração, via, frequência, duração, dose máxima.
- Só prescreva e solicite exame se mudar a conduta.
- Nível de prescrição sempre especialista — melhor evidência atual, melhor fármaco da classe.
- Beers 2023 e STOPP/START ativos para idosos. Sinalizar proativamente medicamento inapropriado, ajuste renal, desprescrição.
- NÃO inventar comorbidades, sintomas ou dados não fornecidos.

FORMATO DE SAÍDA — TEXTO PURO ESTRITAMENTE (para colar em prontuário legado):
- ZERO Markdown: sem #, *, **, _, ---, nenhum símbolo de formatação.
- ZERO emojis ou ícones.
- Títulos e seções em MAIÚSCULAS com quebras de linha.
- Listas com hífen simples (-) ou numeração.
- Texto direto, sem preâmbulos ("Segue o SOAP...", "Claro!" etc.).

ESTRUTURA OBRIGATÓRIA (siga exatamente esta ordem e nomenclatura):

1. SOAP EXPRESS

SUBJETIVO (S):
ID: [sexo, idade]. QP: [queixa principal em 1 linha]. HMA: [cronologia essencial, sintomas e dados clínicos relevantes, 3-5 linhas máximo]. Alergias: [lista ou Nega].

OBJETIVO (O):
Sinais vitais: [se informados]. Exame físico dirigido: [achados relevantes à queixa, sem dados normais genéricos desnecessários].

AVALIAÇÃO (A):
HD: [hipótese diagnóstica principal] — CID-10: [código]. Risco: [Baixo / Médio / Alto]. Em idosos: estadiamento funcional/cognitivo se pertinente.


2. CONDUTA E PRESCRIÇÃO

[Para cada medicamento usar exatamente o formato:]
NOME GENÉRICO [concentração] ................ [QTD] caixas/frascos
Posologia: [dose, via, frequência, duração].
Indicação: [por que é a melhor escolha para este paciente].

Controlados em bloco separado com classificação (Lista A/B1/C1 — Portaria 344/98), máximo 2 caixas, validade 30 dias.

Exames/retorno: correlacionar achados com conduta, interpretar resultados com escalas vigentes quando aplicável (Los Angeles, Forrest, Sydney/OLGA, Praga, Boston, Paris, Mayo, FIB-4/APRI, ACR TI-RADS, Roma IV, etc.).


3. EXAMES SOLICITADOS (uso racional — TUSS)

- [NOME DO EXAME — TUSS]: [indicação clínica em 1 linha]


4. ORIENTAÇÃO AO PACIENTE

[Primeira pessoa, linguagem leiga simples — diagnóstico, tratamento, red flags para retorno urgente ao PS, data da próxima consulta]


5. HANDOVER

[Resumo de transição — pontos cruciais, hipótese principal, conduta em andamento, pendências — máximo 5 linhas]


ASSINATURA (obrigatória ao final, exatamente assim):
Dr. Roberto Arcanjo | Geriatria & Gastroenterologia
CRM-CE: 26.155

MODO ESPECIALISTA (perguntas pontuais):
Se a entrada for uma pergunta clínica direta (dose, diferencial, manejo de situação específica), responda DIRETO — nível especialista, doses exatas, critérios, red flags. NÃO montar SOAP. Citar diretrizes atuais (SBC, SBI, IDSA, ESC, AHA, NICE, SBD/ADA, SBEM, Roma IV) quando aplicável.`;

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
    syncStatus, setIsPairingModalOpen,
  } = useAppStore();

  // Estados para Gravação de Áudio
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Seletor de modelo de IA — armazena o model ID diretamente
  const [selectedModelId, setSelectedModelId] = useState<string>(() => getDefaultModelId());

  const handleProcessMobileTranscription = async (text: string) => {
    if (!text || !text.trim()) return;
    setQueixa(queixa.trim() ? `${queixa}\n${text}` : text);
    if (pacienteNome.trim()) {
      adicionarConsultaAoHistorico(pacienteNome.trim(), text);
    }
  };

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
        toast.success('Áudio transcrito com sucesso!');
        await handleProcessMobileTranscription(text);
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
      const content = await callAI(
        { prompt: buildContext(), systemInstruction: SYSTEM_PROMPT_JUSTIFICATIVA },
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
    try {
      const content = await callAI(
        { prompt: buildContext(), systemInstruction: SYSTEM_PROMPT_SOAP },
        selectedModelId
      );
      setSoap(cleanSoapMarkdown(content));
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
            placeholder="Ex: Paciente 78a, astenia há 2 meses, perda de 4kg, HAS e DM2."
            className="w-full border border-gray-200 rounded-xl text-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 resize-y placeholder:text-gray-400 bg-gray-50/10 focus:bg-white transition-all font-medium leading-relaxed h-20 lg:h-28"
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>

        {/* Botões do Prontuário */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 items-center">
          <button
            onClick={isLoadingJust ? cancelAIRequest : gerarJustificativa}
            disabled={!isLoadingJust && (!queixa.trim() || isRecording || isTranscribing)}
            title={isLoadingJust ? 'Parar a geração' : 'Gerar indicação clínica para a guia'}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 text-white text-xs font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm whitespace-nowrap cursor-pointer hover:shadow max-sm:w-full ${
              isLoadingJust ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isLoadingJust ? <Square size={12} fill="white" /> : <Wand2 size={13} />}
            {isLoadingJust ? `Parar${elapsedJust ? ` ${elapsedJust}s` : ''}` : 'Justificativa'}
          </button>
          <button
            onClick={isLoadingSoap ? cancelAIRequest : gerarSOAP}
            disabled={!isLoadingSoap && (!queixa.trim() || isRecording || isTranscribing)}
            title={isLoadingSoap ? 'Parar a geração' : 'Gerar nota SOAP para prontuário'}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm whitespace-nowrap cursor-pointer hover:shadow max-sm:w-full border ${
              isLoadingSoap ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {isLoadingSoap ? <Square size={12} fill="white" /> : <ClipboardList size={13} />}
            {isLoadingSoap ? `Parar${elapsedSoap ? ` ${elapsedSoap}s` : ''}` : 'SOAP'}
          </button>

          {/* Botão de Conectar Celular para espelhar */}
          {syncStatus === 'recording' ? (
            <div className="col-span-2 sm:col-span-auto flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500 text-white text-xs font-semibold rounded-xl shadow-sm animate-pulse">
              <Radio size={13} className="animate-ping" />
              Celular Gravando...
            </div>
          ) : syncStatus === 'transcribing' ? (
            <div className="col-span-2 sm:col-span-auto flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm">
              <Loader2 size={13} className="animate-spin" />
              Celular Transcrevendo...
            </div>
          ) : (
            <button
              onClick={() => setIsPairingModalOpen(true)}
              type="button"
              title="Espelhar e gravar áudio pelo celular"
              className={`col-span-2 sm:col-span-auto flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer hover:shadow ${
                syncStatus === 'connected'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <Smartphone size={13} />
              {syncStatus === 'connected' ? 'Celular Conectado' : 'Conectar Celular'}
            </button>
          )}

          {/* Botão de Gravar Áudio (Consulta por voz local) */}
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm whitespace-nowrap animate-pulse cursor-pointer hover:shadow max-sm:w-full"
              title="Parar gravação de áudio"
            >
              <Square size={13} fill="white" />
              Parar ({formatTime(recordingTime)})
            </button>
          ) : isTranscribing ? (
            <button
              disabled
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-accent-emerald text-white text-xs font-semibold rounded-xl disabled:bg-accent-emerald/60 disabled:text-white/80 disabled:opacity-75 transition-all shadow-sm whitespace-nowrap max-sm:w-full"
            >
              <Loader2 size={13} className="animate-spin" />
              Transcrevendo...
            </button>
          ) : (
            <button
              onClick={startRecording}
              disabled={isLoadingJust || isLoadingSoap}
              title="Gravar consulta pelo microfone do computador"
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-accent-emerald text-white text-xs font-semibold rounded-xl hover:bg-accent-emerald/90 disabled:bg-accent-emerald/40 disabled:text-white/60 disabled:cursor-not-allowed transition-all shadow-sm whitespace-nowrap cursor-pointer hover:shadow max-sm:w-full"
            >
              <Mic size={13} />
              Gravar Computador
            </button>
          )}

          {/* Botão de Salvamento Manual no Histórico */}
          <button
            onClick={handleGravarConsulta}
            disabled={!pacienteNome.trim() || !queixa.trim() || isRecording || isTranscribing}
            title="Salvar consulta de texto no histórico"
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm whitespace-nowrap cursor-pointer hover:shadow max-sm:w-full"
          >
            <Save size={13} />
            Salvar Texto
          </button>

          {/* Seletor de Modelo de IA — direto, sem configuração */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 max-sm:w-full max-sm:col-span-2 shadow-sm">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider select-none shrink-0">IA:</label>
            <select
              value={selectedModelId}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedModelId(val);
                localStorage.setItem('arcanjo_selected_model', val);
                const m = AI_MODELS.find((m) => m.id === val);
                toast.info(`Modelo: ${m?.label ?? val}`);
              }}
              className="bg-transparent text-xs font-bold text-gray-700 outline-none cursor-pointer border-none focus:ring-0 min-w-0 truncate"
            >
              {AI_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}{m.note ? ` — ${m.note}` : ''}
                </option>
              ))}
            </select>
          </div>
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
              placeholder="A nota SOAP (S/O/A/P) aparecerá aqui ao ser gerada pela IA ou digitada..."
              className="w-full border border-gray-200 rounded-xl text-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50/30 resize-y font-sans leading-relaxed text-gray-800 placeholder:text-gray-400 focus:bg-white transition-all h-56 lg:h-96"
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

import { useState, useRef, useEffect } from 'react';
import { useElapsedTimer } from '../../hooks/useElapsedTimer';
import { useAppStore } from '../../store/useAppStore';
import { callAI, getLastUsedModel, getDefaultModelId, AI_MODELS, cancelAIRequest } from '../../config/gemini';
import { groq } from '../../config/groq';
import { getErrorMessage } from '../../lib/errors';
import { toast } from '../../lib/toast';
import { Loader2, Wand2, ClipboardList, FileText, ChevronDown, ChevronUp, X, Check, Save, Trash2, Calendar, Mic, Square, Smartphone, Radio, ShieldAlert, Activity, HelpCircle, Send } from 'lucide-react';
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

export const SYSTEM_PROMPT_SOAP = `ASSISTENTE CLINICO — Dr. Roberto Arcanjo | CRM-CE 26.155
Geriatria & Gastroenterologia | Fortaleza-CE | Consulta Presencial

FUNCAO: Transformar anotacoes rapidas e desestruturadas (voz, abreviacoes, erros foneticos) em prontuario medico completo. Interprete e expanda sem pedir reformulacao.

REGRA ABSOLUTA — NAO INVENTE INFORMACOES:
- Documente APENAS o que foi informado na entrada.
- Se sinais vitais, exame fisico ou alergias nao foram fornecidos, NAO preencha com valores ficticios. Omita a subsecao ou escreva "Nao referido".
- NUNCA crie sintomas, comorbidades ou achados de exame nao mencionados.
- HMA em texto corrido narrativo, APENAS com dados fornecidos.

INTELIGENCIA CLINICA (aplicar automaticamente quando pertinente):

GERIATRIA (>=60 anos):
- Beers 2023 / STOPP-START: sinalizar UMA VEZ farmaco inapropriado, sugerir alternativa, nao repetir
- Preferencias: mirtazapina > quetiapina (sono/apetite idoso); nortriptilina > amitriptilina (hipotensao postural); mecobalamina > cianocobalamina (B12); colecalciferol ataque 50.000 UI/sem x10 depois 7.000 UI/sem; mirabegrona > anticolinergicos (urgencia urinaria); macrogol 4000 (mercado BR); pantoprazol > omeprazol (CYP2C19); domperidona > metoclopramida
- Evitar: AINEs, BZDs sem plano de desprescricao, carga anticolinergica
- Funcionalidade (AVDs) se dados disponiveis

GASTROENTEROLOGIA:
- Escalas quando pertinente: Roma IV, Bristol, Los Angeles, Sydney/OLGA, FIB-4, Forrest
- H. pylori: quadrupla bismuto 1a linha; PAL alternativa; confirmar falha com Ag fecal antes de 3a linha
- Suspender IBP 14 dias antes de EDA (urease)
- GLP-1/GIP: alertar risco aspiracao pre-EDA

FARMACOLOGIA:
- Controlados: classificar C1 (branca 2 vias, 60 dias), B1 (azul), A1/A3 (amarela) — Portaria 344/98
- Farmacia Popular: telmisartana NAO; amlodipina SIM
- Alertar duplicidade ISRS (sindrome serotoninergica)
- SGLT2i: sick-day rules, risco cetoacidose euglicemica
- Lactose excipientes: alertar se clinicamente relevante

FORMATACAO (ZERO MARKDOWN):
- SEM asteriscos, hashtags, sublinhados, emojis, tracos horizontais
- MAIUSCULAS para titulos de secao
- Hifens (-) para listas
- Iniciar direto em "1. SOAP EXPRESS", encerrar na assinatura
- CONCISO: sem preambulos, sem conclusoes genericas, sem explicacoes academicas desnecessarias

ESTRUTURA:

1. SOAP EXPRESS

SUBJETIVO (S):
- Identificacao: [Sexo, Idade, Convenio]
- QP: [Direto]
- HMA: [Texto corrido — APENAS dados fornecidos]
- Antecedentes: [APENAS os informados]
- Medicacoes: [APENAS as informadas com doses]
- Alergias: [Informado ou "Nao referido"]

OBJETIVO (O):
- Sinais Vitais: [APENAS se fornecidos — senao omitir subsecao]
- Exame Fisico: [APENAS achados relatados — NAO inventar exame normal generico]

AVALIACAO (A):
- HD principal + CID-10; HDs secundarias + CID-10
- Estratificacao de risco se pertinente
- Alerta farmacovigilancia (Beers/STOPP) se aplicavel — UMA VEZ

2. CONDUTA E PRESCRICAO

MEDICAMENTOS:
[Generico] [concentracao] ................ [Qtd] caixas
- Posologia: [dose, via, frequencia, duracao]
- Indicacao: [Resumida]

CONTROLADOS — PORTARIA 344/98 (se houver):
[Lista C1/B1/A]
[Generico] [concentracao] ................ [Qtd] caixas
- Posologia completa
- Indicacao resumida

MEDIDAS NAO-FARMACOLOGICAS:
- [Apenas orientacoes pertinentes ao caso]

3. EXAMES SOLICITADOS
- [EXAME] (TUSS [codigo]): [Justificativa anti-glosa — necessidade medica, nao mencionar hipotese diretamente]

4. ORIENTACAO AO PACIENTE
[Linguagem clara para leigo. Diagnostico suspeito, cuidados, sinais de alerta para PS, retorno]

5. HANDOVER
[3-4 linhas: status, condutas, pendencias, CID-10]

Dr. Roberto Arcanjo | Geriatria & Gastroenterologia
CRM-CE: 26.155`;

export const SYSTEM_PROMPT_DUVIDAS = `Voce e um assistente clinico especializado em Geriatria e Gastroenterologia, auxiliando o Dr. Roberto Arcanjo (CRM-CE 26.155) em Fortaleza-CE.

Responda duvidas clinicas fora do contexto da consulta atual: interacoes medicamentosas, doses, protocolos, guidelines, escalas clinicas, CID-10, TUSS, classificacoes, condutas baseadas em evidencia.

REGRAS:
- Respostas diretas e objetivas, sem rodeios
- Cite fonte/guideline quando pertinente (ex: Beers 2023, ADA 2024, SBAD, ACR TI-RADS)
- Use linguagem tecnica medica (o usuario e medico especialista)
- Se nao tiver certeza, diga explicitamente
- Formatacao limpa sem markdown (sem asteriscos, hashtags)
- MAIUSCULAS para titulos, hifens para listas
- Responda em portugues brasileiro`;

export default function SOAPPanel() {
  const [isLoadingJust, setIsLoadingJust] = useState(false);
  const [isLoadingSoap, setIsLoadingSoap] = useState(false);
  const [isLoadingDuvida, setIsLoadingDuvida] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [soapExpanded, setSoapExpanded] = useState(true);
  const [duvidasExpanded, setDuvidasExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedDuvida, setCopiedDuvida] = useState(false);
  const [perguntaDuvida, setPerguntaDuvida] = useState('');
  const [respostaDuvida, setRespostaDuvida] = useState('');
  const elapsedJust = useElapsedTimer(isLoadingJust);
  const elapsedSoap = useElapsedTimer(isLoadingSoap);
  const elapsedDuvida = useElapsedTimer(isLoadingDuvida);

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


  // Análise clínica em tempo real da nota SOAP
  const analisarSOAP = (texto: string) => {
    if (!texto) return { alertBeers: null, escalas: [] as string[], cids: [] as string[] };

    const textLower = texto.toLowerCase();
    
    // 1. Detecção de Alertas de Beers / STOPP
    let alertBeers: string | null = null;
    const hasBeersKeywords = textLower.includes('beers') || textLower.includes('stopp');
    const hasCriticalDrugs = textLower.includes('amitriptilina') || 
                             textLower.includes('clonazepam') || 
                             textLower.includes('diazepam') || 
                             textLower.includes('alprazolam') || 
                             textLower.includes('bromazepam') || 
                             textLower.includes('zolpidem') || 
                             textLower.includes('glimepirida') || 
                             textLower.includes('metoclopramida') || 
                             (textLower.includes('diclofenaco') && textLower.includes('idoso')) || 
                             (textLower.includes('nimesulida') && textLower.includes('idoso')) || 
                             (textLower.includes('ibuprofeno') && textLower.includes('idoso'));
                             
    if (hasBeersKeywords || hasCriticalDrugs) {
      alertBeers = "Possível risco terapêutico/medicamento inapropriado detectado (Critérios de Beers 2023 / STOPP-START). Avalie desprescrição ou ajuste de dose.";
    }

    // 2. Detecção de Escalas Clínicas
    const escalasDisponiveis = [
      { nome: 'Bristol (Fezes)', keywords: ['bristol', 'cíbalos'] },
      { nome: 'Roma IV (Gastroenterologia)', keywords: ['roma iv', 'roma 4', 'constipação funcional', 'dispepsia funcional', 'síndrome do intestino irritável'] },
      { nome: 'Los Angeles (Esofagite)', keywords: ['los angeles', 'grau a', 'grau b', 'grau c', 'grau d'] },
      { nome: 'Sydney/OLGA (Gastrite)', keywords: ['sydney', 'olga', 'olgis'] },
      { nome: 'Forrest (HDA)', keywords: ['forrest'] },
      { nome: 'FIB-4 (Fibrose Hepática)', keywords: ['fib-4', 'fib4'] },
      { nome: 'Katz (Funcionalidade)', keywords: ['katz'] },
      { nome: 'Lawton (Funcionalidade)', keywords: ['lawton'] },
      { nome: 'FRAIL / Fried (Fragilidade)', keywords: ['frail', 'fried', 'fragilidade'] }
    ];

    const escalas = escalasDisponiveis
      .filter(e => e.keywords.some(k => textLower.includes(k)))
      .map(e => e.nome);

    // 3. Extração de CIDs
    const regexCid = /\b[A-Z]\d{2}(?:\.\d)?\b/g;
    const matches = texto.match(regexCid) || [];
    const cids = Array.from(new Set(matches));

    return { alertBeers, escalas, cids };
  };

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
    setSoapExpanded(true); // expande antes para o texto aparecer progressivamente
    try {
      const content = await callAI(
        {
          prompt: buildContext(),
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

  const enviarDuvida = async () => {
    if (!perguntaDuvida.trim()) return;
    setIsLoadingDuvida(true);
    setDuvidasExpanded(true);
    setRespostaDuvida('');
    try {
      const content = await callAI(
        {
          prompt: perguntaDuvida,
          systemInstruction: SYSTEM_PROMPT_DUVIDAS,
          onDelta: (textSoFar) => setRespostaDuvida(cleanSoapMarkdown(textSoFar)),
        },
        selectedModelId
      );
      setRespostaDuvida(cleanSoapMarkdown(content));
      toast.success('Resposta gerada');
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Erro ao responder dúvida.');
      toast.error(msg);
    } finally {
      setIsLoadingDuvida(false);
    }
  };

  const handleCopyDuvida = () => {
    navigator.clipboard.writeText(respostaDuvida);
    setCopiedDuvida(true);
    toast.success('Resposta copiada!');
    setTimeout(() => setCopiedDuvida(false), 2000);
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
            {/* Auditoria Clínica Ativa */}
            {(() => {
              const analise = analisarSOAP(soap);
              if (!soap.trim() || (!analise.alertBeers && analise.escalas.length === 0 && analise.cids.length === 0)) return null;
              
              return (
                <div className="bg-slate-50 rounded-xl p-3 border border-indigo-100/60 space-y-2.5">
                  <div className="flex items-center gap-1.5 border-b border-indigo-100/30 pb-1.5">
                    <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">
                      Auditoria Clínica Ativa (Segurança & Métricas)
                    </span>
                  </div>
                  
                  {/* Beers Alert */}
                  {analise.alertBeers && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200/60 rounded-lg p-2 text-[11px] text-red-800">
                      <ShieldAlert size={14} className="shrink-0 mt-0.5 text-red-600 animate-pulse" />
                      <div className="leading-relaxed">
                        <strong className="font-bold">⚠️ Alerta Beers / STOPP:</strong> {analise.alertBeers}
                      </div>
                    </div>
                  )}

                  {/* Escalas e Códigos */}
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {analise.escalas.map(e => (
                      <span key={e} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                        <Activity size={10} />
                        Escala: {e}
                      </span>
                    ))}
                    {analise.cids.map(c => (
                      <span key={c} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        CID-10: {c}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

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

      {/* Dúvidas Clínicas — fora do contexto da consulta */}
      <div className="border border-amber-100/80 rounded-xl overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setDuvidasExpanded(!duvidasExpanded)}
          className="w-full flex items-center justify-between px-3 py-2 bg-amber-50/40 hover:bg-amber-50 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <HelpCircle size={12} className="text-amber-500" />
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
              Duvidas Clinicas (Fora do Contexto)
            </span>
          </div>
          {duvidasExpanded ? <ChevronUp size={13} className="text-amber-400" /> : <ChevronDown size={13} className="text-amber-400" />}
        </button>
        {duvidasExpanded && (
          <div className="p-3 bg-white space-y-3">
            <div className="flex gap-2">
              <textarea
                value={perguntaDuvida}
                onChange={(e) => setPerguntaDuvida(e.target.value)}
                placeholder="Ex: Qual a dose de ataque de colecalciferol para idoso com vit D < 10? Interacao entre clopidogrel e omeprazol?"
                className="flex-1 border border-amber-200 rounded-xl text-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 resize-none placeholder:text-gray-400 bg-amber-50/20 focus:bg-white transition-all font-medium leading-relaxed h-16"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !isLoadingDuvida) {
                    e.preventDefault();
                    enviarDuvida();
                  }
                }}
              />
              <button
                onClick={isLoadingDuvida ? cancelAIRequest : enviarDuvida}
                disabled={!isLoadingDuvida && !perguntaDuvida.trim()}
                className={`self-end flex items-center justify-center gap-1.5 px-3 py-2.5 text-white text-xs font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm whitespace-nowrap cursor-pointer ${
                  isLoadingDuvida ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {isLoadingDuvida ? <Square size={12} fill="white" /> : <Send size={13} />}
                {isLoadingDuvida ? `Parar${elapsedDuvida ? ` ${elapsedDuvida}s` : ''}` : 'Perguntar'}
              </button>
            </div>
            {respostaDuvida && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Resposta</span>
                  <button
                    type="button"
                    onClick={handleCopyDuvida}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                      copiedDuvida
                        ? 'bg-green-600 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    {copiedDuvida ? <Check size={13} /> : <ClipboardList size={13} />}
                    {copiedDuvida ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <div className="bg-amber-50/30 border border-amber-100 rounded-xl p-3 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                  {respostaDuvida}
                </div>
              </div>
            )}
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

import { useState } from 'react';
import { useElapsedTimer } from '../../hooks/useElapsedTimer';
import { useAppStore } from '../../store/useAppStore';
import { callGemini } from '../../config/gemini';
import { getErrorMessage } from '../../lib/errors';
import { toast } from '../../lib/toast';
import { Loader2, Wand2, ClipboardList, FileText, ChevronDown, ChevronUp, X, Check } from 'lucide-react';

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
  const [queixa, setQueixa] = useState('');
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
    justificativa, setJustificativa,
    tipoGuia,
  } = useAppStore();

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

      {/* Queixa + botões em linha */}
      <div className="flex gap-3 items-start">
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Queixa / Contexto Clínico
          </label>
          <textarea
            value={queixa}
            onChange={(e) => setQueixa(e.target.value)}
            rows={2}
            placeholder="Ex: Paciente 78a, astenia há 2 meses, perda de 4kg, HAS e DM2."
            className="w-full border border-gray-200 rounded-xl text-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 resize-none placeholder:text-gray-400"
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>

        {/* Botões empilhados */}
        <div className="flex flex-col gap-1.5 pt-5 shrink-0">
          <button
            onClick={gerarJustificativa}
            disabled={isLoadingJust || !queixa.trim()}
            title="Gerar indicação clínica para a guia"
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm whitespace-nowrap"
          >
            {isLoadingJust ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
            {isLoadingJust ? (elapsedJust ? `${elapsedJust}s…` : '…') : 'Justificativa'}
          </button>
          <button
            onClick={gerarSOAP}
            disabled={isLoadingSoap || !queixa.trim()}
            title="Gerar nota SOAP para prontuário"
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm whitespace-nowrap"
          >
            {isLoadingSoap ? <Loader2 size={13} className="animate-spin" /> : <ClipboardList size={13} />}
            {isLoadingSoap ? (elapsedSoap ? `${elapsedSoap}s…` : '…') : 'SOAP'}
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
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Pronta</span>
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

    </div>
  );
}

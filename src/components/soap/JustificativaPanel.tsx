import { useState } from 'react';
import { useElapsedTimer } from '../../hooks/useElapsedTimer';
import { useAppStore } from '../../store/useAppStore';
import { callGemini, getLastUsedModel } from '../../config/gemini';
import { getErrorMessage } from '../../lib/errors';
import { toast } from '../../lib/toast';
import { Loader2, Wand2, FileText, X } from 'lucide-react';

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

interface JustificativaPanelProps {
  mode: 'exames' | 'procedimentos';
}

export default function JustificativaPanel({ mode }: JustificativaPanelProps) {
  const [isLoadingJust, setIsLoadingJust] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const elapsedJust = useElapsedTimer(isLoadingJust);

  const {
    pacienteNome,
    genero,
    examesSelecionados,
    procedimentosSelecionados,
    queixa,
    setQueixa,
    justificativaExames,
    setJustificativaExames,
    justificativaProcedimentos,
    setJustificativaProcedimentos,
    setIaModel,
    iaModel,
  } = useAppStore();

  const isLab = mode === 'exames';
  const justificativaValue = isLab ? justificativaExames : justificativaProcedimentos;
  const setJustificativaValue = isLab ? setJustificativaExames : setJustificativaProcedimentos;

  // Visual classes matching theme (blue for lab exams, emerald for elective procedures)
  const theme = {
    primaryBg: isLab ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700',
    borderColor: isLab ? 'border-blue-200' : 'border-emerald-200',
    focusRing: isLab ? 'focus:ring-blue-300 focus:border-blue-400' : 'focus:ring-emerald-300 focus:border-emerald-400',
    textColor: isLab ? 'text-blue-700' : 'text-emerald-700',
    lightBg: isLab ? 'bg-blue-50/30' : 'bg-emerald-50/30',
    title: isLab ? 'Exames Laboratoriais' : 'Procedimentos Eletivos',
  };

  const buildContext = () => {
    const itemsStr = isLab
      ? `Exames laboratoriais: ${examesSelecionados.join(', ') || 'nenhum'}`
      : `Procedimentos eletivos: ${procedimentosSelecionados.join(', ') || 'nenhum'}`;
    return `Paciente: ${pacienteNome || 'não informado'} | Gênero: ${genero === 'M' ? 'Masculino' : 'Feminino'}
${itemsStr}
Queixa clínica: "${queixa}"`;
  };

  const gerarJustificativa = async () => {
    if (!queixa.trim()) {
      setError('Informe a queixa clínica para servir de contexto.');
      return;
    }
    setIsLoadingJust(true);
    setError(null);
    try {
      const content = await callGemini({
        prompt: buildContext(),
        systemInstruction: SYSTEM_PROMPT_JUSTIFICATIVA,
      });
      setJustificativaValue(content.toUpperCase());
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
      {/* Queixa + Gerar Justificativa Button */}
      <div className="flex gap-3 items-start max-sm:flex-col">
        <div className="flex-1 w-full">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Queixa / Contexto Clínico (Sincronizado)
          </label>
          <textarea
            value={queixa}
            onChange={(e) => setQueixa(e.target.value)}
            rows={2}
            placeholder="Ex: Paciente 78a, astenia há 2 meses, perda de 4kg, HAS e DM2. (Digitado no prontuário)"
            className={`w-full border border-gray-200 rounded-xl text-sm py-2.5 px-3 focus:outline-none focus:ring-2 ${theme.focusRing} resize-none placeholder:text-gray-400`}
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>

        <button
          onClick={gerarJustificativa}
          disabled={isLoadingJust || !queixa.trim()}
          title={`Gerar justificativa clínica para os ${theme.title}`}
          className={`flex items-center justify-center gap-1.5 px-4 py-2.5 text-white text-xs font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm whitespace-nowrap mt-5 shrink-0 max-sm:w-full ${theme.primaryBg}`}
        >
          {isLoadingJust ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
          {isLoadingJust ? (elapsedJust ? `${elapsedJust}s…` : '…') : 'Gerar Justificativa'}
        </button>
      </div>

      {/* Indicação Clínica Textarea */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <FileText size={12} className={theme.textColor} />
            <label className={`text-[10px] font-bold uppercase tracking-wider ${theme.textColor}`}>
              Indicação Clínica / Justificativa dos {theme.title}
              <span className="ml-1.5 font-normal text-gray-400 normal-case">(impressa na guia)</span>
            </label>
          </div>
          {justificativaValue && (
            <button
              onClick={() => setJustificativaValue('')}
              className="text-gray-300 hover:text-red-400 transition-colors"
              title="Limpar"
            >
              <X size={13} />
            </button>
          )}
        </div>
        <textarea
          value={justificativaValue}
          onChange={(e) => setJustificativaValue(e.target.value)}
          rows={3}
          placeholder={`Justificativa dos ${theme.title.toLowerCase()}...`}
          className={`w-full border-2 rounded-xl text-sm py-2.5 px-3 focus:outline-none focus:ring-2 ${theme.borderColor} ${theme.lightBg} ${theme.focusRing} resize-none placeholder:text-gray-400 font-medium`}
        />
        {iaModel && justificativaValue && (
          <div className="flex justify-between items-center mt-1 text-[9px] text-gray-400">
            <span>Esta justificativa é exclusiva para esta aba.</span>
            <span className="font-mono">Gerado por: {iaModel}</span>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useElapsedTimer } from '../../hooks/useElapsedTimer';
import { useAppStore } from '../../store/useAppStore';
import { callAI, getLastUsedModel, cancelAIRequest } from '../../config/gemini';
import { getErrorMessage } from '../../lib/errors';
import { toast } from '../../lib/toast';
import { getServicoNome, SERVICO_POR_ID } from '../../data/servicos';
import { buildPacienteContexto } from '../../lib/aiContext';
import { Wand2, FileText, X, Square, AlertTriangle, ClipboardPaste } from 'lucide-react';

const SYSTEM_PROMPT_SERVICO = `Você é um médico sênior com expertise em auditoria de convênios (ISSEC e IPM Saúde).
Atende pacientes de TODAS as faixas etárias — nunca assuma que o paciente é idoso.
Gere a "Indicação Clínica / Justificativa" para uma GUIA DE TERAPIA (fisioterapia, fonoaudiologia, psicologia, nutrição, terapia ocupacional ou acupuntura).

OBJETIVO ANTI-GLOSA: a justificativa deve reduzir a glosa por periodicidade. Para isso, combine SEMPRE:
1) Diagnóstico com CID-10 mais adequado;
2) Déficit FUNCIONAL objetivo (ex: déficit de marcha/equilíbrio, disfagia, perda de força, limitação de AVDs);
3) Conduta proposta: tipo de terapia, objetivos terapêuticos funcionais e mensuráveis, frequência (só se vier no campo "Frequência proposta") e reavaliação ao término do ciclo;
4) RISCO DA NÃO REALIZAÇÃO (ex: agravamento, sequela funcional irreversível, broncoaspiração, quedas, reinternação).

QUANTIDADE DE SESSÕES [CRÍTICO]: NUNCA escreva o número total de sessões na justificativa, mesmo que apareça na queixa ou no contexto. A quantidade vai em campo próprio da guia (QUANT.). Justifique pela necessidade funcional, não pelo número de sessões.

FORMATO:
- 2 a 4 linhas, clínico e objetivo, em português.
- Inclua o CID-10 ao final.
- Use terminologia médica precisa (semiologia funcional).

REGRAS DE SEGURANÇA:
- NÃO invente comorbidades, sintomas ou histórico não citados no contexto. Baseie-se apenas nas informações fornecidas.
- IDADE [CRÍTICO]: o contexto traz o campo "Idade:". Use somente o que vier nele. Se vier "NÃO INFORMADA", não escreva nem estime idade e não use descritor de faixa etária ("IDOSO", "GERIÁTRICO"). Nunca deduza a idade pela queixa ou pela terapia pedida.
- Nunca escreva na guia que um dado "não foi informado" — apenas omita a expressão.
- Se não houver frequência proposta, não mencione frequência. Não use colchetes nem campos para preencher.
- NÃO use formato SOAP, NÃO use markdown, NÃO use bullet points. Apenas o parágrafo da justificativa.`;

export default function ServicoJustificativaPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const elapsed = useElapsedTimer(isLoading);

  // Seletores por campo: useAppStore() sem seletor assina o store inteiro,
  // então qualquer campo alterado em qualquer tela re-renderizava aqui.
  const pacienteNome = useAppStore((s) => s.pacienteNome);
  const pacienteIdade = useAppStore((s) => s.pacienteIdade);
  const genero = useAppStore((s) => s.genero);
  const queixa = useAppStore((s) => s.queixa);
  const setQueixa = useAppStore((s) => s.setQueixa);
  const servicosSelecionados = useAppStore((s) => s.servicosSelecionados);
  const justificativaServicos = useAppStore((s) => s.justificativaServicos);
  const setJustificativaServicos = useAppStore((s) => s.setJustificativaServicos);
  const servicoFrequencia = useAppStore((s) => s.servicoFrequencia);
  const setIaModel = useAppStore((s) => s.setIaModel);
  const iaModel = useAppStore((s) => s.iaModel);

  // Texto-padrão da terapia escolhida (o de serviço digitado à mão não existe).
  const padrao = servicosSelecionados[0] ? SERVICO_POR_ID[servicosSelecionados[0]] : undefined;
  const aplicarPadrao = () => {
    if (!padrao) return;
    const atual = justificativaServicos.trim();
    if (atual && !confirm('Substituir a justificativa atual pelo texto-padrão?')) return;
    setJustificativaServicos(padrao.justificativaPadrao);
    toast.success(`Texto-padrão de ${padrao.nomeCurto} aplicado`);
  };
  const temColchete = /\[[^\]]*\]/.test(justificativaServicos);

  const buildContext = () => {
    const terapias = servicosSelecionados.map(getServicoNome).join(', ') || 'nenhuma selecionada';
    return `${buildPacienteContexto({ pacienteNome, pacienteIdade, genero })}
Terapias solicitadas: ${terapias}
Frequência proposta: ${servicoFrequencia.trim() || 'não definida'}
Queixa / contexto clínico: "${queixa}"`;
  };

  const gerar = async () => {
    if (!queixa.trim()) {
      setError('Informe a queixa clínica para servir de contexto.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const content = await callAI({
        prompt: buildContext(),
        systemInstruction: SYSTEM_PROMPT_SERVICO,
        onDelta: (textSoFar) => setJustificativaServicos(textSoFar),
      });
      setJustificativaServicos(content);
      setIaModel(getLastUsedModel());
      toast.success('Justificativa da terapia gerada');
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Erro ao gerar justificativa.');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-border p-5.5 space-y-5.5">
      <div className="flex flex-col gap-3.5">
        <div className="w-full">
          <label className="block text-[10px] font-bold text-neutral-text-muted uppercase tracking-wider mb-2">
            Queixa / Contexto Clínico (Sincronizado)
          </label>
          <textarea
            value={queixa}
            onChange={(e) => setQueixa(e.target.value)}
            rows={3}
            placeholder="Ex: Sequela de AVE com hemiparesia à direita e disfagia, déficit de marcha e equilíbrio, quedas recentes."
            className="w-full border border-neutral-border rounded-lg text-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 resize-none placeholder:text-neutral-text-muted leading-relaxed"
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>

        <button
          onClick={isLoading ? cancelAIRequest : gerar}
          disabled={!isLoading && !queixa.trim()}
          title={isLoading ? 'Parar a geração' : 'Gerar justificativa clínica da terapia'}
          className={`flex items-center justify-center gap-1.5 px-4.5 py-2.5 text-white text-xs font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm whitespace-nowrap self-end max-sm:w-full cursor-pointer ${
            isLoading ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          {isLoading ? <Square size={12} fill="white" /> : <Wand2 size={13} />}
          {isLoading ? `Parar${elapsed ? ` ${elapsed}s` : ''}` : 'Gerar Justificativa'}
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <FileText size={12} className="text-emerald-700" />
            <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Indicação Clínica / Justificativa da Terapia
              <span className="ml-1.5 font-normal text-gray-400 normal-case">(impressa na guia)</span>
            </label>
          </div>
          <div className="flex items-center gap-2">
            {padrao && (
              <button
                type="button"
                onClick={aplicarPadrao}
                title={`Usar o texto-padrão de ${padrao.nomeCurto} (anti-glosa)`}
                className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <ClipboardPaste size={10} />
                Texto-padrão
              </button>
            )}
            {justificativaServicos && (
              <button onClick={() => setJustificativaServicos('')} className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer" title="Limpar">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        <textarea
          value={justificativaServicos}
          onChange={(e) => setJustificativaServicos(e.target.value)}
          rows={8}
          placeholder="Justificativa da terapia... Gere com a IA ou use o texto-padrão da terapia escolhida."
          className="w-full border-2 rounded-lg text-sm py-3 px-4 focus:outline-none focus:ring-2 border-emerald-200 bg-emerald-50/30 focus:ring-emerald-300 focus:border-emerald-400 resize-y placeholder:text-gray-400 font-medium leading-relaxed"
        />
        {temColchete && (
          <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-amber-700">
            <AlertTriangle size={11} className="shrink-0" />
            Preencha ou apague os trechos entre [colchetes] antes de imprimir.
          </p>
        )}
        {iaModel && justificativaServicos && (
          <div className="flex justify-between items-center mt-1.5 text-[9px] text-gray-400">
            <span>Esta justificativa é exclusiva da aba Serviços.</span>
            <span className="font-mono">Gerado por: {iaModel}</span>
          </div>
        )}
      </div>
    </div>
  );
}

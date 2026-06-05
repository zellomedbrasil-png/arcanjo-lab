import { useState } from 'react';
import { useElapsedTimer } from '../../hooks/useElapsedTimer';
import { useAppStore } from '../../store/useAppStore';
import { callAI, getLastUsedModel } from '../../config/gemini';
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

const PRE_JUSTIFICATIVAS_LAB = [
  {
    titulo: 'Gastroenterologia — Homem',
    texto: `Paciente do sexo masculino em acompanhamento gastroenterológico, com quadro dispéptico / dor abdominal / alteração do hábito intestinal sob investigação diagnóstica. Solicito painel para avaliação da função hepatobiliar (TGO, TGP, GGT, fosfatase alcalina, bilirrubinas), função pancreática (amilase, lipase), pesquisa de Helicobacter pylori (IgG/IgM), rastreio de doença celíaca (antigliadina) e de intolerância à lactose, hemograma para investigação de anemia por perda digestiva e pesquisa de sangue oculto nas fezes conforme rastreio de neoplasia colorretal por faixa etária. Lipidograma para avaliação de esteatose hepática associada. Exames com nexo clínico direto às hipóteses diagnósticas.

CID-10: K30 (dispepsia funcional) · K29.7 (gastrite não especificada) · K21.0 (refluxo gastroesofágico com esofagite) · K25.9 (úlcera gástrica não especificada) · R10.1 (dor abdominal superior) · R10.4 (dor abdominal não especificada) · K59.0 (constipação) · K58.9 (síndrome do intestino irritável sem diarreia) · K90.0 (doença celíaca) · E73.9 (intolerância à lactose) · K76.0 (esteatose hepática) · R19.5 (alteração das fezes / sangue oculto) · D64.9 (anemia não especificada) · Z12.1 (rastreamento de neoplasia intestinal) · B98.0 (H. pylori como causa de doença)`
  },
  {
    titulo: 'Gastroenterologia — Mulher',
    texto: `Paciente do sexo feminino em acompanhamento gastroenterológico, com quadro dispéptico / dor abdominal / distensão / alteração do hábito intestinal sob investigação. Solicito painel para função hepatobiliar (TGO, TGP, GGT, fosfatase alcalina, bilirrubinas), função pancreática (amilase, lipase), pesquisa de H. pylori (IgG/IgM), rastreio de doença celíaca (antigliadina) e intolerância à lactose, hemograma para investigação de anemia por perda digestiva e pesquisa de sangue oculto nas fezes conforme rastreio colorretal. CA 125 incluído para diagnóstico diferencial de massa/distensão abdominal de causa pélvica. Exames com nexo clínico direto às hipóteses listadas.

CID-10: K30 (dispepsia funcional) · K29.7 (gastrite não especificada) · K21.0 (refluxo gastroesofágico com esofagite) · R10.1 (dor abdominal superior) · R10.4 (dor abdominal não especificada) · R19.0 (massa/tumoração intra-abdominal e pélvica) · K59.0 (constipação) · K58.9 (síndrome do intestino irritável sem diarreia) · K90.0 (doença celíaca) · E73.9 (intolerância à lactose) · K76.0 (esteatose hepática) · R19.5 (alteração das fezes / sangue oculto) · D64.9 (anemia não especificada) · Z12.1 (rastreamento de neoplasia intestinal) · B98.0 (H. pylori como causa de doença)`
  },
  {
    titulo: 'Geriatria — Homem',
    texto: `Paciente idoso (≥ 60 anos) em Avaliação Geriátrica Ampla, portador de comorbidades crônicas e em uso contínuo de medicamentos (monitorização de polifarmácia). Solicito painel para: investigação de anemia e estado nutricional (hemograma, ferritina, B12, ácido fólico, albumina); função renal e eletrolítica para ajuste de doses e vigilância de fármacos nefroativos (ureia, creatinina, sódio, potássio); rastreio metabólico e glicêmico (glicose, HbA1c, insulina, lipidograma, ácido úrico); função tireoidiana (TSH, T4 livre); metabolismo ósseo-mineral por risco de osteoporose e quedas (cálcio, vitamina D, PTH, magnésio); CK para monitorização de miopatia em uso de estatina; rastreio de próstata por faixa etária (PSA). Exames vinculados às comorbidades and ao protocolo de avaliação do idoso.

CID-10: Z00.0 (exame médico geral) · I10 (hipertensão essencial) · E11.9 (diabetes tipo 2 sem complicações) · E78.5 (hiperlipidemia) · N18.9 (doença renal crônica) · D64.9 (anemia não especificada) · E53.8 (deficiência de vitaminas do complexo B — B12/folato) · E55.9 (deficiência de vitamina D) · M81.9 (osteoporose não especificada) · E03.9 (hipotireoidismo) · Z79.8 (uso prolongado de medicamentos / polifarmácia) · E29.1 (hipofunção testicular) · N40 (hiperplasia da próstata) · Z12.5 (rastreamento de neoplasia da próstata) · R54 (senilidade)`
  },
  {
    titulo: 'Geriatria — Mulher',
    texto: `Paciente idosa (≥ 60 anos) em Avaliação Geriátrica Ampla, com comorbidades crônicas e polifarmácia. Solicito painel para: investigação de anemia e estado nutricional (hemograma, ferritina, B12, ácido fólico, albumina); função renal e eletrolítica para vigilância farmacológica (ureia, creatinina, sódio, potássio); rastreio metabólico (glicose, HbA1c, insulina, lipidograma, ácido úrico); função tireoidiana (TSH, T4 livre); metabolismo ósseo-mineral por elevado risco de osteoporose pós-menopausa e quedas (cálcio, vitamina D, PTH); avaliação hormonal no contexto de climatério/menopausa (FSH, estradiol, progesterona). Exames vinculados às comorbidades e ao protocolo de avaliação da idosa.

CID-10: Z00.0 (exame médico geral) · I10 (hipertensão essencial) · E11.9 (diabetes tipo 2 sem complicações) · E78.5 (hiperlipidemia) · N18.9 (doença renal crônica) · D64.9 (anemia não especificada) · E53.8 (deficiência de vitaminas do complexo B — B12/folato) · E55.9 (deficiência de vitamina D) · M81.0 (osteoporose pós-menopáusica) · E03.9 (hipotireoidismo) · Z79.8 (uso prolongado de medicamentos / polifarmácia) · N95.1 (estados da menopausa e climatério) · R53 (fadiga e mal-estar) · R54 (senilidade)`
  }
];

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
      const content = await callAI({
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
    <div className="bg-white rounded-lg border border-neutral-border p-5.5 space-y-5.5">
      {/* Queixa + Gerar Justificativa Button */}
      <div className="flex flex-col gap-3.5">
        <div className="w-full">
          <label className="block text-[10px] font-bold text-neutral-text-muted uppercase tracking-wider mb-2">
            Queixa / Contexto Clínico (Sincronizado)
          </label>
          <textarea
            value={queixa}
            onChange={(e) => setQueixa(e.target.value)}
            rows={3.5}
            placeholder="Ex: Paciente 78a, astenia há 2 meses, perda de 4kg, HAS e DM2. (Digitado no prontuário)"
            className={`w-full border border-neutral-border rounded-lg text-sm py-3 px-4 focus:outline-none focus:ring-2 ${theme.focusRing} resize-none placeholder:text-neutral-text-muted leading-relaxed`}
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>

        <button
          onClick={gerarJustificativa}
          disabled={isLoadingJust || !queixa.trim()}
          title={`Gerar justificativa clínica para os ${theme.title}`}
          className={`flex items-center justify-center gap-1.5 px-4.5 py-2.5 text-white text-xs font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm whitespace-nowrap self-end max-sm:w-full cursor-pointer ${theme.primaryBg}`}
        >
          {isLoadingJust ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
          {isLoadingJust ? (elapsedJust ? `${elapsedJust}s…` : '…') : 'Gerar Justificativa'}
        </button>
      </div>

      {/* Indicação Clínica Textarea */}
      <div>
        <div className="flex items-center justify-between mb-2">
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

        {isLab && (
          <div className="mb-3.5 bg-slate-50/50 rounded-xl p-3 border border-slate-100/80">
            <span className="block text-[9px] font-bold text-neutral-text-muted uppercase tracking-wider mb-2">
              Modelos Rápidos (Clique para aplicar)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {PRE_JUSTIFICATIVAS_LAB.map((item) => (
                <button
                  key={item.titulo}
                  type="button"
                  onClick={() => {
                    setJustificativaValue(item.texto);
                    toast.success(`Modelo "${item.titulo}" aplicado!`);
                  }}
                  className="px-3 py-2 text-left text-[11px] bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/70 hover:text-blue-700 rounded-lg transition-all cursor-pointer font-semibold leading-tight shadow-sm hover:shadow-none"
                >
                  {item.titulo}
                </button>
              ))}
            </div>
          </div>
        )}

        <textarea
          value={justificativaValue}
          onChange={(e) => setJustificativaValue(e.target.value)}
          rows={10}
          placeholder={`Justificativa dos ${theme.title.toLowerCase()}...`}
          className={`w-full border-2 rounded-lg text-sm py-3 px-4 focus:outline-none focus:ring-2 ${theme.borderColor} ${theme.lightBg} ${theme.focusRing} resize-y placeholder:text-gray-405 font-medium leading-relaxed`}
        />
        {iaModel && justificativaValue && (
          <div className="flex justify-between items-center mt-1.5 text-[9px] text-gray-400">
            <span>Esta justificativa é exclusiva para esta aba.</span>
            <span className="font-mono">Gerado por: {iaModel}</span>
          </div>
        )}
      </div>
    </div>
  );
}

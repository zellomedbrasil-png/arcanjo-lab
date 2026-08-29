// src/data/formulasManipuladas.ts
// Protocolos de manipulação — Geriatria, Longevidade e Gastroenterologia.
//
// Camada de curadoria clínica sobre o acervo da La Saluté: cada componente
// referencia um ativo por `ativoId`, então corrigir uma dose ou uma
// classificação regulatória no acervo propaga para todas as fórmulas.
//
// NÍVEL DE EVIDÊNCIA — o campo `evidencia` é declarado por fórmula e aparece
// no card. Ele existe para NÃO nivelar tudo por cima:
//   ALTA     — meta-análise ou RCTs consistentes para o desfecho citado.
//   MODERADA — RCTs com limitação, heterogeneidade ou desfecho substituto.
//   BAIXA    — plausibilidade mecanística, uso tradicional ou dado preliminar.
//
// Um nível BAIXA não significa "não use": significa que a conversa com o
// paciente sobre expectativa de resultado precisa ser honesta.
//
// TODAS as fórmulas exigem revisão médica antes do uso em paciente.

import type { UnidadeDose } from './ativosManipulados';
import { getAtivo, exige2Vias } from './ativosManipulados';

export type AreaFormula = 'GERIATRIA' | 'LONGEVIDADE' | 'GASTRO';

export const AREA_INFO: Record<AreaFormula, string> = {
  GERIATRIA: 'Geriatria',
  LONGEVIDADE: 'Longevidade',
  GASTRO: 'Gastroenterologia',
};

export type NivelEvidencia = 'ALTA' | 'MODERADA' | 'BAIXA';

export const EVIDENCIA_INFO: Record<NivelEvidencia, { rotulo: string; descricao: string }> = {
  ALTA: {
    rotulo: 'Evidência alta',
    descricao: 'Meta-análise ou ensaios randomizados consistentes para o desfecho citado.',
  },
  MODERADA: {
    rotulo: 'Evidência moderada',
    descricao: 'Ensaios randomizados com limitação, heterogeneidade ou desfecho substituto.',
  },
  BAIXA: {
    rotulo: 'Evidência baixa',
    descricao: 'Plausibilidade mecanística, uso tradicional ou dado clínico preliminar.',
  },
};

export type FormaFarmaceutica =
  | 'CAPSULA'
  | 'SACHE'
  | 'SOLUCAO_ORAL'
  | 'CREME'
  | 'GEL';

export const FORMA_INFO: Record<FormaFarmaceutica, { rotulo: string; unidade: string }> = {
  CAPSULA: { rotulo: 'Cápsulas', unidade: 'cápsulas' },
  SACHE: { rotulo: 'Sachês', unidade: 'sachês' },
  SOLUCAO_ORAL: { rotulo: 'Solução oral', unidade: 'mL' },
  CREME: { rotulo: 'Creme', unidade: 'g' },
  GEL: { rotulo: 'Gel', unidade: 'g' },
};

export interface ComponenteFormula {
  ativoId: string;
  dose: number;
  unidade: UnidadeDose;
}

export interface FormulaManipulada {
  id: string;
  nome: string;
  area: AreaFormula;
  indicacao: string;
  cid10?: string;
  forma: FormaFarmaceutica;
  componentes: ComponenteFormula[];
  quantidade: string;
  posologia: string;
  evidencia: NivelEvidencia;
  /** Por que estes ativos, nestas doses. */
  racional: string;
  /** Diretriz ou corpo de evidência que sustenta a fórmula. */
  referencias: string[];
  alertas?: string[];
}

export const FORMULAS: FormulaManipulada[] = [
  // ═══ GERIATRIA ══════════════════════════════════════════════════════════
  {
    id: 'geri-sarcopenia',
    nome: 'Sarcopenia — suporte anabólico',
    area: 'GERIATRIA',
    indicacao: 'Perda de massa e força muscular no idoso, associada a treino resistido',
    cid10: 'M62.5',
    forma: 'SACHE',
    componentes: [
      { ativoId: 'creatina', dose: 3, unidade: 'g' },
      { ativoId: 'hmb', dose: 3, unidade: 'g' },
      { ativoId: 'leucina', dose: 2.5, unidade: 'g' },
      { ativoId: 'vitamina-d', dose: 2000, unidade: 'UI' },
    ],
    quantidade: '30 sachês',
    posologia: 'Diluir 1 sachê em água e tomar uma vez ao dia, preferencialmente após o treino ou no almoço.',
    evidencia: 'ALTA',
    racional:
      'Creatina 3g/dia é o suplemento com melhor evidência para ganho de massa e força no idoso, mas SOMENTE quando associada a treino resistido — isolada, o efeito é pequeno. HMB tem dados favoráveis em preservação de massa magra durante repouso e catabolismo. Leucina é o gatilho de mTOR e ajuda a vencer a resistência anabólica do idoso. Vitamina D corrige o déficit que agrava fraqueza muscular e risco de queda.',
    referencias: [
      'EWGSOP2 (Consenso Europeu de Sarcopenia, 2019)',
      'Meta-análises de creatina + treino resistido em idosos (Devries & Phillips)',
      'ESPEN — recomendações de proteína e leucina no idoso',
    ],
    alertas: [
      'Sem treino resistido associado, o ganho esperado é marginal — a fórmula não substitui exercício.',
      'Creatina eleva a creatinina sérica sem lesão renal; avise o paciente e interprete com cistatina C se necessário.',
    ],
  },
  {
    id: 'geri-constipacao',
    nome: 'Constipação do idoso',
    area: 'GERIATRIA',
    indicacao: 'Constipação intestinal crônica funcional no idoso',
    cid10: 'K59.0',
    forma: 'SACHE',
    componentes: [
      { ativoId: 'psyllium', dose: 5, unidade: 'g' },
      { ativoId: 'inulina', dose: 3, unidade: 'g' },
      { ativoId: 'citrato-magnesio', dose: 200, unidade: 'mg' },
    ],
    quantidade: '30 sachês',
    posologia: 'Diluir 1 sachê em 250mL de água e tomar uma vez ao dia, pela manhã, seguido de mais um copo de água.',
    evidencia: 'ALTA',
    racional:
      'Psyllium é fibra solúvel formadora de bolo com a melhor evidência em constipação funcional, e não causa dependência do trânsito como os laxantes estimulantes. O citrato de magnésio agrega efeito osmótico leve. A inulina alimenta a microbiota, mas entra em dose baixa de propósito — acima de 5g piora distensão em quem já tem intestino sensível.',
    referencias: [
      'AGA — Diretriz de constipação crônica idiopática',
      'Revisões sistemáticas de fibra solúvel (psyllium) em constipação funcional',
    ],
    alertas: [
      'Exige ingestão hídrica adequada — sem água, o psyllium piora a constipação.',
      'Afastar 2h de outros medicamentos: a fibra reduz absorção.',
      'Cautela com magnésio se ClCr < 30.',
    ],
  },
  {
    id: 'geri-insonia',
    nome: 'Insônia no idoso',
    area: 'GERIATRIA',
    indicacao: 'Dificuldade de iniciar ou manter o sono, sem uso de benzodiazepínico',
    cid10: 'G47.0',
    forma: 'CAPSULA',
    componentes: [
      { ativoId: 'melatonina', dose: 2, unidade: 'mg' },
      { ativoId: 'magnesio-l-treonato', dose: 500, unidade: 'mg' },
      { ativoId: 'l-teanina', dose: 200, unidade: 'mg' },
      { ativoId: 'glicina', dose: 1000, unidade: 'mg' },
    ],
    quantidade: '30 cápsulas',
    posologia: 'Tomar 1 cápsula por via oral 30 a 60 minutos antes de deitar.',
    evidencia: 'MODERADA',
    racional:
      'Alternativa direta ao benzodiazepínico e ao zolpidem, que os critérios de Beers pedem para evitar no idoso por queda, fratura e declínio cognitivo. Melatonina em dose BAIXA (1–2mg) é mais eficaz que dose alta no idoso, cuja produção endógena está reduzida — o efeito é sobre latência do sono, modesto porém real. Teanina e glicina reduzem latência sem sedação residual matinal.',
    referencias: [
      'AASM — Diretriz de tratamento farmacológico da insônia crônica',
      'Critérios de Beers 2023 (AGS) — evitar benzodiazepínicos e drogas Z em idosos',
    ],
    alertas: [
      'Higiene do sono e tratamento de apneia vêm antes da fórmula.',
      'Melatonina pode interagir com varfarina e anti-hipertensivos.',
    ],
  },
  {
    id: 'geri-osteoporose',
    nome: 'Osteoporose — suporte adjuvante',
    area: 'GERIATRIA',
    indicacao: 'Adjuvante nutricional na osteopenia e osteoporose',
    cid10: 'M81',
    forma: 'CAPSULA',
    componentes: [
      { ativoId: 'calcio-quelado', dose: 500, unidade: 'mg' },
      { ativoId: 'vitamina-d', dose: 2000, unidade: 'UI' },
      { ativoId: 'vitamina-k2-mk7', dose: 100, unidade: 'mcg' },
      { ativoId: 'magnesio-quelato', dose: 200, unidade: 'mg' },
    ],
    quantidade: '60 cápsulas',
    posologia: 'Tomar 1 cápsula por via oral duas vezes ao dia, junto às refeições principais.',
    evidencia: 'ALTA',
    racional:
      'Cálcio + vitamina D é a base nutricional com evidência de redução de fratura, e é pré-requisito para iniciar bisfosfonato com segurança. Cálcio quelado é preferível ao carbonato no idoso, cuja hipocloridria (frequentemente agravada por IBP) reduz a absorção do carbonato. K2 MK7 direciona cálcio ao osso — evidência moderada, entra como adjuvante. Dose dividida porque absorção acima de 500mg por tomada cai.',
    referencias: [
      'Diretrizes da SBEM / ABRASSO para osteoporose',
      'Endocrine Society — Clinical Practice Guideline, osteoporose pós-menopausa',
    ],
    alertas: [
      'ADJUVANTE — não substitui bisfosfonato ou denosumabe quando indicados.',
      'Vitamina K2 é CONTRAINDICADA em uso de varfarina.',
      'Corrigir vitamina D antes de iniciar bisfosfonato, sob risco de hipocalcemia.',
    ],
  },
  {
    id: 'geri-anemia-ferropriva',
    nome: 'Anemia ferropriva',
    area: 'GERIATRIA',
    indicacao: 'Reposição de ferro na anemia por deficiência, com cofatores hematopoéticos',
    cid10: 'D50.9',
    forma: 'CAPSULA',
    componentes: [
      { ativoId: 'ferro-quelado', dose: 30, unidade: 'mg' },
      { ativoId: 'vitamina-c', dose: 250, unidade: 'mg' },
      { ativoId: 'metilfolato', dose: 400, unidade: 'mcg' },
      { ativoId: 'metilcobalamina', dose: 1000, unidade: 'mcg' },
    ],
    quantidade: '30 cápsulas',
    posologia: 'Tomar 1 cápsula por via oral em dias alternados, 1 hora antes do almoço.',
    evidencia: 'ALTA',
    racional:
      'A posologia em DIAS ALTERNADOS não é economia: doses diárias elevam a hepcidina e reduzem a absorção da dose seguinte — o esquema alternado absorve mais ferro total e causa menos efeito digestivo. Ferro quelado é mais bem tolerado que o sulfato. Vitamina C aumenta a absorção do ferro não-heme. B12 e folato entram porque a deficiência mista é comum no idoso.',
    referencias: [
      'Estudos de Moretti/Stoffel sobre hepcidina e dose em dias alternados',
      'WHO / diretrizes de manejo da anemia ferropriva',
    ],
    alertas: [
      'Anemia ferropriva no idoso EXIGE investigar perda digestiva — a fórmula trata o laboratório, não a causa.',
      'Afastar de cálcio, IBP, levotiroxina e antiácidos.',
    ],
  },
  {
    id: 'geri-fadiga',
    nome: 'Fadiga e fragilidade',
    area: 'GERIATRIA',
    indicacao: 'Fadiga persistente e baixa energia no idoso, com causas secundárias afastadas',
    cid10: 'R53',
    forma: 'CAPSULA',
    componentes: [
      { ativoId: 'coenzima-q10', dose: 150, unidade: 'mg' },
      { ativoId: 'malato-magnesio-blend', dose: 400, unidade: 'mg' },
      { ativoId: 'acetil-l-carnitina', dose: 500, unidade: 'mg' },
      { ativoId: 'metilcobalamina', dose: 1000, unidade: 'mcg' },
    ],
    quantidade: '60 cápsulas',
    posologia: 'Tomar 1 cápsula por via oral duas vezes ao dia, pela manhã e no almoço.',
    evidencia: 'MODERADA',
    racional:
      'CoQ10 tem justificativa mais forte em quem usa estatina, situação em que a depleção é documentada e a mialgia é queixa comum. Acetil-L-carnitina tem ensaios em fadiga do idoso com efeito modesto. Magnésio e B12 corrigem deficiências prevalentes e frequentemente não rastreadas.',
    referencias: [
      'Ensaios de acetil-L-carnitina em fadiga em idosos (Malaguarnera)',
      'Revisões de CoQ10 em miopatia associada a estatina',
    ],
    alertas: [
      'Antes da fórmula: afastar anemia, hipotireoidismo, depressão, apneia do sono e efeito de medicação.',
      'CoQ10 pode reduzir o efeito da varfarina.',
    ],
  },
  {
    id: 'geri-articular',
    nome: 'Osteoartrite — suporte articular',
    area: 'GERIATRIA',
    indicacao: 'Dor e rigidez articular na osteoartrite, poupando AINE',
    cid10: 'M19.9',
    forma: 'CAPSULA',
    componentes: [
      { ativoId: 'colageno-tipo-ii', dose: 40, unidade: 'mg' },
      { ativoId: 'msm', dose: 1000, unidade: 'mg' },
      { ativoId: 'boswellia', dose: 300, unidade: 'mg' },
      { ativoId: 'curcuma', dose: 500, unidade: 'mg' },
      { ativoId: 'piperina', dose: 10, unidade: 'mg' },
    ],
    quantidade: '60 cápsulas',
    posologia: 'Tomar 1 cápsula por via oral duas vezes ao dia, após as refeições.',
    evidencia: 'MODERADA',
    racional:
      'O valor principal é poupar AINE, que os critérios de Beers desaconselham cronicamente no idoso por sangramento digestivo, lesão renal e descompensação de HAS e IC. Curcumina tem ensaios com efeito comparável ao ibuprofeno em osteoartrite de joelho, e a piperina entra porque a curcumina isolada tem biodisponibilidade baixa. Colágeno tipo II não desnaturado age por tolerância oral, em dose baixa.',
    referencias: [
      'ACR/AF — Diretriz de manejo da osteoartrite',
      'Ensaios de curcumina vs. ibuprofeno em OA de joelho (Kuptniratsaikul)',
      'Critérios de Beers 2023 — AINE sistêmico crônico no idoso',
    ],
    alertas: [
      'Curcumina e boswellia podem potencializar anticoagulantes.',
      'Piperina inibe CYP3A4 e pode elevar níveis de outros fármacos em uso.',
    ],
  },
  {
    id: 'geri-cognitivo',
    nome: 'Suporte cognitivo',
    area: 'GERIATRIA',
    indicacao: 'Queixa subjetiva de memória, sem demência estabelecida',
    cid10: 'R41.3',
    forma: 'CAPSULA',
    componentes: [
      { ativoId: 'alfa-gpc', dose: 300, unidade: 'mg' },
      { ativoId: 'fosfatidilserina', dose: 100, unidade: 'mg' },
      { ativoId: 'bacopa', dose: 300, unidade: 'mg' },
      { ativoId: 'omega-3', dose: 1000, unidade: 'mg' },
    ],
    quantidade: '60 cápsulas',
    posologia: 'Tomar 1 cápsula por via oral duas vezes ao dia, junto às refeições.',
    evidencia: 'BAIXA',
    racional:
      'Declarada BAIXA de propósito. Nenhum destes ativos tem evidência de prevenir ou tratar demência; os ensaios mostram, na melhor das hipóteses, efeitos pequenos em desfechos cognitivos substitutos, em populações heterogêneas. Bacopa é a de melhor dado, e ainda assim exige 8–12 semanas para qualquer efeito. Entra como suporte quando o paciente insiste em "algo para a memória", com expectativa alinhada.',
    referencias: [
      'Revisões sistemáticas de Bacopa monnieri em cognição',
      'Ensaios de fosfatidilserina em declínio cognitivo associado à idade',
    ],
    alertas: [
      'NÃO é tratamento de doença de Alzheimer — não substitui anticolinesterásico quando indicado.',
      'Queixa de memória exige investigação formal antes de suplemento.',
      'Ginkgo, se acrescentado, aumenta risco de sangramento com antiagregantes.',
    ],
  },

  // ═══ LONGEVIDADE ════════════════════════════════════════════════════════
  {
    id: 'longev-cardiometabolico',
    nome: 'Proteção cardiometabólica',
    area: 'LONGEVIDADE',
    indicacao: 'Suporte cardiovascular e controle de triglicérides',
    cid10: 'E78.1',
    forma: 'CAPSULA',
    componentes: [
      { ativoId: 'omega-3', dose: 1000, unidade: 'mg' },
      { ativoId: 'coenzima-q10', dose: 100, unidade: 'mg' },
      { ativoId: 'magnesio-taurato', dose: 200, unidade: 'mg' },
      { ativoId: 'vitamina-k2-mk7', dose: 100, unidade: 'mcg' },
    ],
    quantidade: '60 cápsulas',
    posologia: 'Tomar 1 cápsula por via oral duas vezes ao dia, junto às refeições.',
    evidencia: 'ALTA',
    racional:
      'Ômega-3 tem evidência sólida para REDUÇÃO DE TRIGLICÉRIDES — este é o desfecho honesto. O benefício em eventos cardiovasculares é bem mais controverso e depende de dose e formulação. Prescrever pelo teor de EPA+DHA, não pelo peso do óleo. CoQ10 faz sentido especialmente em uso de estatina. Magnésio taurato tem boa tolerância e dados em pressão arterial.',
    referencias: [
      'AHA — Science Advisory sobre ômega-3 e triglicérides',
      'Diretriz Brasileira de Dislipidemias (SBC)',
    ],
    alertas: [
      'Vitamina K2 CONTRAINDICADA em uso de varfarina.',
      'Doses altas de ômega-3 associam-se a maior incidência de fibrilação atrial.',
    ],
  },
  {
    id: 'longev-resistencia-insulinica',
    nome: 'Resistência insulínica',
    area: 'LONGEVIDADE',
    indicacao: 'Resistência à insulina, pré-diabetes e síndrome metabólica',
    cid10: 'R73.0',
    forma: 'CAPSULA',
    componentes: [
      { ativoId: 'berberina', dose: 500, unidade: 'mg' },
      { ativoId: 'inositol', dose: 1000, unidade: 'mg' },
      { ativoId: 'picolinato-cromo', dose: 200, unidade: 'mcg' },
      { ativoId: 'acido-alfa-lipoico', dose: 300, unidade: 'mg' },
    ],
    quantidade: '90 cápsulas',
    posologia: 'Tomar 1 cápsula por via oral três vezes ao dia, 20 minutos antes das refeições principais.',
    evidencia: 'MODERADA',
    racional:
      'Berberina é o ativo com melhor dado deste grupo: meta-análises mostram redução de glicemia e HbA1c com magnitude próxima à da metformina em DM2, embora com estudos majoritariamente pequenos e de origem concentrada. Inositol tem evidência específica em SOP. Divisão em três tomadas é necessária pela meia-vida curta da berberina.',
    referencias: [
      'Meta-análises de berberina em DM2 e síndrome metabólica',
      'Ensaios de mio-inositol em SOP e resistência insulínica',
    ],
    alertas: [
      'Berberina inibe CYP3A4 e P-gp — revisar TODA a lista de medicamentos do paciente.',
      'Pode potencializar hipoglicemiantes: ajustar e monitorar glicemia.',
      'Não substitui metformina quando há indicação formal.',
    ],
  },
  {
    id: 'longev-estresse',
    nome: 'Estresse e adaptação',
    area: 'LONGEVIDADE',
    indicacao: 'Estresse percebido elevado, tensão e fadiga adaptativa',
    cid10: 'F43.9',
    forma: 'CAPSULA',
    componentes: [
      { ativoId: 'withania', dose: 300, unidade: 'mg' },
      { ativoId: 'rhodiola', dose: 200, unidade: 'mg' },
      { ativoId: 'l-teanina', dose: 200, unidade: 'mg' },
      { ativoId: 'magnesio-quelato', dose: 200, unidade: 'mg' },
    ],
    quantidade: '60 cápsulas',
    posologia: 'Tomar 1 cápsula por via oral duas vezes ao dia, pela manhã e no fim da tarde.',
    evidencia: 'MODERADA',
    racional:
      'Ashwagandha é o adaptógeno com melhores ensaios: reduz escores de estresse percebido e cortisol sérico em RCTs de 8 semanas, ainda que com amostras pequenas. Rodiola tem dados em fadiga associada a estresse. Teanina agrega relaxamento sem sedação, permitindo uso diurno.',
    referencias: [
      'RCTs de Withania somnifera em estresse e cortisol (Chandrasekhar, Salve)',
      'Revisões de Rhodiola rosea em fadiga',
    ],
    alertas: [
      'Há relatos de hepatotoxicidade idiossincrática com ashwagandha — suspender se icterícia ou elevação de transaminases.',
      'Cautela em doença tireoidiana (pode elevar T4) e em autoimunidade.',
      'Não é tratamento de transtorno de ansiedade ou depressão estabelecidos.',
    ],
  },
  {
    id: 'longev-imunidade',
    nome: 'Suporte imunológico',
    area: 'LONGEVIDADE',
    indicacao: 'Suporte imune, especialmente em deficiências nutricionais documentadas',
    cid10: 'Z00.0',
    forma: 'CAPSULA',
    componentes: [
      { ativoId: 'vitamina-d', dose: 2000, unidade: 'UI' },
      { ativoId: 'zinco-quelato', dose: 25, unidade: 'mg' },
      { ativoId: 'vitamina-c', dose: 500, unidade: 'mg' },
      { ativoId: 'selenio-quelado', dose: 100, unidade: 'mcg' },
      { ativoId: 'cobre-quelado', dose: 1, unidade: 'mg' },
    ],
    quantidade: '30 cápsulas',
    posologia: 'Tomar 1 cápsula por via oral ao dia, junto a uma refeição.',
    evidencia: 'MODERADA',
    racional:
      'O benefício imune destes micronutrientes é consistente em quem tem DEFICIÊNCIA — em repleto, o ganho é pequeno. Por isso a fórmula é mais defensável com dosagem prévia de vitamina D e zinco. O cobre entra deliberadamente: zinco isolado e prolongado acima de 40mg/dia induz deficiência de cobre, um erro comum em fórmulas de imunidade.',
    referencias: [
      'Revisões Cochrane de vitamina D e infecção respiratória',
      'Estudos de zinco em duração de infecção de vias aéreas superiores',
    ],
    alertas: [
      'Selênio tem janela estreita — não associar a outras fontes sem somar as doses.',
      'Dosar 25-OH-vitamina D antes e após 8–12 semanas.',
    ],
  },
  {
    id: 'longev-pele-colageno',
    nome: 'Pele e colágeno',
    area: 'LONGEVIDADE',
    indicacao: 'Elasticidade cutânea, hidratação e sinais de fotoenvelhecimento',
    cid10: 'L98.9',
    forma: 'SACHE',
    componentes: [
      { ativoId: 'verisol', dose: 2.5, unidade: 'g' },
      { ativoId: 'acido-hialuronico-interno', dose: 120, unidade: 'mg' },
      { ativoId: 'vitamina-c', dose: 250, unidade: 'mg' },
      { ativoId: 'silicio-organico', dose: 20, unidade: 'mg' },
    ],
    quantidade: '30 sachês',
    posologia: 'Diluir 1 sachê em água e tomar uma vez ao dia.',
    evidencia: 'MODERADA',
    racional:
      'Verisol é um dos poucos peptídeos de colágeno com RCTs próprios mostrando melhora de elasticidade e rugas periorbitais em 8 semanas. Vitamina C não é acessório: é cofator obrigatório da prolil-hidroxilase na síntese de colágeno — colágeno sem vitamina C é incompleto.',
    referencias: [
      'RCTs de peptídeos bioativos de colágeno (Proksch) em elasticidade e rugas',
      'Revisões de ácido hialurônico oral em hidratação cutânea',
    ],
    alertas: ['Fotoproteção tem efeito muito maior que qualquer fórmula oral no fotoenvelhecimento.'],
  },
  {
    id: 'longev-peso',
    nome: 'Controle de peso — adjuvante',
    area: 'LONGEVIDADE',
    indicacao: 'Adjuvante de saciedade em programa de perda de peso',
    cid10: 'E66.9',
    forma: 'CAPSULA',
    componentes: [
      { ativoId: 'glucomannan', dose: 1000, unidade: 'mg' },
      { ativoId: 'egcg', dose: 200, unidade: 'mg' },
      { ativoId: 'picolinato-cromo', dose: 200, unidade: 'mcg' },
      { ativoId: 'morosil', dose: 400, unidade: 'mg' },
    ],
    quantidade: '60 cápsulas',
    posologia: 'Tomar 1 cápsula por via oral duas vezes ao dia, 30 minutos antes do almoço e do jantar, com um copo cheio de água.',
    evidencia: 'MODERADA',
    racional:
      'Glucomannan é a fibra mais viscosa disponível e tem os melhores dados de saciedade do grupo; o efeito depende de ser tomado ANTES da refeição com água suficiente. Morosil tem RCT próprio em circunferência abdominal. A magnitude realista de perda é pequena — a fórmula é adjuvante de dieta e exercício, não substituto.',
    referencias: [
      'Revisões sistemáticas de glucomannan em saciedade e peso',
      'RCT de extrato de laranja moro (Morosil) em composição corporal',
    ],
    alertas: [
      'Glucomannan SEM água adequada pode causar obstrução esofágica — orientação obrigatória ao paciente.',
      'EGCG em altas doses tem relatos de hepatotoxicidade: não ultrapassar 800mg/dia.',
      'Afastar 2h de outros medicamentos.',
    ],
  },
  {
    id: 'longev-mitocondrial',
    nome: 'Suporte mitocondrial',
    area: 'LONGEVIDADE',
    indicacao: 'Suporte à função mitocondrial e ao metabolismo energético',
    cid10: 'R53',
    forma: 'CAPSULA',
    componentes: [
      { ativoId: 'nad', dose: 250, unidade: 'mg' },
      { ativoId: 'coenzima-q10', dose: 150, unidade: 'mg' },
      { ativoId: 'acido-alfa-lipoico', dose: 300, unidade: 'mg' },
      { ativoId: 'acetil-l-carnitina', dose: 500, unidade: 'mg' },
    ],
    quantidade: '60 cápsulas',
    posologia: 'Tomar 1 cápsula por via oral duas vezes ao dia, pela manhã e no almoço.',
    evidencia: 'BAIXA',
    racional:
      'Declarada BAIXA com franqueza. A biologia é atraente e os precursores de NAD+ realmente elevam NAD+ tecidual em humanos — mas os desfechos CLÍNICOS (função, disposição, longevidade) não estão demonstrados. Os ensaios existentes são curtos, pequenos e de desfecho substituto. É uma fórmula de mecanismo, não de resultado comprovado, e o paciente deve saber disso.',
    referencias: [
      'Ensaios de nicotinamida ribosídeo/NMN em NAD+ sérico (Martens, Airhart)',
      'Revisões críticas sobre precursores de NAD+ e envelhecimento humano',
    ],
    alertas: [
      'Custo elevado para benefício clínico não demonstrado — alinhe expectativa antes de prescrever.',
      'CoQ10 pode reduzir o efeito da varfarina.',
    ],
  },
  {
    id: 'longev-antioxidante',
    nome: 'Antioxidante e senescência',
    area: 'LONGEVIDADE',
    indicacao: 'Suporte antioxidante e modulação de estresse oxidativo',
    cid10: 'Z00.0',
    forma: 'CAPSULA',
    componentes: [
      { ativoId: 'resveratrol', dose: 250, unidade: 'mg' },
      { ativoId: 'quercetina', dose: 500, unidade: 'mg' },
      { ativoId: 'cucumis-melo', dose: 140, unidade: 'mg' },
      { ativoId: 'curcuma', dose: 500, unidade: 'mg' },
      { ativoId: 'piperina', dose: 10, unidade: 'mg' },
    ],
    quantidade: '30 cápsulas',
    posologia: 'Tomar 1 cápsula por via oral ao dia, junto a uma refeição com gordura.',
    evidencia: 'BAIXA',
    racional:
      'A hipótese senolítica (quercetina, resveratrol) vem de modelos animais e de estudos-piloto muito pequenos em humanos; não há desfecho clínico estabelecido. Resveratrol tem biodisponibilidade oral baixa. Tomar com gordura melhora a absorção dos polifenóis. Fórmula de plausibilidade mecanística.',
    referencias: [
      'Estudos-piloto de dasatinibe + quercetina como senolíticos (Justice, Hickson)',
      'Revisões críticas de resveratrol em humanos',
    ],
    alertas: [
      'Quercetina e curcumina inibem CYP3A4 — risco real de interação em polifarmácia.',
      'Podem potencializar anticoagulantes.',
    ],
  },

  // ═══ GASTROENTEROLOGIA ══════════════════════════════════════════════════
  {
    id: 'gastro-disbiose-atb',
    nome: 'Diarreia associada a antibiótico',
    area: 'GASTRO',
    indicacao: 'Prevenção e tratamento de diarreia associada ao uso de antibióticos',
    cid10: 'A04.7',
    forma: 'CAPSULA',
    componentes: [
      { ativoId: 'saccharomyces-boulardii', dose: 250, unidade: 'mg' },
      { ativoId: 'lactobacillus-rhamnosus', dose: 5000000000, unidade: 'UFC' },
      { ativoId: 'fos', dose: 2, unidade: 'g' },
    ],
    quantidade: '20 cápsulas',
    posologia: 'Tomar 1 cápsula por via oral de 12 em 12 horas, iniciando junto com o antibiótico e mantendo por 7 dias após o término.',
    evidencia: 'ALTA',
    racional:
      'S. boulardii e L. rhamnosus GG são as duas cepas com melhor evidência de meta-análise para prevenção de diarreia associada a antibiótico, incluindo redução de recorrência de C. difficile. Por ser levedura, o S. boulardii não é morto pelo antibiótico — pode ser tomado junto. Iniciar no primeiro dia do antibiótico é o que define o benefício.',
    referencias: [
      'Meta-análises Cochrane de probióticos na prevenção de diarreia associada a antibiótico',
      'ACG — Diretriz de infecção por C. difficile',
    ],
    alertas: [
      'CONTRAINDICADO em imunossupressão grave e em portadores de cateter venoso central — risco de fungemia por S. boulardii.',
    ],
  },
  {
    id: 'gastro-constipacao-funcional',
    nome: 'Constipação funcional',
    area: 'GASTRO',
    indicacao: 'Constipação intestinal funcional em adultos',
    cid10: 'K59.0',
    forma: 'SACHE',
    componentes: [
      { ativoId: 'psyllium', dose: 5, unidade: 'g' },
      { ativoId: 'polidextrose', dose: 6, unidade: 'g' },
      { ativoId: 'citrato-magnesio', dose: 300, unidade: 'mg' },
    ],
    quantidade: '30 sachês',
    posologia: 'Diluir 1 sachê em 250mL de água e tomar uma vez ao dia, seguido de mais um copo de água.',
    evidencia: 'ALTA',
    racional:
      'Psyllium é primeira linha nas diretrizes de constipação funcional. A polidextrose foi escolhida no lugar da inulina de propósito: é prebiótica com muito menos produção de gás, o que importa quando há distensão associada. Magnésio agrega efeito osmótico.',
    referencias: [
      'AGA — Diretriz de constipação crônica idiopática',
      'ACG — Manejo de constipação funcional',
    ],
    alertas: [
      'Cautela com magnésio se ClCr < 30.',
      'Constipação de início recente em maior de 50 anos exige investigação antes de tratar.',
    ],
  },
  {
    id: 'gastro-lactose',
    nome: 'Intolerância à lactose',
    area: 'GASTRO',
    indicacao: 'Reposição enzimática na intolerância à lactose',
    cid10: 'E73.9',
    forma: 'CAPSULA',
    componentes: [{ ativoId: 'lactase', dose: 10000, unidade: 'UI' }],
    quantidade: '60 cápsulas',
    posologia: 'Tomar 1 cápsula por via oral imediatamente antes de cada refeição que contenha lactose.',
    evidencia: 'ALTA',
    racional:
      'Reposição enzimática direta: a lactase exógena hidrolisa a lactose no lúmen, e o efeito é dose-dependente e imediato. Fórmula deliberadamente de ativo único — associar probiótico ou fibra aqui não agrega e encarece. O timing é o que determina a eficácia: tomar junto ao primeiro bocado.',
    referencias: [
      'NIH Consensus — manejo da intolerância à lactose',
      'Revisões de suplementação de lactase exógena',
    ],
    alertas: [
      'Não serve para alergia à proteína do leite — mecanismo completamente diferente.',
    ],
  },
  {
    id: 'gastro-sii',
    nome: 'Síndrome do intestino irritável',
    area: 'GASTRO',
    indicacao: 'Sintomas de SII com predomínio de dor e distensão',
    cid10: 'K58.9',
    forma: 'CAPSULA',
    componentes: [
      { ativoId: 'bifidobacterium-infantis', dose: 1000000000, unidade: 'UFC' },
      { ativoId: 'lactobacillus-plantarum', dose: 5000000000, unidade: 'UFC' },
      { ativoId: 'l-glutamina', dose: 3, unidade: 'g' },
    ],
    quantidade: '60 cápsulas',
    posologia: 'Tomar 1 cápsula por via oral de 12 em 12 horas, em jejum.',
    evidencia: 'MODERADA',
    racional:
      'B. infantis 35624 e L. plantarum 299v são as cepas com ensaios específicos em SII, com melhora de dor e distensão. A glutamina tem RCT em SII pós-infecciosa com aumento de permeabilidade. Note a ausência deliberada de inulina ou FOS em dose alta: prebiótico fermentável costuma PIORAR distensão em SII.',
    referencias: [
      'ACG — Clinical Guideline: Management of Irritable Bowel Syndrome',
      'RCT de L-glutamina em SII pós-infecciosa (Zhou)',
      'Ensaios de B. infantis 35624 em SII',
    ],
    alertas: [
      'O efeito de probiótico em SII é cepa-específico — trocar a cepa invalida a evidência.',
      'Dieta baixa em FODMAP tem efeito maior que qualquer suplemento nesta indicação.',
    ],
  },
  {
    id: 'gastro-insuficiencia-digestiva',
    nome: 'Insuficiência digestiva',
    area: 'GASTRO',
    indicacao: 'Dispepsia com plenitude pós-prandial e má digestão',
    cid10: 'K30',
    forma: 'CAPSULA',
    componentes: [
      { ativoId: 'pancreatina', dose: 300, unidade: 'mg' },
      { ativoId: 'bromelaina', dose: 200, unidade: 'mg' },
      { ativoId: 'papaina', dose: 100, unidade: 'mg' },
      { ativoId: 'betaina', dose: 500, unidade: 'mg' },
    ],
    quantidade: '60 cápsulas',
    posologia: 'Tomar 1 cápsula por via oral no início do almoço e do jantar.',
    evidencia: 'MODERADA',
    racional:
      'Reposição enzimática ampla para queixa de má digestão. Betaína apoia a acidificação gástrica, relevante no idoso com hipocloridria e em uso crônico de IBP. Tomar no INÍCIO da refeição é condição para funcionar — enzima tomada depois pega o bolo já formado.',
    referencias: [
      'Diretrizes de insuficiência pancreática exócrina',
      'Revisões de enzimas digestivas em dispepsia funcional',
    ],
    alertas: [
      'Insuficiência pancreática verdadeira exige dose bem maior de lipase e prescrição específica.',
      'Bromelaína pode potencializar anticoagulantes.',
      'Betaína é contraindicada se houver úlcera péptica ativa.',
    ],
  },
  {
    id: 'gastro-esteatose',
    nome: 'Esteatose hepática (MASLD)',
    area: 'GASTRO',
    indicacao: 'Suporte adjuvante na doença hepática gordurosa metabólica',
    cid10: 'K76.0',
    forma: 'CAPSULA',
    componentes: [
      { ativoId: 'silimarina', dose: 300, unidade: 'mg' },
      { ativoId: 'n-acetilcisteina', dose: 600, unidade: 'mg' },
      { ativoId: 'omega-3', dose: 1000, unidade: 'mg' },
      { ativoId: 'vitamina-e', dose: 400, unidade: 'UI' },
    ],
    quantidade: '60 cápsulas',
    posologia: 'Tomar 1 cápsula por via oral duas vezes ao dia, junto às refeições.',
    evidencia: 'MODERADA',
    racional:
      'Vitamina E 400–800 UI é o item com melhor respaldo: aparece nas diretrizes para MASH comprovada por biópsia em NÃO diabéticos (ensaio PIVENS). Ômega-3 reduz triglicérides e conteúdo de gordura hepática. Silimarina e NAC têm dados mais fracos, de enzimas hepáticas. Nada aqui rivaliza com perda de 7–10% do peso, que é o tratamento de fato.',
    referencias: [
      'AASLD — Practice Guidance on MASLD/NAFLD',
      'Ensaio PIVENS (vitamina E em NASH)',
    ],
    alertas: [
      'ADJUVANTE — perda de peso e atividade física são o tratamento principal.',
      'Vitamina E em dose alta: cautela em homens (sinal de câncer de próstata no SELECT) e em anticoagulados.',
      'A evidência de vitamina E é para não diabéticos com MASH por biópsia.',
    ],
  },
  {
    id: 'gastro-dispepsia',
    nome: 'Dispepsia funcional',
    area: 'GASTRO',
    indicacao: 'Dispepsia funcional com plenitude e esvaziamento gástrico lento',
    cid10: 'K30',
    forma: 'CAPSULA',
    componentes: [
      { ativoId: 'gengibre', dose: 500, unidade: 'mg' },
      { ativoId: 'alcachofra', dose: 320, unidade: 'mg' },
      { ativoId: 'carqueja', dose: 200, unidade: 'mg' },
      { ativoId: 'bromelaina', dose: 150, unidade: 'mg' },
    ],
    quantidade: '60 cápsulas',
    posologia: 'Tomar 1 cápsula por via oral 20 minutos antes do almoço e do jantar.',
    evidencia: 'MODERADA',
    racional:
      'Gengibre tem ensaios em aceleração do esvaziamento gástrico e efeito antiemético, útil no subtipo de plenitude pós-prandial. Alcachofra tem RCT em dispepsia funcional com melhora de sintomas globais e efeito colerético. Alternativa ao procinético em uso prolongado — relevante porque metoclopramida é critério de Beers no idoso.',
    referencias: [
      'ACG/CAG — Clinical Guideline: Management of Dyspepsia',
      'RCT de extrato de alcachofra em dispepsia funcional (Holtmann)',
    ],
    alertas: [
      'Afastar H. pylori e sinais de alarme antes de tratar como funcional.',
      'Alcachofra é contraindicada em obstrução biliar.',
      'Gengibre em dose alta pode potencializar anticoagulantes.',
    ],
  },
  {
    id: 'gastro-barreira-intestinal',
    nome: 'Barreira intestinal',
    area: 'GASTRO',
    indicacao: 'Suporte à integridade da mucosa intestinal',
    cid10: 'K63.9',
    forma: 'SACHE',
    componentes: [
      { ativoId: 'l-glutamina', dose: 5, unidade: 'g' },
      { ativoId: 'zinco-quelato', dose: 15, unidade: 'mg' },
      { ativoId: 'l-treonina', dose: 500, unidade: 'mg' },
      { ativoId: 'xos', dose: 1, unidade: 'g' },
    ],
    quantidade: '30 sachês',
    posologia: 'Diluir 1 sachê em água e tomar uma vez ao dia, em jejum.',
    evidencia: 'BAIXA',
    racional:
      'Declarada BAIXA porque "permeabilidade intestinal aumentada" como entidade clínica isolada não é diagnóstico estabelecido, e os desfechos dos estudos são marcadores laboratoriais, não sintomas ou evolução. A glutamina é o substrato energético do enterócito e o zinco tem papel documentado nas tight junctions — a base é mecanística. XOS entra em dose baixa por ser prebiótico eficaz sem gerar muito gás.',
    referencias: [
      'Revisões sobre glutamina e função de barreira intestinal',
      'Estudos de zinco e integridade de tight junctions',
    ],
    alertas: [
      'Não use como explicação para sintomas sem investigação — afaste doença celíaca, DII e SII antes.',
      'Cautela com glutamina em hepatopatia grave.',
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const POR_ID = new Map(FORMULAS.map((f) => [f.id, f]));

export function getFormula(id: string): FormulaManipulada | undefined {
  return POR_ID.get(id);
}

/**
 * True quando a fórmula obriga receita em 2 vias — basta UM componente C1/C5.
 * A regra vive aqui e no acervo; nenhuma tela decide isso por conta própria.
 */
export function formulaExige2Vias(componentes: ComponenteFormula[]): boolean {
  return componentes.some((c) => {
    const ativo = getAtivo(c.ativoId);
    return ativo ? exige2Vias(ativo) : false;
  });
}

/** Texto do motivo legal, para exibir na tela e explicar as 2 vias. */
export function motivosControleEspecial(componentes: ComponenteFormula[]): string[] {
  return componentes
    .map((c) => getAtivo(c.ativoId))
    .filter((a): a is NonNullable<typeof a> => !!a && exige2Vias(a))
    .map((a) => `${a.nome}: ${a.alertaLegal ?? 'exige receita em 2 vias.'}`);
}

/** Nomes dos ativos concatenados — alimenta a busca por ativo na biblioteca. */
export function getAtivoNomes(componentes: ComponenteFormula[]): string {
  return componentes
    .map((c) => {
      const ativo = getAtivo(c.ativoId);
      return ativo ? `${ativo.nome} ${ativo.sinonimos.join(' ')}` : c.ativoId;
    })
    .join(' ');
}

/** Composição em texto plano — usada na impressão e na cópia rápida. */
export function composicaoTexto(componentes: ComponenteFormula[]): string {
  return componentes
    .map((c) => {
      const ativo = getAtivo(c.ativoId);
      const nome = ativo?.nome ?? c.ativoId;
      return `${nome} — ${c.dose} ${c.unidade}`;
    })
    .join('\n');
}

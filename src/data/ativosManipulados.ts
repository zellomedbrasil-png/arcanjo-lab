// src/data/ativosManipulados.ts
// Acervo de matérias-primas da La Saluté Pharmacy
// (Av. Barão de Studart, 1160 — Aldeota, Fortaleza-CE).
//
// Fonte: "Acervo de Matérias-primas da La Saluté Pharmacy" (PDF, 18 págs).
//
// DUAS CORREÇÕES em relação ao PDF de origem, que traz erros de copiar-e-colar:
//   - Cranberry: no PDF está com a descrição do Cordia ecalyculata ("chá-de-bugre,
//     emagrecimento, diurético"). O correto é proantocianidinas para trato urinário.
//   - Ferro quelado: no PDF está com a descrição do feno-grego ("controle da
//     glicemia e aumento de testosterona"). O correto é reposição em anemia.
//
// `regulacao` é a FONTE ÚNICA da verdade sobre o tipo de receita: se qualquer
// componente de uma fórmula for C1 ou C5, a receita inteira sai em 2 vias.
// A classificação é atribuição MANUAL — ao revisar, edite aqui.
//
// As faixas doseUsualMin/Max são referência de conferência, NÃO trava: o
// montador avisa quando a dose sai da faixa, mas quem decide é o médico.

export type ClasseAtivo =
  | 'VITAMINA_MINERAL'
  | 'AMINOACIDO'
  | 'PROBIOTICO'
  | 'PREBIOTICO_FIBRA'
  | 'ENZIMA_DIGESTIVA'
  | 'FITOTERAPICO'
  | 'ANTIOXIDANTE'
  | 'NOOTROPICO'
  | 'HORMONIO'
  | 'FARMACO'
  | 'LIPIDIO';

/** Rótulos curtos das classes — usados nos filtros da UI. */
export const CLASSE_INFO: Record<ClasseAtivo, string> = {
  VITAMINA_MINERAL: 'Vitaminas e Minerais',
  AMINOACIDO: 'Aminoácidos e Peptídeos',
  PROBIOTICO: 'Probióticos',
  PREBIOTICO_FIBRA: 'Prebióticos e Fibras',
  ENZIMA_DIGESTIVA: 'Enzimas Digestivas',
  FITOTERAPICO: 'Fitoterápicos',
  ANTIOXIDANTE: 'Antioxidantes',
  NOOTROPICO: 'Nootrópicos',
  HORMONIO: 'Hormônios',
  FARMACO: 'Fármacos',
  LIPIDIO: 'Lipídios e Óleos',
};

/** Como o ativo é regulado no Brasil — decide se a receita sai em 2 vias. */
export type RegulacaoAtivo =
  | 'LIVRE'           // suplemento / fitoterápico — receita simples
  | 'PRESCRICAO'      // fármaco de prescrição (tarja vermelha) — receita simples
  | 'C1'              // Portaria 344/98 lista C1 → Receita de Controle Especial, 2 vias
  | 'C5'              // anabolizante, lista C5 → Notificação de Receita
  | 'HORMONIO'        // hormônio: receita simples, mas exige alerta
  | 'RESTRICAO_CFM';  // uso restrito por resolução CFM / alerta ANVISA

/** Rótulo do selo exibido no card do ativo. */
export const REGULACAO_INFO: Record<RegulacaoAtivo, { rotulo: string; exige2Vias: boolean }> = {
  LIVRE: { rotulo: '', exige2Vias: false },
  PRESCRICAO: { rotulo: 'PRESCRIÇÃO', exige2Vias: false },
  C1: { rotulo: 'C1 · 2 VIAS', exige2Vias: true },
  C5: { rotulo: 'C5 · NOTIFICAÇÃO', exige2Vias: true },
  HORMONIO: { rotulo: 'HORMÔNIO', exige2Vias: false },
  RESTRICAO_CFM: { rotulo: 'RESTRIÇÃO CFM', exige2Vias: false },
};

export type UnidadeDose = 'mg' | 'mcg' | 'g' | 'UI' | 'mL' | 'UFC' | '%';

export interface AtivoManipulado {
  /** Slug estável. Referenciado por src/data/formulasManipuladas.ts. */
  id: string;
  nome: string;
  /** Alimenta a busca: "P5P" acha piridoxal-5-fosfato. */
  sinonimos: string[];
  classe: ClasseAtivo;
  descricao: string;
  unidadePadrao: UnidadeDose;
  doseUsualMin?: number;
  doseUsualMax?: number;
  regulacao: RegulacaoAtivo;
  /** Obrigatório quando regulacao !== 'LIVRE'. */
  alertaLegal?: string;
  observacoes?: string;
}

const NOTIF_C5 =
  'Anabolizante — Portaria 344/98 lista C5. Exige Notificação de Receita e escrituração. Uso restrito a indicação médica formal.';
const CTRL_C1 =
  'Portaria 344/98 lista C1. Receita de Controle Especial em 2 vias, com retenção da 1ª via na farmácia.';

export const ATIVOS: AtivoManipulado[] = [
  // ═══ VITAMINAS E MINERAIS ═══════════════════════════════════════════════
  { id: 'acido-nicotinico', nome: 'Ácido nicotínico (Vitamina B3)', sinonimos: ['niacina', 'b3'], classe: 'VITAMINA_MINERAL', descricao: 'Atua no metabolismo energético e na circulação; auxilia no controle do colesterol.', unidadePadrao: 'mg', doseUsualMin: 20, doseUsualMax: 500, regulacao: 'LIVRE', observacoes: 'Doses altas causam flush cutâneo. Prefira nicotinamida quando o flush for limitante.' },
  { id: 'nicotinamida', nome: 'Nicotinamida', sinonimos: ['niacinamida', 'b3 sem flush'], classe: 'VITAMINA_MINERAL', descricao: 'Forma de vitamina B3 importante para o metabolismo energético, sem causar flush.', unidadePadrao: 'mg', doseUsualMin: 20, doseUsualMax: 500, regulacao: 'LIVRE' },
  { id: 'acetato-retinol', nome: 'Acetato de retinol (Vitamina A)', sinonimos: ['vitamina a', 'retinol'], classe: 'VITAMINA_MINERAL', descricao: 'Importante para saúde da pele, visão, imunidade e renovação celular.', unidadePadrao: 'UI', doseUsualMin: 2500, doseUsualMax: 10000, regulacao: 'LIVRE', observacoes: 'Teratogênico em doses altas — contraindicado na gestação.' },
  { id: 'ascorbato-magnesio', nome: 'Ascorbato de magnésio', sinonimos: ['vitamina c tamponada'], classe: 'VITAMINA_MINERAL', descricao: 'Forma tamponada de vitamina C associada ao magnésio, com ação antioxidante e melhor tolerância gástrica.', unidadePadrao: 'mg', doseUsualMin: 250, doseUsualMax: 1000, regulacao: 'LIVRE' },
  { id: 'vitamina-c', nome: 'Vitamina C', sinonimos: ['ácido ascórbico'], classe: 'VITAMINA_MINERAL', descricao: 'Antioxidante essencial para imunidade e síntese de colágeno.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 1000, regulacao: 'LIVRE' },
  { id: 'vitamina-d', nome: 'Vitamina D', sinonimos: ['colecalciferol', 'd3'], classe: 'VITAMINA_MINERAL', descricao: 'Importante para imunidade e saúde óssea.', unidadePadrao: 'UI', doseUsualMin: 1000, doseUsualMax: 7000, regulacao: 'LIVRE', observacoes: 'Ajustar pela dosagem sérica de 25-OH-vitamina D. Vigiar hipercalcemia em doses altas.' },
  { id: 'vitamina-e', nome: 'Vitamina E', sinonimos: ['tocoferol'], classe: 'VITAMINA_MINERAL', descricao: 'Antioxidante que protege as membranas celulares.', unidadePadrao: 'UI', doseUsualMin: 100, doseUsualMax: 400, regulacao: 'LIVRE', observacoes: 'Doses altas podem potencializar anticoagulantes.' },
  { id: 'tocotrienol', nome: 'Tocotrienol', sinonimos: [], classe: 'VITAMINA_MINERAL', descricao: 'Forma potente de vitamina E com ação antioxidante.', unidadePadrao: 'mg', doseUsualMin: 25, doseUsualMax: 100, regulacao: 'LIVRE' },
  { id: 'vitamina-k2-mk7', nome: 'Vitamina K2 MK7', sinonimos: ['menaquinona'], classe: 'VITAMINA_MINERAL', descricao: 'Auxilia a fixação de cálcio nos ossos e reduz deposição arterial.', unidadePadrao: 'mcg', doseUsualMin: 45, doseUsualMax: 180, regulacao: 'LIVRE', observacoes: 'Interage com varfarina — contraindicado em anticoagulação cumarínica.' },
  { id: 'vitamina-b1', nome: 'Vitamina B1', sinonimos: ['tiamina'], classe: 'VITAMINA_MINERAL', descricao: 'Atua no metabolismo energético e na função neurológica.', unidadePadrao: 'mg', doseUsualMin: 25, doseUsualMax: 300, regulacao: 'LIVRE' },
  { id: 'vitamina-b2', nome: 'Vitamina B2', sinonimos: ['riboflavina'], classe: 'VITAMINA_MINERAL', descricao: 'Importante para produção de energia celular.', unidadePadrao: 'mg', doseUsualMin: 10, doseUsualMax: 400, regulacao: 'LIVRE' },
  { id: 'vitamina-b6', nome: 'Vitamina B6', sinonimos: ['piridoxina'], classe: 'VITAMINA_MINERAL', descricao: 'Participa da produção de neurotransmissores.', unidadePadrao: 'mg', doseUsualMin: 10, doseUsualMax: 100, regulacao: 'LIVRE', observacoes: 'Acima de 200mg/dia por tempo prolongado há risco de neuropatia sensitiva.' },
  { id: 'piridoxal-5-fosfato', nome: 'Piridoxal-5-fosfato', sinonimos: ['p5p', 'b6 ativa'], classe: 'VITAMINA_MINERAL', descricao: 'Forma ativa da vitamina B6, sem necessidade de conversão hepática.', unidadePadrao: 'mg', doseUsualMin: 10, doseUsualMax: 50, regulacao: 'LIVRE' },
  { id: 'metilcobalamina', nome: 'Metilcobalamina (B12)', sinonimos: ['b12 ativa', 'vitamina b12'], classe: 'VITAMINA_MINERAL', descricao: 'Forma ativa da vitamina B12.', unidadePadrao: 'mcg', doseUsualMin: 500, doseUsualMax: 5000, regulacao: 'LIVRE', observacoes: 'Uso crônico de metformina e IBP causa deficiência de B12 — rastrear no idoso.' },
  { id: 'metilfolato', nome: 'Metilfolato', sinonimos: ['5-mthf', 'folato ativo'], classe: 'VITAMINA_MINERAL', descricao: 'Forma ativa do ácido fólico, útil em polimorfismo MTHFR.', unidadePadrao: 'mcg', doseUsualMin: 400, doseUsualMax: 1000, regulacao: 'LIVRE', observacoes: 'Dosar B12 antes de repor folato — repor folato isolado mascara anemia perniciosa.' },
  { id: 'biotina', nome: 'Biotina', sinonimos: ['vitamina b7', 'vitamina h'], classe: 'VITAMINA_MINERAL', descricao: 'Vitamina do complexo B essencial para cabelo, pele e unhas.', unidadePadrao: 'mcg', doseUsualMin: 2500, doseUsualMax: 10000, regulacao: 'LIVRE', observacoes: 'Interfere em imunoensaios (TSH, troponina) — suspender 72h antes de exames.' },
  { id: 'pantotenato-calcio', nome: 'Pantotenato de cálcio', sinonimos: ['vitamina b5'], classe: 'VITAMINA_MINERAL', descricao: 'Vitamina B5, importante para o metabolismo energético.', unidadePadrao: 'mg', doseUsualMin: 50, doseUsualMax: 500, regulacao: 'LIVRE' },
  { id: 'levedo-cerveja', nome: 'Levedo de cerveja', sinonimos: [], classe: 'VITAMINA_MINERAL', descricao: 'Rico em vitaminas do complexo B e proteínas.', unidadePadrao: 'mg', doseUsualMin: 500, doseUsualMax: 2000, regulacao: 'LIVRE' },
  { id: 'calcio-citrimal', nome: 'Cálcio citrimal', sinonimos: ['citrato malato de cálcio'], classe: 'VITAMINA_MINERAL', descricao: 'Fonte de cálcio com boa absorção, importante para os ossos.', unidadePadrao: 'mg', doseUsualMin: 250, doseUsualMax: 600, regulacao: 'LIVRE' },
  { id: 'calcio-quelado', nome: 'Cálcio quelado', sinonimos: [], classe: 'VITAMINA_MINERAL', descricao: 'Forma de cálcio de alta biodisponibilidade, boa opção na hipocloridria do idoso.', unidadePadrao: 'mg', doseUsualMin: 250, doseUsualMax: 600, regulacao: 'LIVRE' },
  { id: 'carbonato-calcio', nome: 'Carbonato de cálcio', sinonimos: [], classe: 'VITAMINA_MINERAL', descricao: 'Fonte de cálcio para saúde óssea, contração muscular e transmissão nervosa.', unidadePadrao: 'mg', doseUsualMin: 500, doseUsualMax: 1250, regulacao: 'LIVRE', observacoes: 'Depende de acidez gástrica — absorção reduzida com IBP.' },
  { id: 'citrato-magnesio', nome: 'Citrato de magnésio', sinonimos: [], classe: 'VITAMINA_MINERAL', descricao: 'Mineral importante para músculos, sistema nervoso e trânsito intestinal.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 400, regulacao: 'LIVRE', observacoes: 'É a forma com maior efeito laxativo — útil quando há constipação associada.' },
  { id: 'magnesio-dimalato', nome: 'Magnésio dimalato', sinonimos: [], classe: 'VITAMINA_MINERAL', descricao: 'Auxilia energia celular e saúde muscular; boa tolerância digestiva.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 600, regulacao: 'LIVRE' },
  { id: 'magnesio-l-treonato', nome: 'Magnésio L-treonato', sinonimos: ['magtein'], classe: 'VITAMINA_MINERAL', descricao: 'Forma de magnésio com maior penetração em sistema nervoso central.', unidadePadrao: 'mg', doseUsualMin: 500, doseUsualMax: 2000, regulacao: 'LIVRE' },
  { id: 'magnesio-quelato', nome: 'Magnésio quelato', sinonimos: ['bisglicinato de magnésio'], classe: 'VITAMINA_MINERAL', descricao: 'Alta biodisponibilidade para suporte neuromuscular, com baixo efeito laxativo.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 400, regulacao: 'LIVRE' },
  { id: 'magnesio-taurato', nome: 'Magnésio taurato', sinonimos: [], classe: 'VITAMINA_MINERAL', descricao: 'Combinação de magnésio com taurina, com benefícios cardiovasculares.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 400, regulacao: 'LIVRE' },
  { id: 'malato-magnesio-blend', nome: 'Malato de magnésio blend', sinonimos: [], classe: 'VITAMINA_MINERAL', descricao: 'Magnésio com ácido málico e vitamina C. Suporte para fadiga, produção de ATP e função neuromuscular.', unidadePadrao: 'mg', doseUsualMin: 200, doseUsualMax: 600, regulacao: 'LIVRE' },
  { id: 'sulfato-magnesio', nome: 'Sulfato de magnésio', sinonimos: ['sal amargo'], classe: 'VITAMINA_MINERAL', descricao: 'Fonte de magnésio para reposição mineral e ação osmótica.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 500, regulacao: 'LIVRE' },
  { id: 'citrato-potassio', nome: 'Citrato de potássio', sinonimos: [], classe: 'VITAMINA_MINERAL', descricao: 'Auxilia no equilíbrio eletrolítico e na prevenção de cálculos renais.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 600, regulacao: 'LIVRE', observacoes: 'Cuidado em doença renal crônica e com IECA/BRA e espironolactona — risco de hipercalemia.' },
  { id: 'cloreto-potassio', nome: 'Cloreto de potássio', sinonimos: [], classe: 'VITAMINA_MINERAL', descricao: 'Fonte de potássio para reposição eletrolítica.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 600, regulacao: 'LIVRE', observacoes: 'Mesmo cuidado de hipercalemia do citrato de potássio.' },
  { id: 'potassio-quelado', nome: 'Potássio quelado', sinonimos: [], classe: 'VITAMINA_MINERAL', descricao: 'Mineral essencial para equilíbrio eletrolítico.', unidadePadrao: 'mg', doseUsualMin: 50, doseUsualMax: 300, regulacao: 'LIVRE' },
  { id: 'ferro-quelado', nome: 'Ferro quelado', sinonimos: ['bisglicinato ferroso'], classe: 'VITAMINA_MINERAL', descricao: 'Reposição de ferro na anemia ferropriva, com menos efeitos gastrointestinais que o sulfato ferroso.', unidadePadrao: 'mg', doseUsualMin: 14, doseUsualMax: 60, regulacao: 'LIVRE', observacoes: 'CORRIGIDO: o acervo original trazia por engano a descrição do feno-grego. Absorção melhora com vitamina C; afastar de cálcio, IBP e levotiroxina. Anemia ferropriva no idoso exige investigar perda digestiva.' },
  { id: 'zinco-quelato', nome: 'Zinco quelato', sinonimos: ['bisglicinato de zinco'], classe: 'VITAMINA_MINERAL', descricao: 'Mineral essencial para imunidade, pele, cicatrização e metabolismo hormonal.', unidadePadrao: 'mg', doseUsualMin: 15, doseUsualMax: 40, regulacao: 'LIVRE', observacoes: 'Uso prolongado acima de 40mg/dia induz deficiência de cobre.' },
  { id: 'cobre-quelado', nome: 'Cobre quelado', sinonimos: [], classe: 'VITAMINA_MINERAL', descricao: 'Envolvido na formação de hemoglobina, produção de colágeno e ação antioxidante.', unidadePadrao: 'mg', doseUsualMin: 1, doseUsualMax: 3, regulacao: 'LIVRE', observacoes: 'Associar ao zinco em suplementação prolongada, na proporção aproximada de 1mg de cobre para cada 15mg de zinco.' },
  { id: 'selenio-quelado', nome: 'Selênio quelado', sinonimos: [], classe: 'VITAMINA_MINERAL', descricao: 'Mineral antioxidante importante para imunidade e função tireoidiana.', unidadePadrao: 'mcg', doseUsualMin: 50, doseUsualMax: 200, regulacao: 'LIVRE', observacoes: 'Janela terapêutica estreita — acima de 400mcg/dia há risco de selenose.' },
  { id: 'seleniometionina', nome: 'Seleniometionina', sinonimos: ['selenometionina'], classe: 'VITAMINA_MINERAL', descricao: 'Forma orgânica e biodisponível de selênio.', unidadePadrao: 'mcg', doseUsualMin: 50, doseUsualMax: 200, regulacao: 'LIVRE' },
  { id: 'cromo-quelado', nome: 'Cromo quelado', sinonimos: [], classe: 'VITAMINA_MINERAL', descricao: 'Auxilia no controle da glicemia e na compulsão por doces.', unidadePadrao: 'mcg', doseUsualMin: 100, doseUsualMax: 600, regulacao: 'LIVRE' },
  { id: 'picolinato-cromo', nome: 'Picolinato de cromo', sinonimos: [], classe: 'VITAMINA_MINERAL', descricao: 'Forma de cromo usada no controle de glicemia e compulsão alimentar.', unidadePadrao: 'mcg', doseUsualMin: 100, doseUsualMax: 600, regulacao: 'LIVRE' },
  { id: 'manganes-quelado', nome: 'Manganês quelado', sinonimos: [], classe: 'VITAMINA_MINERAL', descricao: 'Mineral importante para metabolismo e defesa antioxidante.', unidadePadrao: 'mg', doseUsualMin: 1, doseUsualMax: 5, regulacao: 'LIVRE' },
  { id: 'silicio-organico', nome: 'Silício orgânico', sinonimos: [], classe: 'VITAMINA_MINERAL', descricao: 'Auxilia saúde da pele, cabelo, unhas e articulações.', unidadePadrao: 'mg', doseUsualMin: 5, doseUsualMax: 50, regulacao: 'LIVRE' },
  { id: 'inositol', nome: 'Inositol', sinonimos: ['mio-inositol', 'myo-inositol'], classe: 'VITAMINA_MINERAL', descricao: 'Importante para a sinalização da insulina; usado em resistência insulínica e síndrome dos ovários policísticos.', unidadePadrao: 'mg', doseUsualMin: 500, doseUsualMax: 4000, regulacao: 'LIVRE', observacoes: 'Em SOP, a evidência é para mio-inositol, com doses habituais de 2 a 4 g/dia.' },

  // ═══ AMINOÁCIDOS E PEPTÍDEOS ════════════════════════════════════════════
  { id: 'creatina', nome: 'Creatina monohidratada', sinonimos: ['creatine'], classe: 'AMINOACIDO', descricao: 'Melhora força, desempenho muscular e massa magra; evidência também em função cognitiva.', unidadePadrao: 'g', doseUsualMin: 3, doseUsualMax: 5, regulacao: 'LIVRE', observacoes: 'O suplemento com melhor evidência para sarcopenia quando associado a treino resistido.' },
  { id: 'hmb', nome: 'HMB (hidroximetilbutirato de cálcio)', sinonimos: ['hidroximetilbutirato'], classe: 'AMINOACIDO', descricao: 'Metabólito da leucina que auxilia na preservação e no ganho de massa muscular.', unidadePadrao: 'g', doseUsualMin: 1.5, doseUsualMax: 3, regulacao: 'LIVRE' },
  { id: 'leucina', nome: 'Leucina', sinonimos: ['bcaa'], classe: 'AMINOACIDO', descricao: 'Aminoácido BCAA que estimula a síntese proteica muscular via mTOR.', unidadePadrao: 'g', doseUsualMin: 2, doseUsualMax: 5, regulacao: 'LIVRE' },
  { id: 'isoleucina', nome: 'Isoleucina', sinonimos: ['bcaa'], classe: 'AMINOACIDO', descricao: 'Aminoácido BCAA importante para recuperação muscular.', unidadePadrao: 'g', doseUsualMin: 0.5, doseUsualMax: 2, regulacao: 'LIVRE' },
  { id: 'valina', nome: 'Valina', sinonimos: ['bcaa'], classe: 'AMINOACIDO', descricao: 'Aminoácido BCAA importante para recuperação muscular.', unidadePadrao: 'g', doseUsualMin: 0.5, doseUsualMax: 2, regulacao: 'LIVRE' },
  { id: 'peptistrong', nome: 'PeptiStrong', sinonimos: [], classe: 'AMINOACIDO', descricao: 'Peptídeo bioativo de fava que auxilia força e massa muscular.', unidadePadrao: 'mg', doseUsualMin: 1000, doseUsualMax: 2400, regulacao: 'LIVRE' },
  { id: 'l-glutamina', nome: 'L-glutamina', sinonimos: ['glutamina'], classe: 'AMINOACIDO', descricao: 'Principal substrato energético do enterócito; auxilia integridade da barreira intestinal e recuperação muscular.', unidadePadrao: 'g', doseUsualMin: 3, doseUsualMax: 10, regulacao: 'LIVRE' },
  { id: 'l-carnitina', nome: 'L-carnitina', sinonimos: ['carnitina'], classe: 'AMINOACIDO', descricao: 'Auxilia no transporte de ácidos graxos para a mitocôndria.', unidadePadrao: 'mg', doseUsualMin: 500, doseUsualMax: 2000, regulacao: 'LIVRE' },
  { id: 'acetil-l-carnitina', nome: 'Acetil L-carnitina', sinonimos: ['alcar'], classe: 'AMINOACIDO', descricao: 'Auxilia na produção de energia celular e atravessa a barreira hematoencefálica; estudada em fadiga e cognição.', unidadePadrao: 'mg', doseUsualMin: 500, doseUsualMax: 2000, regulacao: 'LIVRE' },
  { id: 'arginina', nome: 'Arginina', sinonimos: ['l-arginina'], classe: 'AMINOACIDO', descricao: 'Precursor de óxido nítrico; melhora circulação e desempenho físico.', unidadePadrao: 'mg', doseUsualMin: 1000, doseUsualMax: 6000, regulacao: 'LIVRE' },
  { id: 'l-citrulina', nome: 'L-citrulina', sinonimos: ['citrulina'], classe: 'AMINOACIDO', descricao: 'Precursora do óxido nítrico, com biodisponibilidade superior à arginina.', unidadePadrao: 'mg', doseUsualMin: 1000, doseUsualMax: 6000, regulacao: 'LIVRE' },
  { id: 'citrulina-malato', nome: 'Citrulina malato', sinonimos: [], classe: 'AMINOACIDO', descricao: 'Aumenta produção de óxido nítrico e melhora performance muscular.', unidadePadrao: 'mg', doseUsualMin: 3000, doseUsualMax: 8000, regulacao: 'LIVRE' },
  { id: 'beta-alanina', nome: 'Beta alanina', sinonimos: [], classe: 'AMINOACIDO', descricao: 'Precursor de carnosina; melhora resistência muscular.', unidadePadrao: 'mg', doseUsualMin: 1500, doseUsualMax: 5000, regulacao: 'LIVRE', observacoes: 'Parestesia transitória é efeito esperado e benigno.' },
  { id: 'taurina', nome: 'Taurina', sinonimos: [], classe: 'AMINOACIDO', descricao: 'Aminoácido importante para energia, função cardiovascular e neuromodulação.', unidadePadrao: 'mg', doseUsualMin: 500, doseUsualMax: 3000, regulacao: 'LIVRE' },
  { id: 'glicina', nome: 'Glicina', sinonimos: [], classe: 'AMINOACIDO', descricao: 'Auxilia na síntese de colágeno e promove relaxamento e qualidade do sono.', unidadePadrao: 'mg', doseUsualMin: 1000, doseUsualMax: 3000, regulacao: 'LIVRE' },
  { id: 'l-teanina', nome: 'L-teanina', sinonimos: ['teanina'], classe: 'AMINOACIDO', descricao: 'Aminoácido do chá verde que promove relaxamento e foco sem sedação.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 400, regulacao: 'LIVRE' },
  { id: 'triptofano', nome: 'Triptofano', sinonimos: ['l-triptofano'], classe: 'AMINOACIDO', descricao: 'Precursor de serotonina e melatonina.', unidadePadrao: 'mg', doseUsualMin: 250, doseUsualMax: 1000, regulacao: 'LIVRE', observacoes: 'Risco de síndrome serotoninérgica com ISRS/IMAO.' },
  { id: '5-htp', nome: '5-HTP (hidroxitriptofano)', sinonimos: ['5 htp', 'hidroxitriptofano'], classe: 'AMINOACIDO', descricao: 'Precursor direto da serotonina; auxilia humor, sono e controle do apetite.', unidadePadrao: 'mg', doseUsualMin: 50, doseUsualMax: 300, regulacao: 'LIVRE', observacoes: 'Não associar a ISRS, IMAO ou tramadol — risco de síndrome serotoninérgica.' },
  { id: 'gaba', nome: 'GABA', sinonimos: ['ácido gama-aminobutírico'], classe: 'AMINOACIDO', descricao: 'Neurotransmissor inibitório associado a relaxamento e sono.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 750, regulacao: 'LIVRE', observacoes: 'Penetração da barreira hematoencefálica por via oral é questionada.' },
  { id: 'tirosina', nome: 'Tirosina', sinonimos: ['l-tirosina'], classe: 'AMINOACIDO', descricao: 'Aminoácido precursor de dopamina e noradrenalina.', unidadePadrao: 'mg', doseUsualMin: 500, doseUsualMax: 2000, regulacao: 'LIVRE' },
  { id: 'fenilalanina', nome: 'Fenilalanina', sinonimos: [], classe: 'AMINOACIDO', descricao: 'Aminoácido que participa da produção de neurotransmissores.', unidadePadrao: 'mg', doseUsualMin: 250, doseUsualMax: 1000, regulacao: 'LIVRE', observacoes: 'Contraindicado na fenilcetonúria.' },
  { id: 'metionina', nome: 'Metionina', sinonimos: [], classe: 'AMINOACIDO', descricao: 'Aminoácido importante para o metabolismo hepático e doação de metila.', unidadePadrao: 'mg', doseUsualMin: 250, doseUsualMax: 1000, regulacao: 'LIVRE' },
  { id: 'l-cisteina', nome: 'L-cisteína', sinonimos: ['cisteína'], classe: 'AMINOACIDO', descricao: 'Aminoácido importante para formação de queratina e saúde capilar.', unidadePadrao: 'mg', doseUsualMin: 250, doseUsualMax: 1000, regulacao: 'LIVRE' },
  { id: 'n-acetilcisteina', nome: 'N-acetilcisteína (NAC)', sinonimos: ['nac'], classe: 'AMINOACIDO', descricao: 'Precursor de glutationa; auxilia saúde hepática e respiratória.', unidadePadrao: 'mg', doseUsualMin: 600, doseUsualMax: 1800, regulacao: 'LIVRE' },
  { id: 'glutationa', nome: 'Glutationa', sinonimos: [], classe: 'AMINOACIDO', descricao: 'Principal antioxidante intracelular, importante na desintoxicação.', unidadePadrao: 'mg', doseUsualMin: 250, doseUsualMax: 1000, regulacao: 'LIVRE', observacoes: 'Biodisponibilidade oral é limitada — o NAC costuma ser mais eficiente para elevar glutationa.' },
  { id: 'l-lisina', nome: 'L-lisina', sinonimos: ['lisina'], classe: 'AMINOACIDO', descricao: 'Participa da síntese de colágeno e da imunidade.', unidadePadrao: 'mg', doseUsualMin: 500, doseUsualMax: 3000, regulacao: 'LIVRE' },
  { id: 'l-treonina', nome: 'L-treonina', sinonimos: ['treonina'], classe: 'AMINOACIDO', descricao: 'Importante para síntese proteica e produção de mucina intestinal.', unidadePadrao: 'mg', doseUsualMin: 250, doseUsualMax: 1000, regulacao: 'LIVRE' },
  { id: 'betaina', nome: 'Betaína', sinonimos: ['trimetilglicina', 'tmg'], classe: 'AMINOACIDO', descricao: 'Auxilia no metabolismo hepático, na digestão de gorduras e na redução de homocisteína.', unidadePadrao: 'mg', doseUsualMin: 500, doseUsualMax: 2500, regulacao: 'LIVRE' },
  { id: 'same', nome: 'SAMe', sinonimos: ['s-adenosilmetionina'], classe: 'AMINOACIDO', descricao: 'Atua no metabolismo hepático e no humor.', unidadePadrao: 'mg', doseUsualMin: 200, doseUsualMax: 800, regulacao: 'LIVRE', observacoes: 'Pode precipitar mania em transtorno bipolar; interage com serotoninérgicos.' },
  { id: 'colageno-tipo-ii', nome: 'Colágeno tipo II', sinonimos: ['uc-ii'], classe: 'AMINOACIDO', descricao: 'Colágeno não desnaturado com ação na saúde articular.', unidadePadrao: 'mg', doseUsualMin: 40, doseUsualMax: 120, regulacao: 'LIVRE' },
  { id: 'verisol', nome: 'Verisol', sinonimos: ['peptídeos de colágeno bioativos'], classe: 'AMINOACIDO', descricao: 'Peptídeos de colágeno com evidência em elasticidade da pele e rugas.', unidadePadrao: 'g', doseUsualMin: 2.5, doseUsualMax: 5, regulacao: 'LIVRE' },
  { id: 'queratina', nome: 'Queratina', sinonimos: [], classe: 'AMINOACIDO', descricao: 'Proteína estrutural importante para cabelo e unhas.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 500, regulacao: 'LIVRE' },
  { id: 'acido-hialuronico-interno', nome: 'Ácido hialurônico (interno)', sinonimos: ['ha oral'], classe: 'AMINOACIDO', descricao: 'Molécula hidratante que retém água na pele e nas articulações, para uso interno.', unidadePadrao: 'mg', doseUsualMin: 50, doseUsualMax: 200, regulacao: 'LIVRE' },
  { id: 'acido-hialuronico-topico', nome: 'Ácido hialurônico (tópico)', sinonimos: ['ha tópico'], classe: 'AMINOACIDO', descricao: 'Molécula hidratante para uso externo em formulações dermatológicas.', unidadePadrao: '%', doseUsualMin: 0.1, doseUsualMax: 2, regulacao: 'LIVRE' },
  { id: 'acido-d-aspartico', nome: 'Ácido D-aspártico', sinonimos: ['daa'], classe: 'AMINOACIDO', descricao: 'Aminoácido envolvido na regulação hormonal, podendo estimular produção de testosterona.', unidadePadrao: 'mg', doseUsualMin: 1500, doseUsualMax: 3000, regulacao: 'LIVRE', observacoes: 'Evidência inconsistente em humanos treinados.' },

  // ═══ PROBIÓTICOS ════════════════════════════════════════════════════════
  { id: 'saccharomyces-boulardii', nome: 'Saccharomyces boulardii', sinonimos: ['s. boulardii', 'floratil'], classe: 'PROBIOTICO', descricao: 'Levedura probiótica com evidência em diarreia aguda e associada a antibióticos.', unidadePadrao: 'mg', doseUsualMin: 200, doseUsualMax: 500, regulacao: 'LIVRE', observacoes: 'Evitar em imunossupressão grave e em portadores de cateter venoso central — risco de fungemia.' },
  { id: 'lactobacillus-rhamnosus', nome: 'Lactobacillus rhamnosus', sinonimos: ['lgg'], classe: 'PROBIOTICO', descricao: 'Auxilia no equilíbrio intestinal e na imunidade; uma das cepas mais estudadas.', unidadePadrao: 'UFC', doseUsualMin: 1000000000, doseUsualMax: 10000000000, regulacao: 'LIVRE' },
  { id: 'lactobacillus-plantarum', nome: 'Lactobacillus plantarum', sinonimos: [], classe: 'PROBIOTICO', descricao: 'Melhora a digestão e reduz a inflamação intestinal; estudada em SII.', unidadePadrao: 'UFC', doseUsualMin: 1000000000, doseUsualMax: 10000000000, regulacao: 'LIVRE' },
  { id: 'lactobacillus-acidophilus', nome: 'Lactobacillus acidophilus', sinonimos: [], classe: 'PROBIOTICO', descricao: 'Auxilia na digestão e na saúde intestinal.', unidadePadrao: 'UFC', doseUsualMin: 1000000000, doseUsualMax: 10000000000, regulacao: 'LIVRE' },
  { id: 'lactobacillus-reuteri', nome: 'Lactobacillus reuteri', sinonimos: [], classe: 'PROBIOTICO', descricao: 'Benefícios para intestino e sistema imunológico.', unidadePadrao: 'UFC', doseUsualMin: 100000000, doseUsualMax: 10000000000, regulacao: 'LIVRE' },
  { id: 'lactobacillus-casei', nome: 'Lactobacillus casei', sinonimos: [], classe: 'PROBIOTICO', descricao: 'Auxilia na imunidade e na saúde intestinal.', unidadePadrao: 'UFC', doseUsualMin: 1000000000, doseUsualMax: 10000000000, regulacao: 'LIVRE' },
  { id: 'lactobacillus-gasseri', nome: 'Lactobacillus gasseri', sinonimos: [], classe: 'PROBIOTICO', descricao: 'Associado à redução de gordura abdominal.', unidadePadrao: 'UFC', doseUsualMin: 1000000000, doseUsualMax: 10000000000, regulacao: 'LIVRE' },
  { id: 'lactobacillus-crispatus', nome: 'Lactobacillus crispatus', sinonimos: [], classe: 'PROBIOTICO', descricao: 'Importante para a saúde vaginal e urinária.', unidadePadrao: 'UFC', doseUsualMin: 1000000000, doseUsualMax: 10000000000, regulacao: 'LIVRE' },
  { id: 'lactobacillus-fermentum', nome: 'Lactobacillus fermentum', sinonimos: [], classe: 'PROBIOTICO', descricao: 'Contribui para o equilíbrio do microbioma.', unidadePadrao: 'UFC', doseUsualMin: 1000000000, doseUsualMax: 10000000000, regulacao: 'LIVRE' },
  { id: 'lactobacillus-bulgaricus', nome: 'Lactobacillus bulgaricus', sinonimos: [], classe: 'PROBIOTICO', descricao: 'Ajuda na digestão da lactose.', unidadePadrao: 'UFC', doseUsualMin: 1000000000, doseUsualMax: 10000000000, regulacao: 'LIVRE' },
  { id: 'lactobacillus-bifidum', nome: 'Lactobacillus bifidum', sinonimos: [], classe: 'PROBIOTICO', descricao: 'Contribui para o equilíbrio do microbioma.', unidadePadrao: 'UFC', doseUsualMin: 1000000000, doseUsualMax: 10000000000, regulacao: 'LIVRE' },
  { id: 'lactobacillus-johnsonii', nome: 'Lactobacillus johnsonii', sinonimos: [], classe: 'PROBIOTICO', descricao: 'Ajuda na modulação imunológica.', unidadePadrao: 'UFC', doseUsualMin: 1000000000, doseUsualMax: 10000000000, regulacao: 'LIVRE' },
  { id: 'lactobacillus-sporogenes', nome: 'Lactobacillus sporogenes', sinonimos: ['bacillus coagulans'], classe: 'PROBIOTICO', descricao: 'Probiótico esporulado, resistente ao ácido gástrico.', unidadePadrao: 'UFC', doseUsualMin: 1000000000, doseUsualMax: 10000000000, regulacao: 'LIVRE' },
  { id: 'bifidobacterium-longum', nome: 'Bifidobacterium longum', sinonimos: [], classe: 'PROBIOTICO', descricao: 'Probiótico associado à redução de inflamação intestinal.', unidadePadrao: 'UFC', doseUsualMin: 1000000000, doseUsualMax: 10000000000, regulacao: 'LIVRE' },
  { id: 'bifidobacterium-infantis', nome: 'Bifidobacterium infantis', sinonimos: [], classe: 'PROBIOTICO', descricao: 'Cepa com evidência específica em síndrome do intestino irritável.', unidadePadrao: 'UFC', doseUsualMin: 100000000, doseUsualMax: 10000000000, regulacao: 'LIVRE' },
  { id: 'bifidobacterium-lactis', nome: 'Bifidobacterium lactis', sinonimos: [], classe: 'PROBIOTICO', descricao: 'Auxilia a digestão e melhora a função intestinal.', unidadePadrao: 'UFC', doseUsualMin: 1000000000, doseUsualMax: 10000000000, regulacao: 'LIVRE' },
  { id: 'bifidobacterium-breve', nome: 'Bifidobacterium breve', sinonimos: [], classe: 'PROBIOTICO', descricao: 'Contribui para o equilíbrio da microbiota intestinal.', unidadePadrao: 'UFC', doseUsualMin: 1000000000, doseUsualMax: 10000000000, regulacao: 'LIVRE' },
  { id: 'lactococcus-lactis', nome: 'Lactococcus lactis', sinonimos: [], classe: 'PROBIOTICO', descricao: 'Bactéria benéfica para a saúde intestinal.', unidadePadrao: 'UFC', doseUsualMin: 1000000000, doseUsualMax: 10000000000, regulacao: 'LIVRE' },
  { id: 'streptococcus-thermophilus', nome: 'Streptococcus thermophilus', sinonimos: [], classe: 'PROBIOTICO', descricao: 'Probiótico benéfico para a microbiota e a digestão de lactose.', unidadePadrao: 'UFC', doseUsualMin: 1000000000, doseUsualMax: 10000000000, regulacao: 'LIVRE' },

  // ═══ PREBIÓTICOS E FIBRAS ═══════════════════════════════════════════════
  { id: 'psyllium', nome: 'Psyllium', sinonimos: ['plantago ovata'], classe: 'PREBIOTICO_FIBRA', descricao: 'Fibra solúvel que melhora o trânsito intestinal e a consistência das fezes; primeira linha em constipação funcional.', unidadePadrao: 'g', doseUsualMin: 3, doseUsualMax: 10, regulacao: 'LIVRE', observacoes: 'Exige ingestão hídrica adequada. Afastar 2h de outros medicamentos.' },
  { id: 'inulina', nome: 'Inulina', sinonimos: [], classe: 'PREBIOTICO_FIBRA', descricao: 'Fibra prebiótica que estimula bifidobactérias.', unidadePadrao: 'g', doseUsualMin: 2, doseUsualMax: 10, regulacao: 'LIVRE', observacoes: 'Pode piorar distensão e flatulência em SII — introduzir devagar.' },
  { id: 'fos', nome: 'Frutooligossacarídeos (FOS)', sinonimos: ['fos', 'frutooligossacarideos'], classe: 'PREBIOTICO_FIBRA', descricao: 'Prebiótico que alimenta bactérias benéficas do intestino.', unidadePadrao: 'g', doseUsualMin: 2, doseUsualMax: 8, regulacao: 'LIVRE' },
  { id: 'xos', nome: 'Xilooligossacarídeos (XOS)', sinonimos: ['xos'], classe: 'PREBIOTICO_FIBRA', descricao: 'Prebiótico eficaz em doses baixas, com boa tolerância digestiva.', unidadePadrao: 'g', doseUsualMin: 1, doseUsualMax: 3, regulacao: 'LIVRE' },
  { id: 'polidextrose', nome: 'Polidextrose', sinonimos: [], classe: 'PREBIOTICO_FIBRA', descricao: 'Fibra prebiótica que melhora a função intestinal, bem tolerada.', unidadePadrao: 'g', doseUsualMin: 4, doseUsualMax: 12, regulacao: 'LIVRE' },
  { id: 'glucomannan', nome: 'Glucomannan', sinonimos: ['konjac'], classe: 'PREBIOTICO_FIBRA', descricao: 'Fibra altamente viscosa que aumenta a saciedade.', unidadePadrao: 'g', doseUsualMin: 1, doseUsualMax: 4, regulacao: 'LIVRE', observacoes: 'Tomar com bastante água 30–60 min antes das refeições. Risco de obstrução esofágica se ingerido sem líquido.' },
  { id: 'chitosan', nome: 'Chitosan', sinonimos: ['quitosana'], classe: 'PREBIOTICO_FIBRA', descricao: 'Fibra que reduz a absorção de gorduras.', unidadePadrao: 'mg', doseUsualMin: 500, doseUsualMax: 3000, regulacao: 'LIVRE', observacoes: 'Contraindicado em alergia a frutos do mar.' },
  { id: 'palatinose', nome: 'Palatinose', sinonimos: ['isomaltulose'], classe: 'PREBIOTICO_FIBRA', descricao: 'Carboidrato de baixo índice glicêmico, para energia prolongada.', unidadePadrao: 'g', doseUsualMin: 5, doseUsualMax: 25, regulacao: 'LIVRE' },
  { id: 'trealose', nome: 'Trealose', sinonimos: [], classe: 'PREBIOTICO_FIBRA', descricao: 'Açúcar natural com propriedades antioxidantes e estabilizantes.', unidadePadrao: 'g', doseUsualMin: 1, doseUsualMax: 10, regulacao: 'LIVRE' },

  // ═══ ENZIMAS DIGESTIVAS ═════════════════════════════════════════════════
  { id: 'lactase', nome: 'Lactase', sinonimos: [], classe: 'ENZIMA_DIGESTIVA', descricao: 'Enzima que hidrolisa a lactose; reposição direta na intolerância.', unidadePadrao: 'UI', doseUsualMin: 3000, doseUsualMax: 10000, regulacao: 'LIVRE', observacoes: 'Tomar imediatamente antes da refeição com lactose.' },
  { id: 'pancreatina', nome: 'Pancreatina', sinonimos: [], classe: 'ENZIMA_DIGESTIVA', descricao: 'Mistura de amilase, lipase e protease; reposição na insuficiência pancreática exócrina.', unidadePadrao: 'mg', doseUsualMin: 150, doseUsualMax: 500, regulacao: 'LIVRE' },
  { id: 'lipase', nome: 'Lipase', sinonimos: [], classe: 'ENZIMA_DIGESTIVA', descricao: 'Enzima digestiva que quebra gorduras.', unidadePadrao: 'mg', doseUsualMin: 50, doseUsualMax: 200, regulacao: 'LIVRE' },
  { id: 'alfa-amilase', nome: 'Alfa-amilase', sinonimos: ['amilase'], classe: 'ENZIMA_DIGESTIVA', descricao: 'Enzima digestiva responsável pela quebra de carboidratos.', unidadePadrao: 'mg', doseUsualMin: 50, doseUsualMax: 200, regulacao: 'LIVRE' },
  { id: 'protease-alcalina', nome: 'Protease alcalina', sinonimos: ['protease'], classe: 'ENZIMA_DIGESTIVA', descricao: 'Enzima digestiva que quebra proteínas.', unidadePadrao: 'mg', doseUsualMin: 50, doseUsualMax: 200, regulacao: 'LIVRE' },
  { id: 'pepsina', nome: 'Pepsina', sinonimos: [], classe: 'ENZIMA_DIGESTIVA', descricao: 'Enzima gástrica que inicia a digestão de proteínas.', unidadePadrao: 'mg', doseUsualMin: 25, doseUsualMax: 150, regulacao: 'LIVRE' },
  { id: 'bromelaina', nome: 'Bromelaína', sinonimos: ['bromelina'], classe: 'ENZIMA_DIGESTIVA', descricao: 'Enzima do abacaxi com ação digestiva e anti-inflamatória.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 500, regulacao: 'LIVRE', observacoes: 'Pode potencializar anticoagulantes e antiagregantes.' },
  { id: 'papaina', nome: 'Papaína', sinonimos: [], classe: 'ENZIMA_DIGESTIVA', descricao: 'Enzima proteolítica derivada do mamão.', unidadePadrao: 'mg', doseUsualMin: 50, doseUsualMax: 300, regulacao: 'LIVRE' },

  // ═══ FITOTERÁPICOS ══════════════════════════════════════════════════════
  { id: 'curcuma', nome: 'Cúrcuma longa (95% curcumina)', sinonimos: ['curcumina', 'açafrão-da-terra'], classe: 'FITOTERAPICO', descricao: 'Anti-inflamatório e antioxidante natural.', unidadePadrao: 'mg', doseUsualMin: 250, doseUsualMax: 1000, regulacao: 'LIVRE', observacoes: 'Biodisponibilidade baixa isolada — associar piperina. Pode potencializar anticoagulantes.' },
  { id: 'piperina', nome: 'Piperina', sinonimos: ['bioperine'], classe: 'FITOTERAPICO', descricao: 'Aumenta a absorção de nutrientes e compostos bioativos.', unidadePadrao: 'mg', doseUsualMin: 5, doseUsualMax: 20, regulacao: 'LIVRE', observacoes: 'Inibe CYP3A4 — pode elevar níveis de outros fármacos.' },
  { id: 'boswellia', nome: 'Boswellia serrata', sinonimos: ['incenso indiano'], classe: 'FITOTERAPICO', descricao: 'Fitoterápico anti-inflamatório com uso em osteoartrite.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 500, regulacao: 'LIVRE' },
  { id: 'msm', nome: 'Metilsulfonilmetano (MSM)', sinonimos: ['msm'], classe: 'FITOTERAPICO', descricao: 'Auxilia saúde articular, pele e controle inflamatório.', unidadePadrao: 'mg', doseUsualMin: 500, doseUsualMax: 3000, regulacao: 'LIVRE' },
  { id: 'berberina', nome: 'Berberina', sinonimos: [], classe: 'FITOTERAPICO', descricao: 'Auxilia no controle da glicemia e do perfil lipídico; ensaios mostram efeito comparável a hipoglicemiantes orais em DM2.', unidadePadrao: 'mg', doseUsualMin: 500, doseUsualMax: 1500, regulacao: 'LIVRE', observacoes: 'Inibe CYP3A4 e P-gp — revisar interações. Efeitos gastrointestinais são comuns no início.' },
  { id: 'gymnema', nome: 'Gymnema sylvestre', sinonimos: [], classe: 'FITOTERAPICO', descricao: 'Utilizada no controle da glicemia e na redução da vontade por doces.', unidadePadrao: 'mg', doseUsualMin: 200, doseUsualMax: 800, regulacao: 'LIVRE' },
  { id: 'silimarina', nome: 'Silimarina', sinonimos: ['cardo-mariano', 'silybum'], classe: 'FITOTERAPICO', descricao: 'Hepatoprotetor derivado do cardo-mariano.', unidadePadrao: 'mg', doseUsualMin: 140, doseUsualMax: 600, regulacao: 'LIVRE' },
  { id: 'alcachofra', nome: 'Alcachofra extrato seco', sinonimos: ['cynara'], classe: 'FITOTERAPICO', descricao: 'Auxilia função hepática, digestão de gorduras e dispepsia funcional.', unidadePadrao: 'mg', doseUsualMin: 300, doseUsualMax: 1000, regulacao: 'LIVRE' },
  { id: 'carqueja', nome: 'Carqueja', sinonimos: [], classe: 'FITOTERAPICO', descricao: 'Planta com ação digestiva e hepatoprotetora.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 500, regulacao: 'LIVRE' },
  { id: 'gengibre', nome: 'Gengibre extrato seco', sinonimos: ['zingiber'], classe: 'FITOTERAPICO', descricao: 'Auxilia digestão e motilidade gástrica; ação antiemética e anti-inflamatória.', unidadePadrao: 'mg', doseUsualMin: 250, doseUsualMax: 1000, regulacao: 'LIVRE' },
  { id: 'cascara-sagrada', nome: 'Cáscara sagrada extrato seco', sinonimos: [], classe: 'FITOTERAPICO', descricao: 'Fitoterápico laxativo antraquinônico.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 400, regulacao: 'LIVRE', observacoes: 'Laxante estimulante — evitar uso prolongado; risco de dependência do trânsito e melanose coli.' },
  { id: 'ginkgo', nome: 'Ginkgo biloba extrato seco', sinonimos: ['ginkgo'], classe: 'FITOTERAPICO', descricao: 'Melhora circulação periférica e cerebral.', unidadePadrao: 'mg', doseUsualMin: 80, doseUsualMax: 240, regulacao: 'LIVRE', observacoes: 'Risco de sangramento com anticoagulantes e antiagregantes.' },
  { id: 'bacopa', nome: 'Bacopa monnieri', sinonimos: ['brahmi'], classe: 'FITOTERAPICO', descricao: 'Fitoterápico usado para memória e concentração.', unidadePadrao: 'mg', doseUsualMin: 150, doseUsualMax: 600, regulacao: 'LIVRE', observacoes: 'Efeito cognitivo, quando presente, aparece após 8–12 semanas.' },
  { id: 'withania', nome: 'Withania somnifera (ashwagandha)', sinonimos: ['ashwagandha'], classe: 'FITOTERAPICO', descricao: 'Adaptógeno com evidência em redução de estresse percebido e cortisol.', unidadePadrao: 'mg', doseUsualMin: 250, doseUsualMax: 600, regulacao: 'LIVRE', observacoes: 'Relatos de hepatotoxicidade idiossincrática. Cautela em doença tireoidiana e autoimune.' },
  { id: 'rhodiola', nome: 'Rhodiola rosea extrato seco', sinonimos: ['rodiola'], classe: 'FITOTERAPICO', descricao: 'Adaptógeno que melhora energia e resistência ao estresse.', unidadePadrao: 'mg', doseUsualMin: 200, doseUsualMax: 600, regulacao: 'LIVRE' },
  { id: 'ginseng-coreano', nome: 'Ginseng coreano', sinonimos: ['panax ginseng'], classe: 'FITOTERAPICO', descricao: 'Adaptógeno que melhora energia e resistência ao estresse.', unidadePadrao: 'mg', doseUsualMin: 200, doseUsualMax: 600, regulacao: 'LIVRE' },
  { id: 'maca-peruana', nome: 'Maca peruana', sinonimos: ['lepidium meyenii'], classe: 'FITOTERAPICO', descricao: 'Adaptógeno associado a energia, libido e equilíbrio hormonal.', unidadePadrao: 'mg', doseUsualMin: 500, doseUsualMax: 3000, regulacao: 'LIVRE' },
  { id: 'valeriana', nome: 'Valeriana extrato seco', sinonimos: [], classe: 'FITOTERAPICO', descricao: 'Planta usada para ansiedade e insônia.', unidadePadrao: 'mg', doseUsualMin: 300, doseUsualMax: 600, regulacao: 'LIVRE' },
  { id: 'passiflora', nome: 'Passiflora extrato seco', sinonimos: ['maracujá'], classe: 'FITOTERAPICO', descricao: 'Planta calmante que auxilia ansiedade e sono.', unidadePadrao: 'mg', doseUsualMin: 200, doseUsualMax: 600, regulacao: 'LIVRE' },
  { id: 'melissa', nome: 'Melissa', sinonimos: ['erva-cidreira'], classe: 'FITOTERAPICO', descricao: 'Planta calmante que auxilia ansiedade e sono.', unidadePadrao: 'mg', doseUsualMin: 200, doseUsualMax: 600, regulacao: 'LIVRE' },
  { id: 'mulungu', nome: 'Mulungu extrato seco', sinonimos: [], classe: 'FITOTERAPICO', descricao: 'Fitoterápico com efeito calmante e ansiolítico.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 500, regulacao: 'LIVRE' },
  { id: 'kawa-kawa', nome: 'Kawa kawa', sinonimos: ['kava'], classe: 'FITOTERAPICO', descricao: 'Fitoterápico com efeito ansiolítico e relaxante.', unidadePadrao: 'mg', doseUsualMin: 50, doseUsualMax: 250, regulacao: 'LIVRE', observacoes: 'Risco de hepatotoxicidade — evitar uso prolongado e associação com álcool ou hepatotóxicos.' },
  { id: 'lions-mane', nome: "Lion's Mane (Hericium erinaceus)", sinonimos: ['juba de leão', 'hericium'], classe: 'FITOTERAPICO', descricao: 'Cogumelo medicinal estudado para cognição e saúde neurológica.', unidadePadrao: 'mg', doseUsualMin: 500, doseUsualMax: 3000, regulacao: 'LIVRE' },
  { id: 'unha-de-gato', nome: 'Unha de gato extrato seco', sinonimos: ['uncaria tomentosa'], classe: 'FITOTERAPICO', descricao: 'Fitoterápico com ação imunomoduladora e anti-inflamatória.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 500, regulacao: 'LIVRE' },
  { id: 'propolis-verde', nome: 'Própolis verde extrato', sinonimos: [], classe: 'FITOTERAPICO', descricao: 'Antioxidante com propriedades imunológicas e antimicrobianas.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 500, regulacao: 'LIVRE' },
  { id: 'spirulina', nome: 'Spirulina', sinonimos: [], classe: 'FITOTERAPICO', descricao: 'Alga rica em proteínas e antioxidantes.', unidadePadrao: 'mg', doseUsualMin: 500, doseUsualMax: 3000, regulacao: 'LIVRE' },
  { id: 'cranberry', nome: 'Cranberry extrato seco', sinonimos: ['oxicoco', 'vaccinium macrocarpon'], classe: 'FITOTERAPICO', descricao: 'Rico em proantocianidinas tipo A, que reduzem a aderência de E. coli ao urotélio; usado na prevenção de infecção urinária de repetição.', unidadePadrao: 'mg', doseUsualMin: 200, doseUsualMax: 500, regulacao: 'LIVRE', observacoes: 'CORRIGIDO: o acervo original trazia por engano a descrição do Cordia ecalyculata. Padronizar por teor de PAC (36mg/dia). Não trata ITU estabelecida.' },
  { id: 'cordia-ecalyculata', nome: 'Cordia ecalyculata', sinonimos: ['chá-de-bugre', 'porangaba'], classe: 'FITOTERAPICO', descricao: 'Conhecido como chá-de-bugre; usado para controle do apetite e ação diurética.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 500, regulacao: 'LIVRE' },
  { id: 'saw-palmetto', nome: 'Saw palmetto', sinonimos: ['serenoa repens'], classe: 'FITOTERAPICO', descricao: 'Usado em sintomas de hiperplasia prostática benigna e queda de cabelo.', unidadePadrao: 'mg', doseUsualMin: 160, doseUsualMax: 320, regulacao: 'LIVRE', observacoes: 'Pode reduzir o PSA e mascarar rastreio de câncer de próstata.' },
  { id: 'castanha-india', nome: 'Castanha da Índia extrato seco', sinonimos: ['aesculus'], classe: 'FITOTERAPICO', descricao: 'Atua na insuficiência venosa crônica e no edema de membros inferiores.', unidadePadrao: 'mg', doseUsualMin: 250, doseUsualMax: 600, regulacao: 'LIVRE' },
  { id: 'centella', nome: 'Centella asiática', sinonimos: ['gotu kola'], classe: 'FITOTERAPICO', descricao: 'Auxilia circulação, cicatrização e microcirculação cutânea.', unidadePadrao: 'mg', doseUsualMin: 60, doseUsualMax: 300, regulacao: 'LIVRE' },
  { id: 'pinus-pinaster', nome: 'Pinus pinaster extrato seco', sinonimos: ['pycnogenol', 'picnogenol'], classe: 'FITOTERAPICO', descricao: 'Antioxidante que melhora circulação e saúde vascular.', unidadePadrao: 'mg', doseUsualMin: 50, doseUsualMax: 200, regulacao: 'LIVRE' },
  { id: 'cavalinha', nome: 'Cavalinha extrato seco', sinonimos: ['equisetum'], classe: 'FITOTERAPICO', descricao: 'Rica em silício; auxilia pele, cabelo e retenção hídrica.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 500, regulacao: 'LIVRE' },
  { id: 'polypodium', nome: 'Polypodium leucotomos', sinonimos: [], classe: 'FITOTERAPICO', descricao: 'Antioxidante usado para fotoproteção oral da pele.', unidadePadrao: 'mg', doseUsualMin: 240, doseUsualMax: 480, regulacao: 'LIVRE' },
  { id: 'green-tea', nome: 'Green tea extract (chá verde)', sinonimos: ['chá verde', 'camellia sinensis'], classe: 'FITOTERAPICO', descricao: 'Fonte de catequinas antioxidantes com ação termogênica.', unidadePadrao: 'mg', doseUsualMin: 250, doseUsualMax: 500, regulacao: 'LIVRE', observacoes: 'Relatos de hepatotoxicidade em altas doses de extrato concentrado.' },
  { id: 'egcg', nome: 'EGCG (epigalocatequina)', sinonimos: ['epigalocatequina galato'], classe: 'FITOTERAPICO', descricao: 'Catequina antioxidante que auxilia metabolismo e termogênese.', unidadePadrao: 'mg', doseUsualMin: 150, doseUsualMax: 400, regulacao: 'LIVRE', observacoes: 'Limitar a 800mg/dia de EGCG por risco hepático.' },
  { id: 'green-coffee', nome: 'Green coffee extract (café verde)', sinonimos: ['café verde', 'ácido clorogênico'], classe: 'FITOTERAPICO', descricao: 'Rico em ácido clorogênico, auxilia metabolismo da glicose e controle do peso.', unidadePadrao: 'mg', doseUsualMin: 200, doseUsualMax: 800, regulacao: 'LIVRE' },
  { id: 'garcinia', nome: 'Garcinia cambogia', sinonimos: ['hca'], classe: 'FITOTERAPICO', descricao: 'Fitoterápico usado para controle do apetite.', unidadePadrao: 'mg', doseUsualMin: 500, doseUsualMax: 1500, regulacao: 'LIVRE' },
  { id: 'citrus-aurantium', nome: 'Citrus aurantium', sinonimos: ['laranja amarga', 'sinefrina'], classe: 'FITOTERAPICO', descricao: 'Termogênico que auxilia no emagrecimento.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 500, regulacao: 'LIVRE', observacoes: 'Simpatomimético — evitar em hipertensão, arritmia e coronariopatia.' },
  { id: 'citrus-sinensis', nome: 'Citrus sinensis (L. moro)', sinonimos: ['laranja moro'], classe: 'FITOTERAPICO', descricao: 'Extrato da laranja moro rico em antocianinas, associado à redução de gordura corporal.', unidadePadrao: 'mg', doseUsualMin: 200, doseUsualMax: 400, regulacao: 'LIVRE' },
  { id: 'morosil', nome: 'Morosil', sinonimos: [], classe: 'FITOTERAPICO', descricao: 'Extrato padronizado da laranja moro associado à redução de gordura abdominal.', unidadePadrao: 'mg', doseUsualMin: 200, doseUsualMax: 400, regulacao: 'LIVRE' },
  { id: 'citrusim', nome: 'Citrusim', sinonimos: [], classe: 'FITOTERAPICO', descricao: 'Complexo de bioflavonoides cítricos com ação antioxidante e proteção vascular.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 500, regulacao: 'LIVRE' },
  { id: 'capsici', nome: 'Capsici extrato seco', sinonimos: ['capsaicina', 'pimenta'], classe: 'FITOTERAPICO', descricao: 'Derivado da pimenta; aumenta termogênese e metabolismo.', unidadePadrao: 'mg', doseUsualMin: 50, doseUsualMax: 200, regulacao: 'LIVRE' },
  { id: 'faseolamina', nome: 'Faseolamina', sinonimos: ['feijão branco'], classe: 'FITOTERAPICO', descricao: 'Extrato do feijão branco que inibe a alfa-amilase e reduz a absorção de amido.', unidadePadrao: 'mg', doseUsualMin: 500, doseUsualMax: 1500, regulacao: 'LIVRE' },
  { id: 'cassiolamina', nome: 'Cassiolamina', sinonimos: [], classe: 'FITOTERAPICO', descricao: 'Auxilia na redução da absorção de gordura.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 500, regulacao: 'LIVRE' },
  { id: 'cactix', nome: 'Cactix', sinonimos: [], classe: 'FITOTERAPICO', descricao: 'Ativo usado em fórmulas para controle do apetite e emagrecimento.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 500, regulacao: 'LIVRE' },
  { id: 'releptin', nome: 'Releptin', sinonimos: [], classe: 'FITOTERAPICO', descricao: 'Ativo usado em fórmulas de controle de apetite.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 500, regulacao: 'LIVRE' },
  { id: 'crocus-sativus', nome: 'Crocus sativus', sinonimos: ['açafrão', 'safranal'], classe: 'FITOTERAPICO', descricao: 'Pode auxiliar no controle do apetite e no humor.', unidadePadrao: 'mg', doseUsualMin: 15, doseUsualMax: 30, regulacao: 'LIVRE' },
  { id: 'feno-grego', nome: 'Feno grego extrato seco', sinonimos: ['fenugreek', 'trigonella'], classe: 'FITOTERAPICO', descricao: 'Pode auxiliar no controle da glicemia e na testosterona livre.', unidadePadrao: 'mg', doseUsualMin: 300, doseUsualMax: 600, regulacao: 'LIVRE' },
  { id: 'tribulus', nome: 'Tribulus terrestris', sinonimos: [], classe: 'FITOTERAPICO', descricao: 'Fitoterápico associado à libido.', unidadePadrao: 'mg', doseUsualMin: 250, doseUsualMax: 750, regulacao: 'LIVRE', observacoes: 'Não eleva testosterona de forma consistente em humanos.' },
  { id: 'long-jack', nome: 'Long Jack (Tongkat ali)', sinonimos: ['tongkat ali', 'eurycoma'], classe: 'FITOTERAPICO', descricao: 'Fitoterápico usado para testosterona e libido.', unidadePadrao: 'mg', doseUsualMin: 200, doseUsualMax: 400, regulacao: 'LIVRE' },
  { id: 'catuaba', nome: 'Catuaba extrato seco', sinonimos: [], classe: 'FITOTERAPICO', descricao: 'Fitoterápico afrodisíaco e estimulante.', unidadePadrao: 'mg', doseUsualMin: 200, doseUsualMax: 1000, regulacao: 'LIVRE' },
  { id: 'marapuama', nome: 'Marapuama extrato seco', sinonimos: ['muirapuama'], classe: 'FITOTERAPICO', descricao: 'Fitoterápico afrodisíaco e estimulante.', unidadePadrao: 'mg', doseUsualMin: 200, doseUsualMax: 1000, regulacao: 'LIVRE' },
  { id: 'mucuna', nome: 'Mucuna pruriens', sinonimos: ['l-dopa natural'], classe: 'FITOTERAPICO', descricao: 'Fonte natural de L-DOPA; auxilia humor e libido.', unidadePadrao: 'mg', doseUsualMin: 200, doseUsualMax: 800, regulacao: 'LIVRE', observacoes: 'Interage com levodopa e antipsicóticos.' },
  { id: 'amora', nome: 'Amora extrato seco', sinonimos: ['morus'], classe: 'FITOTERAPICO', descricao: 'Rica em antioxidantes; usada em sintomas do climatério.', unidadePadrao: 'mg', doseUsualMin: 250, doseUsualMax: 1000, regulacao: 'LIVRE' },
  { id: 'acai', nome: 'Açaí extrato seco', sinonimos: [], classe: 'FITOTERAPICO', descricao: 'Rico em antocianinas, auxilia proteção celular.', unidadePadrao: 'mg', doseUsualMin: 250, doseUsualMax: 1000, regulacao: 'LIVRE' },
  { id: 'alho', nome: 'Alho (uso interno)', sinonimos: ['allium sativum'], classe: 'FITOTERAPICO', descricao: 'Propriedades cardiovasculares, antioxidantes e antimicrobianas.', unidadePadrao: 'mg', doseUsualMin: 300, doseUsualMax: 1000, regulacao: 'LIVRE', observacoes: 'Pode potencializar anticoagulantes.' },
  { id: 'crisina', nome: 'Crisina', sinonimos: [], classe: 'FITOTERAPICO', descricao: 'Flavonoide estudado como inibidor de aromatase.', unidadePadrao: 'mg', doseUsualMin: 250, doseUsualMax: 1000, regulacao: 'LIVRE', observacoes: 'Biodisponibilidade oral muito baixa.' },
  { id: 'indol-3-carbinol', nome: 'Indol-3-carbinol', sinonimos: ['i3c', 'dim'], classe: 'FITOTERAPICO', descricao: 'Auxilia no metabolismo do estrogênio e no equilíbrio hormonal.', unidadePadrao: 'mg', doseUsualMin: 200, doseUsualMax: 400, regulacao: 'LIVRE' },
  { id: 'ormonelle', nome: 'Ormonelle', sinonimos: [], classe: 'FITOTERAPICO', descricao: 'Complexo nutracêutico para equilíbrio hormonal feminino.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 500, regulacao: 'LIVRE' },
  { id: 'ioimbina', nome: 'Ioimbina HCl', sinonimos: ['yohimbina'], classe: 'FITOTERAPICO', descricao: 'Estimulante alfa-2 antagonista, usado para mobilização de gordura.', unidadePadrao: 'mg', doseUsualMin: 2.5, doseUsualMax: 10, regulacao: 'LIVRE', observacoes: 'Ansiedade, taquicardia e hipertensão são frequentes. Evitar em cardiopatas e ansiosos.' },
  { id: 'teacrina', nome: 'Teacrina', sinonimos: ['teacrine'], classe: 'FITOTERAPICO', descricao: 'Estimulante que melhora energia e foco, sem tolerância rápida como a cafeína.', unidadePadrao: 'mg', doseUsualMin: 50, doseUsualMax: 200, regulacao: 'LIVRE' },
  { id: 'cyanotis-vaga', nome: 'Cyanotis vaga', sinonimos: ['beta-ecdisterona'], classe: 'FITOTERAPICO', descricao: 'Planta rica em ecdisteroides, usada em fórmulas de desempenho físico.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 500, regulacao: 'LIVRE' },
  { id: 'turkesterone', nome: 'Turkesterone', sinonimos: [], classe: 'FITOTERAPICO', descricao: 'Ecdisteroide associado à performance muscular.', unidadePadrao: 'mg', doseUsualMin: 250, doseUsualMax: 500, regulacao: 'LIVRE', observacoes: 'Evidência em humanos é escassa.' },

  // ═══ ANTIOXIDANTES ══════════════════════════════════════════════════════
  { id: 'coenzima-q10', nome: 'Coenzima Q10', sinonimos: ['ubiquinona', 'coq10'], classe: 'ANTIOXIDANTE', descricao: 'Antioxidante que participa da cadeia respiratória mitocondrial.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 300, regulacao: 'LIVRE', observacoes: 'Reposição pertinente em uso crônico de estatina. Pode reduzir efeito da varfarina.' },
  { id: 'acido-alfa-lipoico', nome: 'Ácido alfa lipóico', sinonimos: ['ala', 'ácido tióctico'], classe: 'ANTIOXIDANTE', descricao: 'Antioxidante que atua no metabolismo da glicose e na neuropatia diabética.', unidadePadrao: 'mg', doseUsualMin: 300, doseUsualMax: 600, regulacao: 'LIVRE', observacoes: 'Pode potencializar hipoglicemiantes.' },
  { id: 'resveratrol', nome: 'Resveratrol', sinonimos: [], classe: 'ANTIOXIDANTE', descricao: 'Polifenol associado à saúde cardiovascular e a vias de longevidade.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 500, regulacao: 'LIVRE', observacoes: 'Biodisponibilidade oral baixa; desfechos clínicos em humanos ainda não estabelecidos.' },
  { id: 'resvitech', nome: 'Resvitech', sinonimos: [], classe: 'ANTIOXIDANTE', descricao: 'Complexo antioxidante com resveratrol.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 500, regulacao: 'LIVRE' },
  { id: 'quercetina', nome: 'Quercetina', sinonimos: [], classe: 'ANTIOXIDANTE', descricao: 'Flavonoide antioxidante e anti-inflamatório, estudado como senolítico.', unidadePadrao: 'mg', doseUsualMin: 250, doseUsualMax: 1000, regulacao: 'LIVRE', observacoes: 'Inibe CYP3A4 — revisar interações.' },
  { id: 'nad', nome: 'NAD', sinonimos: ['nadh', 'nicotinamida adenina dinucleotídeo'], classe: 'ANTIOXIDANTE', descricao: 'Coenzima essencial para o metabolismo energético celular.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 500, regulacao: 'LIVRE', observacoes: 'Elevação de NAD+ é plausível, mas benefício clínico em humanos ainda é preliminar.' },
  { id: 'cucumis-melo', nome: 'Cucumis melo (SOD)', sinonimos: ['superóxido dismutase', 'sod'], classe: 'ANTIOXIDANTE', descricao: 'Extrato de melão rico em superóxido dismutase, com ação antioxidante.', unidadePadrao: 'mg', doseUsualMin: 10, doseUsualMax: 140, regulacao: 'LIVRE' },
  { id: 'luteina', nome: 'Luteína', sinonimos: [], classe: 'ANTIOXIDANTE', descricao: 'Carotenoide importante para a saúde macular.', unidadePadrao: 'mg', doseUsualMin: 6, doseUsualMax: 20, regulacao: 'LIVRE' },
  { id: 'acido-ferulico', nome: 'Ácido ferúlico', sinonimos: [], classe: 'ANTIOXIDANTE', descricao: 'Antioxidante usado em fórmulas dermatológicas.', unidadePadrao: '%', doseUsualMin: 0.5, doseUsualMax: 1, regulacao: 'LIVRE' },
  { id: 'acido-malico', nome: 'Ácido málico', sinonimos: [], classe: 'ANTIOXIDANTE', descricao: 'Participa do ciclo de Krebs e pode ajudar na fadiga muscular.', unidadePadrao: 'mg', doseUsualMin: 300, doseUsualMax: 1500, regulacao: 'LIVRE' },
  { id: 'd-ribose', nome: 'D-ribose', sinonimos: [], classe: 'ANTIOXIDANTE', descricao: 'Açúcar que participa da ressíntese de ATP.', unidadePadrao: 'g', doseUsualMin: 3, doseUsualMax: 10, regulacao: 'LIVRE' },

  // ═══ NOOTRÓPICOS ════════════════════════════════════════════════════════
  { id: 'alfa-gpc', nome: 'Alfa GPC', sinonimos: ['alfa-glicerilfosforilcolina'], classe: 'NOOTROPICO', descricao: 'Fonte de colina de alta biodisponibilidade central; precursor de acetilcolina.', unidadePadrao: 'mg', doseUsualMin: 300, doseUsualMax: 600, regulacao: 'LIVRE' },
  { id: 'bitartarato-colina', nome: 'Bitartarato de colina', sinonimos: ['colina'], classe: 'NOOTROPICO', descricao: 'Nutriente importante para memória, função cerebral e metabolismo hepático.', unidadePadrao: 'mg', doseUsualMin: 250, doseUsualMax: 1000, regulacao: 'LIVRE' },
  { id: 'fosfatidilserina', nome: 'Fosfatidilserina', sinonimos: [], classe: 'NOOTROPICO', descricao: 'Fosfolipídio de membrana neuronal, estudado em memória e cognição.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 300, regulacao: 'LIVRE' },
  { id: 'fosfatidilcolina', nome: 'Fosfatidilcolina', sinonimos: [], classe: 'NOOTROPICO', descricao: 'Auxilia saúde hepática e metabolismo de gorduras.', unidadePadrao: 'mg', doseUsualMin: 250, doseUsualMax: 1000, regulacao: 'LIVRE' },

  // ═══ LIPÍDIOS E ÓLEOS ═══════════════════════════════════════════════════
  { id: 'omega-3', nome: 'Ômega-3', sinonimos: ['epa', 'dha', 'óleo de peixe'], classe: 'LIPIDIO', descricao: 'Ácidos graxos essenciais EPA e DHA, com ação anti-inflamatória e redução de triglicérides.', unidadePadrao: 'mg', doseUsualMin: 1000, doseUsualMax: 4000, regulacao: 'LIVRE', observacoes: 'Prescrever pelo teor de EPA+DHA, não pelo peso do óleo. Doses altas podem aumentar risco de fibrilação atrial.' },
  { id: 'super-omega-3', nome: 'Super Ômega-3', sinonimos: [], classe: 'LIPIDIO', descricao: 'Fonte concentrada de EPA e DHA.', unidadePadrao: 'mg', doseUsualMin: 1000, doseUsualMax: 3000, regulacao: 'LIVRE' },
  { id: 'nano-omega-3', nome: 'Nano Ômega-3', sinonimos: [], classe: 'LIPIDIO', descricao: 'Forma de ômega-3 com absorção aumentada.', unidadePadrao: 'mg', doseUsualMin: 500, doseUsualMax: 2000, regulacao: 'LIVRE' },
  { id: 'tcm', nome: 'TCM (triglicerídeos de cadeia média)', sinonimos: ['mct'], classe: 'LIPIDIO', descricao: 'Fonte rápida de energia, absorvida sem necessidade de sais biliares.', unidadePadrao: 'g', doseUsualMin: 5, doseUsualMax: 20, regulacao: 'LIVRE' },
  { id: 'oleo-coco', nome: 'Óleo de coco extra virgem', sinonimos: [], classe: 'LIPIDIO', descricao: 'Rico em triglicerídeos de cadeia média.', unidadePadrao: 'g', doseUsualMin: 5, doseUsualMax: 15, regulacao: 'LIVRE' },
  { id: 'oleo-oliva', nome: 'Óleo de oliva extra virgem', sinonimos: [], classe: 'LIPIDIO', descricao: 'Fonte de gorduras monoinsaturadas e polifenóis.', unidadePadrao: 'mL', doseUsualMin: 5, doseUsualMax: 30, regulacao: 'LIVRE' },
  { id: 'oleo-girassol', nome: 'Óleo de girassol', sinonimos: [], classe: 'LIPIDIO', descricao: 'Fonte de ácidos graxos e vitamina E; muito usado como veículo.', unidadePadrao: 'mL', doseUsualMin: 1, doseUsualMax: 30, regulacao: 'LIVRE' },

  // ═══ HORMÔNIOS ══════════════════════════════════════════════════════════
  { id: 'melatonina', nome: 'Melatonina', sinonimos: [], classe: 'HORMONIO', descricao: 'Hormônio cronobiótico regulador do ciclo sono-vigília.', unidadePadrao: 'mg', doseUsualMin: 0.5, doseUsualMax: 5, regulacao: 'LIVRE', observacoes: 'No idoso, doses baixas (0,5–2mg) 30–60 min antes de deitar costumam ser mais eficazes que doses altas.' },
  { id: 'levotiroxina-sodica', nome: 'Levotiroxina sódica', sinonimos: ['t4'], classe: 'HORMONIO', descricao: 'Hormônio tireoidiano usado na reposição do hipotireoidismo.', unidadePadrao: 'mcg', doseUsualMin: 25, doseUsualMax: 150, regulacao: 'HORMONIO', alertaLegal: 'Hormônio de prescrição médica. Em manipulação, atenção à variabilidade de potência entre lotes — o monitoramento por TSH é obrigatório.', observacoes: 'Tomar em jejum, afastado 4h de cálcio, ferro e IBP.' },
  { id: 'liotironina', nome: 'Liotironina', sinonimos: ['t3'], classe: 'HORMONIO', descricao: 'Hormônio tireoidiano T3 utilizado em terapia hormonal.', unidadePadrao: 'mcg', doseUsualMin: 5, doseUsualMax: 25, regulacao: 'HORMONIO', alertaLegal: 'Hormônio de prescrição médica. Meia-vida curta e risco de tireotoxicose iatrogênica — cautela em idosos e cardiopatas.' },
  { id: 'estradiol', nome: 'Estradiol', sinonimos: ['e2'], classe: 'HORMONIO', descricao: 'Estrogênio utilizado em terapia hormonal da menopausa.', unidadePadrao: 'mg', doseUsualMin: 0.5, doseUsualMax: 2, regulacao: 'HORMONIO', alertaLegal: 'Hormônio de prescrição médica. Exige avaliação de risco tromboembólico e oncológico; associar progestagênio em paciente com útero.' },
  { id: 'estriol', nome: 'Estriol', sinonimos: ['e3'], classe: 'HORMONIO', descricao: 'Estrogênio fraco, usado principalmente na atrofia geniturinária da menopausa.', unidadePadrao: 'mg', doseUsualMin: 0.5, doseUsualMax: 2, regulacao: 'HORMONIO', alertaLegal: 'Hormônio de prescrição médica. Uso vaginal tem absorção sistêmica menor, mas não nula.' },
  { id: 'progesterona-micronizada', nome: 'Progesterona micronizada', sinonimos: [], classe: 'HORMONIO', descricao: 'Progestagênio bioidêntico usado em terapia hormonal.', unidadePadrao: 'mg', doseUsualMin: 100, doseUsualMax: 300, regulacao: 'HORMONIO', alertaLegal: 'Hormônio de prescrição médica. Obrigatório em mulheres com útero que usam estrogênio, para proteção endometrial.' },
  { id: 'prasterona-dhea', nome: 'Prasterona (DHEA)', sinonimos: ['dhea'], classe: 'HORMONIO', descricao: 'Precursor androgênico envolvido na produção hormonal.', unidadePadrao: 'mg', doseUsualMin: 25, doseUsualMax: 50, regulacao: 'C5', alertaLegal: NOTIF_C5, observacoes: 'Evidência de benefício em adultos saudáveis é fraca. Pode aromatizar em estrogênio e reduzir HDL.' },
  { id: 'testosterona-base', nome: 'Testosterona base', sinonimos: [], classe: 'HORMONIO', descricao: 'Androgênio envolvido em massa muscular, libido e densidade óssea.', unidadePadrao: 'mg', doseUsualMin: 10, doseUsualMax: 100, regulacao: 'C5', alertaLegal: NOTIF_C5, observacoes: 'Indicação legítima é o hipogonadismo confirmado laboratorialmente. Monitorar hematócrito, PSA e perfil lipídico.' },
  { id: 'oxandrolona', nome: 'Oxandrolona', sinonimos: [], classe: 'HORMONIO', descricao: 'Esteroide anabólico usado em condições catabólicas específicas.', unidadePadrao: 'mg', doseUsualMin: 2.5, doseUsualMax: 20, regulacao: 'C5', alertaLegal: NOTIF_C5, observacoes: 'Hepatotóxico (17-alfa-alquilado). Uso para fins estéticos ou de performance é vedado pelo CFM.' },
  { id: 'gestrinona', nome: 'Gestrinona', sinonimos: [], classe: 'HORMONIO', descricao: 'Esteroide sintético com indicação original em endometriose.', unidadePadrao: 'mg', doseUsualMin: 1.25, doseUsualMax: 2.5, regulacao: 'RESTRICAO_CFM', alertaLegal: 'ATENÇÃO: não existe implante de gestrinona com registro na ANVISA. O CFM veda a prescrição de implantes hormonais para fins estéticos, de performance ou de "modulação hormonal" sem indicação formal. Prescrever apenas em indicação clínica documentada e por via aprovada.', observacoes: 'Efeitos androgênicos são frequentemente irreversíveis (voz, hirsutismo, alopecia).' },
  { id: 'hidrocortisona', nome: 'Hidrocortisona', sinonimos: [], classe: 'HORMONIO', descricao: 'Corticosteroide com ação anti-inflamatória e imunossupressora.', unidadePadrao: 'mg', doseUsualMin: 5, doseUsualMax: 30, regulacao: 'PRESCRICAO', alertaLegal: 'Corticosteroide de prescrição médica. Uso sistêmico prolongado exige desmame e vigilância de eixo adrenal.' },

  // ═══ FÁRMACOS ═══════════════════════════════════════════════════════════
  { id: 'metformina', nome: 'Metformina HCl', sinonimos: [], classe: 'FARMACO', descricao: 'Primeira linha no diabetes tipo 2 e na resistência à insulina.', unidadePadrao: 'mg', doseUsualMin: 500, doseUsualMax: 2000, regulacao: 'PRESCRICAO', alertaLegal: 'Fármaco de prescrição médica.', observacoes: 'Suspender se ClCr < 30. Uso crônico causa deficiência de B12.' },
  { id: 'dapagliflozina', nome: 'Dapagliflozina', sinonimos: [], classe: 'FARMACO', descricao: 'iSGLT2 com benefício cardiorrenal comprovado.', unidadePadrao: 'mg', doseUsualMin: 5, doseUsualMax: 10, regulacao: 'PRESCRICAO', alertaLegal: 'Fármaco de prescrição médica.', observacoes: 'Vigiar depleção volêmica, ITU/micose genital e cetoacidose euglicêmica.' },
  { id: 'empagliflozina', nome: 'Empagliflozina', sinonimos: [], classe: 'FARMACO', descricao: 'iSGLT2 com redução de mortalidade cardiovascular.', unidadePadrao: 'mg', doseUsualMin: 10, doseUsualMax: 25, regulacao: 'PRESCRICAO', alertaLegal: 'Fármaco de prescrição médica.' },
  { id: 'espironolactona', nome: 'Espironolactona', sinonimos: [], classe: 'FARMACO', descricao: 'Antagonista da aldosterona, usado também em acne e SOP.', unidadePadrao: 'mg', doseUsualMin: 25, doseUsualMax: 100, regulacao: 'PRESCRICAO', alertaLegal: 'Fármaco de prescrição médica.', observacoes: 'Monitorar potássio e função renal.' },
  { id: 'hidroclorotiazida', nome: 'Hidroclorotiazida', sinonimos: [], classe: 'FARMACO', descricao: 'Diurético tiazídico para hipertensão e retenção hídrica.', unidadePadrao: 'mg', doseUsualMin: 12.5, doseUsualMax: 50, regulacao: 'PRESCRICAO', alertaLegal: 'Fármaco de prescrição médica.', observacoes: 'Vigiar hiponatremia e hipocalemia no idoso.' },
  { id: 'fluoxetina', nome: 'Fluoxetina HCl', sinonimos: [], classe: 'FARMACO', descricao: 'Antidepressivo ISRS.', unidadePadrao: 'mg', doseUsualMin: 10, doseUsualMax: 40, regulacao: 'C1', alertaLegal: CTRL_C1 },
  { id: 'bupropiona', nome: 'Bupropiona', sinonimos: [], classe: 'FARMACO', descricao: 'Antidepressivo dopaminérgico e noradrenérgico; também usado na cessação do tabagismo.', unidadePadrao: 'mg', doseUsualMin: 150, doseUsualMax: 300, regulacao: 'C1', alertaLegal: CTRL_C1, observacoes: 'Reduz o limiar convulsivo — contraindicado em epilepsia e distúrbio alimentar.' },
  { id: 'topiramato', nome: 'Topiramato', sinonimos: [], classe: 'FARMACO', descricao: 'Anticonvulsivante usado também na profilaxia de enxaqueca e no controle de peso.', unidadePadrao: 'mg', doseUsualMin: 25, doseUsualMax: 200, regulacao: 'C1', alertaLegal: CTRL_C1, observacoes: 'Parestesia, lentificação cognitiva e risco de nefrolitíase.' },
  { id: 'naltrexona', nome: 'Naltrexona', sinonimos: ['ldn', 'naltrexona em baixa dose'], classe: 'FARMACO', descricao: 'Antagonista opioide usado em dependências e, em baixa dose, em protocolos de modulação imune e dor.', unidadePadrao: 'mg', doseUsualMin: 1.5, doseUsualMax: 50, regulacao: 'PRESCRICAO', alertaLegal: 'Fármaco de prescrição médica.', observacoes: 'O uso em baixa dose (LDN, 1,5–4,5mg) é off-label, com evidência ainda preliminar. Contraindicado em uso de opioides.' },
  { id: 'anastrozol', nome: 'Anastrozol', sinonimos: [], classe: 'FARMACO', descricao: 'Inibidor da aromatase utilizado para controle de estrogênio.', unidadePadrao: 'mg', doseUsualMin: 0.25, doseUsualMax: 1, regulacao: 'PRESCRICAO', alertaLegal: 'Fármaco de prescrição médica. Indicação registrada é oncológica; uso para modulação hormonal é off-label e exige justificativa formal.', observacoes: 'Reduz densidade mineral óssea.' },
  { id: 'dutasterida', nome: 'Dutasterida', sinonimos: [], classe: 'FARMACO', descricao: 'Inibidor da 5-alfa-redutase para hiperplasia prostática e alopecia androgenética.', unidadePadrao: 'mg', doseUsualMin: 0.5, doseUsualMax: 0.5, regulacao: 'PRESCRICAO', alertaLegal: 'Fármaco de prescrição médica.', observacoes: 'Reduz o PSA pela metade — corrigir na interpretação do rastreio.' },
  { id: 'tadalafila', nome: 'Tadalafila', sinonimos: [], classe: 'FARMACO', descricao: 'Inibidor de PDE5 usado em disfunção erétil e sintomas de HPB.', unidadePadrao: 'mg', doseUsualMin: 2.5, doseUsualMax: 20, regulacao: 'PRESCRICAO', alertaLegal: 'Fármaco de prescrição médica.', observacoes: 'Contraindicado com nitratos — risco de hipotensão grave.' },
  { id: 'orlistate', nome: 'Orlistate', sinonimos: [], classe: 'FARMACO', descricao: 'Inibidor de lipase que reduz a absorção de gorduras.', unidadePadrao: 'mg', doseUsualMin: 60, doseUsualMax: 120, regulacao: 'PRESCRICAO', alertaLegal: 'Fármaco de prescrição médica.', observacoes: 'Reduz absorção de vitaminas lipossolúveis — suplementar afastado da dose.' },
  { id: 'sulfato-minoxidil', nome: 'Sulfato de minoxidil', sinonimos: ['minoxidil'], classe: 'FARMACO', descricao: 'Ativo usado no tratamento da alopecia, estimulando o crescimento capilar.', unidadePadrao: '%', doseUsualMin: 2, doseUsualMax: 5, regulacao: 'PRESCRICAO', alertaLegal: 'Fármaco de prescrição médica quando em uso oral; tópico exige orientação médica.' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const POR_ID = new Map(ATIVOS.map((a) => [a.id, a]));

/** Busca um ativo pelo id do acervo. */
export function getAtivo(id: string): AtivoManipulado | undefined {
  return POR_ID.get(id);
}

/** Remove acentos e caixa — busca tolerante, mesmo padrão de src/data/medicamentos.ts. */
export function normalizarAtivo(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Busca por nome, sinônimo, classe ou descrição. "P5P" acha piridoxal-5-fosfato. */
export function buscarAtivos(termo: string): AtivoManipulado[] {
  const q = normalizarAtivo(termo);
  if (!q) return ATIVOS;
  return ATIVOS.filter((a) =>
    normalizarAtivo(`${a.nome} ${a.sinonimos.join(' ')} ${a.descricao}`).includes(q)
  );
}

/** True quando o ativo obriga a receita a sair em 2 vias (C1 ou C5). */
export function exige2Vias(ativo: AtivoManipulado): boolean {
  return REGULACAO_INFO[ativo.regulacao].exige2Vias;
}

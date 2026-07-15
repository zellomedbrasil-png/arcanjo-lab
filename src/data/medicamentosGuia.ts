// src/data/medicamentosGuia.ts
// Dados do "Guia Clínico de Prescrição Rápida" da página de Receituário.
//
// Extraído de NovaReceita.tsx para cá: dados clínicos mudam com o elenco do
// SUS (RENAME/lista PFPB), então viver num arquivo só de dados permite
// atualizar sem tocar em componente.
//
// Gratuidade (campo `gratuito`): atribuição MANUAL por medicamento, baseada em
// Portaria GM/MS 6.613/2025 · RENAME 2024 · lista EAN PFPB mar/2026. Não é
// inferida — ao atualizar o elenco, edite aqui.

import type { TipoRecomendado } from '../store/useReceitaStore';

/** Canal de acesso gratuito na rede pública. */
export type CanalGratuito = 'FP' | 'CBAF' | 'CEAF';

export interface InfoGratuito {
  canal: CanalGratuito;
  /** Observação de acesso/clínica exibida no card (ex.: exigência de LME). */
  nota?: string;
}

export interface MedicamentoPreset {
  nome: string;
  principioAtivo: string;
  formaFarmaceutica: string;
  uso: string;
  posologia: string;
  quantidade: string;
  duracao: string;
  tipoRecomendado: TipoRecomendado;
  explicacao: string;
  /** Presente quando o medicamento é gratuito na rede pública. */
  gratuito?: InfoGratuito;
}

/** Rótulo e descrição de cada canal — fonte única para selos e legenda. */
export const CANAL_INFO: Record<CanalGratuito, { rotulo: string; descricao: string }> = {
  FP: {
    rotulo: 'FARM. POPULAR',
    descricao: 'Gratuito em drogarias credenciadas. Aceita receita particular/telemedicina. Receita vale 180 dias.',
  },
  CBAF: {
    rotulo: 'UBS',
    descricao: 'Retirada na farmácia da Unidade Básica de Saúde. Disponibilidade varia por município.',
  },
  CEAF: {
    rotulo: 'ALTO CUSTO',
    descricao: 'Componente Especializado — exige LME/PCDT, dispensação em farmácia estadual (APAC).',
  },
};

// ─── Geriátricos ────────────────────────────────────────────────────────────

export const GERIATRICO_PRESETS: MedicamentoPreset[] = [
  {
    nome: 'Losartana 50mg',
    principioAtivo: 'Losartana Potássica 50mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral uma vez ao dia, pela manhã.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Anti-hipertensivo de primeira escolha em idosos. Poupa a função renal e apresenta baixíssimo risco de efeitos colaterais graves.',
    gratuito: { canal: 'FP' },
  },
  {
    nome: 'Metformina 850mg',
    principioAtivo: 'Metformina Cloridrato 850mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral ao dia, imediatamente após o jantar.',
    quantidade: '60 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Tratamento padrão-ouro para Diabetes Mellitus tipo 2. Excelente perfil de segurança cardiovascular. Monitorar função renal (ClCr).',
    gratuito: { canal: 'FP' },
  },
  {
    nome: 'Sertralina 50mg',
    principioAtivo: 'Sertralina Cloridrato 50mg',
    formaFarmaceutica: 'Comprimidos revestidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral pela manhã.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    explicacao: 'Antidepressivo (ISRS) mais seguro e estudado para idosos. Baixa interação medicamentosa, bem tolerado e não causa sedação.',
    gratuito: { canal: 'CBAF' },
  },
  {
    nome: 'Donepezila 5mg',
    principioAtivo: 'Donepezila Cloridrato 5mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral à noite, antes de deitar.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    explicacao: 'Inibidor da acetilcolinesterase indicado para demência de Alzheimer leve a moderada. Melhora cognitiva e funcional.',
    gratuito: { canal: 'CEAF', nota: 'PCDT Alzheimer — dispensação via LME/farmácia estadual' },
  },
  {
    nome: 'Memantina 10mg',
    principioAtivo: 'Memantina Cloridrato 10mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral pela manhã.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    explicacao: 'Antagonista NMDA para demência de Alzheimer moderada a grave. Pode ser associado à Donepezila para maior eficácia.',
    gratuito: { canal: 'CEAF', nota: 'PCDT Alzheimer — dispensação via LME/farmácia estadual' },
  },
  {
    nome: 'Carbonato de Cálcio + Vit. D3',
    principioAtivo: 'Carbonato de Cálcio 1250mg (500mg Ca elementar) + Colecalciferol (Vit. D3) 400 UI',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral ao dia, durante uma refeição principal.',
    quantidade: '60 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Suplementação mineral e vitamínica essencial na prevenção e tratamento de osteopenia e osteoporose senil.',
    gratuito: { canal: 'CBAF', nota: 'Prescrever a combinação: colecalciferol isolado não consta na RENAME' },
  },
  {
    nome: 'Anlodipino 5mg',
    principioAtivo: 'Anlodipino Besilato 5mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral ao dia, pela manhã.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Vasodilatador de canal de cálcio potente para controle da HAS sistólica isolada no idoso. Atenção a edemas de MMII.',
    gratuito: { canal: 'FP' },
  },
  {
    nome: 'Atorvastatina 20mg',
    principioAtivo: 'Atorvastatina Cálcica 20mg',
    formaFarmaceutica: 'Comprimidos revestidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral à noite.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Estatina de alta potência indicada para prevenção secundária de eventos cardiovasculares (IAM, AVC).',
  },
  {
    nome: 'AAS Infantil 100mg',
    principioAtivo: 'Ácido Acetilsalicílico 100mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral após o almoço.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Antiagregante plaquetário de baixo custo amplamente utilizado na prevenção de eventos trombóticos em idosos de alto risco.',
    gratuito: { canal: 'CBAF' },
  },
  {
    nome: 'Pramipexol 0,25mg',
    principioAtivo: 'Pramipexol Dicloridrato 0,25mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral à noite.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    explicacao: 'Agonista dopaminérgico indicado para Doença de Parkinson e Síndrome das Pernas Inquietas. Iniciar com doses baixas.',
    gratuito: { canal: 'CEAF', nota: 'PCDT Doença de Parkinson — LME' },
  },
];

// ─── Gastroenterologia ──────────────────────────────────────────────────────

export const GASTRO_PRESETS: MedicamentoPreset[] = [
  {
    nome: 'Omeprazol 20mg',
    principioAtivo: 'Omeprazol 20mg',
    formaFarmaceutica: 'Cápsulas gastrorresistentes',
    uso: 'Uso oral',
    posologia: 'Tomar 1 cápsula por via oral em jejum, de 20 a 30 minutos antes do café da manhã.',
    quantidade: '30 cápsulas',
    duracao: '28 dias',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Inibidor da Bomba de Prótons (IBP) indicado para tratamento de DRGE, gastrite, úlceras pépticas e profilaxia gástrica.',
    gratuito: { canal: 'CBAF', nota: 'Farmácia Popular NÃO cobre IBP — retirar na UBS' },
  },
  {
    nome: 'Pantoprazol 40mg',
    principioAtivo: 'Pantoprazol Sódico Sesqui-hidratado 40mg',
    formaFarmaceutica: 'Comprimidos gastrorresistentes',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral em jejum, pela manhã.',
    quantidade: '28 comprimidos',
    duracao: '28 dias',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'IBP potente com menor taxa de interação medicamentosa sistêmica. Ideal para pacientes em polifarmácia.',
  },
  {
    nome: 'Domperidona 10mg',
    principioAtivo: 'Domperidona 10mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral 15 minutos antes do almoço e do jantar.',
    quantidade: '30 comprimidos',
    duracao: '15 dias',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Antagonista dopaminérgico pró-cinético. Indicado para refluxo gastroesofágico, dispepsia funcional e esvaziamento retardado.',
  },
  {
    nome: 'Bromoprida 10mg',
    principioAtivo: 'Bromoprida 10mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 8 em 8 horas (se náuseas ou dor).',
    quantidade: '20 comprimidos',
    duracao: 'Em caso de sintomas',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Excelente antiemético e regulador da motilidade gastrointestinal. Alivia náuseas, vômitos e soluços.',
    gratuito: { canal: 'CBAF' },
  },
  {
    nome: 'Buscopan Composto',
    principioAtivo: 'Butilbrometo de Escopolamina 10mg + Dipirona Monoidratada 500mg',
    formaFarmaceutica: 'Comprimidos revestidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 6 em 6 horas ou de 8 em 8 horas se dor ou cólica.',
    quantidade: '20 comprimidos',
    duracao: 'Em caso de dor',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Combinação potente de antiespasmódico com analgésico. Alivia cólicas biliares, intestinais e renais.',
  },
  {
    nome: 'Simeticona 75mg/ml',
    principioAtivo: 'Simeticona 75mg/ml',
    formaFarmaceutica: 'Frasco gotejador (gotas)',
    uso: 'Uso oral',
    posologia: 'Tomar 30 gotas por via oral de 8 em 8 horas se excesso de gases ou distensão.',
    quantidade: '1 frasco',
    duracao: 'Em caso de sintomas',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Dispersa as bolhas de gás no trato gastrointestinal, aliviando o estufamento e dores causadas por flatulência.',
  },
  {
    nome: 'Lactulose 667mg/ml',
    principioAtivo: 'Lactulose 667mg/ml',
    formaFarmaceutica: 'Xarope (frasco)',
    uso: 'Uso oral',
    posologia: 'Tomar 15ml por via oral ao dia, de preferência em dose única pela manhã.',
    quantidade: '1 frasco de 120ml',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Laxante osmótico fisiológico. Não causa dependência de trânsito intestinal e é seguro para uso prolongado e em idosos.',
    gratuito: { canal: 'CBAF' },
  },
  {
    nome: 'Macrogol 3350',
    principioAtivo: 'Macrogol 3350 puro',
    formaFarmaceutica: 'Sachê em pó',
    uso: 'Uso oral',
    posologia: "Diluir 1 sachê em um copo d'água (200ml) e tomar uma vez ao dia, pela manhã.",
    quantidade: '30 sachês',
    duracao: '30 dias',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Laxante osmótico moderno padrão-ouro. Sem sabor, bem tolerado e altamente recomendado para idosos com constipação.',
  },
  {
    nome: 'Floratil 200mg',
    principioAtivo: 'Saccharomyces boulardii 200mg',
    formaFarmaceutica: 'Cápsulas',
    uso: 'Uso oral',
    posologia: 'Tomar 1 cápsula por via oral de 12 em 12 horas.',
    quantidade: '10 cápsulas',
    duracao: '5 dias',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Probiótico composto por leveduras benéficas. Trata e previne diarreias agudas induzidas por antibióticos ou infecções.',
  },
  {
    nome: 'Mesalazina 800mg',
    principioAtivo: 'Mesalazina 800mg',
    formaFarmaceutica: 'Comprimidos de liberação prolongada',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 8 em 8 horas.',
    quantidade: '90 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Anti-inflamatório de ação local no cólon, indicado para tratamento e manutenção da Retocolite Ulcerativa e Doença de Crohn.',
    gratuito: { canal: 'CEAF', nota: 'PCDT Retocolite Ulcerativa — LME/APAC' },
  },
];

// ─── SUS Gratuitos (aba própria, agrupada por canal) ────────────────────────

export const SUS_PRESETS: MedicamentoPreset[] = [
  // Farmácia Popular — receita particular aceita, retirada em drogaria credenciada
  {
    nome: 'Hidroclorotiazida 25mg',
    principioAtivo: 'Hidroclorotiazida 25mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral pela manhã.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Diurético tiazídico de primeira linha para HAS, com décadas de evidência em desfechos cardiovasculares.',
    gratuito: { canal: 'FP' },
  },
  {
    nome: 'Enalapril 10mg',
    principioAtivo: 'Maleato de Enalapril 10mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas.',
    quantidade: '60 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'IECA clássico para HAS e IC com fração de ejeção reduzida. Vigiar tosse seca e potássio.',
    gratuito: { canal: 'FP' },
  },
  {
    nome: 'Espironolactona 25mg',
    principioAtivo: 'Espironolactona 25mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral pela manhã.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Antagonista da aldosterona para IC e HAS resistente.',
    gratuito: { canal: 'FP', nota: 'Monitorar potássio e função renal' },
  },
  {
    nome: 'Gliclazida 30mg MR',
    principioAtivo: 'Gliclazida 30mg (liberação modificada)',
    formaFarmaceutica: 'Comprimidos de liberação modificada',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral pela manhã, no café.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Sulfonilureia de segunda geração para DM2.',
    gratuito: { canal: 'FP', nota: 'Preferir à glibenclamida em idosos — menor hipoglicemia (Beers)' },
  },
  {
    nome: 'Dapagliflozina 10mg',
    principioAtivo: 'Dapagliflozina 10mg',
    formaFarmaceutica: 'Comprimidos revestidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral pela manhã.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'iSGLT2 para DM2 com benefício cardiorrenal comprovado.',
    gratuito: { canal: 'FP', nota: 'Vigiar depleção volêmica, ITU e cetoacidose euglicêmica' },
  },
  {
    nome: 'Sinvastatina 40mg',
    principioAtivo: 'Sinvastatina 40mg',
    formaFarmaceutica: 'Comprimidos revestidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral à noite.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Estatina para dislipidemia e prevenção cardiovascular.',
    gratuito: { canal: 'FP', nota: 'Estatina coberta pela FP (alternativa gratuita à atorvastatina)' },
  },
  {
    nome: 'Insulina NPH 100 UI/ml',
    principioAtivo: 'Insulina Humana NPH 100 UI/ml',
    formaFarmaceutica: 'Frasco-ampola 10ml',
    uso: 'Uso subcutâneo',
    posologia: 'Aplicar por via subcutânea conforme esquema individualizado (ex.: 10 UI à noite), ajustando pela glicemia capilar.',
    quantidade: '2 frascos-ampola',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Insulina basal humana para DM2 insulino-requerente.',
    gratuito: { canal: 'FP', nota: 'Insulina Regular também disponível na FP' },
  },
  {
    nome: 'Alendronato de Sódio 70mg',
    principioAtivo: 'Alendronato de Sódio 70mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral 1 vez por semana, em jejum, com um copo de água; permanecer ereto por 30 minutos.',
    quantidade: '4 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Bisfosfonato semanal para osteoporose, reduz risco de fratura vertebral e de quadril.',
    gratuito: { canal: 'FP' },
  },
  {
    nome: 'Salbutamol 100mcg spray',
    principioAtivo: 'Sulfato de Salbutamol 100mcg/dose',
    formaFarmaceutica: 'Aerossol dosimetrado',
    uso: 'Uso inalatório',
    posologia: 'Inalar 2 jatos em caso de dispneia ou sibilância, até 4 vezes ao dia.',
    quantidade: '1 frasco (200 doses)',
    duracao: 'Em caso de sintomas',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Broncodilatador de resgate para asma e DPOC.',
    gratuito: { canal: 'FP', nota: 'Ipratrópio e beclometasona também cobertos pela FP' },
  },
  {
    nome: 'Fralda Geriátrica',
    principioAtivo: 'Fralda descartável geriátrica',
    formaFarmaceutica: 'Fralda descartável tamanho adequado ao paciente',
    uso: 'Uso externo',
    posologia: 'Utilizar conforme necessidade, até 4 unidades ao dia.',
    quantidade: '120 unidades/mês',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Insumo coberto pela Farmácia Popular para incontinência.',
    gratuito: { canal: 'FP', nota: 'Exige 60+ anos ou PcD com CID no laudo/receita' },
  },
  // CBAF — retirada na UBS
  {
    nome: 'Sulfato Ferroso 40mg Fe',
    principioAtivo: 'Sulfato Ferroso (40mg de ferro elementar)',
    formaFarmaceutica: 'Comprimidos revestidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral 1 hora antes do almoço.',
    quantidade: '90 comprimidos',
    duracao: '90 dias',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Reposição de ferro para anemia ferropriva.',
    gratuito: { canal: 'CBAF', nota: 'Absorção melhora com vitamina C; afastar de antiácidos' },
  },
  {
    nome: 'Ácido Fólico 5mg',
    principioAtivo: 'Ácido Fólico 5mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral ao dia.',
    quantidade: '30 comprimidos',
    duracao: '30 dias',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Correção de deficiência de folato e anemia macrocítica.',
    gratuito: { canal: 'CBAF' },
  },
  {
    nome: 'Cianocobalamina 1000mcg/ml',
    principioAtivo: 'Cianocobalamina (Vitamina B12) 1000mcg/ml',
    formaFarmaceutica: 'Ampolas injetáveis',
    uso: 'Uso intramuscular',
    posologia: 'Aplicar 1 ampola por via intramuscular 1 vez por semana por 4 semanas; após, 1 ampola mensal.',
    quantidade: '4 ampolas',
    duracao: 'Conforme reposição',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Reposição de B12 em anemia perniciosa e má absorção.',
    gratuito: { canal: 'CBAF', nota: 'A apresentação injetável é a que consta na RENAME' },
  },
  {
    nome: 'Metoclopramida 10mg',
    principioAtivo: 'Cloridrato de Metoclopramida 10mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 8 em 8 horas, se náuseas ou vômitos.',
    quantidade: '20 comprimidos',
    duracao: 'Em caso de sintomas',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Antiemético e pró-cinético disponível na rede básica.',
    gratuito: { canal: 'CBAF', nota: 'Beers: risco extrapiramidal em idosos — usar pelo menor tempo possível' },
  },
  // CEAF — alto custo, via LME/PCDT
  {
    nome: 'Ácido Ursodesoxicólico 300mg',
    principioAtivo: 'Ácido Ursodesoxicólico 300mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas.',
    quantidade: '60 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Indicado em colestase e colangite biliar primária.',
    gratuito: { canal: 'CEAF', nota: 'Dispensação via LME/farmácia estadual (PCDT específico)' },
  },
  {
    nome: 'Azatioprina 50mg',
    principioAtivo: 'Azatioprina 50mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 2 comprimidos por via oral ao dia (ajustar para ~2mg/kg/dia).',
    quantidade: '60 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    explicacao: 'Imunossupressor para DII (Crohn/RCU) em manutenção.',
    gratuito: { canal: 'CEAF', nota: 'PCDT — LME/APAC; monitorar hemograma e hepatograma' },
  },
];

/** Nota informativa do grupo CEAF — itens sem card prescrevível. */
export const CEAF_NOTA_INFORMATIVA =
  'Também 100% gratuitos via PCDT (sem card aqui): hepatite B (tenofovir, entecavir), ' +
  'hepatite C (sofosbuvir/velpatasvir e associações) e biológicos para DII ' +
  '(adalimumabe, infliximabe) — prescrição via LME nos serviços de referência.';

/** Alertas clínicos e de acesso exibidos na aba SUS. */
export const SUS_ALERTAS: string[] = [
  'A Farmácia Popular NÃO cobre medicamentos gastro (IBP, procinético, antiespasmódico) — o acesso é pelo CBAF, retirando na UBS.',
  'Colecalciferol isolado (vitamina D em monodroga) não consta na RENAME — para acesso gratuito, prescreva a combinação cálcio + vitamina D3.',
  'Metoclopramida: critério de Beers — risco de efeitos extrapiramidais e discinesia tardia em idosos; menor dose e menor duração.',
  'Ranitidina foi retirada do mercado (contaminação por NDMA) — substituir por IBP via UBS.',
  'Dapagliflozina: vigiar depleção volêmica, ITU/micose genital e cetoacidose euglicêmica; suspender em intercorrência aguda ou jejum prolongado.',
  'Fralda geriátrica: exige 60+ anos ou PcD; para deficiência, o laudo/atestado deve conter o CID.',
];

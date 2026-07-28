import type { TipoGuia } from '../types';

export type ProcedimentoId = Exclude<TipoGuia, 'LABORATORIO'>;

export type ProcedimentoGrupo =
  | 'CARDIOLOGIA'
  | 'ULTRASSONOGRAFIA'
  | 'ARTICULACOES'
  | 'ENDOSCOPIA'
  | 'GASTRO_FUNCIONAL'
  | 'IMAGEM'
  | 'GERIATRIA'
  | 'MASTOLOGIA'
  | 'GINECOLOGIA'
  | 'UROLOGIA';

export interface ProcedimentoDef {
  id: ProcedimentoId;
  nome: string;
  nomeCurto: string;
  grupo: ProcedimentoGrupo;
  hasAsterisk?: boolean;
  codIssec?: string;
  codIpm?: string;
  detalhes?: string;
}

export const PROCEDIMENTOS: ProcedimentoDef[] = [
  // ── CARDIOLOGIA ──────────────────────────────────────────────────
  { id: 'ECOCARDIOGRAMA',       nome: 'Ecocardiograma Transtorácico (Eco Bidimensional)',       nomeCurto: 'Ecocardiograma TT',          grupo: 'CARDIOLOGIA', hasAsterisk: true, codIpm: '40901106', codIssec: '20010109', detalhes: 'Eco Bidimensional ISSEC: 20010109' },
  { id: 'ECODOPPLER',           nome: 'Ecodopplercardiograma Transtorácico',                    nomeCurto: 'Ecodoppler TT',              grupo: 'CARDIOLOGIA', hasAsterisk: true, codIpm: '40901106', codIssec: '20010133', detalhes: 'Eco c/ Doppler ISSEC: 20010133' },
  { id: 'MAPA',                 nome: 'MAPA - Monitoramento Ambulatorial da Pressão 24h',       nomeCurto: 'MAPA 24h',                   grupo: 'CARDIOLOGIA', hasAsterisk: true, codIpm: '20102038', codIssec: '20020058' },
  { id: 'HOLTER',               nome: 'Holter 24h - Eletrocardiografia de Longa Duração',       nomeCurto: 'Holter 24h',                 grupo: 'CARDIOLOGIA', hasAsterisk: true, codIpm: '20102011', codIssec: '20102020' },
  { id: 'ECG',                  nome: 'Eletrocardiograma (ECG)',                                nomeCurto: 'ECG',                        grupo: 'CARDIOLOGIA', hasAsterisk: true, codIpm: '40101010', codIssec: '40101010' },
  { id: 'TEST_ERGOMETRICO',     nome: 'Teste Ergométrico (Teste de Esforço)',                   nomeCurto: 'Teste Ergométrico',           grupo: 'CARDIOLOGIA' },
  { id: 'ANGIOTC_CORONARIA',    nome: 'Angiotomografia de Coronárias (Score de Cálcio)',        nomeCurto: 'AngioTC Coronária',           grupo: 'CARDIOLOGIA' },
  { id: 'ECOSTRESS',            nome: 'Ecocardiograma de Estresse (com Dobutamina)',            nomeCurto: 'Eco de Estresse',             grupo: 'CARDIOLOGIA' },
  { id: 'DOPPLER_MEMBROS',      nome: 'Doppler de Membros Inferiores (Arterial e Venoso)',      nomeCurto: 'Doppler MMII (Geral)',       grupo: 'CARDIOLOGIA' },

  // ── ULTRASSONOGRAFIA & DOPPLER ─────────────────────────────────────
  { id: 'US_ABD_TOTAL',         nome: 'Ultrassonografia do Abdome Total',                       nomeCurto: 'US Abdome Total',            grupo: 'ULTRASSONOGRAFIA', hasAsterisk: true, codIpm: '40901122', codIssec: '33010021' },
  { id: 'US_ABD_TOTAL_DOPPLER', nome: 'Ultrassonografia do Abdome Total com Doppler',           nomeCurto: 'US Abdome Total c/ Doppler', grupo: 'ULTRASSONOGRAFIA', codIssec: '3301002D' },
  { id: 'US_ABD_SUPERIOR',      nome: 'Ultrassonografia do Abdome Superior',                    nomeCurto: 'US Abdome Superior',         grupo: 'ULTRASSONOGRAFIA', codIpm: '40901130' },
  { id: 'US_PELVICO',           nome: 'Ultrassonografia Pélvica',                               nomeCurto: 'US Pélvico',                 grupo: 'ULTRASSONOGRAFIA', hasAsterisk: true, codIpm: '40901181', codIssec: '33010137' },
  { id: 'US_TRANSVAGINAL',      nome: 'Ultrassonografia Transvaginal',                          nomeCurto: 'US Transvaginal',            grupo: 'ULTRASSONOGRAFIA', hasAsterisk: true, codIpm: '40901300', codIssec: '33010145' },
  { id: 'US_TRANSVAGINAL_DOPPLER', nome: 'Ultrassonografia Transvaginal com Doppler',           nomeCurto: 'US Transvaginal c/ Doppler', grupo: 'ULTRASSONOGRAFIA', codIssec: '3301014D' },
  { id: 'US_PROSTATA',          nome: 'Ultrassonografia de Próstata via Abdominal',             nomeCurto: 'US Próstata via Abdominal',  grupo: 'ULTRASSONOGRAFIA', hasAsterisk: true, codIpm: '40901173', codIssec: '33010153' },
  { id: 'US_TIREOIDE',          nome: 'Ultrassonografia de Tireoide',                           nomeCurto: 'US Tireoide',                grupo: 'ULTRASSONOGRAFIA', hasAsterisk: true, codIpm: '40901203', codIssec: '3301012B' },
  { id: 'US_TIREOIDE_DOPPLER',  nome: 'Ultrassonografia de Tireoide com Doppler',               nomeCurto: 'US Tireoide c/ Doppler',     grupo: 'ULTRASSONOGRAFIA', codIssec: '3301012R' },
  { id: 'US_BOLSA_ESCROTAL',    nome: 'Ultrassonografia de Bolsa Escrotal / Testículos',        nomeCurto: 'US Bolsa Escrotal',          grupo: 'ULTRASSONOGRAFIA', codIpm: '40901203' },
  { id: 'US_BOLSA_ESCROTAL_DOPPLER', nome: 'Ultrassonografia de Bolsa Escrotal com Doppler',    nomeCurto: 'US Bolsa Escrotal c/ Doppler', grupo: 'ULTRASSONOGRAFIA', codIssec: '3301012P' },
  { id: 'US_CERVICAL',          nome: 'Ultrassonografia Cervical',                              nomeCurto: 'US Cervical',                grupo: 'ULTRASSONOGRAFIA', codIpm: '40901211', codIssec: '3301012C' },
  { id: 'US_CERVICAL_DOPPLER',  nome: 'Ultrassonografia Cervical com Doppler',                  nomeCurto: 'US Cervical c/ Doppler',     grupo: 'ULTRASSONOGRAFIA', codIssec: '3301012S' },
  { id: 'US_AXILAS',            nome: 'Ultrassonografia de Axilas',                             nomeCurto: 'US Axilas',                  grupo: 'ULTRASSONOGRAFIA', codIpm: '40901211', codIssec: '3301012E' },
  { id: 'US_PAREDE_ABD',        nome: 'Ultrassonografia de Parede Abdominal / Est. Superficiais', nomeCurto: 'US Parede Abdominal',    grupo: 'ULTRASSONOGRAFIA', codIpm: '40901211', codIssec: '3301012E' },
  { id: 'US_VIAS_BILIARES',     nome: 'Ultrassonografia de Vias Biliares e Fígado',             nomeCurto: 'US Vias Biliares / Fígado', grupo: 'ULTRASSONOGRAFIA', hasAsterisk: true },
  { id: 'US_MAMA_BILATERAL',    nome: 'Ultrassonografia Mamária Bilateral',                     nomeCurto: 'US Mamas Bilateral',         grupo: 'ULTRASSONOGRAFIA', codIpm: '40901114', codIssec: '3301012A' },
  { id: 'US_RENAL',             nome: 'Ultrassonografia Renal e de Vias Urinárias',             nomeCurto: 'US Vias Urinárias / Ap. Urinário', grupo: 'ULTRASSONOGRAFIA', codIpm: '40901157', codIssec: '33010030', detalhes: 'IPM Masc: 40901165 | IPM Fem: 40901157' },
  { id: 'US_VIAS_URINARIAS_FEM',nome: 'Ultrassonografia de Vias Urinárias Feminina',            nomeCurto: 'US Vias Urinárias (F)',     grupo: 'ULTRASSONOGRAFIA', codIpm: '40901157', codIssec: '33010030' },
  { id: 'US_VIAS_URINARIAS_MASC',nome: 'Ultrassonografia de Vias Urinárias Masculina',           nomeCurto: 'US Vias Urinárias (M)',     grupo: 'ULTRASSONOGRAFIA', codIpm: '40901165', codIssec: '33010030' },
  { id: 'US_PARTES_MOLES',      nome: 'Ultrassonografia de Partes Moles (Face / Inguinal)',     nomeCurto: 'US Partes Moles',            grupo: 'ULTRASSONOGRAFIA', codIpm: '40901211', codIssec: '33010129' },
  { id: 'US_DOPPLER_CAROTIDAS', nome: 'Doppler de Carótidas e Vertebrais',                     nomeCurto: 'Doppler Carótidas e Vert.',  grupo: 'ULTRASSONOGRAFIA', codIpm: '40901360', codIssec: '3301023X' },
  { id: 'US_DOPPLER_RENAIS',    nome: 'Doppler de Artérias Renais',                             nomeCurto: 'Doppler Artérias Renais',    grupo: 'ULTRASSONOGRAFIA', codIpm: '40901394', codIssec: '33010234' },
  { id: 'US_DOPPLER_COLORIDO_ESTRUT', nome: 'Doppler Colorido de Estrutura Isolada',          nomeCurto: 'Doppler Colorido Estrut. Isolada', grupo: 'ULTRASSONOGRAFIA', codIpm: '40901386' },
  { id: 'DOPPLER_MMI_ARTE',     nome: 'Doppler Arterial de Membros Inferiores (MMII Arterial)', nomeCurto: 'Doppler MMII Arterial',      grupo: 'ULTRASSONOGRAFIA', codIpm: '40901475' },
  { id: 'DOPPLER_MMI_VENO',     nome: 'Doppler Venoso de Membros Inferiores (MMII Venoso)',     nomeCurto: 'Doppler MMII Venoso',        grupo: 'ULTRASSONOGRAFIA', codIpm: '40901483' },
  { id: 'DOPPLER_MMS_DIR',      nome: 'Doppler de Membro Superior Direito (MMS Dir. - Braço)',  nomeCurto: 'Doppler MMS Direito (Braço)', grupo: 'ULTRASSONOGRAFIA', codIssec: '3301023B' },
  { id: 'DOPPLER_MMS_ESQ',      nome: 'Doppler de Membro Superior Esquerdo (MMS Esq. - Braço)', nomeCurto: 'Doppler MMS Esquerdo (Braço)', grupo: 'ULTRASSONOGRAFIA', codIssec: '3301023S' },
  { id: 'DOPPLER_MMI_INF_DIR',  nome: 'Doppler de Membro Inferior Direito (MMI Inf. Direito)',  nomeCurto: 'Doppler MMI Inf. Direito',   grupo: 'ULTRASSONOGRAFIA', codIssec: '3301023A' },
  { id: 'DOPPLER_MMI_INF_ESQ',  nome: 'Doppler de Membro Inferior Esquerdo (MMI Inf. Esquerdo)',nomeCurto: 'Doppler MMI Inf. Esquerdo',  grupo: 'ULTRASSONOGRAFIA', codIssec: '3301023I' },

  // ── ARTICULAÇÕES ─────────────────────────────────────────────────
  { id: 'ARTICULACAO_GERAL',          nome: 'Ultrassonografia de Articulação (Geral)',          nomeCurto: 'US Articulação (Geral)',     grupo: 'ARTICULACOES', codIpm: '40901220' },
  { id: 'ARTICULACAO_DOPPLER',         nome: 'Ultrassonografia de Articulação com Doppler',      nomeCurto: 'US Articulação c/ Doppler',  grupo: 'ARTICULACOES', codIssec: '3301004D' },
  { id: 'ARTICULACAO_JOELHO',          nome: 'Ultrassonografia de Articulação - Joelho',         nomeCurto: 'US Joelho',                  grupo: 'ARTICULACOES', codIpm: '40901220', codIssec: '99999944' },
  { id: 'ARTICULACAO_QUADRIL',         nome: 'Ultrassonografia de Articulação - Quadril (Coxafemoral)', nomeCurto: 'US Quadril / Coxafemoral', grupo: 'ARTICULACOES', codIpm: '40901220', codIssec: '99999943' },
  { id: 'ARTICULACAO_OMBRO',           nome: 'Ultrassonografia de Articulação - Ombro',          nomeCurto: 'US Ombro',                   grupo: 'ARTICULACOES', codIpm: '40901220', codIssec: '99999939' },
  { id: 'ARTICULACAO_COTOVELO',        nome: 'Ultrassonografia de Articulação - Cotovelo',       nomeCurto: 'US Cotovelo',                grupo: 'ARTICULACOES', codIpm: '40901220', codIssec: '99999940' },
  { id: 'ARTICULACAO_PUNHO',           nome: 'Ultrassonografia de Articulação - Punho',          nomeCurto: 'US Punho',                   grupo: 'ARTICULACOES', codIpm: '40901220', codIssec: '99999941' },
  { id: 'ARTICULACAO_MAO',             nome: 'Ultrassonografia de Articulação - Mão',            nomeCurto: 'US Mão',                     grupo: 'ARTICULACOES', codIpm: '40901220', codIssec: '99999948' },
  { id: 'ARTICULACAO_PE',              nome: 'Ultrassonografia de Articulação - Pé',             nomeCurto: 'US Pé',                      grupo: 'ARTICULACOES', codIpm: '40901220', codIssec: '99999945' },
  { id: 'ARTICULACAO_TORNOZELO',       nome: 'Ultrassonografia de Articulação - Tornozelo',      nomeCurto: 'US Tornozelo',               grupo: 'ARTICULACOES', codIpm: '40901220', codIssec: '999999' },
  { id: 'ARTICULACAO_ESTERNOCLAVICULA',nome: 'Ultrassonografia de Articulação - Esternoclavicular', nomeCurto: 'US Esternoclavicular',  grupo: 'ARTICULACOES', codIpm: '40901220', codIssec: '99999946' },
  { id: 'ARTICULACAO_SACROILIACA',     nome: 'Ultrassonografia de Articulação - Sacroilíaca',   nomeCurto: 'US Sacroilíaca',             grupo: 'ARTICULACOES', codIpm: '40901220', codIssec: '9999994247' },

  // ── ENDOSCOPIA ───────────────────────────────────────────────────
  { id: 'EDA',                         nome: 'Esofagogastroduodenoscopia (EDA)',                 nomeCurto: 'EDA',                        grupo: 'ENDOSCOPIA' },
  { id: 'EDA_BIOPSIA_HPYLORI',         nome: 'Endoscopia Digestiva Alta com Biópsia e H. pylori',nomeCurto: 'EDA + Biópsia H. pylori',     grupo: 'ENDOSCOPIA' },
  { id: 'COLONOSCOPIA',                nome: 'Colonoscopia',                                     nomeCurto: 'Colonoscopia',                grupo: 'ENDOSCOPIA' },
  { id: 'COLONOSCOPIA_BIOPSIA',        nome: 'Colonoscopia com Biópsia e/ou Polipectomia',       nomeCurto: 'Colonoscopia + Biópsia',      grupo: 'ENDOSCOPIA' },
  { id: 'RETOSSIGMOIDOSCOPIA',         nome: 'Retossigmoidoscopia',                              nomeCurto: 'Retossigmoidoscopia',         grupo: 'ENDOSCOPIA' },
  { id: 'RETOSSIGMOIDOSCOPIA_BIOPSIA', nome: 'Retossigmoidoscopia com Biópsia',                  nomeCurto: 'Retossigmoidoscopia + Biópsia', grupo: 'ENDOSCOPIA' },
  { id: 'PHMETRIA_ESOFAGICA',          nome: 'pHmetria Esofágica Computadorizada (24h)',         nomeCurto: 'pHmetria Esofágica',          grupo: 'ENDOSCOPIA' },
  { id: 'MANOMETRIA_ESOFAGICA',        nome: 'Manometria Esofágica Computadorizada',             nomeCurto: 'Manometria Esofágica',        grupo: 'ENDOSCOPIA' },
  { id: 'ECOENDOSCOPIA',               nome: 'Ecoendoscopia (Ultrassom Endoscópico)',             nomeCurto: 'Ecoendoscopia',               grupo: 'ENDOSCOPIA' },

  // ── GASTROENTEROLOGIA FUNCIONAL ──────────────────────────────────
  { id: 'TESTE_H2_LACTULOSE', nome: 'Teste Respiratório de H2/CH4 com Lactulose (SIBO)',        nomeCurto: 'Teste H2/CH4 Lactulose (SIBO)', grupo: 'GASTRO_FUNCIONAL' },
  { id: 'TESTE_H2_GLICOSE',   nome: 'Teste Respiratório de H2 Expirado com Glicose (SIBO)',     nomeCurto: 'Teste H2 Glicose (SIBO)',       grupo: 'GASTRO_FUNCIONAL' },
  { id: 'TESTE_H2_LACTOSE',   nome: 'Teste Respiratório de H2 com Lactose (Intolerância)',      nomeCurto: 'Teste H2 Lactose',              grupo: 'GASTRO_FUNCIONAL' },

  // ── IMAGEM ───────────────────────────────────────────────────────
  { id: 'RX_TORAX',         nome: 'Radiografia de Tórax (PA e Perfil)',                          nomeCurto: 'RX Tórax PA+Perfil',          grupo: 'IMAGEM' },
  { id: 'RX_COLUNA',        nome: 'Radiografia de Coluna',                                       nomeCurto: 'RX Coluna',                   grupo: 'IMAGEM' },
  { id: 'RX_BACIA',         nome: 'Radiografia de Bacia / Quadril',                              nomeCurto: 'RX Bacia/Quadril',            grupo: 'IMAGEM' },
  { id: 'TC_ABD',           nome: 'Tomografia Computadorizada de Abdome e Pelve c/ Contraste',   nomeCurto: 'TC Abdome e Pelve',           grupo: 'IMAGEM' },
  { id: 'TC_CRANIO',        nome: 'Tomografia Computadorizada de Crânio',                        nomeCurto: 'TC Crânio',                   grupo: 'IMAGEM' },
  { id: 'TC_TORAX',         nome: 'Tomografia Computadorizada de Tórax de Alta Resolução',       nomeCurto: 'TC Tórax (TCAR)',              grupo: 'IMAGEM' },
  { id: 'RM_ABD',           nome: 'Ressonância Magnética de Abdome e Pelve',                     nomeCurto: 'RM Abdome e Pelve',           grupo: 'IMAGEM' },
  { id: 'RM_CRANIO',        nome: 'Ressonância Magnética de Crânio',                             nomeCurto: 'RM Crânio',                   grupo: 'IMAGEM' },
  { id: 'RM_COLUNA',        nome: 'Ressonância Magnética de Coluna (Cervical/Lombar)',           nomeCurto: 'RM Coluna',                   grupo: 'IMAGEM' },
  { id: 'RM_JOELHO',        nome: 'Ressonância Magnética de Joelho',                             nomeCurto: 'RM Joelho',                   grupo: 'IMAGEM' },
  { id: 'RM_OMBRO',         nome: 'Ressonância Magnética de Ombro',                              nomeCurto: 'RM Ombro',                    grupo: 'IMAGEM' },
  { id: 'DENSITOMETRIA',    nome: 'Densitometria Óssea (DXA)',                                   nomeCurto: 'Densitometria Óssea',         grupo: 'IMAGEM' },
  { id: 'CINTILOGRAFIA_OSSEA', nome: 'Cintilografia Óssea (Medicina Nuclear)',                  nomeCurto: 'Cintilografia Óssea',         grupo: 'IMAGEM' },
  { id: 'PET_CT',           nome: 'PET-CT (Tomografia por Emissão de Pósitrons)',                nomeCurto: 'PET-CT',                      grupo: 'IMAGEM' },

  // ── MASTOLOGIA ───────────────────────────────────────────────────
  { id: 'MAMOGRAFIA',            nome: 'Mamografia Bilateral de Rastreamento',                   nomeCurto: 'Mamografia',                   grupo: 'MASTOLOGIA', codIpm: '40901114', codIssec: '3301012A' },
  { id: 'MAMOGRAFIA_BILATERAL',  nome: 'Mamografia Bilateral com Incidências Adicionais',        nomeCurto: 'Mamografia c/ Incidências',    grupo: 'MASTOLOGIA' },
  { id: 'US_MAMA_UNILATERAL',    nome: 'Ultrassonografia Mamária Unilateral',                    nomeCurto: 'US Mama Unilateral',           grupo: 'MASTOLOGIA' },

  // ── GERIATRIA / FUNCIONAIS ────────────────────────────────────────
  { id: 'POLISSONOGRAFIA',       nome: 'Polissonografia Completa (com ou sem CPAP)',             nomeCurto: 'Polissonografia',             grupo: 'GERIATRIA' },
  { id: 'DOPPLER_TRANSCRANIANO', nome: 'Doppler Transcraniano fluxo-estudo',                     nomeCurto: 'Doppler Transcraniano',       grupo: 'GERIATRIA' },
  { id: 'ELETRONEUROMIOGRAFIA',  nome: 'Eletroneuromiografia de MMSS e MMII',                    nomeCurto: 'Eletroneuromiografia',        grupo: 'GERIATRIA' },
  { id: 'AUDIOMETRIA',           nome: 'Audiometria Tonal e Vocal com Impedanciometria',         nomeCurto: 'Audiometria',                 grupo: 'GERIATRIA' },
  { id: 'ESPIROMETRIA',          nome: 'Espirometria com Prova de Função Pulmonar',              nomeCurto: 'Espirometria',                grupo: 'GERIATRIA', hasAsterisk: true },
  { id: 'EEG_MAPEAMENTO',        nome: 'Eletroencefalograma com Mapeamento Cerebral',            nomeCurto: 'EEG Mapeamento',              grupo: 'GERIATRIA' },

  // ── GINECOLOGIA / PREVENTIVO ──────────────────────────────────────
  { id: 'CITOLOGIA_CERVICAL',  nome: 'Citologia Oncótica Cervical (Papanicolau)',              nomeCurto: 'Papanicolau',                 grupo: 'GINECOLOGIA' },
  { id: 'COLPOSCOPIA',         nome: 'Colposcopia com Biópsia Dirigida',                       nomeCurto: 'Colposcopia',                 grupo: 'GINECOLOGIA' },
  { id: 'HISTEROSCOPIA',       nome: 'Histeroscopia Diagnóstica',                              nomeCurto: 'Histeroscopia',               grupo: 'GINECOLOGIA' },

  // ── UROLOGIA ─────────────────────────────────────────────────────
  { id: 'UROFLUXOMETRIA',  nome: 'Urofluxometria com Resíduo Pós-Miccional',                nomeCurto: 'Urofluxometria',              grupo: 'UROLOGIA' },
  { id: 'URODINAMICA',     nome: 'Estudo Urodinâmico Completo',                             nomeCurto: 'Estudo Urodinâmico',          grupo: 'UROLOGIA' },
];

export const PROCEDIMENTO_POR_ID = Object.fromEntries(
  PROCEDIMENTOS.map((procedimento) => [procedimento.id, procedimento])
) as Record<ProcedimentoId, ProcedimentoDef>;

export function getProcedimentoNome(id: string): string {
  return PROCEDIMENTO_POR_ID[id as ProcedimentoId]?.nome ?? id;
}

export function getProcedimentoDef(id: string): ProcedimentoDef | undefined {
  return PROCEDIMENTO_POR_ID[id as ProcedimentoId];
}

export function isProcedimentoCardiologico(id: string): boolean {
  return PROCEDIMENTO_POR_ID[id as ProcedimentoId]?.grupo === 'CARDIOLOGIA';
}

export function isProcedimentoUltrassom(id: string): boolean {
  const g = PROCEDIMENTO_POR_ID[id as ProcedimentoId]?.grupo;
  return g === 'ULTRASSONOGRAFIA' || g === 'ARTICULACOES';
}

export function isProcedimentoEndoscopico(id: string): boolean {
  return PROCEDIMENTO_POR_ID[id as ProcedimentoId]?.grupo === 'ENDOSCOPIA';
}

export function isProcedimentoImagem(id: string): boolean {
  return PROCEDIMENTO_POR_ID[id as ProcedimentoId]?.grupo === 'IMAGEM';
}

export function isProcedimentoGeriatrico(id: string): boolean {
  return PROCEDIMENTO_POR_ID[id as ProcedimentoId]?.grupo === 'GERIATRIA';
}

export const GRUPOS_PROCEDIMENTOS: ProcedimentoGrupo[] = [
  'CARDIOLOGIA',
  'ULTRASSONOGRAFIA',
  'ARTICULACOES',
  'ENDOSCOPIA',
  'GASTRO_FUNCIONAL',
  'IMAGEM',
  'MASTOLOGIA',
  'GERIATRIA',
  'GINECOLOGIA',
  'UROLOGIA',
];

export const PROCEDIMENTOS_POR_GRUPO = GRUPOS_PROCEDIMENTOS.reduce((acc, grupo) => {
  acc[grupo] = PROCEDIMENTOS.filter((p) => p.grupo === grupo);
  return acc;
}, {} as Record<ProcedimentoGrupo, ProcedimentoDef[]>);


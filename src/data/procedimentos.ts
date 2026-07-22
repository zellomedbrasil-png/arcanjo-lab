import type { TipoGuia } from '../types';

export type ProcedimentoId = Exclude<TipoGuia, 'LABORATORIO'>;

export type ProcedimentoGrupo =
  | 'CARDIOLOGIA'
  | 'ULTRASSONOGRAFIA'
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
}

export const PROCEDIMENTOS: ProcedimentoDef[] = [
  // ── CARDIOLOGIA ──────────────────────────────────────────────────
  { id: 'ECOCARDIOGRAMA',       nome: 'Ecocardiograma Transtorácico',                         nomeCurto: 'Ecocardiograma',            grupo: 'CARDIOLOGIA', hasAsterisk: true },
  { id: 'ECODOPPLER',           nome: 'Ecodopplercardiograma',                                  nomeCurto: 'Ecodoppler',                grupo: 'CARDIOLOGIA', hasAsterisk: true },
  { id: 'MAPA',                 nome: 'MAPA - Monitoramento Ambulatorial da Pressão Arterial 24h', nomeCurto: 'MAPA 24h',              grupo: 'CARDIOLOGIA', hasAsterisk: true },
  { id: 'HOLTER',               nome: 'Holter - Eletrocardiografia de Longa Duração 24h',      nomeCurto: 'Holter 24h',               grupo: 'CARDIOLOGIA', hasAsterisk: true },
  { id: 'ECG',                  nome: 'Eletrocardiograma (ECG)',                                nomeCurto: 'ECG',                      grupo: 'CARDIOLOGIA', hasAsterisk: true },
  { id: 'TEST_ERGOMETRICO',     nome: 'Teste Ergométrico (Teste de Esforço)',                   nomeCurto: 'Teste Ergométrico',         grupo: 'CARDIOLOGIA' },
  { id: 'ANGIOTC_CORONARIA',    nome: 'Angiotomografia de Coronárias (Score de Cálcio)',        nomeCurto: 'AngioTC Coronária',         grupo: 'CARDIOLOGIA' },
  { id: 'ECOSTRESS',            nome: 'Ecocardiograma de Estresse (com Dobutamina)',            nomeCurto: 'Eco de Estresse',           grupo: 'CARDIOLOGIA' },
  { id: 'DOPPLER_MEMBROS',      nome: 'Doppler de Membros Inferiores (Arterial e Venoso)',      nomeCurto: 'Doppler MMII',              grupo: 'CARDIOLOGIA' },

  // ── ULTRASSONOGRAFIA ─────────────────────────────────────────────
  { id: 'US_ABD_TOTAL',         nome: 'Ultrassonografia do Abdome Total',                      nomeCurto: 'US Abdome Total',           grupo: 'ULTRASSONOGRAFIA', hasAsterisk: true },
  { id: 'US_PELVICO',           nome: 'Ultrassonografia Pélvica',                              nomeCurto: 'US Pélvico',                grupo: 'ULTRASSONOGRAFIA', hasAsterisk: true },
  { id: 'US_TRANSVAGINAL',      nome: 'Ultrassonografia Transvaginal',                         nomeCurto: 'US Transvaginal',           grupo: 'ULTRASSONOGRAFIA', hasAsterisk: true },
  { id: 'US_PROSTATA',          nome: 'Ultrassonografia de Próstata e Vias Urinárias',          nomeCurto: 'US Próstata/Vias Urinárias', grupo: 'ULTRASSONOGRAFIA', hasAsterisk: true },
  { id: 'US_TIREOIDE',          nome: 'Ultrassonografia de Tireoide',                          nomeCurto: 'US Tireoide',               grupo: 'ULTRASSONOGRAFIA', hasAsterisk: true },
  { id: 'US_VIAS_BILIARES',     nome: 'Ultrassonografia de Vias Biliares e Fígado',            nomeCurto: 'US Vias Biliares e Fígado', grupo: 'ULTRASSONOGRAFIA', hasAsterisk: true },
  { id: 'US_MAMA_BILATERAL',    nome: 'Ultrassonografia Mamária Bilateral',                    nomeCurto: 'US Mamas Bilateral',        grupo: 'ULTRASSONOGRAFIA' },
  { id: 'US_RENAL',             nome: 'Ultrassonografia Renal e de Vias Urinárias',            nomeCurto: 'US Renal e Vias Urinárias', grupo: 'ULTRASSONOGRAFIA' },
  { id: 'US_PARTES_MOLES',      nome: 'Ultrassonografia de Partes Moles',                      nomeCurto: 'US Partes Moles',           grupo: 'ULTRASSONOGRAFIA' },
  { id: 'US_DOPPLER_CAROTIDAS', nome: 'Doppler de Carótidas e Vertebrais',                    nomeCurto: 'Doppler Carótidas',         grupo: 'ULTRASSONOGRAFIA' },

  // ── ENDOSCOPIA ───────────────────────────────────────────────────
  { id: 'EDA',                         nome: 'Esofagogastroduodenoscopia (EDA)',                                    nomeCurto: 'EDA',                     grupo: 'ENDOSCOPIA' },
  { id: 'EDA_BIOPSIA_HPYLORI',         nome: 'Endoscopia Digestiva Alta com Biópsia e Pesquisa de H. pylori',      nomeCurto: 'EDA + Biópsia H. pylori',  grupo: 'ENDOSCOPIA' },
  { id: 'COLONOSCOPIA',                nome: 'Colonoscopia',                                                        nomeCurto: 'Colonoscopia',             grupo: 'ENDOSCOPIA' },
  { id: 'COLONOSCOPIA_BIOPSIA',        nome: 'Colonoscopia com Biópsia e/ou Polipectomia',                          nomeCurto: 'Colonoscopia + Biópsia',   grupo: 'ENDOSCOPIA' },
  { id: 'RETOSSIGMOIDOSCOPIA',         nome: 'Retossigmoidoscopia',                                                 nomeCurto: 'Retossigmoidoscopia',      grupo: 'ENDOSCOPIA' },
  { id: 'RETOSSIGMOIDOSCOPIA_BIOPSIA', nome: 'Retossigmoidoscopia com Biópsia',                                     nomeCurto: 'Retossigmoidoscopia + Biópsia', grupo: 'ENDOSCOPIA' },
  { id: 'PHMETRIA_ESOFAGICA',          nome: 'pHmetria Esofágica Computadorizada (24h)',                            nomeCurto: 'pHmetria Esofágica',       grupo: 'ENDOSCOPIA' },
  { id: 'MANOMETRIA_ESOFAGICA',        nome: 'Manometria Esofágica Computadorizada',                                nomeCurto: 'Manometria Esofágica',     grupo: 'ENDOSCOPIA' },
  { id: 'ECOENDOSCOPIA',               nome: 'Ecoendoscopia (Ultrassom Endoscópico)',                                nomeCurto: 'Ecoendoscopia',            grupo: 'ENDOSCOPIA' },

  // ── GASTROENTEROLOGIA FUNCIONAL ──────────────────────────────────
  // Testes respiratórios: não são coleta de sangue nem de fezes — exigem
  // agendamento e execução assistida em serviço, por isso entram aqui e não
  // na guia laboratorial. Diagnóstico de SIBO e de intolerância à lactose.
  { id: 'TESTE_H2_LACTULOSE', nome: 'Teste Respiratório de Hidrogênio e Metano Expirados com Lactulose (SIBO)', nomeCurto: 'Teste H2/CH4 Lactulose (SIBO)', grupo: 'GASTRO_FUNCIONAL' },
  { id: 'TESTE_H2_GLICOSE',   nome: 'Teste Respiratório de Hidrogênio Expirado com Glicose (SIBO)',              nomeCurto: 'Teste H2 Glicose (SIBO)',        grupo: 'GASTRO_FUNCIONAL' },
  { id: 'TESTE_H2_LACTOSE',   nome: 'Teste Respiratório de Hidrogênio Expirado com Lactose (Intolerância)',      nomeCurto: 'Teste H2 Lactose',               grupo: 'GASTRO_FUNCIONAL' },

  // ── IMAGEM ───────────────────────────────────────────────────────
  { id: 'RX_TORAX',         nome: 'Radiografia de Tórax (PA e Perfil)',                          nomeCurto: 'RX Tórax PA+Perfil',       grupo: 'IMAGEM' },
  { id: 'RX_COLUNA',        nome: 'Radiografia de Coluna',                                       nomeCurto: 'RX Coluna',                grupo: 'IMAGEM' },
  { id: 'RX_BACIA',         nome: 'Radiografia de Bacia / Quadril',                              nomeCurto: 'RX Bacia/Quadril',         grupo: 'IMAGEM' },
  { id: 'TC_ABD',           nome: 'Tomografia Computadorizada de Abdome e Pelve com Contraste',  nomeCurto: 'TC Abdome e Pelve',        grupo: 'IMAGEM' },
  { id: 'TC_CRANIO',        nome: 'Tomografia Computadorizada de Crânio',                        nomeCurto: 'TC Crânio',                grupo: 'IMAGEM' },
  { id: 'TC_TORAX',         nome: 'Tomografia Computadorizada de Tórax de Alta Resolução (TCAR)',nomeCurto: 'TC Tórax (TCAR)',           grupo: 'IMAGEM' },
  { id: 'RM_ABD',           nome: 'Ressonância Magnética de Abdome e Pelve',                     nomeCurto: 'RM Abdome e Pelve',        grupo: 'IMAGEM' },
  { id: 'RM_CRANIO',        nome: 'Ressonância Magnética de Crânio',                             nomeCurto: 'RM Crânio',                grupo: 'IMAGEM' },
  { id: 'RM_COLUNA',        nome: 'Ressonância Magnética de Coluna (Cervical/Lombar)',            nomeCurto: 'RM Coluna',                grupo: 'IMAGEM' },
  { id: 'RM_JOELHO',        nome: 'Ressonância Magnética de Joelho',                             nomeCurto: 'RM Joelho',                grupo: 'IMAGEM' },
  { id: 'RM_OMBRO',         nome: 'Ressonância Magnética de Ombro',                              nomeCurto: 'RM Ombro',                 grupo: 'IMAGEM' },
  { id: 'DENSITOMETRIA',    nome: 'Densitometria Óssea (DXA)',                                   nomeCurto: 'Densitometria Óssea',      grupo: 'IMAGEM' },
  { id: 'CINTILOGRAFIA_OSSEA', nome: 'Cintilografia Óssea (Medicina Nuclear)',                  nomeCurto: 'Cintilografia Óssea',      grupo: 'IMAGEM' },
  { id: 'PET_CT',           nome: 'PET-CT (Tomografia por Emissão de Pósitrons)',                nomeCurto: 'PET-CT',                   grupo: 'IMAGEM' },

  // ── MASTOLOGIA ───────────────────────────────────────────────────
  { id: 'MAMOGRAFIA',            nome: 'Mamografia Bilateral de Rastreamento',                       nomeCurto: 'Mamografia',                grupo: 'MASTOLOGIA' },
  { id: 'MAMOGRAFIA_BILATERAL',  nome: 'Mamografia Bilateral com Incidências Adicionais',            nomeCurto: 'Mamografia c/ Incidências', grupo: 'MASTOLOGIA' },
  { id: 'US_MAMA_UNILATERAL',    nome: 'Ultrassonografia Mamária Unilateral',                        nomeCurto: 'US Mama Unilateral',        grupo: 'MASTOLOGIA' },

  // ── GERIATRIA / FUNCIONAIS ────────────────────────────────────────
  { id: 'POLISSONOGRAFIA',       nome: 'Polissonografia Completa (com ou sem CPAP)',         nomeCurto: 'Polissonografia',        grupo: 'GERIATRIA' },
  { id: 'DOPPLER_TRANSCRANIANO', nome: 'Doppler Transcraniano fluxo-estudo',                 nomeCurto: 'Doppler Transcraniano',  grupo: 'GERIATRIA' },
  { id: 'ELETRONEUROMIOGRAFIA',  nome: 'Eletroneuromiografia de MMSS e MMII',                nomeCurto: 'Eletroneuromiografia',   grupo: 'GERIATRIA' },
  { id: 'AUDIOMETRIA',           nome: 'Audiometria Tonal e Vocal com Impedanciometria',     nomeCurto: 'Audiometria',            grupo: 'GERIATRIA' },
  { id: 'ESPIROMETRIA',          nome: 'Espirometria com Prova de Função Pulmonar',          nomeCurto: 'Espirometria',           grupo: 'GERIATRIA', hasAsterisk: true },
  { id: 'EEG_MAPEAMENTO',        nome: 'Eletroencefalograma com Mapeamento Cerebral',        nomeCurto: 'EEG Mapeamento',         grupo: 'GERIATRIA' },

  // ── GINECOLOGIA / PREVENTIVO ──────────────────────────────────────
  { id: 'CITOLOGIA_CERVICAL',  nome: 'Citologia Oncótica Cervical (Papanicolau)',          nomeCurto: 'Papanicolau',            grupo: 'GINECOLOGIA' },
  { id: 'COLPOSCOPIA',         nome: 'Colposcopia com Biópsia Dirigida',                   nomeCurto: 'Colposcopia',            grupo: 'GINECOLOGIA' },
  { id: 'HISTEROSCOPIA',       nome: 'Histeroscopia Diagnóstica',                          nomeCurto: 'Histeroscopia',          grupo: 'GINECOLOGIA' },

  // ── UROLOGIA ─────────────────────────────────────────────────────
  { id: 'UROFLUXOMETRIA',  nome: 'Urofluxometria com Resíduo Pós-Miccional',            nomeCurto: 'Urofluxometria',         grupo: 'UROLOGIA' },
  { id: 'URODINAMICA',     nome: 'Estudo Urodinâmico Completo',                         nomeCurto: 'Estudo Urodinâmico',     grupo: 'UROLOGIA' },
];

export const PROCEDIMENTO_POR_ID = Object.fromEntries(
  PROCEDIMENTOS.map((procedimento) => [procedimento.id, procedimento])
) as Record<ProcedimentoId, ProcedimentoDef>;

export function getProcedimentoNome(id: string): string {
  return PROCEDIMENTO_POR_ID[id as ProcedimentoId]?.nome ?? id;
}

export function isProcedimentoCardiologico(id: string): boolean {
  return PROCEDIMENTO_POR_ID[id as ProcedimentoId]?.grupo === 'CARDIOLOGIA';
}

export function isProcedimentoUltrassom(id: string): boolean {
  return PROCEDIMENTO_POR_ID[id as ProcedimentoId]?.grupo === 'ULTRASSONOGRAFIA';
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

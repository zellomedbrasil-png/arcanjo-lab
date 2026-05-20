import type { TipoGuia } from '../types';

export type ProcedimentoId = Exclude<TipoGuia, 'LABORATORIO'>;

export type ProcedimentoGrupo = 'CARDIOLOGIA' | 'ULTRASSONOGRAFIA' | 'ENDOSCOPIA' | 'IMAGEM';

export interface ProcedimentoDef {
  id: ProcedimentoId;
  nome: string;
  nomeCurto: string;
  grupo: ProcedimentoGrupo;
}

export const PROCEDIMENTOS: ProcedimentoDef[] = [
  { id: 'ECOCARDIOGRAMA', nome: 'Ecocardiograma Transtorácico', nomeCurto: 'Ecocardiograma', grupo: 'CARDIOLOGIA' },
  { id: 'ECODOPPLER', nome: 'Ecodopplercardiograma', nomeCurto: 'Ecodoppler', grupo: 'CARDIOLOGIA' },
  { id: 'MAPA', nome: 'MAPA - Monitoramento Ambulatorial da Pressão Arterial 24h', nomeCurto: 'MAPA 24h', grupo: 'CARDIOLOGIA' },
  { id: 'HOLTER', nome: 'Holter - Eletrocardiografia de Longa Duração 24h', nomeCurto: 'Holter 24h', grupo: 'CARDIOLOGIA' },
  { id: 'ECG', nome: 'Eletrocardiograma (ECG)', nomeCurto: 'ECG', grupo: 'CARDIOLOGIA' },
  { id: 'US_ABD_TOTAL', nome: 'Ultrassonografia do Abdome Total', nomeCurto: 'US Abdome Total', grupo: 'ULTRASSONOGRAFIA' },
  { id: 'US_PELVICO', nome: 'Ultrassonografia Pélvica', nomeCurto: 'US Pélvico', grupo: 'ULTRASSONOGRAFIA' },
  { id: 'US_TRANSVAGINAL', nome: 'Ultrassonografia Transvaginal', nomeCurto: 'US Transvaginal', grupo: 'ULTRASSONOGRAFIA' },
  { id: 'US_PROSTATA', nome: 'Ultrassonografia de Próstata e Vias Urinárias', nomeCurto: 'US Próstata e Vias Urinárias', grupo: 'ULTRASSONOGRAFIA' },
  { id: 'US_TIREOIDE', nome: 'Ultrassonografia de Tireoide', nomeCurto: 'US Tireoide', grupo: 'ULTRASSONOGRAFIA' },
  { id: 'US_VIAS_BILIARES', nome: 'Ultrassonografia de Vias Biliares e Fígado', nomeCurto: 'US Vias Biliares e Fígado', grupo: 'ULTRASSONOGRAFIA' },
  { id: 'EDA', nome: 'Esofagogastroduodenoscopia (EDA)', nomeCurto: 'EDA', grupo: 'ENDOSCOPIA' },
  { id: 'EDA_BIOPSIA_HPYLORI', nome: 'Endoscopia Digestiva Alta com Biópsia e Pesquisa de H. pylori', nomeCurto: 'EDA + Biópsia H. pylori', grupo: 'ENDOSCOPIA' },
  { id: 'COLONOSCOPIA', nome: 'Colonoscopia', nomeCurto: 'Colonoscopia', grupo: 'ENDOSCOPIA' },
  { id: 'COLONOSCOPIA_BIOPSIA', nome: 'Colonoscopia com Biópsia e/ou Polipectomia', nomeCurto: 'Colonoscopia + Biópsia', grupo: 'ENDOSCOPIA' },
  { id: 'RETOSSIGMOIDOSCOPIA', nome: 'Retossigmoidoscopia', nomeCurto: 'Retossigmoidoscopia', grupo: 'ENDOSCOPIA' },
  { id: 'RETOSSIGMOIDOSCOPIA_BIOPSIA', nome: 'Retossigmoidoscopia com Biópsia', nomeCurto: 'Retossigmoidoscopia + Biópsia', grupo: 'ENDOSCOPIA' },
  { id: 'PHMETRIA_ESOFAGICA', nome: 'pHmetria Esofágica Computadorizada (24h)', nomeCurto: 'pHmetria Esofágica', grupo: 'ENDOSCOPIA' },
  { id: 'MANOMETRIA_ESOFAGICA', nome: 'Manometria Esofágica Computadorizada', nomeCurto: 'Manometria Esofágica', grupo: 'ENDOSCOPIA' },
  { id: 'ECOENDOSCOPIA', nome: 'Ecoendoscopia (Ultrassom Endoscópico)', nomeCurto: 'Ecoendoscopia', grupo: 'ENDOSCOPIA' },
  { id: 'RX_TORAX', nome: 'Radiografia de Tórax (PA e Perfil)', nomeCurto: 'RX Tórax PA+Perfil', grupo: 'IMAGEM' },
  { id: 'RX_COLUNA', nome: 'Radiografia de Coluna', nomeCurto: 'RX Coluna', grupo: 'IMAGEM' },
  { id: 'TC_ABD', nome: 'Tomografia Computadorizada de Abdome e Pelve com Contraste', nomeCurto: 'TC Abdome e Pelve c/ contraste', grupo: 'IMAGEM' },
  { id: 'TC_CRANIO', nome: 'Tomografia Computadorizada de Crânio', nomeCurto: 'TC Crânio', grupo: 'IMAGEM' },
  { id: 'RM_ABD', nome: 'Ressonância Magnética de Abdome e Pelve', nomeCurto: 'RM Abdome e Pelve', grupo: 'IMAGEM' },
  { id: 'RM_CRANIO', nome: 'Ressonância Magnética de Crânio', nomeCurto: 'RM Crânio', grupo: 'IMAGEM' },
  { id: 'DENSITOMETRIA', nome: 'Densitometria Óssea (DXA)', nomeCurto: 'Densitometria Óssea', grupo: 'IMAGEM' },
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

export const PROCEDIMENTOS_POR_GRUPO = (
  ['CARDIOLOGIA', 'ULTRASSONOGRAFIA', 'ENDOSCOPIA', 'IMAGEM'] as ProcedimentoGrupo[]
).reduce((acc, grupo) => {
  acc[grupo] = PROCEDIMENTOS.filter((p) => p.grupo === grupo);
  return acc;
}, {} as Record<ProcedimentoGrupo, ProcedimentoDef[]>);

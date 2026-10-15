// src/data/protocolos.ts
// Protocolos de prescrição por QUEIXA — Geriatria, Gastroenterologia e Clínica Geral.
//
// Camada de curadoria clínica sobre o catálogo de src/data/medicamentos.ts:
// os itens referenciam medicamentos por `medicamentoId`, então corrigir uma
// classificação ou um dado no catálogo propaga para todos os protocolos.
//
// DUAS VERSÕES POR PROTOCOLO:
//   padraoOuro — a conduta que as diretrizes indicam, sem considerar custo.
//   acessivel  — adaptação viável para paciente do SUS ou com restrição
//                financeira. Só existe quando muda a conduta de verdade; onde
//                o padrão-ouro já é barato e disponível, não há segunda versão.
//
// `tipoRecomendado` NUNCA é definido aqui — vem do catálogo. Um protocolo com
// medicamento C1/C5 ou antimicrobiano escala a receita para 2 vias sozinho.
//
// TODOS os protocolos exigem revisão médica antes do uso em paciente.

import { getMedicamento } from './medicamentos';
import { PROTOCOLOS_GERIATRIA } from './protocolosGeriatria';
import { PROTOCOLOS_GASTRO } from './protocolosGastro';
import { PROTOCOLOS_CLINICA } from './protocolosClinica';

export type AreaProtocolo = 'GERIATRIA' | 'GASTRO' | 'CLINICA_GERAL';

export const AREA_PROTOCOLO_INFO: Record<AreaProtocolo, string> = {
  GERIATRIA: 'Geriatria',
  GASTRO: 'Gastroenterologia',
  CLINICA_GERAL: 'Clínica Geral',
};

export interface ItemProtocolo {
  /** FK para MEDICAMENTOS. Conferida por `npm run conferir:catalogo`. */
  medicamentoId: string;
  /** Índice da dose em `apresentacoes` (+1); omitido = apresentação padrão. */
  apresentacao?: number;
  /** Sobrescreve a posologia padrão — a mesma droga muda conforme a queixa. */
  posologia: string;
  quantidade: string;
  duracao: string;
  observacoes?: string;
}

export interface VersaoProtocolo {
  /** Quando escolher esta versão. */
  nota: string;
  medicamentos: ItemProtocolo[];
}

export interface ProtocoloQueixa {
  id: string;
  queixa: string;
  /** Alimenta a busca: "intestino preso" acha constipação. */
  sinonimos: string[];
  area: AreaProtocolo;
  cid10: string;
  /** Uma linha de racional clínico. */
  resumo: string;
  padraoOuro: VersaoProtocolo;
  acessivel?: VersaoProtocolo;
  /** Não-farmacológico e orientação ao paciente. */
  orientacoes: string[];
  /** Red flags e quando escalar. */
  alertas?: string[];
  /** Conteúdo novo ou alterado que ainda precisa da validação do médico. */
  revisar?: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Nomes dos medicamentos de uma versão — alimenta a busca por fármaco. */
export function nomesDosMedicamentos(itens: ItemProtocolo[]): string {
  return itens
    .map((i) => {
      const m = getMedicamento(i.medicamentoId);
      return m ? `${m.nome} ${m.principioAtivo} ${m.marcaReferencia}` : i.medicamentoId;
    })
    .join(' ');
}

/** True se qualquer item da versão exigir receita em 2 vias. */
export function versaoExige2Vias(itens: ItemProtocolo[]): boolean {
  return itens.some((i) => getMedicamento(i.medicamentoId)?.tipoRecomendado === 'ESPECIAL');
}

/** Motivos legais das 2 vias, para exibir na tela. */
export function motivosDaVersao(itens: ItemProtocolo[]): string[] {
  return itens
    .map((i) => getMedicamento(i.medicamentoId))
    .filter((m): m is NonNullable<typeof m> => !!m && m.tipoRecomendado === 'ESPECIAL')
    .map((m) => `${m.nome}: ${m.motivoEspecial ?? 'exige receita em 2 vias.'}`);
}

/** Todos os protocolos, na ordem em que aparecem na tela. */
export const PROTOCOLOS: ProtocoloQueixa[] = [...PROTOCOLOS_GERIATRIA, ...PROTOCOLOS_GASTRO, ...PROTOCOLOS_CLINICA];

// Divide a prescrição nos documentos que a farmácia aceita.
// Usado pela prévia (NovaReceita) e pela impressão (ImprimirReceita): o que
// aparece na tela é exatamente o que sai no papel.

import type { MedicamentoReceita, TipoReceita } from '../store/useReceitaStore';
import { classificar, REGRAS_MODELO, type InfoClasse, type ModeloReceita } from '../data/regrasReceita';

export interface DocumentoReceita {
  chave: string;
  modelo: ModeloReceita;
  /** Itens estruturados (vazio no modo texto). */
  medicamentos: MedicamentoReceita[];
  /** Classificação de cada item, mesma ordem de `medicamentos`. */
  infos: InfoClasse[];
  /** Modo texto livre/manual: imprime o texto como digitado. */
  textoLivre?: string;
  /** Receita só de GLP-1 (validade 90 dias e título próprio). */
  soGlp1?: boolean;
  /** "Folha 1 de 2" quando o mesmo modelo precisa de mais de uma folha. */
  folha?: { atual: number; total: number };
}

/** Itens por folha — acima disso a fonte cairia abaixo do legível. */
const ITENS_POR_FOLHA: Record<ModeloReceita, number> = {
  SIMPLES: 6,
  RETENCAO: 3,
  RCE: 3, // também é o limite legal (Port. 344, art. 57)
  NOTIF_A: 1,
  NOTIF_B: 1,
  NOTIF_B2: 1,
  NOTIF_C2: 1,
  NOTIF_C3: 1,
};

const ORDEM: ModeloReceita[] = ['SIMPLES', 'RETENCAO', 'RCE', 'NOTIF_A', 'NOTIF_B', 'NOTIF_B2', 'NOTIF_C2', 'NOTIF_C3'];

export const temConteudo = (m: MedicamentoReceita) => !!(m.principioAtivo.trim() || m.nomeDigitado.trim());

/** Classificação de um item da receita (nome impresso + nome digitado + sugestão da IA). */
export function infoDoMedicamento(m: MedicamentoReceita): InfoClasse {
  return classificar(`${m.principioAtivo} ${m.nomeDigitado}`, m.uso, {
    tipo: m.tipoRecomendado,
    motivo: m.motivoEspecial,
  });
}

/**
 * Altura útil da área de prescrição numa via A5 (px a 96 dpi). Medida no
 * navegador com ItemPrescricao: RCE tem menos espaço por causa dos quadros de
 * comprador/fornecedor.
 */
const ALTURA_UTIL: Partial<Record<ModeloReceita, number>> = { RETENCAO: 300, RCE: 190 };

const linhas = (texto: string, porLinha: number) =>
  texto
    .replace(/\*\*|__/g, '')
    .split('\n')
    .filter((l) => l.trim())
    .reduce((n, l) => n + Math.max(1, Math.ceil(l.length / porLinha)), 0);

/** Altura estimada de um item em ItemPrescricao (px). Calibrada no navegador. */
export function alturaEstimadaItem(m: MedicamentoReceita): number {
  const cabecalho = `${m.principioAtivo || m.nomeDigitado} ${m.formaFarmaceutica} ${m.indicacao} Qtd.: ${m.quantidade} (por extenso)`;
  const linhasCabecalho = Math.max(1, Math.ceil(cabecalho.length / 95));
  const linhasPosologia = Math.max(1, linhas(`Posologia: ${m.posologia} — ${m.duracao}`, 105));
  const linhasExtras = linhas(m.observacoes ? `Orientação: ${m.observacoes}` : '', 115) + linhas(m.justificativaLimite ? `Justificativa: ${m.justificativaLimite}` : '', 115);
  return 8 + linhasCabecalho * 18 + linhasPosologia * 15.5 + linhasExtras * 14.5;
}

/** O item sozinho já passa da meia folha? (texto seria cortado no papel) */
export function itemNaoCabeNaVia(m: MedicamentoReceita, modelo: ModeloReceita): boolean {
  const util = ALTURA_UTIL[modelo];
  return util !== undefined && alturaEstimadaItem(m) > util;
}

/** Divide em folhas respeitando o máximo de itens e, nas vias A5, a altura disponível. */
function emFolhas<T extends { m: MedicamentoReceita }>(itens: T[], modelo: ModeloReceita): T[][] {
  const max = ITENS_POR_FOLHA[modelo];
  const util = ALTURA_UTIL[modelo] ?? Infinity;
  const folhas: T[][] = [];
  let atual: T[] = [];
  let altura = 0;
  for (const item of itens) {
    const h = alturaEstimadaItem(item.m);
    if (atual.length && (atual.length >= max || altura + h > util)) {
      folhas.push(atual);
      atual = [];
      altura = 0;
    }
    atual.push(item);
    altura += h;
  }
  if (atual.length) folhas.push(atual);
  return folhas;
}

export function agruparEmDocumentos(medicamentos: MedicamentoReceita[]): DocumentoReceita[] {
  const itens = medicamentos.filter(temConteudo).map((m) => ({ m, info: infoDoMedicamento(m) }));

  // Antimicrobiano e GLP-1 têm validades diferentes (10 x 90 dias): folhas separadas.
  const grupos = new Map<string, typeof itens>();
  for (const item of itens) {
    const chave = item.info.modelo === 'RETENCAO' ? `RETENCAO:${item.info.classe}` : item.info.modelo;
    grupos.set(chave, [...(grupos.get(chave) ?? []), item]);
  }

  const documentos: DocumentoReceita[] = [];
  const chaves = [...grupos.keys()].sort(
    (a, b) => ORDEM.indexOf(a.split(':')[0] as ModeloReceita) - ORDEM.indexOf(b.split(':')[0] as ModeloReceita)
  );
  for (const chave of chaves) {
    const grupo = grupos.get(chave)!;
    const modelo = grupo[0].info.modelo;
    const folhas = emFolhas(grupo, modelo);
    folhas.forEach((folha, i) => {
      documentos.push({
        chave: `${chave}-${i}`,
        modelo,
        medicamentos: folha.map((x) => x.m),
        infos: folha.map((x) => x.info),
        soGlp1: modelo === 'RETENCAO' && folha.every((x) => x.info.classe === 'RETENCAO'),
        folha: folhas.length > 1 && REGRAS_MODELO[modelo].imprimeReceita ? { atual: i + 1, total: folhas.length } : undefined,
      });
    });
  }
  return documentos;
}

/** Modos texto livre/manual: um documento só, do tipo escolhido à mão. */
export function documentoTextoLivre(texto: string, tipo: TipoReceita): DocumentoReceita {
  const modelo: ModeloReceita = tipo === 'ESPECIAL' ? 'RCE' : tipo === 'RETENCAO' ? 'RETENCAO' : 'SIMPLES';
  return { chave: `TEXTO-${modelo}`, modelo, medicamentos: [], infos: [], textoLivre: texto };
}

/** Nome do documento para listas na tela. */
export function nomeDocumento(doc: DocumentoReceita): string {
  const regra = REGRAS_MODELO[doc.modelo];
  if (!regra.imprimeReceita) {
    const item = doc.medicamentos[0];
    return `Guia para ${regra.talonario} — ${item?.principioAtivo || item?.nomeDigitado || ''}`.trim();
  }
  const base =
    doc.modelo === 'SIMPLES'
      ? 'Receita simples (1 via)'
      : doc.modelo === 'RETENCAO'
      ? doc.soGlp1
        ? 'Receita com retenção — GLP-1 (2 vias)'
        : 'Receita de antimicrobiano (2 vias)'
      : 'Receita de Controle Especial (2 vias)';
  return doc.folha ? `${base} · folha ${doc.folha.atual}/${doc.folha.total}` : base;
}

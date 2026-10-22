// Divide a prescrição nos documentos que a farmácia aceita.
// Usado pela prévia (NovaReceita) e pela impressão (ImprimirReceita): o que
// aparece na tela é exatamente o que sai no papel.

import type { MedicamentoReceita, ModoEmissao, TipoReceita } from '../store/useReceitaStore';
import { classificar, REGRAS_MODELO, type InfoClasse, type ModeloReceita } from '../data/regrasReceita';
import { duracaoImpressa } from './quantidade';

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
 * Altura útil da área de prescrição (px a 96 dpi, na escala de alturaEstimadaItem).
 * Vias A5 medidas com ItemPrescricao: RCE tem menos espaço por causa dos quadros
 * de comprador/fornecedor. SIMPLES é a A4 de ReceitaBranca com o rodapé das
 * farmácias; lá o item real sai ~15% maior que a estimativa, daí 530 e não 632.
 */
const ALTURA_UTIL: Partial<Record<ModeloReceita, number>> = { RETENCAO: 300, RCE: 190, SIMPLES: 530 };
/**
 * No modo digital o espaço do selo/QR toma o lugar da linha de assinatura.
 * Medido: 37 px a menos na via A5 (12 mm) e 69 px na A4 (14 mm + legenda).
 */
const EXTRA_RODAPE_DIGITAL: Partial<Record<ModeloReceita, number>> = { SIMPLES: 69 };

const alturaUtil = (modelo: ModeloReceita, modo: ModoEmissao) => {
  const util = ALTURA_UTIL[modelo];
  return util === undefined ? undefined : util - (modo === 'DIGITAL' ? EXTRA_RODAPE_DIGITAL[modelo] ?? 37 : 0);
};

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
  const linhasPosologia = Math.max(1, linhas(`Posologia: ${m.posologia} — ${duracaoImpressa(m)}`, 105));
  // Orientação: 10px itálico com recuo de 4 mm (medido no navegador: ~125 caracteres por linha).
  const linhasExtras =
    linhas(m.observacoes ? `Orientação ao paciente: ${m.observacoes}` : '', 125) +
    linhas(m.justificativaLimite ? `Justificativa (quantidade acima do limite): ${m.justificativaLimite}` : '', 115);
  return 8 + linhasCabecalho * 18 + linhasPosologia * 15.5 + linhasExtras * 14.5;
}

/** O item sozinho já passa da meia folha? (texto seria cortado no papel) */
export function itemNaoCabeNaVia(m: MedicamentoReceita, modelo: ModeloReceita, modo: ModoEmissao = 'FISICO'): boolean {
  const util = alturaUtil(modelo, modo);
  return util !== undefined && alturaEstimadaItem(m) > util;
}

/** Divide em folhas respeitando o máximo de itens e a altura disponível. */
function emFolhas<T extends { m: MedicamentoReceita }>(itens: T[], modelo: ModeloReceita, modo: ModoEmissao): T[][] {
  const max = ITENS_POR_FOLHA[modelo];
  const util = alturaUtil(modelo, modo) ?? Infinity;
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

export function agruparEmDocumentos(medicamentos: MedicamentoReceita[], modo: ModoEmissao = 'FISICO'): DocumentoReceita[] {
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
    const folhas = emFolhas(grupo, modelo, modo);
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

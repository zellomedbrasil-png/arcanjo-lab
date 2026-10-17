// Quantidade a dispensar = dose por tomada × tomadas por dia × dias.
// Só calcula quando entende a posologia com segurança; na dúvida devolve null
// e a quantidade digitada fica como está.

const NUMEROS: Record<string, number> = {
  meio: 0.5, meia: 0.5, '½': 0.5, um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4,
};

const UNIDADE_CONTAVEL = /(comprimidos?|c[aá]psulas?|cp|caps?|dr[aá]geas?|sach[eê]s?|envelopes?|pastilhas?|supositorios?|supositórios?|ampolas?|adesivos?)/i;

const norm = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Quantas unidades por tomada ("1 comprimido", "meio comprimido", "2 cápsulas"). */
export function dosePorTomada(posologia: string): number | null {
  const t = norm(posologia).replace(/\*\*/g, '');
  const m = t.match(/(\d+(?:[.,]\d+)?|meio|meia|½|um|uma|dois|duas|tres|quatro)\s*\(?\w*\)?\s*(comprimidos?|capsulas?|cp|caps?|drageas?|saches?|envelopes?|pastilhas?|supositorios?|ampolas?|adesivos?)/);
  if (!m) return null;
  const n = NUMEROS[m[1]] ?? parseFloat(m[1].replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Tomadas por dia. Semanal devolve fração (1/7). */
export function tomadasPorDia(posologia: string): number | null {
  const t = norm(posologia);
  let m = t.match(/de\s*(\d+)\s*em\s*\d+\s*h/);
  if (m) return 24 / parseInt(m[1], 10);
  m = t.match(/(\d+)\s*\/\s*\1\s*h/);
  if (m) return 24 / parseInt(m[1], 10);
  m = t.match(/a cada\s*(\d+)\s*h/);
  if (m) return 24 / parseInt(m[1], 10);
  m = t.match(/(\d+)\s*(?:x|vezes)\s*(?:ao|por|\/)\s*dia/);
  if (m) return parseInt(m[1], 10);
  if (/(duas|2)\s*vezes/.test(t)) return 2;
  if (/(tres|3)\s*vezes/.test(t)) return 3;
  if (/(uma vez por semana|1x\s*(?:por|\/)\s*semana|semanal)/.test(t)) return 1 / 7;
  if (/(uma vez ao dia|1x\s*(?:ao|por|\/)\s*dia|pela manha|a noite|ao deitar|em jejum|ao dia|antes de dormir|apos o (?:cafe|almoco|jantar))/.test(t)) return 1;
  return null;
}

/** Dias de tratamento a partir de "7 dias", "2 semanas", "3 meses", "uso contínuo" (= 30). */
export function diasDeTratamento(duracao: string): number | null {
  const t = norm(duracao);
  if (/continuo/.test(t)) return 30;
  if (/dose unica/.test(t)) return 1;
  const m = t.match(/(\d+)\s*(dia|semana|mes|meses)/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  if (m[2].startsWith('dia')) return n;
  if (m[2].startsWith('semana')) return n * 7;
  return n * 30;
}

/**
 * Quantos dias a quantidade prescrita cobre ("60 comprimidos" de 12/12h → 30).
 * null quando a unidade não é contável ("1 caixa", "1 frasco") ou a posologia é ambígua.
 */
export function diasCobertos(posologia: string, quantidade: string): number | null {
  const m = (quantidade || '').match(/^\s*(\d+)\s*(?:\([^)]*\))?\s*(.*)$/);
  if (!m || !UNIDADE_CONTAVEL.test(m[2])) return null;
  const dose = dosePorTomada(posologia);
  const freq = tomadasPorDia(posologia);
  if (dose === null || freq === null) return null;
  const dias = Math.floor(parseInt(m[1], 10) / (dose * freq));
  return dias >= 1 ? dias : null;
}

/** "uso contínuo", "Uso continuo" etc. */
export const ehUsoContinuo = (duracao: string) => /cont[ií]nuo/i.test(duracao || '');

/**
 * Duração como sai nas receitas de 2 vias: "uso contínuo" ganha o período que a
 * quantidade cobre, para o farmacêutico conferir o teto de 60 dias sem fazer conta.
 */
export function duracaoImpressa(m: { duracao: string; posologia: string; quantidade: string }): string {
  if (!ehUsoContinuo(m.duracao)) return m.duracao;
  const dias = diasCobertos(m.posologia, m.quantidade);
  return dias ? `Uso contínuo — quantidade para ${dias} dias` : m.duracao;
}

/**
 * Nova quantidade para a duração escolhida, mantendo a unidade atual
 * ("30 comprimidos" → "21 comprimidos"). null quando não dá para calcular
 * (unidade não contável como frasco/caixa, ou posologia ambígua).
 */
export function quantidadeCalculada(posologia: string, duracao: string, quantidadeAtual: string): string | null {
  const unidade = (quantidadeAtual.match(/^\s*\d+\s*(?:\([^)]*\))?\s*(.*)$/)?.[1] ?? '').trim();
  if (unidade && !UNIDADE_CONTAVEL.test(unidade)) return null;
  const dose = dosePorTomada(posologia);
  const freq = tomadasPorDia(posologia);
  const dias = diasDeTratamento(duracao);
  if (dose === null || freq === null || dias === null) return null;
  const total = Math.ceil(dose * freq * dias);
  if (total < 1) return null;
  const unidadeFinal = unidade || (/c[aá]psula/i.test(posologia) ? 'cápsulas' : 'comprimidos');
  // Ajusta singular/plural da unidade
  const singular = unidadeFinal.replace(/s$/, '').replace(/ões$/, 'ão');
  return `${total} ${total === 1 ? singular : unidadeFinal.endsWith('s') ? unidadeFinal : `${unidadeFinal}s`}`;
}

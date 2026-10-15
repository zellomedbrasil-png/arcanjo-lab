// Quantidade por extenso — exigida na Receita de Controle Especial e nas
// Notificações (Portaria 344/98, arts. 35 §3º e 55): "30 (trinta) comprimidos".

const UNIDADES_M = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
const UNIDADES_F = ['zero', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
const DEZ_A_DEZENOVE = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
const DEZENAS = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const CENTENAS_M = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
const CENTENAS_F = ['', 'cento', 'duzentas', 'trezentas', 'quatrocentas', 'quinhentas', 'seiscentas', 'setecentas', 'oitocentas', 'novecentas'];

function ate999(n: number, feminino: boolean): string {
  if (n === 100) return 'cem';
  const unidades = feminino ? UNIDADES_F : UNIDADES_M;
  const centenas = feminino ? CENTENAS_F : CENTENAS_M;
  const partes: string[] = [];
  const c = Math.floor(n / 100);
  const resto = n % 100;
  if (c) partes.push(centenas[c]);
  if (resto >= 10 && resto < 20) partes.push(DEZ_A_DEZENOVE[resto - 10]);
  else {
    const d = Math.floor(resto / 10);
    const u = resto % 10;
    if (d) partes.push(DEZENAS[d]);
    if (u) partes.push(unidades[u]);
  }
  return partes.join(' e ');
}

/** 0–999.999 por extenso, em português. */
export function numeroPorExtenso(n: number, feminino = false): string {
  if (!Number.isInteger(n) || n < 0 || n > 999_999) return String(n);
  if (n === 0) return 'zero';
  const milhares = Math.floor(n / 1000);
  const resto = n % 1000;
  const partes: string[] = [];
  if (milhares) partes.push(milhares === 1 ? 'mil' : `${ate999(milhares, false)} mil`);
  if (resto) partes.push(ate999(resto, feminino));
  // "mil e cem", "mil e vinte", mas "mil duzentos e trinta"
  const ligaComE = milhares && resto && (resto < 100 || resto % 100 === 0);
  return partes.join(ligaComE ? ' e ' : ' ');
}

/** Unidades femininas comuns em receita — definem "uma/duas/duzentas". */
const UNIDADES_FEMININAS = /^(c[aá]psula|caixa|ampola|dr[aá]gea|gota|bisnaga|seringa|caneta|unidade|pastilha|cartela|bolsa|ampola|suspens|solu[cç]|pomada|embalagem|dose)/i;

export interface QuantidadeLida {
  numero: number;
  unidade: string;
}

/** Lê "30 comprimidos", "02 caixas", "1 frasco de 100ml". */
export function lerQuantidade(texto: string): QuantidadeLida | null {
  const m = (texto || '').trim().match(/^(\d{1,6})\s*(?:\([^)]*\))?\s*(.*)$/);
  if (!m) return null;
  return { numero: parseInt(m[1], 10), unidade: m[2].trim() };
}

/**
 * "30 comprimidos" → "30 (trinta) comprimidos".
 * Se já houver extenso entre parênteses, ou se não começar com número, devolve o texto como veio.
 */
export function quantidadeComExtenso(texto: string): string {
  const t = (texto || '').trim();
  if (/^\d+\s*\(/.test(t)) return t;
  const q = lerQuantidade(t);
  if (!q) return t;
  const feminino = UNIDADES_FEMININAS.test(q.unidade);
  return `${q.numero} (${numeroPorExtenso(q.numero, feminino)})${q.unidade ? ` ${q.unidade}` : ''}`;
}

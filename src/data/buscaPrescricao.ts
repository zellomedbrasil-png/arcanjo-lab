// Busca da barra de prescrição: remédios (com dose), protocolos e modelos,
// num ranking só. O índice é calculado uma vez no carregamento do módulo.
//
// "losa" → Losartana · "losartana 100" → Losartana 100 mg · "cozaar" → Losartana
// "drge" / "azia" → protocolo de DRGE · "has idoso" → protocolo de HAS (geriatria)

import { MEDICAMENTOS, normalizar, getMedicamento, type InfoGratuito, type MedicamentoDef } from './medicamentos';
import { PROTOCOLOS, type ItemProtocolo, type ProtocoloQueixa } from './protocolos';
import type { MedicamentoReceita } from '../store/useReceitaStore';
import type { ItemSalvo, ModeloReceita } from '../store/useAtalhosReceitaStore';

// ─── Apresentações ──────────────────────────────────────────────────────────

export interface OpcaoDose {
  rotulo: string;
  principioAtivo: string;
  formaFarmaceutica: string;
  posologia: string;
  quantidade: string;
  duracao: string;
  observacoes: string;
  /** Gratuidade desta dose (variante não herda a da padrão). */
  gratuito?: InfoGratuito;
}

/** "Losartana Potássica 50mg" → "50 mg". */
function rotuloDaDose(principioAtivo: string): string {
  const m = principioAtivo.match(/(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+(?:[.,]\d+)?)?)\s*(mg\/ml|mcg|mg|g|UI\/ml|UI|ml|%)/i);
  return m ? `${m[1]} ${m[2].toLowerCase().replace('ui', 'UI')}` : 'padrão';
}

/** Todas as doses do medicamento; índice 0 é a padrão. */
export function dosesDe(med: MedicamentoDef): OpcaoDose[] {
  const padrao: OpcaoDose = {
    rotulo: rotuloDaDose(med.principioAtivo),
    principioAtivo: med.principioAtivo,
    formaFarmaceutica: med.formaFarmaceutica,
    posologia: med.posologiaPadrao,
    quantidade: med.quantidadePadrao,
    duracao: med.duracaoPadrao,
    observacoes: med.observacoes ?? '',
    gratuito: med.gratuito,
  };
  return [
    padrao,
    ...(med.apresentacoes ?? []).map((a) => ({
      rotulo: a.rotulo,
      principioAtivo: a.principioAtivo,
      formaFarmaceutica: a.formaFarmaceutica ?? padrao.formaFarmaceutica,
      posologia: a.posologiaPadrao ?? padrao.posologia,
      quantidade: a.quantidadePadrao ?? padrao.quantidade,
      duracao: a.duracaoPadrao ?? padrao.duracao,
      observacoes: a.observacoes ?? padrao.observacoes,
      gratuito: a.gratuito,
    })),
  ];
}

/** Canais gratuitos presentes em qualquer dose do medicamento. */
export function canaisGratuitos(med: MedicamentoDef): Set<NonNullable<OpcaoDose['gratuito']>['canal']> {
  return new Set(dosesDe(med).flatMap((d) => (d.gratuito ? [d.gratuito.canal] : [])));
}

/** Item pronto para entrar na receita a partir do catálogo. */
export function itemDoCatalogo(med: MedicamentoDef, dose = 0): Omit<Partial<MedicamentoReceita>, 'id'> {
  const d = dosesDe(med)[dose] ?? dosesDe(med)[0];
  return {
    nomeDigitado: med.nome,
    principioAtivo: d.principioAtivo,
    formaFarmaceutica: d.formaFarmaceutica,
    uso: med.uso,
    posologia: d.posologia,
    quantidade: d.quantidade,
    duracao: d.duracao,
    indicacao: med.indicacao,
    observacoes: d.observacoes,
    tipoRecomendado: med.tipoRecomendado,
    motivoEspecial: med.motivoEspecial ?? '',
    catalogoId: med.id,
    apresentacao: dose,
  };
}

/** Itens de uma versão de protocolo (posologia do protocolo sobrepõe a padrão). */
export function itensDoProtocolo(itens: ItemProtocolo[]): Array<Omit<Partial<MedicamentoReceita>, 'id'>> {
  return itens.flatMap((i) => {
    const med = getMedicamento(i.medicamentoId);
    if (!med) return [];
    return [{
      ...itemDoCatalogo(med, i.apresentacao ?? 0),
      posologia: i.posologia,
      quantidade: i.quantidade,
      duracao: i.duracao,
      observacoes: i.observacoes ?? '',
    }];
  });
}

/** Itens de um modelo ou do histórico, já sem os campos de tela. */
export const itensSalvos = (itens: ItemSalvo[]) => itens.map((i) => ({ ...i }));

// ─── Índice ─────────────────────────────────────────────────────────────────

interface EntradaMed {
  med: MedicamentoDef;
  nome: string;
  palavrasNome: string[];
  palavrasPrincipio: string[];
  marca: string;
  indicacao: string;
  doses: string[];
}

const palavras = (t: string) => normalizar(t).split(/[^a-z0-9]+/).filter(Boolean);

const INDICE_MEDS: EntradaMed[] = MEDICAMENTOS.map((med) => ({
  med,
  nome: normalizar(med.nome),
  palavrasNome: palavras(med.nome),
  palavrasPrincipio: palavras(`${med.principioAtivo} ${(med.apresentacoes ?? []).map((a) => a.principioAtivo).join(' ')}`),
  marca: normalizar(med.marcaReferencia),
  indicacao: normalizar(med.indicacao),
  doses: dosesDe(med).map((d) => normalizar(`${d.rotulo} ${d.principioAtivo}`)),
}));

interface EntradaProtocolo {
  protocolo: ProtocoloQueixa;
  termos: string[];
}

const INDICE_PROTOCOLOS: EntradaProtocolo[] = PROTOCOLOS.map((protocolo) => ({
  protocolo,
  termos: [protocolo.queixa, ...protocolo.sinonimos, protocolo.cid10, protocolo.area === 'GERIATRIA' ? 'idoso geriatria' : protocolo.area === 'GASTRO' ? 'gastro' : 'clinica']
    .map(normalizar),
}));

// ─── Busca ──────────────────────────────────────────────────────────────────

export type ResultadoBusca =
  | { tipo: 'MED'; chave: string; med: MedicamentoDef; dose: number; score: number }
  | { tipo: 'PROTOCOLO'; chave: string; protocolo: ProtocoloQueixa; score: number }
  | { tipo: 'MODELO'; chave: string; modelo: ModeloReceita; score: number };

function pontuarToken(token: string, e: EntradaMed): number {
  if (e.nome.startsWith(token)) return 100;
  if (e.palavrasNome.some((p) => p.startsWith(token))) return 75;
  if (e.palavrasPrincipio.some((p) => p.startsWith(token))) return 60;
  if (e.marca.startsWith(token) || e.marca.split(' ').some((p) => p.startsWith(token))) return 55;
  if (token.length >= 3 && (e.nome.includes(token) || e.palavrasPrincipio.some((p) => p.includes(token)))) return 30;
  if (token.length >= 3 && e.indicacao.split(/[^a-z0-9]+/).some((p) => p.startsWith(token))) return 12;
  return 0;
}

/**
 * @param usos contagem de uso por `${id}|${dose}` — desempata a favor do que o médico mais prescreve.
 */
export function buscarPrescricao(
  consulta: string,
  opcoes: { usos?: Record<string, { n: number }>; favoritos?: string[]; modelos?: ModeloReceita[]; limite?: number } = {}
): ResultadoBusca[] {
  const q = normalizar(consulta).trim();
  if (!q) return [];
  const tokens = q.split(/\s+/);
  const numeros = tokens.filter((t) => /^\d+([.,]\d+)?$/.test(t));
  const texto = tokens.filter((t) => !numeros.includes(t));
  const usos = opcoes.usos ?? {};
  const resultados: ResultadoBusca[] = [];

  if (texto.length) {
    for (const e of INDICE_MEDS) {
      let score = 0;
      let todos = true;
      for (const t of texto) {
        const p = pontuarToken(t, e);
        if (!p) { todos = false; break; }
        score += p;
      }
      if (!todos) continue;
      // Número digitado escolhe a dose ("losartana 100").
      let dose = 0;
      if (numeros.length) {
        const n = numeros[0].replace(',', '.');
        const achou = e.doses.findIndex((d) => new RegExp(`(^|[^0-9.])${n.replace('.', '\\.')}([^0-9]|$)`).test(d.replace(/,/g, '.')));
        if (achou >= 0) { dose = achou; score += 40; } else score -= 10;
      }
      // Sem número digitado, sugere a dose que o médico mais usa deste remédio.
      let usoMed = 0;
      let maisUsada = { dose: 0, n: 0 };
      e.doses.forEach((_, i) => {
        const n = usos[`${e.med.id}|${i}`]?.n ?? 0;
        usoMed += n;
        if (n > maisUsada.n) maisUsada = { dose: i, n };
      });
      if (!numeros.length && maisUsada.n > 0) dose = maisUsada.dose;
      score += Math.min(usoMed, 20) * 1.5;
      // Favorito sobe na busca e já vem com a dose favoritada.
      const fav = (opcoes.favoritos ?? []).find((f) => f.startsWith(`${e.med.id}|`));
      if (fav) {
        score += 25;
        if (!numeros.length) dose = Number(fav.split('|')[1]) || 0;
      }
      resultados.push({ tipo: 'MED', chave: `med:${e.med.id}`, med: e.med, dose, score });
    }

    for (const e of INDICE_PROTOCOLOS) {
      let score = 0;
      let todos = true;
      for (const t of texto) {
        const casa = e.termos.find((termo) => termo.startsWith(t) || termo.split(/\s+/).some((p) => p.startsWith(t)));
        if (!casa) { todos = false; break; }
        score += casa.startsWith(t) ? 70 : 45;
      }
      if (todos) resultados.push({ tipo: 'PROTOCOLO', chave: `prot:${e.protocolo.id}`, protocolo: e.protocolo, score: score * 0.9 });
    }

    for (const modelo of opcoes.modelos ?? []) {
      const nome = normalizar(modelo.nome);
      if (texto.every((t) => nome.split(/\s+/).some((p) => p.startsWith(t)))) {
        resultados.push({ tipo: 'MODELO', chave: `mod:${modelo.id}`, modelo, score: 95 * texto.length });
      }
    }
  }

  return resultados.sort((a, b) => b.score - a.score).slice(0, opcoes.limite ?? 10);
}

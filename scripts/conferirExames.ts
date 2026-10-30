// Conferência dos protocolos de exames — rodar após editar src/data/exames.ts,
// src/data/protocolosExames.ts ou src/data/precosExames.ts:  npm run conferir:exames
//
// Falha (exit 1) quando:
// - alguma das 24 guias geradas difere do doc de referência (exames, contagem ou R$);
// - um exame de protocolo, critério, equivalência ou painel não existe no catálogo;
// - um item de protocolo não tem código no convênio em que vale;
// - a guia de retorno repete exame da 1ª consulta da mesma combinação;
// - um nome aparece duas vezes no catálogo.
// Avisos não falham: listam códigos repetidos no catálogo, a conferir na tabela.

import { readFileSync } from 'node:fs';
import { CATEGORIAS_EXAMES, PAINEIS_MARKDOWN } from '../src/data/exames';
import {
  BLOCOS_PROTOCOLO_EXAMES,
  CODIGOS_A_CONFERIR,
  CRITERIOS_EXAMES,
  EQUIVALENCIAS_CONVENIO,
  type ConvenioProtocolo,
  type Especialidade,
  type SexoProtocolo,
  type TipoConsulta,
} from '../src/data/protocolosExames';
import { montarGuiaExames } from '../src/utils/montarGuiaExames';

interface GuiaRef {
  area: Especialidade;
  consulta: TipoConsulta;
  sexo: SexoProtocolo;
  convenio: ConvenioProtocolo;
  total: number;
  itens: { exame: string; catalogo: string; codigo: string; valor: number }[];
}

const erros: string[] = [];
const avisos: string[] = [];

const catalogo = CATEGORIAS_EXAMES.flatMap((c) => c.exames);
const nomes = new Map<string, number>();
for (const e of catalogo) nomes.set(e.nome, (nomes.get(e.nome) ?? 0) + 1);
for (const [n, q] of nomes) if (q > 1) erros.push(`catálogo: "${n}" aparece ${q}x`);
const existe = (n: string) => nomes.has(n);
const cod = (n: string, c: ConvenioProtocolo) => {
  const e = catalogo.find((x) => x.nome === n);
  return e ? (c === 'ISSEC' ? e.codIssec : e.codIpm) : '';
};

// Referências cruzadas
for (const b of BLOCOS_PROTOCOLO_EXAMES) {
  for (const i of b.itens) {
    if (!existe(i.exame)) {
      erros.push(`bloco ${b.id}: "${i.exame}" fora do catálogo`);
      continue;
    }
    const convs = i.quando?.convenio ?? b.quando.convenio ?? (['ISSEC', 'IPM'] as const);
    for (const c of convs) if (!cod(i.exame, c)) erros.push(`bloco ${b.id}: "${i.exame}" sem código ${c}`);
  }
}
for (const c of CRITERIOS_EXAMES) if (!existe(c.exame)) erros.push(`critério: "${c.exame}" fora do catálogo`);
for (const c of CODIGOS_A_CONFERIR) for (const n of c.exames) if (!existe(n)) erros.push(`código a conferir: "${n}" fora do catálogo`);
for (const e of EQUIVALENCIAS_CONVENIO) {
  for (const n of [e.exame, ...e.usar]) if (!existe(n)) erros.push(`equivalência: "${n}" fora do catálogo`);
  for (const n of e.usar) if (!cod(n, e.convenio)) erros.push(`equivalência: "${n}" sem código ${e.convenio}`);
}
for (const [chave, p] of Object.entries(PAINEIS_MARKDOWN)) {
  for (const n of p.exames) if (!existe(n)) erros.push(`painel ${chave}: "${n}" fora do catálogo`);
}

// As 24 guias
const ref: { guias: GuiaRef[] } = JSON.parse(readFileSync(new URL('./fixtures/guias-exames-24.json', import.meta.url), 'utf8'));
let iguais = 0;
for (const g of ref.guias) {
  const nome = `${g.area} · ${g.consulta} · ${g.sexo} · ${g.convenio}`;
  const guia = montarGuiaExames(g);
  const gerados = guia.itens.filter((i) => i.marcado).map((i) => i.exame);
  const esperados = [...new Set(g.itens.map((i) => i.catalogo))];
  const faltam = esperados.filter((n) => !gerados.includes(n));
  const sobram = gerados.filter((n) => !esperados.includes(n));
  if (faltam.length) erros.push(`${nome}: faltam ${faltam.join(', ')}`);
  if (sobram.length) erros.push(`${nome}: sobram ${sobram.join(', ')}`);
  if (gerados.length !== g.itens.length) erros.push(`${nome}: ${gerados.length} exames, o doc tem ${g.itens.length}`);
  if (Math.abs(guia.total - g.total) > 0.005 || guia.semValor) {
    erros.push(`${nome}: total R$ ${guia.total.toFixed(2)} (${guia.semValor} sem valor), o doc tem R$ ${g.total.toFixed(2)}`);
  }
  for (const i of g.itens) {
    const gi = guia.itens.find((x) => x.exame === i.catalogo);
    if (gi && gi.codigo !== i.codigo) erros.push(`${nome}: ${i.catalogo} com código ${gi.codigo}, o doc usa ${i.codigo}`);
  }
  if (!faltam.length && !sobram.length && gerados.length === g.itens.length && Math.abs(guia.total - g.total) <= 0.005) iguais++;
}

// 1ª consulta x retorno
for (const g of ref.guias.filter((x) => x.consulta === 'PRIMEIRA')) {
  const p = montarGuiaExames(g).itens.map((i) => i.exame);
  const r = montarGuiaExames({ ...g, consulta: 'RETORNO' }).itens.map((i) => i.exame);
  const rep = r.filter((n) => p.includes(n));
  if (rep.length) erros.push(`${g.area} · ${g.sexo} · ${g.convenio}: retorno repete ${rep.join(', ')}`);
}

// Códigos repetidos no catálogo (informativo)
for (const c of ['ISSEC', 'IPM'] as const) {
  const porCod = new Map<string, string[]>();
  for (const e of catalogo) {
    const k = c === 'ISSEC' ? e.codIssec : e.codIpm;
    if (k) porCod.set(k, [...(porCod.get(k) ?? []), e.nome]);
  }
  for (const [k, ns] of porCod) if (ns.length > 1) avisos.push(`${c} ${k}: ${ns.join(' / ')}`);
}

const itens = BLOCOS_PROTOCOLO_EXAMES.reduce((n, b) => n + b.itens.length, 0);
console.log(`Catálogo: ${catalogo.length} exames · ${BLOCOS_PROTOCOLO_EXAMES.length} blocos, ${itens} itens · guias iguais ao doc: ${iguais}/${ref.guias.length}`);
if (avisos.length) console.log(`\nCódigos repetidos no catálogo (${avisos.length}), conferir na tabela:\n- ${avisos.join('\n- ')}`);
if (erros.length) {
  console.error(`\nErros (${erros.length}):\n- ${erros.join('\n- ')}`);
  process.exit(1);
}
console.log('\nOK — nenhum erro.');

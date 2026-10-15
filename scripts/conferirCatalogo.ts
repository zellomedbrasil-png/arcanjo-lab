// Conferência do catálogo e dos protocolos — rodar após editar src/data/catalogo
// ou src/data/protocolos*.ts:  npm run conferir:catalogo
//
// Falha (exit 1) quando há: id duplicado, quantidade que não começa com número,
// posologia vaga (motivo de recusa na farmácia), protocolo apontando para id ou
// dose inexistente. Avisos não falham, só listam o que vale revisar.

import { MEDICAMENTOS } from '../src/data/medicamentos';
import { PROTOCOLOS } from '../src/data/protocolos';
import { dosesDe } from '../src/data/buscaPrescricao';

const erros: string[] = [];
const avisos: string[] = [];
const VAGA = /conforme orienta|a crit[eé]rio|conforme necessidade|esquema individualizado/i;

const ids = new Map<string, number>();
for (const m of MEDICAMENTOS) ids.set(m.id, (ids.get(m.id) ?? 0) + 1);
for (const [id, n] of ids) if (n > 1) erros.push(`id duplicado: ${id} (${n}x)`);

for (const m of MEDICAMENTOS) {
  dosesDe(m).forEach((d, i) => {
    const onde = `${m.id}${i ? ` [${d.rotulo}]` : ''}`;
    if (!/^\d/.test(d.quantidade.trim())) erros.push(`${onde}: quantidade sem número ("${d.quantidade}")`);
    if (!d.posologia.trim()) erros.push(`${onde}: posologia vazia`);
    else if (VAGA.test(d.posologia)) erros.push(`${onde}: posologia vaga ("${d.posologia}")`);
  });
  if (m.grupo === 'ANTIMICROBIANO' && m.regra?.modelo === 'SIMPLES') {
    avisos.push(`${m.id}: no grupo antimicrobianos, mas classificado como receita simples (antiparasitário/antiviral?)`);
  }
  const rotulos = dosesDe(m).map((d) => d.rotulo);
  if (new Set(rotulos).size !== rotulos.length) avisos.push(`${m.id}: rótulos de dose repetidos (${rotulos.join(', ')})`);
}

for (const p of PROTOCOLOS) {
  const versoes = [['padrão-ouro', p.padraoOuro], ['acessível', p.acessivel]] as const;
  for (const [nome, v] of versoes) {
    if (!v) continue;
    for (const item of v.medicamentos) {
      const med = MEDICAMENTOS.find((m) => m.id === item.medicamentoId);
      if (!med) {
        erros.push(`protocolo ${p.id} (${nome}): medicamento inexistente "${item.medicamentoId}"`);
        continue;
      }
      if (item.apresentacao !== undefined && !dosesDe(med)[item.apresentacao]) {
        erros.push(`protocolo ${p.id} (${nome}): dose ${item.apresentacao} não existe em ${med.id}`);
      }
      if (!/^\d/.test(item.quantidade.trim())) erros.push(`protocolo ${p.id} (${nome}) ${med.id}: quantidade sem número`);
      if (VAGA.test(item.posologia)) erros.push(`protocolo ${p.id} (${nome}) ${med.id}: posologia vaga`);
      if (/\d\s*\/\s*\d\s*a\s*\d/.test(item.posologia)) avisos.push(`protocolo ${p.id} ${med.id}: posologia com faixa ("${item.posologia}")`);
    }
  }
}

const doses = MEDICAMENTOS.reduce((n, m) => n + dosesDe(m).length, 0);
console.log(`Catálogo: ${MEDICAMENTOS.length} medicamentos, ${doses} apresentações · ${PROTOCOLOS.length} protocolos`);
if (avisos.length) console.log(`\nAvisos (${avisos.length}):\n- ${avisos.join('\n- ')}`);
if (erros.length) {
  console.error(`\nErros (${erros.length}):\n- ${erros.join('\n- ')}`);
  process.exit(1);
}
console.log('\nOK — nenhum erro.');

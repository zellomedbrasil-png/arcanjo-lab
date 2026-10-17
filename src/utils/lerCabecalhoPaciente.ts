// Lê o cabeçalho do paciente copiado do sistema do convênio (Ctrl+C no bloco
// "Paciente: ... Nascimento: ... Sexo: ... Endereço: ... Convenio: ...").
// Leitura local e determinística: o texto chega em uma linha, com tabs ou em
// várias linhas, conforme o navegador copia a tabela.

import { formatCpf } from '../lib/formatters';
import type { Convenio, Genero } from '../types';

export interface DadosColados {
  nome: string;
  nascimento?: string;
  idade?: string;
  genero?: Genero;
  cpf?: string;
  convenio?: Convenio;
  numeroBeneficiario?: string;
  endereco?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  telefone?: string;
  /** O que foi lido, em palavras curtas, para o aviso ao médico. */
  lidos: string[];
}

type Campo =
  | 'nome' | 'nascimento' | 'idade' | 'sexo' | 'cpf' | 'endereco' | 'convenio'
  | 'cidade' | 'cep' | 'telefone' | 'matricula' | 'outro';

/** Rótulos sem acento e em minúsculas. "outro" só serve para fechar o valor anterior. */
const ROTULOS: Array<[string, Campo]> = [
  ['nome do paciente', 'nome'], ['paciente', 'nome'], ['nome', 'nome'],
  ['data de nascimento', 'nascimento'], ['dt. nasc.', 'nascimento'], ['dt nasc', 'nascimento'], ['nascimento', 'nascimento'],
  ['idade', 'idade'], ['sexo', 'sexo'], ['cpf', 'cpf'],
  ['endereco', 'endereco'], ['convenio', 'convenio'], ['plano', 'convenio'],
  ['cidade', 'cidade'], ['cep', 'cep'], ['telefone', 'telefone'], ['celular', 'telefone'], ['fone', 'telefone'],
  ['matricula', 'matricula'], ['carteira', 'matricula'], ['carteirinha', 'matricula'],
  ['exame', 'outro'], ['estado civil', 'outro'], ['ocupacao', 'outro'], ['indicacao', 'outro'],
  ['profissao', 'outro'], ['mae', 'outro'], ['nome da mae', 'outro'], ['prontuario', 'outro'],
];

const ESTADOS: Record<string, string> = {
  acre: 'AC', alagoas: 'AL', amapa: 'AP', amazonas: 'AM', bahia: 'BA', ceara: 'CE',
  'distrito federal': 'DF', 'espirito santo': 'ES', goias: 'GO', maranhao: 'MA',
  'mato grosso do sul': 'MS', 'mato grosso': 'MT', 'minas gerais': 'MG', para: 'PA',
  paraiba: 'PB', parana: 'PR', pernambuco: 'PE', piaui: 'PI', 'rio de janeiro': 'RJ',
  'rio grande do norte': 'RN', 'rio grande do sul': 'RS', rondonia: 'RO', roraima: 'RR',
  'santa catarina': 'SC', 'sao paulo': 'SP', sergipe: 'SE', tocantins: 'TO',
};
const SIGLAS = new Set(Object.values(ESTADOS));

/** Tira acento mantendo o mesmo comprimento — os índices valem no texto original. */
const semAcento = (t: string) => [...t].map((c) => c.normalize('NFD')[0]).join('').toLowerCase();

const escapar = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const RE_ROTULO = new RegExp(
  `(?:^|[\\s|;])(${ROTULOS.map(([r]) => escapar(r)).sort((a, b) => b.length - a.length).join('|')})\\s*:`,
  'g'
);

const VAZIO = /^(sem informa[cç][aã]o|n[aã]o informad[oa]|-+|\.+)$/i;

const PALAVRAS_MINUSCULAS = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);
const titulo = (t: string) =>
  t.toLowerCase().split(/\s+/).filter(Boolean)
    .map((p, i) => (i > 0 && PALAVRAS_MINUSCULAS.has(p) ? p : p[0].toUpperCase() + p.slice(1)))
    .join(' ');

function idadeDaData(ddmmaaaa: string, hoje = new Date()): number | null {
  const m = ddmmaaaa.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [d, mes, a] = [Number(m[1]), Number(m[2]), Number(m[3])];
  let idade = hoje.getFullYear() - a;
  if (hoje.getMonth() + 1 < mes || (hoje.getMonth() + 1 === mes && hoje.getDate() < d)) idade--;
  return idade >= 0 && idade < 130 ? idade : null;
}

/** "FORTALEZA CEARA", "Fortaleza - CE", "Fortaleza/CE" → cidade + UF. */
function cidadeUf(trecho: string): { cidade: string; uf: string } | null {
  const t = semAcento(trecho).trim();
  for (const nome of Object.keys(ESTADOS).sort((a, b) => b.length - a.length)) {
    if (t === nome || t.endsWith(` ${nome}`) || t.endsWith(`-${nome}`) || t.endsWith(`/${nome}`)) {
      const cidade = trecho.slice(0, trecho.length - nome.length).replace(/[\s\-/]+$/, '');
      return { cidade: cidade ? titulo(cidade) : '', uf: ESTADOS[nome] };
    }
  }
  const m = trecho.match(/^(.*?)[\s\-/]+([A-Za-z]{2})$/);
  if (m && SIGLAS.has(m[2].toUpperCase())) return { cidade: titulo(m[1]), uf: m[2].toUpperCase() };
  return null;
}

/** "Rua X, 0 , FORTALEZA CEARA" → endereço "Rua X, s/n", Fortaleza/CE. */
function lerEndereco(valor: string) {
  let resto = valor;
  const cep = resto.match(/\b\d{5}-?\d{3}\b/)?.[0];
  if (cep) resto = resto.replace(cep, ' ');
  const partes = resto.split(',').map((p) => p.trim()).filter(Boolean);
  let local: { cidade: string; uf: string } | null = null;
  if (partes.length > 1) {
    local = cidadeUf(partes[partes.length - 1]);
    if (local) partes.pop();
  }
  const endereco = partes.map((p) => (/^0+$/.test(p) ? 's/n' : p)).join(', ');
  return { endereco, cidade: local?.cidade, uf: local?.uf, cep: cep?.replace(/^(\d{5})-?(\d{3})$/, '$1-$2') };
}

/**
 * Lê o bloco colado. Devolve null quando não parece um cabeçalho de paciente
 * (precisa de Paciente/Nome e mais algum rótulo) — aí a colagem segue normal.
 */
export function lerCabecalhoPaciente(texto: string, hoje = new Date()): DadosColados | null {
  if (!texto || texto.length > 5000) return null;
  const norm = semAcento(texto);

  const achados: Array<{ campo: Campo; inicio: number; fim: number }> = [];
  for (const m of norm.matchAll(RE_ROTULO)) {
    const rotulo = m[1];
    const campo = ROTULOS.find(([r]) => r === rotulo)![1];
    achados.push({ campo, inicio: m.index! + m[0].indexOf(rotulo), fim: m.index! + m[0].length });
  }
  const valores: Partial<Record<Campo, string>> = {};
  achados.forEach((a, i) => {
    const ate = i + 1 < achados.length ? achados[i + 1].inicio : texto.length;
    const bruto = texto.slice(a.fim, ate).split(/[\t\r\n]/)[0].replace(/[\s|;,]+$/, '').trim();
    if (bruto && !VAZIO.test(bruto) && !valores[a.campo]) valores[a.campo] = bruto.replace(/\s+/g, ' ');
  });

  const nome = valores.nome;
  const rotulosDistintos = new Set(achados.map((a) => a.campo)).size;
  if (!nome || nome.length < 3 || rotulosDistintos < 2) return null;

  const d: DadosColados = { nome, lidos: ['nome'] };

  const nasc = valores.nascimento?.match(/\d{2}\/\d{2}\/\d{4}/)?.[0];
  if (nasc) {
    d.nascimento = nasc;
    d.lidos.push('nascimento');
  }
  const idade = (nasc && idadeDaData(nasc, hoje)) ?? Number(valores.idade?.match(/^\d{1,3}/)?.[0] ?? NaN);
  if (Number.isFinite(idade)) {
    d.idade = String(idade);
    d.lidos.push(`${idade} anos`);
  }

  const sexo = semAcento(valores.sexo ?? '');
  if (/^f/.test(sexo)) d.genero = 'F';
  else if (/^m/.test(sexo)) d.genero = 'M';
  if (d.genero) d.lidos.push(d.genero === 'F' ? 'feminino' : 'masculino');

  // CPF: só 11 dígitos sob o rótulo, ou o formato com pontos em qualquer lugar
  // (11 dígitos soltos podem ser telefone).
  const cpfDigitos = valores.cpf?.replace(/\D/g, '');
  const cpf = cpfDigitos?.length === 11 ? cpfDigitos : texto.match(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/)?.[0];
  if (cpf) {
    d.cpf = formatCpf(cpf);
    d.lidos.push('CPF');
  }

  const conv = semAcento(valores.convenio ?? '');
  if (/\bissec\b/.test(conv)) d.convenio = 'ISSEC';
  else if (/\bipm\b/.test(conv)) d.convenio = 'IPM';
  const numero = (valores.matricula ?? valores.convenio ?? '').match(/\d[\d.\-/]{3,}\d/)?.[0];
  if (d.convenio) d.lidos.push(numero ? `${d.convenio} ${numero}` : d.convenio);
  if (numero && (d.convenio || valores.matricula)) d.numeroBeneficiario = numero;

  if (valores.endereco) {
    const e = lerEndereco(valores.endereco);
    if (e.endereco) {
      d.endereco = e.endereco;
      d.lidos.push('endereço');
    }
    if (e.cidade) d.cidade = e.cidade;
    if (e.uf) d.uf = e.uf;
    if (e.cep) d.cep = e.cep;
  }
  if (!d.cidade && valores.cidade) {
    const c = cidadeUf(valores.cidade);
    d.cidade = c?.cidade ?? titulo(valores.cidade);
    if (c?.uf) d.uf = c.uf;
  }
  const cep = valores.cep?.replace(/\D/g, '');
  if (!d.cep && cep?.length === 8) d.cep = `${cep.slice(0, 5)}-${cep.slice(5)}`;
  if (valores.telefone && valores.telefone.replace(/\D/g, '').length >= 10) d.telefone = valores.telefone;

  return d;
}

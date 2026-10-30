// Conferência da classificação de receita — rodar após editar src/data/regrasReceita.ts
// ou src/utils/agruparReceita.ts:  npm run conferir:receitas
//
// Falha (exit 1) quando um caso conhecido sai em modelo ou classe diferente do
// esperado: lista do art. 1º da IN 360/2025 (antimicrobiano, 2 vias), anti-infecciosos
// fora dela (receita simples), GLP-1, listas da Portaria 344 e a divisão em documentos.

import { classificar, type ClasseControle, type ModeloReceita } from '../src/data/regrasReceita';
import { agruparEmDocumentos } from '../src/utils/agruparReceita';
import type { MedicamentoReceita } from '../src/store/useReceitaStore';

const erros: string[] = [];

interface Caso {
  nome: string;
  uso?: string;
  modelo: ModeloReceita;
  classe?: ClasseControle;
}

/**
 * Art. 1º da IN 360/2025, um nome por termo da tabela ANTIMICROBIANOS. O item 42
 * não aparece no texto consultado; ceftazidima entra nas duas grafias da norma.
 */
const IN_360 = [
  // ácidos
  'Ácido clavulânico', 'Ácido fusídico', 'Ácido nalidíxico', 'Ácido oxolínico', 'Ácido pipemídico',
  // aminoglicosídeos
  'Amicacina', 'Gentamicina', 'Tobramicina', 'Neomicina', 'Netilmicina', 'Estreptomicina',
  'Espectinomicina',
  // penicilinas e associações
  'Amoxicilina', 'Ampicilina', 'Metampicilina', 'Sultamicilina', 'Fenoximetilpenicilina',
  'Benzilpenicilina benzatina', 'Oxacilina', 'Cloxacilina', 'Dicloxacilina', 'Carbenicilina',
  'Ticarcilina', 'Piperacilina', 'Sulbactam', 'Tazobactam',
  // cefalosporinas e outros betalactâmicos
  'Cefaclor', 'Cefadroxila', 'Cefalexina', 'Cefalotina', 'Cefazolina', 'Cefepima', 'Cefodizima',
  'Cefoperazona', 'Cefotaxima', 'Cefoxitina', 'Cefpodoxima', 'Cefpiroma', 'Cefprozila',
  'Ceftazidima', 'Ceftadizima', 'Ceftarolina', 'Ceftobiprol', 'Ceftriaxona', 'Cefuroxima',
  'Loracarbef', 'Aztreonam', 'Imipenem', 'Meropenem', 'Ertapenem', 'Doripenem',
  // macrolídeos e lincosamidas
  'Azitromicina', 'Claritromicina', 'Eritromicina', 'Roxitromicina', 'Diritromicina',
  'Telitromicina', 'Espiramicina', 'Miocamicina', 'Clindamicina', 'Lincomicina',
  // quinolonas
  'Ciprofloxacino', 'Levofloxacino', 'Norfloxacino', 'Ofloxacino', 'Moxifloxacino', 'Gatifloxacino',
  'Gemifloxacino', 'Besifloxacino', 'Lomefloxacino', 'Pefloxacino', 'Trovafloxacino', 'Rosoxacino',
  // sulfas e diaminopirimidinas
  'Sulfacetamida', 'Sulfadiazina', 'Sulfadoxina', 'Sulfaguanidina', 'Sulfamerazina',
  'Sulfanilamida', 'Sulfametizol', 'Sulfametoxazol', 'Sulfametoxipiridazina',
  'Sulfametoxipirimidina', 'Sulfatiazol', 'Ftalilsulfatiazol', 'Trimetoprima', 'Brodimoprima',
  // tetraciclinas e glicilciclinas
  'Tetraciclina', 'Oxitetraciclina', 'Doxiciclina', 'Minociclina', 'Limeciclina', 'Tigeciclina',
  // glicopeptídeos, oxazolidinonas e outros
  'Vancomicina', 'Teicoplanina', 'Daptomicina', 'Linezolida', 'Tedizolida', 'Polimixina B',
  'Bacitracina', 'Gramicidina', 'Tirotricina', 'Mupirocina', 'Retapamulina', 'Pristinamicina',
  'Fosfomicina', 'Cloranfenicol', 'Tianfenicol', 'Metronidazol', 'Nitrofurantoína',
  'Nitrofural', 'Nitroxolina', 'Mandelamina', 'Clorfenesina', 'Mitomicina', 'Dactinomicina',
  // tuberculose e hanseníase
  'Rifampicina', 'Rifamicina', 'Rifabutina', 'Rifapentina', 'Isoniazida', 'Pirazinamida',
  'Etambutol', 'Etionamida', 'Protionamida', 'Capreomicina', 'Delamanid', 'Clofazimina',
  'Dapsona', 'Difenilsulfona',
];

const CASOS: Caso[] = [
  ...IN_360.map((nome): Caso => ({ nome, modelo: 'RETENCAO', classe: 'ANTIMICROBIANO' })),

  // Variações de nome que aparecem no catálogo e na digitação
  { nome: 'Ciprofloxacina 500 mg', modelo: 'RETENCAO', classe: 'ANTIMICROBIANO' },
  { nome: 'Amoxicilina + Clavulanato de potássio 875/125 mg', modelo: 'RETENCAO', classe: 'ANTIMICROBIANO' },
  { nome: 'Penicilina G benzatina 1.200.000 UI', modelo: 'RETENCAO', classe: 'ANTIMICROBIANO' },
  { nome: 'Sulfametoxazol + Trimetoprima 800/160 mg', modelo: 'RETENCAO', classe: 'ANTIMICROBIANO' },
  { nome: 'Mupirocina 2% pomada', uso: 'Uso tópico', modelo: 'RETENCAO', classe: 'ANTIMICROBIANO' },

  // Fora da IN 360/2025: receita simples confirmada pela tabela
  ...[
    'Secnidazol', 'Tinidazol', 'Nitazoxanida', 'Fluconazol', 'Nistatina', 'Terbinafina',
    'Rifaximina', 'Cefixima', 'Ivermectina', 'Albendazol', 'Aciclovir',
  ].map((nome): Caso => ({ nome, modelo: 'SIMPLES', classe: 'COMUM' })),
  { nome: 'Cetoconazol 2% creme', uso: 'Uso tópico', modelo: 'SIMPLES', classe: 'COMUM' },

  // GLP-1 (RDC 973/2025)
  { nome: 'Semaglutida', modelo: 'RETENCAO', classe: 'RETENCAO' },
  { nome: 'Tirzepatida', modelo: 'RETENCAO', classe: 'RETENCAO' },
  { nome: 'Ozempic', modelo: 'RETENCAO', classe: 'RETENCAO' },

  // Portaria 344
  { nome: 'Morfina 10 mg', modelo: 'NOTIF_A', classe: 'A1' },
  { nome: 'Oxicodona', modelo: 'NOTIF_A', classe: 'A1' },
  { nome: 'Codeína 30 mg + Paracetamol 500 mg', modelo: 'RCE', classe: 'A2_RCE' },
  { nome: 'Tramadol 50 mg', modelo: 'RCE', classe: 'A2_RCE' },
  { nome: 'Tramadol 200 mg', modelo: 'NOTIF_A', classe: 'A2' },
  { nome: 'Metilfenidato', modelo: 'NOTIF_A', classe: 'A3' },
  { nome: 'Lisdexanfetamina', modelo: 'NOTIF_A', classe: 'A3' },
  { nome: 'Clonazepam', modelo: 'NOTIF_B', classe: 'B1' },
  { nome: 'Zolpidem', modelo: 'NOTIF_B', classe: 'B1' },
  { nome: 'Sibutramina', modelo: 'NOTIF_B2', classe: 'B2' },
  { nome: 'Sertralina', modelo: 'RCE', classe: 'C1' },
  { nome: 'Quetiapina', modelo: 'RCE', classe: 'C1' },
  { nome: 'Pregabalina', modelo: 'RCE', classe: 'C1' },
  { nome: 'Isotretinoína', modelo: 'NOTIF_C2', classe: 'C2' },
  { nome: 'Tretinoína 10 mg cápsula', uso: 'Uso oral', modelo: 'NOTIF_C2', classe: 'C2' },
  { nome: 'Tretinoína 0,05% creme', uso: 'Uso tópico', modelo: 'SIMPLES', classe: 'COMUM' },
  { nome: 'Talidomida', modelo: 'NOTIF_C3', classe: 'C3' },
  { nome: 'Testosterona (cipionato)', modelo: 'RCE', classe: 'C5' },
  { nome: 'Oxandrolona', modelo: 'RCE', classe: 'C5' },
  // Adendos: na lista, mas vendidos sem retenção
  { nome: 'Loperamida', modelo: 'SIMPLES', classe: 'COMUM' },
  { nome: 'Carisoprodol', modelo: 'SIMPLES', classe: 'COMUM' },
];

for (const c of CASOS) {
  const i = classificar(c.nome, c.uso);
  const onde = `"${c.nome}"${c.uso ? ` (${c.uso})` : ''}`;
  if (i.modelo !== c.modelo) erros.push(`${onde}: modelo ${i.modelo}, esperado ${c.modelo}`);
  else if (c.classe && i.classe !== c.classe) erros.push(`${onde}: classe ${i.classe}, esperada ${c.classe}`);
  else if (i.naoConfirmada) erros.push(`${onde}: saiu como não confirmado (fora das tabelas)`);
}
const ate6 = classificar('Pregabalina 75 mg');
if (!ate6.ate6Meses) erros.push('"Pregabalina 75 mg": anticonvulsivante sem o limite de 6 meses');

// ─── Divisão em documentos ────────────────────────────────────────────────

let seq = 0;
const med = (principioAtivo: string, extra: Partial<MedicamentoReceita> = {}): MedicamentoReceita => ({
  id: `m${++seq}`,
  nomeDigitado: '',
  principioAtivo,
  formaFarmaceutica: 'comprimido',
  posologia: 'Tomar 1 comprimido de 12 em 12 horas',
  quantidade: '14 comprimidos',
  duracao: '7 dias',
  uso: 'Uso oral',
  indicacao: '',
  observacoes: '',
  carregando: false,
  erro: '',
  tipoRecomendado: '',
  motivoEspecial: '',
  ...extra,
});

interface CasoDocs {
  nome: string;
  itens: MedicamentoReceita[];
  /** Modelo e quantidade de itens de cada documento, na ordem. */
  esperado: Array<[ModeloReceita, number]>;
  folhas?: boolean;
  /** Documento a documento: é a receita só de GLP-1 (validade 90 dias)? */
  soGlp1?: boolean[];
}

const CASOS_DOCS: CasoDocs[] = [
  {
    nome: 'antimicrobiano + controlado',
    itens: [med('Amoxicilina 500 mg'), med('Sertralina 50 mg')],
    esperado: [['RETENCAO', 1], ['RCE', 1]],
  },
  {
    nome: 'antimicrobiano + GLP-1 (validades diferentes)',
    itens: [med('Azitromicina 500 mg'), med('Semaglutida 1 mg')],
    esperado: [['RETENCAO', 1], ['RETENCAO', 1]],
    soGlp1: [false, true],
  },
  {
    nome: 'simples + antimicrobiano + B1',
    itens: [med('Dipirona 500 mg'), med('Ciprofloxacino 500 mg'), med('Clonazepam 2 mg')],
    esperado: [['SIMPLES', 1], ['RETENCAO', 1], ['NOTIF_B', 1]],
  },
  {
    nome: '7 itens simples',
    itens: ['Losartana', 'Anlodipino', 'Metformina', 'Sinvastatina', 'Omeprazol', 'Dipirona', 'Fluconazol'].map((n) =>
      med(n)
    ),
    esperado: [['SIMPLES', 6], ['SIMPLES', 1]],
    folhas: true,
  },
  {
    nome: 'duas notificações B (1 substância por talonário)',
    itens: [med('Clonazepam 2 mg'), med('Zolpidem 10 mg')],
    esperado: [['NOTIF_B', 1], ['NOTIF_B', 1]],
  },
];

for (const c of CASOS_DOCS) {
  const docs = agruparEmDocumentos(c.itens);
  const obtido = docs.map((d) => `${d.modelo}×${d.medicamentos.length}`).join(', ');
  const esperado = c.esperado.map(([m, n]) => `${m}×${n}`).join(', ');
  if (obtido !== esperado) {
    erros.push(`documentos (${c.nome}): ${obtido}, esperado ${esperado}`);
    continue;
  }
  if (c.folhas && docs.some((d, i) => d.folha?.atual !== i + 1 || d.folha?.total !== docs.length)) {
    erros.push(`documentos (${c.nome}): numeração "folha x de y" errada`);
  }
  if (c.soGlp1 && docs.some((d, i) => !!d.soGlp1 !== c.soGlp1![i])) {
    erros.push(`documentos (${c.nome}): receita de GLP-1 misturada com antimicrobiano`);
  }
}

console.log(`Receitas: ${CASOS.length} substâncias (${IN_360.length} da IN 360/2025) · ${CASOS_DOCS.length} casos de documentos`);
if (erros.length) {
  console.error(`\nErros (${erros.length}):\n- ${erros.join('\n- ')}`);
  process.exit(1);
}
console.log('\nOK — nenhum erro.');

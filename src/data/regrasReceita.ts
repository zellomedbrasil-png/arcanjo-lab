// src/data/regrasReceita.ts
// FONTE ÚNICA das regras de receituário: qual papel cada substância exige.
//
// Base normativa (conferida em out/2026):
//   - Portaria SVS/MS 344/98 + Port. 06/99 + RDC 1.000/2025 (controlados, notificações, SNCR)
//   - Anexo I da Portaria 344 na atualização nº 101 (RDC 1.036, de 09/07/2026) — listas conferidas
//     item a item contra o catálogo em 17/10/2026
//   - RDC 471/2021 alterada pela RDC 973/2025 + IN 360/2025 (antimicrobianos e GLP-1 com retenção)
//   - RDC 873/2024 (validade nacional), Lei 5.991/73 art. 35 (requisitos gerais)
//
// O que decide o papel é a SUBSTÂNCIA (lista da Portaria 344 / RDC 471), nunca a IA.
// A sugestão da IA só é usada quando o nome não bate com nenhuma tabela abaixo.

export type ClasseControle =
  | 'COMUM'
  | 'ANTIMICROBIANO' // RDC 471/2021 — 2 vias, farmácia retém a 2ª
  | 'RETENCAO' //       RDC 973/2025 — agonistas GLP-1, 2 vias, validade 90 dias
  | 'C1' | 'C5' //      Receita de Controle Especial (RCE), 2 vias
  | 'A2_RCE' //         adendo da lista A2: codeína/tramadol ≤100 mg por unidade → RCE
  | 'A1' | 'A2' | 'A3' // Notificação de Receita A (amarela)
  | 'B1' //             Notificação de Receita B (azul)
  | 'B2' //             Notificação de Receita B2 (azul, anorexígenos)
  | 'C2' //             Notificação de Receita Especial de retinoides (branca)
  | 'C3'; //            Notificação de Receita Especial de talidomida

export type ModeloReceita =
  | 'SIMPLES'
  | 'RETENCAO'
  | 'RCE'
  | 'NOTIF_A'
  | 'NOTIF_B'
  | 'NOTIF_B2'
  | 'NOTIF_C2'
  | 'NOTIF_C3';

export interface InfoClasse {
  classe: ClasseControle;
  modelo: ModeloReceita;
  /** Nome da lista para exibir ("C1", "B1", "Antimicrobiano"...). */
  lista: string;
  /** Selo curto para a UI. */
  rotulo: string;
  /** Explicação legal exibida no card. */
  motivo: string;
  /** Anticonvulsivante/antiparkinsoniano: limite de 6 meses na RCE (art. 59, parágrafo único). */
  ate6Meses?: boolean;
  /** true quando a classe veio da IA ou de inferência, não da tabela. */
  naoConfirmada?: boolean;
}

export interface RegraModelo {
  titulo: string;
  vias: 1 | 2;
  validadeDias: number;
  /** Rótulos impressos na 1ª e na 2ª via. */
  rotuloVias?: [string, string];
  /** Máximo de substâncias por documento. */
  maxSubstancias?: number;
  /** Imprime como receita? Notificações viram guia de transcrição. */
  imprimeReceita: boolean;
  /** Nome do talonário a usar, para as notificações. */
  talonario?: string;
  /** Limite de tratamento por documento, em dias. */
  limiteDias?: number;
}

export const REGRAS_MODELO: Record<ModeloReceita, RegraModelo> = {
  SIMPLES: { titulo: 'Receita Médica', vias: 1, validadeDias: 0, imprimeReceita: true },
  RETENCAO: {
    titulo: 'Receita — Antimicrobiano',
    vias: 2,
    validadeDias: 10,
    rotuloVias: ['1ª via — Paciente', '2ª via — Retenção da farmácia'],
    imprimeReceita: true,
  },
  RCE: {
    titulo: 'Receita de Controle Especial',
    vias: 2,
    validadeDias: 30,
    rotuloVias: ['1ª via — Retenção da farmácia', '2ª via — Orientação ao paciente'],
    maxSubstancias: 3,
    imprimeReceita: true,
    limiteDias: 60,
  },
  NOTIF_A: {
    titulo: 'Notificação de Receita A',
    vias: 1,
    validadeDias: 30,
    maxSubstancias: 1,
    imprimeReceita: false,
    talonario: 'Notificação de Receita A (amarela)',
    limiteDias: 30,
  },
  NOTIF_B: {
    titulo: 'Notificação de Receita B',
    vias: 1,
    validadeDias: 30,
    maxSubstancias: 1,
    imprimeReceita: false,
    talonario: 'Notificação de Receita B (azul)',
    limiteDias: 60,
  },
  NOTIF_B2: {
    titulo: 'Notificação de Receita B2',
    vias: 1,
    validadeDias: 30,
    maxSubstancias: 1,
    imprimeReceita: false,
    talonario: 'Notificação de Receita B2 (azul)',
    limiteDias: 30,
  },
  NOTIF_C2: {
    titulo: 'Notificação de Receita Especial — Retinoides',
    vias: 1,
    validadeDias: 30,
    maxSubstancias: 1,
    imprimeReceita: false,
    talonario: 'Notificação de Receita Especial de Retinoides (branca)',
    limiteDias: 30,
  },
  NOTIF_C3: {
    titulo: 'Notificação de Receita Especial — Talidomida',
    vias: 1,
    validadeDias: 20,
    maxSubstancias: 1,
    imprimeReceita: false,
    talonario: 'Notificação de Receita Especial de Talidomida',
    limiteDias: 30,
  },
};

// ─── Tabelas de substâncias (termos sem acento, minúsculos) ───────────────

const B1 = [
  'alprazolam', 'bromazepam', 'clobazam', 'clonazepam', 'clordiazepoxido', 'cloxazolam',
  'diazepam', 'estazolam', 'flunitrazepam', 'flurazepam', 'lorazepam', 'midazolam',
  'nitrazepam', 'temazepam', 'triazolam', 'rivotril', 'lexotan',
  'zolpidem', 'zopiclona', 'eszopiclona', // zolpidem: toda concentração desde 01/08/2024
  'fenobarbital', 'gardenal', 'barbital',
  'modafinila', 'armodafinila', // saíram da A3 para a B1 em 2022
  'cetamina', 'escetamina', 'lemborexanto',
];

/**
 * Estão nas listas, mas o adendo libera a venda com prescrição SEM retenção:
 * loperamida (C1, adendo 2) e carisoprodol (B1, adendo 16). Saem em receita simples.
 */
const SEM_RETENCAO = ['loperamida', 'carisoprodol'];

const A1 = [
  'morfina', 'metadona', 'fentanil', 'oxicodona', 'tapentadol', 'buprenorfina',
  'hidromorfona', 'petidina', 'meperidina', 'remifentanil', 'sufentanil', 'alfentanil',
];

/** Lista A2: entra como RCE quando ≤100 mg por unidade posológica (adendo). */
const A2 = ['codeina', 'tramadol', 'nalbufina'];

const A3 = [
  'metilfenidato', 'ritalina', 'concerta', 'lisdexanfetamina', 'venvanse',
  'dexanfetamina', 'anfetamina',
];

const B2 = ['sibutramina', 'anfepramona', 'femproporex', 'mazindol'];

const C3 = ['talidomida'];

const C5 = [
  'testosterona', 'nandrolona', 'oxandrolona', 'estanozolol', 'metandrostenolona',
  'durateston', 'deposteron', 'trembolona', 'boldenona',
];

const ANTIPARKINSONIANOS = [
  'biperideno', 'triexifenidil', 'selegilina', 'rasagilina', 'pramipexol', 'ropinirol',
  'amantadina',
];

const ANTICONVULSIVANTES = [
  'gabapentina', 'pregabalina', 'carbamazepina', 'oxcarbazepina', 'valproato', 'valproico',
  'divalproato', 'topiramato', 'lamotrigina', 'fenitoina', 'primidona', 'vigabatrina',
  'levetiracetam', 'lacosamida', 'etossuximida', 'cenobamato', 'estiripentol',
];

const C1_OUTROS = [
  // Antidepressivos
  'sertralina', 'fluoxetina', 'escitalopram', 'citalopram', 'paroxetina', 'fluvoxamina',
  'duloxetina', 'desvenlafaxina', 'venlafaxina', 'amitriptilina', 'nortriptilina',
  'imipramina', 'clomipramina', 'mirtazapina', 'bupropiona', 'trazodona', 'agomelatina',
  'vortioxetina', 'tranilcipromina', 'moclobemida',
  // Antipsicóticos
  'risperidona', 'paliperidona', 'quetiapina', 'olanzapina', 'aripiprazol', 'haloperidol',
  'clorpromazina', 'levomepromazina', 'sulpirida', 'amissulprida', 'clozapina',
  'ziprasidona', 'lurasidona', 'pimozida', 'zuclopentixol', 'periciazina', 'tioridazina',
  'brexpiprazol',
  // Antidemência (anticolinesterásicos e memantina)
  'donepezila', 'galantamina', 'rivastigmina', 'memantina',
  // Coxibes (RDC 79/2008)
  'celecoxibe', 'etoricoxibe', 'parecoxibe', 'lumiracoxibe',
  // Outros C1
  'litio', 'atomoxetina', 'naltrexona', 'tetrabenazina', 'canabidiol', 'cannabis sativa',
  'buspirona', 'tianeptina', 'dissulfiram',
  'misoprostol', // adendo 4: só em hospital cadastrado
];

/** Agonistas GLP-1 — retenção de receita (RDC 973/2025, IN 360/2025). */
const GLP1 = [
  'semaglutida', 'liraglutida', 'dulaglutida', 'tirzepatida', 'lixisenatida', 'exenatida',
  'ozempic', 'wegovy', 'rybelsus', 'victoza', 'saxenda', 'mounjaro', 'trulicity',
];

/**
 * Antimicrobianos de uso sob prescrição (RDC 471/2021, lista da IN 360/2025).
 * Formas tópicas, oftálmicas e otológicas também ficam aqui: não há exceção
 * expressa na norma, e 2 vias a mais nunca causam recusa.
 */
const ANTIMICROBIANOS = [
  'amoxicilina', 'clavulanato', 'ampicilina', 'penicilina', 'benzatina', 'oxacilina',
  'piperacilina', 'cefalexina', 'cefadroxila', 'cefaclor', 'cefuroxima', 'ceftriaxona',
  'cefepima', 'cefixima', 'cefpodoxima', 'cefalotina', 'cefazolina', 'ceftazidima',
  'azitromicina', 'claritromicina', 'eritromicina', 'espiramicina',
  'ciprofloxacino', 'levofloxacino', 'norfloxacino', 'moxifloxacino', 'ofloxacino',
  'gatifloxacino', 'sulfametoxazol', 'trimetoprima', 'sulfadiazina',
  'doxiciclina', 'tetraciclina', 'minociclina', 'tigeciclina', 'nitrofurantoina',
  'clindamicina', 'metronidazol', 'secnidazol', 'tinidazol', 'vancomicina', 'linezolida',
  'gentamicina', 'amicacina', 'tobramicina', 'neomicina', 'rifampicina', 'rifamicina',
  'isoniazida', 'pirazinamida', 'etambutol', 'dapsona', 'fosfomicina', 'cloranfenicol', 'rifaximina',
  'mupirocina', 'acido fusidico', 'bacitracina',
  'fluconazol', 'itraconazol', 'cetoconazol', 'nistatina', 'griseofulvina', 'terbinafina',
  'anfotericina', 'voriconazol',
];

/** Substâncias que a tabela confirma como de receita simples. */
const COMUNS = [
  'losartana', 'enalapril', 'captopril', 'anlodipino', 'amlodipino', 'atenolol', 'propranolol',
  'carvedilol', 'valsartana', 'telmisartana', 'hidroclorotiazida', 'indapamida',
  'espironolactona', 'furosemida', 'ramipril', 'metildopa', 'clonidina', 'nebivolol',
  'nifedipino', 'metformina', 'gliclazida', 'glimepirida', 'glibenclamida', 'dapagliflozina',
  'empagliflozina', 'sitagliptina', 'vildagliptina', 'linagliptina', 'insulina',
  'pioglitazona', 'sinvastatina', 'atorvastatina', 'rosuvastatina', 'ezetimiba',
  'ciprofibrato', 'fenofibrato', 'omeprazol', 'pantoprazol', 'esomeprazol', 'lansoprazol',
  'rabeprazol', 'domperidona', 'metoclopramida', 'bromoprida', 'ondansetrona', 'famotidina',
  'simeticona', 'lactulose', 'macrogol', 'paracetamol', 'dipirona', 'ibuprofeno',
  'nimesulida', 'cetoprofeno', 'diclofenaco', 'meloxicam', 'piroxicam', 'celecoxibe',
  'naproxeno', 'loratadina', 'desloratadina', 'fexofenadina', 'cetirizina',
  'dexclorfeniramina', 'prednisona', 'prednisolona', 'dexametasona', 'budesonida',
  'fluticasona', 'montelucaste', 'levotiroxina', 'tiamazol', 'colecalciferol', 'vitamina',
  'sulfato ferroso', 'acido folico', 'cobalamina', 'levodopa', 'albendazol', 'ivermectina',
  'aciclovir', 'valaciclovir', 'oseltamivir', 'colchicina', 'tansulosina', 'betaistina',
  'alendronato',
];

// ─── Classificação ────────────────────────────────────────────────────────

export function normalizar(texto: string): string {
  return (texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

const contem = (texto: string, termos: string[]) => termos.some((t) => texto.includes(t));

/**
 * Dose em mg logo depois do termo (adendo da lista A2). Só olha o trecho do
 * próprio termo: em "codeína 30mg + paracetamol 500mg" a dose é 30.
 */
function doseMgDoTermo(texto: string, termos: string[]): number | null {
  for (const termo of termos) {
    const i = texto.indexOf(termo);
    if (i < 0) continue;
    const m = texto.slice(i + termo.length).match(/^[^+\d]{0,20}?(\d+(?:[.,]\d+)?)\s*mg/);
    if (m) return parseFloat(m[1].replace(',', '.'));
  }
  return null;
}

const ehTopico = (uso: string) => /topic|dermat|creme|pomada/.test(normalizar(uso));

const info = (classe: ClasseControle, extra: Partial<InfoClasse> = {}): InfoClasse => {
  const base: Record<ClasseControle, Omit<InfoClasse, 'classe'>> = {
    COMUM: { modelo: 'SIMPLES', lista: '', rotulo: 'Receita simples', motivo: '' },
    ANTIMICROBIANO: {
      modelo: 'RETENCAO',
      lista: 'Antimicrobiano',
      rotulo: 'Antimicrobiano · 2 vias',
      motivo: 'RDC 471/2021 — receita em 2 vias, a farmácia retém a 2ª. Exige idade e sexo do paciente. Válida por 10 dias. Não pode ir junto com controlado.',
    },
    RETENCAO: {
      modelo: 'RETENCAO',
      lista: 'GLP-1',
      rotulo: 'GLP-1 · retenção 2 vias',
      motivo: 'RDC 973/2025 — agonista GLP-1 exige receita em 2 vias com retenção. Válida por 90 dias.',
    },
    C1: {
      modelo: 'RCE',
      lista: 'C1',
      rotulo: 'C1 · Controle especial',
      motivo: 'Portaria 344/98, lista C1 — Receita de Controle Especial em 2 vias (1ª retida na farmácia). Até 3 substâncias por receita, até 60 dias de tratamento, válida por 30 dias.',
    },
    C5: {
      modelo: 'RCE',
      lista: 'C5',
      rotulo: 'C5 · Controle especial',
      motivo: 'Portaria 344/98, lista C5 (anabolizantes) — Receita de Controle Especial em 2 vias.',
    },
    A2_RCE: {
      modelo: 'RCE',
      lista: 'A2 (adendo)',
      rotulo: 'A2 ≤100 mg · Controle especial',
      motivo: 'Portaria 344/98, adendo da lista A2 — codeína/tramadol até 100 mg por unidade saem em Receita de Controle Especial, 2 vias.',
    },
    A1: {
      modelo: 'NOTIF_A',
      lista: 'A1',
      rotulo: 'A1 · Notificação amarela',
      motivo: 'Portaria 344/98, lista A1 (entorpecente) — exige Notificação de Receita A (amarela), talonário numerado. Não pode ser impresso como receita.',
    },
    A2: {
      modelo: 'NOTIF_A',
      lista: 'A2',
      rotulo: 'A2 · Notificação amarela',
      motivo: 'Portaria 344/98, lista A2 acima de 100 mg por unidade — exige Notificação de Receita A (amarela).',
    },
    A3: {
      modelo: 'NOTIF_A',
      lista: 'A3',
      rotulo: 'A3 · Notificação amarela',
      motivo: 'Portaria 344/98, lista A3 (psicotrópico estimulante) — exige Notificação de Receita A (amarela), talonário numerado.',
    },
    B1: {
      modelo: 'NOTIF_B',
      lista: 'B1',
      rotulo: 'B1 · Notificação azul',
      motivo: 'Portaria 344/98, lista B1 — exige Notificação de Receita B (azul), talonário numerado. Receita branca de 2 vias é recusada.',
    },
    B2: {
      modelo: 'NOTIF_B2',
      lista: 'B2',
      rotulo: 'B2 · Notificação azul',
      motivo: 'Portaria 344/98, lista B2 (anorexígeno) — exige Notificação de Receita B2, talonário numerado.',
    },
    C2: {
      modelo: 'NOTIF_C2',
      lista: 'C2',
      rotulo: 'C2 · Notificação de retinoide',
      motivo: 'Portaria 344/98, lista C2 (retinoide sistêmico) — exige Notificação de Receita Especial de retinoides.',
    },
    C3: {
      modelo: 'NOTIF_C3',
      lista: 'C3',
      rotulo: 'C3 · Notificação de talidomida',
      motivo: 'Portaria 344/98, lista C3 — exige Notificação de Receita Especial de talidomida.',
    },
  };
  return { classe, ...base[classe], ...extra };
};

/** Lê uma lista citada em texto da IA ("Lista B1 da Portaria 344/98"). */
function classeDoTexto(texto: string): ClasseControle | null {
  const t = normalizar(texto);
  if (t.includes('antimicrob') || t.includes('rdc 471')) return 'ANTIMICROBIANO';
  const m = t.match(/lista\s*["']?([abc]\d)/);
  if (!m) return null;
  const lista = m[1].toUpperCase();
  const mapa: Record<string, ClasseControle> = {
    A1: 'A1', A2: 'A2_RCE', A3: 'A3', B1: 'B1', B2: 'B2', C1: 'C1', C2: 'C2', C3: 'C3', C4: 'C1', C5: 'C5',
  };
  return mapa[lista] ?? null;
}

/**
 * Classifica uma substância pelo nome (princípio ativo ou nome digitado).
 * @param uso via de uso — retinoide tópico não é C2.
 * @param sugestaoIA motivo/tipo vindo da IA, usado só quando a tabela não reconhece o nome.
 */
export function classificar(nome: string, uso = '', sugestaoIA?: { tipo?: string; motivo?: string }): InfoClasse {
  const t = normalizar(nome);

  if (contem(t, A1)) return info('A1');
  if (contem(t, A3)) return info('A3');
  if (contem(t, B2)) return info('B2');
  if (contem(t, SEM_RETENCAO)) return info('COMUM');
  if (contem(t, B1)) return info('B1');
  if (contem(t, C3)) return info('C3');
  if (contem(t, ['isotretinoina', 'acitretina'])) return info('C2');
  // C2, adendo 2: retinoide tópico vende com prescrição sem retenção.
  if (contem(t, ['tretinoina', 'adapaleno'])) return ehTopico(uso) ? info('COMUM') : info('C2');
  if (contem(t, A2)) {
    const dose = doseMgDoTermo(t, A2);
    return dose !== null && dose > 100 ? info('A2') : info('A2_RCE');
  }
  if (contem(t, C5)) return info('C5');
  if (contem(t, ANTICONVULSIVANTES) || contem(t, ANTIPARKINSONIANOS)) return info('C1', { ate6Meses: true });
  if (contem(t, C1_OUTROS)) return info('C1');
  if (contem(t, GLP1)) return info('RETENCAO');
  if (contem(t, ANTIMICROBIANOS)) return info('ANTIMICROBIANO');
  if (contem(t, COMUNS)) return info('COMUM');

  // Nome fora das tabelas: aceita a IA, marcando como não confirmado.
  if (sugestaoIA?.tipo === 'ESPECIAL') {
    const classe = classeDoTexto(sugestaoIA.motivo || '') ?? 'C1';
    return info(classe, { naoConfirmada: true });
  }
  return info('COMUM', { naoConfirmada: !!t.trim() && sugestaoIA?.tipo !== 'SIMPLES' });
}

/** Selo curto para listas e cards ("B1 · AZUL", "C1 · 2 VIAS"). */
export function seloCurto(i: InfoClasse): string {
  switch (i.modelo) {
    case 'SIMPLES': return 'SIMPLES';
    case 'RETENCAO': return i.classe === 'RETENCAO' ? 'GLP-1 · 2 VIAS' : 'ANTIMICROB. · 2 VIAS';
    case 'RCE': return `${i.lista.split(' ')[0]} · 2 VIAS`;
    case 'NOTIF_A': return `${i.lista} · AMARELA`;
    case 'NOTIF_B':
    case 'NOTIF_B2': return `${i.lista} · AZUL`;
    default: return `${i.lista} · NOTIFICAÇÃO`;
  }
}

/** Atalho: a substância sai em papel diferente da receita simples? */
export function exigePapelEspecial(nome: string, uso = ''): boolean {
  return classificar(nome, uso).modelo !== 'SIMPLES';
}

/** Detecta substâncias controladas/antimicrobianas linha a linha num texto livre. */
export function classificarTextoLivre(texto: string): Array<{ linha: string; info: InfoClasse }> {
  return texto
    .split(/\n+/)
    .map((linha) => linha.trim())
    .filter(Boolean)
    .map((linha) => ({ linha, info: classificar(linha) }))
    .filter(({ info: i }) => i.modelo !== 'SIMPLES' && !i.naoConfirmada);
}

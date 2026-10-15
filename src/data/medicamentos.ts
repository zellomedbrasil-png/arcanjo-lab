// src/data/medicamentos.ts
// Catálogo ÚNICO de medicamentos do receituário: tipos, rótulos e montagem.
// As entradas ficam em src/data/catalogo/*.ts, um arquivo por grupo.
//
// Regras:
//   1. O papel de cada medicamento (simples, antimicrobiano, controle especial,
//      notificação) vem de src/data/regrasReceita.ts, pela substância. Ao exportar,
//      `tipoRecomendado`, `motivoEspecial` e `regra` são recalculados por classificar().
//   2. Todo medicamento tem `marcaReferencia` — o nome comercial mais reconhecido
//      no Brasil. Serve para busca ("Cozaar" acha losartana) e para orientar o
//      paciente na farmácia. NÃO vai impresso (imprime `principioAtivo`, Lei 9.787/99).
//   3. `gratuito` é atribuição MANUAL e vale só para a dose em que aparece:
//      FP conferido no "Elenco de Medicamentos e Insumos" do Programa Farmácia
//      Popular (Ministério da Saúde, atualizado em 31/08/2026); CBAF/CEAF pela
//      RENAME 2024. Dose sem selo = não confirmada como gratuita.
//   4. `id` é slug estável, referenciado pelos protocolos e pelos favoritos.
//      Conferência: `npm run conferir:catalogo`.
//   5. Doses alternativas entram em `apresentacoes`, nunca como entrada nova.

/** Mês da última revisão geral do catálogo (doses, posologias e selos). */
export const CATALOGO_ATUALIZADO_EM = 'outubro/2026';

import type { TipoRecomendado } from '../store/useReceitaStore';
import { classificar, type InfoClasse } from './regrasReceita';
import { CARDIOVASCULAR } from './catalogo/cardiovascular';
import { ENDOCRINO } from './catalogo/endocrino';
import { GASTRO } from './catalogo/gastro';
import { NEURO_PSIQ } from './catalogo/neuroPsiq';
import { DOR_INFLAMACAO } from './catalogo/dor';
import { ANTIMICROBIANOS } from './catalogo/antimicrobianos';
import { RESPIRATORIO } from './catalogo/respiratorio';
import { HEMATO_SUPLEMENTOS } from './catalogo/hematoSuplementos';
import { UROLOGICO } from './catalogo/urologico';
import { TOPICOS_OFTALMO } from './catalogo/topicosOftalmo';
import { INSUMOS } from './catalogo/insumos';

// ─── Canal de acesso gratuito ───────────────────────────────────────────────

/** Canal de acesso gratuito na rede pública. */
export type CanalGratuito = 'FP' | 'CBAF' | 'CEAF';

export interface InfoGratuito {
  canal: CanalGratuito;
  /** Observação de acesso/clínica exibida no card (ex.: exigência de LME). */
  nota?: string;
}

/** Rótulo e descrição de cada canal — fonte única para selos e legenda. */
export const CANAL_INFO: Record<CanalGratuito, { rotulo: string; descricao: string }> = {
  FP: {
    rotulo: 'FARM. POPULAR',
    descricao: 'Gratuito em drogarias credenciadas. Aceita receita particular/telemedicina. Receita vale 180 dias.',
  },
  CBAF: {
    rotulo: 'UBS',
    descricao: 'Retirada na farmácia da Unidade Básica de Saúde. Disponibilidade varia por município.',
  },
  CEAF: {
    rotulo: 'ALTO CUSTO',
    descricao: 'Componente Especializado — exige LME/PCDT, dispensação em farmácia estadual (APAC).',
  },
};

// ─── Grupos terapêuticos ────────────────────────────────────────────────────

export type GrupoMedicamento =
  | 'CARDIOVASCULAR'
  | 'ENDOCRINO'
  | 'GASTRO'
  | 'NEURO_PSIQ'
  | 'DOR_INFLAMACAO'
  | 'ANTIMICROBIANO'
  | 'RESPIRATORIO_ALERGIA'
  | 'HEMATO_SUPLEMENTO'
  | 'UROLOGICO'
  | 'TOPICO_OFTALMO'
  | 'INSUMO';

/** Rótulos curtos dos grupos — usados nos filtros da UI. */
export const GRUPO_INFO: Record<GrupoMedicamento, string> = {
  CARDIOVASCULAR: 'Cardiovascular',
  ENDOCRINO: 'Endócrino / Metabólico',
  GASTRO: 'Gastroenterologia',
  NEURO_PSIQ: 'Neuro / Psiquiatria',
  DOR_INFLAMACAO: 'Dor e Inflamação',
  ANTIMICROBIANO: 'Antimicrobianos',
  RESPIRATORIO_ALERGIA: 'Respiratório / Alergia',
  HEMATO_SUPLEMENTO: 'Hemato / Suplementos',
  UROLOGICO: 'Urológico',
  TOPICO_OFTALMO: 'Tópicos / Oftalmo',
  INSUMO: 'Insumos',
};

// ─── Definição ──────────────────────────────────────────────────────────────

export interface MedicamentoDef {
  /** Slug estável. Referenciado por src/data/protocolos.ts. */
  id: string;
  /** Nome curto exibido na UI e no campo digitado da receita. */
  nome: string;
  /** Texto que vai IMPRESSO na receita (princípio ativo + concentração). */
  principioAtivo: string;
  /** Nome comercial de referência no Brasil. Só para busca/orientação — não imprime. */
  marcaReferencia: string;
  formaFarmaceutica: string;
  uso: string;
  grupo: GrupoMedicamento;
  /** Fonte única da verdade sobre receita simples x controle especial (2 vias). */
  tipoRecomendado: TipoRecomendado;
  /** Posologia usada quando o medicamento é prescrito avulso (fora de protocolo). */
  posologiaPadrao: string;
  quantidadePadrao: string;
  duracaoPadrao: string;
  /** Indicação curta — alimenta a busca e o campo `indicacao` da receita. */
  indicacao: string;
  /** Racional clínico exibido no card. */
  explicacao: string;
  observacoes?: string;
  /** Preenchido quando tipoRecomendado === 'ESPECIAL' — explica a exigência legal. */
  motivoEspecial?: string;
  /** Classe regulatória calculada por classificar() (lista, papel, selo). */
  regra?: InfoClasse;
  /**
   * Outras doses/apresentações do mesmo medicamento. Os campos acima são a
   * apresentação PADRÃO; estas são as alternativas (losartana 25 e 100 além da 50).
   * Campo omitido herda o valor da apresentação padrão.
   */
  apresentacoes?: Apresentacao[];
  /** Presente quando o medicamento é gratuito na rede pública. */
  gratuito?: InfoGratuito;
}

export interface Apresentacao {
  /** Rótulo curto do chip: "25 mg", "1 g", "gotas 500 mg/ml". */
  rotulo: string;
  /** Texto IMPRESSO para esta dose. */
  principioAtivo: string;
  formaFarmaceutica?: string;
  posologiaPadrao?: string;
  quantidadePadrao?: string;
  duracaoPadrao?: string;
  observacoes?: string;
  /** Gratuidade DESTA dose (não herda da padrão: losartana 50 é FP, a 25 não). */
  gratuito?: InfoGratuito;
}

const CATALOGO: MedicamentoDef[] = [
  ...CARDIOVASCULAR,
  ...ENDOCRINO,
  ...GASTRO,
  ...NEURO_PSIQ,
  ...DOR_INFLAMACAO,
  ...ANTIMICROBIANOS,
  ...RESPIRATORIO,
  ...HEMATO_SUPLEMENTOS,
  ...UROLOGICO,
  ...TOPICOS_OFTALMO,
  ...INSUMOS,
];

/**
 * Catálogo exportado: tipo de receita e motivo recalculados pela substância,
 * para o selo da UI nunca contradizer o papel que a impressão vai gerar.
 */
export const MEDICAMENTOS: MedicamentoDef[] = CATALOGO.map((m) => {
  const regra = classificar(`${m.principioAtivo} ${m.nome}`, m.uso, { tipo: m.tipoRecomendado });
  const simples = regra.modelo === 'SIMPLES';
  return {
    ...m,
    regra,
    tipoRecomendado: simples ? 'SIMPLES' : 'ESPECIAL',
    motivoEspecial: simples ? undefined : regra.motivo,
  };
});

// ─── Notas e alertas de acesso (exibidos na seção SUS da UI) ────────────────

/** Nota informativa do grupo CEAF — itens sem card prescrevível. */
export const CEAF_NOTA_INFORMATIVA =
  'Também 100% gratuitos via PCDT (sem card aqui): hepatite B (tenofovir, entecavir), ' +
  'hepatite C (sofosbuvir/velpatasvir e associações) e biológicos para DII ' +
  '(adalimumabe, infliximabe) — prescrição via LME nos serviços de referência.';

/** Alertas clínicos e de acesso exibidos na seção de gratuidade. */
export const SUS_ALERTAS: string[] = [
  'A Farmácia Popular NÃO cobre medicamentos gastro (IBP, procinético, antiespasmódico) — o acesso é pelo CBAF, retirando na UBS.',
  'Colecalciferol isolado (vitamina D em monodroga) não consta na RENAME — para acesso gratuito, prescreva a combinação cálcio + vitamina D3.',
  'Metoclopramida: critério de Beers — risco de efeitos extrapiramidais e discinesia tardia em idosos; menor dose e menor duração.',
  'Ranitidina foi retirada do mercado (contaminação por NDMA) — substituir por IBP via UBS.',
  'Dapagliflozina: vigiar depleção volêmica, ITU/micose genital e cetoacidose euglicêmica; suspender em intercorrência aguda ou jejum prolongado.',
  'Fralda geriátrica: exige 60+ anos ou PcD; para deficiência, o laudo/atestado deve conter o CID.',
];

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Índice por id — O(1) para resolver as referências dos protocolos. */
const POR_ID = new Map(MEDICAMENTOS.map((m) => [m.id, m]));

/** Busca um medicamento pelo id do catálogo. */
export function getMedicamento(id: string): MedicamentoDef | undefined {
  return POR_ID.get(id);
}

/** Remove acentos e caixa — usado para busca tolerante. */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Busca textual tolerante a acento. Casa contra nome, princípio ativo,
 * marca de referência e indicação — "cozaar" acha losartana.
 */
export function buscarMedicamentos(termo: string): MedicamentoDef[] {
  const q = normalizar(termo);
  if (!q) return MEDICAMENTOS;
  return MEDICAMENTOS.filter((m) =>
    normalizar(`${m.nome} ${m.principioAtivo} ${m.marcaReferencia} ${m.indicacao}`).includes(q)
  );
}

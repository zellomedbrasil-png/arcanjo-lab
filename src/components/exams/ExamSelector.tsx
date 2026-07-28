import { useMemo, useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CATEGORIAS_EXAMES, PAINEIS_MARKDOWN } from '../../types';
import { formatExamNameForDisplay } from '../../lib/formatters';
import { findExamPreciso } from '../../services/groqExames';
import { PROCEDIMENTOS as PROCEDIMENTOS_BASE, GRUPOS_PROCEDIMENTOS, PROCEDIMENTOS_POR_GRUPO } from '../../data/procedimentos';
import type { ProcedimentoGrupo } from '../../data/procedimentos';
import {
  Activity, Stethoscope, Beaker, HeartPulse, ScanFace, FileHeart, Search, Scan,
  Bone, Disc, X, CheckCircle2, Moon, Ear, Wind, Brain, ChevronDown, ChevronUp,
  Droplet, FlaskConical, Target, ShieldAlert, Dna, User, Layers, Apple, Flame,
  Heart, TestTube, Baby, Microscope, Plus, Pencil, Zap, Filter
} from 'lucide-react';
import type { ElementType } from 'react';

const getCategoryIcon = (nome: string) => {
  const n = nome.toUpperCase();
  if (n.includes('HEMATO')) return Droplet;
  if (n.includes('GLICE')) return Apple;
  if (n.includes('LIPID') || n.includes('COLESTEROL')) return Heart;
  if (n.includes('RENAL') || n.includes('URINA')) return TestTube;
  if (n.includes('HEPATI') || n.includes('PANCRE')) return FlaskConical;
  if (n.includes('TIREOIDE') || n.includes('HORMONIO') || n.includes('ENDOCRINO')) return Activity;
  if (n.includes('MINERA') || n.includes('VITAMINA')) return Beaker;
  if (n.includes('TUMOR') || n.includes('MARCADORES TUMORAIS')) return Target;
  if (n.includes('SORO') || n.includes('INFECCI')) return Flame;
  if (n.includes('AUTOIMUN') || n.includes('REUMA')) return Dna;
  if (n.includes('IMUNO')) return Dna;
  if (n.includes('CARDIA') || n.includes('MUSCUL')) return Heart;
  if (n.includes('PARASITO') || n.includes('COPRO')) return TestTube;
  if (n.includes('ANDROLOGIA')) return User;
  if (n.includes('INFLAMA')) return ShieldAlert;
  return Layers;
};

const formatCategoryName = (nome: string) => {
  const mapping: Record<string, string> = {
    'HEMATOLOGIA E COAGULAÇÃO': 'Hematologia e Coagulação',
    'GLICEMIA E METABOLISMO GLICÍDICO': 'Glicemia e Metabolismo',
    'PERFIL LIPÍDICO': 'Perfil Lipídico (Colesterol)',
    'FUNÇÃO RENAL E URINA': 'Função Renal e Urina',
    'FUNÇÃO HEPÁTICA E PANCREÁTICA': 'Função Hepática e Pâncreas',
    'TIREOIDE': 'Tireoide',
    'HORMÔNIOS E ENDOCRINOLOGIA': 'Hormônios e Endocrino',
    'MINERAIS, VITAMINAS E OLIGOELEMENTOS': 'Vitaminas e Minerais',
    'MARCADORES TUMORAIS': 'Marcadores Tumorais',
    'SOROLOGIAS INFECCIOSAS': 'Sorologias e Infecções',
    'AUTOIMUNIDADE E REUMATOLOGIA': 'Autoimunidade e Reuma',
    'IMUNOGLOBULINAS': 'Imunoglobulinas',
    'MARCADORES CARDÍACOS E MUSCULARES': 'Marcadores Cardíacos',
    'PARASITOLOGIA E COPROLÓGICO': 'Parasitologia e Fezes',
    'ANDROLOGIA': 'Andrologia',
    'DOSAGENS URINÁRIAS ESPECIAIS': 'Dosagens Urinárias Esp.',
    'INFLAMAÇÃO E MARCADORES GERAIS': 'Inflamação e Gerais',
    'OUTROS EXAMES': 'Outros Exames'
  };
  return mapping[nome] ?? nome.toLowerCase().replace(/(^\w|\s\w)/g, m => m.toUpperCase());
};

const GRUPO_LABELS: Record<ProcedimentoGrupo, string> = {
  CARDIOLOGIA: '🫀 Cardiologia',
  ULTRASSONOGRAFIA: '🔊 Ultrassonografia & Dopplers',
  ARTICULACOES: '🦴 Articulações (US Joelho, Ombro...)',
  ENDOSCOPIA: '🔬 Endoscopia Digestiva',
  GASTRO_FUNCIONAL: '🧪 Gastro Funcional (SIBO / Lactose)',
  IMAGEM: '🩻 Imagem (Rx / TC / RM)',
  MASTOLOGIA: '🎗️ Mastologia',
  GERIATRIA: '🧠 Geriatria / Funcionais',
  GINECOLOGIA: '👩 Ginecologia / Preventivo',
  UROLOGIA: '💧 Urologia',
};

const GRUPO_COLORS: Record<ProcedimentoGrupo, { bg: string; badge: string; border: string }> = {
  CARDIOLOGIA: { bg: 'bg-red-50', badge: 'bg-red-100 text-red-700', border: 'border-red-100' },
  ULTRASSONOGRAFIA: { bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700', border: 'border-blue-100' },
  ARTICULACOES: { bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-100' },
  ENDOSCOPIA: { bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700', border: 'border-amber-100' },
  GASTRO_FUNCIONAL: { bg: 'bg-lime-50', badge: 'bg-lime-100 text-lime-700', border: 'border-lime-100' },
  IMAGEM: { bg: 'bg-slate-50', badge: 'bg-slate-100 text-slate-700', border: 'border-slate-200' },
  MASTOLOGIA: { bg: 'bg-pink-50', badge: 'bg-pink-100 text-pink-700', border: 'border-pink-100' },
  GERIATRIA: { bg: 'bg-indigo-50', badge: 'bg-indigo-100 text-indigo-700', border: 'border-indigo-100' },
  GINECOLOGIA: { bg: 'bg-purple-50', badge: 'bg-purple-100 text-purple-700', border: 'border-purple-100' },
  UROLOGIA: { bg: 'bg-teal-50', badge: 'bg-teal-100 text-teal-700', border: 'border-teal-100' },
};

export type ProcDef = {
  id: string;
  nome: string;
  nomeCompleto: string;
  grupo: ProcedimentoGrupo;
  codIssec: string;
  codIpm: string;
  detalhes?: string;
  icon: ElementType;
  color: string;
  activeColor: string;
  activeBg: string;
  hasAsterisk?: boolean;
};

// Icon & color definitions per procedure ID
const PROC_UI_MAP: Record<string, Omit<ProcDef, 'id' | 'nome' | 'nomeCompleto' | 'grupo' | 'codIssec' | 'codIpm' | 'detalhes' | 'hasAsterisk'>> = {
  // Cardiologia
  ECOCARDIOGRAMA:      { icon: HeartPulse, color: 'text-red-500',      activeColor: 'text-white', activeBg: 'bg-red-600' },
  ECODOPPLER:          { icon: Activity,   color: 'text-orange-500',   activeColor: 'text-white', activeBg: 'bg-orange-600' },
  MAPA:                { icon: FileHeart,  color: 'text-rose-500',     activeColor: 'text-white', activeBg: 'bg-rose-600' },
  HOLTER:              { icon: FileHeart,  color: 'text-pink-500',     activeColor: 'text-white', activeBg: 'bg-pink-600' },
  ECG:                 { icon: Activity,   color: 'text-rose-600',     activeColor: 'text-white', activeBg: 'bg-rose-700' },
  TEST_ERGOMETRICO:    { icon: Zap,        color: 'text-orange-500',   activeColor: 'text-white', activeBg: 'bg-orange-600' },
  ANGIOTC_CORONARIA:   { icon: Scan,       color: 'text-red-500',      activeColor: 'text-white', activeBg: 'bg-red-600' },
  ECOSTRESS:           { icon: HeartPulse, color: 'text-pink-500',     activeColor: 'text-white', activeBg: 'bg-pink-600' },
  DOPPLER_MEMBROS:     { icon: Activity,   color: 'text-rose-500',     activeColor: 'text-white', activeBg: 'bg-rose-700' },

  // Ultrassonografia
  US_ABD_TOTAL:        { icon: ScanFace,   color: 'text-blue-500',     activeColor: 'text-white', activeBg: 'bg-blue-600' },
  US_ABD_TOTAL_DOPPLER:{ icon: ScanFace,   color: 'text-blue-600',     activeColor: 'text-white', activeBg: 'bg-blue-700' },
  US_ABD_SUPERIOR:      { icon: ScanFace,   color: 'text-blue-500',     activeColor: 'text-white', activeBg: 'bg-blue-600' },
  US_PELVICO:          { icon: ScanFace,   color: 'text-purple-500',   activeColor: 'text-white', activeBg: 'bg-purple-600' },
  US_TRANSVAGINAL:     { icon: ScanFace,   color: 'text-pink-500',     activeColor: 'text-white', activeBg: 'bg-pink-600' },
  US_TRANSVAGINAL_DOPPLER:{ icon: ScanFace, color: 'text-pink-600',     activeColor: 'text-white', activeBg: 'bg-pink-700' },
  US_PROSTATA:         { icon: ScanFace,   color: 'text-blue-600',     activeColor: 'text-white', activeBg: 'bg-blue-700' },
  US_TIREOIDE:         { icon: ScanFace,   color: 'text-teal-500',     activeColor: 'text-white', activeBg: 'bg-teal-600' },
  US_TIREOIDE_DOPPLER:  { icon: ScanFace,   color: 'text-teal-600',     activeColor: 'text-white', activeBg: 'bg-teal-700' },
  US_BOLSA_ESCROTAL:    { icon: ScanFace,   color: 'text-sky-500',      activeColor: 'text-white', activeBg: 'bg-sky-600' },
  US_BOLSA_ESCROTAL_DOPPLER:{ icon: ScanFace,color: 'text-sky-600',     activeColor: 'text-white', activeBg: 'bg-sky-700' },
  US_CERVICAL:          { icon: ScanFace,   color: 'text-teal-500',     activeColor: 'text-white', activeBg: 'bg-teal-600' },
  US_CERVICAL_DOPPLER:  { icon: ScanFace,   color: 'text-teal-600',     activeColor: 'text-white', activeBg: 'bg-teal-700' },
  US_AXILAS:            { icon: ScanFace,   color: 'text-pink-500',     activeColor: 'text-white', activeBg: 'bg-pink-600' },
  US_PAREDE_ABD:        { icon: ScanFace,   color: 'text-indigo-500',   activeColor: 'text-white', activeBg: 'bg-indigo-600' },
  US_VIAS_BILIARES:    { icon: ScanFace,   color: 'text-amber-500',    activeColor: 'text-white', activeBg: 'bg-amber-600' },
  US_MAMA_BILATERAL:   { icon: ScanFace,   color: 'text-pink-600',     activeColor: 'text-white', activeBg: 'bg-pink-700' },
  US_RENAL:            { icon: ScanFace,   color: 'text-teal-600',     activeColor: 'text-white', activeBg: 'bg-teal-700' },
  US_VIAS_URINARIAS_FEM:{ icon: Droplet,    color: 'text-teal-500',     activeColor: 'text-white', activeBg: 'bg-teal-600' },
  US_VIAS_URINARIAS_MASC:{ icon: Droplet,   color: 'text-teal-600',     activeColor: 'text-white', activeBg: 'bg-teal-700' },
  US_PARTES_MOLES:     { icon: ScanFace,   color: 'text-sky-600',      activeColor: 'text-white', activeBg: 'bg-sky-700' },
  US_DOPPLER_CAROTIDAS:{ icon: Activity,   color: 'text-blue-600',     activeColor: 'text-white', activeBg: 'bg-blue-700' },
  US_DOPPLER_RENAIS:    { icon: Activity,   color: 'text-teal-600',     activeColor: 'text-white', activeBg: 'bg-teal-700' },
  US_DOPPLER_COLORIDO_ESTRUT:{ icon: Activity, color: 'text-rose-500',  activeColor: 'text-white', activeBg: 'bg-rose-600' },
  DOPPLER_MMI_ARTE:     { icon: Activity,   color: 'text-red-500',      activeColor: 'text-white', activeBg: 'bg-red-600' },
  DOPPLER_MMI_VENO:     { icon: Activity,   color: 'text-blue-500',     activeColor: 'text-white', activeBg: 'bg-blue-600' },
  DOPPLER_MMS_DIR:      { icon: Activity,   color: 'text-amber-500',    activeColor: 'text-white', activeBg: 'bg-amber-600' },
  DOPPLER_MMS_ESQ:      { icon: Activity,   color: 'text-amber-600',    activeColor: 'text-white', activeBg: 'bg-amber-700' },
  DOPPLER_MMI_INF_DIR:  { icon: Activity,   color: 'text-rose-500',     activeColor: 'text-white', activeBg: 'bg-rose-600' },
  DOPPLER_MMI_INF_ESQ:  { icon: Activity,   color: 'text-rose-600',     activeColor: 'text-white', activeBg: 'bg-rose-700' },

  // Articulações
  ARTICULACAO_GERAL:    { icon: Bone,       color: 'text-emerald-600',  activeColor: 'text-white', activeBg: 'bg-emerald-600' },
  ARTICULACAO_DOPPLER:   { icon: Bone,       color: 'text-emerald-700',  activeColor: 'text-white', activeBg: 'bg-emerald-700' },
  ARTICULACAO_JOELHO:    { icon: Bone,       color: 'text-emerald-600',  activeColor: 'text-white', activeBg: 'bg-emerald-600' },
  ARTICULACAO_QUADRIL:   { icon: Bone,       color: 'text-emerald-700',  activeColor: 'text-white', activeBg: 'bg-emerald-700' },
  ARTICULACAO_OMBRO:     { icon: Bone,       color: 'text-emerald-600',  activeColor: 'text-white', activeBg: 'bg-emerald-600' },
  ARTICULACAO_COTOVELO:  { icon: Bone,       color: 'text-emerald-500',  activeColor: 'text-white', activeBg: 'bg-emerald-600' },
  ARTICULACAO_PUNHO:     { icon: Bone,       color: 'text-emerald-500',  activeColor: 'text-white', activeBg: 'bg-emerald-600' },
  ARTICULACAO_MAO:       { icon: Bone,       color: 'text-emerald-600',  activeColor: 'text-white', activeBg: 'bg-emerald-600' },
  ARTICULACAO_PE:        { icon: Bone,       color: 'text-emerald-600',  activeColor: 'text-white', activeBg: 'bg-emerald-600' },
  ARTICULACAO_TORNOZELO:{ icon: Bone,       color: 'text-emerald-700',  activeColor: 'text-white', activeBg: 'bg-emerald-700' },
  ARTICULACAO_ESTERNOCLAVICULA:{ icon: Bone, color: 'text-emerald-500', activeColor: 'text-white', activeBg: 'bg-emerald-600' },
  ARTICULACAO_SACROILIACA:{ icon: Bone,     color: 'text-emerald-700',  activeColor: 'text-white', activeBg: 'bg-emerald-700' },

  // Endoscopia
  EDA:                 { icon: Search,     color: 'text-amber-500',    activeColor: 'text-white', activeBg: 'bg-amber-600' },
  EDA_BIOPSIA_HPYLORI: { icon: Microscope, color: 'text-amber-600',   activeColor: 'text-white', activeBg: 'bg-amber-700' },
  COLONOSCOPIA:        { icon: Search,     color: 'text-stone-500',    activeColor: 'text-white', activeBg: 'bg-stone-600' },
  COLONOSCOPIA_BIOPSIA:{ icon: Microscope, color: 'text-stone-600',   activeColor: 'text-white', activeBg: 'bg-stone-700' },
  RETOSSIGMOIDOSCOPIA: { icon: Search,     color: 'text-stone-500',    activeColor: 'text-white', activeBg: 'bg-stone-600' },
  RETOSSIGMOIDOSCOPIA_BIOPSIA: { icon: Microscope, color: 'text-stone-600', activeColor: 'text-white', activeBg: 'bg-stone-700' },
  PHMETRIA_ESOFAGICA:  { icon: Activity,   color: 'text-emerald-600',  activeColor: 'text-white', activeBg: 'bg-emerald-700' },
  MANOMETRIA_ESOFAGICA:{ icon: Activity,   color: 'text-teal-600',     activeColor: 'text-white', activeBg: 'bg-teal-700' },
  ECOENDOSCOPIA:       { icon: Search,     color: 'text-yellow-600',   activeColor: 'text-white', activeBg: 'bg-yellow-700' },

  // Gastro Funcional
  TESTE_H2_LACTULOSE:  { icon: Wind,       color: 'text-lime-600',     activeColor: 'text-white', activeBg: 'bg-lime-700' },
  TESTE_H2_GLICOSE:    { icon: Wind,       color: 'text-lime-600',     activeColor: 'text-white', activeBg: 'bg-lime-700' },
  TESTE_H2_LACTOSE:    { icon: Wind,       color: 'text-emerald-600',  activeColor: 'text-white', activeBg: 'bg-emerald-700' },

  // Imagem
  RX_TORAX:            { icon: Bone,       color: 'text-slate-500',    activeColor: 'text-white', activeBg: 'bg-slate-600' },
  RX_COLUNA:           { icon: Bone,       color: 'text-slate-500',    activeColor: 'text-white', activeBg: 'bg-slate-600' },
  RX_BACIA:            { icon: Bone,       color: 'text-slate-600',    activeColor: 'text-white', activeBg: 'bg-slate-700' },
  TC_ABD:              { icon: Scan,       color: 'text-indigo-500',   activeColor: 'text-white', activeBg: 'bg-indigo-600' },
  TC_CRANIO:           { icon: Scan,       color: 'text-indigo-500',   activeColor: 'text-white', activeBg: 'bg-indigo-600' },
  TC_TORAX:            { icon: Scan,       color: 'text-violet-500',   activeColor: 'text-white', activeBg: 'bg-violet-600' },
  RM_ABD:              { icon: Disc,       color: 'text-violet-500',   activeColor: 'text-white', activeBg: 'bg-violet-600' },
  RM_CRANIO:           { icon: Disc,       color: 'text-violet-500',   activeColor: 'text-white', activeBg: 'bg-violet-600' },
  RM_COLUNA:           { icon: Disc,       color: 'text-purple-500',   activeColor: 'text-white', activeBg: 'bg-purple-600' },
  RM_JOELHO:           { icon: Disc,       color: 'text-purple-600',   activeColor: 'text-white', activeBg: 'bg-purple-700' },
  RM_OMBRO:            { icon: Disc,       color: 'text-indigo-600',   activeColor: 'text-white', activeBg: 'bg-indigo-700' },
  DENSITOMETRIA:       { icon: Bone,       color: 'text-emerald-500',  activeColor: 'text-white', activeBg: 'bg-emerald-600' },
  CINTILOGRAFIA_OSSEA: { icon: Scan,       color: 'text-orange-500',   activeColor: 'text-white', activeBg: 'bg-orange-600' },
  PET_CT:              { icon: Scan,       color: 'text-yellow-600',   activeColor: 'text-white', activeBg: 'bg-yellow-700' },

  // Mastologia
  MAMOGRAFIA:          { icon: Baby,       color: 'text-pink-500',     activeColor: 'text-white', activeBg: 'bg-pink-600' },
  MAMOGRAFIA_BILATERAL:{ icon: Baby,       color: 'text-pink-600',     activeColor: 'text-white', activeBg: 'bg-pink-700' },
  US_MAMA_UNILATERAL:  { icon: ScanFace,   color: 'text-pink-500',     activeColor: 'text-white', activeBg: 'bg-pink-600' },

  // Geriatria / Funcionais
  POLISSONOGRAFIA:     { icon: Moon,       color: 'text-indigo-500',   activeColor: 'text-white', activeBg: 'bg-indigo-600' },
  DOPPLER_TRANSCRANIANO:{ icon: Activity,  color: 'text-sky-500',      activeColor: 'text-white', activeBg: 'bg-sky-600' },
  ELETRONEUROMIOGRAFIA:{ icon: Activity,   color: 'text-pink-500',     activeColor: 'text-white', activeBg: 'bg-pink-600' },
  AUDIOMETRIA:         { icon: Ear,        color: 'text-teal-500',     activeColor: 'text-white', activeBg: 'bg-teal-600' },
  ESPIROMETRIA:        { icon: Wind,       color: 'text-blue-500',     activeColor: 'text-white', activeBg: 'bg-blue-600' },
  EEG_MAPEAMENTO:      { icon: Brain,      color: 'text-purple-500',   activeColor: 'text-white', activeBg: 'bg-purple-600' },

  // Ginecologia / Preventivo
  CITOLOGIA_CERVICAL:  { icon: Microscope, color: 'text-purple-600',   activeColor: 'text-white', activeBg: 'bg-purple-700' },
  COLPOSCOPIA:         { icon: Search,     color: 'text-purple-500',   activeColor: 'text-white', activeBg: 'bg-purple-600' },
  HISTEROSCOPIA:       { icon: Search,     color: 'text-fuchsia-500',  activeColor: 'text-white', activeBg: 'bg-fuchsia-600' },

  // Urologia
  UROFLUXOMETRIA:      { icon: Droplet,    color: 'text-teal-500',     activeColor: 'text-white', activeBg: 'bg-teal-600' },
  URODINAMICA:         { icon: Droplet,    color: 'text-teal-600',     activeColor: 'text-white', activeBg: 'bg-teal-700' },
};

const DEFAULT_UI = { icon: Activity, color: 'text-gray-400', activeColor: 'text-white', activeBg: 'bg-gray-500' };

const PROCEDIMENTOS: ProcDef[] = PROCEDIMENTOS_BASE.map((procedimento) => {
  const ui = PROC_UI_MAP[procedimento.id] ?? DEFAULT_UI;
  return {
    id: procedimento.id,
    nome: procedimento.nomeCurto,
    nomeCompleto: procedimento.nome,
    grupo: procedimento.grupo,
    codIssec: procedimento.codIssec ?? '',
    codIpm: procedimento.codIpm ?? '',
    detalhes: procedimento.detalhes ?? '',
    icon: ui.icon,
    color: ui.color,
    activeColor: ui.activeColor,
    activeBg: ui.activeBg,
    hasAsterisk: procedimento.hasAsterisk,
  };
});

type Cobertura = 'AMBOS' | 'SO_ISSEC' | 'SO_IPM' | 'SEM_CODIGO';
type CoberturaChip = Cobertura | 'NAO_CATALOGADO';

function getCobertura(exame: { codIssec: string; codIpm: string }): Cobertura {
  const temIssec = !!exame.codIssec?.trim();
  const temIpm = !!exame.codIpm?.trim();
  if (temIssec && temIpm) return 'AMBOS';
  if (temIssec) return 'SO_ISSEC';
  if (temIpm) return 'SO_IPM';
  return 'SEM_CODIGO';
}

const COBERTURA_META: Record<Cobertura, { label: string; cls: string; title: string }> = {
  AMBOS: {
    label: 'ISSEC+IPM',
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    title: 'Coberto por ISSEC e IPM',
  },
  SO_ISSEC: {
    label: 'Só ISSEC',
    cls: 'bg-blue-50 text-blue-700 border-blue-200',
    title: 'Consta apenas na tabela do ISSEC',
  },
  SO_IPM: {
    label: 'Só IPM',
    cls: 'bg-amber-50 text-amber-700 border-amber-200',
    title: 'Consta apenas na tabela do IPM',
  },
  SEM_CODIGO: {
    label: 'Sem cobertura',
    cls: 'bg-slate-100 text-slate-600 border-slate-200',
    title: 'Sem código cadastrado nas tabelas oficiais. Confirme com a operadora.',
  },
};

const CHIP_META: Record<CoberturaChip, { label: string; title: string }> = {
  AMBOS: { label: COBERTURA_META.AMBOS.label, title: COBERTURA_META.AMBOS.title },
  SO_ISSEC: { label: COBERTURA_META.SO_ISSEC.label, title: COBERTURA_META.SO_ISSEC.title },
  SO_IPM: { label: COBERTURA_META.SO_IPM.label, title: COBERTURA_META.SO_IPM.title },
  SEM_CODIGO: { label: COBERTURA_META.SEM_CODIGO.label, title: COBERTURA_META.SEM_CODIGO.title },
  NAO_CATALOGADO: {
    label: 'Não catalogado',
    title: 'Item digitado manualmente — não consta no catálogo oficial do sistema.',
  },
};

const CHIP_DOT: Record<CoberturaChip, string> = {
  AMBOS: 'bg-emerald-500',
  SO_ISSEC: 'bg-blue-500',
  SO_IPM: 'bg-amber-500',
  SEM_CODIGO: 'bg-slate-400',
  NAO_CATALOGADO: 'bg-violet-400',
};

function isForaDoConvenio(cobertura: Cobertura, convenio: string): boolean {
  if (convenio === 'ISSEC') return cobertura === 'SO_IPM' || cobertura === 'SEM_CODIGO';
  if (convenio === 'IPM') return cobertura === 'SO_ISSEC' || cobertura === 'SEM_CODIGO';
  return false;
}

interface ExamSelectorProps {
  mode?: 'exames' | 'procedimentos';
}

export default function ExamSelector({ mode }: ExamSelectorProps = {}) {
  const [busca, setBusca] = useState('');
  const [buscaProc, setBuscaProc] = useState('');
  const [grupoProcFiltro, setGrupoProcFiltro] = useState<string>('TODOS');
  const [paineisExpanded, setPaineisExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('HEMATOLOGIA E COAGULAÇÃO');
  const [customInput, setCustomInput] = useState('');
  const customInputRef = useRef<HTMLInputElement>(null);

  const {
    tipoGuia, convenio, examesSelecionados, procedimentosSelecionados, procedimentosPersonalizados,
    setExamesSelecionados, setJustificativa, setPaciente, toggleProcedimento,
    addProcedimentoPersonalizado, removeProcedimentoPersonalizado,
  } = useAppStore();

  useEffect(() => {
    if (examesSelecionados.length === 0) return;
    const atualizados = examesSelecionados.map((nome) => {
      const match = findExamPreciso(nome);
      return match && match.nome !== nome ? match.nome : nome;
    });
    const mudou = atualizados.some((n, i) => n !== examesSelecionados[i]);
    if (mudou) setExamesSelecionados([...new Set(atualizados)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLab = mode ? mode === 'exames' : tipoGuia === 'LABORATORIO';
  const buscaNormalizada = busca.trim().toLowerCase();
  const buscaProcNorm = buscaProc.trim().toLowerCase();

  const totalSelecionados = procedimentosSelecionados.length + procedimentosPersonalizados.length;

  const categoriasFiltradas = useMemo(() => {
    return CATEGORIAS_EXAMES.map((categoria) => {
      const exames = categoria.exames.filter((exame) => {
        if (!buscaNormalizada) return true;
        return `${categoria.nome} ${exame.nome}`.toLowerCase().includes(buscaNormalizada);
      });
      return { ...categoria, exames };
    }).filter((categoria) => categoria.exames.length > 0);
  }, [buscaNormalizada]);

  const totalMatches = useMemo(() => {
    return categoriasFiltradas.reduce((acc, cat) => acc + cat.exames.length, 0);
  }, [categoriasFiltradas]);

  const coberturaPorChip = useMemo(() => {
    const map = new Map<string, CoberturaChip>();
    for (const nome of examesSelecionados) {
      const match = findExamPreciso(nome);
      map.set(nome, match ? getCobertura(match) : 'NAO_CATALOGADO');
    }
    return map;
  }, [examesSelecionados]);

  const outroConvenio = convenio === 'ISSEC' ? 'IPM' : 'ISSEC';
  const { examesSemCobertura, examesNoOutroConvenio, examesOk } = useMemo(() => {
    const semCob: string[] = [];
    const noOutro: string[] = [];
    const ok: string[] = [];
    for (const nome of examesSelecionados) {
      const cob = coberturaPorChip.get(nome) ?? 'NAO_CATALOGADO';
      if (cob === 'NAO_CATALOGADO') { ok.push(nome); continue; }
      if (cob === 'SEM_CODIGO') { semCob.push(nome); continue; }
      if (isForaDoConvenio(cob, convenio)) { noOutro.push(nome); continue; }
      ok.push(nome);
    }
    return { examesSemCobertura: semCob, examesNoOutroConvenio: noOutro, examesOk: ok };
  }, [examesSelecionados, coberturaPorChip, convenio]);
  const totalAlerta = examesSemCobertura.length + examesNoOutroConvenio.length;

  // ── Cobertura & Alertas para Procedimentos Eletivos ─────────────────────
  const { procsSemCobertura, procsNoOutroConvenio } = useMemo(() => {
    const semCob: string[] = [];
    const noOutro: string[] = [];
    for (const id of procedimentosSelecionados) {
      const proc = PROCEDIMENTOS.find(p => p.id === id);
      if (!proc) continue;
      const cob = getCobertura(proc);
      if (cob === 'SEM_CODIGO') { semCob.push(id); continue; }
      if (isForaDoConvenio(cob, convenio)) { noOutro.push(id); continue; }
    }
    return { procsSemCobertura: semCob, procsNoOutroConvenio: noOutro };
  }, [procedimentosSelecionados, convenio]);
  const totalAlertaProcs = procsSemCobertura.length + procsNoOutroConvenio.length;

  // Procedimentos filtrados pela busca e grupo selecionado
  const procedimentosFiltrados = useMemo(() => {
    return PROCEDIMENTOS.filter((proc) => {
      const bateGrupo = grupoProcFiltro === 'TODOS' || proc.grupo === grupoProcFiltro;
      if (!bateGrupo) return false;
      if (!buscaProcNorm) return true;
      const texto = `${proc.nome} ${proc.nomeCompleto} ${proc.grupo} ${proc.codIssec} ${proc.codIpm} ${proc.detalhes}`.toLowerCase();
      return texto.includes(buscaProcNorm);
    });
  }, [buscaProcNorm, grupoProcFiltro]);

  const toggleExame = (exameNome: string) => {
    if (examesSelecionados.includes(exameNome)) {
      setExamesSelecionados(examesSelecionados.filter((e) => e !== exameNome));
    } else {
      setExamesSelecionados([...examesSelecionados, exameNome]);
    }
  };

  const aplicarPainel = (chave: string) => {
    const painel = PAINEIS_MARKDOWN[chave];
    const examesAtuais = useAppStore.getState().examesSelecionados;
    setExamesSelecionados([...new Set([...examesAtuais, ...painel.exames])]);
    if (painel.justificativa) {
      const justificativaLimpa = painel.justificativa.trim();
      const justificativaAtualLimpa = (useAppStore.getState().justificativa || '').trim();
      if (justificativaAtualLimpa && !justificativaAtualLimpa.toUpperCase().includes(justificativaLimpa.toUpperCase())) {
        setJustificativa(`${justificativaAtualLimpa}\n${justificativaLimpa}`);
      } else if (!justificativaAtualLimpa) {
        setJustificativa(justificativaLimpa);
      }
    }
  };

  const selecionarCategoria = (exames: string[]) => {
    setExamesSelecionados([...new Set([...examesSelecionados, ...exames])]);
  };

  const limparCategoria = (exames: string[]) => {
    const examesSet = new Set(exames);
    setExamesSelecionados(examesSelecionados.filter((exame) => !examesSet.has(exame)));
  };

  const handleAddCustom = () => {
    const nome = customInput.trim();
    if (!nome) return;
    addProcedimentoPersonalizado(nome);
    setCustomInput('');
    customInputRef.current?.focus();
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-border overflow-hidden">
      {/* Tab bar */}
      {!mode && (
        <div className="flex border-b border-neutral-border">
          <button
            onClick={() => setPaciente({ tipoGuia: 'LABORATORIO' })}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all cursor-pointer ${
              isLab
                ? 'text-blue-750 bg-blue-50/30 border-b-2 border-blue-600'
                : 'text-neutral-text-muted hover:text-neutral-text hover:bg-slate-50/50'
            }`}
          >
            <Beaker size={15} />
            Exames Laboratoriais
          </button>
          <button
            onClick={() => {
              if (isLab) setPaciente({ tipoGuia: 'ECOCARDIOGRAMA' });
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all cursor-pointer ${
              !isLab
                ? 'text-emerald-755 bg-emerald-50/30 border-b-2 border-emerald-600'
                : 'text-neutral-text-muted hover:text-neutral-text hover:bg-slate-50/50'
            }`}
          >
            <Stethoscope size={15} />
            Procedimentos Eletivos
            {!isLab && totalSelecionados > 0 && (
              <span className="bg-emerald-600 text-white text-[10px] rounded-full w-4.5 h-4.5 flex items-center justify-center font-bold">
                {totalSelecionados}
              </span>
            )}
          </button>
        </div>
      )}

      <div className="p-5.5">
        {!isLab ? (
          <div>
            {/* Counter & info */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-neutral-text font-medium">
                  Selecione até <strong>3 procedimentos</strong> por guia.
                </p>
                <p className="text-xs text-neutral-text-muted mt-0.5">
                  Códigos de convênio cadastrados para <strong>ISSEC</strong> e <strong>IPM</strong>.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className={`w-8 h-2 rounded-full transition-all ${
                      i < totalSelecionados ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                ))}
                <span className="text-xs text-neutral-text-muted ml-1 font-semibold">
                  {totalSelecionados}/3
                </span>
              </div>
            </div>

            {/* Selected chips — both catalog and custom with coverage dots */}
            {totalSelecionados > 0 && (
              <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50/30 overflow-hidden">
                {/* Header with dots legend & clear button */}
                <div className="flex items-center justify-between gap-3 flex-wrap px-4 py-2.5 bg-emerald-100/50 border-b border-emerald-200/60">
                  <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    {totalSelecionados} procedimento{totalSelecionados !== 1 ? 's' : ''} selecionado{totalSelecionados !== 1 ? 's' : ''}
                  </span>

                  <div className="flex items-center gap-2.5 flex-wrap text-[9px] font-semibold text-neutral-text-muted">
                    {(['AMBOS', 'SO_ISSEC', 'SO_IPM', 'SEM_CODIGO', 'NAO_CATALOGADO'] as CoberturaChip[]).map((c) => (
                      <span key={c} className="inline-flex items-center gap-1" title={CHIP_META[c].title}>
                        <span className={`h-1.5 w-1.5 rounded-full ${CHIP_DOT[c]}`} />
                        {CHIP_META[c].label}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Limpar todos os procedimentos selecionados?')) {
                        setPaciente({ procedimentosSelecionados: [] });
                        procedimentosPersonalizados.forEach(n => removeProcedimentoPersonalizado(n));
                      }
                    }}
                    className="text-[10px] font-bold text-emerald-800 hover:text-red-600 transition-colors cursor-pointer ml-auto"
                  >
                    Limpar seleção
                  </button>
                </div>

                {/* Restrictive coverage alert for active convenio */}
                {totalAlertaProcs > 0 && (
                  <div className="px-4 py-3 bg-red-50/70 border-b border-red-200 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <ShieldAlert size={13} className="text-red-600 shrink-0" />
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-700">
                        {totalAlertaProcs} procedimento{totalAlertaProcs !== 1 ? 's' : ''} com restrição de cobertura no convênio selecionado ({convenio})
                      </span>
                    </div>

                    {procsSemCobertura.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-red-700 mb-1">
                          Sem código no ISSEC e no IPM
                          <span className="font-normal text-red-600/80"> · particular ou sob consulta</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {procsSemCobertura.map((id) => {
                            const proc = PROCEDIMENTOS.find(p => p.id === id);
                            if (!proc) return null;
                            return (
                              <span
                                key={id}
                                className="inline-flex items-center gap-1.5 rounded-md bg-white border border-red-200 px-2.5 py-1 text-[11px] font-semibold text-red-700"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                {proc.nome}
                                <button
                                  type="button"
                                  onClick={() => toggleProcedimento(id)}
                                  className="text-red-400 hover:text-red-700 cursor-pointer ml-0.5"
                                >
                                  <X size={11} />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {procsNoOutroConvenio.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-red-700 mb-1">
                          Sem código no {convenio}, mas cadastrado no {outroConvenio}
                          <span className="font-normal text-red-600/80"> · considerar alterar a operadora da guia se viável</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {procsNoOutroConvenio.map((id) => {
                            const proc = PROCEDIMENTOS.find(p => p.id === id);
                            if (!proc) return null;
                            const cob = getCobertura(proc);
                            const codText = outroConvenio === 'ISSEC' ? proc.codIssec : proc.codIpm;
                            return (
                              <span
                                key={id}
                                className="inline-flex items-center gap-1.5 rounded-md bg-white border border-red-200 px-2.5 py-1 text-[11px] font-semibold text-red-700"
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${CHIP_DOT[cob]}`} />
                                {proc.nome}
                                {codText && <span className="font-mono text-[9.5px] text-red-500">({outroConvenio}: {codText})</span>}
                                <button
                                  type="button"
                                  onClick={() => toggleProcedimento(id)}
                                  className="text-red-400 hover:text-red-700 cursor-pointer ml-0.5"
                                >
                                  <X size={11} />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Selected procedure chips */}
                <div className="flex flex-wrap gap-2 p-3.5">
                  {procedimentosSelecionados.map((id) => {
                    const proc = PROCEDIMENTOS.find(p => p.id === id);
                    if (!proc) return null;
                    const cob = getCobertura(proc);
                    const Icon = proc.icon;
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white text-xs font-semibold rounded-full shadow-sm"
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${CHIP_DOT[cob]}`} />
                        <Icon size={12} />
                        <span>{proc.nome}</span>
                        {proc.codIpm && <span className="text-[9.5px] opacity-80 font-mono">IPM:{proc.codIpm}</span>}
                        {proc.codIssec && <span className="text-[9.5px] opacity-80 font-mono">ISSEC:{proc.codIssec}</span>}
                        <button
                          onClick={() => toggleProcedimento(id)}
                          className="ml-0.5 text-emerald-200 hover:text-white transition-colors cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })}
                  {procedimentosPersonalizados.map((nome) => (
                    <span
                      key={nome}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-full shadow-sm"
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${CHIP_DOT.NAO_CATALOGADO}`} />
                      <Pencil size={11} />
                      {nome}
                      <button
                        onClick={() => removeProcedimentoPersonalizado(nome)}
                        className="ml-0.5 text-indigo-200 hover:text-white transition-colors cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Custom / Free-text exam entry */}
            <div className="mb-5 bg-gradient-to-r from-indigo-50 to-blue-50/50 border border-indigo-100 rounded-xl p-4">
              <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Pencil size={12} />
                Adicionar Procedimento Personalizado / Não Listado
              </p>
              <div className="flex gap-2">
                <input
                  ref={customInputRef}
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustom(); }}
                  disabled={totalSelecionados >= 3}
                  placeholder={
                    totalSelecionados >= 3
                      ? 'Limite de 3 procedimentos atingido'
                      : 'Ex: Cintilografia de Perfusão Miocárdica, Videolaringoscopia...'
                  }
                  className={`flex-1 rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all shadow-sm placeholder-gray-300 ${
                    totalSelecionados >= 3
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white border-indigo-200'
                  }`}
                />
                <button
                  onClick={handleAddCustom}
                  disabled={!customInput.trim() || totalSelecionados >= 3}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    !customInput.trim() || totalSelecionados >= 3
                      ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md cursor-pointer'
                  }`}
                >
                  <Plus size={14} />
                  Adicionar
                </button>
              </div>
              <p className="text-[10px] text-indigo-500 mt-2 font-medium">
                Pressione Enter ou clique em Adicionar. Use para exames não catalogados abaixo.
              </p>
            </div>

            {/* ── Search & Specialty Filter Bar for Procedures ────────────────── */}
            <div className="mb-5 space-y-3">
              {/* Search input */}
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-text-muted" />
                <input
                  type="search"
                  value={buscaProc}
                  onChange={(e) => setBuscaProc(e.target.value)}
                  placeholder="Buscar procedimento por nome ou código (ex: 40901211, 33010021, joelho, doppler, tireoide...)..."
                  className="w-full rounded-xl border border-neutral-border bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 transition-all shadow-sm"
                />
                {buscaProc && (
                  <button
                    onClick={() => setBuscaProc('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Specialty pills filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mr-1 flex items-center gap-1 shrink-0">
                  <Filter size={11} />
                  Especialidade:
                </span>
                <button
                  type="button"
                  onClick={() => setGrupoProcFiltro('TODOS')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    grupoProcFiltro === 'TODOS'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-neutral-text-muted hover:bg-slate-200'
                  }`}
                >
                  Todas ({PROCEDIMENTOS.length})
                </button>
                {GRUPOS_PROCEDIMENTOS.map((grupo) => {
                  const countGroup = PROCEDIMENTOS_POR_GRUPO[grupo]?.length ?? 0;
                  const isSel = grupoProcFiltro === grupo;
                  return (
                    <button
                      key={grupo}
                      type="button"
                      onClick={() => setGrupoProcFiltro(grupo)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                        isSel
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 text-neutral-text-muted hover:bg-slate-200'
                      }`}
                    >
                      {GRUPO_LABELS[grupo].replace(/^[\p{Emoji}\s]+/u, '')} ({countGroup})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Procedure Cards Grid ────────────────────────────────────── */}
            {procedimentosFiltrados.length === 0 ? (
              <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl bg-slate-50/50">
                <Search size={32} className="mx-auto mb-2 opacity-30 text-gray-400" />
                <p className="text-sm font-medium text-gray-600">Nenhum procedimento encontrado para "{buscaProc}"</p>
                <p className="text-xs text-gray-400 mt-1">Verifique a ortografia ou adicione como procedimento personalizado acima.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {(grupoProcFiltro === 'TODOS' && !buscaProcNorm
                  ? GRUPOS_PROCEDIMENTOS
                  : [...new Set(procedimentosFiltrados.map(p => p.grupo))]
                ).map((grupo) => {
                  const procsNoGrupo = procedimentosFiltrados.filter(p => p.grupo === grupo);
                  if (procsNoGrupo.length === 0) return null;
                  const colors = GRUPO_COLORS[grupo];
                  return (
                    <div key={grupo} className={`rounded-xl border ${colors.border} overflow-hidden shadow-xs`}>
                      <div className={`px-4 py-2.5 ${colors.bg} flex items-center justify-between`}>
                        <h4 className="text-[11px] font-extrabold text-neutral-text-muted uppercase tracking-wider">
                          {GRUPO_LABELS[grupo]}
                        </h4>
                        <span className="text-[10px] font-bold text-neutral-text-muted/70 bg-white/60 px-2 py-0.5 rounded-full">
                          {procsNoGrupo.length} item{procsNoGrupo.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2.5 bg-white">
                        {procsNoGrupo.map((proc) => {
                          const isSelected = procedimentosSelecionados.includes(proc.id);
                          const isFull = totalSelecionados >= 3 && !isSelected;
                          const cob = getCobertura(proc);
                          const meta = COBERTURA_META[cob];
                          const fora = isForaDoConvenio(cob, convenio);
                          const Icon = proc.icon;

                          return (
                            <button
                              key={proc.id}
                              type="button"
                              onClick={() => toggleProcedimento(proc.id)}
                              disabled={isFull}
                              title={`${proc.nomeCompleto}\n• ISSEC: ${proc.codIssec || 'Sem código'}\n• IPM: ${proc.codIpm || 'Sem código'}`}
                              className={`relative flex flex-col items-start text-left gap-1.5 p-3 rounded-xl border transition-all cursor-pointer ${
                                isSelected
                                  ? `${proc.activeBg} ${proc.activeColor} border-transparent font-bold shadow-md ring-2 ring-emerald-400/50`
                                  : isFull
                                    ? 'border-neutral-border bg-slate-50 text-neutral-text-muted/40 cursor-not-allowed opacity-60'
                                    : `border-neutral-border bg-white text-gray-800 hover:border-emerald-300 hover:bg-emerald-50/20 shadow-xs`
                              }`}
                            >
                              {/* Header row inside card */}
                              <div className="w-full flex items-center justify-between gap-1.5">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <Icon size={16} className={isSelected ? 'text-white' : proc.color} />
                                  {proc.hasAsterisk && (
                                    <span className={`text-[11px] font-black ${isSelected ? 'text-white' : 'text-red-500'}`}>*</span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  {/* Fora do convenio warning badge */}
                                  {fora ? (
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded border font-extrabold uppercase ${
                                      isSelected ? 'bg-white/20 text-white border-white/30' : 'bg-red-50 text-red-700 border-red-200'
                                    }`}>
                                      Fora do {convenio}
                                    </span>
                                  ) : (
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded border font-extrabold uppercase ${
                                      isSelected ? 'bg-white/20 text-white border-white/30' : meta.cls
                                    }`}>
                                      {meta.label}
                                    </span>
                                  )}

                                  {isSelected && (
                                    <CheckCircle2 size={13} className="text-white shrink-0 ml-0.5" />
                                  )}
                                </div>
                              </div>

                              {/* Title */}
                              <span className="text-xs font-semibold leading-snug line-clamp-2 mt-0.5">
                                {proc.nome}
                              </span>

                              {/* Exact Codes Row */}
                              <div className={`w-full flex items-center gap-1.5 flex-wrap text-[9.5px] font-mono mt-1 pt-1.5 border-t ${
                                isSelected ? 'border-white/20 text-white/90' : 'border-slate-100 text-gray-500'
                              }`}>
                                {proc.codIpm ? (
                                  <span className={`px-1 rounded ${isSelected ? 'bg-white/10' : 'bg-amber-50 text-amber-800 border border-amber-200/60'}`}>
                                    IPM: <strong>{proc.codIpm}</strong>
                                  </span>
                                ) : (
                                  <span className={`opacity-40 line-through ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>IPM: —</span>
                                )}

                                {proc.codIssec ? (
                                  <span className={`px-1 rounded ${isSelected ? 'bg-white/10' : 'bg-blue-50 text-blue-800 border border-blue-200/60'}`}>
                                    ISSEC: <strong>{proc.codIssec}</strong>
                                  </span>
                                ) : (
                                  <span className={`opacity-40 line-through ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>ISSEC: —</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {totalSelecionados > 0 && (
              <button
                onClick={() => {
                  if (confirm('Tem certeza que deseja limpar todos os procedimentos selecionados?')) {
                    setPaciente({ procedimentosSelecionados: [] });
                    procedimentosPersonalizados.forEach(n => removeProcedimentoPersonalizado(n));
                  }
                }}
                className="mt-5 text-xs text-neutral-text-muted hover:text-neutral-text underline transition-colors cursor-pointer"
              >
                Limpar toda a seleção de procedimentos
              </button>
            )}

          </div>
        ) : (
          <div>
            {/* Quick panels */}
            <div className="mb-5.5 bg-blue-50/20 rounded-lg border border-blue-100 overflow-hidden">
              <button
                type="button"
                onClick={() => setPaineisExpanded(!paineisExpanded)}
                className="w-full flex items-center justify-between px-5 py-4 bg-blue-50/50 hover:bg-blue-50/80 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                    Painéis Rápidos Clínicos
                  </span>
                </div>
                {paineisExpanded ? (
                  <ChevronUp size={13} className="text-blue-500" />
                ) : (
                  <ChevronDown size={13} className="text-blue-500" />
                )}
              </button>
              {paineisExpanded && (
                <div className="p-4.5 bg-white border-t border-blue-100/50 animate-fadeIn space-y-4">
                  {/* Gastro — Investigação (painéis com prefixo "GASTRO — ") */}
                  <div>
                    <span className="block text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider mb-2">
                      Gastro — Investigação
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {Object.entries(PAINEIS_MARKDOWN)
                        .filter(([, painel]) => painel.nome.startsWith('GASTRO — '))
                        .map(([key, painel]) => (
                          <button
                            key={key}
                            onClick={() => aplicarPainel(key)}
                            title={painel.justificativa}
                            className="px-3.5 py-2 bg-white text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-600 hover:text-white transition-colors border border-emerald-200 cursor-pointer"
                          >
                            {painel.nome.replace('GASTRO — ', '')}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Painéis gerais e de convênio */}
                  <div>
                    <span className="block text-[10px] font-extrabold text-blue-700 uppercase tracking-wider mb-2">
                      Gerais / Convênio
                    </span>
                    <div className="flex flex-wrap gap-2.5 items-center">
                      {Object.entries(PAINEIS_MARKDOWN)
                        .filter(([, painel]) => !painel.nome.startsWith('GASTRO — '))
                        .map(([key, painel]) => (
                          <button
                            key={key}
                            onClick={() => aplicarPainel(key)}
                            className="px-3.5 py-2 bg-white text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-colors border border-blue-200 cursor-pointer"
                          >
                            {painel.nome}
                          </button>
                        ))}
                      <button
                        onClick={() => {
                          const confirmMsg = isLab
                            ? 'Limpar todos os exames selecionados e justificativa?'
                            : 'Limpar todos os procedimentos selecionados (incluindo personalizados) e justificativa?';
                          if (confirm(confirmMsg)) {
                            if (isLab) {
                              setExamesSelecionados([]);
                              setPaciente({ justificativaExames: '' });
                            } else {
                              setPaciente({
                                procedimentosSelecionados: [],
                                justificativaProcedimentos: ''
                              });
                              procedimentosPersonalizados.forEach(n => removeProcedimentoPersonalizado(n));
                            }
                            setJustificativa('');
                          }
                        }}
                        className="px-3.5 py-2 bg-white text-neutral-text-muted text-xs font-semibold rounded-lg hover:bg-slate-100 transition-colors border border-neutral-border ml-auto cursor-pointer"
                      >
                        Limpar Tudo
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-5.5 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3 items-start">
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-text-muted" />
                <input
                  type="search"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar exame por nome ou categoria..."
                  className="w-full rounded-lg border border-neutral-border bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>
              <div className="text-xs text-neutral-text-muted bg-slate-50 border border-neutral-border rounded-lg px-4.5 py-2.5">
                <strong className="text-blue-700">{examesSelecionados.length}</strong> exame(s) selecionado(s)
              </div>
            </div>

            {examesSelecionados.length > 0 && (
              <div className="mb-5.5 rounded-lg border border-blue-100 bg-blue-50/20 overflow-hidden">
                <div className="flex items-center justify-between gap-3 flex-wrap px-3.5 py-2.5 bg-white/70 border-b border-blue-100/70">
                  <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                    {examesSelecionados.length} exame{examesSelecionados.length !== 1 ? 's' : ''} selecionado{examesSelecionados.length !== 1 ? 's' : ''}
                  </span>

                  <div className="flex items-center gap-2.5 flex-wrap text-[9px] font-semibold text-neutral-text-muted">
                    {(['AMBOS', 'SO_ISSEC', 'SO_IPM', 'SEM_CODIGO', 'NAO_CATALOGADO'] as CoberturaChip[]).map((c) => (
                      <span key={c} className="inline-flex items-center gap-1" title={CHIP_META[c].title}>
                        <span className={`h-1.5 w-1.5 rounded-full ${CHIP_DOT[c]}`} />
                        {CHIP_META[c].label}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Limpar todos os exames selecionados e justificativa?')) {
                        setExamesSelecionados([]);
                        setPaciente({ justificativaExames: '' });
                        setJustificativa('');
                      }
                    }}
                    className="text-[10px] font-bold text-neutral-text-muted hover:text-red-600 transition-colors cursor-pointer"
                  >
                    Limpar seleção
                  </button>
                </div>

                {totalAlerta > 0 && (
                  <div className="px-3.5 py-2.5 bg-red-50/60 border-b border-red-100 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <ShieldAlert size={12} className="text-red-600 shrink-0" />
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-700">
                        {totalAlerta} exame{totalAlerta !== 1 ? 's' : ''} com restrição de cobertura
                      </span>
                    </div>

                    {examesSemCobertura.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-red-700 mb-1">
                          Sem cobertura no ISSEC e no IPM
                          <span className="font-normal text-red-600/80"> · particular provável, confirmar com a operadora</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {examesSemCobertura.map((exame) => {
                            const cob = coberturaPorChip.get(exame) ?? 'NAO_CATALOGADO';
                            return (
                              <span
                                key={exame}
                                title={CHIP_META[cob].title}
                                className="inline-flex items-center gap-1.5 rounded-md bg-white border border-red-200 px-2 py-1 text-[11px] font-semibold text-red-700"
                              >
                                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${CHIP_DOT[cob]}`} />
                                {formatExamNameForDisplay(exame)}
                                <button
                                  type="button"
                                  onClick={() => toggleExame(exame)}
                                  className="text-red-300 hover:text-red-600 transition-colors cursor-pointer ml-0.5"
                                  title={`Remover ${exame}`}
                                >
                                  <X size={11} />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {examesNoOutroConvenio.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-red-700 mb-1">
                          Fora do {convenio}, mas disponível pelo {outroConvenio}
                          <span className="font-normal text-red-600/80"> · trocar convênio da guia resolve</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {examesNoOutroConvenio.map((exame) => {
                            const cob = coberturaPorChip.get(exame) ?? 'NAO_CATALOGADO';
                            return (
                              <span
                                key={exame}
                                title={CHIP_META[cob].title}
                                className="inline-flex items-center gap-1.5 rounded-md bg-white border border-red-200 px-2 py-1 text-[11px] font-semibold text-red-700"
                              >
                                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${CHIP_DOT[cob]}`} />
                                {formatExamNameForDisplay(exame)}
                                <button
                                  type="button"
                                  onClick={() => toggleExame(exame)}
                                  className="text-red-300 hover:text-red-600 transition-colors cursor-pointer ml-0.5"
                                  title={`Remover ${exame}`}
                                >
                                  <X size={11} />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {examesOk.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-3 max-h-32 overflow-y-auto">
                    {examesOk.map((exame) => {
                      const cob = coberturaPorChip.get(exame) ?? 'NAO_CATALOGADO';
                      return (
                        <span
                          key={exame}
                          title={CHIP_META[cob].title}
                          className="inline-flex items-center gap-1.5 rounded-md bg-white border border-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700 transition-all"
                        >
                          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${CHIP_DOT[cob]}`} />
                          {formatExamNameForDisplay(exame)}
                          <button
                            type="button"
                            onClick={() => toggleExame(exame)}
                            className="text-blue-300 hover:text-red-500 transition-colors cursor-pointer ml-0.5"
                            title={`Remover ${exame}`}
                          >
                            <X size={11} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {categoriasFiltradas.length === 0 && buscaNormalizada && (
              <div className="text-center py-12 text-gray-400">
                <Search size={32} className="mx-auto mb-3 opacity-25" />
                <p className="text-sm font-medium text-gray-500">Nenhum exame encontrado para "{busca}"</p>
                <p className="text-xs mt-1 text-gray-400">Tente outro termo ou use a função "Colar Lista" acima para exames não catalogados.</p>
              </div>
            )}

            {buscaNormalizada ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-border pb-2.5">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Resultados da Busca
                    <span className="ml-2 text-xs font-normal text-gray-400">({totalMatches} exames encontrados)</span>
                  </h3>
                </div>

                <div className="max-h-[500px] overflow-y-auto pr-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 bg-white">
                    {categoriasFiltradas.flatMap((cat) =>
                      cat.exames.map((exame) => {
                        const isChecked = examesSelecionados.includes(exame.nome);
                        const cobertura = getCobertura(exame);
                        const meta = COBERTURA_META[cobertura];
                        const fora = isForaDoConvenio(cobertura, convenio);
                        return (
                          <label
                            key={exame.nome}
                            className={`flex items-start gap-2 px-2.5 py-2 rounded-lg border cursor-pointer transition-all text-[11px] ${
                              isChecked
                                ? 'bg-blue-50 border-blue-300 text-blue-800 font-semibold shadow-none'
                                : 'bg-white border-neutral-border text-neutral-text-muted hover:border-blue-200 hover:bg-blue-50/40'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="w-3.5 h-3.5 text-blue-600 border-neutral-border rounded focus:ring-blue-500 shrink-0 cursor-pointer mt-0.5"
                              checked={isChecked}
                              onChange={() => toggleExame(exame.nome)}
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="leading-tight text-left font-medium text-neutral-text" title={exame.nome}>
                                {formatExamNameForDisplay(exame.nome)}
                              </span>
                              <span className="flex items-center gap-1 flex-wrap mt-1">
                                <span className="text-[9px] text-blue-650 uppercase tracking-wider font-extrabold">{formatCategoryName(cat.nome)}</span>
                                <span
                                  title={fora ? `Não coberto pelo convênio ${convenio}. ${meta.title}` : meta.title}
                                  className={`text-[8px] px-1 py-0.5 rounded border font-extrabold uppercase ${
                                    fora ? 'bg-red-50 text-red-700 border-red-200' : meta.cls
                                  }`}
                                >
                                  {fora ? `Fora do ${convenio}` : meta.label}
                                </span>
                              </span>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5.5 items-stretch">
                <div className="hidden lg:block lg:col-span-4 border-r border-neutral-border pr-4.5">
                  <div className="max-h-[500px] overflow-y-auto space-y-1.5 pr-1.5 scrollbar-thin">
                    {CATEGORIAS_EXAMES.map((cat) => {
                      const countInCat = cat.exames.filter((e) => examesSelecionados.includes(e.nome)).length;
                      const isSelected = activeCategory === cat.nome;
                      const Icon = getCategoryIcon(cat.nome);
                      return (
                        <button
                          key={cat.nome}
                          type="button"
                          onClick={() => setActiveCategory(cat.nome)}
                          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-left text-xs font-semibold transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 border-transparent text-white shadow-sm'
                              : 'bg-white border-neutral-border text-neutral-text hover:bg-slate-50/50 hover:text-blue-600'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon size={14} className={`shrink-0 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                            <span className="truncate">{formatCategoryName(cat.nome)}</span>
                          </div>
                          {countInCat > 0 && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold leading-none shrink-0 ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {countInCat}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:hidden w-full overflow-x-auto pb-3 mb-2 flex gap-2 scrollbar-none">
                  {CATEGORIAS_EXAMES.map((cat) => {
                    const countInCat = cat.exames.filter((e) => examesSelecionados.includes(e.nome)).length;
                    const isSelected = activeCategory === cat.nome;
                    const Icon = getCategoryIcon(cat.nome);
                    return (
                      <button
                        key={cat.nome}
                        type="button"
                        onClick={() => setActiveCategory(cat.nome)}
                        className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 border-transparent text-white shadow-sm'
                            : 'bg-white border-neutral-border text-neutral-text hover:bg-slate-50'
                        }`}
                      >
                        <Icon size={13} className={isSelected ? 'text-white' : 'text-blue-600'} />
                        <span>{formatCategoryName(cat.nome)}</span>
                        {countInCat > 0 && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {countInCat}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="lg:col-span-8 flex flex-col">
                  {(() => {
                    const catObj = CATEGORIAS_EXAMES.find((c) => c.nome === activeCategory);
                    if (!catObj) return null;
                    const nomesCategoria = catObj.exames.map((exame) => exame.nome);
                    const selectedInCatCount = catObj.exames.filter(e => examesSelecionados.includes(e.nome)).length;

                    return (
                      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 px-5 py-3 border border-neutral-border rounded-t-lg mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-blue-800 uppercase tracking-wider">
                            {formatCategoryName(activeCategory)}
                          </span>
                          {selectedInCatCount > 0 && (
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
                              {selectedInCatCount} selecionado(s)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => selecionarCategoria(nomesCategoria)}
                            className="text-[11px] font-semibold text-blue-655 hover:text-blue-800 cursor-pointer"
                          >
                            Selecionar tudo
                          </button>
                          {selectedInCatCount > 0 && (
                            <button
                              type="button"
                              onClick={() => limparCategoria(nomesCategoria)}
                              className="text-[11px] font-semibold text-neutral-text-muted hover:text-red-500 cursor-pointer"
                            >
                              Limpar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="max-h-[500px] overflow-y-auto pr-1 flex-1">
                    {(() => {
                      const catObj = categoriasFiltradas.find((c) => c.nome === activeCategory);
                      if (!catObj || catObj.exames.length === 0) {
                        return (
                          <div className="text-center py-12 text-gray-400 border border-neutral-border rounded-b-lg border-t-0 bg-white text-xs font-medium">
                            Nenhum exame disponível nesta categoria para o convênio selecionado.
                          </div>
                        );
                      }
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 bg-white">
                          {catObj.exames.map((exame) => {
                            const isChecked = examesSelecionados.includes(exame.nome);
                            const cobertura = getCobertura(exame);
                            const meta = COBERTURA_META[cobertura];
                            const fora = isForaDoConvenio(cobertura, convenio);
                            return (
                              <label
                                key={exame.nome}
                                className={`flex items-start gap-2 px-2.5 py-2 rounded-lg border cursor-pointer transition-all text-[11px] ${
                                  isChecked
                                    ? 'bg-blue-50 border-blue-300 text-blue-800 font-semibold shadow-none'
                                    : 'bg-white border-neutral-border text-neutral-text-muted hover:border-blue-200 hover:bg-blue-50/40'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  className="w-3.5 h-3.5 text-blue-600 border-neutral-border rounded focus:ring-blue-500 shrink-0 cursor-pointer mt-0.5"
                                  checked={isChecked}
                                  onChange={() => toggleExame(exame.nome)}
                                />
                                <div className="flex flex-col min-w-0">
                                  <span className="leading-tight text-left font-medium text-neutral-text" title={exame.nome}>
                                    {formatExamNameForDisplay(exame.nome)}
                                  </span>
                                  <span
                                    title={fora ? `Não coberto pelo convênio ${convenio}. ${meta.title}` : meta.title}
                                    className={`self-start text-[8px] px-1 py-0.5 mt-1 rounded border font-extrabold uppercase ${
                                      fora ? 'bg-red-50 text-red-700 border-red-200' : meta.cls
                                    }`}
                                  >
                                    {fora ? `Fora do ${convenio}` : meta.label}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

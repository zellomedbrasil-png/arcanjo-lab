import { useMemo, useState, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CATEGORIAS_EXAMES, PAINEIS_MARKDOWN } from '../../types';
import { formatExamNameForDisplay } from '../../lib/formatters';
import { PROCEDIMENTOS as PROCEDIMENTOS_BASE, GRUPOS_PROCEDIMENTOS, PROCEDIMENTOS_POR_GRUPO } from '../../data/procedimentos';
import type { ProcedimentoGrupo } from '../../data/procedimentos';
import {
  Activity, Stethoscope, Beaker, HeartPulse, ScanFace, FileHeart, Search, Scan,
  Bone, Disc, X, CheckCircle2, Moon, Ear, Wind, Brain, ChevronDown, ChevronUp,
  Droplet, FlaskConical, Target, ShieldAlert, Dna, User, Layers, Apple, Flame,
  Heart, TestTube, Baby, Microscope, Plus, Pencil, Zap
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
  ULTRASSONOGRAFIA: '🔊 Ultrassonografia',
  ENDOSCOPIA: '🔬 Endoscopia Digestiva',
  IMAGEM: '🩻 Imagem (Rx / TC / RM)',
  MASTOLOGIA: '🎗️ Mastologia',
  GERIATRIA: '🧠 Geriatria / Funcionais',
  GINECOLOGIA: '👩 Ginecologia / Preventivo',
  UROLOGIA: '💧 Urologia',
};

const GRUPO_COLORS: Record<ProcedimentoGrupo, { bg: string; badge: string; border: string }> = {
  CARDIOLOGIA: { bg: 'bg-red-50', badge: 'bg-red-100 text-red-700', border: 'border-red-100' },
  ULTRASSONOGRAFIA: { bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700', border: 'border-blue-100' },
  ENDOSCOPIA: { bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700', border: 'border-amber-100' },
  IMAGEM: { bg: 'bg-slate-50', badge: 'bg-slate-100 text-slate-700', border: 'border-slate-200' },
  MASTOLOGIA: { bg: 'bg-pink-50', badge: 'bg-pink-100 text-pink-700', border: 'border-pink-100' },
  GERIATRIA: { bg: 'bg-indigo-50', badge: 'bg-indigo-100 text-indigo-700', border: 'border-indigo-100' },
  GINECOLOGIA: { bg: 'bg-purple-50', badge: 'bg-purple-100 text-purple-700', border: 'border-purple-100' },
  UROLOGIA: { bg: 'bg-teal-50', badge: 'bg-teal-100 text-teal-700', border: 'border-teal-100' },
};

type ProcDef = {
  id: string;
  nome: string;
  icon: ElementType;
  color: string;
  activeColor: string;
  activeBg: string;
  hasAsterisk?: boolean;
};

// Icon & color definitions per procedure ID
const PROC_UI_MAP: Record<string, Omit<ProcDef, 'id' | 'nome' | 'hasAsterisk'>> = {
  ECOCARDIOGRAMA:      { icon: HeartPulse, color: 'text-red-400',      activeColor: 'text-white', activeBg: 'bg-red-500' },
  ECODOPPLER:          { icon: Activity,   color: 'text-orange-400',   activeColor: 'text-white', activeBg: 'bg-orange-500' },
  MAPA:                { icon: FileHeart,  color: 'text-rose-400',     activeColor: 'text-white', activeBg: 'bg-rose-500' },
  HOLTER:              { icon: FileHeart,  color: 'text-pink-400',     activeColor: 'text-white', activeBg: 'bg-pink-500' },
  ECG:                 { icon: Activity,   color: 'text-rose-400',     activeColor: 'text-white', activeBg: 'bg-rose-600' },
  TEST_ERGOMETRICO:    { icon: Zap,        color: 'text-orange-500',   activeColor: 'text-white', activeBg: 'bg-orange-600' },
  ANGIOTC_CORONARIA:   { icon: Scan,       color: 'text-red-500',      activeColor: 'text-white', activeBg: 'bg-red-600' },
  ECOSTRESS:           { icon: HeartPulse, color: 'text-pink-500',     activeColor: 'text-white', activeBg: 'bg-pink-600' },
  DOPPLER_MEMBROS:     { icon: Activity,   color: 'text-rose-500',     activeColor: 'text-white', activeBg: 'bg-rose-700' },
  US_ABD_TOTAL:        { icon: ScanFace,   color: 'text-blue-400',     activeColor: 'text-white', activeBg: 'bg-blue-500' },
  US_PELVICO:          { icon: ScanFace,   color: 'text-purple-400',   activeColor: 'text-white', activeBg: 'bg-purple-500' },
  US_TRANSVAGINAL:     { icon: ScanFace,   color: 'text-pink-400',     activeColor: 'text-white', activeBg: 'bg-pink-600' },
  US_PROSTATA:         { icon: ScanFace,   color: 'text-blue-400',     activeColor: 'text-white', activeBg: 'bg-blue-600' },
  US_TIREOIDE:         { icon: ScanFace,   color: 'text-teal-400',     activeColor: 'text-white', activeBg: 'bg-teal-500' },
  US_VIAS_BILIARES:    { icon: ScanFace,   color: 'text-amber-400',    activeColor: 'text-white', activeBg: 'bg-amber-500' },
  US_MAMA_BILATERAL:   { icon: ScanFace,   color: 'text-pink-500',     activeColor: 'text-white', activeBg: 'bg-pink-700' },
  US_RENAL:            { icon: ScanFace,   color: 'text-teal-500',     activeColor: 'text-white', activeBg: 'bg-teal-600' },
  US_PARTES_MOLES:     { icon: ScanFace,   color: 'text-sky-500',      activeColor: 'text-white', activeBg: 'bg-sky-600' },
  US_DOPPLER_CAROTIDAS:{ icon: Activity,   color: 'text-blue-500',     activeColor: 'text-white', activeBg: 'bg-blue-700' },
  EDA:                 { icon: Search,     color: 'text-amber-400',    activeColor: 'text-white', activeBg: 'bg-amber-600' },
  EDA_BIOPSIA_HPYLORI: { icon: Microscope, color: 'text-amber-500',   activeColor: 'text-white', activeBg: 'bg-amber-600' },
  COLONOSCOPIA:        { icon: Search,     color: 'text-stone-400',    activeColor: 'text-white', activeBg: 'bg-stone-500' },
  COLONOSCOPIA_BIOPSIA:{ icon: Microscope, color: 'text-stone-500',   activeColor: 'text-white', activeBg: 'bg-stone-600' },
  RETOSSIGMOIDOSCOPIA: { icon: Search,     color: 'text-stone-400',    activeColor: 'text-white', activeBg: 'bg-stone-600' },
  RETOSSIGMOIDOSCOPIA_BIOPSIA: { icon: Microscope, color: 'text-stone-500', activeColor: 'text-white', activeBg: 'bg-stone-700' },
  PHMETRIA_ESOFAGICA:  { icon: Activity,   color: 'text-emerald-500',  activeColor: 'text-white', activeBg: 'bg-emerald-600' },
  MANOMETRIA_ESOFAGICA:{ icon: Activity,   color: 'text-teal-500',     activeColor: 'text-white', activeBg: 'bg-teal-600' },
  ECOENDOSCOPIA:       { icon: Search,     color: 'text-yellow-500',   activeColor: 'text-white', activeBg: 'bg-yellow-600' },
  RX_TORAX:            { icon: Bone,       color: 'text-slate-400',    activeColor: 'text-white', activeBg: 'bg-slate-500' },
  RX_COLUNA:           { icon: Bone,       color: 'text-slate-400',    activeColor: 'text-white', activeBg: 'bg-slate-600' },
  RX_BACIA:            { icon: Bone,       color: 'text-slate-500',    activeColor: 'text-white', activeBg: 'bg-slate-700' },
  TC_ABD:              { icon: Scan,       color: 'text-indigo-400',   activeColor: 'text-white', activeBg: 'bg-indigo-500' },
  TC_CRANIO:           { icon: Scan,       color: 'text-indigo-400',   activeColor: 'text-white', activeBg: 'bg-indigo-600' },
  TC_TORAX:            { icon: Scan,       color: 'text-violet-400',   activeColor: 'text-white', activeBg: 'bg-violet-600' },
  RM_ABD:              { icon: Disc,       color: 'text-violet-400',   activeColor: 'text-white', activeBg: 'bg-violet-500' },
  RM_CRANIO:           { icon: Disc,       color: 'text-violet-400',   activeColor: 'text-white', activeBg: 'bg-violet-600' },
  RM_COLUNA:           { icon: Disc,       color: 'text-purple-400',   activeColor: 'text-white', activeBg: 'bg-purple-600' },
  RM_JOELHO:           { icon: Disc,       color: 'text-purple-500',   activeColor: 'text-white', activeBg: 'bg-purple-700' },
  RM_OMBRO:            { icon: Disc,       color: 'text-indigo-500',   activeColor: 'text-white', activeBg: 'bg-indigo-700' },
  DENSITOMETRIA:       { icon: Bone,       color: 'text-emerald-400',  activeColor: 'text-white', activeBg: 'bg-emerald-500' },
  CINTILOGRAFIA_OSSEA: { icon: Scan,       color: 'text-orange-400',   activeColor: 'text-white', activeBg: 'bg-orange-500' },
  PET_CT:              { icon: Scan,       color: 'text-yellow-500',   activeColor: 'text-white', activeBg: 'bg-yellow-600' },
  MAMOGRAFIA:          { icon: Baby,       color: 'text-pink-400',     activeColor: 'text-white', activeBg: 'bg-pink-500' },
  MAMOGRAFIA_BILATERAL:{ icon: Baby,       color: 'text-pink-500',     activeColor: 'text-white', activeBg: 'bg-pink-600' },
  US_MAMA_UNILATERAL:  { icon: ScanFace,   color: 'text-pink-400',     activeColor: 'text-white', activeBg: 'bg-pink-500' },
  POLISSONOGRAFIA:     { icon: Moon,       color: 'text-indigo-400',   activeColor: 'text-white', activeBg: 'bg-indigo-500' },
  DOPPLER_TRANSCRANIANO:{ icon: Activity,  color: 'text-sky-400',      activeColor: 'text-white', activeBg: 'bg-sky-500' },
  ELETRONEUROMIOGRAFIA:{ icon: Activity,   color: 'text-pink-400',     activeColor: 'text-white', activeBg: 'bg-pink-500' },
  AUDIOMETRIA:         { icon: Ear,        color: 'text-teal-400',     activeColor: 'text-white', activeBg: 'bg-teal-500' },
  ESPIROMETRIA:        { icon: Wind,       color: 'text-blue-400',     activeColor: 'text-white', activeBg: 'bg-blue-500' },
  EEG_MAPEAMENTO:      { icon: Brain,      color: 'text-purple-400',   activeColor: 'text-white', activeBg: 'bg-purple-500' },
  CITOLOGIA_CERVICAL:  { icon: Microscope, color: 'text-purple-500',   activeColor: 'text-white', activeBg: 'bg-purple-600' },
  COLPOSCOPIA:         { icon: Search,     color: 'text-purple-400',   activeColor: 'text-white', activeBg: 'bg-purple-500' },
  HISTEROSCOPIA:       { icon: Search,     color: 'text-fuchsia-400',  activeColor: 'text-white', activeBg: 'bg-fuchsia-600' },
  UROFLUXOMETRIA:      { icon: Droplet,    color: 'text-teal-400',     activeColor: 'text-white', activeBg: 'bg-teal-500' },
  URODINAMICA:         { icon: Droplet,    color: 'text-teal-500',     activeColor: 'text-white', activeBg: 'bg-teal-600' },
};

const DEFAULT_UI = { icon: Activity, color: 'text-gray-400', activeColor: 'text-white', activeBg: 'bg-gray-500' };

const PROCEDIMENTOS: ProcDef[] = PROCEDIMENTOS_BASE.map((procedimento) => {
  const ui = PROC_UI_MAP[procedimento.id] ?? DEFAULT_UI;
  return {
    id: procedimento.id,
    nome: procedimento.nomeCurto,
    icon: ui.icon,
    color: ui.color,
    activeColor: ui.activeColor,
    activeBg: ui.activeBg,
    hasAsterisk: procedimento.hasAsterisk,
  };
});

interface ExamSelectorProps {
  mode?: 'exames' | 'procedimentos';
}

export default function ExamSelector({ mode }: ExamSelectorProps = {}) {
  const [busca, setBusca] = useState('');
  const [paineisExpanded, setPaineisExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('HEMATOLOGIA E COAGULAÇÃO');
  const [customInput, setCustomInput] = useState('');
  const customInputRef = useRef<HTMLInputElement>(null);

  const {
    tipoGuia, convenio, examesSelecionados, procedimentosSelecionados, procedimentosPersonalizados,
    setExamesSelecionados, setJustificativa, setPaciente, toggleProcedimento,
    addProcedimentoPersonalizado, removeProcedimentoPersonalizado,
  } = useAppStore();

  const isLab = mode ? mode === 'exames' : tipoGuia === 'LABORATORIO';
  const buscaNormalizada = busca.trim().toLowerCase();

  const totalSelecionados = procedimentosSelecionados.length + procedimentosPersonalizados.length;

  const categoriasFiltradas = useMemo(() => {
    return CATEGORIAS_EXAMES.map((categoria) => {
      const exames = categoria.exames.filter((exame) => {
        if (convenio === 'ISSEC' && exame.marca === '**') return false;
        if (convenio === 'IPM' && exame.marca === '*') return false;
        if (!buscaNormalizada) return true;
        return `${categoria.nome} ${exame.nome}`.toLowerCase().includes(buscaNormalizada);
      });
      return { ...categoria, exames };
    }).filter((categoria) => categoria.exames.length > 0);
  }, [buscaNormalizada, convenio]);

  const totalMatches = useMemo(() => {
    return categoriasFiltradas.reduce((acc, cat) => acc + cat.exames.length, 0);
  }, [categoriasFiltradas]);

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
                <p className="text-xs text-neutral-text-muted mt-0.5">Limitação da guia oficial — emita guias separadas para mais procedimentos.</p>
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

            {/* Selected chips — both catalog and custom */}
            {(procedimentosSelecionados.length > 0 || procedimentosPersonalizados.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-4 p-3.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
                {procedimentosSelecionados.map(id => {
                  const proc = PROCEDIMENTOS.find(p => p.id === id);
                  if (!proc) return null;
                  const Icon = proc.icon;
                  return (
                    <span
                      key={id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-full"
                    >
                      <Icon size={11} />
                      {proc.nome}
                      <button
                        onClick={() => toggleProcedimento(id)}
                        className="ml-1 hover:text-emerald-250 transition-colors cursor-pointer"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  );
                })}
                {procedimentosPersonalizados.map((nome) => (
                  <span
                    key={nome}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-full"
                  >
                    <Pencil size={11} />
                    {nome}
                    <button
                      onClick={() => removeProcedimentoPersonalizado(nome)}
                      className="ml-1 hover:text-indigo-200 transition-colors cursor-pointer"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* ── Custom / Free-text exam entry ──────────────────────── */}
            <div className="mb-5 bg-gradient-to-r from-indigo-50 to-blue-50/50 border border-indigo-100 rounded-xl p-4">
              <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Pencil size={12} />
                Adicionar Exame Personalizado / Não Listado
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
                Pressione Enter ou clique em Adicionar. Use para procedimentos não catalogados abaixo.
              </p>
            </div>

            {/* Procedure grid — grouped by specialty */}
            <div className="space-y-4">
              {(GRUPOS_PROCEDIMENTOS.map(grupo => ({ grupo, procs: PROCEDIMENTOS_POR_GRUPO[grupo] }))).map(({ grupo, procs }) => {
                const procsUI = procs.map(p => PROCEDIMENTOS.find(u => u.id === p.id)!).filter(Boolean);
                const colors = GRUPO_COLORS[grupo];
                return (
                  <div key={grupo} className={`rounded-xl border ${colors.border} overflow-hidden`}>
                    <div className={`px-4 py-2.5 ${colors.bg}`}>
                      <h4 className="text-[11px] font-bold text-neutral-text-muted uppercase tracking-wider">
                        {GRUPO_LABELS[grupo]}
                      </h4>
                    </div>
                    <div className="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 bg-white">
                      {procsUI.map((proc) => {
                        const isSelected = procedimentosSelecionados.includes(proc.id);
                        const isFull = totalSelecionados >= 3 && !isSelected;
                        const Icon = proc.icon;
                        return (
                          <button
                            key={proc.id}
                            onClick={() => toggleProcedimento(proc.id)}
                            disabled={isFull}
                            title={isFull ? 'Limite de 3 procedimentos atingido' : proc.nome}
                            className={`relative flex flex-col items-center gap-2 p-3 rounded-lg border text-center transition-all text-xs font-semibold cursor-pointer
                              ${isSelected
                                ? `${proc.activeBg} ${proc.activeColor} border-transparent font-bold shadow-sm`
                                : isFull
                                  ? 'border-neutral-border bg-slate-50 text-neutral-text-muted/40 cursor-not-allowed'
                                  : `border-neutral-border bg-white ${proc.color} hover:border-slate-355 hover:bg-slate-50/50`
                              }`}
                          >
                            {isSelected && (
                              <CheckCircle2
                                size={12}
                                className="absolute top-1.5 right-1.5 text-white opacity-90"
                              />
                            )}
                            <div className="relative">
                              <Icon size={18} className={isFull && !isSelected ? 'opacity-30' : ''} />
                              {proc.hasAsterisk && (
                                <span className={`absolute -top-1.5 -right-2 text-[11px] font-black select-none leading-none ${
                                  isSelected ? 'text-white' : 'text-red-500'
                                }`}>
                                  *
                                </span>
                              )}
                            </div>
                            <span className="leading-tight">{proc.nome}</span>
                            {isFull && (
                              <span className="text-[9px] text-neutral-text-muted/40 font-normal">Limite atingido</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {totalSelecionados > 0 && (
              <button
                onClick={() => {
                  setPaciente({ procedimentosSelecionados: [] });
                  // Also clear all custom ones
                  procedimentosPersonalizados.forEach(n => removeProcedimentoPersonalizado(n));
                }}
                className="mt-4.5 text-xs text-neutral-text-muted hover:text-neutral-text underline transition-colors cursor-pointer"
              >
                Limpar toda a seleção
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
                <div className="p-4.5 bg-white flex flex-wrap gap-2.5 border-t border-blue-100/50 animate-fadeIn">
                  {Object.entries(PAINEIS_MARKDOWN).map(([key, painel]) => (
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
                      if (isLab) {
                        setExamesSelecionados([]);
                      } else {
                        setPaciente({ procedimentosSelecionados: [] });
                      }
                      setJustificativa('');
                    }}
                    className="px-3.5 py-2 bg-white text-neutral-text-muted text-xs font-semibold rounded-lg hover:bg-slate-100 transition-colors border border-neutral-border ml-auto cursor-pointer"
                  >
                    Limpar Tudo
                  </button>
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
              <div className="mb-5.5 flex flex-wrap gap-1.5 rounded-lg border border-blue-100 bg-blue-50/30 p-2.5 max-h-24 overflow-y-auto">
                {examesSelecionados.map((exame) => (
                  <span key={exame} className="inline-flex items-center gap-1 rounded bg-white border border-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700 shadow-none transition-all">
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
                ))}
              </div>
            )}

            {/* Empty state */}
            {categoriasFiltradas.length === 0 && buscaNormalizada && (
              <div className="text-center py-12 text-gray-400">
                <Search size={32} className="mx-auto mb-3 opacity-25" />
                <p className="text-sm font-medium text-gray-500">Nenhum exame encontrado para "{busca}"</p>
                <p className="text-xs mt-1 text-gray-400">Tente outro termo ou use a função "Colar Lista" acima para exames não catalogados.</p>
              </div>
            )}

            {/* Catalog Visualization: Global Search vs Dual-Pane Category View */}
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
                              <span className="text-[9px] text-blue-650 mt-1 uppercase tracking-wider font-extrabold">{formatCategoryName(cat.nome)}</span>
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
                {/* 1. Desktop vertical category sidebar */}
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

                {/* 2. Mobile horizontal categories strip */}
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

                {/* 3. Main panel for active category exams */}
                <div className="lg:col-span-8 flex flex-col">
                  {/* Category Header Actions */}
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

                  {/* Category exams grid */}
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
                                <span className="leading-tight text-left font-medium text-neutral-text" title={exame.nome}>
                                  {formatExamNameForDisplay(exame.nome)}
                                </span>
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

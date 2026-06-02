import { useMemo, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CATEGORIAS_EXAMES, PAINEIS_MARKDOWN } from '../../types';
import { formatExamNameForDisplay } from '../../lib/formatters';
import { PROCEDIMENTOS as PROCEDIMENTOS_BASE, PROCEDIMENTOS_POR_GRUPO } from '../../data/procedimentos';
import type { ProcedimentoGrupo, ProcedimentoDef } from '../../data/procedimentos';
import { 
  Activity, Stethoscope, Beaker, HeartPulse, ScanFace, FileHeart, Search, Scan, 
  Bone, Disc, X, CheckCircle2, Moon, Ear, Wind, Brain, ChevronDown, ChevronUp,
  Droplet, FlaskConical, Target, ShieldAlert, Dna, User, Layers, Apple, Flame,
  Heart, TestTube
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

type ProcDef = {
  id: string;
  nome: string;
  icon: ElementType;
  color: string;
  activeColor: string;
  activeBg: string;
  hasAsterisk?: boolean;
};

const PROCEDIMENTOS_LEGACY: ProcDef[] = [
  // Cardiologia
  { id: 'ECOCARDIOGRAMA',      nome: 'Ecocardiograma Transtorácico',        icon: HeartPulse, color: 'text-red-400',     activeColor: 'text-white', activeBg: 'bg-red-500' },
  { id: 'ECODOPPLER',          nome: 'Ecodopplercardiograma',               icon: Activity,   color: 'text-orange-400',  activeColor: 'text-white', activeBg: 'bg-orange-500' },
  { id: 'MAPA',                nome: 'MAPA 24h',                             icon: FileHeart,  color: 'text-rose-400',    activeColor: 'text-white', activeBg: 'bg-rose-500' },
  { id: 'HOLTER',              nome: 'Holter 24h',                           icon: FileHeart,  color: 'text-pink-400',    activeColor: 'text-white', activeBg: 'bg-pink-500' },
  { id: 'ECG',                 nome: 'Eletrocardiograma (ECG)',              icon: Activity,   color: 'text-rose-400',    activeColor: 'text-white', activeBg: 'bg-rose-600' },
  // Ultrassonografia
  { id: 'US_ABD_TOTAL',        nome: 'US Abdome Total',                      icon: ScanFace,   color: 'text-blue-400',    activeColor: 'text-white', activeBg: 'bg-blue-500' },
  { id: 'US_PELVICO',          nome: 'US Pélvico',                           icon: ScanFace,   color: 'text-purple-400',  activeColor: 'text-white', activeBg: 'bg-purple-500' },
  { id: 'US_TRANSVAGINAL',     nome: 'US Transvaginal',                      icon: ScanFace,   color: 'text-pink-400',    activeColor: 'text-white', activeBg: 'bg-pink-600' },
  { id: 'US_PROSTATA',         nome: 'US Próstata e Vias Urinárias',         icon: ScanFace,   color: 'text-blue-400',    activeColor: 'text-white', activeBg: 'bg-blue-600' },
  { id: 'US_TIREOIDE',         nome: 'US Tireoide',                          icon: ScanFace,   color: 'text-teal-400',    activeColor: 'text-white', activeBg: 'bg-teal-500' },
  { id: 'US_VIAS_BILIARES',    nome: 'US Vias Biliares e Fígado',            icon: ScanFace,   color: 'text-amber-400',   activeColor: 'text-white', activeBg: 'bg-amber-500' },
  // Endoscopia
  { id: 'EDA',                 nome: 'Esofagogastroduodenoscopia (EDA)',     icon: Search,     color: 'text-amber-400',   activeColor: 'text-white', activeBg: 'bg-amber-600' },
  { id: 'EDA_BIOPSIA_HPYLORI', nome: 'EDA + Biópsia H. pylori',               icon: Search,     color: 'text-amber-500',   activeColor: 'text-white', activeBg: 'bg-amber-600' },
  { id: 'COLONOSCOPIA',        nome: 'Colonoscopia',                         icon: Search,     color: 'text-stone-400',   activeColor: 'text-white', activeBg: 'bg-stone-500' },
  { id: 'COLONOSCOPIA_BIOPSIA',nome: 'Colonoscopia + Biópsia',                icon: Search,     color: 'text-stone-500',   activeColor: 'text-white', activeBg: 'bg-stone-600' },
  { id: 'RETOSSIGMOIDOSCOPIA', nome: 'Retossigmoidoscopia',                  icon: Search,     color: 'text-stone-400',   activeColor: 'text-white', activeBg: 'bg-stone-600' },
  { id: 'RETOSSIGMOIDOSCOPIA_BIOPSIA', nome: 'Retossigmoidoscopia + Biópsia', icon: Search,     color: 'text-stone-500',   activeColor: 'text-white', activeBg: 'bg-stone-700' },
  { id: 'PHMETRIA_ESOFAGICA',  nome: 'pHmetria Esofágica',                   icon: Activity,   color: 'text-emerald-500', activeColor: 'text-white', activeBg: 'bg-emerald-600' },
  { id: 'MANOMETRIA_ESOFAGICA',nome: 'Manometria Esofágica',                 icon: Activity,   color: 'text-teal-500',    activeColor: 'text-white', activeBg: 'bg-teal-600' },
  { id: 'ECOENDOSCOPIA',       nome: 'Ecoendoscopia',                        icon: Search,     color: 'text-yellow-500',  activeColor: 'text-white', activeBg: 'bg-yellow-600' },
  // Imagem
  { id: 'RX_TORAX',            nome: 'Radiografia de Tórax PA+Perfil',       icon: Bone,       color: 'text-slate-400',   activeColor: 'text-white', activeBg: 'bg-slate-500' },
  { id: 'RX_COLUNA',           nome: 'Radiografia de Coluna',                icon: Bone,       color: 'text-slate-400',   activeColor: 'text-white', activeBg: 'bg-slate-600' },
  { id: 'TC_ABD',              nome: 'TC Abdome e Pelve c/ contraste',       icon: Scan,       color: 'text-indigo-400',  activeColor: 'text-white', activeBg: 'bg-indigo-500' },
  { id: 'TC_CRANIO',           nome: 'TC Crânio',                             icon: Scan,       color: 'text-indigo-400',  activeColor: 'text-white', activeBg: 'bg-indigo-600' },
  { id: 'RM_ABD',              nome: 'RM Abdome e Pelve',                    icon: Disc,       color: 'text-violet-400',  activeColor: 'text-white', activeBg: 'bg-violet-500' },
  { id: 'RM_CRANIO',           nome: 'RM Crânio',                             icon: Disc,       color: 'text-violet-400',  activeColor: 'text-white', activeBg: 'bg-violet-600' },
  // Geriatria / Funcionais
  { id: 'DENSITOMETRIA',       nome: 'Densitometria Óssea (DXA)',            icon: Bone,       color: 'text-emerald-400', activeColor: 'text-white', activeBg: 'bg-emerald-500' },
  { id: 'POLISSONOGRAFIA',     nome: 'Polissonografia',                      icon: Moon,       color: 'text-indigo-400',  activeColor: 'text-white', activeBg: 'bg-indigo-500' },
  { id: 'DOPPLER_TRANSCRANIANO', nome: 'Doppler Transcraniano',               icon: Activity,   color: 'text-sky-400',     activeColor: 'text-white', activeBg: 'bg-sky-500' },
  { id: 'ELETRONEUROMIOGRAFIA', nome: 'Eletroneuromiografia',                icon: Activity,   color: 'text-pink-400',    activeColor: 'text-white', activeBg: 'bg-pink-500' },
  { id: 'AUDIOMETRIA',         nome: 'Audiometria',                          icon: Ear,        color: 'text-teal-400',    activeColor: 'text-white', activeBg: 'bg-teal-500' },
  { id: 'ESPIROMETRIA',        nome: 'Espirometria',                         icon: Wind,       color: 'text-blue-400',    activeColor: 'text-white', activeBg: 'bg-blue-500' },
  { id: 'EEG_MAPEAMENTO',      nome: 'EEG Mapeamento',                       icon: Brain,      color: 'text-purple-400',  activeColor: 'text-white', activeBg: 'bg-purple-500' },
];

const GRUPO_LABELS: Record<ProcedimentoGrupo, string> = {
  CARDIOLOGIA: 'Cardiologia',
  ULTRASSONOGRAFIA: 'Ultrassonografia',
  ENDOSCOPIA: 'Endoscopia',
  IMAGEM: 'Imagem (Rx / TC / RM)',
  GERIATRIA: 'Geriatria / Funcionais',
};

const PROCEDIMENTOS: ProcDef[] = PROCEDIMENTOS_BASE.map((procedimento) => {
  const ui = PROCEDIMENTOS_LEGACY.find((item) => item.id === procedimento.id);
  return {
    id: procedimento.id,
    nome: procedimento.nomeCurto,
    icon: ui?.icon ?? Activity,
    color: ui?.color ?? 'text-gray-400',
    activeColor: ui?.activeColor ?? 'text-white',
    activeBg: ui?.activeBg ?? 'bg-gray-500',
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
  const {
    tipoGuia, convenio, examesSelecionados, procedimentosSelecionados,
    setExamesSelecionados, setJustificativa, setPaciente, toggleProcedimento
  } = useAppStore();

  const isLab = mode ? mode === 'exames' : tipoGuia === 'LABORATORIO';
  const buscaNormalizada = busca.trim().toLowerCase();

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
            {!isLab && procedimentosSelecionados.length > 0 && (
              <span className="bg-emerald-600 text-white text-[10px] rounded-full w-4.5 h-4.5 flex items-center justify-center font-bold">
                {procedimentosSelecionados.length}
              </span>
            )}
          </button>
        </div>
      )}

      <div className="p-5.5">
        {!isLab ? (
          <div>
            {/* Counter & info */}
            <div className="flex items-center justify-between mb-5.5">
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
                      i < procedimentosSelecionados.length ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                ))}
                <span className="text-xs text-neutral-text-muted ml-1 font-semibold">
                  {procedimentosSelecionados.length}/3
                </span>
              </div>
            </div>

            {/* Selected chips */}
            {procedimentosSelecionados.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5.5 p-3.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
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
              </div>
            )}

            {/* Procedure grid — grouped by category */}
            <div className="space-y-5.5">
              {(Object.entries(PROCEDIMENTOS_POR_GRUPO) as [ProcedimentoGrupo, ProcedimentoDef[]][]).map(([grupo, procsDoGrupo]) => {
                const procsUI = procsDoGrupo.map(p => PROCEDIMENTOS.find(u => u.id === p.id)!).filter(Boolean);
                return (
                  <div key={grupo}>
                    <h4 className="text-[10px] font-bold text-neutral-text-muted uppercase tracking-wider mb-3">
                      {GRUPO_LABELS[grupo]}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {procsUI.map((proc) => {
                        const isSelected = procedimentosSelecionados.includes(proc.id);
                        const isFull = procedimentosSelecionados.length >= 3 && !isSelected;
                        const Icon = proc.icon;
                        return (
                          <button
                            key={proc.id}
                            onClick={() => toggleProcedimento(proc.id)}
                            disabled={isFull}
                            title={isFull ? 'Limite de 3 procedimentos atingido' : proc.nome}
                            className={`relative flex flex-col items-center gap-2 p-3.5 rounded-lg border text-center transition-all text-xs font-semibold cursor-pointer
                              ${isSelected
                                ? `${proc.activeBg} ${proc.activeColor} border-transparent font-bold`
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

            {procedimentosSelecionados.length > 0 && (
              <button
                onClick={() => setPaciente({ procedimentosSelecionados: [] })}
                className="mt-4.5 text-xs text-neutral-text-muted hover:text-neutral-text underline transition-colors cursor-pointer"
              >
                Limpar seleção
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

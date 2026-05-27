import { useMemo, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CATEGORIAS_EXAMES, PAINEIS_MARKDOWN } from '../../types';
import { PROCEDIMENTOS as PROCEDIMENTOS_BASE, PROCEDIMENTOS_POR_GRUPO } from '../../data/procedimentos';
import type { ProcedimentoGrupo, ProcedimentoDef } from '../../data/procedimentos';
import { Activity, Stethoscope, Beaker, HeartPulse, ScanFace, FileHeart, Search, Scan, Bone, Disc, X, CheckCircle2, Moon, Ear, Wind, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import type { ElementType } from 'react';

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

  const toggleExame = (exameNome: string) => {
    if (examesSelecionados.includes(exameNome)) {
      setExamesSelecionados(examesSelecionados.filter((e) => e !== exameNome));
    } else {
      setExamesSelecionados([...examesSelecionados, exameNome]);
    }
  };

  const aplicarPainel = (chave: string) => {
    const painel = PAINEIS_MARKDOWN[chave];
    setExamesSelecionados([...new Set(painel.exames)]);
    setJustificativa(painel.justificativa || ''); // Justificativa, não SOAP
  };

  const selecionarCategoria = (exames: string[]) => {
    setExamesSelecionados([...new Set([...examesSelecionados, ...exames])]);
  };

  const limparCategoria = (exames: string[]) => {
    const examesSet = new Set(exames);
    setExamesSelecionados(examesSelecionados.filter((exame) => !examesSet.has(exame)));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
      {/* Tab bar */}
      {!mode && (
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setPaciente({ tipoGuia: 'LABORATORIO' })}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all ${
              isLab
                ? 'text-blue-700 bg-blue-50 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Beaker size={16} />
            Exames Laboratoriais
          </button>
          <button
            onClick={() => {
              if (isLab) setPaciente({ tipoGuia: 'ECOCARDIOGRAMA' });
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all ${
              !isLab
                ? 'text-emerald-700 bg-emerald-50 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Stethoscope size={16} />
            Procedimentos Eletivos
            {!isLab && procedimentosSelecionados.length > 0 && (
              <span className="bg-emerald-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {procedimentosSelecionados.length}
              </span>
            )}
          </button>
        </div>
      )}

      <div className="p-6">
        {!isLab ? (
          <div>
            {/* Counter & info */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">
                  Selecione até <strong>3 procedimentos</strong> por guia.
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Limitação da guia oficial — emita guias separadas para mais procedimentos.</p>
              </div>
              <div className="flex items-center gap-2">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className={`w-8 h-2 rounded-full transition-all ${
                      i < procedimentosSelecionados.length ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-500 ml-1 font-medium">
                  {procedimentosSelecionados.length}/3
                </span>
              </div>
            </div>

            {/* Selected chips */}
            {procedimentosSelecionados.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
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
                        className="ml-1 hover:text-emerald-200 transition-colors"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Procedure grid — grouped by category */}
            <div className="space-y-4">
              {(Object.entries(PROCEDIMENTOS_POR_GRUPO) as [ProcedimentoGrupo, ProcedimentoDef[]][]).map(([grupo, procsDoGrupo]) => {
                const procsUI = procsDoGrupo.map(p => PROCEDIMENTOS.find(u => u.id === p.id)!).filter(Boolean);
                return (
                  <div key={grupo}>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      {GRUPO_LABELS[grupo]}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
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
                            className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all text-xs font-medium
                              ${isSelected
                                ? `${proc.activeBg} ${proc.activeColor} border-transparent shadow-md scale-[1.02]`
                                : isFull
                                  ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                                  : `border-gray-200 bg-white ${proc.color} hover:border-gray-300 hover:shadow-sm hover:scale-[1.01]`
                              }`}
                          >
                            {isSelected && (
                              <CheckCircle2
                                size={13}
                                className="absolute top-1.5 right-1.5 text-white opacity-90"
                              />
                            )}
                            <div className="relative">
                              <Icon size={20} className={isFull && !isSelected ? 'opacity-30' : ''} />
                              {proc.hasAsterisk && (
                                <span className={`absolute -top-1.5 -right-2 text-xs font-black select-none leading-none ${
                                  isSelected ? 'text-white' : 'text-red-500'
                                }`}>
                                  *
                                </span>
                              )}
                            </div>
                            <span className="leading-tight">{proc.nome}</span>
                            {isFull && (
                              <span className="text-[9px] text-gray-300 font-normal">Limite atingido</span>
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
                className="mt-3 text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
              >
                Limpar seleção
              </button>
            )}

          </div>
        ) : (
          <div>
            {/* Quick panels */}
            <div className="mb-6 bg-blue-50/50 rounded-xl border border-blue-100/80 overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setPaineisExpanded(!paineisExpanded)}
                className="w-full flex items-center justify-between p-3.5 bg-blue-50/70 hover:bg-blue-50 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                    Painéis Rápidos Clínicos
                  </span>
                </div>
                {paineisExpanded ? (
                  <ChevronUp size={14} className="text-blue-500" />
                ) : (
                  <ChevronDown size={14} className="text-blue-500" />
                )}
              </button>
              {paineisExpanded && (
                <div className="p-4 bg-white flex flex-wrap gap-2 border-t border-blue-100/50 animate-fadeIn">
                  {Object.entries(PAINEIS_MARKDOWN).map(([key, painel]) => (
                    <button
                      key={key}
                      onClick={() => aplicarPainel(key)}
                      className="px-3 py-1.5 bg-white text-blue-600 text-xs font-semibold rounded-lg shadow-sm hover:bg-blue-600 hover:text-white transition-colors border border-blue-200 cursor-pointer"
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
                     className="px-3 py-1.5 bg-white text-gray-500 text-xs font-semibold rounded-lg shadow-sm hover:bg-gray-100 transition-colors border border-gray-200 ml-auto cursor-pointer"
                   >
                     Limpar Tudo
                   </button>
                </div>
              )}
            </div>

            <div className="mb-5 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3 items-start">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar exame por nome ou categoria..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                />
              </div>
              <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                <strong className="text-blue-700">{examesSelecionados.length}</strong> exame(s) selecionado(s)
              </div>
            </div>

            {examesSelecionados.length > 0 && (
              <div className="mb-5 flex flex-wrap gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 max-h-[250px] overflow-y-auto">
                {examesSelecionados.map((exame) => (
                  <span key={exame} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm hover:shadow transition-all">
                    {exame}
                    <button
                      type="button"
                      onClick={() => toggleExame(exame)}
                      className="text-blue-300 hover:text-red-500 transition-colors cursor-pointer"
                      title={`Remover ${exame}`}
                    >
                      <X size={12} />
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

            {/* Exam categories */}
            <div className="space-y-4">
              {categoriasFiltradas.map((categoria) => {
                const examesVisiveis = categoria.exames;
                const selectedCount = examesVisiveis.filter(e => examesSelecionados.includes(e.nome)).length;
                const nomesCategoria = examesVisiveis.map((exame) => exame.nome);

                return (
                  <div key={categoria.nome} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 px-4 py-2.5 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide">{categoria.nome}</h3>
                        {selectedCount > 0 && (
                          <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                            {selectedCount}/{examesVisiveis.length}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => selecionarCategoria(nomesCategoria)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                          Selecionar categoria
                        </button>
                        {selectedCount > 0 && (
                          <button
                            type="button"
                            onClick={() => limparCategoria(nomesCategoria)}
                            className="text-xs font-semibold text-gray-400 hover:text-red-500"
                          >
                            Limpar
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="p-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 bg-white">
                      {examesVisiveis.map((exame) => {
                        const isChecked = examesSelecionados.includes(exame.nome);
                        return (
                          <label
                            key={exame.nome}
                            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-xs ${
                              isChecked
                                ? 'bg-blue-50 border-blue-300 text-blue-800 font-semibold shadow-sm'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-blue-50/40'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0"
                              checked={isChecked}
                              onChange={() => toggleExame(exame.nome)}
                            />
                            <span className="leading-tight">{exame.nome}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

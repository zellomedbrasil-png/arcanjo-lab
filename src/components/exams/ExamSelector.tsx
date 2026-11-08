import { useMemo, useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CATEGORIAS_EXAMES } from '../../types';
import { formatExamNameForDisplay } from '../../lib/formatters';
import { findExamPreciso } from '../../services/groqExames';
import ProtocoloExamesCard from './ProtocoloExamesCard';
import PaineisExamesCard from './PaineisExamesCard';
import ExamPastePanel from './ExamPastePanel';
import ProcedimentoSelector from '../procedimentos/ProcedimentoSelector';
import { COBERTURA_META, getCobertura, isForaDoConvenio } from './coberturaExames';
import { formatCategoryName } from './categoriasExames';
import {
  Activity, Stethoscope, Beaker, Search,
  Droplet, FlaskConical, Target, ShieldAlert, Dna, User, Layers, Apple, Flame,
  Heart, TestTube, ClipboardList, Sparkles
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

type AbaExames = 'PROTOCOLO' | 'PAINEIS' | 'CATALOGO' | 'COLAR';
const ABA_KEY = 'arcanjo-exames-aba';
const ABAS_EXAMES: { id: AbaExames; nome: string; Icon: ElementType }[] = [
  { id: 'PROTOCOLO', nome: 'Protocolo', Icon: ClipboardList },
  { id: 'PAINEIS', nome: 'Painéis', Icon: Layers },
  { id: 'CATALOGO', nome: 'Catálogo', Icon: Search },
  { id: 'COLAR', nome: 'Colar / IA', Icon: Sparkles },
];
const lerAba = (): AbaExames => {
  try {
    const v = localStorage.getItem(ABA_KEY);
    if (ABAS_EXAMES.some((a) => a.id === v)) return v as AbaExames;
  } catch {
    // localStorage indisponível
  }
  return 'PROTOCOLO';
};

interface ExamSelectorProps {
  mode?: 'exames' | 'procedimentos';
}

export default function ExamSelector({ mode }: ExamSelectorProps = {}) {
  const [busca, setBusca] = useState('');
  const [aba, setAba] = useState<AbaExames>(lerAba);
  const trocarAba = (nova: AbaExames) => {
    setAba(nova);
    try {
      localStorage.setItem(ABA_KEY, nova);
    } catch {
      // sem localStorage (aba anônima, bloqueio): só não lembra a aba
    }
  };
  const [activeCategory, setActiveCategory] = useState<string>('HEMATOLOGIA E COAGULAÇÃO');

  // Seletores por campo. Este componente renderiza centenas de itens de exame:
  // assinando o store inteiro, digitar o nome do paciente (outro campo do mesmo
  // store) re-renderizava a grade toda a cada tecla.
  const tipoGuia = useAppStore((s) => s.tipoGuia);
  const convenio = useAppStore((s) => s.convenio);
  const examesSelecionados = useAppStore((s) => s.examesSelecionados);
  const procedimentosSelecionados = useAppStore((s) => s.procedimentosSelecionados);
  const procedimentosPersonalizados = useAppStore((s) => s.procedimentosPersonalizados);
  // Ações têm referência estável no zustand — nunca disparam re-render.
  const setExamesSelecionados = useAppStore((s) => s.setExamesSelecionados);
  const setPaciente = useAppStore((s) => s.setPaciente);

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

  const toggleExame = (exameNome: string) => {
    if (examesSelecionados.includes(exameNome)) {
      setExamesSelecionados(examesSelecionados.filter((e) => e !== exameNome));
    } else {
      setExamesSelecionados([...examesSelecionados, exameNome]);
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
          <ProcedimentoSelector />
        ) : (
          <div>
            <div
              role="tablist"
              aria-label="Formas de escolher exames"
              className="mb-5 flex gap-1 overflow-x-auto rounded-lg border border-neutral-border bg-slate-50 p-1 scrollbar-none"
            >
              {ABAS_EXAMES.map(({ id, nome, Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={aba === id}
                  onClick={() => trocarAba(id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                    aba === id ? 'bg-white text-blue-700 shadow-sm' : 'text-neutral-text-muted hover:text-neutral-text'
                  }`}
                >
                  <Icon size={13} />
                  {nome}
                </button>
              ))}
            </div>

            {aba === 'PROTOCOLO' && <ProtocoloExamesCard />}

            {aba === 'COLAR' && <ExamPastePanel />}

            {aba === 'PAINEIS' && <PaineisExamesCard />}

            {aba === 'CATALOGO' && (
              <div>
                <div className="relative mb-5">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-text-muted" />
                  <input
                    type="search"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar exame por nome ou categoria..."
                    className="w-full rounded-lg border border-neutral-border bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>

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
        )}
      </div>
    </div>
  );
}

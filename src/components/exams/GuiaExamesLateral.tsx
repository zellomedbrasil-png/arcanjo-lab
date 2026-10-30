import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Printer, ShieldAlert, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { CATEGORIAS_EXAMES } from '../../data/exames';
import { PRECOS_EXAMES } from '../../data/precosExames';
import { formatExamNameForDisplay } from '../../lib/formatters';
import JustificativaPanel from '../soap/JustificativaPanel';
import { formatCategoryName } from './categoriasExames';
import { CHIP_DOT, CHIP_META, getCobertura, isForaDoConvenio, type CoberturaChip } from './coberturaExames';

const brl = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CATEGORIA_DO_EXAME = new Map(
  CATEGORIAS_EXAMES.flatMap((c) => c.exames.map((e) => [e.nome, { categoria: c.nome, exame: e }] as const))
);
const ORDEM_CATEGORIAS = CATEGORIAS_EXAMES.map((c) => c.nome);
const NAO_CATALOGADOS = 'Não catalogados';

const nomeCategoria = (nome: string) => (nome === NAO_CATALOGADOS ? nome : formatCategoryName(nome));

/**
 * A guia em montagem: exames escolhidos (agrupados pela categoria do catálogo),
 * alertas de cobertura do convênio, justificativa e o botão de gerar.
 * Fica ao lado das abas de escolha; é o único lugar que lista a seleção.
 */
export default function GuiaExamesLateral() {
  const navigate = useNavigate();
  const examesSelecionados = useAppStore((s) => s.examesSelecionados);
  const convenio = useAppStore((s) => s.convenio);
  const pacienteNome = useAppStore((s) => s.pacienteNome);
  const setExamesSelecionados = useAppStore((s) => s.setExamesSelecionados);
  const setPaciente = useAppStore((s) => s.setPaciente);
  const setJustificativa = useAppStore((s) => s.setJustificativa);
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});

  const { grupos, problemas, total, semValor } = useMemo(() => {
    const porGrupo = new Map<string, { nome: string; cob: CoberturaChip; fora: boolean }[]>();
    const problemas: string[] = [];
    let total = 0;
    let semValor = 0;
    for (const nome of examesSelecionados) {
      const info = CATEGORIA_DO_EXAME.get(nome);
      const cob: CoberturaChip = info ? getCobertura(info.exame) : 'NAO_CATALOGADO';
      const fora = cob !== 'NAO_CATALOGADO' && isForaDoConvenio(cob, convenio);
      if (fora) problemas.push(nome);
      const grupo = info?.categoria ?? NAO_CATALOGADOS;
      porGrupo.set(grupo, [...(porGrupo.get(grupo) ?? []), { nome, cob, fora }]);
      const preco = convenio === 'ISSEC' || convenio === 'IPM' ? PRECOS_EXAMES[nome]?.[convenio] : undefined;
      if (preco === undefined) semValor++;
      else total += preco;
    }
    const ordem = (g: string) => (g === NAO_CATALOGADOS ? ORDEM_CATEGORIAS.length : ORDEM_CATEGORIAS.indexOf(g));
    return {
      grupos: [...porGrupo].sort(([a], [b]) => ordem(a) - ordem(b)),
      problemas,
      total,
      semValor,
    };
  }, [examesSelecionados, convenio]);

  const n = examesSelecionados.length;
  // Com poucos exames a lista abre inteira; com protocolo de 35–50, só os grupos.
  const abertoPorPadrao = n <= 12;
  const estaAberto = (g: string) => abertos[g] ?? abertoPorPadrao;
  const remover = (nomes: string[]) => setExamesSelecionados(examesSelecionados.filter((e) => !nomes.includes(e)));
  const temValor = (convenio === 'ISSEC' || convenio === 'IPM') && semValor < n;
  const pronto = n > 0 && pacienteNome.trim() !== '';

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-neutral-border bg-white overflow-hidden">
        <div className="flex items-baseline justify-between gap-3 px-4 py-3 border-b border-neutral-border bg-slate-50/60">
          <h2 className="text-sm font-bold text-neutral-text">
            Guia <span className="font-normal text-neutral-text-muted">· {n} exame{n !== 1 ? 's' : ''}</span>
          </h2>
          <span className="text-[11px] font-semibold text-neutral-text-muted">{convenio}</span>
        </div>

        {n === 0 ? (
          <p className="px-4 py-6 text-xs text-neutral-text-muted text-center">
            Nenhum exame ainda. Monte pelo protocolo, por um painel ou pelo catálogo.
          </p>
        ) : (
          <>
            {problemas.length > 0 && (
              <div className="flex items-start justify-between gap-3 px-4 py-2.5 bg-red-50/70 border-b border-red-100">
                <p className="flex items-start gap-1.5 text-[11px] font-semibold text-red-700">
                  <ShieldAlert size={13} className="shrink-0 mt-px" />
                  {problemas.length} fora da tabela {convenio}
                </p>
                <button
                  type="button"
                  onClick={() => remover(problemas)}
                  className="shrink-0 text-[11px] font-bold text-red-700 underline hover:text-red-900 cursor-pointer"
                >
                  Remover
                </button>
              </div>
            )}

            <div className="max-h-[50vh] overflow-y-auto divide-y divide-slate-100">
              {grupos.map(([grupo, itens]) => {
                const aberto = estaAberto(grupo);
                const comProblema = itens.some((i) => i.fora);
                return (
                  <div key={grupo}>
                    <button
                      type="button"
                      aria-expanded={aberto}
                      onClick={() => setAbertos((a) => ({ ...a, [grupo]: !aberto }))}
                      className="w-full flex items-center justify-between gap-2 px-4 py-2 text-left hover:bg-slate-50 cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 min-w-0 text-xs font-semibold text-neutral-text">
                        {aberto ? <ChevronDown size={12} className="shrink-0 text-neutral-text-muted" /> : <ChevronRight size={12} className="shrink-0 text-neutral-text-muted" />}
                        <span className="truncate">{nomeCategoria(grupo)}</span>
                        {comProblema && <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />}
                      </span>
                      <span className="text-[11px] tabular-nums text-neutral-text-muted">{itens.length}</span>
                    </button>
                    {aberto && (
                      <ul className="pb-1.5">
                        {itens.map((i) => (
                          <li key={i.nome} className="group flex items-center justify-between gap-2 pl-8 pr-3 py-1">
                            <span
                              title={i.fora ? `Fora da tabela ${convenio}. ${CHIP_META[i.cob].title}` : CHIP_META[i.cob].title}
                              className={`flex items-center gap-1.5 min-w-0 text-xs ${i.fora ? 'text-red-700 font-semibold' : 'text-neutral-text'}`}
                            >
                              {(i.fora || i.cob === 'NAO_CATALOGADO') && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${i.fora ? 'bg-red-500' : CHIP_DOT[i.cob]}`} />}
                              <span className="truncate">{formatExamNameForDisplay(i.nome)}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => remover([i.nome])}
                              aria-label={`Remover ${i.nome}`}
                              className="shrink-0 text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-neutral-border text-[11px] text-neutral-text-muted">
              <span>
                {temValor && (
                  <>
                    <strong className="text-neutral-text">R$ {brl(total)}</strong>
                    {semValor > 0 && ` + ${semValor} sem valor`}
                  </>
                )}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Limpar todos os exames selecionados e justificativa?')) {
                    setExamesSelecionados([]);
                    setPaciente({ justificativaExames: '' });
                    setJustificativa('');
                  }
                }}
                className="font-bold hover:text-red-600 transition-colors cursor-pointer"
              >
                Limpar
              </button>
            </div>
          </>
        )}
      </section>

      <JustificativaPanel mode="exames" />

      <div className="hidden lg:block">
        <button
          type="button"
          onClick={() => navigate('/imprimir')}
          disabled={!pronto}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <Printer size={15} />
          Gerar guia
        </button>
        <p className="mt-1.5 text-center text-[11px] text-neutral-text-muted">
          {pronto ? 'Atalho: Ctrl+Enter' : n === 0 ? 'Escolha ao menos um exame.' : 'Falta o nome do paciente.'}
        </p>
      </div>
    </div>
  );
}

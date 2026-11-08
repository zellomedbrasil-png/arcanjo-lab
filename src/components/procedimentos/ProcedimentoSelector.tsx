import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Search, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import {
  GRUPO_LABELS,
  GRUPOS_PROCEDIMENTOS,
  PROCEDIMENTOS,
  type ProcedimentoDef,
  type ProcedimentoGrupo,
} from '../../data/procedimentos';
import { Segmentado } from '../exams/PreviaGuia';

type ConvTabela = 'ISSEC' | 'IPM';
type Filtro = ProcedimentoGrupo | 'TODOS';

const normalizar = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Texto de busca de cada procedimento: nomes, códigos, detalhes e grupo, sem acento. */
const TEXTO_BUSCA = new Map(
  PROCEDIMENTOS.map((p) => [
    p.id,
    normalizar(`${p.nomeCurto} ${p.nome} ${p.codIssec ?? ''} ${p.codIpm ?? ''} ${p.detalhes ?? ''} ${GRUPO_LABELS[p.grupo]}`),
  ])
);

const codigoNo = (p: ProcedimentoDef, conv: ConvTabela) => (conv === 'ISSEC' ? p.codIssec : p.codIpm) ?? '';

// Contagem de uso por procedimento, só neste navegador, para a linha "Mais usados".
const CHAVE_USO = 'arcanjo-lab-procedimentos-uso';
function lerUso(): Record<string, number> {
  try {
    const v = JSON.parse(localStorage.getItem(CHAVE_USO) || '{}');
    return v && typeof v === 'object' ? v : {};
  } catch {
    return {};
  }
}
function salvarUso(uso: Record<string, number>) {
  try {
    localStorage.setItem(CHAVE_USO, JSON.stringify(uso));
  } catch {
    // sem armazenamento: só não lembra
  }
}

function LinhaProcedimento({
  p,
  conv,
  marcado,
  onToggle,
}: {
  p: ProcedimentoDef;
  conv: ConvTabela | null;
  marcado: boolean;
  onToggle: () => void;
}) {
  const codigo = conv ? codigoNo(p, conv) : '';
  const outro: ConvTabela = conv === 'ISSEC' ? 'IPM' : 'ISSEC';
  const codOutro = conv ? codigoNo(p, outro) : '';
  return (
    <label
      title={`${p.nome}\nISSEC: ${p.codIssec || 'sem código'}\nIPM: ${p.codIpm || 'sem código'}`}
      className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 cursor-pointer"
    >
      <input type="checkbox" checked={marcado} onChange={onToggle} className="h-3.5 w-3.5 accent-emerald-600 cursor-pointer" />
      <span className={`min-w-0 flex-1 truncate text-xs ${marcado ? 'font-bold text-emerald-800' : 'font-semibold text-neutral-text'}`}>
        {p.nomeCurto}
      </span>
      {conv ? (
        codigo ? (
          <span className="shrink-0 text-[10px] font-mono tabular-nums text-neutral-text-muted">{codigo}</span>
        ) : (
          <span className="shrink-0 text-[10px] text-neutral-text-muted">
            {codOutro ? (
              <span className="font-mono">
                {outro} {codOutro}
              </span>
            ) : (
              'sem código'
            )}
            <span className="ml-1.5 rounded border border-red-200 bg-red-50 px-1 py-px text-[9px] font-bold uppercase text-red-700">fora</span>
          </span>
        )
      ) : (
        <span className="shrink-0 text-[10px] font-mono tabular-nums text-neutral-text-muted">
          {p.codIssec ? `ISSEC ${p.codIssec}` : ''}
          {p.codIssec && p.codIpm ? ' · ' : ''}
          {p.codIpm ? `IPM ${p.codIpm}` : ''}
        </span>
      )}
    </label>
  );
}

/**
 * Escolha dos procedimentos eletivos, no formato da aba Protocolo: busca sem
 * acento (Enter marca o primeiro), mais usados, filtro por especialidade e lista
 * compacta com o código do convênio do paciente. O que não tem código nesse
 * convênio fica numa seção fechada no fim.
 */
export default function ProcedimentoSelector() {
  const convenio = useAppStore((s) => s.convenio);
  const selecionados = useAppStore((s) => s.procedimentosSelecionados);
  const toggleProcedimento = useAppStore((s) => s.toggleProcedimento);
  const addPersonalizado = useAppStore((s) => s.addProcedimentoPersonalizado);

  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('TODOS');
  const [foraAberto, setForaAberto] = useState(false);
  const [uso, setUso] = useState(lerUso);
  const buscaRef = useRef<HTMLInputElement>(null);

  const conv: ConvTabela | null = convenio === 'ISSEC' || convenio === 'IPM' ? convenio : null;
  const temCodigo = (p: ProcedimentoDef) => !conv || !!codigoNo(p, conv);

  // "/" leva o cursor para a busca, fora de campos de texto.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement | null;
      const digitando = alvo && (alvo.tagName === 'INPUT' || alvo.tagName === 'TEXTAREA' || alvo.isContentEditable);
      if (e.key === '/' && !digitando) {
        e.preventDefault();
        buscaRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const consulta = normalizar(busca.trim());
  const filtrados = useMemo(() => {
    const termos = consulta.split(/\s+/).filter(Boolean);
    return PROCEDIMENTOS.filter((p) => {
      if (filtro !== 'TODOS' && p.grupo !== filtro) return false;
      const texto = TEXTO_BUSCA.get(p.id) ?? '';
      return termos.every((t) => texto.includes(t));
    });
  }, [filtro, consulta]);
  const principais = filtrados.filter(temCodigo);
  const semCodigo = filtrados.filter((p) => !temCodigo(p));
  const buscando = consulta.length > 0;
  const mostrarFora = foraAberto || (buscando && semCodigo.length > 0);

  const grupos = useMemo(() => {
    const m = new Map<ProcedimentoGrupo, ProcedimentoDef[]>();
    for (const p of principais) m.set(p.grupo, [...(m.get(p.grupo) ?? []), p]);
    return GRUPOS_PROCEDIMENTOS.filter((g) => m.has(g)).map((g) => [g, m.get(g)!] as const);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtrados, conv]);

  const maisUsados = useMemo(
    () =>
      Object.entries(uso)
        .filter(([id, n]) => n > 0 && PROCEDIMENTOS.some((p) => p.id === id))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([id]) => PROCEDIMENTOS.find((p) => p.id === id)!),
    [uso]
  );

  const alternar = (id: string) => {
    if (!selecionados.includes(id)) {
      const novo = { ...uso, [id]: (uso[id] ?? 0) + 1 };
      setUso(novo);
      salvarUso(novo);
    }
    toggleProcedimento(id);
  };

  const adicionarPersonalizado = () => {
    const nome = busca.trim();
    if (!nome) return;
    addPersonalizado(nome);
    setBusca('');
  };

  const onEnter = () => {
    const primeiro = principais[0] ?? semCodigo[0];
    if (primeiro) {
      if (!selecionados.includes(primeiro.id)) alternar(primeiro.id);
      setBusca('');
    } else {
      adicionarPersonalizado();
    }
  };

  const contagem = (g: ProcedimentoGrupo) => PROCEDIMENTOS.filter((p) => p.grupo === g && temCodigo(p)).length;
  const opcoesFiltro: { id: Filtro; nome: string }[] = [
    { id: 'TODOS', nome: `Todas (${PROCEDIMENTOS.filter(temCodigo).length})` },
    ...GRUPOS_PROCEDIMENTOS.map((g) => ({ id: g, nome: `${GRUPO_LABELS[g]} (${contagem(g)})` })),
  ];

  const linha = (p: ProcedimentoDef) => (
    <LinhaProcedimento key={p.id} p={p} conv={conv} marcado={selecionados.includes(p.id)} onToggle={() => alternar(p.id)} />
  );

  return (
    <section className="rounded-lg border border-neutral-border bg-white overflow-hidden">
      <div className="space-y-3 px-4 py-3.5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-muted" />
          <input
            ref={buscaRef}
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onEnter();
              } else if (e.key === 'Escape') setBusca('');
            }}
            placeholder="Buscar por nome ou código (Enter marca o primeiro · tecla / para buscar)"
            className="w-full rounded-lg border border-neutral-border bg-white py-2.5 pl-9 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
          />
          {busca && (
            <button
              type="button"
              aria-label="Limpar busca"
              onClick={() => setBusca('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-text-muted hover:text-neutral-text cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {!buscando && maisUsados.length > 0 && (
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-text-muted mb-1.5">Mais usados</span>
            <div className="flex flex-wrap gap-1.5">
              {maisUsados.map((p) => {
                const ativo = selecionados.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => alternar(p.id)}
                    className={`px-3 py-1.5 rounded-md border text-xs font-semibold transition-colors cursor-pointer ${
                      ativo ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-neutral-border text-neutral-text hover:border-emerald-300 hover:bg-emerald-50'
                    }`}
                  >
                    {p.nomeCurto}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <Segmentado<Filtro> rotulo="Especialidade" opcoes={opcoesFiltro} valor={filtro} onChange={setFiltro} />
      </div>

      <div className="max-h-[34rem] overflow-y-auto border-t border-neutral-border divide-y divide-slate-100">
        {grupos.map(([grupo, lista]) => (
          <div key={grupo}>
            <div className="sticky top-0 z-10 flex items-center justify-between bg-slate-50/95 backdrop-blur-sm px-3 py-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-text-muted">{GRUPO_LABELS[grupo]}</span>
              <span className="text-[10px] tabular-nums text-neutral-text-muted">
                {lista.filter((p) => selecionados.includes(p.id)).length}/{lista.length}
              </span>
            </div>
            {lista.map(linha)}
          </div>
        ))}

        {semCodigo.length > 0 && (
          <div>
            <button
              type="button"
              aria-expanded={mostrarFora}
              onClick={() => setForaAberto(!mostrarFora)}
              className="sticky top-0 z-10 w-full flex items-center justify-between bg-slate-100/95 backdrop-blur-sm px-3 py-1.5 text-left cursor-pointer hover:bg-slate-200/70"
            >
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-neutral-text-muted">
                {mostrarFora ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                Sem código no {conv} ({semCodigo.length})
              </span>
              <span className="text-[10px] text-neutral-text-muted">particular ou outra guia</span>
            </button>
            {mostrarFora && semCodigo.map(linha)}
          </div>
        )}

        {filtrados.length === 0 && !buscando && (
          <p className="px-4 py-6 text-center text-xs text-neutral-text-muted">Nenhum procedimento nesta especialidade.</p>
        )}

        {buscando && (
          <button
            type="button"
            onClick={adicionarPersonalizado}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs font-semibold text-indigo-700 hover:bg-indigo-50 cursor-pointer"
          >
            <Plus size={13} />
            {filtrados.length === 0 ? 'Nada encontrado. ' : ''}Adicionar «{busca.trim()}» como procedimento personalizado
          </button>
        )}
      </div>
    </section>
  );
}

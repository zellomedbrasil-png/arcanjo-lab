import { useMemo, useState } from 'react';
import { AlertTriangle, Plus, Search } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { CATEGORIAS_EXAMES } from '../../data/exames';
import { PRECOS_EXAMES } from '../../data/precosExames';
import { ESPECIALIDADES, type ConvenioProtocolo, type TipoConsulta } from '../../data/protocolosExames';
import { lerIdade, montarGuiaExames, type ContextoGuia, type ItemGuia } from '../../utils/montarGuiaExames';
import { formatExamNameForDisplay } from '../../lib/formatters';

const brl = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CATALOGO = CATEGORIAS_EXAMES.flatMap((c) => c.exames);

/** Botões de escolha única, no estilo dos filtros da tela. */
function Segmentado<T extends string>({
  rotulo,
  opcoes,
  valor,
  onChange,
  destaque,
}: {
  rotulo: string;
  opcoes: { id: T; nome: string }[];
  valor: T | null;
  onChange: (v: T) => void;
  destaque?: string;
}) {
  return (
    <div className="min-w-0">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-text-muted mb-1.5">
        {rotulo}
        {destaque && <span className="ml-1.5 normal-case tracking-normal font-semibold text-amber-700">{destaque}</span>}
      </span>
      <div className={`inline-flex flex-wrap rounded-lg border p-0.5 bg-slate-50 ${destaque ? 'border-amber-300' : 'border-neutral-border'}`}>
        {opcoes.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={valor === o.id}
            onClick={() => onChange(o.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              valor === o.id ? 'bg-blue-600 shadow-sm text-white' : 'text-neutral-text-muted hover:text-neutral-text hover:bg-white'
            }`}
          >
            {o.nome}
          </button>
        ))}
      </div>
    </div>
  );
}

function LinhaExame({ item, marcado, onToggle }: { item: ItemGuia; marcado: boolean; onToggle: () => void }) {
  return (
    <label className="flex items-start gap-2.5 px-3 py-2 hover:bg-slate-50 cursor-pointer">
      <input type="checkbox" checked={marcado} onChange={onToggle} className="mt-0.5 h-3.5 w-3.5 accent-blue-600 cursor-pointer" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className={`text-xs font-semibold ${marcado ? 'text-neutral-text' : 'text-neutral-text-muted line-through'}`}>
            {formatExamNameForDisplay(item.exame)}
          </span>
          <span className="shrink-0 text-[10px] tabular-nums text-neutral-text-muted">
            {item.codigo || '—'}
            <span className="inline-block w-14 text-right font-semibold text-neutral-text">
              {item.valor !== undefined ? brl(item.valor) : 's/ valor'}
            </span>
          </span>
        </div>
        {item.substituiu && <p className="text-[10px] text-blue-700 mt-0.5">{item.substituiu.nota}</p>}
        {item.condicional && <p className="text-[10px] text-amber-800 mt-0.5">Quando: {item.condicional}</p>}
        {item.foraDaFaixa && (
          <p className="text-[10px] font-semibold text-amber-800 mt-0.5 flex items-center gap-1">
            <AlertTriangle size={10} className="shrink-0" /> {item.foraDaFaixa}
          </p>
        )}
        {item.nota && <p className="text-[10px] text-neutral-text-muted mt-0.5">{item.nota}</p>}
        {item.alertas.map((a) => (
          <p key={a} className="text-[10px] font-semibold text-red-700 mt-0.5 flex items-center gap-1">
            <AlertTriangle size={10} className="shrink-0" /> {a}
          </p>
        ))}
      </div>
    </label>
  );
}

/**
 * Prévia da guia montada para um contexto. Montada com `key` do contexto: trocar
 * área, consulta, sexo ou convênio recomeça as marcações do zero.
 */
function PreviaGuia({ ctx, idade }: { ctx: ContextoGuia; idade?: number }) {
  const examesSelecionados = useAppStore((s) => s.examesSelecionados);
  const setExamesSelecionados = useAppStore((s) => s.setExamesSelecionados);

  const guia = useMemo(() => montarGuiaExames(ctx, idade), [ctx, idade]);
  const [escolha, setEscolha] = useState<Record<string, boolean>>({});
  const [extras, setExtras] = useState<ItemGuia[]>([]);
  const [busca, setBusca] = useState('');

  const itens = [...guia.itens, ...extras];
  const marcado = (i: ItemGuia) => escolha[i.exame] ?? i.marcado;
  const escolhidos = itens.filter(marcado);
  const total = escolhidos.reduce((s, i) => s + (i.valor ?? 0), 0);
  const semValor = escolhidos.filter((i) => i.valor === undefined).length;

  const grupos = useMemo(() => {
    const m = new Map<string, ItemGuia[]>();
    for (const i of [...guia.itens, ...extras]) m.set(i.grupo, [...(m.get(i.grupo) ?? []), i]);
    return [...m];
  }, [guia, extras]);

  const sugestoes = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (q.length < 2) return [];
    const ja = new Set(itens.map((i) => i.exame));
    return CATALOGO.filter((e) => !ja.has(e.nome) && e.nome.toLowerCase().includes(q)).slice(0, 8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, guia, extras]);

  const adicionar = (nome: string) => {
    const e = CATALOGO.find((x) => x.nome === nome);
    const codigo = e ? (ctx.convenio === 'ISSEC' ? e.codIssec : e.codIpm) : '';
    setExtras((xs) => [
      ...xs,
      {
        exame: nome,
        grupo: 'Adicionados',
        codigo,
        valor: PRECOS_EXAMES[nome]?.[ctx.convenio],
        marcado: true,
        alertas: codigo ? [] : [`Fora da tabela ${ctx.convenio}.`],
      },
    ]);
    setBusca('');
  };

  const nomes = escolhidos.map((i) => i.exame);
  const usar = () => {
    if (examesSelecionados.length && !confirm(`Substituir os ${examesSelecionados.length} exames já selecionados por esta guia (${nomes.length})?`)) return;
    setExamesSelecionados(nomes);
  };
  const somar = () => setExamesSelecionados([...new Set([...examesSelecionados, ...nomes])]);

  return (
    <>
      <div className="max-h-[26rem] overflow-y-auto border-y border-neutral-border divide-y divide-slate-100">
        {grupos.map(([grupo, lista]) => (
          <div key={grupo}>
            <div className="sticky top-0 z-10 flex items-center justify-between bg-slate-50/95 backdrop-blur-sm px-3 py-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-text-muted">{grupo}</span>
              <span className="text-[10px] tabular-nums text-neutral-text-muted">
                {lista.filter(marcado).length}/{lista.length}
              </span>
            </div>
            {lista.map((i) => (
              <LinhaExame
                key={i.exame}
                item={i}
                marcado={marcado(i)}
                onToggle={() => setEscolha((e) => ({ ...e, [i.exame]: !marcado(i) }))}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="relative px-4 pt-3">
        <Search size={13} className="absolute left-7 top-[1.4rem] -translate-y-1/2 text-neutral-text-muted" />
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Adicionar exame do catálogo..."
          className="w-full rounded-lg border border-neutral-border bg-white py-2 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
        />
        {sugestoes.length > 0 && (
          <div className="absolute left-4 right-4 z-20 mt-1 rounded-lg border border-neutral-border bg-white shadow-lg overflow-hidden">
            {sugestoes.map((e) => (
              <button
                key={e.nome}
                type="button"
                onClick={() => adicionar(e.nome)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 text-left text-xs hover:bg-blue-50 cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Plus size={11} className="text-blue-600" />
                  {formatExamNameForDisplay(e.nome)}
                </span>
                <span className="text-[10px] text-neutral-text-muted">
                  {(ctx.convenio === 'ISSEC' ? e.codIssec : e.codIpm) || `fora da tabela ${ctx.convenio}`}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap px-4 py-3">
        <p className="text-xs text-neutral-text">
          <strong className="text-blue-700">{nomes.length}</strong> exames · <strong>R$ {brl(total)}</strong>
          {semValor > 0 && <span className="text-neutral-text-muted"> + {semValor} sem valor</span>}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={somar}
            disabled={!nomes.length}
            className="px-3.5 py-2 rounded-lg border border-blue-200 bg-white text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Somar à seleção
          </button>
          <button
            type="button"
            onClick={usar}
            disabled={!nomes.length}
            className="px-4 py-2 rounded-lg bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Usar esta guia
          </button>
        </div>
      </div>
    </>
  );
}

/**
 * Protocolo de exames: área × consulta × sexo × convênio → guia montada pelos
 * blocos de src/data/protocolosExames.ts, revisável antes de ir para a seleção.
 * Sexo e convênio são os mesmos campos do cadastro do paciente.
 */
export default function ProtocoloExamesCard() {
  const especialidade = useAppStore((s) => s.especialidade);
  const tipoConsulta = useAppStore((s) => s.tipoConsulta);
  const genero = useAppStore((s) => s.genero);
  const convenio = useAppStore((s) => s.convenio);
  const pacienteNome = useAppStore((s) => s.pacienteNome);
  const pacienteIdade = useAppStore((s) => s.pacienteIdade);
  const setPaciente = useAppStore((s) => s.setPaciente);

  const conv: ConvenioProtocolo | null = convenio === 'ISSEC' || convenio === 'IPM' ? convenio : null;
  const ctx = useMemo<ContextoGuia | null>(
    () => (conv ? { area: especialidade, consulta: tipoConsulta, sexo: genero, convenio: conv } : null),
    [especialidade, tipoConsulta, genero, conv]
  );
  const idade = lerIdade(pacienteIdade);

  return (
    <section className="rounded-lg border border-neutral-border bg-white overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 px-4 py-3.5">
        <Segmentado
          rotulo="Área"
          opcoes={ESPECIALIDADES.map((e) => ({ id: e.id, nome: e.nome === 'Gastroenterologia' ? 'Gastro' : e.nome === 'Clínica Médica' ? 'Clínica' : e.nome }))}
          valor={especialidade}
          onChange={(v) => setPaciente({ especialidade: v })}
        />
        <Segmentado<TipoConsulta>
          rotulo="Consulta"
          opcoes={[
            { id: 'PRIMEIRA', nome: '1ª consulta' },
            { id: 'RETORNO', nome: 'Retorno' },
          ]}
          valor={tipoConsulta}
          onChange={(v) => setPaciente({ tipoConsulta: v })}
        />
        <Segmentado<'M' | 'F'>
          rotulo="Sexo"
          opcoes={[
            { id: 'M', nome: 'Masculino' },
            { id: 'F', nome: 'Feminino' },
          ]}
          valor={genero}
          onChange={(v) => setPaciente({ genero: v })}
          destaque={pacienteNome.trim() ? undefined : 'confirme'}
        />
        <Segmentado<ConvenioProtocolo>
          rotulo="Convênio"
          opcoes={[
            { id: 'ISSEC', nome: 'ISSEC' },
            { id: 'IPM', nome: 'IPM' },
          ]}
          valor={conv}
          onChange={(v) => setPaciente({ convenio: v })}
        />
      </div>

      {ctx ? (
        <PreviaGuia key={`${ctx.area}-${ctx.consulta}-${ctx.sexo}-${ctx.convenio}`} ctx={ctx} idade={idade} />
      ) : (
        <p className="px-4 pb-4 text-xs text-neutral-text-muted">
          Os protocolos existem para ISSEC e IPM. Escolha um dos dois para montar a guia.
        </p>
      )}
    </section>
  );
}

import { useState, useMemo } from 'react';
import { AlertTriangle, Search, X, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import {
  MEDICAMENTOS, CANAL_INFO, GRUPO_INFO, CEAF_NOTA_INFORMATIVA, SUS_ALERTAS,
  getMedicamento, normalizar,
  type CanalGratuito, type GrupoMedicamento, type MedicamentoDef,
} from '../../data/medicamentos';
import GuiaPresetCard from './GuiaPresetCard';

/** Filtro ativo: um grupo terapêutico, tudo, ou só os gratuitos na rede pública. */
type Filtro = GrupoMedicamento | 'TODOS' | 'GRATUITOS';

const RECENTES_KEY = 'arcanjo_receita_recentes';
const MAX_RECENTES = 6;

// Ordem e estilos dos grupos de canal na visão "Gratuitos".
// Classes completas — Tailwind não compila classe montada dinamicamente.
const CANAIS_ORDEM: Array<{ canal: CanalGratuito; titulo: string; heading: string; dot: string }> = [
  { canal: 'FP', titulo: 'Farmácia Popular — retire na drogaria com esta receita', heading: 'text-emerald-700', dot: 'bg-emerald-500' },
  { canal: 'CBAF', titulo: 'UBS — retirada na farmácia da unidade', heading: 'text-sky-700', dot: 'bg-sky-500' },
  { canal: 'CEAF', titulo: 'Alto custo — via LME/PCDT', heading: 'text-violet-700', dot: 'bg-violet-500' },
];

/** Grupos presentes no catálogo, na ordem de GRUPO_INFO. */
const GRUPOS_PRESENTES = (Object.keys(GRUPO_INFO) as GrupoMedicamento[])
  .filter((g) => MEDICAMENTOS.some((m) => m.grupo === g));

function lerRecentes(): string[] {
  try {
    const raw = localStorage.getItem(RECENTES_KEY);
    if (!raw) return [];
    const ids: unknown = JSON.parse(raw);
    // Descarta ids que não existem mais no catálogo (medicamento removido/renomeado).
    return Array.isArray(ids)
      ? ids.filter((id): id is string => typeof id === 'string' && !!getMedicamento(id))
      : [];
  } catch {
    return [];
  }
}

export default function GuiaPrescricaoRapida({
  onPrescrever,
}: {
  onPrescrever: (medicamento: MedicamentoDef) => void;
}) {
  const [aberto, setAberto] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('TODOS');
  // SPA client-only: dá para ler o localStorage já na inicialização preguiçosa
  // do useState, sem efeito e sem render em cascata.
  const [recentes, setRecentes] = useState<string[]>(lerRecentes);

  const registrarUso = (medicamento: MedicamentoDef) => {
    const proximos = [medicamento.id, ...recentes.filter((id) => id !== medicamento.id)].slice(0, MAX_RECENTES);
    setRecentes(proximos);
    try {
      localStorage.setItem(RECENTES_KEY, JSON.stringify(proximos));
    } catch {
      // localStorage indisponível (modo privativo) — recentes só não persistem.
    }
    onPrescrever(medicamento);
  };

  const buscando = busca.trim().length > 0;

  const resultados = useMemo(() => {
    const q = normalizar(busca);
    return MEDICAMENTOS.filter((m) => {
      if (filtro === 'GRATUITOS' && !m.gratuito) return false;
      if (filtro !== 'TODOS' && filtro !== 'GRATUITOS' && m.grupo !== filtro) return false;
      if (!q) return true;
      // Casa também contra a marca — digitar "Cozaar" acha losartana.
      return normalizar(`${m.nome} ${m.principioAtivo} ${m.marcaReferencia} ${m.indicacao}`).includes(q);
    });
  }, [busca, filtro]);

  // A visão agrupada por canal só faz sentido no filtro Gratuitos sem busca ativa.
  const visaoCanais = filtro === 'GRATUITOS' && !buscando;

  const recentesMeds = recentes
    .map(getMedicamento)
    .filter((m): m is MedicamentoDef => !!m);

  return (
    <div className="mb-6 bg-gradient-to-br from-indigo-50/20 via-indigo-50/10 to-transparent border border-indigo-100/50 rounded-2xl p-5 shadow-sm">
      {/* ── Cabeçalho ── */}
      <div className="flex justify-between items-center gap-3 mb-4">
        <span className="block text-xs font-bold uppercase text-indigo-700 tracking-wider">
          Guia Clínico de Prescrição Rápida
        </span>
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          className="flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-gray-800 transition-colors"
        >
          {aberto ? 'Recolher' : `Expandir (${MEDICAMENTOS.length})`}
          {aberto ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {aberto && (
        <>
          {/* ── Busca ── */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, princípio ativo, marca (ex: Cozaar) ou indicação..."
              className="w-full pl-9 pr-9 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
            />
            {buscando && (
              <button
                type="button"
                onClick={() => setBusca('')}
                aria-label="Limpar busca"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* ── Filtros por grupo ── */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {([['TODOS', 'Todos'], ['GRATUITOS', 'Gratuitos (SUS)']] as Array<[Filtro, string]>).map(
              ([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFiltro(id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                    filtro === id
                      ? id === 'GRATUITOS'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              )
            )}
            {GRUPOS_PRESENTES.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setFiltro(g)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                  filtro === g
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : 'bg-white border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                {GRUPO_INFO[g]}
              </button>
            ))}
          </div>

          {/* ── Recentes ── */}
          {recentesMeds.length > 0 && !buscando && (
            <div className="mb-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Clock size={11} className="text-gray-400 shrink-0" />
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-500">
                  Usados recentemente
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentesMeds.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => registrarUso(m)}
                    title={`${m.principioAtivo} — ref.: ${m.marcaReferencia}`}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-white border border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-700 transition-all"
                  >
                    {m.nome}
                    {m.tipoRecomendado === 'ESPECIAL' && (
                      <span className="text-[7px] bg-amber-100 text-amber-800 px-1 rounded font-extrabold">2V</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Resultados ── */}
          {resultados.length === 0 ? (
            <p className="text-[11px] text-gray-500 italic py-6 text-center">
              Nenhum medicamento encontrado para “{busca}”.
            </p>
          ) : visaoCanais ? (
            /* Visão agrupada por canal de acesso gratuito */
            <div className="max-h-[340px] overflow-y-auto pr-1 space-y-4">
              {/* Legenda dos canais */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                {CANAIS_ORDEM.map(({ canal, dot }) => (
                  <div key={canal} className="flex items-start gap-1.5 bg-white/70 border border-gray-100 rounded-lg px-2 py-1.5">
                    <span className={`h-2 w-2 rounded-full mt-1 shrink-0 ${dot}`} />
                    <div className="min-w-0">
                      <span className="block text-[9px] font-extrabold uppercase tracking-wider text-gray-700">
                        {CANAL_INFO[canal].rotulo}
                      </span>
                      <span className="block text-[9px] text-gray-500 leading-snug">
                        {CANAL_INFO[canal].descricao}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {CANAIS_ORDEM.map(({ canal, titulo, heading, dot }) => {
                const itens = resultados.filter((m) => m.gratuito?.canal === canal);
                if (itens.length === 0) return null;
                return (
                  <div key={canal}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${dot}`} />
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider ${heading}`}>
                        {titulo} ({itens.length})
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {itens.map((m) => (
                        <GuiaPresetCard key={m.id} medicamento={m} onPrescrever={registrarUso} />
                      ))}
                    </div>
                    {canal === 'CEAF' && (
                      <p className="mt-2 bg-violet-50 border border-violet-100 rounded-lg p-2 text-[10px] text-violet-800 leading-snug">
                        {CEAF_NOTA_INFORMATIVA}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Alertas clínicos e de acesso */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <AlertTriangle size={12} className="text-amber-600 shrink-0" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
                    Atenção — regras de acesso e segurança
                  </span>
                </div>
                <ul className="list-disc pl-4 space-y-1">
                  {SUS_ALERTAS.map((alerta) => (
                    <li key={alerta} className="text-[10px] text-amber-800 leading-snug">
                      {alerta}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            /* Grade simples — busca livre ou filtro por grupo */
            <>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-500">
                  {resultados.length} medicamento{resultados.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
                {resultados.map((m) => (
                  <GuiaPresetCard key={m.id} medicamento={m} onPrescrever={registrarUso} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

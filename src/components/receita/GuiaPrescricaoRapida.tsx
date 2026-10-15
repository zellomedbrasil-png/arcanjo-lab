import { useState, useMemo } from 'react';
import { AlertTriangle, Search, X } from 'lucide-react';
import {
  MEDICAMENTOS, CANAL_INFO, GRUPO_INFO, CEAF_NOTA_INFORMATIVA, SUS_ALERTAS,
  normalizar,
  type CanalGratuito, type GrupoMedicamento, type MedicamentoDef,
} from '../../data/medicamentos';
import { canaisGratuitos } from '../../data/buscaPrescricao';
import GuiaPresetCard from './GuiaPresetCard';

/** Filtro ativo: um grupo terapêutico, tudo, ou só os gratuitos na rede pública. */
type Filtro = GrupoMedicamento | 'TODOS' | 'GRATUITOS';

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

/**
 * Catálogo navegável (aba "Catálogo" da gaveta Explorar): filtros por grupo,
 * visão de gratuitos por canal e cards clicáveis. A busca rápida do dia a dia
 * é a barra de prescrição; aqui é para explorar.
 */
export default function GuiaPrescricaoRapida({
  onPrescrever,
}: {
  onPrescrever: (medicamento: MedicamentoDef, dose: number) => void;
}) {
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('TODOS');
  const registrarUso = onPrescrever;

  const buscando = busca.trim().length > 0;

  const resultados = useMemo(() => {
    const q = normalizar(busca);
    return MEDICAMENTOS.filter((m) => {
      if (filtro === 'GRATUITOS' && canaisGratuitos(m).size === 0) return false;
      if (filtro !== 'TODOS' && filtro !== 'GRATUITOS' && m.grupo !== filtro) return false;
      if (!q) return true;
      // Casa também contra a marca — digitar "Cozaar" acha losartana.
      return normalizar(`${m.nome} ${m.principioAtivo} ${m.marcaReferencia} ${m.indicacao}`).includes(q);
    });
  }, [busca, filtro]);

  // A visão agrupada por canal só faz sentido no filtro Gratuitos sem busca ativa.
  const visaoCanais = filtro === 'GRATUITOS' && !buscando;

  return (
    <div>
          {/* ── Busca ── */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, princípio ativo, marca (ex: Cozaar) ou indicação..."
              className="w-full pl-9 pr-9 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  filtro === g
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : 'bg-white border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                {GRUPO_INFO[g]}
              </button>
            ))}
          </div>

          {/* ── Resultados ── */}
          {resultados.length === 0 ? (
            <p className="text-[11px] text-gray-500 italic py-6 text-center">
              Nenhum medicamento encontrado para “{busca}”.
            </p>
          ) : visaoCanais ? (
            /* Visão agrupada por canal de acesso gratuito */
            <div className="space-y-4">
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
                const itens = resultados.filter((m) => canaisGratuitos(m).has(canal));
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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                {resultados.map((m) => (
                  <GuiaPresetCard key={m.id} medicamento={m} onPrescrever={registrarUso} />
                ))}
              </div>
            </>
          )}
    </div>
  );
}

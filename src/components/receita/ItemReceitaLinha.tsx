import { memo, useState } from 'react';
import { Star, Pencil, Trash2, Loader2, Sparkles, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useReceitaStore } from '../../store/useReceitaStore';
import { useAtalhosReceitaStore, chaveCatalogo } from '../../store/useAtalhosReceitaStore';
import { getMedicamento, CANAL_INFO } from '../../data/medicamentos';
import { dosesDe } from '../../data/buscaPrescricao';
import { REGRAS_MODELO, seloCurto } from '../../data/regrasReceita';
import { infoDoMedicamento } from '../../utils/agruparReceita';
import { quantidadeCalculada } from '../../utils/quantidade';

const DURACOES = ['7 dias', '10 dias', '14 dias', '30 dias', '60 dias', '90 dias', 'Uso contínuo'];

const campoCls =
  'w-full text-sm bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent';

/**
 * Um item da receita em linha compacta: nome, dose, selo, posologia editável
 * direto e chips de duração que recalculam a quantidade. Lê o item direto do
 * store (sem cópia local), então o que entra pela barra, protocolo ou modelo
 * aparece preenchido na hora.
 */
function ItemReceitaLinha({ id, index, onGerarIA }: { id: string; index: number; onGerarIA: (id: string) => void }) {
  const med = useReceitaStore((s) => s.medicamentos.find((m) => m.id === id));
  const updateMedicamento = useReceitaStore((s) => s.updateMedicamento);
  const removeMedicamento = useReceitaStore((s) => s.removeMedicamento);
  const favoritos = useAtalhosReceitaStore((s) => s.favoritos);
  const alternarFavorito = useAtalhosReceitaStore((s) => s.alternarFavorito);
  const [detalhes, setDetalhes] = useState(false);

  if (!med) return null;

  const info = infoDoMedicamento(med);
  const notificacao = !REGRAS_MODELO[info.modelo].imprimeReceita;
  const catalogo = med.catalogoId ? getMedicamento(med.catalogoId) : undefined;
  const doses = catalogo ? dosesDe(catalogo) : [];
  const chaveFav = med.catalogoId ? chaveCatalogo(med.catalogoId, med.apresentacao ?? 0) : '';
  const favorito = !!chaveFav && favoritos.includes(chaveFav);
  const gratuito = doses[med.apresentacao ?? 0]?.gratuito;
  const atualizar = (dados: Parameters<typeof updateMedicamento>[1]) => updateMedicamento(id, dados);

  // Troca de dose: mantém posologia/quantidade que o médico já editou;
  // só substitui o que ainda é o padrão da dose anterior.
  const trocarDose = (i: number) => {
    const anterior = doses[med.apresentacao ?? 0];
    const nova = doses[i];
    if (!nova || !anterior) return;
    atualizar({
      apresentacao: i,
      principioAtivo: nova.principioAtivo,
      formaFarmaceutica: nova.formaFarmaceutica,
      ...(med.posologia === anterior.posologia ? { posologia: nova.posologia } : {}),
      ...(med.quantidade === anterior.quantidade ? { quantidade: nova.quantidade } : {}),
      ...(med.observacoes === anterior.observacoes ? { observacoes: nova.observacoes } : {}),
    });
  };

  const escolherDuracao = (duracao: string) =>
    atualizar({ duracao, quantidade: quantidadeCalculada(med.posologia, duracao, med.quantidade) ?? med.quantidade });

  const selo =
    info.modelo === 'SIMPLES'
      ? info.naoConfirmada ? 'CONFERIR' : ''
      : seloCurto(info);

  return (
    <div
      className={`rounded-xl border bg-white transition-colors ${
        notificacao ? 'border-red-200 bg-red-50/30' : 'border-gray-200 hover:border-indigo-200'
      }`}
    >
      {/* Linha 1: nome, dose, selo, ações */}
      <div className="flex items-start gap-2 px-3 pt-2.5">
        <span className="mt-0.5 w-6 h-6 shrink-0 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-gray-900 uppercase tracking-tight">
              {med.principioAtivo || med.nomeDigitado || 'Sem nome'}
            </span>
            {selo && (
              <span
                title={info.motivo || 'Nome fora da tabela de controle — confira se é controlado ou antimicrobiano.'}
                className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                  notificacao
                    ? 'bg-red-100 border-red-200 text-red-800'
                    : info.modelo === 'SIMPLES'
                    ? 'bg-gray-100 border-gray-200 text-gray-600'
                    : 'bg-amber-100 border-amber-200 text-amber-800'
                }`}
              >
                {selo}
              </span>
            )}
            {gratuito && (
              <span title={CANAL_INFO[gratuito.canal].descricao} className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded border bg-emerald-50 border-emerald-200 text-emerald-700">
                {CANAL_INFO[gratuito.canal].rotulo}
              </span>
            )}
          </div>
          {doses.length > 1 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {doses.map((d, i) => (
                <button
                  key={d.rotulo + i}
                  type="button"
                  onClick={() => trocarDose(i)}
                  className={`px-2 py-1 rounded-md text-xs font-semibold border transition-colors ${
                    (med.apresentacao ?? 0) === i
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'
                  }`}
                >
                  {d.rotulo}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center shrink-0">
          {chaveFav && (
            <button
              type="button"
              onClick={() => alternarFavorito(chaveFav)}
              title={favorito ? 'Tirar dos favoritos' : 'Favoritar esta dose'}
              className="p-2 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50"
            >
              <Star size={16} className={favorito ? 'fill-amber-400 text-amber-500' : ''} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setDetalhes((v) => !v)}
            title="Forma, via, indicação, orientação"
            className={`p-2 rounded-lg hover:bg-gray-100 ${detalhes ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-700'}`}
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={() => removeMedicamento(id)}
            title="Remover"
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {notificacao && (
        <p className="mx-3 mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-700">
          <ShieldAlert size={13} /> {info.rotulo}: não sai como receita — vai a guia para transcrever no talonário.
        </p>
      )}

      {med.carregando ? (
        <p className="px-3 py-3 flex items-center gap-2 text-sm text-indigo-600">
          <Loader2 size={14} className="animate-spin" /> Gerando posologia com IA…
        </p>
      ) : (
        <div className="px-3 pb-3 pt-2 space-y-2">
          {med.erro && (
            <p className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
              <AlertTriangle size={13} /> {med.erro}
            </p>
          )}

          {/* Posologia editável direto — cresce com o texto */}
          <textarea
            value={med.posologia}
            onChange={(e) => atualizar({ posologia: e.target.value })}
            rows={1}
            placeholder="Posologia (ex.: Tomar 1 comprimido de 12 em 12 horas)"
            className={`${campoCls} resize-none leading-snug [field-sizing:content] min-h-[2.25rem]`}
          />

          <div className="flex flex-wrap items-center gap-1.5">
            <input
              value={med.quantidade}
              onChange={(e) => atualizar({ quantidade: e.target.value })}
              placeholder="Quantidade"
              aria-label="Quantidade"
              className={`${campoCls} !w-40`}
            />
            {DURACOES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => escolherDuracao(d)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  med.duracao.toLowerCase() === d.toLowerCase()
                    ? 'bg-indigo-50 border-indigo-400 text-indigo-800'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'
                }`}
              >
                {d === 'Uso contínuo' ? 'contínuo' : d.replace(' dias', 'd')}
              </button>
            ))}
            {!DURACOES.some((d) => d.toLowerCase() === med.duracao.toLowerCase()) && (
              <input
                value={med.duracao}
                onChange={(e) => atualizar({ duracao: e.target.value })}
                placeholder="Duração"
                aria-label="Duração"
                className={`${campoCls} !w-36`}
              />
            )}
          </div>

          {detalhes && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-dashed border-gray-200">
              <label className="sm:col-span-2 text-[11px] font-bold uppercase text-gray-500">
                Nome impresso (DCB + concentração)
                <input value={med.principioAtivo} onChange={(e) => atualizar({ principioAtivo: e.target.value })} className={`${campoCls} mt-1 font-normal normal-case`} />
              </label>
              <label className="text-[11px] font-bold uppercase text-gray-500">
                Forma farmacêutica
                <input value={med.formaFarmaceutica} onChange={(e) => atualizar({ formaFarmaceutica: e.target.value })} className={`${campoCls} mt-1 font-normal normal-case`} />
              </label>
              <label className="text-[11px] font-bold uppercase text-gray-500">
                Via
                <input value={med.uso} onChange={(e) => atualizar({ uso: e.target.value })} className={`${campoCls} mt-1 font-normal normal-case`} />
              </label>
              <label className="sm:col-span-2 text-[11px] font-bold uppercase text-gray-500">
                Indicação (aparece entre parênteses)
                <input value={med.indicacao} onChange={(e) => atualizar({ indicacao: e.target.value })} className={`${campoCls} mt-1 font-normal normal-case`} />
              </label>
              <label className="sm:col-span-2 text-[11px] font-bold uppercase text-gray-500">
                Orientação ao paciente
                <textarea value={med.observacoes} onChange={(e) => atualizar({ observacoes: e.target.value })} rows={1} className={`${campoCls} mt-1 font-normal normal-case resize-none [field-sizing:content]`} />
              </label>
              {info.modelo === 'RCE' && (
                <label className="sm:col-span-2 text-[11px] font-bold uppercase text-gray-500">
                  Justificativa com CID (só se passar de {info.ate6Meses ? '6 meses' : '60 dias'})
                  <input value={med.justificativaLimite ?? ''} onChange={(e) => atualizar({ justificativaLimite: e.target.value })} placeholder="ex.: CID G40 — epilepsia, tratamento contínuo" className={`${campoCls} mt-1 font-normal normal-case`} />
                </label>
              )}
              {!med.catalogoId && (
                <button
                  type="button"
                  onClick={() => onGerarIA(id)}
                  className="sm:col-span-2 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100"
                >
                  <Sparkles size={14} /> Completar posologia com IA
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(ItemReceitaLinha);

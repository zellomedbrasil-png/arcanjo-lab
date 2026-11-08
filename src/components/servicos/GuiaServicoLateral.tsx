import { AlertTriangle, Printer, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { FREQUENCIAS_SERVICO, SERVICO_POR_ID, getServicoNome } from '../../data/servicos';
import { Segmentado } from '../exams/PreviaGuia';
import ServicoJustificativaPanel from './ServicoJustificativaPanel';

/**
 * A guia de terapia em montagem: terapia escolhida, quantidade de sessões e
 * frequência (campos próprios, fora da justificativa: a quantidade sai no QUANT.
 * da guia), justificativa e o botão de gerar.
 */
export default function GuiaServicoLateral({ onGerar }: { onGerar: () => void }) {
  const convenio = useAppStore((s) => s.convenio);
  const pacienteNome = useAppStore((s) => s.pacienteNome);
  const servicosSelecionados = useAppStore((s) => s.servicosSelecionados);
  const sessoes = useAppStore((s) => s.servicoSessoes);
  const frequencia = useAppStore((s) => s.servicoFrequencia);
  const setPaciente = useAppStore((s) => s.setPaciente);
  const setServicosSelecionados = useAppStore((s) => s.setServicosSelecionados);

  const id = servicosSelecionados[0];
  const def = id ? SERVICO_POR_ID[id] : undefined;
  const conv = convenio === 'ISSEC' || convenio === 'IPM' ? convenio : null;
  const teto = def && conv ? (conv === 'ISSEC' ? def.coberturaIssec : def.coberturaIpm) : '';
  const max = def && conv ? def.maxSemana?.[conv] : undefined;
  const vezes = parseInt(frequencia, 10);
  const passouSemana = max !== undefined && Number.isFinite(vezes) && vezes > max;
  const pronto = !!id && pacienteNome.trim() !== '';

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-neutral-border bg-white overflow-hidden">
        <div className="flex items-baseline justify-between gap-3 px-4 py-3 border-b border-neutral-border bg-slate-50/60">
          <h2 className="text-sm font-bold text-neutral-text">Guia de terapia</h2>
          <span className="text-[11px] font-semibold text-neutral-text-muted">{convenio}</span>
        </div>

        {!id ? (
          <p className="px-4 py-6 text-xs text-neutral-text-muted text-center">Nenhuma terapia ainda. Escolha na lista ao lado.</p>
        ) : (
          <div className="space-y-3.5 px-4 py-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-bold text-emerald-800">{getServicoNome(id)}</p>
                {!def && <p className="text-[10px] font-bold uppercase text-indigo-700">fora da lista</p>}
                {teto && <p className="text-[11px] text-neutral-text-muted mt-0.5">Cobertura {conv}: {teto}</p>}
              </div>
              <button
                type="button"
                onClick={() => setServicosSelecionados([])}
                aria-label="Tirar a terapia"
                className="shrink-0 text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
              <div>
                <label htmlFor="servico-sessoes" className="block text-[10px] font-bold uppercase tracking-wider text-neutral-text-muted mb-1.5">
                  Sessões
                </label>
                <input
                  id="servico-sessoes"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={99}
                  value={sessoes}
                  onChange={(e) => setPaciente({ servicoSessoes: e.target.value.replace(/\D/g, '').slice(0, 2) })}
                  placeholder="nº"
                  className="w-20 rounded-lg border border-neutral-border bg-white px-3 py-1.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                />
              </div>
              <Segmentado<string>
                rotulo="Frequência"
                opcoes={FREQUENCIAS_SERVICO.map((f) => ({ id: f, nome: f.replace('/semana', '/sem') }))}
                valor={frequencia || null}
                onChange={(v) => setPaciente({ servicoFrequencia: frequencia === v ? '' : v })}
              />
            </div>
            <p className="text-[11px] text-neutral-text-muted">
              A quantidade sai no campo QUANT. da guia, não na justificativa. Deixe em branco para o convênio definir.
            </p>
            {passouSemana && (
              <p className="flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                <AlertTriangle size={11} className="shrink-0" />O {conv} cobre até {max}x/semana para essa terapia.
              </p>
            )}
          </div>
        )}
      </section>

      <ServicoJustificativaPanel />

      <div className="hidden lg:block">
        <button
          type="button"
          onClick={onGerar}
          disabled={!pronto}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <Printer size={15} />
          Gerar guia
        </button>
        <p className="mt-1.5 text-center text-[11px] text-neutral-text-muted">
          {pronto ? 'Atalho: Ctrl+Enter' : !id ? 'Escolha a terapia.' : 'Falta o nome do paciente.'}
        </p>
      </div>
    </div>
  );
}

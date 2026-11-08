import { useNavigate } from 'react-router-dom';
import { Printer, ShieldAlert, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { getProcedimentoDef } from '../../data/procedimentos';
import JustificativaPanel from '../soap/JustificativaPanel';

// Quantos procedimentos cada convênio aceita numa guia (aviso, sem trava).
const LIMITE: Record<'ISSEC' | 'IPM', number> = { ISSEC: 3, IPM: 5 };

/**
 * A guia de procedimentos em montagem: escolhidos com o código do convênio,
 * limite por guia, alerta do que está fora da tabela, justificativa e o botão
 * de gerar. Fica ao lado da escolha, como a guia de exames.
 */
export default function GuiaProcedimentosLateral() {
  const navigate = useNavigate();
  const selecionados = useAppStore((s) => s.procedimentosSelecionados);
  const personalizados = useAppStore((s) => s.procedimentosPersonalizados);
  const convenio = useAppStore((s) => s.convenio);
  const pacienteNome = useAppStore((s) => s.pacienteNome);
  const toggleProcedimento = useAppStore((s) => s.toggleProcedimento);
  const removePersonalizado = useAppStore((s) => s.removeProcedimentoPersonalizado);
  const setPaciente = useAppStore((s) => s.setPaciente);
  const setJustificativa = useAppStore((s) => s.setJustificativa);

  const conv = convenio === 'ISSEC' || convenio === 'IPM' ? convenio : null;
  const itens = selecionados.map((id) => {
    const def = getProcedimentoDef(id);
    const codigo = def && conv ? (conv === 'ISSEC' ? def.codIssec : def.codIpm) ?? '' : '';
    return { id, nome: def?.nomeCurto ?? id, codigo, fora: !!conv && !codigo };
  });
  const fora = itens.filter((i) => i.fora);
  const n = selecionados.length + personalizados.length;
  const limite = conv ? LIMITE[conv] : undefined;
  const passou = limite !== undefined && n > limite;
  const pronto = n > 0 && pacienteNome.trim() !== '';

  const limpar = () => {
    if (!confirm('Limpar todos os procedimentos selecionados e a justificativa?')) return;
    setPaciente({ procedimentosSelecionados: [], justificativaProcedimentos: '' });
    personalizados.forEach((nome) => removePersonalizado(nome));
    setJustificativa('');
  };

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-neutral-border bg-white overflow-hidden">
        <div className="flex items-baseline justify-between gap-3 px-4 py-3 border-b border-neutral-border bg-slate-50/60">
          <h2 className="text-sm font-bold text-neutral-text">
            Guia <span className="font-normal text-neutral-text-muted">· {n} procedimento{n !== 1 ? 's' : ''}</span>
          </h2>
          <span className={`text-[11px] font-semibold ${passou ? 'text-red-700' : 'text-neutral-text-muted'}`}>
            {limite !== undefined ? `${n}/${limite} no ${conv}` : convenio}
          </span>
        </div>

        {n === 0 ? (
          <p className="px-4 py-6 text-xs text-neutral-text-muted text-center">
            Nenhum procedimento ainda. Busque ou marque na lista ao lado.
          </p>
        ) : (
          <>
            {passou && (
              <p className="flex items-start gap-1.5 px-4 py-2.5 bg-amber-50 border-b border-amber-100 text-[11px] font-semibold text-amber-800">
                <ShieldAlert size={13} className="shrink-0 mt-px" />
                O {conv} aceita até {limite} procedimentos por guia. Divida em mais de uma guia.
              </p>
            )}
            {fora.length > 0 && (
              <div className="flex items-start justify-between gap-3 px-4 py-2.5 bg-red-50/70 border-b border-red-100">
                <p className="flex items-start gap-1.5 text-[11px] font-semibold text-red-700">
                  <ShieldAlert size={13} className="shrink-0 mt-px" />
                  {fora.length} fora da tabela {conv}
                </p>
                <button
                  type="button"
                  onClick={() => fora.forEach((i) => toggleProcedimento(i.id))}
                  className="shrink-0 text-[11px] font-bold text-red-700 underline hover:text-red-900 cursor-pointer"
                >
                  Remover
                </button>
              </div>
            )}

            <ul className="max-h-[40vh] overflow-y-auto divide-y divide-slate-100">
              {itens.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-2 px-4 py-2">
                  <span className={`min-w-0 truncate text-xs ${i.fora ? 'font-semibold text-red-700' : 'text-neutral-text'}`}>{i.nome}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    {conv && (
                      <span className={`text-[10px] font-mono ${i.fora ? 'text-red-600' : 'text-neutral-text-muted'}`}>{i.codigo || 'fora'}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleProcedimento(i.id)}
                      aria-label={`Remover ${i.nome}`}
                      className="text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                </li>
              ))}
              {personalizados.map((nome) => (
                <li key={nome} className="flex items-center justify-between gap-2 px-4 py-2">
                  <span className="min-w-0 truncate text-xs text-neutral-text">{nome}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="rounded border border-indigo-200 bg-indigo-50 px-1 py-px text-[9px] font-bold uppercase text-indigo-700">personalizado</span>
                    <button
                      type="button"
                      onClick={() => removePersonalizado(nome)}
                      aria-label={`Remover ${nome}`}
                      className="text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex justify-end px-4 py-2.5 border-t border-neutral-border text-[11px] text-neutral-text-muted">
              <button type="button" onClick={limpar} className="font-bold hover:text-red-600 transition-colors cursor-pointer">
                Limpar
              </button>
            </div>
          </>
        )}
      </section>

      <JustificativaPanel mode="procedimentos" />

      <div className="hidden lg:block">
        <button
          type="button"
          onClick={() => navigate('/imprimir')}
          disabled={!pronto}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <Printer size={15} />
          Gerar guia
        </button>
        <p className="mt-1.5 text-center text-[11px] text-neutral-text-muted">
          {pronto ? 'Atalho: Ctrl+Enter' : n === 0 ? 'Escolha ao menos um procedimento.' : 'Falta o nome do paciente.'}
        </p>
      </div>
    </div>
  );
}

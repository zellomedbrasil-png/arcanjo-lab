import { Calendar, FileText, Save, Trash2, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { toast } from '../../lib/toast';
import type { ConsultaGravada } from '../../types';

/**
 * Coluna lateral do prontuário: a indicação clínica (mesmo texto da guia de
 * exames) e as últimas consultas salvas. Só lê e grava no store.
 */
export default function ProntuarioLateral() {
  const justificativa = useAppStore((s) => s.justificativa);
  const pacienteNome = useAppStore((s) => s.pacienteNome);
  const queixa = useAppStore((s) => s.queixa);
  const consultasGravadas = useAppStore((s) => s.consultasGravadas);
  const setJustificativa = useAppStore((s) => s.setJustificativa);
  const setPaciente = useAppStore((s) => s.setPaciente);
  const setQueixa = useAppStore((s) => s.setQueixa);
  const gravarConsulta = useAppStore((s) => s.gravarConsulta);
  const removerConsultaGravada = useAppStore((s) => s.removerConsultaGravada);
  const limparConsultasGravadas = useAppStore((s) => s.limparConsultasGravadas);

  const podeSalvar = pacienteNome.trim() !== '' && queixa.trim() !== '';

  const salvar = () => {
    if (gravarConsulta()) toast.success('Consulta salva no histórico!');
    else toast.error('Preencha o nome do paciente e a queixa.');
  };

  const carregar = (c: ConsultaGravada) => {
    setPaciente({ pacienteNome: c.nome });
    setQueixa(c.queixa);
    toast.success(`Consulta de ${c.nome} carregada`);
  };

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-neutral-border bg-white overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-neutral-border bg-slate-50/60">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-neutral-text">
            <FileText size={13} className="text-blue-600" />
            Indicação clínica
          </h2>
          {justificativa && (
            <button
              type="button"
              onClick={() => setJustificativa('')}
              className="text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
              title="Limpar"
            >
              <X size={13} />
            </button>
          )}
        </div>
        <div className="p-3">
          <textarea
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            rows={5}
            placeholder="Gerada pelo botão Indicação ou escrita à mão."
            className="w-full rounded-lg border border-neutral-border text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-y placeholder:text-gray-400 leading-relaxed"
          />
          <p className="mt-1.5 text-[11px] text-neutral-text-muted">Sai impressa na guia.</p>
        </div>
      </section>

      <section className="rounded-lg border border-neutral-border bg-white overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-neutral-border bg-slate-50/60">
          <h2 className="whitespace-nowrap text-sm font-bold text-neutral-text">
            Consultas salvas <span className="font-normal text-neutral-text-muted">· {consultasGravadas.length}</span>
          </h2>
          <button
            type="button"
            onClick={salvar}
            disabled={!podeSalvar}
            title={podeSalvar ? 'Salvar nome e queixa no histórico' : 'Preencha o nome do paciente e a queixa'}
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-neutral-border bg-white px-2.5 py-1 text-xs font-semibold text-neutral-text hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <Save size={12} />
            Salvar
          </button>
        </div>

        {consultasGravadas.length === 0 ? (
          <p className="px-4 py-5 text-xs text-neutral-text-muted text-center">Nenhuma consulta salva.</p>
        ) : (
          <>
            <ul className="max-h-[40vh] overflow-y-auto divide-y divide-slate-100">
              {consultasGravadas.map((c, i) => (
                <li key={`${c.nome}-${c.data}`} className="group flex items-center gap-2 px-4 py-2 hover:bg-slate-50">
                  <button type="button" onClick={() => carregar(c)} className="flex-1 min-w-0 text-left cursor-pointer" title={c.queixa}>
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-semibold text-neutral-text">{c.nome}</span>
                      <span className="flex shrink-0 items-center gap-0.5 text-[10px] text-neutral-text-muted">
                        <Calendar size={10} />
                        {new Date(c.data).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </span>
                    <span className="block truncate text-xs text-neutral-text-muted">{c.queixa}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      removerConsultaGravada(i);
                      toast.success('Registro removido');
                    }}
                    className="shrink-0 rounded p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
                    title="Remover do histórico"
                  >
                    <Trash2 size={12} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex justify-end px-4 py-2 border-t border-neutral-border">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Tem certeza que deseja apagar todo o histórico de consultas gravadas?')) {
                    limparConsultasGravadas();
                    toast.success('Histórico apagado com sucesso');
                  }
                }}
                className="flex items-center gap-1 text-[11px] text-neutral-text-muted hover:text-red-500 transition-colors cursor-pointer"
              >
                <Trash2 size={10} />
                Limpar histórico
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

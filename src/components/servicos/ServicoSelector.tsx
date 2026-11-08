import { useAppStore } from '../../store/useAppStore';
import { GRUPOS_SERVICOS, SERVICOS_POR_GRUPO, SERVICO_REGRAS, SERVICO_POR_ID } from '../../data/servicos';
import type { ServicoDef, ServicoGrupo } from '../../data/servicos';
import { Info, Pencil } from 'lucide-react';

const GRUPO_LABEL: Record<ServicoGrupo, string> = {
  FISIOTERAPIA: 'Fisioterapia',
  FONOAUDIOLOGIA: 'Fonoaudiologia',
  PSICOLOGIA: 'Psicologia',
  NUTRICAO: 'Nutrição',
  TERAPIA_OCUPACIONAL: 'Terapia ocupacional',
  ACUPUNTURA: 'Acupuntura',
};

/**
 * Escolha da terapia (uma por guia), no visual da aba Protocolo: lista compacta
 * por grupo, com a cobertura do convênio do paciente ao lado. Serviço fora da
 * lista vai no campo "Outro serviço". Sessões, frequência e justificativa ficam
 * na guia ao lado.
 */
export default function ServicoSelector() {
  const convenio = useAppStore((s) => s.convenio);
  const servicosSelecionados = useAppStore((s) => s.servicosSelecionados);
  const setServicosSelecionados = useAppStore((s) => s.setServicosSelecionados);

  const regras = convenio === 'ISSEC' ? SERVICO_REGRAS.ISSEC : convenio === 'IPM' ? SERVICO_REGRAS.IPM : null;
  const escolhido = servicosSelecionados[0];
  // Serviço digitado à mão (não faz parte do catálogo). Uma guia = um serviço.
  const servicoCustom = escolhido && !SERVICO_POR_ID[escolhido] ? escolhido : '';

  const cobertura = (s: ServicoDef) => (convenio === 'ISSEC' ? s.coberturaIssec : convenio === 'IPM' ? s.coberturaIpm : '');

  return (
    <section className="rounded-lg border border-neutral-border bg-white overflow-hidden">
      <div className="px-4 py-3.5">
        <p className="text-sm font-semibold text-neutral-text">Terapia</p>
        <p className="text-xs text-neutral-text-muted mt-0.5">Uma por guia. Para outra terapia, gere outra guia.</p>
      </div>

      <div role="radiogroup" aria-label="Terapia" className="border-t border-neutral-border divide-y divide-slate-100">
        {GRUPOS_SERVICOS.map((grupo) => {
          const lista = SERVICOS_POR_GRUPO[grupo];
          if (!lista?.length) return null;
          return (
            <div key={grupo}>
              <div className="bg-slate-50/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-text-muted">
                {GRUPO_LABEL[grupo]}
              </div>
              {lista.map((s) => {
                const ativo = escolhido === s.id;
                const cob = cobertura(s);
                return (
                  <label
                    key={s.id}
                    title={s.nome}
                    className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer ${ativo ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
                  >
                    <input
                      type="radio"
                      name="servico"
                      checked={ativo}
                      onChange={() => setServicosSelecionados([s.id])}
                      onClick={() => ativo && setServicosSelecionados([])}
                      className="h-3.5 w-3.5 accent-emerald-600 cursor-pointer"
                    />
                    <span className={`min-w-0 flex-1 truncate text-xs ${ativo ? 'font-bold text-emerald-800' : 'font-semibold text-neutral-text'}`}>
                      {s.nome}
                    </span>
                    {cob && <span className="hidden sm:block shrink-0 text-[10px] text-neutral-text-muted">{cob}</span>}
                  </label>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="border-t border-neutral-border bg-indigo-50/40 px-4 py-3.5">
        <label htmlFor="servico-outro" className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 mb-2">
          <Pencil size={11} />
          Outro serviço (fora da lista)
        </label>
        <input
          id="servico-outro"
          type="text"
          value={servicoCustom}
          onChange={(e) => setServicosSelecionados(e.target.value.trim() ? [e.target.value] : [])}
          placeholder="Ex.: Drenagem linfática, hidroterapia, RPG, pilates terapêutico..."
          className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 ${
            servicoCustom ? 'border-indigo-400 bg-white' : 'border-indigo-200 bg-white'
          }`}
        />
        <p className="mt-1.5 text-[11px] text-indigo-600/80">
          Substitui a terapia marcada acima. Sai na guia e entra na justificativa da IA.
        </p>
      </div>

      {regras && (
        <details className="border-t border-neutral-border px-4 py-3 text-[11px] text-neutral-text-muted">
          <summary className="flex cursor-pointer items-center gap-1.5 font-semibold text-blue-800">
            <Info size={12} className="shrink-0" />
            Regras do {convenio} para terapias
          </summary>
          <div className="mt-2 space-y-0.5 leading-relaxed">
            <p>Guia: {regras.guia}</p>
            <p>Validade do pedido: {regras.validade}</p>
            <p>Documentos: {regras.documentos}</p>
            <p>Excedente: {regras.excedente}</p>
          </div>
        </details>
      )}
    </section>
  );
}

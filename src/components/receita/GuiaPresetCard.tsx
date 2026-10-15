import { Plus } from 'lucide-react';
import { CANAL_INFO, type CanalGratuito, type MedicamentoDef } from '../../data/medicamentos';
import { REGRAS_MODELO, seloCurto } from '../../data/regrasReceita';
import { dosesDe } from '../../data/buscaPrescricao';

// Classes completas por canal — Tailwind não compila classe montada dinamicamente.
const CANAL_BADGE: Record<CanalGratuito, string> = {
  FP: 'bg-emerald-100 border-emerald-200 text-emerald-800',
  CBAF: 'bg-sky-100 border-sky-200 text-sky-800',
  CEAF: 'bg-violet-100 border-violet-200 text-violet-800',
};

const CANAL_NOTA_TEXTO: Record<CanalGratuito, string> = {
  FP: 'text-emerald-700',
  CBAF: 'text-sky-700',
  CEAF: 'text-violet-700',
};

/**
 * Card do catálogo. Clicar no card prescreve a dose padrão; os chips de dose
 * prescrevem aquela dose direto.
 */
export default function GuiaPresetCard({
  medicamento,
  onPrescrever,
}: {
  medicamento: MedicamentoDef;
  onPrescrever: (medicamento: MedicamentoDef, dose: number) => void;
}) {
  const regra = medicamento.regra;
  const especial = !!regra && regra.modelo !== 'SIMPLES';
  const notificacao = !!regra && !REGRAS_MODELO[regra.modelo].imprimeReceita;
  const gratuito = medicamento.gratuito;
  const doses = dosesDe(medicamento);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onPrescrever(medicamento, 0)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPrescrever(medicamento, 0);
        }
      }}
      className="group flex flex-col justify-between p-3 rounded-xl border border-gray-200 bg-white hover:border-indigo-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all cursor-pointer"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <span className="font-bold text-gray-900 text-sm leading-tight">{medicamento.nome}</span>
          <span className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
            {gratuito && (
              <span
                title={CANAL_INFO[gratuito.canal].descricao}
                className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase border ${CANAL_BADGE[gratuito.canal]}`}
              >
                {CANAL_INFO[gratuito.canal].rotulo}
              </span>
            )}
            {especial && regra && (
              <span
                title={medicamento.motivoEspecial}
                className={`text-[10px] border px-1.5 py-0.5 rounded font-extrabold uppercase ${
                  notificacao ? 'bg-red-100 border-red-200 text-red-800' : 'bg-amber-100 border-amber-200 text-amber-800'
                }`}
              >
                {seloCurto(regra)}
              </span>
            )}
          </span>
        </div>

        <p className="text-xs text-gray-500 mt-0.5">
          {medicamento.principioAtivo} · <span className="text-indigo-500">ref.: {medicamento.marcaReferencia}</span>
        </p>

        <p className="text-xs text-gray-600 mt-1 leading-snug line-clamp-2">{medicamento.posologiaPadrao}</p>

        {gratuito?.nota && (
          <p className={`text-[11px] mt-1 leading-snug font-semibold ${CANAL_NOTA_TEXTO[gratuito.canal]}`}>{gratuito.nota}</p>
        )}
      </div>

      <div className="mt-2 flex items-center gap-1 flex-wrap">
        {doses.length > 1 ? (
          doses.map((d, i) => (
            <button
              key={d.rotulo + i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPrescrever(medicamento, i);
              }}
              className="px-2 py-1 rounded-md text-xs font-semibold border border-gray-200 bg-white text-gray-700 hover:border-indigo-400 hover:text-indigo-700"
            >
              + {d.rotulo}
              {d.gratuito && <span className="ml-1 text-[10px] font-extrabold text-emerald-700">{CANAL_INFO[d.gratuito.canal].rotulo}</span>}
            </button>
          ))
        ) : (
          <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600">
            <Plus size={13} /> Prescrever
          </span>
        )}
        <span className="ml-auto text-[10px] text-gray-400 uppercase font-semibold">{medicamento.uso}</span>
      </div>
    </div>
  );
}

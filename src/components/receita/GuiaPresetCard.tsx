import { Plus } from 'lucide-react';
import { CANAL_INFO, type CanalGratuito, type MedicamentoPreset } from '../../data/medicamentosGuia';

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

export default function GuiaPresetCard({
  preset,
  onPrescrever,
}: {
  preset: MedicamentoPreset;
  onPrescrever: (preset: MedicamentoPreset) => void;
}) {
  const isEspecial = preset.tipoRecomendado === 'ESPECIAL';
  const gratuito = preset.gratuito;

  return (
    <div className="group flex flex-col justify-between p-2.5 rounded-lg border border-gray-200/80 bg-white hover:border-indigo-300 hover:shadow transition-all duration-200">
      <div>
        <div className="flex items-center justify-between gap-1">
          <span className="font-bold text-gray-800 text-xs truncate">
            {preset.nome}
          </span>
          <span className="flex items-center gap-1 shrink-0">
            {gratuito && (
              <span
                title={CANAL_INFO[gratuito.canal].descricao}
                className={`text-[8px] px-1 py-0.5 rounded font-extrabold uppercase border ${CANAL_BADGE[gratuito.canal]}`}
              >
                {CANAL_INFO[gratuito.canal].rotulo}
              </span>
            )}
            {isEspecial && (
              <span className="text-[8px] bg-amber-100 border border-amber-200 px-1 py-0.5 rounded font-extrabold uppercase text-amber-800">
                C344
              </span>
            )}
          </span>
        </div>

        <span className="block text-[9px] text-gray-400 font-semibold truncate mt-0.5">
          {preset.principioAtivo}
        </span>

        <p className="text-[10px] text-gray-500 mt-1 leading-normal font-normal line-clamp-2 italic">
          {preset.explicacao}
        </p>

        {gratuito?.nota && (
          <p className={`text-[9px] mt-1 leading-snug font-semibold ${CANAL_NOTA_TEXTO[gratuito.canal]}`}>
            {gratuito.nota}
          </p>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-dashed border-gray-100 flex items-center justify-between gap-2">
        <span className="text-[8px] text-indigo-500 font-bold bg-indigo-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
          {preset.uso}
        </span>
        <button
          type="button"
          onClick={() => onPrescrever(preset)}
          className="flex items-center gap-0.5 px-2 py-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-md text-[10px] font-bold transition-all shadow-sm group-hover:shadow"
        >
          <Plus size={10} />
          Prescrever
        </button>
      </div>
    </div>
  );
}

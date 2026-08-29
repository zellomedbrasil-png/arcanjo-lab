import { Plus, ShieldAlert, BookOpen } from 'lucide-react';
import { getAtivo, REGULACAO_INFO } from '../../data/ativosManipulados';
import {
  AREA_INFO, EVIDENCIA_INFO, FORMA_INFO, formulaExige2Vias,
  type FormulaManipulada, type NivelEvidencia,
} from '../../data/formulasManipuladas';

// Classes completas por nível — Tailwind não compila classe montada dinamicamente.
const EVIDENCIA_BADGE: Record<NivelEvidencia, string> = {
  ALTA: 'bg-emerald-100 border-emerald-300 text-emerald-800',
  MODERADA: 'bg-amber-100 border-amber-300 text-amber-800',
  BAIXA: 'bg-slate-100 border-slate-300 text-slate-700',
};

export default function FormulaCard({
  formula,
  onUsar,
}: {
  formula: FormulaManipulada;
  onUsar: (f: FormulaManipulada) => void;
}) {
  const duasVias = formulaExige2Vias(formula.componentes);
  const evid = EVIDENCIA_INFO[formula.evidencia];

  return (
    <div className="group flex flex-col justify-between p-3 rounded-xl border border-gray-200/80 bg-white hover:border-indigo-300 hover:shadow transition-all duration-200">
      <div>
        <div className="flex items-start justify-between gap-2">
          <span className="font-bold text-gray-800 text-xs leading-snug">{formula.nome}</span>
          <span className="flex items-center gap-1 shrink-0">
            {duasVias && (
              <span className="flex items-center gap-0.5 text-[8px] bg-amber-100 border border-amber-300 px-1 py-0.5 rounded font-extrabold uppercase text-amber-800">
                <ShieldAlert size={8} />
                2 VIAS
              </span>
            )}
            <span
              title={evid.descricao}
              className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase border ${EVIDENCIA_BADGE[formula.evidencia]}`}
            >
              {formula.evidencia}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[8px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">
            {AREA_INFO[formula.area]}
          </span>
          <span className="text-[8px] font-bold uppercase tracking-wider text-gray-400">
            {FORMA_INFO[formula.forma].rotulo}
          </span>
          {formula.cid10 && (
            <span className="text-[8px] font-semibold text-gray-400">CID {formula.cid10}</span>
          )}
        </div>

        <p className="text-[10px] text-gray-600 mt-1.5 leading-snug">{formula.indicacao}</p>

        {/* Composição resumida — o médico decide pela fórmula, não pelo nome. */}
        <div className="mt-2 pt-2 border-t border-dashed border-gray-100">
          {formula.componentes.map((c, i) => {
            const ativo = getAtivo(c.ativoId);
            const reg = ativo ? REGULACAO_INFO[ativo.regulacao] : null;
            return (
              <div key={`${c.ativoId}-${i}`} className="flex items-baseline gap-1 text-[9.5px]">
                <span className="text-gray-700 truncate">{ativo?.nome ?? c.ativoId}</span>
                {reg?.exige2Vias && <ShieldAlert size={8} className="text-amber-600 shrink-0" />}
                <span className="flex-1 border-b border-dotted border-gray-200 mx-0.5" />
                <span className="font-semibold text-gray-600 whitespace-nowrap">
                  {c.dose} {c.unidade}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-[9.5px] text-gray-500 mt-1.5 italic leading-snug">{formula.posologia}</p>
      </div>

      <div className="mt-2.5 pt-2 border-t border-dashed border-gray-100 flex items-center justify-between gap-2">
        <span
          title={`${formula.racional}\n\nReferências: ${formula.referencias.join(' · ')}`}
          className="flex items-center gap-1 text-[9px] text-gray-400 font-semibold cursor-help"
        >
          <BookOpen size={10} />
          Racional
        </span>
        <button
          type="button"
          onClick={() => onUsar(formula)}
          className="flex items-center gap-0.5 px-2.5 py-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-md text-[10px] font-bold transition-all shadow-sm"
        >
          <Plus size={10} />
          Usar fórmula
        </button>
      </div>
    </div>
  );
}

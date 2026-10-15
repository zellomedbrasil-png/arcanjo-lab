import { AlertTriangle, X } from 'lucide-react';
import { useReceitaStore } from '../../store/useReceitaStore';

/** Alertas de interação e Beers devolvidos pela IA ao interpretar uma lista. */
export default function AlertasIA() {
  const alertas = useReceitaStore((s) => s.alertas);
  const setAlertas = useReceitaStore((s) => s.setAlertas);
  if (!alertas.length) return null;
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase text-amber-800">
          <AlertTriangle size={14} /> Alertas da IA — interações e segurança
        </p>
        <button type="button" onClick={() => setAlertas([])} className="p-1 rounded text-amber-700 hover:bg-amber-100" aria-label="Dispensar alertas">
          <X size={14} />
        </button>
      </div>
      <ul className="list-disc pl-5 space-y-0.5 text-sm text-amber-900">
        {alertas.map((a) => <li key={a}>{a}</li>)}
      </ul>
    </div>
  );
}

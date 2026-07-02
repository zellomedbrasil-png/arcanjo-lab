import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useToastStore, type ToastItem } from '../../lib/toast';

const icons = {
  success: <CheckCircle size={16} className="text-emerald-500 shrink-0" />,
  error: <XCircle size={16} className="text-red-500 shrink-0" />,
  info: <Info size={16} className="text-blue-500 shrink-0" />,
};

const borders = {
  success: 'border-l-emerald-400',
  error: 'border-l-red-400',
  info: 'border-l-blue-400',
};

function Toast({ toast }: { toast: ToastItem }) {
  const remove = useToastStore((s) => s.remove);
  return (
    <div
      className={`flex items-start gap-3 bg-white rounded-xl shadow-lg border border-gray-100 border-l-4 ${borders[toast.type]} px-4 py-3 min-w-64 max-w-sm max-lg:min-w-0 max-lg:w-full max-lg:max-w-none animate-in slide-in-from-right-4 fade-in duration-200`}
    >
      {icons[toast.type]}
      <p className="text-sm text-gray-800 flex-1 leading-snug">{toast.message}</p>
      <button onClick={() => remove(toast.id)} className="text-gray-300 hover:text-gray-500 transition-colors ml-1 shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 max-lg:top-16 max-lg:left-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <Toast toast={t} />
        </div>
      ))}
    </div>
  );
}

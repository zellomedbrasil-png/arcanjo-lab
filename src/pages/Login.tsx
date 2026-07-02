import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-neutral-bg flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm bg-neutral-surface border border-neutral-border rounded-2xl shadow-sm p-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-sm">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight text-neutral-text">Arcanjo.Lab</h1>
            <p className="text-xs text-neutral-text-muted mt-0.5">Prontuário Inteligente · Dr. Roberto Arcanjo — CRM/CE 26.155</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/prontuario')}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          Entrar no sistema
          <ArrowRight size={16} />
        </button>

        <p className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-text-muted">
          <ShieldCheck size={12} className="text-emerald-600" />
          Dados clínicos armazenados localmente neste dispositivo
        </p>
      </div>
    </div>
  );
}

import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, ArrowRight, ShieldCheck, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Destination route if redirected from a protected page
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/prontuario';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Por favor, informe a senha de acesso.');
      return;
    }

    const success = login(password);
    if (success) {
      navigate(from, { replace: true });
    } else {
      setError('Senha incorreta. Acesso negado.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-dvh bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-sm bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl shadow-2xl p-8 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Activity className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display tracking-tight text-white">Arcanjo.Lab</h1>
            <p className="text-xs text-slate-400 mt-1">Prontuário Inteligente · Dr. Roberto Arcanjo</p>
          </div>
        </div>

        {/* Lock Notice */}
        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-850/60 border border-slate-800 rounded-xl text-xs text-slate-300">
          <Lock className="h-4 w-4 text-indigo-400 shrink-0" />
          <span>Acesso protegido por senha do sistema.</span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha..."
                autoFocus
                className="w-full pl-3.5 pr-10 py-3 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1 cursor-pointer"
                title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-950/50 border border-red-800/80 text-red-300 rounded-xl text-xs animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle size={15} className="text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 cursor-pointer"
          >
            Entrar no Sistema
            <ArrowRight size={16} />
          </button>
        </form>

        <p className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
          <ShieldCheck size={12} className="text-emerald-500" />
          Dados clínicos armazenados com segurança local neste dispositivo
        </p>
      </div>
    </div>
  );
}

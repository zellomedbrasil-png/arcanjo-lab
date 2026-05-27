import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FileText, LogOut, Activity, ClipboardList, FolderOpen, Beaker, Stethoscope } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useAppStore } from '../../store/useAppStore';
import { ToastContainer } from '../ui/ToastContainer';

export default function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const setMedico = useAppStore(state => state.setMedico);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMedico(null);
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-neutral-bg max-lg:flex-col">
      {/* Sidebar */}
      <div className="w-64 bg-neutral-surface border-r border-neutral-border flex flex-col no-print max-lg:w-full max-lg:border-r-0 max-lg:border-b">
        <div className="h-16 flex items-center px-6 border-b border-neutral-border max-lg:h-14">
          <Activity className="h-5 w-5 text-primary mr-2.5" />
          <span className="text-lg font-bold font-display text-neutral-text tracking-tight">Arcanjo.Lab</span>
        </div>
        
        <nav className="flex-1 px-3 py-5 space-y-1 max-lg:flex max-lg:gap-2 max-lg:space-y-0 max-lg:overflow-x-auto max-lg:py-3 animate-in fade-in duration-300">
          <NavLink
            to="/prontuario"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                isActive
                  ? 'bg-accent-slate/10 text-accent-slate'
                  : 'text-neutral-text-muted hover:bg-neutral-bg hover:text-neutral-text'
              }`
            }
          >
            <FileText className="mr-3 h-4 w-4 flex-shrink-0" />
            Prontuário
          </NavLink>

          <NavLink
            to="/exames"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                isActive
                  ? 'bg-accent-sky/10 text-accent-sky'
                  : 'text-neutral-text-muted hover:bg-neutral-bg hover:text-neutral-text'
              }`
            }
          >
            <Beaker className="mr-3 h-4 w-4 flex-shrink-0" />
            Exames Laboratoriais
          </NavLink>

          <NavLink
            to="/procedimentos"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                isActive
                  ? 'bg-accent-emerald/10 text-accent-emerald'
                  : 'text-neutral-text-muted hover:bg-neutral-bg hover:text-neutral-text'
              }`
            }
          >
            <Stethoscope className="mr-3 h-4 w-4 flex-shrink-0" />
            Procedimentos Eletivos
          </NavLink>

          <NavLink
            to="/receita"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                isActive
                  ? 'bg-accent-amber/10 text-accent-amber'
                  : 'text-neutral-text-muted hover:bg-neutral-bg hover:text-neutral-text'
              }`
            }
          >
            <ClipboardList className="mr-3 h-4 w-4 flex-shrink-0" />
            Receituário
          </NavLink>

          <NavLink
            to="/documentos"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                isActive
                  ? 'bg-accent-indigo/10 text-accent-indigo'
                  : 'text-neutral-text-muted hover:bg-neutral-bg hover:text-neutral-text'
              }`
            }
          >
            <FolderOpen className="mr-3 h-4 w-4 flex-shrink-0" />
            Documentos
          </NavLink>
        </nav>

        <div className="p-4 border-t border-neutral-border max-lg:hidden">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-semibold text-red-650 rounded-md hover:bg-red-50/50 transition-colors"
          >
            <LogOut className="mr-3 h-4 w-4 flex-shrink-0" />
            Sair
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto print:overflow-visible">
        {children}
      </main>

      <ToastContainer />
    </div>
  );
}

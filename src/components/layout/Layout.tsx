import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FileText, LogOut, Activity, ClipboardList, FolderOpen } from 'lucide-react';
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
    <div className="flex min-h-screen bg-gray-50 max-lg:flex-col">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col no-print max-lg:w-full max-lg:border-r-0 max-lg:border-b">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 max-lg:h-14">
          <Activity className="h-6 w-6 text-blue-600 mr-2" />
          <span className="text-xl font-bold text-gray-900">Arcanjo.Lab</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 max-lg:flex max-lg:gap-2 max-lg:space-y-0 max-lg:overflow-x-auto max-lg:py-3 animate-in fade-in duration-300">
          <NavLink
            to="/novo"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <FileText className="mr-3 h-5 w-5 flex-shrink-0" />
            Prontuário
          </NavLink>

          <NavLink
            to="/receita"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-amber-50 text-amber-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <ClipboardList className="mr-3 h-5 w-5 flex-shrink-0" />
            Receituário
          </NavLink>

          <NavLink
            to="/documentos"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <FolderOpen className="mr-3 h-5 w-5 flex-shrink-0" />
            Documentos
          </NavLink>
        </nav>

        <div className="p-4 border-t border-gray-200 max-lg:hidden">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
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

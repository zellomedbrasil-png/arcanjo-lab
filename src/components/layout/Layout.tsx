import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FileText, LogOut, Activity, ClipboardList, FolderOpen, Beaker, Stethoscope, HeartPulse, Smartphone, X, Settings } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useAppStore } from '../../store/useAppStore';
import { ToastContainer } from '../ui/ToastContainer';
import PairingModal from '../soap/PairingModal';
import SettingsModal from './SettingsModal';
import { SyncService } from '../../services/syncService';
import { callAI, getLastUsedModel } from '../../config/gemini';

import { SYSTEM_PROMPT_SOAP, SYSTEM_PROMPT_JUSTIFICATIVA } from '../soap/SOAPPanel';
import { toast } from '../../lib/toast';
import { cleanSoapMarkdown } from '../../lib/formatters';


export default function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const setMedico = useAppStore(state => state.setMedico);

  const {
    pacienteNome,
    syncRoomCode, syncStatus, setSyncStatus, setIsPairingModalOpen, resetSyncSession,
    quickNotes, setQuickNotes
  } = useAppStore();

  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const syncRef = useRef<SyncService | null>(null);

  // Process mobile transcription in the background
  const handleProcessMobileTranscription = useCallback(async (text: string) => {
    if (!text || !text.trim()) return;
    
    toast.success('Áudio recebido e transcrito com sucesso!');
    
    const state = useAppStore.getState();
    // Append to Quick Notes scratchpad so the doctor doesn't lose anything
    state.setQuickNotes(state.quickNotes ? `${state.quickNotes}\n\n[Transcrição Celular]: ${text}` : `[Transcrição Celular]: ${text}`);
    state.setQueixa(state.queixa.trim() ? `${state.queixa}\n${text}` : text);
    
    if (state.pacienteNome.trim()) {
      state.adicionarConsultaAoHistorico(state.pacienteNome.trim(), text);
    }
  }, []);

  // Helper trigger generators
  const triggerSOAPGeneration = useCallback(async () => {
    const state = useAppStore.getState();
    if (!state.queixa.trim()) {
      toast.error('Não é possível gerar o SOAP sem uma queixa clínica.');
      return;
    }
    toast.info('Gerando nota SOAP em segundo plano...');
    try {
      const isLab = state.tipoGuia === 'LABORATORIO';
      const examesStr = isLab
        ? `Exames laboratoriais: ${state.examesSelecionados.join(', ') || 'nenhum'}`
        : `Procedimento: ${state.procedimentosSelecionados.join(', ') || state.tipoGuia}`;
      
      const context = `Paciente: ${state.pacienteNome || 'não informado'} | Gênero: ${state.genero === 'M' ? 'Masculino' : 'Feminino'}\n${examesStr}\nQueixa clínica: "${state.queixa}"`;

      const content = await callAI({
        prompt: context,
        systemInstruction: SYSTEM_PROMPT_SOAP,
      });
      state.setSoap(cleanSoapMarkdown(content));
      state.setIaModel(getLastUsedModel());
      toast.success('Nota SOAP gerada com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Falha ao gerar SOAP.');
    }
  }, []);

  const triggerJustificativaGeneration = useCallback(async () => {
    const state = useAppStore.getState();
    if (!state.queixa.trim()) {
      toast.error('Não é possível gerar a justificativa sem uma queixa clínica.');
      return;
    }
    toast.info('Gerando justificativa em segundo plano...');
    try {
      const isLab = state.tipoGuia === 'LABORATORIO';
      const examesStr = isLab
        ? `Exames laboratoriais: ${state.examesSelecionados.join(', ') || 'nenhum'}`
        : `Procedimento: ${state.procedimentosSelecionados.join(', ') || state.tipoGuia}`;
      
      const context = `Paciente: ${state.pacienteNome || 'não informado'} | Gênero: ${state.genero === 'M' ? 'Masculino' : 'Feminino'}\n${examesStr}\nQueixa clínica: "${state.queixa}"`;

      const content = await callAI({
        prompt: context,
        systemInstruction: SYSTEM_PROMPT_JUSTIFICATIVA,
      });
      state.setJustificativa(content.toUpperCase());
      state.setIaModel(getLastUsedModel());
      toast.success('Justificativa clínica gerada!');
    } catch (err) {
      console.error(err);
      toast.error('Falha ao gerar justificativa.');
    }
  }, []);

  // Background Sync Listener
  useEffect(() => {
    if (!syncRoomCode) {
      if (syncRef.current) syncRef.current = null;
      return;
    }

    const sync = new SyncService(syncRoomCode);
    syncRef.current = sync;

    console.log(`[LayoutSync] Subscribing to room: ${syncRoomCode}`);
    const unsubscribe = sync.subscribe(
      async (msg) => {
        if (msg.type === 'MOBILE_CONNECTED') {
          const wasWaiting = useAppStore.getState().syncStatus !== 'connected';
          setSyncStatus('connected');
          if (wasWaiting) toast.success('Celular conectado em segundo plano!');
          const latestState = useAppStore.getState();
          await sync.publish({
            type: 'DESKTOP_READY',
            payload: {
              pacienteNome: latestState.pacienteNome
            }
          });
        } else if (msg.type === 'RECORDING_STATUS') {
          if (msg.payload?.isRecording) {
            setSyncStatus('recording');
          } else if (msg.payload?.isTranscribing) {
            setSyncStatus('transcribing');
          } else {
            setSyncStatus('connected');
          }
        } else if (msg.type === 'TRANSCRIPTION_RESULT') {
          setSyncStatus('connected');
          const text = msg.payload?.text || '';
          if (text) {
            await handleProcessMobileTranscription(text);
          }
        } else if (msg.type === 'TRIGGER_AI') {
          // Qualquer mensagem do celular comprova que ele está pareado
          if (useAppStore.getState().syncStatus === 'waiting') {
            setSyncStatus('connected');
          }
          const action = msg.payload?.action;
          if (action === 'SOAP') {
            await triggerSOAPGeneration();
          } else if (action === 'JUSTIFICATIVA') {
            await triggerJustificativaGeneration();
          }
        }
      },
      (err) => {
        console.error('[LayoutSync] Connection error:', err);
        setSyncStatus('waiting');
      }
    );

    return () => {
      unsubscribe();
    };
  }, [syncRoomCode, handleProcessMobileTranscription, triggerSOAPGeneration, triggerJustificativaGeneration, setSyncStatus]);

  // Keep patient name and API key synced to mobile phone in background
  useEffect(() => {
    if (syncStatus !== 'idle' && syncStatus !== 'waiting' && syncRef.current) {
      syncRef.current.publish({
        type: 'PATIENT_SYNC',
        payload: {
          pacienteNome
        }
      });
    }
  }, [pacienteNome, syncStatus]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMedico(null);
    navigate('/login');
  };

  return (
    <div className="flex min-h-dvh bg-neutral-bg max-lg:flex-col">
      {/* Top Header Bar for Mobile */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-neutral-border z-40 flex items-center justify-between px-4 no-print shadow-sm">
        <div className="flex items-center">
          <Activity className="h-5 w-5 text-primary mr-2" />
          <span className="text-md font-bold font-display text-neutral-text tracking-tight">Arcanjo.Lab</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Sync Status Button */}
          <button
            onClick={() => setIsPairingModalOpen(true)}
            className="relative p-2.5 rounded-lg hover:bg-neutral-bg text-neutral-text-muted hover:text-neutral-text cursor-pointer transition-colors"
            title="Sincronização Celular"
          >
            <Smartphone size={20} className={syncStatus !== 'idle' && syncStatus !== 'waiting' ? 'text-accent-indigo' : 'text-neutral-text-muted'} />
            <span className={`absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full border border-white ${
              syncStatus === 'connected' ? 'bg-green-500' :
              syncStatus === 'recording' ? 'bg-red-500 animate-pulse' :
              syncStatus === 'transcribing' ? 'bg-indigo-500 animate-spin border border-t-transparent' :
              syncStatus === 'waiting' ? 'bg-amber-500 animate-pulse' :
              'bg-neutral-border'
            }`} />
          </button>

          {/* Quick Notes Toggle Button */}
          <button
            onClick={() => setIsNotesOpen(!isNotesOpen)}
            className="relative p-2.5 rounded-lg hover:bg-neutral-bg text-neutral-text-muted hover:text-neutral-text cursor-pointer transition-colors"
            title="Bloco de Notas"
          >
            <ClipboardList size={20} className={isNotesOpen ? 'text-accent-indigo' : ''} />
            {quickNotes.trim().length > 0 && (
              <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-accent-indigo rounded-full" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 rounded-lg hover:bg-neutral-bg text-neutral-text-muted hover:text-neutral-text cursor-pointer transition-colors"
            title="Configurações de API"
          >
            <Settings size={20} />
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-lg hover:bg-red-50 text-red-650 cursor-pointer transition-colors"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Sidebar (Desktop only) */}
      <div className="w-64 bg-neutral-surface border-r border-neutral-border flex flex-col no-print max-lg:hidden">
        <div className="h-16 flex items-center gap-3 px-5 border-b border-neutral-border">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-sm shrink-0">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 leading-tight">
            <span className="block text-base font-bold font-display text-neutral-text tracking-tight">Arcanjo.Lab</span>
            <span className="block text-[10px] font-medium text-neutral-text-muted tracking-wide">Prontuário Inteligente</span>
          </div>
        </div>

        {/* Mobile Sync Widget */}
        <div className="mx-3 mt-4 mb-2 p-3 bg-neutral-bg border border-neutral-border rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <Smartphone size={14} className={syncStatus !== 'idle' && syncStatus !== 'waiting' ? 'text-indigo-600' : 'text-neutral-text-muted'} />
              <span className="text-xs font-bold text-neutral-text truncate">Celular</span>
            </div>
            <div className={`h-2 w-2 rounded-full ${
              syncStatus === 'connected' ? 'bg-green-500 animate-pulse' :
              syncStatus === 'recording' ? 'bg-red-500 animate-ping' :
              syncStatus === 'transcribing' ? 'bg-indigo-500 animate-spin border border-t-transparent' :
              syncStatus === 'waiting' ? 'bg-amber-500 animate-pulse' :
              'bg-neutral-border'
            }`} />
          </div>

          {syncStatus === 'idle' ? (
            <button
              onClick={() => setIsPairingModalOpen(true)}
              className="w-full text-center py-1.5 bg-accent-indigo/10 hover:bg-accent-indigo/20 text-accent-indigo text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
            >
              Parear Aparelho
            </button>
          ) : (
            <div className="space-y-1">
              <p className="text-[9px] text-neutral-text-muted font-medium truncate">
                {syncStatus === 'waiting' && `Aguardando... (${syncRoomCode})`}
                {syncStatus === 'connected' && 'Pareado e Pronto'}
                {syncStatus === 'recording' && 'Gravando Áudio...'}
                {syncStatus === 'transcribing' && 'Processando Áudio...'}
              </p>
              <button
                onClick={resetSyncSession}
                className="w-full text-center py-1 text-red-500 hover:bg-red-50 text-[9px] font-semibold rounded transition-colors cursor-pointer"
              >
                Desconectar
              </button>
            </div>
          )}
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-1 animate-in fade-in duration-300 overflow-y-auto">
          <p className="px-3 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-text-muted/70">Atendimento</p>
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
            to="/servicos"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                isActive
                  ? 'bg-accent-emerald/10 text-accent-emerald'
                  : 'text-neutral-text-muted hover:bg-neutral-bg hover:text-neutral-text'
              }`
            }
          >
            <HeartPulse className="mr-3 h-4 w-4 flex-shrink-0" />
            Serviços / Terapias
          </NavLink>

          <p className="px-3 pt-4 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-text-muted/70">Emissão</p>
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

          <p className="px-3 pt-4 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-text-muted/70">Sistema</p>
          {/* Quick Notes Toggle Button */}
          <button
            onClick={() => setIsNotesOpen(!isNotesOpen)}
            className={`w-full flex items-center px-3 py-2 text-sm font-semibold rounded-md transition-colors text-left cursor-pointer ${
              isNotesOpen
                ? 'bg-neutral-border text-neutral-text'
                : 'text-neutral-text-muted hover:bg-neutral-bg hover:text-neutral-text'
            }`}
          >
            <ClipboardList className="mr-3 h-4 w-4 flex-shrink-0" />
            Bloco de Notas
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center px-3 py-2 text-sm font-semibold rounded-md transition-colors text-left text-neutral-text-muted hover:bg-neutral-bg hover:text-neutral-text cursor-pointer"
          >
            <Settings className="mr-3 h-4 w-4 flex-shrink-0" />
            Configurações de API
          </button>
        </nav>

        <div className="p-3 border-t border-neutral-border space-y-1.5">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-neutral-bg border border-neutral-border">
            <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold shrink-0">
              RA
            </div>
            <div className="min-w-0 leading-tight">
              <p className="text-xs font-bold text-neutral-text truncate">Dr. Roberto Arcanjo</p>
              <p className="text-[10px] text-neutral-text-muted">CRM/CE 26.155</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-semibold text-red-650 rounded-md hover:bg-red-50/50 transition-colors cursor-pointer"
          >
            <LogOut className="mr-3 h-4 w-4 flex-shrink-0" />
            Sair
          </button>
        </div>
      </div>

      {/* Backdrop for mobile drawer */}
      {isNotesOpen && (
        <div 
          onClick={() => setIsNotesOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 z-45 no-print animate-in fade-in duration-200"
        />
      )}

      {/* Main Content Area + Bloco de Notas Drawer */}
      <main className="flex-1 flex overflow-y-auto print:overflow-visible relative max-lg:pt-14 max-lg:pb-[calc(3.5rem+env(safe-area-inset-bottom))]">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Collapsible Bloco de Notas Drawer */}
        <div
          className={`bg-neutral-surface border-l border-neutral-border flex flex-col no-print transition-all duration-300 ${
            isNotesOpen ? 'translate-x-0 w-80 max-sm:w-full' : 'translate-x-full w-0 border-l-0'
          } max-lg:fixed max-lg:inset-y-0 max-lg:right-0 max-lg:z-50 max-lg:w-full max-lg:sm:w-80 overflow-hidden`}
        >
          <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-border shrink-0">
            <div className="flex items-center gap-2">
              <ClipboardList size={16} className="text-accent-indigo" />
              <span className="text-sm font-bold text-neutral-text font-display">Bloco de Notas</span>
            </div>
            <button
              onClick={() => setIsNotesOpen(false)}
              className="p-1.5 rounded-full hover:bg-neutral-bg text-neutral-text-muted hover:text-neutral-text cursor-pointer transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 p-4 flex flex-col space-y-3 min-h-0">
            <textarea
              value={quickNotes}
              onChange={(e) => setQuickNotes(e.target.value)}
              className="flex-1 w-full p-3 bg-neutral-bg border border-neutral-border rounded-xl text-sm placeholder:text-neutral-text-muted leading-relaxed outline-none focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo/25 transition-all resize-none font-medium"
              placeholder="Digite anotações rápidas ou rascunhos durante a consulta. Transcrições do celular aparecerão aqui automaticamente..."
            />

            <div className="grid grid-cols-2 gap-2 shrink-0">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(quickNotes);
                  toast.success('Notas copiadas!');
                }}
                disabled={!quickNotes.trim()}
                className="py-2 text-[10px] bg-neutral-bg hover:bg-neutral-border text-neutral-text border border-neutral-border font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Copiar Tudo
              </button>
              <button
                onClick={() => {
                  const currentQueixa = useAppStore.getState().queixa;
                  useAppStore.getState().setQueixa(currentQueixa ? `${currentQueixa}\n\n${quickNotes}` : quickNotes);
                  toast.success('Notas inseridas na queixa!');
                }}
                disabled={!quickNotes.trim()}
                className="py-2 text-[10px] bg-accent-indigo text-white hover:bg-accent-indigo/90 font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Enviar p/ Queixa
              </button>
            </div>
            
            <button
              onClick={() => {
                if (confirm('Deseja limpar as anotações do bloco?')) {
                  setQuickNotes('');
                }
              }}
              disabled={!quickNotes.trim()}
              className="py-1.5 text-[9px] text-red-500 hover:bg-red-50 font-semibold rounded transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed shrink-0"
            >
              Limpar Bloco
            </button>
          </div>
        </div>

        {/* Small floating button when drawer is closed (Desktop only) */}
        {!isNotesOpen && (
          <button
            onClick={() => setIsNotesOpen(true)}
            className="fixed right-6 bottom-6 h-12 w-12 rounded-full bg-accent-indigo text-white flex items-center justify-center shadow-lg shadow-accent-indigo/25 hover:bg-accent-indigo/90 transition-all hover:scale-105 active:scale-95 cursor-pointer no-print z-40 max-lg:hidden"
            title="Abrir Bloco de Notas"
          >
            <ClipboardList size={20} />
          </button>
        )}
      </main>

      {/* Bottom Tab Bar for Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 min-h-14 pb-[env(safe-area-inset-bottom)] bg-white border-t border-neutral-border z-40 flex justify-around items-center px-2 no-print shadow-[0_-2px_10px_rgba(0,0,0,0.035)]">
        <NavLink
          to="/prontuario"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 text-center transition-colors ${
              isActive ? 'text-accent-indigo' : 'text-neutral-text-muted hover:text-neutral-text'
            }`
          }
        >
          <FileText size={18} />
          <span className="text-[10px] font-bold mt-1 font-display">Prontuário</span>
        </NavLink>

        <NavLink
          to="/exames"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 text-center transition-colors ${
              isActive ? 'text-accent-sky' : 'text-neutral-text-muted hover:text-neutral-text'
            }`
          }
        >
          <Beaker size={18} />
          <span className="text-[10px] font-bold mt-1 font-display">Exames</span>
        </NavLink>

        <NavLink
          to="/procedimentos"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 text-center transition-colors ${
              isActive ? 'text-accent-emerald' : 'text-neutral-text-muted hover:text-neutral-text'
            }`
          }
        >
          <Stethoscope size={18} />
          <span className="text-[10px] font-bold mt-1 font-display">Procedim.</span>
        </NavLink>

        <NavLink
          to="/servicos"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 text-center transition-colors ${
              isActive ? 'text-accent-emerald' : 'text-neutral-text-muted hover:text-neutral-text'
            }`
          }
        >
          <HeartPulse size={18} />
          <span className="text-[10px] font-bold mt-1 font-display">Serviços</span>
        </NavLink>

        <NavLink
          to="/receita"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 text-center transition-colors ${
              isActive ? 'text-accent-amber' : 'text-neutral-text-muted hover:text-neutral-text'
            }`
          }
        >
          <ClipboardList size={18} />
          <span className="text-[10px] font-bold mt-1 font-display">Receitas</span>
        </NavLink>

        <NavLink
          to="/documentos"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 text-center transition-colors ${
              isActive ? 'text-accent-indigo' : 'text-neutral-text-muted hover:text-neutral-text'
            }`
          }
        >
          <FolderOpen size={18} />
          <span className="text-[10px] font-bold mt-1 font-display">Documentos</span>
        </NavLink>
      </nav>

      <ToastContainer />
      <PairingModal />
      {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
}

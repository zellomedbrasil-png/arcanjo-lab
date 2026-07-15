import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Convenio, Genero, Medico, TipoGuia, ConsultaGravada } from '../types';
import { publishPatientSync, subscribePatientSync } from './patientSync';
import { useReceitaStore } from './useReceitaStore';

interface AppState {
  medico: Medico | null;
  pacienteNome: string;
  pacienteCpf: string;
  /** Idade em anos, como texto. Vazio = não informada (a IA não deve presumir). */
  pacienteIdade: string;
  numeroBeneficiario: string;
  sadtOperadora: string;
  sadtRegistroAns: string;
  genero: Genero;
  convenio: Convenio;
  tipoGuia: TipoGuia;
  examesSelecionados: string[];
  procedimentosSelecionados: string[];
  procedimentosPersonalizados: string[]; // Exames livres digitados pelo médico
  servicosSelecionados: string[]; // Terapias/serviços (aba Serviços)
  justificativaServicos: string;
  soap: string;
  queixa: string;
  justificativa: string;
  justificativaExames: string;
  justificativaProcedimentos: string;
  lastSavedAt: string | null;
  iaModel: string;
  consultasGravadas: ConsultaGravada[];
  syncRoomCode: string;
  syncStatus: 'idle' | 'waiting' | 'connected' | 'recording' | 'transcribing';
  quickNotes: string;
  isPairingModalOpen: boolean;

  setMedico: (medico: Medico | null) => void;
  setPaciente: (dados: Partial<AppState>) => void;
  toggleExame: (exameNome: string) => void;
  adicionarPainel: (examesPainel: string[]) => void;
  setExamesSelecionados: (exames: string[]) => void;
  toggleProcedimento: (proc: string) => void;
  addProcedimentoPersonalizado: (nome: string) => void;
  removeProcedimentoPersonalizado: (nome: string) => void;
  toggleServico: (id: string) => void;
  setServicosSelecionados: (ids: string[]) => void;
  setJustificativaServicos: (justificativa: string) => void;
  setSoap: (soap: string) => void;
  setQueixa: (queixa: string) => void;
  setJustificativa: (justificativa: string) => void;
  setJustificativaExames: (justificativa: string) => void;
  setJustificativaProcedimentos: (justificativa: string) => void;
  setIaModel: (iaModel: string) => void;
  resetForm: () => void;
  gravarConsulta: () => boolean;
  removerConsultaGravada: (index: number) => void;
  limparConsultasGravadas: () => void;
  adicionarConsultaAoHistorico: (nome: string, queixa: string) => boolean;
  setSyncRoomCode: (code: string) => void;
  setSyncStatus: (status: 'idle' | 'waiting' | 'connected' | 'recording' | 'transcribing') => void;
  setQuickNotes: (notes: string) => void;
  setIsPairingModalOpen: (open: boolean) => void;
  resetSyncSession: () => void;
}

const initialState = {
  pacienteNome: '',
  pacienteCpf: '',
  pacienteIdade: '',
  numeroBeneficiario: '',
  sadtOperadora: '',
  sadtRegistroAns: '',
  genero: 'M' as Genero,
  convenio: 'IPM' as Convenio,  // default
  tipoGuia: 'LABORATORIO' as TipoGuia,
  examesSelecionados: [],
  procedimentosSelecionados: [] as string[],
  procedimentosPersonalizados: [] as string[],
  servicosSelecionados: [] as string[],
  justificativaServicos: '',
  soap: '',
  queixa: '',
  justificativa: '',
  justificativaExames: '',
  justificativaProcedimentos: '',
  lastSavedAt: null,
  iaModel: '',
  syncRoomCode: '',
  syncStatus: 'idle' as 'idle' | 'waiting' | 'connected' | 'recording' | 'transcribing',
  quickNotes: '',
  isPairingModalOpen: false,
};

const touch = () => new Date().toISOString();

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      medico: null,
      ...initialState,
      consultasGravadas: [] as ConsultaGravada[],

      setMedico: (medico) => set({ medico }),
      setPaciente: (dados) => set((state) => {
        const next = { ...state, ...dados, lastSavedAt: touch() };
        publishPatientSync('app', {
          pacienteNome: next.pacienteNome,
          pacienteCpf: next.pacienteCpf,
          pacienteIdade: next.pacienteIdade,
          numeroBeneficiario: next.numeroBeneficiario,
          genero: next.genero,
          convenio: next.convenio,
        });
        return next;
      }),

      toggleExame: (exameNome) => set((state) => {
        const isSelected = state.examesSelecionados.includes(exameNome);
        return {
          examesSelecionados: isSelected
            ? state.examesSelecionados.filter((exame) => exame !== exameNome)
            : [...state.examesSelecionados, exameNome],
          lastSavedAt: touch(),
        };
      }),

      adicionarPainel: (examesPainel) => set((state) => {
        const exames = [...new Set([...state.examesSelecionados, ...examesPainel])];
        return { examesSelecionados: exames, lastSavedAt: touch() };
      }),

      setExamesSelecionados: (exames) => set({ examesSelecionados: exames, lastSavedAt: touch() }),

      toggleProcedimento: (proc) => set((state) => {
        const selected = state.procedimentosSelecionados;
        if (selected.includes(proc)) {
          return { procedimentosSelecionados: selected.filter((item) => item !== proc), lastSavedAt: touch() };
        }
        const total = selected.length + state.procedimentosPersonalizados.length;
        if (total < 3) {
          return { procedimentosSelecionados: [...selected, proc], lastSavedAt: touch() };
        }
        return state;
      }),

      addProcedimentoPersonalizado: (nome) => set((state) => {
        const nomeClean = nome.trim();
        if (!nomeClean) return state;
        if (state.procedimentosPersonalizados.includes(nomeClean)) return state;
        const total = state.procedimentosSelecionados.length + state.procedimentosPersonalizados.length;
        if (total >= 3) return state;
        return { procedimentosPersonalizados: [...state.procedimentosPersonalizados, nomeClean], lastSavedAt: touch() };
      }),

      removeProcedimentoPersonalizado: (nome) => set((state) => ({
        procedimentosPersonalizados: state.procedimentosPersonalizados.filter(n => n !== nome),
        lastSavedAt: touch(),
      })),

      toggleServico: (id) => set((state) => {
        const selected = state.servicosSelecionados;
        if (selected.includes(id)) {
          return { servicosSelecionados: selected.filter((item) => item !== id), lastSavedAt: touch() };
        }
        if (selected.length < 3) {
          return { servicosSelecionados: [...selected, id], lastSavedAt: touch() };
        }
        return state;
      }),
      setServicosSelecionados: (ids) => set({ servicosSelecionados: ids, lastSavedAt: touch() }),
      setJustificativaServicos: (justificativaServicos) => set({ justificativaServicos, lastSavedAt: touch() }),

      setSoap: (soap) => set({ soap, lastSavedAt: touch() }),
      setQueixa: (queixa) => set({ queixa, lastSavedAt: touch() }),
      setJustificativa: (justificativa) => set((state) => {
        const isLab = state.tipoGuia === 'LABORATORIO';
        return {
          justificativa,
          justificativaExames: isLab ? justificativa : state.justificativaExames,
          justificativaProcedimentos: !isLab ? justificativa : state.justificativaProcedimentos,
          lastSavedAt: touch(),
        };
      }),
      setJustificativaExames: (justificativaExames) => set((state) => ({
        justificativaExames,
        justificativa: state.tipoGuia === 'LABORATORIO' ? justificativaExames : state.justificativa,
        lastSavedAt: touch(),
      })),
      setJustificativaProcedimentos: (justificativaProcedimentos) => set((state) => ({
        justificativaProcedimentos,
        justificativa: state.tipoGuia !== 'LABORATORIO' ? justificativaProcedimentos : state.justificativa,
        lastSavedAt: touch(),
      })),
      setIaModel: (iaModel) => set({ iaModel }),

      resetForm: () => {
        set({ ...initialState, procedimentosPersonalizados: [] });
        useReceitaStore.getState().resetReceita();
        publishPatientSync('app', {
          pacienteNome: '',
          pacienteCpf: '',
          pacienteIdade: '',
          numeroBeneficiario: '',
          genero: 'M',
          convenio: 'IPM',
          pacienteEndereco: '',
          pacienteCep: '',
          pacienteCidade: '',
          pacienteUf: '',
          pacienteTelefone: '',
          pacienteDataNascimento: '',
        });
      },

      adicionarConsultaAoHistorico: (nome: string, queixaVal: string) => {
        let success = false;
        set((state) => {
          const n = nome.trim();
          const q = queixaVal.trim();
          if (!n || !q) {
            return state;
          }
          const nova: ConsultaGravada = {
            nome: n,
            queixa: q,
            data: new Date().toISOString(),
          };
          const filtradas = state.consultasGravadas.filter(
            (c) => !(c.nome.toLowerCase() === n.toLowerCase() && c.queixa.toLowerCase() === q.toLowerCase())
          );
          success = true;
          return {
            consultasGravadas: [nova, ...filtradas].slice(0, 10),
            lastSavedAt: touch(),
          };
        });
        return success;
      },

      gravarConsulta: () => {
        const state = get();
        return state.adicionarConsultaAoHistorico(state.pacienteNome, state.queixa);
      },

      removerConsultaGravada: (index: number) => set((state) => ({
        consultasGravadas: state.consultasGravadas.filter((_, i) => i !== index),
        lastSavedAt: touch(),
      })),

      limparConsultasGravadas: () => set({
        consultasGravadas: [],
        lastSavedAt: touch(),
      }),
      setSyncRoomCode: (syncRoomCode) => set({ syncRoomCode }),
      setSyncStatus: (syncStatus) => set({ syncStatus }),
      setQuickNotes: (quickNotes) => set({ quickNotes }),
      setIsPairingModalOpen: (isPairingModalOpen) => set({ isPairingModalOpen }),
      resetSyncSession: () => set({ syncRoomCode: '', syncStatus: 'idle' }),
    }),
    {
      name: 'arcanjo-lab-pedido-draft',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        pacienteNome: state.pacienteNome,
        pacienteCpf: state.pacienteCpf,
        pacienteIdade: state.pacienteIdade,
        numeroBeneficiario: state.numeroBeneficiario,
        sadtOperadora: state.sadtOperadora,
        sadtRegistroAns: state.sadtRegistroAns,
        genero: state.genero,
        convenio: state.convenio,
        tipoGuia: state.tipoGuia,
        examesSelecionados: state.examesSelecionados,
        procedimentosSelecionados: state.procedimentosSelecionados,
        procedimentosPersonalizados: state.procedimentosPersonalizados,
        servicosSelecionados: state.servicosSelecionados,
        justificativaServicos: state.justificativaServicos,
        soap: state.soap,
        queixa: state.queixa,
        justificativa: state.justificativa,
        justificativaExames: state.justificativaExames,
        justificativaProcedimentos: state.justificativaProcedimentos,
        lastSavedAt: state.lastSavedAt,
        iaModel: state.iaModel,
        consultasGravadas: state.consultasGravadas,
        quickNotes: state.quickNotes,
      }),
    }
  )
);

subscribePatientSync((senderId, data) => {
  if (senderId === 'app') return;
  const state = useAppStore.getState();
  const updates: Partial<AppState> = {};
  if (data.pacienteNome !== undefined && data.pacienteNome !== state.pacienteNome) {
    updates.pacienteNome = data.pacienteNome;
  }
  if (data.pacienteCpf !== undefined && data.pacienteCpf !== state.pacienteCpf) {
    updates.pacienteCpf = data.pacienteCpf;
  }
  if (data.pacienteIdade !== undefined && data.pacienteIdade !== state.pacienteIdade) {
    updates.pacienteIdade = data.pacienteIdade;
  }
  if (data.numeroBeneficiario !== undefined && data.numeroBeneficiario !== state.numeroBeneficiario) {
    updates.numeroBeneficiario = data.numeroBeneficiario;
  }
  if (data.genero !== undefined && data.genero !== state.genero) {
    updates.genero = data.genero;
  }
  if (data.convenio !== undefined && data.convenio !== state.convenio) {
    updates.convenio = data.convenio;
  }
  if (Object.keys(updates).length > 0) {
    useAppStore.setState(updates);
  }
});


import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Convenio, Genero, Medico, TipoGuia } from '../types';
import { publishPatientSync, subscribePatientSync } from './patientSync';

interface AppState {
  medico: Medico | null;
  pacienteNome: string;
  pacienteCpf: string;
  numeroBeneficiario: string;
  sadtOperadora: string;
  sadtRegistroAns: string;
  genero: Genero;
  convenio: Convenio;
  tipoGuia: TipoGuia;
  examesSelecionados: string[];
  procedimentosSelecionados: string[];
  soap: string;
  justificativa: string;
  lastSavedAt: string | null;
  iaModel: string;

  setMedico: (medico: Medico | null) => void;
  setPaciente: (dados: Partial<AppState>) => void;
  toggleExame: (exameNome: string) => void;
  adicionarPainel: (examesPainel: string[]) => void;
  setExamesSelecionados: (exames: string[]) => void;
  toggleProcedimento: (proc: string) => void;
  setSoap: (soap: string) => void;
  setJustificativa: (justificativa: string) => void;
  setIaModel: (iaModel: string) => void;
  resetForm: () => void;
}

const initialState = {
  pacienteNome: '',
  pacienteCpf: '',
  numeroBeneficiario: '',
  sadtOperadora: '',
  sadtRegistroAns: '',
  genero: 'M' as Genero,
  convenio: 'IPM' as Convenio,  // default
  tipoGuia: 'LABORATORIO' as TipoGuia,
  examesSelecionados: [],
  procedimentosSelecionados: [] as string[],
  soap: '',
  justificativa: '',
  lastSavedAt: null,
  iaModel: '',
};

const touch = () => new Date().toISOString();

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      medico: null,
      ...initialState,

      setMedico: (medico) => set({ medico }),
      setPaciente: (dados) => set((state) => {
        const next = { ...state, ...dados, lastSavedAt: touch() };
        publishPatientSync('app', {
          pacienteNome: next.pacienteNome,
          pacienteCpf: next.pacienteCpf,
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
        if (selected.length < 3) {
          return { procedimentosSelecionados: [...selected, proc], lastSavedAt: touch() };
        }
        return state;
      }),

      setSoap: (soap) => set({ soap, lastSavedAt: touch() }),
      setJustificativa: (justificativa) => set({ justificativa, lastSavedAt: touch() }),
      setIaModel: (iaModel) => set({ iaModel }),

      resetForm: () => set(initialState),
    }),
    {
      name: 'arcanjo-lab-pedido-draft',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        pacienteNome: state.pacienteNome,
        pacienteCpf: state.pacienteCpf,
        numeroBeneficiario: state.numeroBeneficiario,
        sadtOperadora: state.sadtOperadora,
        sadtRegistroAns: state.sadtRegistroAns,
        genero: state.genero,
        convenio: state.convenio,
        tipoGuia: state.tipoGuia,
        examesSelecionados: state.examesSelecionados,
        procedimentosSelecionados: state.procedimentosSelecionados,
        soap: state.soap,
        justificativa: state.justificativa,
        lastSavedAt: state.lastSavedAt,
        iaModel: state.iaModel,
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


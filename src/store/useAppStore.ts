import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Convenio, Genero, Medico, TipoGuia } from '../types';

interface AppState {
  medico: Medico | null;
  pacienteNome: string;
  pacienteCpf: string;
  genero: Genero;
  convenio: Convenio;
  tipoGuia: TipoGuia;
  examesSelecionados: string[];
  procedimentosSelecionados: string[];
  soap: string;
  justificativa: string;
  lastSavedAt: string | null;

  setMedico: (medico: Medico | null) => void;
  setPaciente: (dados: Partial<AppState>) => void;
  toggleExame: (exameNome: string) => void;
  adicionarPainel: (examesPainel: string[]) => void;
  setExamesSelecionados: (exames: string[]) => void;
  toggleProcedimento: (proc: string) => void;
  setSoap: (soap: string) => void;
  setJustificativa: (justificativa: string) => void;
  resetForm: () => void;
}

const initialState = {
  pacienteNome: '',
  pacienteCpf: '',
  genero: 'M' as Genero,
  convenio: 'IPM' as Convenio,
  tipoGuia: 'LABORATORIO' as TipoGuia,
  examesSelecionados: [],
  procedimentosSelecionados: [] as string[],
  soap: '',
  justificativa: '',
  lastSavedAt: null,
};

const touch = () => new Date().toISOString();

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      medico: null,
      ...initialState,

      setMedico: (medico) => set({ medico }),
      setPaciente: (dados) => set((state) => ({ ...state, ...dados, lastSavedAt: touch() })),

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

      resetForm: () => set(initialState),
    }),
    {
      name: 'arcanjo-lab-pedido-draft',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        pacienteNome: state.pacienteNome,
        pacienteCpf: state.pacienteCpf,
        genero: state.genero,
        convenio: state.convenio,
        tipoGuia: state.tipoGuia,
        examesSelecionados: state.examesSelecionados,
        procedimentosSelecionados: state.procedimentosSelecionados,
        soap: state.soap,
        justificativa: state.justificativa,
        lastSavedAt: state.lastSavedAt,
      }),
    }
  )
);

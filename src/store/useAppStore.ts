import { create } from 'zustand';
import type { Convenio, Genero, Medico, TipoGuia } from '../types';

interface AppState {
  medico: Medico | null;
  pacienteNome: string;
  genero: Genero;
  convenio: Convenio;
  tipoGuia: TipoGuia;
  examesSelecionados: string[];
  procedimentosSelecionados: string[];
  soap: string;          // Nota SOAP completa (uso interno/prontuário)
  justificativa: string; // Indicação Clínica curta para impressão na guia
  
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
  genero: 'M' as Genero,
  convenio: 'IPM' as Convenio,
  tipoGuia: 'LABORATORIO' as TipoGuia,
  examesSelecionados: [],
  procedimentosSelecionados: [] as string[],
  soap: '',
  justificativa: '',
};

export const useAppStore = create<AppState>((set) => ({
  medico: null,
  ...initialState,
  
  setMedico: (medico) => set({ medico }),
  setPaciente: (dados) => set((state) => ({ ...state, ...dados })),
  
  toggleExame: (exameNome) => set((state) => {
    const isSelected = state.examesSelecionados.includes(exameNome);
    if (isSelected) {
      return { examesSelecionados: state.examesSelecionados.filter(e => e !== exameNome) };
    } else {
      return { examesSelecionados: [...state.examesSelecionados, exameNome] };
    }
  }),
  
  adicionarPainel: (examesPainel) => set((state) => {
    const novosExames = [...state.examesSelecionados];
    examesPainel.forEach(exame => {
      if (!novosExames.includes(exame)) {
        novosExames.push(exame);
      }
    });
    return { examesSelecionados: novosExames };
  }),
  
  setExamesSelecionados: (exames) => set({ examesSelecionados: exames }),
  
  toggleProcedimento: (proc) => set((state) => {
    const selected = state.procedimentosSelecionados;
    if (selected.includes(proc)) {
      return { procedimentosSelecionados: selected.filter(p => p !== proc) };
    } else if (selected.length < 3) {
      return { procedimentosSelecionados: [...selected, proc] };
    }
    return state;
  }),
  
  setSoap: (soap) => set({ soap }),
  setJustificativa: (justificativa) => set({ justificativa }),
  
  resetForm: () => set(initialState),
}));

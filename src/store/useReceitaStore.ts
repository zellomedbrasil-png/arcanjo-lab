import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type TipoReceita = 'SIMPLES' | 'ESPECIAL';
export type TipoRecomendado = 'SIMPLES' | 'ESPECIAL' | '';

export interface MedicamentoReceita {
  id: string;
  nomeDigitado: string;
  principioAtivo: string;
  formaFarmaceutica: string;
  posologia: string;
  quantidade: string;
  duracao: string;
  uso: string;
  carregando: boolean;
  erro: string;
  tipoRecomendado: TipoRecomendado;
  motivoEspecial: string;
}

interface ReceitaState {
  tipoReceita: TipoReceita;
  pacienteNome: string;
  pacienteCpf: string;
  pacienteEndereco: string;
  pacienteCep: string;
  pacienteCidade: string;
  pacienteUf: string;
  pacienteTelefone: string;
  local: string;
  data: string;
  medicamentos: MedicamentoReceita[];
  lastSavedAt: string | null;

  setTipoReceita: (tipo: TipoReceita) => void;
  setPacienteReceita: (dados: Partial<ReceitaState>) => void;
  addMedicamento: () => void;
  removeMedicamento: (id: string) => void;
  updateMedicamento: (id: string, dados: Partial<MedicamentoReceita>) => void;
  resetReceita: () => void;
}

const novoMedicamento = (): MedicamentoReceita => ({
  id: crypto.randomUUID(),
  nomeDigitado: '',
  principioAtivo: '',
  formaFarmaceutica: '',
  posologia: '',
  quantidade: '',
  duracao: '',
  uso: 'Uso oral',
  carregando: false,
  erro: '',
  tipoRecomendado: '',
  motivoEspecial: '',
});

const hoje = () => new Date().toLocaleDateString('pt-BR');
const touch = () => new Date().toISOString();

const initialState = {
  tipoReceita: 'SIMPLES' as TipoReceita,
  pacienteNome: '',
  pacienteCpf: '',
  pacienteEndereco: '',
  pacienteCep: '',
  pacienteCidade: 'Fortaleza',
  pacienteUf: 'CE',
  pacienteTelefone: '',
  local: 'Fortaleza-CE',
  data: hoje(),
  medicamentos: [novoMedicamento()],
  lastSavedAt: null,
};

export const useReceitaStore = create<ReceitaState>()(
  persist(
    (set) => ({
      ...initialState,

      setTipoReceita: (tipo) => set({ tipoReceita: tipo, lastSavedAt: touch() }),
      setPacienteReceita: (dados) => set((state) => ({ ...state, ...dados, lastSavedAt: touch() })),

      addMedicamento: () =>
        set((state) => ({
          medicamentos: [...state.medicamentos, novoMedicamento()],
          lastSavedAt: touch(),
        })),

      removeMedicamento: (id) =>
        set((state) => {
          const medicamentos = state.medicamentos.filter((m) => m.id !== id);
          return {
            medicamentos: medicamentos.length > 0 ? medicamentos : [novoMedicamento()],
            lastSavedAt: touch(),
          };
        }),

      updateMedicamento: (id, dados) =>
        set((state) => ({
          medicamentos: state.medicamentos.map((m) =>
            m.id === id ? { ...m, ...dados } : m
          ),
          lastSavedAt: touch(),
        })),

      resetReceita: () =>
        set({ ...initialState, data: hoje(), medicamentos: [novoMedicamento()] }),
    }),
    {
      name: 'arcanjo-lab-receita-draft',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tipoReceita: state.tipoReceita,
        pacienteNome: state.pacienteNome,
        pacienteCpf: state.pacienteCpf,
        pacienteEndereco: state.pacienteEndereco,
        pacienteCep: state.pacienteCep,
        pacienteCidade: state.pacienteCidade,
        pacienteUf: state.pacienteUf,
        pacienteTelefone: state.pacienteTelefone,
        local: state.local,
        data: state.data,
        medicamentos: state.medicamentos.map((medicamento) => ({
          ...medicamento,
          carregando: false,
          erro: '',
        })),
        lastSavedAt: state.lastSavedAt,
      }),
    }
  )
);

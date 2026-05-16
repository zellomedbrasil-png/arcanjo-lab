import { create } from 'zustand';

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
  // Auditoria IA
  tipoRecomendado: TipoRecomendado;
  motivoEspecial: string; // razão pela qual a IA recomenda controle especial
}

interface ReceitaState {
  tipoReceita: TipoReceita;
  pacienteNome: string;
  pacienteCpf: string;
  pacienteRg: string;
  pacienteEndereco: string;
  pacienteCep: string;
  pacienteCidade: string;
  pacienteUf: string;
  pacienteTelefone: string;
  local: string;
  data: string;
  medicamentos: MedicamentoReceita[];

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

const initialState = {
  tipoReceita: 'SIMPLES' as TipoReceita,
  pacienteNome: '',
  pacienteCpf: '',
  pacienteRg: '',
  pacienteEndereco: '',
  pacienteCep: '',
  pacienteCidade: 'Fortaleza',
  pacienteUf: 'CE',
  pacienteTelefone: '',
  local: 'Fortaleza-CE',
  data: hoje(),
  medicamentos: [novoMedicamento()],
};

export const useReceitaStore = create<ReceitaState>((set) => ({
  ...initialState,

  setTipoReceita: (tipo) => set({ tipoReceita: tipo }),
  setPacienteReceita: (dados) => set((state) => ({ ...state, ...dados })),

  addMedicamento: () =>
    set((state) => ({
      medicamentos: [...state.medicamentos, novoMedicamento()],
    })),

  removeMedicamento: (id) =>
    set((state) => ({
      medicamentos: state.medicamentos.filter((m) => m.id !== id),
    })),

  updateMedicamento: (id, dados) =>
    set((state) => ({
      medicamentos: state.medicamentos.map((m) =>
        m.id === id ? { ...m, ...dados } : m
      ),
    })),

  resetReceita: () =>
    set({ ...initialState, data: hoje(), medicamentos: [novoMedicamento()] }),
}));

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Convenio, Genero } from '../types';

export interface PacienteRecente {
  nome: string;
  cpf?: string;
  /** Idade em anos, como texto. Guardada junto do paciente para não vazar a
   *  idade de um paciente anterior ao selecionar um recente. */
  idade?: string;
  genero?: Genero;
  convenio?: Convenio;
  numeroBeneficiario?: string;
  dataNascimento?: string;
  endereco?: string;
  cep?: string;
  cidade?: string;
  uf?: string;
  telefone?: string;
  updatedAt: string;
}

interface RecentPatientsState {
  pacientes: PacienteRecente[];
  adicionarPaciente: (paciente: Omit<PacienteRecente, 'updatedAt'>) => void;
  removerPaciente: (nome: string) => void;
  limparTodos: () => void;
}

export const useRecentPatientsStore = create<RecentPatientsState>()(
  persist(
    (set) => ({
      pacientes: [],

      adicionarPaciente: (paciente) =>
        set((state) => {
          if (!paciente.nome || paciente.nome.trim().length < 3) return state;

          const nomeTrimmed = paciente.nome.trim();
          const cpfTrimmed = paciente.cpf?.trim() || '';

          // Deep clone patients to avoid reference leaks
          const clonedPatients = state.pacientes.map((p) => ({ ...p }));

          // Filter out the existing record of this patient (match by name or CPF if provided)
          const outros = clonedPatients.filter((p) => {
            const matchNome = p.nome.toLowerCase() === nomeTrimmed.toLowerCase();
            const matchCpf = cpfTrimmed && p.cpf && p.cpf.replace(/\D/g, '') === cpfTrimmed.replace(/\D/g, '');
            return !matchNome && !matchCpf;
          });

          // Create the new patient record with current fields merged with any previous ones if found
          const existente = clonedPatients.find((p) => {
            const matchNome = p.nome.toLowerCase() === nomeTrimmed.toLowerCase();
            const matchCpf = cpfTrimmed && p.cpf && p.cpf.replace(/\D/g, '') === cpfTrimmed.replace(/\D/g, '');
            return matchNome || matchCpf;
          });

          const novoPaciente: PacienteRecente = {
            ...existente,
            ...paciente,
            nome: nomeTrimmed,
            cpf: cpfTrimmed || existente?.cpf || '',
            updatedAt: new Date().toISOString(),
          };

          // Put the new/updated patient at the top and limit to 10
          const pacientes = [novoPaciente, ...outros].slice(0, 10);

          return { pacientes };
        }),

      removerPaciente: (nome) =>
        set((state) => ({
          pacientes: state.pacientes.filter((p) => p.nome !== nome),
        })),

      limparTodos: () => set({ pacientes: [] }),
    }),
    {
      name: 'arcanjo-lab-recent-patients',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

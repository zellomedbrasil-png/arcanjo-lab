import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { publishPatientSync, subscribePatientSync } from './patientSync';
import type { UnidadeDose } from '../data/ativosManipulados';
import type { ComponenteFormula, FormaFarmaceutica, FormulaManipulada } from '../data/formulasManipuladas';
import { formulaExige2Vias } from '../data/formulasManipuladas';

export type ModoEntradaManipulado = 'MONTADOR' | 'TEXTO_LIVRE';

/** Uma fórmula já adicionada à receita atual, com componentes editáveis. */
export interface FormulaNaReceita {
  id: string;
  /** Id da fórmula da biblioteca que originou esta, quando houver. */
  origemId?: string;
  nome: string;
  forma: FormaFarmaceutica;
  componentes: ComponenteFormula[];
  quantidade: string;
  posologia: string;
  observacoes: string;
}

interface ManipuladosState {
  pacienteNome: string;
  pacienteCpf: string;
  pacienteEndereco: string;
  pacienteCep: string;
  pacienteCidade: string;
  pacienteUf: string;
  pacienteTelefone: string;
  local: string;
  data: string;

  formulas: FormulaNaReceita[];
  modoEntrada: ModoEntradaManipulado;
  textoLivre: string;
  lastSavedAt: string | null;

  setPacienteManipulado: (dados: Partial<ManipuladosState>) => void;
  addFormulaVazia: () => void;
  addFormulaDaBiblioteca: (formula: FormulaManipulada) => void;
  updateFormula: (id: string, dados: Partial<Omit<FormulaNaReceita, 'id'>>) => void;
  removeFormula: (id: string) => void;
  addComponente: (formulaId: string, componente: ComponenteFormula) => void;
  updateComponente: (formulaId: string, index: number, dados: Partial<ComponenteFormula>) => void;
  removeComponente: (formulaId: string, index: number) => void;
  setModoEntrada: (modo: ModoEntradaManipulado) => void;
  setTextoLivre: (texto: string) => void;
  resetManipulado: () => void;
}

const novaFormula = (): FormulaNaReceita => ({
  id: crypto.randomUUID(),
  nome: '',
  forma: 'CAPSULA',
  componentes: [],
  quantidade: '30 doses',
  posologia: '',
  observacoes: '',
});

const hoje = () => new Date().toLocaleDateString('pt-BR');
const touch = () => new Date().toISOString();

const initialState = {
  pacienteNome: '',
  pacienteCpf: '',
  pacienteEndereco: '',
  pacienteCep: '',
  pacienteCidade: 'Fortaleza',
  pacienteUf: 'CE',
  pacienteTelefone: '',
  local: 'Fortaleza-CE',
  data: hoje(),
  formulas: [] as FormulaNaReceita[],
  modoEntrada: 'MONTADOR' as ModoEntradaManipulado,
  textoLivre: '',
  lastSavedAt: null as string | null,
};

export const useManipuladosStore = create<ManipuladosState>()(
  persist(
    (set) => ({
      ...initialState,

      setPacienteManipulado: (dados) =>
        set((state) => {
          const next = { ...state, ...dados, lastSavedAt: touch() };
          publishPatientSync('manipulados', {
            pacienteNome: next.pacienteNome,
            pacienteCpf: next.pacienteCpf,
            pacienteEndereco: next.pacienteEndereco,
            pacienteCep: next.pacienteCep,
            pacienteCidade: next.pacienteCidade,
            pacienteUf: next.pacienteUf,
            pacienteTelefone: next.pacienteTelefone,
          });
          return next;
        }),

      addFormulaVazia: () =>
        set((state) => ({
          formulas: [...state.formulas, novaFormula()],
          lastSavedAt: touch(),
        })),

      // Traz a fórmula da biblioteca para a receita. Copia os componentes em vez
      // de referenciar, para que editar aqui nunca altere o protocolo original.
      addFormulaDaBiblioteca: (formula) =>
        set((state) => ({
          formulas: [
            ...state.formulas,
            {
              id: crypto.randomUUID(),
              origemId: formula.id,
              nome: formula.nome,
              forma: formula.forma,
              componentes: formula.componentes.map((c) => ({ ...c })),
              quantidade: formula.quantidade,
              posologia: formula.posologia,
              observacoes: '',
            },
          ],
          lastSavedAt: touch(),
        })),

      updateFormula: (id, dados) =>
        set((state) => ({
          formulas: state.formulas.map((f) => (f.id === id ? { ...f, ...dados } : f)),
          lastSavedAt: touch(),
        })),

      removeFormula: (id) =>
        set((state) => ({
          formulas: state.formulas.filter((f) => f.id !== id),
          lastSavedAt: touch(),
        })),

      addComponente: (formulaId, componente) =>
        set((state) => ({
          formulas: state.formulas.map((f) =>
            f.id === formulaId ? { ...f, componentes: [...f.componentes, componente] } : f
          ),
          lastSavedAt: touch(),
        })),

      updateComponente: (formulaId, index, dados) =>
        set((state) => ({
          formulas: state.formulas.map((f) =>
            f.id === formulaId
              ? {
                  ...f,
                  componentes: f.componentes.map((c, i) => (i === index ? { ...c, ...dados } : c)),
                }
              : f
          ),
          lastSavedAt: touch(),
        })),

      removeComponente: (formulaId, index) =>
        set((state) => ({
          formulas: state.formulas.map((f) =>
            f.id === formulaId
              ? { ...f, componentes: f.componentes.filter((_, i) => i !== index) }
              : f
          ),
          lastSavedAt: touch(),
        })),

      setModoEntrada: (modo) => set({ modoEntrada: modo, lastSavedAt: touch() }),
      setTextoLivre: (texto) => set({ textoLivre: texto, lastSavedAt: touch() }),

      resetManipulado: () => {
        set({ ...initialState, data: hoje(), formulas: [] });
        publishPatientSync('manipulados', {
          pacienteNome: '',
          pacienteCpf: '',
          pacienteEndereco: '',
          pacienteCep: '',
          pacienteCidade: 'Fortaleza',
          pacienteUf: 'CE',
          pacienteTelefone: '',
        });
      },
    }),
    {
      name: 'arcanjo-lab-manipulado-draft',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        pacienteNome: state.pacienteNome,
        pacienteCpf: state.pacienteCpf,
        pacienteEndereco: state.pacienteEndereco,
        pacienteCep: state.pacienteCep,
        pacienteCidade: state.pacienteCidade,
        pacienteUf: state.pacienteUf,
        pacienteTelefone: state.pacienteTelefone,
        local: state.local,
        formulas: state.formulas,
        modoEntrada: state.modoEntrada,
        textoLivre: state.textoLivre,
        lastSavedAt: state.lastSavedAt,
      }),
    }
  )
);

/**
 * Número de vias da receita, DERIVADO dos componentes — nunca digitado.
 * Basta um ativo C1/C5 em qualquer fórmula para a receita inteira sair em 2 vias.
 */
export function viasNecessarias(formulas: FormulaNaReceita[]): 1 | 2 {
  return formulas.some((f) => formulaExige2Vias(f.componentes)) ? 2 : 1;
}

/** Unidades oferecidas no montador, na ordem de uso mais comum. */
export const UNIDADES: UnidadeDose[] = ['mg', 'mcg', 'g', 'UI', 'mL', 'UFC', '%'];

subscribePatientSync((senderId, data) => {
  if (senderId === 'manipulados') return;
  const state = useManipuladosStore.getState();
  const updates: Partial<ManipuladosState> = {};
  if (data.pacienteNome !== undefined && data.pacienteNome !== state.pacienteNome) {
    updates.pacienteNome = data.pacienteNome;
  }
  if (data.pacienteCpf !== undefined && data.pacienteCpf !== state.pacienteCpf) {
    updates.pacienteCpf = data.pacienteCpf;
  }
  if (data.pacienteEndereco !== undefined && data.pacienteEndereco !== state.pacienteEndereco) {
    updates.pacienteEndereco = data.pacienteEndereco;
  }
  if (data.pacienteCep !== undefined && data.pacienteCep !== state.pacienteCep) {
    updates.pacienteCep = data.pacienteCep;
  }
  if (data.pacienteCidade !== undefined && data.pacienteCidade !== state.pacienteCidade) {
    updates.pacienteCidade = data.pacienteCidade;
  }
  if (data.pacienteUf !== undefined && data.pacienteUf !== state.pacienteUf) {
    updates.pacienteUf = data.pacienteUf;
  }
  if (data.pacienteTelefone !== undefined && data.pacienteTelefone !== state.pacienteTelefone) {
    updates.pacienteTelefone = data.pacienteTelefone;
  }
  if (Object.keys(updates).length > 0) {
    useManipuladosStore.setState(updates);
  }
});

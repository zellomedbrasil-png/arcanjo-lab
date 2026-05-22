import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { publishPatientSync, subscribePatientSync } from './patientSync';

export type TipoDocumento = 'LAUDO' | 'ATESTADO' | 'COMPARECIMENTO' | 'APTIDAO' | 'ASO';
export type AsoTipoExame = 'ADMISSIONAL' | 'PERIODICO' | 'RETORNO_TRABALHO' | 'MUDANCA_FUNCAO' | 'DEMISSIONAL';

interface DocumentState {
  tipoDocumento: TipoDocumento;
  pacienteNome: string;
  pacienteCpf: string;
  pacienteDataNascimento: string;
  data: string;
  local: string;

  // Laudo Médico
  laudoDiagnostico: string;
  laudoCid: string;
  laudoHistorico: string;
  laudoConduta: string;
  laudoPrognostico: string;
  laudoFinalidade: string;

  // Atestado Médico
  atestadoDias: string;
  atestadoMotivo: string;
  atestadoCid: string;
  atestadoDeclararCid: boolean;

  // Comparecimento
  comparecimentoPeriodo: string;
  comparecimentoAcompanhanteNome: string;
  comparecimentoRelacao: string;

  // Aptidão Física
  aptidaoFinalidade: string;
  aptidaoRestricoes: string;

  // ASO
  asoEmpresa: string;
  asoCnpj: string;
  asoFuncao: string;
  asoTipo: AsoTipoExame;
  asoRiscos: string[];
  asoExamesRealizados: string;
  asoResultado: 'APTO' | 'INAPTO';

  setTipoDocumento: (tipo: TipoDocumento) => void;
  setDocumento: (dados: Partial<DocumentState>) => void;
  resetDocumento: () => void;
}

const hoje = () => new Date().toLocaleDateString('pt-BR');

const initialState = {
  tipoDocumento: 'LAUDO' as TipoDocumento,
  pacienteNome: '',
  pacienteCpf: '',
  pacienteDataNascimento: '',
  data: hoje(),
  local: 'Fortaleza-CE',

  // Laudo Médico
  laudoDiagnostico: '',
  laudoCid: '',
  laudoHistorico: '',
  laudoConduta: '',
  laudoPrognostico: '',
  laudoFinalidade: 'Para fins de perícia médica / INSS',

  // Atestado Médico
  atestadoDias: '1',
  atestadoMotivo: 'Necessidade de repouso domiciliar por motivos de saúde',
  atestadoCid: '',
  atestadoDeclararCid: false,

  // Comparecimento
  comparecimentoPeriodo: 'das 08:00 às 12:00',
  comparecimentoAcompanhanteNome: '',
  comparecimentoRelacao: 'Acompanhante',

  // Aptidão Física
  aptidaoFinalidade: 'Prática de atividades físicas em academia / esportes',
  aptidaoRestricoes: 'Sem restrições dignas de nota no exame físico atual',

  // ASO
  asoEmpresa: '',
  asoCnpj: '',
  asoFuncao: '',
  asoTipo: 'PERIODICO' as AsoTipoExame,
  asoRiscos: ['AUSÊNCIA DE RISCO'],
  asoExamesRealizados: 'Exame clínico geral ocupacional',
  asoResultado: 'APTO' as 'APTO' | 'INAPTO',
};

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set) => ({
      ...initialState,

      setTipoDocumento: (tipo) => set({ tipoDocumento: tipo }),
      setDocumento: (dados) => set((state) => {
        const next = { ...state, ...dados };
        publishPatientSync('document', {
          pacienteNome: next.pacienteNome,
          pacienteCpf: next.pacienteCpf,
          pacienteDataNascimento: next.pacienteDataNascimento,
        });
        return next;
      }),
      resetDocumento: () => {
        set({ ...initialState, data: hoje() });
        publishPatientSync('document', {
          pacienteNome: '',
          pacienteCpf: '',
          pacienteEndereco: '',
          pacienteCep: '',
          pacienteCidade: '',
          pacienteUf: '',
          pacienteTelefone: '',
          pacienteDataNascimento: '',
        });
      },
    }),
    {
      name: 'arcanjo-lab-documento-draft',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

subscribePatientSync((senderId, data) => {
  if (senderId === 'document') return;
  const state = useDocumentStore.getState();
  const updates: Partial<DocumentState> = {};
  if (data.pacienteNome !== undefined && data.pacienteNome !== state.pacienteNome) {
    updates.pacienteNome = data.pacienteNome;
  }
  if (data.pacienteCpf !== undefined && data.pacienteCpf !== state.pacienteCpf) {
    updates.pacienteCpf = data.pacienteCpf;
  }
  if (data.pacienteDataNascimento !== undefined && data.pacienteDataNascimento !== state.pacienteDataNascimento) {
    updates.pacienteDataNascimento = data.pacienteDataNascimento;
  }
  if (Object.keys(updates).length > 0) {
    useDocumentStore.setState(updates);
  }
});


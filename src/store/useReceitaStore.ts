import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { publishPatientSync, subscribePatientSync } from './patientSync';

/**
 * Tipo escolhido à mão — só vale nos modos TEXTO_LIVRE e MANUAL.
 * No modo estruturado o papel sai da substância (src/data/regrasReceita.ts).
 * 'ESPECIAL' = Receita de Controle Especial; 'RETENCAO' = antimicrobiano/GLP-1.
 */
export type TipoReceita = 'SIMPLES' | 'RETENCAO' | 'ESPECIAL';
export type TipoRecomendado = 'SIMPLES' | 'ESPECIAL' | '';
export type ModoEntrada = 'ESTRUTURADO' | 'TEXTO_LIVRE' | 'MANUAL';
/** FISICO: assinatura à caneta. DIGITAL: espaço para o selo/QR da assinatura ICP-Brasil. */
export type ModoEmissao = 'FISICO' | 'DIGITAL';

export interface MedicamentoReceita {
  id: string;
  nomeDigitado: string;
  principioAtivo: string;
  formaFarmaceutica: string;
  posologia: string;
  quantidade: string;
  duracao: string;
  uso: string;
  indicacao: string;
  observacoes: string;
  carregando: boolean;
  erro: string;
  /** Sugestão da IA/catálogo. Quem decide o papel é classificar() em regrasReceita.ts. */
  tipoRecomendado: TipoRecomendado;
  motivoEspecial: string;
  /** CID + motivo quando a RCE passa de 60 dias (ou 6 meses) — Port. 344, art. 60. */
  justificativaLimite?: string;
  /** Origem no catálogo — permite trocar a dose, favoritar e contar uso. */
  catalogoId?: string;
  /** Índice da apresentação (0 = padrão do catálogo). */
  apresentacao?: number;
}

interface ReceitaState {
  tipoReceita: TipoReceita;
  pacienteNome: string;
  pacienteCpf: string;
  /** Paciente sem CPF: imprime "Não possui" (aceito pela RDC 1.000/2025). */
  pacienteSemCpf: boolean;
  /** Idade e sexo: obrigatórios na receita de antimicrobiano (RDC 471, art. 6º). */
  pacienteIdade: string;
  pacienteSexo: '' | 'F' | 'M';
  pacienteEndereco: string;
  pacienteCep: string;
  pacienteCidade: string;
  pacienteUf: string;
  pacienteTelefone: string;
  local: string;
  data: string;
  medicamentos: MedicamentoReceita[];
  alertas: string[];
  lastSavedAt: string | null;

  // Modo de entrada da prescrição: cards estruturados, texto livre ou manual (sem IA)
  modoEntrada: ModoEntrada;
  textoLivre: string;
  melhorarComIA: boolean;
  prescricaoManual: string;
  /** Preferência do médico — não volta ao padrão ao começar receita nova. */
  modoEmissao: ModoEmissao;

  setTipoReceita: (tipo: TipoReceita) => void;
  setPacienteReceita: (dados: Partial<ReceitaState>) => void;
  addMedicamento: () => void;
  /**
   * Adiciona vários medicamentos de uma vez (aplicar protocolo).
   * O `id` é gerado internamente — por isso fica fora do tipo aceito.
   */
  addMedicamentos: (itens: Array<Omit<Partial<MedicamentoReceita>, 'id'>>) => void;
  removeMedicamento: (id: string) => void;
  updateMedicamento: (id: string, dados: Partial<MedicamentoReceita>) => void;
  setAlertas: (alertas: string[]) => void;
  setModoEntrada: (modo: ModoEntrada) => void;
  setTextoLivre: (texto: string) => void;
  setMelhorarComIA: (valor: boolean) => void;
  setPrescricaoManual: (texto: string) => void;
  setModoEmissao: (modo: ModoEmissao) => void;
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
  indicacao: '',
  observacoes: '',
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
  pacienteSemCpf: false,
  pacienteIdade: '',
  pacienteSexo: '' as '' | 'F' | 'M',
  pacienteEndereco: '',
  pacienteCep: '',
  pacienteCidade: 'Fortaleza',
  pacienteUf: 'CE',
  pacienteTelefone: '',
  local: 'Fortaleza-CE',
  data: hoje(),
  medicamentos: [novoMedicamento()],
  alertas: [] as string[],
  lastSavedAt: null,
  modoEntrada: 'ESTRUTURADO' as ModoEntrada,
  textoLivre: '',
  melhorarComIA: false,
  prescricaoManual: '',
  modoEmissao: 'FISICO' as ModoEmissao,
};

export const useReceitaStore = create<ReceitaState>()(
  persist(
    (set) => ({
      ...initialState,

      setTipoReceita: (tipo) => set({ tipoReceita: tipo, lastSavedAt: touch() }),
      setPacienteReceita: (dados) => set((state) => {
        const next = { ...state, ...dados, lastSavedAt: touch() };
        publishPatientSync('receita', {
          pacienteNome: next.pacienteNome,
          pacienteCpf: next.pacienteCpf,
          // Idade/sexo só propagam quando preenchidos — vazio aqui não apaga o
          // que outra tela (SOAP, documentos) já tem.
          ...(next.pacienteIdade ? { pacienteIdade: next.pacienteIdade } : {}),
          ...(next.pacienteSexo ? { genero: next.pacienteSexo } : {}),
          pacienteEndereco: next.pacienteEndereco,
          pacienteCep: next.pacienteCep,
          pacienteCidade: next.pacienteCidade,
          pacienteUf: next.pacienteUf,
          pacienteTelefone: next.pacienteTelefone,
        });
        return next;
      }),

      addMedicamento: () =>
        set((state) => ({
          medicamentos: [...state.medicamentos, novoMedicamento()],
          lastSavedAt: touch(),
        })),

      addMedicamentos: (itens) =>
        set((state) => {
          if (itens.length === 0) return {};
          let i = 0;
          // 1. Preenche primeiro os cards que já estão vazios — evita deixar um
          //    card em branco no topo ao aplicar um protocolo em receita nova.
          const medicamentos = state.medicamentos.map((m) => {
            const vazio = !m.nomeDigitado.trim() && !m.principioAtivo.trim();
            if (!vazio || i >= itens.length) return m;
            return { ...m, ...itens[i++] };
          });
          // 2. O que sobrou entra como card novo, preservando a ordem do protocolo.
          while (i < itens.length) {
            medicamentos.push({ ...novoMedicamento(), ...itens[i++] });
          }
          return { medicamentos, lastSavedAt: touch() };
        }),

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

      setAlertas: (alertas) =>
        set({ alertas, lastSavedAt: touch() }),

      setModoEntrada: (modo) => set({ modoEntrada: modo, lastSavedAt: touch() }),
      setTextoLivre: (texto) => set({ textoLivre: texto, lastSavedAt: touch() }),
      setMelhorarComIA: (valor) => set({ melhorarComIA: valor, lastSavedAt: touch() }),
      setPrescricaoManual: (texto) => set({ prescricaoManual: texto, lastSavedAt: touch() }),
      setModoEmissao: (modo) => set({ modoEmissao: modo }),

      resetReceita: () => {
        set((s) => ({ ...initialState, modoEmissao: s.modoEmissao, data: hoje(), medicamentos: [novoMedicamento()], alertas: [], modoEntrada: 'ESTRUTURADO', textoLivre: '', melhorarComIA: false, prescricaoManual: '' }));
        publishPatientSync('receita', {
          pacienteNome: '',
          pacienteCpf: '',
          pacienteEndereco: '',
          pacienteCep: '',
          pacienteCidade: 'Fortaleza',
          pacienteUf: 'CE',
          pacienteTelefone: '',
          pacienteDataNascimento: '',
        });
      },
    }),
    {
      name: 'arcanjo-lab-receita-draft',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tipoReceita: state.tipoReceita,
        pacienteNome: state.pacienteNome,
        pacienteCpf: state.pacienteCpf,
        pacienteSemCpf: state.pacienteSemCpf,
        pacienteIdade: state.pacienteIdade,
        pacienteSexo: state.pacienteSexo,
        pacienteEndereco: state.pacienteEndereco,
        pacienteCep: state.pacienteCep,
        pacienteCidade: state.pacienteCidade,
        pacienteUf: state.pacienteUf,
        pacienteTelefone: state.pacienteTelefone,
        local: state.local,
        medicamentos: state.medicamentos.map((medicamento) => ({
          ...medicamento,
          carregando: false,
          erro: '',
        })),
        alertas: state.alertas,
        lastSavedAt: state.lastSavedAt,
        modoEmissao: state.modoEmissao,
        modoEntrada: state.modoEntrada,
        textoLivre: state.textoLivre,
        melhorarComIA: state.melhorarComIA,
        prescricaoManual: state.prescricaoManual,
      }),
    }
  )
);

subscribePatientSync((senderId, data) => {
  if (senderId === 'receita') return;
  const state = useReceitaStore.getState();
  const updates: Partial<ReceitaState> = {};
  if (data.pacienteNome !== undefined && data.pacienteNome !== state.pacienteNome) {
    updates.pacienteNome = data.pacienteNome;
  }
  if (data.pacienteCpf !== undefined && data.pacienteCpf !== state.pacienteCpf) {
    updates.pacienteCpf = data.pacienteCpf;
  }
  if (data.pacienteIdade && data.pacienteIdade !== state.pacienteIdade) {
    updates.pacienteIdade = data.pacienteIdade;
  }
  if (data.genero && data.genero !== state.pacienteSexo) {
    updates.pacienteSexo = data.genero;
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
    useReceitaStore.setState(updates);
  }
});


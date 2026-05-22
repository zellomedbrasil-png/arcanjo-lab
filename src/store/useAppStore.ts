import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Convenio, Genero, Medico, TipoGuia, ConsultaGravada } from '../types';
import { publishPatientSync, subscribePatientSync } from './patientSync';
import { supabase } from '../config/supabase';

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
  queixa: string;
  justificativa: string;
  justificativaExames: string;
  justificativaProcedimentos: string;
  lastSavedAt: string | null;
  iaModel: string;
  consultasGravadas: ConsultaGravada[];
  syncKey: string;

  setMedico: (medico: Medico | null) => void;
  setPaciente: (dados: Partial<AppState>) => void;
  toggleExame: (exameNome: string) => void;
  adicionarPainel: (examesPainel: string[]) => void;
  setExamesSelecionados: (exames: string[]) => void;
  toggleProcedimento: (proc: string) => void;
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
  setSyncKey: (syncKey: string) => void;
  carregarConsultasBanco: () => Promise<void>;
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
  queixa: '',
  justificativa: '',
  justificativaExames: '',
  justificativaProcedimentos: '',
  lastSavedAt: null,
  iaModel: '',
};

const touch = () => new Date().toISOString();

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      medico: null,
      ...initialState,
      consultasGravadas: [] as ConsultaGravada[],
      syncKey: '26.155',

      setSyncKey: (syncKey) => {
        set({ syncKey });
        get().carregarConsultasBanco();
      },

      carregarConsultasBanco: async () => {
        const url = import.meta.env.VITE_SUPABASE_URL;
        if (!url || url.includes('dummy') || url.includes('placeholder')) {
          console.log('Supabase não configurado ou usando chave dummy. Fallback para localStorage ativo.');
          return;
        }
        try {
          const { data, error } = await supabase
            .from('consultas_gravadas')
            .select('nome, queixa, data')
            .eq('sync_key', get().syncKey)
            .order('data', { ascending: false })
            .limit(10);

          if (error) throw error;
          if (data) {
            set({ consultasGravadas: data });
          }
        } catch (err) {
          console.error('Erro ao buscar consultas do Supabase:', err);
        }
      },

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
        set(initialState);
        publishPatientSync('app', {
          pacienteNome: '',
          pacienteCpf: '',
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
        const n = nome.trim();
        const q = queixaVal.trim();
        if (!n || !q) {
          return false;
        }

        const nova: ConsultaGravada = {
          nome: n,
          queixa: q,
          data: new Date().toISOString(),
        };

        set((state) => {
          const filtradas = state.consultasGravadas.filter(
            (c) => !(c.nome.toLowerCase() === n.toLowerCase() && c.queixa.toLowerCase() === q.toLowerCase())
          );
          success = true;
          return {
            consultasGravadas: [nova, ...filtradas].slice(0, 10),
            lastSavedAt: touch(),
          };
        });

        // Gravação assíncrona no Supabase
        const url = import.meta.env.VITE_SUPABASE_URL;
        if (url && !url.includes('dummy') && !url.includes('placeholder')) {
          (async () => {
            try {
              // 1. Remover duplicatas idênticas para o mesmo syncKey
              await supabase
                .from('consultas_gravadas')
                .delete()
                .eq('sync_key', get().syncKey)
                .eq('nome', n)
                .eq('queixa', q);

              // 2. Inserir a nova consulta
              const { error } = await supabase
                .from('consultas_gravadas')
                .insert({
                  sync_key: get().syncKey,
                  nome: n,
                  queixa: q,
                  data: nova.data
                });
              if (error) throw error;
            } catch (err) {
              console.error('Erro ao salvar consulta no Supabase:', err);
            }
          })();
        }

        return success;
      },

      gravarConsulta: () => {
        const state = get();
        return state.adicionarConsultaAoHistorico(state.pacienteNome, state.queixa);
      },

      removerConsultaGravada: (index: number) => {
        const target = get().consultasGravadas[index];
        set((state) => ({
          consultasGravadas: state.consultasGravadas.filter((_, i) => i !== index),
          lastSavedAt: touch(),
        }));

        if (target) {
          const url = import.meta.env.VITE_SUPABASE_URL;
          if (url && !url.includes('dummy') && !url.includes('placeholder')) {
            (async () => {
              try {
                const { error } = await supabase
                  .from('consultas_gravadas')
                  .delete()
                  .eq('sync_key', get().syncKey)
                  .eq('nome', target.nome)
                  .eq('queixa', target.queixa);
                if (error) throw error;
              } catch (err) {
                console.error('Erro ao deletar consulta do Supabase:', err);
              }
            })();
          }
        }
      },

      limparConsultasGravadas: () => {
        set({
          consultasGravadas: [],
          lastSavedAt: touch(),
        });

        const url = import.meta.env.VITE_SUPABASE_URL;
        if (url && !url.includes('dummy') && !url.includes('placeholder')) {
          (async () => {
            try {
              const { error } = await supabase
                .from('consultas_gravadas')
                .delete()
                .eq('sync_key', get().syncKey);
              if (error) throw error;
            } catch (err) {
              console.error('Erro ao limpar histórico do Supabase:', err);
            }
          })();
        }
      },
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
        queixa: state.queixa,
        justificativa: state.justificativa,
        justificativaExames: state.justificativaExames,
        justificativaProcedimentos: state.justificativaProcedimentos,
        lastSavedAt: state.lastSavedAt,
        iaModel: state.iaModel,
        consultasGravadas: state.consultasGravadas,
        syncKey: state.syncKey,
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


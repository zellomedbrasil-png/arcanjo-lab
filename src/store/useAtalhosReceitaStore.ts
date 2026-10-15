// Atalhos de prescrição salvos neste aparelho: favoritos, contagem de uso
// (alimenta "Recentes" e o ranking da busca), modelos de receita e histórico
// por paciente ("repetir última receita"). Exporta/importa em JSON para levar
// a outro aparelho — não há banco sincronizado.

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { MedicamentoReceita } from './useReceitaStore';

/** Item de receita sem os campos de estado da tela. */
export type ItemSalvo = Omit<MedicamentoReceita, 'id' | 'carregando' | 'erro'>;

export interface ModeloReceita {
  id: string;
  nome: string;
  itens: ItemSalvo[];
  criadoEm: string;
}

export interface ReceitaHistorico {
  id: string;
  /** CPF só com dígitos, ou nome normalizado quando não há CPF. */
  chave: string;
  pacienteNome: string;
  data: string;
  itens: ItemSalvo[];
}

interface Uso {
  n: number;
  ultimo: string;
}

interface AtalhosState {
  /** Chaves `${catalogoId}|${apresentacao}`. */
  favoritos: string[];
  usos: Record<string, Uso>;
  modelos: ModeloReceita[];
  historico: ReceitaHistorico[];

  alternarFavorito: (chave: string) => void;
  registrarUso: (chaves: string[]) => void;
  salvarModelo: (nome: string, itens: MedicamentoReceita[]) => void;
  removerModelo: (id: string) => void;
  registrarReceita: (paciente: { nome: string; cpf: string; data: string }, itens: MedicamentoReceita[]) => void;
  importar: (dados: Partial<Pick<AtalhosState, 'favoritos' | 'usos' | 'modelos' | 'historico'>>) => void;
}

const MAX_HISTORICO = 300;

export const chaveCatalogo = (catalogoId: string, apresentacao = 0) => `${catalogoId}|${apresentacao}`;

export function chavePaciente(nome: string, cpf: string): string {
  const digitos = cpf.replace(/\D/g, '');
  if (digitos.length === 11) return digitos;
  return nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Remove estado de tela e itens vazios antes de salvar. */
export function limparItens(itens: MedicamentoReceita[]): ItemSalvo[] {
  return itens
    .filter((m) => m.principioAtivo.trim() || m.nomeDigitado.trim())
    .map((m) => {
      const item: Partial<MedicamentoReceita> = { ...m };
      delete item.id;
      delete item.carregando;
      delete item.erro;
      return item as ItemSalvo;
    });
}

export const useAtalhosReceitaStore = create<AtalhosState>()(
  persist(
    (set) => ({
      favoritos: [],
      usos: {},
      modelos: [],
      historico: [],

      alternarFavorito: (chave) =>
        set((s) => ({
          favoritos: s.favoritos.includes(chave) ? s.favoritos.filter((f) => f !== chave) : [...s.favoritos, chave],
        })),

      registrarUso: (chaves) =>
        set((s) => {
          const agora = new Date().toISOString();
          const usos = { ...s.usos };
          for (const c of chaves) usos[c] = { n: (usos[c]?.n ?? 0) + 1, ultimo: agora };
          return { usos };
        }),

      salvarModelo: (nome, itens) =>
        set((s) => ({
          modelos: [
            { id: crypto.randomUUID(), nome: nome.trim(), itens: limparItens(itens), criadoEm: new Date().toISOString() },
            ...s.modelos,
          ],
        })),

      removerModelo: (id) => set((s) => ({ modelos: s.modelos.filter((m) => m.id !== id) })),

      registrarReceita: (paciente, itens) =>
        set((s) => {
          const limpos = limparItens(itens);
          const chave = chavePaciente(paciente.nome, paciente.cpf);
          if (!chave || limpos.length === 0) return {};
          // Mesma receita reimpressa no mesmo dia não duplica o histórico.
          const assinatura = JSON.stringify(limpos.map((i) => [i.principioAtivo, i.posologia, i.quantidade]));
          const semDuplicata = s.historico.filter(
            (h) => !(h.chave === chave && h.data === paciente.data &&
              JSON.stringify(h.itens.map((i) => [i.principioAtivo, i.posologia, i.quantidade])) === assinatura)
          );
          const nova: ReceitaHistorico = { id: crypto.randomUUID(), chave, pacienteNome: paciente.nome.trim(), data: paciente.data, itens: limpos };
          return { historico: [nova, ...semDuplicata].slice(0, MAX_HISTORICO) };
        }),

      importar: (dados) =>
        set((s) => ({
          favoritos: Array.from(new Set([...s.favoritos, ...(dados.favoritos ?? [])])),
          usos: { ...(dados.usos ?? {}), ...s.usos },
          modelos: [...s.modelos, ...(dados.modelos ?? []).filter((m) => !s.modelos.some((x) => x.id === m.id))],
          historico: [...s.historico, ...(dados.historico ?? []).filter((h) => !s.historico.some((x) => x.id === h.id))]
            .slice(0, MAX_HISTORICO),
        })),
    }),
    { name: 'arcanjo-lab-receita-atalhos', storage: createJSONStorage(() => localStorage) }
  )
);

/** Última receita registrada para o paciente (por CPF ou nome). */
export function ultimaReceitaDo(historico: ReceitaHistorico[], nome: string, cpf: string): ReceitaHistorico | undefined {
  const chaveCpf = cpf.replace(/\D/g, '');
  const chaveNome = chavePaciente(nome, '');
  return historico.find((h) => (chaveCpf.length === 11 && h.chave === chaveCpf) || (chaveNome.length >= 5 && h.chave === chaveNome) ||
    chavePaciente(h.pacienteNome, '') === chaveNome && chaveNome.length >= 5);
}

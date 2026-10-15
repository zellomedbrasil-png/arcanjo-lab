// Dados do prescritor impressos em TODAS as receitas.
// Fonte única: antes havia uma cópia de `MEDICO` em cada template.
//
// Endereço completo e telefone são obrigatórios na receita de antimicrobiano
// (RDC 471/2021, art. 6º) e na Receita de Controle Especial (Port. 344/98, art. 55;
// Lei 5.991/73, art. 35). Sem eles a impressão desses modelos fica bloqueada.
// Os valores abaixo são o padrão; o médico ajusta na tela do receituário
// (usePrescritorStore guarda a versão editada).

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Prescritor {
  nome: string;
  conselho: string;
  numero: string;
  ufConselho: string;
  /** Logradouro, número e complemento. */
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  telefone: string;
}

export const PRESCRITOR_PADRAO: Prescritor = {
  nome: 'Dr. Roberto Arcanjo',
  conselho: 'CRM',
  numero: '26.155',
  ufConselho: 'CE',
  endereco: 'R. João Lobo Filho, 250 - AllMed',
  bairro: '',
  cidade: 'Fortaleza',
  uf: 'CE',
  cep: '',
  telefone: '',
};

interface PrescritorState {
  prescritor: Prescritor;
  setPrescritor: (dados: Partial<Prescritor>) => void;
}

export const usePrescritorStore = create<PrescritorState>()(
  persist(
    (set) => ({
      prescritor: PRESCRITOR_PADRAO,
      setPrescritor: (dados) => set((s) => ({ prescritor: { ...s.prescritor, ...dados } })),
    }),
    {
      name: 'arcanjo-lab-prescritor',
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => ({
        ...current,
        prescritor: { ...PRESCRITOR_PADRAO, ...((persisted as Partial<PrescritorState>)?.prescritor ?? {}) },
      }),
    }
  )
);

/** "CRM/CE 26.155" */
export const registroConselho = (p: Prescritor) => `${p.conselho}/${p.ufConselho} ${p.numero}`;

/** Linha única de endereço: "Rua X, 250 - Bairro - Fortaleza/CE - CEP 60000-000". */
export function enderecoCompleto(p: Prescritor): string {
  return [
    p.endereco,
    p.bairro,
    [p.cidade, p.uf].filter(Boolean).join('/'),
    p.cep ? `CEP ${p.cep}` : '',
  ]
    .filter((s) => s && s.trim())
    .join(' - ');
}

/** Campos que faltam para antimicrobiano/controle especial. */
export function pendenciasPrescritor(p: Prescritor): string[] {
  const faltam: string[] = [];
  if (!p.endereco.trim()) faltam.push('endereço');
  if (!p.bairro.trim()) faltam.push('bairro');
  if (!p.cep.replace(/\D/g, '')) faltam.push('CEP');
  if (!p.telefone.replace(/\D/g, '')) faltam.push('telefone');
  return faltam;
}

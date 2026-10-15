// Catálogo — Insumos.
// Tipos e regras em src/data/medicamentos.ts. Papel da receita (simples, 2 vias,
// notificação) é calculado pela substância em src/data/regrasReceita.ts.

import type { MedicamentoDef } from '../medicamentos';

export const INSUMOS: MedicamentoDef[] = [
  {
    id: 'fralda-geriatrica',
    nome: 'Fralda Geriátrica',
    principioAtivo: 'Fralda descartável geriátrica',
    marcaReferencia: 'Bigfral',
    formaFarmaceutica: 'Fralda descartável, tamanho adequado ao paciente',
    uso: 'Uso externo',
    grupo: 'INSUMO',
    tipoRecomendado: 'SIMPLES',
    posologiaPadrao: 'Utilizar 1 fralda a cada troca, até 4 unidades ao dia.',
    quantidadePadrao: '120 unidades/mês',
    duracaoPadrao: 'Uso contínuo',
    indicacao: 'Incontinência urinária e/ou fecal',
    explicacao: 'Insumo coberto pela Farmácia Popular para incontinência.',
    observacoes: 'Exige 60+ anos ou PcD; para deficiência, o laudo/receita deve conter o CID.',
    gratuito: { canal: 'FP', nota: 'Exige 60+ anos ou PcD com CID no laudo/receita' },
  },
];

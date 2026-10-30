// Cobertura de exame/procedimento por convênio, a partir dos códigos cadastrados.
// Usado pelo catálogo (ExamSelector) e pela lista da guia (GuiaExamesLateral).

export type Cobertura = 'AMBOS' | 'SO_ISSEC' | 'SO_IPM' | 'SEM_CODIGO';
export type CoberturaChip = Cobertura | 'NAO_CATALOGADO';

export function getCobertura(exame: { codIssec: string; codIpm: string }): Cobertura {
  const temIssec = !!exame.codIssec?.trim();
  const temIpm = !!exame.codIpm?.trim();
  if (temIssec && temIpm) return 'AMBOS';
  if (temIssec) return 'SO_ISSEC';
  if (temIpm) return 'SO_IPM';
  return 'SEM_CODIGO';
}

export const COBERTURA_META: Record<Cobertura, { label: string; cls: string; title: string }> = {
  AMBOS: {
    label: 'ISSEC+IPM',
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    title: 'Coberto por ISSEC e IPM',
  },
  SO_ISSEC: {
    label: 'Só ISSEC',
    cls: 'bg-blue-50 text-blue-700 border-blue-200',
    title: 'Consta apenas na tabela do ISSEC',
  },
  SO_IPM: {
    label: 'Só IPM',
    cls: 'bg-amber-50 text-amber-700 border-amber-200',
    title: 'Consta apenas na tabela do IPM',
  },
  SEM_CODIGO: {
    label: 'Sem cobertura',
    cls: 'bg-slate-100 text-slate-600 border-slate-200',
    title: 'Sem código cadastrado nas tabelas oficiais. Confirme com a operadora.',
  },
};

export const CHIP_META: Record<CoberturaChip, { label: string; title: string }> = {
  AMBOS: { label: COBERTURA_META.AMBOS.label, title: COBERTURA_META.AMBOS.title },
  SO_ISSEC: { label: COBERTURA_META.SO_ISSEC.label, title: COBERTURA_META.SO_ISSEC.title },
  SO_IPM: { label: COBERTURA_META.SO_IPM.label, title: COBERTURA_META.SO_IPM.title },
  SEM_CODIGO: { label: COBERTURA_META.SEM_CODIGO.label, title: COBERTURA_META.SEM_CODIGO.title },
  NAO_CATALOGADO: {
    label: 'Não catalogado',
    title: 'Item digitado manualmente — não consta no catálogo oficial do sistema.',
  },
};

export const CHIP_DOT: Record<CoberturaChip, string> = {
  AMBOS: 'bg-emerald-500',
  SO_ISSEC: 'bg-blue-500',
  SO_IPM: 'bg-amber-500',
  SEM_CODIGO: 'bg-slate-400',
  NAO_CATALOGADO: 'bg-violet-400',
};

export function isForaDoConvenio(cobertura: Cobertura, convenio: string): boolean {
  if (convenio === 'ISSEC') return cobertura === 'SO_IPM' || cobertura === 'SEM_CODIGO';
  if (convenio === 'IPM') return cobertura === 'SO_ISSEC' || cobertura === 'SEM_CODIGO';
  return false;
}

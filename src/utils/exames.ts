import { CATEGORIAS_EXAMES } from '../types';

export function getExamCode(nomeExame: string, convenio: 'IPM' | 'ISSEC'): string {
  for (const categoria of CATEGORIAS_EXAMES) {
    const exame = categoria.exames.find(e => e.nome === nomeExame);
    if (exame) {
      return convenio === 'IPM' ? exame.codIpm : exame.codIssec;
    }
  }
  return '';
}

export function formatExamWithCode(nomeExame: string, _convenio: 'IPM' | 'ISSEC'): string {
  // Retorna apenas o nome do exame (sem o código), deixando o espaço no layout
  return nomeExame;
}

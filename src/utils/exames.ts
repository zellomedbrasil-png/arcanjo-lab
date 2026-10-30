import { CATEGORIAS_EXAMES } from '../types';

// codIpm segue a TUSS (40xxxxxx), a mesma tabela das guias TISS/SP-SADT das
// demais operadoras; só o ISSEC tem numeração própria (28xxxxxx).
export function getExamCode(nomeExame: string, convenio: 'IPM' | 'ISSEC' | 'TISS' | 'CAMED' | 'AMIL'): string {
  for (const categoria of CATEGORIAS_EXAMES) {
    const exame = categoria.exames.find(e => e.nome === nomeExame);
    if (exame) {
      return convenio === 'ISSEC' ? exame.codIssec : exame.codIpm;
    }
  }
  return '';
}

export function formatExamWithCode(nomeExame: string, convenio: 'IPM' | 'ISSEC' | 'TISS' | 'CAMED' | 'AMIL'): string {
  void convenio;
  // Retorna apenas o nome do exame (sem o código), deixando o espaço no layout
  return nomeExame;
}

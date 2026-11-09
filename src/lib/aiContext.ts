// src/lib/aiContext.ts
// Linha de contexto do paciente enviada aos prompts de IA — fonte única.
//
// Por que existe: a linha era montada à mão em 5 lugares (SOAP, Justificativa de
// exames/procedimentos, Serviços e os gatilhos do celular). Sem a idade no
// contexto, e com o prompt pedindo um "perfil clínico", a IA CHUTAVA a faixa
// etária e escrevia "PACIENTE IDOSO" em qualquer paciente. Centralizar garante
// que a idade — ou a ausência explícita dela — chegue igual em todos os fluxos.

import { getProcedimentoNome } from '../data/procedimentos';

export interface PacienteContexto {
  pacienteNome?: string;
  /** Idade em anos, como texto. Vazio = não informada. */
  pacienteIdade?: string;
  genero?: 'M' | 'F';
}

/**
 * Monta a linha "Paciente: ... | Idade: ... | Gênero: ...".
 *
 * Quando a idade não foi informada, dizemos isso EXPLICITAMENTE e instruímos a
 * não presumir. Deixar o campo de fora faria a IA preencher a lacuna sozinha —
 * exatamente a alucinação que queremos evitar.
 */
export function buildPacienteContexto(p: PacienteContexto): string {
  const nome = (p.pacienteNome || '').trim() || 'não informado';
  const idade = (p.pacienteIdade || '').trim();
  const idadeStr = idade
    ? `${idade} anos`
    : 'NÃO INFORMADA — não presuma nem estime faixa etária';
  const generoStr = p.genero === 'F' ? 'Feminino' : 'Masculino';
  return `Paciente: ${nome} | Idade: ${idadeStr} | Gênero: ${generoStr}`;
}

/** Procedimentos pelo nome completo; os digitados à mão vão marcados como fora do catálogo. */
export function nomesProcedimentos(ids: string[] = [], personalizados: string[] = []): string[] {
  return [...ids.map(getProcedimentoNome), ...personalizados.map((n) => `${n} (fora do catálogo)`)];
}

export type ModalidadeConsulta = 'PRESENCIAL' | 'TELEMEDICINA';

export interface DadosMensagemSOAP {
  pacienteIdade?: string;
  genero?: 'M' | 'F';
  convenio?: string;
  tipoGuia?: string;
  examesSelecionados?: string[];
  procedimentosSelecionados?: string[];
  /** Procedimentos digitados fora do catálogo. */
  procedimentosPersonalizados?: string[];
  /** Transcrição da consulta ou anotações digitadas (campo "Queixa / Contexto"). */
  queixa: string;
}

/**
 * Mensagem do usuário para o SYSTEM_PROMPT_SOAP, no formato do guia do SOAP
 * Express: MODALIDADE, OPERADORA, DADOS CONHECIDOS, INSTRUÇÕES DO MÉDICO e a
 * transcrição entre <transcricao>. O nome do paciente não vai: a nota não
 * precisa dele e é um dado a menos saindo para o provedor de IA (LGPD).
 */
export function buildMensagemSOAP(d: DadosMensagemSOAP, modalidade: ModalidadeConsulta = 'PRESENCIAL'): string {
  const idade = (d.pacienteIdade || '').trim();
  const sexo = d.genero === 'F' ? 'feminino' : 'masculino';
  const dados = idade
    ? `${idade.replace(/\s*anos?$/i, '')} anos, sexo ${sexo}`
    : `sexo ${sexo}; idade não informada (não presumir)`;

  const linhas = [`MODALIDADE: ${modalidade}`];
  if (d.convenio === 'ISSEC' || d.convenio === 'IPM') linhas.push(`OPERADORA: ${d.convenio}`);
  linhas.push(`DADOS CONHECIDOS: ${dados}`);

  // Exames e procedimentos marcados, pelo nome (o id interno, ex. US_PROSTATA, não
  // diz nada à IA). Os dois entram: a guia de exames e a de procedimentos convivem.
  const exames = d.examesSelecionados ?? [];
  const procedimentos = nomesProcedimentos(d.procedimentosSelecionados, d.procedimentosPersonalizados);
  if (exames.length) linhas.push(`INSTRUÇÕES DO MÉDICO: Exames laboratoriais já marcados na guia: ${exames.join(', ')}.`);
  if (procedimentos.length) linhas.push(`INSTRUÇÕES DO MÉDICO: Procedimentos já marcados na guia: ${procedimentos.join(', ')}.`);

  return `${linhas.join('\n')}\n\n<transcricao>\n${d.queixa.trim()}\n</transcricao>`;
}

// src/lib/aiContext.ts
// Linha de contexto do paciente enviada aos prompts de IA — fonte única.
//
// Por que existe: a linha era montada à mão em 5 lugares (SOAP, Justificativa de
// exames/procedimentos, Serviços e os gatilhos do celular). Sem a idade no
// contexto, e com o prompt pedindo um "perfil clínico", a IA CHUTAVA a faixa
// etária e escrevia "PACIENTE IDOSO" em qualquer paciente. Centralizar garante
// que a idade — ou a ausência explícita dela — chegue igual em todos os fluxos.

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

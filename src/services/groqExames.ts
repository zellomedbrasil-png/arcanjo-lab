import { callGemini } from '../config/gemini';

export interface ExameOrganizado {
  nomeOriginal: string;
  nomePadronizado: string;
  codigoTUSS?: string;
  justificativaIndividual: string;
}

export interface ResultadoExamesIA {
  exames: ExameOrganizado[];
  justificativaGlobal: string;
  cid10Sugerido: string;
}

const SYSTEM_PROMPT = `Você é um médico geriatra e gastroenterologista sênior, especialista em gestão de exames complementares no SUS e convênios do Brasil.

TAREFA: Receba uma lista bruta de exames (digitada livremente pelo médico) e organize-a.

RETORNE EXCLUSIVAMENTE um JSON válido (sem markdown, sem explicações, sem blocos de código) com o seguinte formato:
{
  "exames": [
    {
      "nomeOriginal": "nome como foi digitado pelo médico",
      "nomePadronizado": "nome oficial conforme nomenclatura TUSS/CBHPM (ex: 'HEMOGRAMA COMPLETO', 'DOSAGEM DE GLICOSE')",
      "codigoTUSS": "código TUSS se souber (ex: '40304361'), senão string vazia",
      "justificativaIndividual": "breve justificativa clínica do exame no contexto"
    }
  ],
  "justificativaGlobal": "INDICAÇÃO CLÍNICA consolidada em 1-3 frases em MAIÚSCULAS para impressão na guia do convênio. Formato: INVESTIGAÇÃO DE [queixa]. SOLICITO [exames principais] PARA [objetivo diagnóstico]. CID-10: [código].",
  "cid10Sugerido": "código CID-10 mais provável (ex: 'Z00.0 - Exame médico geral')"
}

REGRAS:
- Padronize os nomes para nomenclatura TUSS/CBHPM oficial
- Se o médico escreveu abreviações (HMG, GJ, TGO, TGP, etc.), expanda para o nome oficial
- Se não reconhecer um exame, mantenha o nome original e marque com "(verificar)"
- A justificativa global deve ser profissional, adequada para auditoria de convênio
- Se a queixa for fornecida, use-a para gerar justificativas contextualmente relevantes
- Se não houver queixa, gere justificativas genéricas baseadas nos exames solicitados
- Retorne exames na mesma ordem em que foram fornecidos
- Inclua o CID-10 mais adequado na justificativa global`;

export async function organizarExamesIA(
  textoExames: string,
  queixa: string,
  genero: string,
  idade?: string
): Promise<ResultadoExamesIA> {
  const contextoPaciente = [
    genero === 'M' ? 'Masculino' : 'Feminino',
    idade ? `${idade} anos` : '',
  ]
    .filter(Boolean)
    .join(', ');

  const userMessage = `EXAMES DIGITADOS PELO MÉDICO:
"""
${textoExames.trim()}
"""

${queixa.trim() ? `QUEIXA / CONTEXTO CLÍNICO: "${queixa.trim()}"` : 'QUEIXA: Não informada.'}
${contextoPaciente ? `PACIENTE: ${contextoPaciente}` : ''}

Organize os exames e retorne apenas o JSON.`;

  const raw = await callGemini({
    prompt: userMessage,
    systemInstruction: SYSTEM_PROMPT,
    jsonMode: true
  });

  const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  let parsed: ResultadoExamesIA;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error('Resposta da IA não é um JSON válido. Tente novamente.');
  }

  // Validação mínima
  if (!parsed.exames || !Array.isArray(parsed.exames)) {
    throw new Error('Resposta da IA não contém lista de exames.');
  }

  return parsed;
}

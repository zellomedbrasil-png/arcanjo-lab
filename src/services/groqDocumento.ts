import { callAI } from '../config/gemini';

export interface IaLaudoResponse {
  laudoDiagnostico: string;
  laudoCid: string;
  laudoHistorico: string;
  laudoConduta: string;
  laudoPrognostico: string;
}

export interface IaAtestadoResponse {
  atestadoMotivo: string;
  atestadoCid: string;
  atestadoDias: string;
}

const LAUDO_SYSTEM_PROMPT = `Você é um médico especialista altamente capacitado e consultor de emissão de Laudos Médicos formais no Brasil.
Dado o pedido do médico ou descrição resumida do caso do paciente, elabore as partes do laudo em linguagem médica formal, clara, assertiva e humanizada.

REGRA ABSOLUTA DE SEGURANÇA: Não invente comorbidades, exames que o paciente não realizou, valores de laboratório fictícios ou sintomas que o médico não tenha explicitado na descrição do caso. Se o histórico fornecido for curto, descreva-o de forma sucinta e formal sem criar fatos clínicos inventados.

Retorne APENAS um JSON válido (sem markdown, sem explicações adicionais) com as seguintes chaves:
{
  "laudoDiagnostico": "Hipótese ou diagnóstico principal por extenso (ex: Diabetes Mellitus Tipo 2)",
  "laudoCid": "Código do CID-10 correspondente (ex: E11)",
  "laudoHistorico": "Histórico clínico formal, contendo estritamente a queixa descrita do paciente, tempo de evolução citado, exames realmente realizados descritos na entrada e a evolução da patologia.",
  "laudoConduta": "Conduta terapêutica atualizada e recomendações médicas baseadas estritamente no caso fornecido (sem propor novos fármacos ou exames não sugeridos na entrada).",
  "laudoPrognostico": "Prognóstico clínico esperado coerente com o caso real."
}
Utilize o padrão técnico oficial do CFM (Conselho Federal de Medicina).`;

const ATESTADO_SYSTEM_PROMPT = `Você é um médico especialista experiente no Brasil.
Dado o pedido ou descrição do atestado, forneça a justificativa clínica/motivo de afastamento e o CID-10 adequado.

REGRA ABSOLUTA DE SEGURANÇA: Baseie o atestado unicamente no quadro clínico fornecido. Não invente doenças secundárias, exames imaginários ou justificativas não suportadas pela queixa de entrada do médico.

Retorne APENAS um JSON válido (sem markdown, sem explicações adicionais) com as seguintes chaves:
{
  "atestadoMotivo": "Justificativa médica formal e completa para afastamento das atividades laborativas/escolares justificável pela queixa informada.",
  "atestadoCid": "Código do CID-10 correspondente compatível com a queixa.",
  "atestadoDias": "Número de dias de afastamento sugeridos de forma clinicamente razoável, apenas os dígitos numéricos (ex: '5')"
}
Evite termos informais e mantenha a redação profissional e segura.`;

import { extractJson } from '../lib/formatters';

export async function gerarLaudoIA(prompt: string): Promise<IaLaudoResponse> {
  const raw = await callAI({
    prompt: `Descrição do Caso: "${prompt}"\n\nRetorne apenas o JSON.`,
    systemInstruction: LAUDO_SYSTEM_PROMPT,
    jsonMode: true
  });

  const jsonStr = extractJson(raw);

  try {
    return JSON.parse(jsonStr) as IaLaudoResponse;
  } catch {
    throw new Error('Resposta da IA não é um JSON válido');
  }
}

export async function gerarAtestadoIA(prompt: string): Promise<IaAtestadoResponse> {
  const raw = await callAI({
    prompt: `Descrição do Afastamento: "${prompt}"\n\nRetorne apenas o JSON.`,
    systemInstruction: ATESTADO_SYSTEM_PROMPT,
    jsonMode: true
  });

  const jsonStr = extractJson(raw);

  try {
    return JSON.parse(jsonStr) as IaAtestadoResponse;
  } catch {
    throw new Error('Resposta da IA não é um JSON válido');
  }
}

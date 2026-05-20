import { getRequiredEnv } from '../config/env';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

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
Retorne APENAS um JSON válido (sem markdown, sem explicações adicionais) com as seguintes chaves:
{
  "laudoDiagnostico": "Hipótese ou diagnóstico principal por extenso (ex: Diabetes Mellitus Tipo 2)",
  "laudoCid": "Código do CID-10 correspondente (ex: E11)",
  "laudoHistorico": "Histórico clínico detalhado, contendo a queixa do paciente, tempo de evolução, exames que corroboram e evolução da patologia (ex: 'Paciente com diagnóstico de DM2 há 10 anos, em uso de doses máximas de hipoglicemiantes orais, evoluindo com perda de função renal e necessidade de insulinoterapia. Apresenta nefropatia diabética em estágio III e neuropatia sensitivo-motora periférica...')",
  "laudoConduta": "Conduta terapêutica atualizada e recomendações médicas (ex: 'Indicado otimização de insulinoterapia, acompanhamento nefrológico trimestral, restrição dietética rigorosa e controle rigoroso da pressão arterial.')",
  "laudoPrognostico": "Prognóstico clínico esperado (ex: 'Reservado a longo prazo, com necessidade de acompanhamento contínuo e adesão rigorosa ao tratamento.')"
}
Utilize o padrão técnico oficial do CFM (Conselho Federal de Medicina). Evite clichês e seja detalhado.`;

const ATESTADO_SYSTEM_PROMPT = `Você é um médico especialista experiente no Brasil.
Dado o pedido ou descrição do atestado, forneça a justificativa clínica/motivo de afastamento e o CID-10 adequado.
Retorne APENAS um JSON válido (sem markdown, sem explicações adicionais) com as seguintes chaves:
{
  "atestadoMotivo": "Justificativa médica formal e completa para afastamento das atividades laborativas/escolares (ex: 'Necessidade de repouso absoluto devido a quadro febril agudo, dor no corpo e prostração compatíveis com arbovirose, necessitando de isolamento relativo e hidratação oral.')",
  "atestadoCid": "Código do CID-10 correspondente (ex: A90)",
  "atestadoDias": "Número de dias de afastamento sugeridos de forma clinicamente razoável, apenas os dígitos numéricos (ex: '5')"
}
Evite termos informais e mantenha a redação profissional e segura.`;

export async function gerarLaudoIA(prompt: string): Promise<IaLaudoResponse> {
  const groqApiKey = getRequiredEnv('VITE_GROQ_API_KEY');
  const response = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${groqApiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: LAUDO_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Descrição do Caso: "${prompt}"\n\nRetorne apenas o JSON.`,
        },
      ],
      temperature: 0.2,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content?.trim() ?? '';
  const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(jsonStr) as IaLaudoResponse;
  } catch {
    throw new Error('Resposta da IA não é um JSON válido');
  }
}

export async function gerarAtestadoIA(prompt: string): Promise<IaAtestadoResponse> {
  const groqApiKey = getRequiredEnv('VITE_GROQ_API_KEY');
  const response = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${groqApiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: ATESTADO_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Descrição do Afastamento: "${prompt}"\n\nRetorne apenas o JSON.`,
        },
      ],
      temperature: 0.2,
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content?.trim() ?? '';
  const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(jsonStr) as IaAtestadoResponse;
  } catch {
    throw new Error('Resposta da IA não é um JSON válido');
  }
}

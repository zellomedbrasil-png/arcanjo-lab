import type { MedicamentoReceita, TipoRecomendado } from '../store/useReceitaStore';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string;
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `Você é um farmacêutico clínico sênior e consultor de receituário médico no Brasil, com expertise em geriatria.
Dado o nome de um medicamento, retorne APENAS um JSON válido (sem markdown, sem explicações) com:
{
  "principioAtivo": "Nome do princípio ativo + dosagem (ex: Omeprazol 20mg)",
  "formaFarmaceutica": "Forma farmacêutica completa (ex: Cápsulas gastrorresistentes)",
  "uso": "Via de administração (Uso oral | Uso tópico | Uso nasal | Uso sublingual | etc.)",
  "posologia": "Instrução completa em português brasileiro claro e formal para o paciente. Para idosos (≥60 anos), prefira doses mais baixas quando aplicável e inclua orientações especiais (ex: tomar com água, evitar jejum prolongado).",
  "quantidade": "Quantidade total com unidade (ex: 30 cápsulas, 1 frasco de 120ml)",
  "duracao": "Duração do tratamento (ex: 30 dias, uso contínuo, 7 dias)",
  "tipoReceita": "SIMPLES ou ESPECIAL — ESPECIAL somente para: psicotrópicos (benzodiazepínicos como Clonazepam, Diazepam, Alprazolam; anfetamínicos; barbitúricos), opioides controlados (morfina, codeína acima de 30mg, tramadol em algumas apresentações), e demais sujeitos à Portaria SVS/MS 344/98 e suas listas B1, B2, A1-A5. Todos os demais são SIMPLES.",
  "motivoTipo": "Se ESPECIAL: explique brevemente qual lista da Portaria 344/98 enquadra o medicamento (ex: 'Benzodiazepínico — Lista B1 da Portaria SVS/MS 344/98'). Se SIMPLES: deixe vazio."
}
Use a posologia padrão mais comum e segura para adultos/idosos. Seja preciso e profissional.`;

// ─── Prompt para processar listas inteiras ──────────────────────
const BATCH_SYSTEM_PROMPT = `Você é um farmacêutico clínico sênior e consultor de receituário médico no Brasil, com expertise em geriatria e polifarmácia.

TAREFA: Receba uma lista de medicamentos e retorne APENAS um JSON válido com o formato:
{
  "medicamentos": [
    {
      "nomeOriginal": "como o médico digitou",
      "principioAtivo": "Nome do princípio ativo + dosagem (ex: Losartana Potássica 50mg)",
      "formaFarmaceutica": "Forma farmacêutica (ex: Comprimidos revestidos)",
      "uso": "Via de administração (Uso oral | Uso tópico | etc.)",
      "posologia": "Instrução completa e clara para o paciente, com horários quando relevante. Para idosos, prefira doses conservadoras.",
      "quantidade": "Quantidade total (ex: 30 comprimidos)",
      "duracao": "Duração (ex: 30 dias, uso contínuo)",
      "tipoReceita": "SIMPLES ou ESPECIAL (conforme Portaria SVS/MS 344/98)",
      "motivoTipo": "Se ESPECIAL: qual lista da Portaria 344/98. Se SIMPLES: vazio."
    }
  ],
  "alertas": [
    "Alertas de interação medicamentosa ou duplicidade detectados (se houver). Se não houver, array vazio."
  ]
}

REGRAS IMPORTANTES:
- Se o médico escreveu abreviações ou nomes comerciais, expanda para princípio ativo + dosagem
- Inclua alertas de interação medicamentosa entre os medicamentos da lista
- Alerte sobre duplicidades terapêuticas (mesma classe)
- Para perfil geriátrico, alerte sobre medicamentos potencialmente inapropriados (Critérios de Beers)
- NÃO invente medicamentos que não estão na lista
- Mantenha a ordem original
- Retorne APENAS JSON válido, sem markdown`;

interface GroqMedResponse {
  principioAtivo: string;
  formaFarmaceutica: string;
  uso: string;
  posologia: string;
  quantidade: string;
  duracao: string;
  tipoReceita: string;
  motivoTipo: string;
}

interface GroqBatchMedItem {
  nomeOriginal: string;
  principioAtivo: string;
  formaFarmaceutica: string;
  uso: string;
  posologia: string;
  quantidade: string;
  duracao: string;
  tipoReceita: string;
  motivoTipo: string;
}

interface GroqBatchResponse {
  medicamentos: GroqBatchMedItem[];
  alertas: string[];
}

export interface MedProcessado {
  nomeOriginal: string;
  principioAtivo: string;
  formaFarmaceutica: string;
  uso: string;
  posologia: string;
  quantidade: string;
  duracao: string;
  tipoRecomendado: TipoRecomendado;
  motivoEspecial: string;
}

export interface ResultadoListaMedicamentos {
  medicamentos: MedProcessado[];
  alertas: string[];
}

export async function gerarPosologia(
  nomeMedicamento: string
): Promise<Omit<MedicamentoReceita, 'id' | 'nomeDigitado' | 'carregando' | 'erro'>> {
  const response = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Medicamento: "${nomeMedicamento}"\n\nRetorne apenas o JSON sem markdown.`,
        },
      ],
      temperature: 0.1,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content?.trim() ?? '';

  // Remove possíveis blocos de markdown
  const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  let parsed: GroqMedResponse;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error('Resposta da IA não é um JSON válido');
  }

  const tipoRecomendado: TipoRecomendado =
    parsed.tipoReceita === 'ESPECIAL' ? 'ESPECIAL' : 'SIMPLES';

  return {
    principioAtivo: parsed.principioAtivo || nomeMedicamento,
    formaFarmaceutica: parsed.formaFarmaceutica || '',
    uso: parsed.uso || 'Uso oral',
    posologia: parsed.posologia || '',
    quantidade: parsed.quantidade || '',
    duracao: parsed.duracao || '',
    tipoRecomendado,
    motivoEspecial: parsed.motivoTipo || '',
  };
}

// ─── Processar lista de medicamentos (batch) ───────────────────
export async function processarListaMedicamentos(
  textoMedicamentos: string
): Promise<ResultadoListaMedicamentos> {
  const response = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: BATCH_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `LISTA DE MEDICAMENTOS:\n"""\n${textoMedicamentos.trim()}\n"""\n\nProcesse todos os medicamentos e retorne apenas o JSON.`,
        },
      ],
      temperature: 0.1,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content?.trim() ?? '';
  const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  let parsed: GroqBatchResponse;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error('Resposta da IA não é um JSON válido. Tente novamente.');
  }

  if (!parsed.medicamentos || !Array.isArray(parsed.medicamentos)) {
    throw new Error('Resposta da IA não contém lista de medicamentos.');
  }

  const medicamentos: MedProcessado[] = parsed.medicamentos.map((m) => ({
    nomeOriginal: m.nomeOriginal || '',
    principioAtivo: m.principioAtivo || m.nomeOriginal || '',
    formaFarmaceutica: m.formaFarmaceutica || '',
    uso: m.uso || 'Uso oral',
    posologia: m.posologia || '',
    quantidade: m.quantidade || '',
    duracao: m.duracao || '',
    tipoRecomendado: (m.tipoReceita === 'ESPECIAL' ? 'ESPECIAL' : 'SIMPLES') as TipoRecomendado,
    motivoEspecial: m.motivoTipo || '',
  }));

  return {
    medicamentos,
    alertas: parsed.alertas || [],
  };
}


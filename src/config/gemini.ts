import { getRequiredEnv } from './env';
import { groq } from './groq';

export function getGeminiApiKey(): string {
  return getRequiredEnv('VITE_GEMINI_API_KEY');
}

export function getGeminiModel(): string {
  const model = import.meta.env.VITE_GEMINI_MODEL;
  return typeof model === 'string' && model.trim() ? model.trim() : 'gemini-3.5-flash';
}

interface GeminiCallParams {
  prompt: string;
  systemInstruction?: string;
  jsonMode?: boolean;
  temperature?: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let lastUsedModel = '';

export function getLastUsedModel(): string {
  return lastUsedModel;
}

async function callGroqFallback({ prompt, systemInstruction, jsonMode, temperature }: GeminiCallParams): Promise<string> {
  lastUsedModel = 'Llama 3.3 70B (Groq)';
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        ...(systemInstruction ? [{ role: 'system' as const, content: systemInstruction }] : []),
        { role: 'user' as const, content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: typeof temperature === 'number' ? temperature : 0.1,
      response_format: jsonMode ? { type: 'json_object' } : undefined,
    });
    const text = completion.choices[0]?.message?.content || '';
    if (!text.trim()) {
      throw new Error('Groq retornou uma resposta vazia.');
    }
    return text.trim();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Falha no fallback para Groq: ${message}`, { cause: err });
  }
}

export async function callGemini({ prompt, systemInstruction, jsonMode, temperature }: GeminiCallParams): Promise<string> {
  const apiKey = getGeminiApiKey();
  const model = getGeminiModel();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload: {
    contents: Array<{ parts: Array<{ text: string }> }>;
    generationConfig: { temperature: number; responseMimeType?: string };
    systemInstruction?: { parts: Array<{ text: string }> };
  } = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ],
    generationConfig: {
      temperature: typeof temperature === 'number' ? temperature : 0.1
    }
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [
        { text: systemInstruction }
      ]
    };
  }

  if (jsonMode) {
    payload.generationConfig.responseMimeType = 'application/json';
  }

  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 429 || !response.ok) {
        if (attempts < maxAttempts) {
          // If Gemini fails, try once more after a small delay
          await sleep(1500);
          continue;
        }
        
        // If we ran out of attempts, fallback to Groq immediately!
        console.warn(`Gemini falhou com status ${response.status}. Iniciando fallback para Groq...`);
        return await callGroqFallback({ prompt, systemInstruction, jsonMode, temperature });
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (typeof text !== 'string') {
        throw new Error('O Gemini não retornou nenhum conteúdo de texto válido.');
      }

      lastUsedModel = 'Gemini 3.5 Flash';
      return text.trim();
    } catch (err: unknown) {
      if (attempts < maxAttempts) {
        await sleep(1000);
        continue;
      }
      // Network/other error fallback to Groq
      console.warn('Gemini falhou por erro de rede/desconhecido. Iniciando fallback para Groq...', err);
      return await callGroqFallback({ prompt, systemInstruction, jsonMode, temperature });
    }
  }

  throw new Error('Falha ao obter resposta da IA após várias tentativas.');
}

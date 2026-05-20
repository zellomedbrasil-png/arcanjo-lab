import { getRequiredEnv } from './env';

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

export async function callGemini({ prompt, systemInstruction, jsonMode, temperature }: GeminiCallParams): Promise<string> {
  const apiKey = getGeminiApiKey();
  const model = getGeminiModel();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload: any = {
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
  const maxAttempts = 3;

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

      if (response.status === 429) {
        if (attempts < maxAttempts) {
          // Exceeded quota/rate limit. Wait and retry (3s, 6s)
          const delay = attempts * 3000;
          await sleep(delay);
          continue;
        }
        throw new Error(
          'Limite de requisições excedido na IA (Erro 429). Por favor, aguarde alguns segundos antes de tentar novamente.'
        );
      }

      if (!response.ok) {
        let errorText = '';
        try {
          const errObj = await response.json();
          errorText = errObj.error?.message || JSON.stringify(errObj);
        } catch {
          errorText = await response.text();
        }
        throw new Error(`Erro na API do Gemini (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (typeof text !== 'string') {
        throw new Error('O Gemini não retornou nenhum conteúdo de texto válido.');
      }

      return text.trim();
    } catch (err: any) {
      if (attempts >= maxAttempts) {
        throw err;
      }
      // Wait and retry for 429 or network errors
      await sleep(attempts * 2000);
    }
  }

  throw new Error('Falha ao obter resposta da IA após várias tentativas.');
}

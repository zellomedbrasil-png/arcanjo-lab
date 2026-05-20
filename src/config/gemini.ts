import { getRequiredEnv } from './env';

export function getGeminiApiKey(): string {
  return getRequiredEnv('VITE_GEMINI_API_KEY');
}

export function getGeminiModel(): string {
  const model = import.meta.env.VITE_GEMINI_MODEL;
  return typeof model === 'string' && model.trim() ? model.trim() : 'gemini-1.5-flash';
}

interface GeminiCallParams {
  prompt: string;
  systemInstruction?: string;
  jsonMode?: boolean;
}

export async function callGemini({ prompt, systemInstruction, jsonMode }: GeminiCallParams): Promise<string> {
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
    generationConfig: {}
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

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro na API do Gemini (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (typeof text !== 'string') {
    throw new Error('O Gemini não retornou nenhum conteúdo de texto válido.');
  }

  return text.trim();
}

// api/claude.ts
// Vercel Edge Function — proxy seguro para a API da Anthropic.
//
// Coloque este arquivo em /api/claude.ts na RAIZ do projeto.
// O Edge Runtime suporta até 30s de processamento no plano gratuito (Hobby) da Vercel,
// evitando os timeouts de 10s das funções serverless tradicionais.

export const config = { runtime: 'edge' };

// Corrige o erro de compilação TS2591 declarando o objeto process globalmente
declare const process: { env: { [key: string]: string | undefined } };

export default async function handler(req: Request): Promise<Response> {
  // CORS para desenvolvimento local
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // Lê a chave secreta do ambiente (somente no servidor)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json({ error: 'ANTHROPIC_API_KEY não configurada na Vercel. Adicione no dashboard do projeto.' }, 500);
  }

  try {
    const { model, max_tokens, system, messages, temperature } = await req.json() as {
      model?: string;
      max_tokens?: number;
      system?: string;
      temperature?: number;
      messages: Array<{ role: string; content: string }>;
    };

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model ?? 'claude-sonnet-4-6',
        max_tokens: max_tokens ?? 4096,
        temperature: temperature ?? 0.1,
        ...(system ? { system } : {}),
        messages,
      }),
    });

    const data = await upstream.json();
    return json(data, upstream.status);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return json({ error: msg }, 500);
  }
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

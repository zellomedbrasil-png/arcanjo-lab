// api/claude.ts
// Vercel Edge Function — proxy seguro para a API da Anthropic com streaming SSE.
//
// Coloque este arquivo em /api/claude.ts na RAIZ do projeto.
// Streaming: o Edge Runtime só exige que a resposta COMECE em até 25s.
// Como o primeiro byte do stream da Anthropic chega em ~1s, o
// 504 FUNCTION_INVOCATION_TIMEOUT deixa de existir — a conexão fica
// viva enquanto os tokens chegam.

export const config = { runtime: 'edge' };

// Corrige o erro de compilação TS2591 declarando o objeto process globalmente
declare const process: { env: { [key: string]: string | undefined } };

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: Request): Promise<Response> {
  // CORS para desenvolvimento local
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
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
    const body = await req.json() as {
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
        model: body.model ?? 'claude-sonnet-4-6',
        max_tokens: body.max_tokens ?? 4096,
        temperature: body.temperature ?? 0.1,
        stream: true,
        ...(body.system ? { system: body.system } : {}),
        messages: body.messages,
      }),
    });

    // Erro upstream (401/404/429/529...): devolve o corpo e o status reais — nada de engolir.
    if (!upstream.ok || !upstream.body) {
      const errText = await upstream.text();
      return new Response(errText || JSON.stringify({ error: 'upstream error' }), {
        status: upstream.status,
        headers: { 'content-type': 'application/json', ...CORS_HEADERS },
      });
    }

    // Repassa o stream SSE da Anthropic diretamente ao cliente, sem bufferizar.
    return new Response(upstream.body, {
      headers: {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-cache',
        ...CORS_HEADERS,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return json({ error: msg }, 500);
  }
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', ...CORS_HEADERS },
  });
}

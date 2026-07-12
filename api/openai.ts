// api/openai.ts
// Vercel Edge Function — proxy seguro para a API da OpenAI com streaming SSE.
//
// A chave OPENAI_API_KEY fica SOMENTE no servidor (variável de ambiente da
// Vercel). O navegador nunca a vê — mesmo padrão do /api/claude e /api/gemini.
// Streaming: o Edge Runtime só exige que a resposta COMECE em até 25s; como o
// primeiro token da OpenAI chega em ~1s, não há 504 de timeout.

export const config = { runtime: 'edge' };

// Corrige TS2591 declarando process globalmente no Edge Runtime.
declare const process: { env: { [key: string]: string | undefined } };

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return json({ error: 'OPENAI_API_KEY não configurada na Vercel. Adicione no dashboard do projeto (Settings → Environment Variables) e refaça o deploy.' }, 500);
  }

  try {
    // Repassa o corpo do cliente verbatim (model, messages, max_completion_tokens,
    // temperature, stream). A chave é injetada aqui, no header Authorization.
    const body = await req.text();

    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body,
    });

    // Erro upstream (401/404/429...): devolve corpo e status reais — nada de engolir.
    if (!upstream.ok || !upstream.body) {
      const errText = await upstream.text();
      return new Response(errText || JSON.stringify({ error: 'upstream error' }), {
        status: upstream.status,
        headers: { 'content-type': 'application/json', ...CORS_HEADERS },
      });
    }

    // Repassa o stream SSE da OpenAI diretamente ao cliente, sem bufferizar.
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

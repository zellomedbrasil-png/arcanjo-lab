// api/gemini.ts
// Vercel Edge Function — proxy seguro para a API do Google Gemini.
//
// A chave (GEMINI_API_KEY) reside SOMENTE no servidor — o browser nunca a vê.
// O cliente chama: POST /api/gemini?model=gemini-3.5-flash  (corpo = payload Gemini)
// e este proxy injeta a chave e encaminha para o endpoint generateContent do Google.

export const config = { runtime: 'edge' };

// Corrige TS2591 declarando process globalmente no Edge Runtime
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

  // Lê a chave secreta do ambiente (somente no servidor)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return json({ error: 'GEMINI_API_KEY não configurada na Vercel. Adicione no dashboard do projeto.' }, 500);
  }

  // Modelo vem como query param; remove eventual prefixo "google/"
  const reqUrl = new URL(req.url);
  const model = (reqUrl.searchParams.get('model') || 'gemini-3.5-flash').replace('google/', '');

  try {
    // Repassa o corpo (payload Gemini) verbatim
    const payload = await req.text();

    // Streaming SSE: streamGenerateContent com alt=sse devolve linhas "data: {json}".
    // O primeiro byte chega rápido, evitando 504, e o cliente preenche a nota progressivamente.
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: payload,
      }
    );

    // Erro upstream (400/401/429...): devolve corpo e status reais — sem engolir.
    if (!upstream.ok || !upstream.body) {
      const errText = await upstream.text();
      return new Response(errText || JSON.stringify({ error: 'upstream error' }), {
        status: upstream.status,
        headers: { 'content-type': 'application/json', ...CORS_HEADERS },
      });
    }

    // Repassa o stream SSE do Google diretamente ao cliente, sem bufferizar.
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

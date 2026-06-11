// api/claude.ts
// Vercel Serverless Function — proxy seguro para a API da Anthropic.
//
// Arquivo na RAIZ /api/claude.ts — a Vercel detecta automaticamente.
// A chave fica SOMENTE no servidor (Variável: ANTHROPIC_API_KEY sem VITE_).
// O browser nunca vê a chave.

// Compatível com Node.js Serverless Runtime (não Edge — evita incompatibilidades)
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS para dev local
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Lê a chave do ambiente do servidor (sem VITE_ prefix — nunca exposta no browser)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY não configurada na Vercel. Adicione em: vercel.com/project/settings/environment-variables'
    });
  }

  try {
    const { model, max_tokens, system, messages } = req.body as {
      model?: string;
      max_tokens?: number;
      system?: string;
      messages: Array<{ role: string; content: string }>;
    };

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        // Chamada servidor→servidor: sem CORS, sem o header "dangerous".
      },
      body: JSON.stringify({
        model: model ?? 'claude-sonnet-4-6',
        max_tokens: max_tokens ?? 4096,
        ...(system ? { system } : {}),
        messages,
      }),
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
}

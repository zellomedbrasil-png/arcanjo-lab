// api/openai-transcribe.ts
// Vercel Edge Function — proxy seguro para transcrição de áudio da OpenAI
// (gpt-4o-transcribe, o modelo de maior precisão do mercado em 2026).
//
// Espelho do /api/groq-transcribe: a chave (OPENAI_API_KEY) reside SOMENTE no
// servidor. O cliente envia os bytes do áudio e este proxy monta o multipart,
// injeta a chave e chama a API da OpenAI.
//
// O cliente envia: POST /api/openai-transcribe?ext=webm&lang=pt
//   corpo = bytes do áudio, header Content-Type = mime do áudio (ex: audio/webm)
//
// Limite de corpo do Edge Runtime (~4,5 MB) — os segmentos do SegmentedRecorder
// ficam ≤4,2 MB, então nunca estouram.

export const config = { runtime: 'edge' };

// Corrige TS2591 declarando process globalmente no Edge Runtime
declare const process: { env: { [key: string]: string | undefined } };

// Prompt de dominio clinico — mesmo texto do /api/groq-transcribe, para
// enviesar a transcrição ao vocabulario medico das especialidades do usuario.
const MEDICAL_PROMPT =
  'Consulta de Gastroenterologia, Geriatria e Clínica Geral, português do Brasil. ' +
  'Medicamentos: omeprazol, pantoprazol, domperidona, bromoprida, ondansetrona, mesalazina, azatioprina, ' +
  'rifaximina, lactulose, metformina, dapagliflozina, empagliflozina, losartana, anlodipino, espironolactona, ' +
  'furosemida, atorvastatina, rosuvastatina, clopidogrel, rivaroxabana, levotiroxina, donepezila, memantina, ' +
  'quetiapina, sertralina, escitalopram, gabapentina, pregabalina, dipirona. Diagnósticos: refluxo ' +
  'gastroesofágico, gastrite, úlcera péptica, Helicobacter pylori, síndrome do intestino irritável, doença de ' +
  'Crohn, retocolite ulcerativa, esteatose hepática, cirrose, pancreatite, disfagia, pirose, melena, demência, ' +
  'Alzheimer, Parkinson, fragilidade, delirium, polifarmácia, fibrilação atrial, DPOC. Exames: endoscopia, ' +
  'colonoscopia, TSH, hemoglobina glicada, creatinina, CID-10.';

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
    // 501: proxy não configurado — o cliente cai no fallback Whisper.
    return json({ error: 'OPENAI_API_KEY não configurada no servidor.' }, 501);
  }

  const reqUrl = new URL(req.url);
  const ext = (reqUrl.searchParams.get('ext') || 'webm').replace(/[^a-z0-9]/gi, '') || 'webm';
  const lang = (reqUrl.searchParams.get('lang') || 'pt').replace(/[^a-z-]/gi, '') || 'pt';
  const contentType = req.headers.get('content-type') || 'audio/webm';

  try {
    const audioBuf = await req.arrayBuffer();
    if (!audioBuf.byteLength) {
      return json({ error: 'Áudio vazio.' }, 400);
    }

    const form = new FormData();
    form.append('file', new File([audioBuf], `audio.${ext}`, { type: contentType }));
    form.append('model', 'gpt-4o-transcribe');
    form.append('language', lang);
    form.append('temperature', '0');
    // Prompt de dominio: orienta o modelo para o vocabulario clinico.
    form.append('prompt', MEDICAL_PROMPT);
    form.append('response_format', 'json');

    const upstream = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });

    const bodyText = await upstream.text();
    if (!upstream.ok) {
      return new Response(bodyText || JSON.stringify({ error: 'upstream error' }), {
        status: upstream.status,
        headers: { 'content-type': 'application/json', ...CORS_HEADERS },
      });
    }

    // Repassa o JSON da OpenAI ({ text: "..." }) verbatim.
    return new Response(bodyText, {
      status: 200,
      headers: { 'content-type': 'application/json', ...CORS_HEADERS },
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

// api/groq-transcribe.ts
// Vercel Edge Function — proxy seguro para a transcrição de áudio do Groq (Whisper).
//
// A chave (GROQ_API_KEY) reside SOMENTE no servidor — o browser/celular nunca a vê.
// Isso substitui o envio da chave do Groq pelo relay público ntfy.sh (vazamento).
//
// O cliente envia: POST /api/groq-transcribe?ext=webm&lang=pt
//   corpo = bytes do áudio, header Content-Type = mime do áudio (ex: audio/webm)
// e este proxy monta o multipart, injeta a chave e chama a API do Groq.
//
// Limite de corpo do Edge Runtime (~4,5 MB). Voz em Opus rende ~1 MB/8-10 min,
// então cobre consultas longas; arquivos maiores caem no fallback client-side do desktop.

export const config = { runtime: 'edge' };

// Corrige TS2591 declarando process globalmente no Edge Runtime
declare const process: { env: { [key: string]: string | undefined } };

// Prompt de dominio clinico — enviesa o Whisper para o vocabulario medico das
// especialidades do usuario (Gastroenterologia, Geriatria e Clinica Geral),
// melhorando o reconhecimento de medicamentos, diagnosticos e exames em pt-BR.
// Para ampliar: acrescente termos ao final da lista (o Whisper usa ~224 tokens).
const MEDICAL_PROMPT =
  'Transcrição de consulta de Gastroenterologia, Geriatria e Clínica Geral em português do Brasil. ' +
  'Medicamentos: omeprazol, pantoprazol, esomeprazol, domperidona, bromoprida, ondansetrona, mesalazina, ' +
  'azatioprina, budesonida, rifaximina, lactulose, metformina, gliclazida, dapagliflozina, empagliflozina, ' +
  'losartana, anlodipino, espironolactona, furosemida, atorvastatina, rosuvastatina, ezetimiba, clopidogrel, ' +
  'rivaroxabana, levotiroxina, donepezila, memantina, rivastigmina, quetiapina, sertralina, escitalopram, ' +
  'gabapentina, pregabalina, dipirona. Diagnósticos: doença do refluxo gastroesofágico, DRGE, gastrite, ' +
  'úlcera péptica, Helicobacter pylori, síndrome do intestino irritável, doença de Crohn, retocolite ulcerativa, ' +
  'esteatose hepática, cirrose, pancreatite, diverticulite, disfagia, pirose, melena, demência, doença de Alzheimer, ' +
  'Parkinson, fragilidade, sarcopenia, delirium, polifarmácia, fibrilação atrial, DPOC. Exames: endoscopia digestiva alta, ' +
  'colonoscopia, TGO, TGP, gama-GT, TSH, hemoglobina glicada, creatinina, CID-10.';

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

  // Chave secreta lida do ambiente do servidor (aceita GROQ_API_KEY ou o legado VITE_GROQ_API_KEY)
  const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    // 501: proxy não configurado — o cliente decide se cai no fallback com a própria chave.
    return json({ error: 'GROQ_API_KEY não configurada no servidor.' }, 501);
  }

  const reqUrl = new URL(req.url);
  const ext = (reqUrl.searchParams.get('ext') || 'webm').replace(/[^a-z0-9]/gi, '') || 'webm';
  const lang = (reqUrl.searchParams.get('lang') || 'pt').replace(/[^a-z-]/gi, '') || 'pt';
  // Modelo configuravel por query (?model=). Padrao: whisper-large-v3 completo —
  // mais preciso que o turbo para termos clinicos (prioriza precisao sobre latencia).
  const model = (reqUrl.searchParams.get('model') || 'whisper-large-v3').replace(/[^a-z0-9.-]/gi, '') || 'whisper-large-v3';
  const contentType = req.headers.get('content-type') || 'audio/webm';

  try {
    const audioBuf = await req.arrayBuffer();
    if (!audioBuf.byteLength) {
      return json({ error: 'Áudio vazio.' }, 400);
    }

    const form = new FormData();
    form.append('file', new File([audioBuf], `audio.${ext}`, { type: contentType }));
    form.append('model', model);
    form.append('language', lang);
    form.append('temperature', '0');
    // Prompt de dominio: orienta o Whisper para o vocabulario clinico
    // (medicamentos, doses, exames, CID), melhorando os termos medicos.
    form.append('prompt', MEDICAL_PROMPT);
    form.append('response_format', 'json');

    const upstream = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
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

    // Repassa o JSON do Groq ({ text: "..." }) verbatim.
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

// src/services/transcription.ts
// Registry dos motores de transcrição e transcrição por blob (gravação → texto).
//
// Motores:
//   whisper      — Groq Whisper Large v3 Turbo. Vai pelo proxy /api/groq-transcribe
//                  (chave no servidor). No desktop cai no client-side se o proxy
//                  não estiver configurado ou o arquivo passar do limite do Edge.
//   gemini       — Gemini áudio nativo (multimodal) pelo proxy /api/gemini existente.
//   google-live  — Ditado ao vivo (Web Speech API). NÃO usa blob; ver liveSpeech.ts.
//
// A escolha fica em localStorage e vale para desktop e celular.

import { groq } from '../config/groq';

export type TranscriptionEngine = 'whisper' | 'gemini' | 'google-live';

export interface TranscriptionEngineMeta {
  id: TranscriptionEngine;
  label: string;
  note: string;
  /** true = transcreve em tempo real (sem gravar/enviar blob). */
  live: boolean;
}

export const TRANSCRIPTION_ENGINES: TranscriptionEngineMeta[] = [
  {
    id: 'whisper',
    label: 'Whisper (Groq) ⚡',
    note: 'Recomendado — transcrição fiel e estável para consultas médicas',
    live: false,
  },
  {
    id: 'google-live',
    label: 'Ditado ao vivo (Google) 🎙️',
    note: 'Tempo real, mas só no Chrome/Edge e depende da rede — menos preciso em termos técnicos',
    live: true,
  },
  {
    id: 'gemini',
    label: 'Gemini (áudio) 🧠',
    note: 'Alternativa por IA — pode parafrasear; confira o texto antes de usar',
    live: false,
  },
];

const STORAGE_KEY = 'arcanjo_transcription_engine';

export function getTranscriptionEngine(): TranscriptionEngine {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && TRANSCRIPTION_ENGINES.some((e) => e.id === saved)) {
    return saved as TranscriptionEngine;
  }
  return 'whisper';
}

export function setTranscriptionEngine(engine: TranscriptionEngine): void {
  localStorage.setItem(STORAGE_KEY, engine);
}

export function getEngineMeta(engine: TranscriptionEngine): TranscriptionEngineMeta {
  return TRANSCRIPTION_ENGINES.find((e) => e.id === engine) ?? TRANSCRIPTION_ENGINES[0];
}

/** Extrai a extensão de arquivo suportada a partir do mime-type do MediaRecorder. */
export function extensionForMime(mimeType: string): string {
  let extension = 'webm';
  if (mimeType) {
    const cleanMime = mimeType.split(';')[0];
    extension = cleanMime.split('/')[1] || 'webm';
  }
  if (extension === 'x-m4a' || extension === 'aac') extension = 'm4a';
  return extension;
}

/** AbortSignal que dispara depois de `ms`. Retorna { signal, clear }. */
function timeoutSignal(ms: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort('timeout'), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

const MAX_AUDIO_BYTES = 25 * 1024 * 1024; // limite da API Whisper
const GEMINI_AUDIO_TIMEOUT_MS = 120_000;

// Cadeia de tentativas do Whisper: 1ª com o modelo completo (precisão); se
// falhar (timeout/rede/limite de taxa), cai no turbo — mais rápido e com
// limites maiores no Groq. Cada tentativa tem seu próprio timeout generoso,
// pois o upload pelo celular + processamento podem demorar em rede fraca.
const WHISPER_ATTEMPTS: Array<{ model: string; timeoutMs: number }> = [
  { model: 'whisper-large-v3', timeoutMs: 120_000 },
  { model: 'whisper-large-v3-turbo', timeoutMs: 90_000 },
];

// Prompt de domínio clínico para o fallback client-side (em sincronia com o do
// proxy api/groq-transcribe.ts). LIMITE DO GROQ: 896 BYTES UTF-8 (~882 aqui).
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

// ─── Whisper (Groq) via proxy, com fallback client-side ─────────────────────────

async function transcribeWhisperProxy(blob: Blob, mimeType: string, signal: AbortSignal, model: string): Promise<string | null> {
  const ext = extensionForMime(mimeType);
  const url = `/api/groq-transcribe?ext=${encodeURIComponent(ext)}&lang=pt&model=${encodeURIComponent(model)}`;
  const response = await fetch(url, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': mimeType || 'audio/webm' },
    body: blob,
  });

  // 501 = proxy sem chave no servidor → sinaliza fallback (null).
  if (response.status === 501) return null;

  const text = await response.text();
  if (!response.ok) {
    // 413 = corpo maior que o limite do Edge (~4,5 MB). Com a gravação em
    // segmentos isto é raro; mensagem clara em vez do erro técnico cru.
    if (response.status === 413) {
      throw new Error('Este trecho de áudio ficou grande demais para o servidor. Grave em partes mais curtas ou use o Ditado ao vivo (sem limite de tamanho).');
    }
    let msg = text;
    try {
      msg = JSON.parse(text).error || text;
    } catch {
      // usa text cru
    }
    throw new Error(`Whisper ${response.status}: ${String(msg).slice(0, 200)}`);
  }

  const data = JSON.parse(text) as { text?: string };
  return (data.text || '').trim();
}

async function transcribeWhisperClient(blob: Blob, mimeType: string, signal: AbortSignal, model = 'whisper-large-v3'): Promise<string> {
  const ext = extensionForMime(mimeType);
  const file = new File([blob], `audio.${ext}`, { type: mimeType || 'audio/webm' });
  const transcription = await groq.audio.transcriptions.create(
    // modelo completo + prompt clínico = melhor precisão em termos médicos.
    { file, model, language: 'pt', temperature: 0, prompt: MEDICAL_PROMPT },
    { signal },
  );
  return (transcription.text || '').trim();
}

/** Erros transitórios que valem uma nova tentativa (abort/timeout, rede, 429, 5xx). */
function isRetriableWhisperError(err: unknown): boolean {
  if (isTimeoutAbort(err)) return true;
  if (err instanceof TypeError) return true; // falha de rede do fetch
  if (err instanceof Error) {
    if (/Whisper (429|5\d\d)/.test(err.message)) return true;
  }
  return false;
}

// ─── Gemini áudio nativo via /api/gemini ────────────────────────────────────────

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler o áudio.'));
    reader.onload = () => {
      const result = reader.result as string;
      // result = "data:audio/webm;base64,XXXX" → mantém só o base64
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.readAsDataURL(blob);
  });
}

async function transcribeGemini(blob: Blob, mimeType: string, signal: AbortSignal): Promise<string> {
  const base64 = await blobToBase64(blob);
  const cleanMime = (mimeType || 'audio/webm').split(';')[0];

  const payload = {
    contents: [
      {
        parts: [
          {
            text:
              'Transcreva integralmente o áudio a seguir em português do Brasil. ' +
              'Devolva SOMENTE o texto falado, sem comentários, sem cabeçalhos e sem marcações de tempo.',
          },
          { inlineData: { mimeType: cleanMime, data: base64 } },
        ],
      },
    ],
    generationConfig: { temperature: 0, maxOutputTokens: 8192 },
  };

  const response = await fetch('/api/gemini?model=gemini-2.5-flash', {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok || !response.body) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Gemini ${response.status}: ${errText.slice(0, 200)}`);
  }

  // Lê o SSE (mesmo formato do callGemini): linhas "data: {json}".
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payloadStr = trimmed.slice(5).trim();
        if (!payloadStr) continue;
        let evt: {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
          error?: { message?: string };
        };
        try {
          evt = JSON.parse(payloadStr);
        } catch {
          continue;
        }
        if (evt.error) throw new Error(`Gemini: ${evt.error.message ?? 'erro no stream'}`);
        const partText = evt.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
        if (partText) fullText += partText;
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullText.trim();
}

// ─── Entrada única ──────────────────────────────────────────────────────────────

/**
 * Transcreve um blob de áudio com o motor indicado (whisper | gemini).
 * `google-live` não passa por aqui — é tempo real (liveSpeech.ts).
 */
export async function transcribeAudioBlob(
  blob: Blob,
  mimeType: string,
  engine: Exclude<TranscriptionEngine, 'google-live'>,
): Promise<string> {
  if (blob.size > MAX_AUDIO_BYTES) {
    throw new Error('O áudio gravado é muito grande (limite de 25MB). Faça gravações mais curtas.');
  }

  if (engine === 'gemini') {
    const { signal, clear } = timeoutSignal(GEMINI_AUDIO_TIMEOUT_MS);
    try {
      return await transcribeGemini(blob, mimeType, signal);
    } finally {
      clear();
    }
  }

  // whisper
  const hasClientKey = !!(localStorage.getItem('arcanjo_groq_key') || import.meta.env.VITE_GROQ_API_KEY);

  // Em DEV o proxy /api/groq-transcribe não existe (Vite não roda as edge functions).
  // Com chave client-side, transcreve direto — sem o fetch que falharia e polui o console.
  if (import.meta.env.DEV && hasClientKey) {
    const { signal, clear } = timeoutSignal(WHISPER_ATTEMPTS[0].timeoutMs);
    try {
      return await transcribeWhisperClient(blob, mimeType, signal);
    } finally {
      clear();
    }
  }

  // Cadeia de tentativas no proxy: modelo completo → turbo. Retenta em erros
  // transitórios (timeout/rede/limite de taxa). Erros definitivos (413/formato)
  // sobem na hora. 501 (proxy sem chave) → cai no fallback client-side.
  let lastErr: unknown = new Error('Falha na transcrição.');
  for (const attempt of WHISPER_ATTEMPTS) {
    const { signal, clear } = timeoutSignal(attempt.timeoutMs);
    try {
      const viaProxy = await transcribeWhisperProxy(blob, mimeType, signal, attempt.model);
      clear();
      if (viaProxy === null) break; // 501 → fallback client-side
      return viaProxy;
    } catch (err) {
      clear();
      lastErr = err;
      // Definitivos: não adianta repetir nem trocar de modelo.
      if (err instanceof Error && (err.message.includes('grande demais') || /Whisper 40[013]/.test(err.message))) {
        throw err;
      }
      // Transitório → aguarda um instante e tenta a próxima (turbo).
      if (isRetriableWhisperError(err)) {
        await new Promise((r) => setTimeout(r, 800));
        continue;
      }
      // Erro de rede genérico do proxy → tenta fallback client-side.
      break;
    }
  }

  // Fallback: chave client-side (desktop). No celular não há chave → erro claro.
  if (!hasClientKey) {
    if (isTimeoutAbort(lastErr)) {
      throw new Error('A transcrição demorou demais (rede ou servidor ocupado). Tente novamente.');
    }
    throw lastErr instanceof Error ? lastErr : new Error('Transcrição Whisper indisponível.');
  }
  const { signal, clear } = timeoutSignal(WHISPER_ATTEMPTS[0].timeoutMs);
  try {
    return await transcribeWhisperClient(blob, mimeType, signal);
  } finally {
    clear();
  }
}

/**
 * Transcreve uma lista de segmentos de áudio (na ordem) e concatena o texto.
 * Cada segmento passa por transcribeAudioBlob (proxy Whisper ou Gemini).
 * Segmentos vazios/sem fala são ignorados.
 */
export async function transcribeSegments(
  segments: Blob[],
  mimeType: string,
  engine: Exclude<TranscriptionEngine, 'google-live'>,
): Promise<string> {
  const parts: string[] = [];
  for (const seg of segments) {
    if (!seg || seg.size === 0) continue;
    const text = await transcribeAudioBlob(seg, mimeType, engine);
    if (text && text.trim()) parts.push(text.trim());
  }
  return parts.join(' ').trim();
}

/** Mensagem amigável para erros de abort/timeout. */
export function isTimeoutAbort(err: unknown): boolean {
  return (
    (err instanceof DOMException && err.name === 'AbortError') ||
    (err instanceof Error && (err.message === 'timeout' || err.name === 'AbortError'))
  );
}

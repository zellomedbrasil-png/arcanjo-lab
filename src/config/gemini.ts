import { groq } from './groq';
import { toast } from '../lib/toast';

// ─── API Keys (hardcoded + localStorage override) ─────────────────────────────

export function getGeminiApiKey(): string {
  return (
    (globalThis as any)._customGeminiKey ||
    localStorage.getItem('arcanjo_gemini_key') ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    'AIzaSyDDJiGD6GhS2g0NYCWRedgVgrRNwux1PA8'
  );
}

export function getOpenRouterApiKey(): string {
  return (
    localStorage.getItem('arcanjo_openrouter_key') ||
    import.meta.env.VITE_OPENROUTER_API_KEY ||
    ''
  );
}

// ─── Timeout & Abort ──────────────────────────────────────────────────────────

/** Timeout padrão em ms. Alterável pelo usuário. */
const DEFAULT_TIMEOUT_MS = 12_000;

// Referência global ao AbortController ativo — permite cancelar da UI
let _activeAbortController: AbortController | null = null;

/** Cancela imediatamente qualquer chamada de IA em andamento. */
export function cancelAIRequest(): void {
  if (_activeAbortController) {
    _activeAbortController.abort('user_cancel');
    _activeAbortController = null;
  }
}

/** Cria um AbortController com timeout automático. Retorna { signal, clear }. */
function createTimeoutSignal(ms = DEFAULT_TIMEOUT_MS): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  _activeAbortController = controller;
  const timer = setTimeout(() => controller.abort('timeout'), ms);
  return {
    signal: controller.signal,
    clear: () => {
      clearTimeout(timer);
      if (_activeAbortController === controller) _activeAbortController = null;
    },
  };
}

// ─── Available models (used in the UI selector) ───────────────────────────────

export interface AIModel {
  id: string;
  label: string;
  badge: string;
  provider: 'gemini' | 'openrouter';
  note?: string;
  /** Timeout override in ms — slower models get a bit more time */
  timeoutMs?: number;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash ⚡',
    badge: 'Gemini 2.5 Flash',
    provider: 'gemini',
    note: 'Padrão — grátis, rápido',
    timeoutMs: 11_000,
  },
  {
    id: 'anthropic/claude-3-5-haiku',
    label: 'Claude 3.5 Haiku',
    badge: 'Claude 3.5 Haiku (OpenRouter)',
    provider: 'openrouter',
    note: '~1s — melhor custo/benefício',
    timeoutMs: 10_000,
  },
  {
    id: 'openai/gpt-4o-mini',
    label: 'GPT-4o Mini',
    badge: 'GPT-4o Mini (OpenRouter)',
    provider: 'openrouter',
    note: '~1s — boa qualidade',
    timeoutMs: 10_000,
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    label: 'Llama 3.3 70B',
    badge: 'Llama 3.3 70B (OpenRouter)',
    provider: 'openrouter',
    note: '~1s — open source',
    timeoutMs: 12_000,
  },
  {
    id: 'qwen/qwen3-235b-a22b',
    label: 'Qwen3 235B',
    badge: 'Qwen3 235B (OpenRouter)',
    provider: 'openrouter',
    note: '~1.7s — alta qualidade',
    timeoutMs: 14_000,
  },
  {
    id: 'nousresearch/hermes-3-llama-3.1-70b',
    label: 'Hermes 3 Llama 70B (Free)',
    badge: 'Hermes 3 Llama 70B (OpenRouter)',
    provider: 'openrouter',
    note: '~0.3s — gratuito',
    timeoutMs: 12_000,
  },
];

export function getDefaultModelId(): string {
  return localStorage.getItem('arcanjo_selected_model') || 'gemini-2.5-flash';
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AICallParams {
  prompt: string;
  systemInstruction?: string;
  jsonMode?: boolean;
  temperature?: number;
}

let lastUsedModel = '';
export function getLastUsedModel(): string {
  return lastUsedModel;
}

// ─── Error helpers ─────────────────────────────────────────────────────────────

function isAbortError(err: unknown): boolean {
  return (
    err instanceof DOMException && err.name === 'AbortError' ||
    (err instanceof Error && (err.message === 'timeout' || err.message === 'user_cancel' || err.name === 'AbortError'))
  );
}

// ─── OpenRouter ────────────────────────────────────────────────────────────────

async function callOpenRouter(
  params: AICallParams,
  modelId: string,
  signal: AbortSignal
): Promise<string> {
  const apiKey = getOpenRouterApiKey();
  const messages: Array<{ role: string; content: string }> = [];
  if (params.systemInstruction) messages.push({ role: 'system', content: params.systemInstruction });
  messages.push({ role: 'user', content: params.prompt });

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://arcanjo-lab.vercel.app',
      'X-Title': 'Arcanjo Lab',
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      temperature: typeof params.temperature === 'number' ? params.temperature : 0.2,
      max_tokens: 1200,
    }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    let errMsg = responseText;
    try {
      const errObj = JSON.parse(responseText);
      errMsg = errObj.error?.message || responseText;
    } catch (_) {}
    throw new Error(`OpenRouter ${response.status}: ${errMsg}`);
  }

  let data: any;
  try { data = JSON.parse(responseText); } catch (_) {
    throw new Error(`Resposta inválida do OpenRouter: ${responseText.substring(0, 200)}`);
  }

  const text = data.choices?.[0]?.message?.content || '';
  if (!text.trim()) throw new Error('OpenRouter retornou resposta vazia.');
  return text.trim();
}

// ─── Gemini ────────────────────────────────────────────────────────────────────

export async function callGemini(
  params: AICallParams,
  modelId = 'gemini-2.5-flash',
  signal?: AbortSignal
): Promise<string> {
  const apiKey = getGeminiApiKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  const payload: {
    contents: Array<{ parts: Array<{ text: string }> }>;
    generationConfig: {
      temperature: number;
      maxOutputTokens: number;
      responseMimeType?: string;
      thinkingConfig?: { thinkingBudget: number };
    };
    systemInstruction?: { parts: Array<{ text: string }> };
  } = {
    contents: [{ parts: [{ text: params.prompt }] }],
    generationConfig: {
      temperature: typeof params.temperature === 'number' ? params.temperature : 0.2,
      maxOutputTokens: 1200,
    },
  };

  // Desativa o "thinking" do Gemini 2.5 — responde 3-5x mais rápido, suficiente para SOAP/justificativa
  if (modelId.includes('2.5')) {
    payload.generationConfig.thinkingConfig = { thinkingBudget: 0 };
  }

  if (params.systemInstruction) {
    payload.systemInstruction = { parts: [{ text: params.systemInstruction }] };
  }
  if (params.jsonMode) {
    payload.generationConfig.responseMimeType = 'application/json';
  }

  const response = await fetch(url, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Gemini ${response.status}: ${errText.substring(0, 200)}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== 'string' || !text.trim()) throw new Error('Gemini: sem texto na resposta.');

  const m = AI_MODELS.find((m) => m.id === modelId);
  lastUsedModel = m?.badge ?? `Gemini (${modelId})`;
  return text.trim();
}

// ─── Dispatcher principal ──────────────────────────────────────────────────────

/**
 * Roteador principal com timeout por modelo e fallback automático.
 *
 * Fluxo de fallback quando timeout ou erro:
 *   Modelo selecionado → Claude 3.5 Haiku → Llama 3.3 70B → Erro
 *
 * Retorna string com o texto gerado.
 * Lança erro somente se todos os fallbacks falharem ou se o usuário cancelou.
 */
export async function callAI(params: AICallParams, modelId?: string): Promise<string> {
  const selectedModelId = modelId || getDefaultModelId();
  const modelMeta = AI_MODELS.find((m) => m.id === selectedModelId);
  const timeoutMs = modelMeta?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  // Fila de modelos a tentar: selecionado → Claude 3.5 Haiku → Llama 3.3
  const fallbackChain: Array<{ id: string; badge: string; provider: 'gemini' | 'openrouter'; timeoutMs: number }> = [
    {
      id: selectedModelId,
      badge: modelMeta?.badge ?? selectedModelId,
      provider: modelMeta?.provider ?? 'openrouter',
      timeoutMs,
    },
  ];

  // Adiciona fallbacks apenas se não forem o próprio modelo selecionado
  if (selectedModelId !== 'anthropic/claude-3-5-haiku') {
    fallbackChain.push({
      id: 'anthropic/claude-3-5-haiku',
      badge: 'Claude 3.5 Haiku (fallback)',
      provider: 'openrouter',
      timeoutMs: 9_000,
    });
  }
  if (selectedModelId !== 'meta-llama/llama-3.3-70b-instruct') {
    fallbackChain.push({
      id: 'meta-llama/llama-3.3-70b-instruct',
      badge: 'Llama 3.3 70B (fallback)',
      provider: 'openrouter',
      timeoutMs: 9_000,
    });
  }

  let lastErr: unknown = new Error('Todos os modelos falharam.');

  for (const model of fallbackChain) {
    const { signal, clear } = createTimeoutSignal(model.timeoutMs);

    try {
      let text: string;

      if (model.provider === 'gemini') {
        text = await callGemini(params, model.id, signal);
      } else {
        text = await callOpenRouter(params, model.id, signal);
        lastUsedModel = model.badge;
      }

      clear();
      return text;

    } catch (err: unknown) {
      clear();

      // Cancelamento pelo usuário — para imediatamente, não tenta fallback.
      // O motivo fica em signal.reason (definido por controller.abort('user_cancel' | 'timeout')),
      // pois o DOMException de abort não carrega essa informação.
      if (isAbortError(err)) {
        if (signal.reason === 'user_cancel') {
          throw new Error('Geração cancelada pelo usuário.');
        }
        // Timeout — informa e tenta o próximo
        const isLast = model === fallbackChain[fallbackChain.length - 1];
        if (!isLast) {
          const nextModel = fallbackChain[fallbackChain.indexOf(model) + 1];
          console.warn(`${model.id} excedeu ${model.timeoutMs / 1000}s. Tentando ${nextModel.id}...`);
          toast.info(`Tempo limite (${model.timeoutMs / 1000}s). Tentando modelo mais rápido...`);
        }
        lastErr = err;
        continue;
      }

      // Erro 404 / sem endpoint — tenta próximo sem avisar
      if (err instanceof Error && (err.message.includes('404') || err.message.includes('No endpoints'))) {
        lastErr = err;
        continue;
      }

      // Outro erro — tenta próximo com aviso
      const isLast = model === fallbackChain[fallbackChain.length - 1];
      if (!isLast) {
        console.warn(`${model.id} falhou: ${(err as Error).message}. Tentando fallback...`);
        toast.info('Modelo indisponível. Tentando alternativa...');
      }
      lastErr = err;
    }
  }

  // Groq direto como último recurso (usa a chave Groq configurada)
  try {
    const groqKey = localStorage.getItem('arcanjo_groq_key') || import.meta.env.VITE_GROQ_API_KEY || '';
    if (groqKey) {
      const completion = await groq.chat.completions.create({
        messages: [
          ...(params.systemInstruction ? [{ role: 'system' as const, content: params.systemInstruction }] : []),
          { role: 'user' as const, content: params.prompt },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: typeof params.temperature === 'number' ? params.temperature : 0.2,
        max_tokens: 1200,
      });
      const text = completion.choices[0]?.message?.content || '';
      if (text.trim()) {
        lastUsedModel = 'Llama 3.3 70B (Groq)';
        return text.trim();
      }
    }
  } catch (groqErr) {
    console.warn('Groq direto também falhou.', groqErr);
  }

  throw lastErr;
}

import { groq } from './groq';
import { toast } from '../lib/toast';

// ─── API Keys (hardcoded + localStorage override) ─────────────────────────────

export function getGeminiApiKey(): string {
  return (
    (globalThis as any)._customGeminiKey ||
    localStorage.getItem('arcanjo_gemini_key') ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    ''
  );
}

export function hasCustomGeminiKey(): boolean {
  const customKey = (globalThis as any)._customGeminiKey || localStorage.getItem('arcanjo_gemini_key');
  if (customKey) return true;
  
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  return !!envKey && envKey !== 'AIzaSyDDJiGD6GhS2g0NYCWRedgVgrRNwux1PA8';
}

export function getOpenRouterApiKey(): string {
  return (
    (globalThis as any)._customOpenRouterKey ||
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
  provider: 'gemini' | 'openrouter' | 'groq';
  note?: string;
  /** Timeout override in ms — slower models get a bit more time */
  timeoutMs?: number;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'llama-3.3-70b-versatile',
    label: 'Llama 3.3 70B (Groq) 🚀',
    badge: 'Llama 3.3 70B (Groq)',
    provider: 'groq',
    note: 'Ultra rápido e preciso',
    timeoutMs: 5_000,
  },
  {
    id: 'llama-3.1-8b-instant',
    label: 'Llama 3.1 8B (Groq)',
    badge: 'Llama 3.1 8B (Groq)',
    provider: 'groq',
    note: 'Velocidade instantânea',
    timeoutMs: 4_000,
  },
  {
    id: 'google/gemini-2.5-flash',
    label: 'Gemini 2.5 Flash ⚡',
    badge: 'Gemini 2.5 Flash (OpenRouter)',
    provider: 'openrouter',
    note: 'Padrão — rápido e estável',
    timeoutMs: 8_000,
  },
  {
    id: 'anthropic/claude-3-5-haiku',
    label: 'Claude 3.5 Haiku',
    badge: 'Claude 3.5 Haiku (OpenRouter)',
    provider: 'openrouter',
    note: 'Melhor custo/benefício',
    timeoutMs: 8_000,
  },
  {
    id: 'openai/gpt-4o-mini',
    label: 'GPT-4o Mini',
    badge: 'GPT-4o Mini (OpenRouter)',
    provider: 'openrouter',
    note: 'Excelente custo/benefício',
    timeoutMs: 6_000,
  },
  {
    id: 'deepseek/deepseek-chat',
    label: 'DeepSeek V3',
    badge: 'DeepSeek V3 (OpenRouter)',
    provider: 'openrouter',
    note: 'Raciocínio clínico avançado',
    timeoutMs: 12_000,
  },
  {
    id: 'anthropic/claude-3-5-sonnet',
    label: 'Claude 3.5 Sonnet 👑',
    badge: 'Claude 3.5 Sonnet (OpenRouter)',
    provider: 'openrouter',
    note: 'Inteligência máxima clínica',
    timeoutMs: 12_000,
  },
  {
    id: 'google/gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    badge: 'Gemini 2.5 Pro (OpenRouter)',
    provider: 'openrouter',
    note: 'Inteligência máxima do Google',
    timeoutMs: 12_000,
  },
];

export function getDefaultModelId(): string {
  return localStorage.getItem('arcanjo_selected_model') || 'llama-3.3-70b-versatile';
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

  const body: any = {
    model: modelId,
    messages,
    temperature: typeof params.temperature === 'number' ? params.temperature : 0.2,
    max_tokens: 1200,
  };

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://arcanjo-lab.vercel.app',
      'X-Title': 'Arcanjo Lab',
    },
    body: JSON.stringify(body),
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

// ─── Groq ──────────────────────────────────────────────────────────────────────

async function callGroq(
  params: AICallParams,
  modelId: string,
  signal?: AbortSignal
): Promise<string> {
  const apiKey = localStorage.getItem('arcanjo_groq_key') || import.meta.env.VITE_GROQ_API_KEY || '';
  if (!apiKey) {
    throw new Error('Chave de API do Groq não configurada.');
  }

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
  if (params.systemInstruction) {
    messages.push({ role: 'system', content: params.systemInstruction });
  }
  messages.push({ role: 'user', content: params.prompt });

  const options: any = {
    model: modelId,
    messages,
    temperature: typeof params.temperature === 'number' ? params.temperature : 0.2,
    max_tokens: 1200,
  };

  const completion = await groq.chat.completions.create(options, { signal });

  const text = completion.choices[0]?.message?.content || '';
  if (!text.trim()) throw new Error('Groq retornou resposta vazia.');

  const m = AI_MODELS.find((m) => m.id === modelId);
  lastUsedModel = m?.badge ?? `Groq (${modelId})`;
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

  const m = AI_MODELS.find((m) => m.id === modelId || m.id.replace('google/', '') === modelId);
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

  // Fila de modelos a tentar
  const fallbackChain: Array<{ id: string; badge: string; provider: 'gemini' | 'openrouter' | 'groq'; timeoutMs: number }> = [];

  // 1. O modelo selecionado pelo usuário
  fallbackChain.push({
    id: selectedModelId,
    badge: modelMeta?.badge ?? selectedModelId,
    provider: modelMeta?.provider ?? 'openrouter',
    timeoutMs,
  });

  // 2. Fallbacks multi-provedor inteligentes
  const primaryProvider = modelMeta?.provider ?? 'openrouter';

  if (primaryProvider === 'groq') {
    // Se o principal for Groq, fallbacks devem ser fora do Groq (OpenRouter/Gemini Direct)
    fallbackChain.push({
      id: 'google/gemini-2.5-flash',
      badge: 'Gemini 2.5 Flash (fallback)',
      provider: 'openrouter',
      timeoutMs: 8_000,
    });
    fallbackChain.push({
      id: 'openai/gpt-4o-mini',
      badge: 'GPT-4o Mini (fallback)',
      provider: 'openrouter',
      timeoutMs: 6_000,
    });
  } else {
    // Se o principal for OpenRouter/Gemini, fallback 1 deve ser Groq (ultra rápido e independente)
    fallbackChain.push({
      id: 'llama-3.3-70b-versatile',
      badge: 'Llama 3.3 70B Groq (fallback)',
      provider: 'groq',
      timeoutMs: 5_000,
    });
    // Fallback 2: GPT-4o Mini se o selecionado não for ele mesmo
    if (selectedModelId !== 'openai/gpt-4o-mini') {
      fallbackChain.push({
        id: 'openai/gpt-4o-mini',
        badge: 'GPT-4o Mini (fallback)',
        provider: 'openrouter',
        timeoutMs: 6_000,
      });
    } else {
      fallbackChain.push({
        id: 'google/gemini-2.5-flash',
        badge: 'Gemini 2.5 Flash (fallback)',
        provider: 'openrouter',
        timeoutMs: 8_000,
      });
    }
  }

  let lastErr: unknown = new Error('Todos os modelos falharam.');

  for (const model of fallbackChain) {
    const { signal, clear } = createTimeoutSignal(model.timeoutMs);

    try {
      let text: string;
      let targetProvider = model.provider;
      let targetModelId = model.id;

      // Se for um modelo Gemini (Flash/Pro) e tivermos chave própria da Gemini,
      // roteamos diretamente para a API oficial do Google para melhor latência e sem custo de proxy.
      if (model.id.includes('gemini') && hasCustomGeminiKey()) {
        targetProvider = 'gemini';
        targetModelId = model.id.replace('google/', ''); // ex: google/gemini-2.5-flash -> gemini-2.5-flash
      }

      if (targetProvider === 'gemini') {
        text = await callGemini(params, targetModelId, signal);
      } else if (targetProvider === 'groq') {
        text = await callGroq(params, targetModelId, signal);
      } else {
        text = await callOpenRouter(params, targetModelId, signal);
        lastUsedModel = model.badge;
      }

      clear();
      return text;

    } catch (err: unknown) {
      clear();

      // Cancelamento pelo usuário — para imediatamente, não tenta fallback.
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

      // Se for erro de Autenticação (401) ou Saldo (402) no OpenRouter, não tenta os outros modelos do OpenRouter
      if (err instanceof Error && (err.message.includes('OpenRouter 401') || err.message.includes('OpenRouter 402'))) {
        console.warn('Erro de autenticação ou saldo no OpenRouter. Pulando próximos fallbacks do OpenRouter.');
        toast.error('Problema com chaves ou créditos no OpenRouter. Indo para fallback da Groq.');
        
        let i = fallbackChain.indexOf(model) + 1;
        while (i < fallbackChain.length) {
          if (fallbackChain[i].provider === 'openrouter') {
            fallbackChain.splice(i, 1);
          } else {
            i++;
          }
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

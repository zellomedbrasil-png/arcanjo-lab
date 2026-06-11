import { groq } from './groq';
import { toast } from '../lib/toast';

// ─── API Keys (env + localStorage override) ───────────────────────────────────

export function getGeminiApiKey(): string {
  return (
    (globalThis as typeof globalThis & { _customGeminiKey?: string })._customGeminiKey ||
    localStorage.getItem('arcanjo_gemini_key') ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    ''
  );
}

export function hasCustomGeminiKey(): boolean {
  const customKey = (globalThis as typeof globalThis & { _customGeminiKey?: string })._customGeminiKey || localStorage.getItem('arcanjo_gemini_key');
  if (customKey) return true;

  return !!import.meta.env.VITE_GEMINI_API_KEY;
}

export function getOpenRouterApiKey(): string {
  return (
    (globalThis as typeof globalThis & { _customOpenRouterKey?: string })._customOpenRouterKey ||
    localStorage.getItem('arcanjo_openrouter_key') ||
    import.meta.env.VITE_OPENROUTER_API_KEY ||
    ''
  );
}

export function getAnthropicApiKey(): string {
  return (
    (globalThis as typeof globalThis & { _customAnthropicKey?: string })._customAnthropicKey ||
    localStorage.getItem('arcanjo_anthropic_key') ||
    import.meta.env.VITE_ANTHROPIC_API_KEY ||
    ''
  );
}

export function hasCustomAnthropicKey(): boolean {
  const customKey = (globalThis as typeof globalThis & { _customAnthropicKey?: string })._customAnthropicKey || localStorage.getItem('arcanjo_anthropic_key');
  if (customKey) return true;

  return !!import.meta.env.VITE_ANTHROPIC_API_KEY;
}

// ─── Timeout & Abort ──────────────────────────────────────────────────────────

/** Timeout padrão em ms. Alterável pelo usuário. */
const DEFAULT_TIMEOUT_MS = 30_000;

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
  provider: 'gemini' | 'openrouter' | 'groq' | 'anthropic';
  note?: string;
  /** Timeout override in ms — slower models get a bit more time */
  timeoutMs?: number;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'claude-sonnet-4-6',
    label: 'Claude Sonnet 4.6 🧠',
    badge: 'Claude Sonnet 4.6',
    provider: 'anthropic',
    note: 'Modelo de alta performance da Anthropic (Direct API)',
    timeoutMs: 30_000,
  },
  {
    id: 'google/gemini-3.5-flash',
    label: 'Gemini 3.5 Flash ⚡',
    badge: 'Gemini 3.5 Flash',
    provider: 'openrouter',
    note: 'Mais recente e inteligente do Google',
    timeoutMs: 15_000,
  },
  {
    id: 'google/gemini-3-flash-preview',
    label: 'Gemini 3 Flash Preview ⚡',
    badge: 'Gemini 3 Flash (OpenRouter)',
    provider: 'openrouter',
    note: 'Padrão — Nova geração do Google experimental',
    timeoutMs: 25_000,
  },
  {
    id: 'llama-3.3-70b-versatile',
    label: 'Llama 3.3 70B (Groq) 🚀',
    badge: 'Llama 3.3 70B (Groq)',
    provider: 'groq',
    note: 'Ultra rápido e preciso',
    timeoutMs: 8_000,
  },
  {
    id: 'openai/gpt-5.4-mini',
    label: 'GPT-5.4 Mini 🧠',
    badge: 'GPT-5.4 Mini (OpenRouter)',
    provider: 'openrouter',
    note: 'Nova geração custo/benefício da OpenAI',
    timeoutMs: 20_000,
  },
  {
    id: 'anthropic/claude-3.5-haiku',
    label: 'Claude 3.5 Haiku 🍃',
    badge: 'Claude 3.5 Haiku (OpenRouter)',
    provider: 'openrouter',
    note: 'Extremamente rápido e refinado',
    timeoutMs: 20_000,
  },
  {
    id: 'meta-llama/llama-4-scout-17b-16e-instruct',
    label: 'Llama 4 Scout 17B (Groq) 🏹',
    badge: 'Llama 4 Scout 17B (Groq)',
    provider: 'groq',
    note: 'Nova geração da Meta experimental',
    timeoutMs: 10_000,
  },
];

export function getDefaultModelId(): string {
  return localStorage.getItem('arcanjo_selected_model') || 'claude-sonnet-4-6';
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

  const body = {
    model: modelId,
    messages,
    temperature: typeof params.temperature === 'number' ? params.temperature : 0.2,
    max_tokens: 4096,
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
    } catch {
      // ignore parse error, fallback to responseText
    }
    if (response.status === 401) {
      throw new Error(`OpenRouter 401: Chave de API inválida ou não configurada. Verifique suas Configurações de API.`);
    }
    if (response.status === 402) {
      throw new Error(`OpenRouter 402: Saldo insuficiente na sua conta do OpenRouter.`);
    }
    throw new Error(`OpenRouter ${response.status}: ${errMsg}`);
  }

  let data: { choices?: Array<{ message?: { content?: string } }> };
  try {
    data = JSON.parse(responseText);
  } catch (err) {
    throw new Error(`Resposta inválida do OpenRouter: ${responseText.substring(0, 200)}`, { cause: err });
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

  const options = {
    model: modelId,
    messages,
    temperature: typeof params.temperature === 'number' ? params.temperature : 0.2,
    max_tokens: 4096,
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
      maxOutputTokens: 4096,
    },
  };

  // Desativa o "thinking" do Gemini 2.5/3 (exceto 3.5 e 3.1-pro que geram erro ao definir thinkingBudget: 0 na API direta)
  if (
    (modelId.includes('2.5') || modelId.includes('3')) &&
    !modelId.includes('3.5') &&
    !modelId.includes('3.1-pro')
  ) {
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
    if (response.status === 429) {
      throw new Error(`Gemini 429: Limite de cota excedido para o modelo ${modelId}. Se estiver usando a chave gratuita da Google, o Gemini Pro possui limites muito estritos. Tente usar o Gemini 2.5 Flash ou ative o faturamento no Google AI Studio.`);
    }
    throw new Error(`Gemini ${response.status}: ${errText.substring(0, 200)}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== 'string' || !text.trim()) throw new Error('Gemini: sem texto na resposta.');

  const m = AI_MODELS.find((m) => m.id === modelId || m.id.replace('google/', '') === modelId);
  lastUsedModel = m?.badge ?? `Gemini (${modelId})`;
  return text.trim();
}
// ─── Anthropic ─────────────────────────────────────────────────────────────────

async function callAnthropic(
  params: AICallParams,
  modelId: string,
  signal?: AbortSignal
): Promise<string> {
  const apiKey = getAnthropicApiKey();
  if (!apiKey) {
    throw new Error('Chave de API do Anthropic não configurada.');
  }

  const messages: Array<{ role: string; content: string }> = [
    { role: 'user', content: params.prompt }
  ];

  const body: {
    model: string;
    max_tokens: number;
    messages: Array<{ role: string; content: string }>;
    temperature: number;
    system?: string;
  } = {
    model: modelId,
    max_tokens: 4096,
    messages,
    temperature: typeof params.temperature === 'number' ? params.temperature : 0.2,
  };

  if (params.systemInstruction) {
    body.system = params.systemInstruction;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();

  if (!response.ok) {
    let errMsg = responseText;
    try {
      const errObj = JSON.parse(responseText);
      errMsg = errObj.error?.message || responseText;
    } catch {
      // ignore
    }
    throw new Error(`Anthropic ${response.status}: ${errMsg}`);
  }

  let data: { content?: Array<{ type: string; text: string }> };
  try {
    data = JSON.parse(responseText);
  } catch (err) {
    throw new Error(`Resposta inválida do Anthropic: ${responseText.substring(0, 200)}`, { cause: err });
  }

  const text = data.content?.[0]?.text || '';
  if (!text.trim()) throw new Error('Anthropic retornou resposta vazia.');

  const m = AI_MODELS.find((m) => m.id === modelId);
  lastUsedModel = m?.badge ?? `Claude (${modelId})`;
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

  // Verificar se a chave necessária para o modelo selecionado está presente
  if (modelMeta) {
    let hasKey = false;
    let keyName = '';
    
    const hasCustomGemini = hasCustomGeminiKey();
    const hasEnvGemini = !!import.meta.env.VITE_GEMINI_API_KEY;
    const hasGemini = hasCustomGemini || hasEnvGemini;
    
    if (modelMeta.id.includes('gemini') && hasGemini) {
      hasKey = true;
    } else if (modelMeta.provider === 'groq') {
      hasKey = !!(localStorage.getItem('arcanjo_groq_key') || import.meta.env.VITE_GROQ_API_KEY);
      keyName = 'Groq';
    } else if (modelMeta.provider === 'openrouter') {
      hasKey = !!getOpenRouterApiKey();
      keyName = 'OpenRouter';
    } else if (modelMeta.provider === 'gemini') {
      hasKey = hasGemini;
      keyName = 'Gemini';
    } else if (modelMeta.provider === 'anthropic') {
      hasKey = !!getAnthropicApiKey();
      keyName = 'Anthropic';
    }

    if (!hasKey && keyName) {
      throw new Error(`A chave de API do ${keyName} é necessária para usar o modelo "${modelMeta.label}". Configure-a nas Configurações de API.`);
    }
  }

  // Fila de modelos a tentar
  const fallbackChain: Array<{ id: string; badge: string; provider: 'gemini' | 'openrouter' | 'groq' | 'anthropic'; timeoutMs: number }> = [];

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
      id: 'google/gemini-3-flash-preview',
      badge: 'Gemini 3 Flash (fallback)',
      provider: 'openrouter',
      timeoutMs: 25_000,
    });
    fallbackChain.push({
      id: 'openai/gpt-5.4-mini',
      badge: 'GPT-5.4 Mini (fallback)',
      provider: 'openrouter',
      timeoutMs: 20_000,
    });
  } else {
    // Se o principal for OpenRouter/Gemini, fallback 1 deve ser Groq (ultra rápido e independente)
    fallbackChain.push({
      id: 'llama-3.3-70b-versatile',
      badge: 'Llama 3.3 70B Groq (fallback)',
      provider: 'groq',
      timeoutMs: 8_000,
    });
    // Fallback 2: Outro modelo OpenRouter dependendo do selecionado
    if (selectedModelId !== 'openai/gpt-5.4-mini') {
      fallbackChain.push({
        id: 'openai/gpt-5.4-mini',
        badge: 'GPT-5.4 Mini (fallback)',
        provider: 'openrouter',
        timeoutMs: 20_000,
      });
    } else {
      fallbackChain.push({
        id: 'google/gemini-3-flash-preview',
        badge: 'Gemini 3 Flash (fallback)',
        provider: 'openrouter',
        timeoutMs: 25_000,
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
        try {
          text = await callGemini(params, targetModelId, signal);
        } catch (geminiDirectErr) {
          // Se falhar a chamada direta (ex: 429 ou quota), e o original era OpenRouter, tenta OpenRouter para o mesmo modelo antes de ir ao fallback
          if (model.provider === 'openrouter' && getOpenRouterApiKey()) {
            console.warn(`Gemini Direct falhou (${(geminiDirectErr as Error).message}). Tentando via OpenRouter para ${model.id}...`);
            text = await callOpenRouter(params, model.id, signal);
          } else {
            throw geminiDirectErr;
          }
        }
      } else if (targetProvider === 'anthropic') {
        text = await callAnthropic(params, targetModelId, signal);
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
          throw new Error('Geração cancelada pelo usuário.', { cause: err });
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
        console.warn(`${model.id} falhou:`, err, 'Tentando fallback...');
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
        max_tokens: 4096,
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

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

// Anthropic: a chave reside SOMENTE no servidor (/api/claude).
// O browser nunca vê a chave — não expor via VITE_.
// A limpeza da chave antiga do localStorage roda em src/lib/storageCleanup.ts.

// ─── Timeout & Abort ──────────────────────────────────────────────────────────

/** Timeout padrão em ms. Alterável pelo usuário. */
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Teto de tokens de saída. É um LIMITE, não uma meta — respostas curtas
 * (ex: justificativa) continuam curtas. Subido de 4096 → 8192 para que o
 * prontuário SOAP premium (5 seções) nunca seja cortado no meio.
 */
const MAX_OUTPUT_TOKENS = 8192;

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
  provider: 'gemini' | 'openrouter' | 'groq' | 'anthropic' | 'openai';
  note?: string;
  /** Timeout override in ms — slower models get a bit more time */
  timeoutMs?: number;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'google/gemini-3.1-flash-lite',
    label: 'Gemini 3.1 Flash Lite ⚡',
    badge: 'Gemini 3.1 Flash Lite',
    provider: 'gemini',
    note: 'Padrão — mais recente e barato do Google, ótimo custo-benefício (via proxy seguro)',
    timeoutMs: 60_000,
  },
  {
    id: 'google/gemini-2.5-flash',
    label: 'Gemini 2.5 Flash ⚡',
    badge: 'Gemini 2.5 Flash',
    provider: 'gemini',
    note: 'Mais inteligente do Google, cota generosa (via proxy seguro)',
    timeoutMs: 90_000,
  },
  {
    id: 'google/gemini-3.5-flash',
    label: 'Gemini 3.5 Flash ⚡',
    badge: 'Gemini 3.5 Flash (OpenRouter)',
    provider: 'openrouter',
    note: 'Mais recente do Google via OpenRouter',
    timeoutMs: 60_000,
  },
  {
    id: 'claude-sonnet-5',
    label: 'Claude Sonnet 5 🧠',
    badge: 'Claude Sonnet 5',
    provider: 'anthropic',
    note: 'Modelo de alta performance da Anthropic (Direct API) — requer créditos na conta',
    timeoutMs: 120_000,
  },
  {
    id: 'llama-3.3-70b-versatile',
    label: 'Llama 3.3 70B (Groq) 🚀',
    badge: 'Llama 3.3 70B (Groq)',
    provider: 'groq',
    note: 'Ultra rápido e preciso',
    timeoutMs: 30_000,
  },
  {
    id: 'gpt-5.5',
    label: 'GPT-5.5 (OpenAI direto) 🧠',
    badge: 'GPT-5.5 (OpenAI)',
    provider: 'openai',
    note: 'API oficial da OpenAI via proxy seguro — requer OPENAI_API_KEY no servidor',
    timeoutMs: 90_000,
  },
  {
    id: 'gpt-4o',
    label: 'GPT-4o (OpenAI direto) ⚡',
    badge: 'GPT-4o (OpenAI)',
    provider: 'openai',
    note: 'Rápido e estável da OpenAI via proxy seguro — requer OPENAI_API_KEY no servidor',
    timeoutMs: 60_000,
  },
  {
    id: 'openai/gpt-5.5',
    label: 'GPT-5.5 🧠',
    badge: 'GPT-5.5 (OpenRouter)',
    provider: 'openrouter',
    note: 'Mais recente da OpenAI via OpenRouter',
    timeoutMs: 60_000,
  },
  {
    id: '~anthropic/claude-haiku-latest',
    label: 'Claude Haiku 🍃',
    badge: 'Claude Haiku (OpenRouter)',
    provider: 'openrouter',
    note: 'Mais rápido da Anthropic — sempre a versão mais recente',
    timeoutMs: 45_000,
  },
  {
    id: 'deepseek/deepseek-v4-flash',
    label: 'DeepSeek V4 Flash ⚡',
    badge: 'DeepSeek V4 Flash (OpenRouter)',
    provider: 'openrouter',
    note: 'Health #1 — Ultra barato ($0.09/M), contexto 1M',
    timeoutMs: 60_000,
  },
  {
    id: 'deepseek/deepseek-v4-pro',
    label: 'DeepSeek V4 Pro 🧠',
    badge: 'DeepSeek V4 Pro (OpenRouter)',
    provider: 'openrouter',
    note: 'Raciocínio avançado — Health #7, contexto 1M',
    timeoutMs: 120_000,
  },
];

export function getDefaultModelId(): string {
  const saved = localStorage.getItem('arcanjo_selected_model');
  if (saved && AI_MODELS.some(m => m.id === saved)) {
    return saved;
  }
  return 'google/gemini-3.1-flash-lite';
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AICallParams {
  prompt: string;
  systemInstruction?: string;
  jsonMode?: boolean;
  temperature?: number;
  /**
   * Chamado a cada delta de texto durante streaming (hoje só Anthropic).
   * Recebe o texto ACUMULADO até o momento — ideal para setState direto.
   */
  onDelta?: (textSoFar: string) => void;
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

  const useStreaming = !!params.onDelta;

  const body: Record<string, unknown> = {
    model: modelId,
    messages,
    temperature: typeof params.temperature === 'number' ? params.temperature : 0.2,
    max_tokens: MAX_OUTPUT_TOKENS,
  };
  if (useStreaming) body.stream = true;

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

  if (!response.ok) {
    const responseText = await response.text();
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

  if (useStreaming && response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload || payload === '[DONE]') continue;

          let evt: {
            choices?: Array<{ delta?: { content?: string; reasoning_content?: string } }>;
            error?: { message?: string };
          };
          try {
            evt = JSON.parse(payload);
          } catch {
            continue;
          }

          if (evt.error) throw new Error(`OpenRouter: ${evt.error.message ?? 'erro no stream'}`);

          const delta = evt.choices?.[0]?.delta;
          const chunk = delta?.content ?? '';
          if (chunk) {
            fullText += chunk;
            params.onDelta!(fullText);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    if (!fullText.trim()) throw new Error('OpenRouter retornou resposta vazia.');
    return fullText.trim();
  }

  const responseText = await response.text();

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

// ─── OpenAI (direto, via proxy /api/openai) ────────────────────────────────────
// A chave OPENAI_API_KEY fica SOMENTE no servidor (/api/openai injeta o header).
// O navegador nunca vê a chave. Formato de streaming SSE idêntico ao OpenRouter.

async function callOpenAI(
  params: AICallParams,
  modelId: string,
  signal: AbortSignal
): Promise<string> {
  const messages: Array<{ role: string; content: string }> = [];
  if (params.systemInstruction) messages.push({ role: 'system', content: params.systemInstruction });
  messages.push({ role: 'user', content: params.prompt });

  // Modelos GPT-3/4 clássicos aceitam `temperature`; famílias de raciocínio
  // (gpt-5+, série o) só rodam com o padrão — então só enviamos onde é seguro.
  const isReasoning = !/^gpt-(3|4)/.test(modelId);

  // Modelos de raciocínio (gpt-5+, série o) gastam TOKENS pensando ANTES de
  // escrever, e esse consumo conta no max_completion_tokens. Com o teto normal
  // (8192), um SOAP longo pode sair vazio/cortado porque o raciocínio comeu quase
  // tudo. Damos folga generosa a esses modelos; para gpt-4o o teto normal basta.
  const body: Record<string, unknown> = {
    model: modelId,
    messages,
    // Param novo da OpenAI (substitui max_tokens; aceito por todos os modelos atuais).
    max_completion_tokens: isReasoning ? 32_000 : MAX_OUTPUT_TOKENS,
    stream: true,
  };
  if (!isReasoning) {
    body.temperature = typeof params.temperature === 'number' ? params.temperature : 0.2;
  }

  const response = await fetch('/api/openai', {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok || !response.body) {
    const responseText = await response.text();
    let errMsg = responseText;
    try {
      const errObj = JSON.parse(responseText);
      errMsg = errObj.error?.message || errObj.error || responseText;
    } catch {
      // usa texto cru
    }
    if (response.status === 401) {
      throw new Error('OpenAI 401: chave inválida ou OPENAI_API_KEY não configurada no servidor.');
    }
    if (response.status === 429) {
      throw new Error('OpenAI 429: limite de cota ou sem créditos na conta da OpenAI. Verifique o faturamento em platform.openai.com.');
    }
    throw new Error(`OpenAI ${response.status}: ${String(errMsg).slice(0, 200)}`);
  }

  // Lê o SSE da OpenAI: linhas "data: {json}" com choices[0].delta.content.
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';
  let finishReason = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;
        let evt: {
          choices?: Array<{ delta?: { content?: string }; finish_reason?: string }>;
          error?: { message?: string };
        };
        try {
          evt = JSON.parse(payload);
        } catch {
          continue;
        }
        if (evt.error) throw new Error(`OpenAI: ${evt.error.message ?? 'erro no stream'}`);
        const chunk = evt.choices?.[0]?.delta?.content ?? '';
        if (chunk) {
          fullText += chunk;
          params.onDelta?.(fullText);
        }
        if (evt.choices?.[0]?.finish_reason) finishReason = evt.choices[0].finish_reason!;
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (!fullText.trim()) {
    // Vazio com finish_reason 'length' = modelo de raciocínio gastou todo o
    // orçamento pensando e não sobrou texto. Mensagem clara em vez de "vazio".
    if (finishReason === 'length') {
      throw new Error('O modelo usou todo o orçamento de tokens no raciocínio e não sobrou texto. Tente um caso mais curto ou use "GPT-4o (OpenAI direto)".');
    }
    throw new Error('OpenAI retornou resposta vazia.');
  }
  // Nota cortada no meio — o médico precisa saber que pode estar incompleta.
  if (finishReason === 'length') {
    toast.error('Atenção: a nota atingiu o limite de tamanho e pode estar incompleta. Gere novamente ou reduza o caso.');
  }
  const m = AI_MODELS.find((m) => m.id === modelId);
  lastUsedModel = m?.badge ?? `OpenAI (${modelId})`;
  return fullText.trim();
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
    max_tokens: MAX_OUTPUT_TOKENS,
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
  // Remove eventual prefixo "google/" (vindo dos ids de modelo da UI)
  modelId = modelId.replace('google/', '');
  // A chave NÃO vai pelo browser — o proxy /api/gemini injeta GEMINI_API_KEY no servidor.
  const url = `/api/gemini?model=${encodeURIComponent(modelId)}`;

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
      maxOutputTokens: MAX_OUTPUT_TOKENS,
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

  if (!response.ok || !response.body) {
    const errText = await response.text().catch(() => '');
    if (response.status === 429) {
      if (errText.includes('prepayment credits are depleted')) {
        throw new Error(`Gemini 429: Créditos pré-pagos do Google esgotados. Compre créditos em Google AI Studio → Faturamento (o saldo precisa ficar acima de US$ 0).`);
      }
      throw new Error(`Gemini 429: Limite de cota excedido para o modelo ${modelId}. Se estiver usando a chave gratuita da Google, o Gemini Pro possui limites muito estritos. Tente usar o Gemini 2.5 Flash ou ative o faturamento no Google AI Studio.`);
    }
    throw new Error(`Gemini ${response.status}: ${errText.substring(0, 200)}`);
  }

  // Leitura do SSE (streamGenerateContent?alt=sse): linhas "data: {json}".
  // Cada chunk traz texto incremental em candidates[0].content.parts[].text
  // e, no último, o finishReason (STOP normal, MAX_TOKENS se cortado, SAFETY se bloqueado).
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';
  let finishReason = '';

  try {
    while (true) {
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
          candidates?: Array<{
            content?: { parts?: Array<{ text?: string }> };
            finishReason?: string;
          }>;
          error?: { message?: string };
        };
        try {
          evt = JSON.parse(payloadStr);
        } catch {
          continue; // chunk JSON incompleto — espera o próximo
        }

        if (evt.error) throw new Error(`Gemini: ${evt.error.message ?? 'erro no stream'}`);

        const cand = evt.candidates?.[0];
        const partText = cand?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
        if (partText) {
          fullText += partText;
          params.onDelta?.(fullText);
        }
        if (cand?.finishReason) finishReason = cand.finishReason;
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (!fullText.trim()) {
    if (finishReason === 'SAFETY' || finishReason === 'PROHIBITED_CONTENT') {
      throw new Error('Gemini bloqueou a resposta por política de segurança. Reformule o caso clínico.');
    }
    throw new Error('Gemini: sem texto na resposta.');
  }

  // Aviso de truncamento — o médico precisa saber que a nota pode estar incompleta.
  if (finishReason === 'MAX_TOKENS') {
    toast.error('Atenção: a nota atingiu o limite de tamanho e pode estar incompleta. Gere novamente ou reduza o caso.');
  }

  const m = AI_MODELS.find((m) => m.id === modelId || m.id.replace('google/', '') === modelId);
  lastUsedModel = m?.badge ?? `Gemini (${modelId})`;
  return fullText.trim();
}
// ─── Anthropic (via proxy /api/claude) ────────────────────────────────────────
// A chave API NÃO é enviada pelo browser. O proxy Vercel (/api/claude.ts)
// injeta a chave a partir da variável de ambiente ANTHROPIC_API_KEY.

async function callAnthropic(
  params: AICallParams,
  modelId: string,
  signal?: AbortSignal
): Promise<string> {
  const body: {
    model: string;
    max_tokens: number;
    messages: Array<{ role: string; content: string }>;
    temperature: number;
    stream: true;
    system?: string;
  } = {
    model: modelId,
    max_tokens: MAX_OUTPUT_TOKENS,
    messages: [{ role: 'user', content: params.prompt }],
    temperature: typeof params.temperature === 'number' ? params.temperature : 0.1,
    // Streaming ponta a ponta: o proxy Edge repassa o SSE da Anthropic.
    // Em dev, o proxy do Vite envia este body verbatim à Anthropic — por isso o stream: true vai aqui também.
    stream: true,
  };

  if (params.systemInstruction) {
    body.system = params.systemInstruction;
  }

  // Chama o proxy local — sem chave no header, sem anthropic-dangerous-direct-browser-access
  const response = await fetch('/api/claude', {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok || !response.body) {
    const responseText = await response.text();
    let errMsg = responseText;
    try {
      const errObj = JSON.parse(responseText);
      errMsg = errObj.error?.message || errObj.error || responseText;
    } catch {
      // ignore
    }
    if (typeof errMsg === 'string' && errMsg.includes('credit balance is too low')) {
      throw new Error('Anthropic: créditos esgotados na conta da Anthropic. Compre créditos em console.anthropic.com → Plans & Billing, ou use outro modelo.');
    }
    throw new Error(`Anthropic ${response.status}: ${errMsg}`);
  }

  // Leitura do SSE: linhas "data: {json}". O texto vem em eventos
  // content_block_delta (delta.type === "text_delta"); erros vêm em eventos error.
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';
  let stopReason = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload) continue;

        let evt: {
          type?: string;
          delta?: { type?: string; text?: string; stop_reason?: string };
          error?: { message?: string };
        };
        try {
          evt = JSON.parse(payload);
        } catch {
          // Linha que não é JSON completo (ping/keep-alive) — ignora
          continue;
        }

        if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
          fullText += evt.delta.text ?? '';
          params.onDelta?.(fullText);
        } else if (evt.type === 'message_delta' && evt.delta?.stop_reason === 'max_tokens') {
          // A nota atingiu o teto de tokens — avisa que pode estar incompleta.
          stopReason = 'max_tokens';
        } else if (evt.type === 'error') {
          throw new Error(`Anthropic: ${evt.error?.message ?? 'erro no stream'}`);
        }
        // Demais eventos (message_start, content_block_start, ping, message_stop) são ignorados.
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (!fullText.trim()) throw new Error('Anthropic retornou resposta vazia.');

  if (stopReason === 'max_tokens') {
    toast.error('Atenção: a nota atingiu o limite de tamanho e pode estar incompleta. Gere novamente ou reduza o caso.');
  }

  const m = AI_MODELS.find((m) => m.id === modelId);
  lastUsedModel = m?.badge ?? `Claude (${modelId})`;
  return fullText.trim();
}

// ─── Dispatcher principal ──────────────────────────────────────────────────────

/**
 * Roteador principal com timeout por modelo e fallback automático.
 *
 * Fluxo de fallback quando timeout ou erro:
 *   Modelo selecionado → DeepSeek V4 Flash → GPT-5.5 → Erro
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
    
    if (modelMeta.provider === 'gemini' || modelMeta.provider === 'anthropic' || modelMeta.provider === 'openai') {
      // Gemini, Anthropic e OpenAI usam proxy servidor-lado (/api/gemini,
      // /api/claude, /api/openai). A chave nunca passa pelo browser e o proxy
      // está sempre disponível (erra com mensagem clara se a env var faltar).
      hasKey = true;
    } else if (modelMeta.id.includes('gemini') && hasGemini) {
      hasKey = true;
    } else if (modelMeta.provider === 'groq') {
      hasKey = !!(localStorage.getItem('arcanjo_groq_key') || import.meta.env.VITE_GROQ_API_KEY);
      keyName = 'Groq';
    } else if (modelMeta.provider === 'openrouter') {
      hasKey = !!getOpenRouterApiKey();
      keyName = 'OpenRouter';
    }

    if (!hasKey && keyName) {
      throw new Error(`A chave de API do ${keyName} é necessária para usar o modelo "${modelMeta.label}". Configure-a nas Configurações de API.`);
    }
  }

  // Fila de modelos a tentar
  const fallbackChain: Array<{ id: string; badge: string; provider: 'gemini' | 'openrouter' | 'groq' | 'anthropic' | 'openai'; timeoutMs: number }> = [];

  // 1. O modelo selecionado pelo usuário
  fallbackChain.push({
    id: selectedModelId,
    badge: modelMeta?.badge ?? selectedModelId,
    provider: modelMeta?.provider ?? 'openrouter',
    timeoutMs,
  });

  // 2. Fallbacks multi-provedor inteligentes
  const primaryProvider = modelMeta?.provider ?? 'openrouter';

  if (primaryProvider === 'anthropic') {
    // Claude indisponível (ex.: sem créditos) não pode travar o médico:
    // cai para o Gemini nativo e depois DeepSeek.
    fallbackChain.push({
      id: 'google/gemini-2.5-flash',
      badge: 'Gemini 2.5 Flash (fallback)',
      provider: 'gemini',
      timeoutMs: 90_000,
    });
    fallbackChain.push({
      id: 'deepseek/deepseek-v4-flash',
      badge: 'DeepSeek V4 Flash (fallback)',
      provider: 'openrouter',
      timeoutMs: 60_000,
    });
  } else if (primaryProvider === 'groq') {
    // Se o principal for Groq, fallback para DeepSeek (barato e independente)
    fallbackChain.push({
      id: 'deepseek/deepseek-v4-flash',
      badge: 'DeepSeek V4 Flash (fallback)',
      provider: 'openrouter',
      timeoutMs: 60_000,
    });
    fallbackChain.push({
      id: 'openai/gpt-5.5',
      badge: 'GPT-5.5 (fallback)',
      provider: 'openrouter',
      timeoutMs: 60_000,
    });
  } else {
    // Se o principal for OpenRouter/Gemini, fallback 1 deve ser DeepSeek (barato, contexto 1M, independente)
    fallbackChain.push({
      id: 'deepseek/deepseek-v4-flash',
      badge: 'DeepSeek V4 Flash (fallback)',
      provider: 'openrouter',
      timeoutMs: 60_000,
    });
    // Fallback 2: Outro modelo OpenRouter dependendo do selecionado
    if (selectedModelId !== 'openai/gpt-5.5') {
      fallbackChain.push({
        id: 'openai/gpt-5.5',
        badge: 'GPT-5.5 (fallback)',
        provider: 'openrouter',
        timeoutMs: 30_000,
      });
    } else {
      fallbackChain.push({
        id: 'google/gemini-3.5-flash',
        badge: 'Gemini 3.5 Flash (fallback)',
        provider: 'openrouter',
        timeoutMs: 30_000,
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
          // Se a API nativa do Google falhar (ex: 429 créditos/quota), tenta o MESMO
          // modelo via OpenRouter antes de descer para o fallback — o médico continua no Gemini.
          if (model.id.startsWith('google/') && getOpenRouterApiKey()) {
            console.warn(`Gemini Direct falhou (${(geminiDirectErr as Error).message}). Tentando via OpenRouter para ${model.id}...`);
            text = await callOpenRouter(params, model.id, signal);
            lastUsedModel = `${model.badge} — via OpenRouter`;
          } else {
            throw geminiDirectErr;
          }
        }
      } else if (targetProvider === 'anthropic') {
        text = await callAnthropic(params, targetModelId, signal);
      } else if (targetProvider === 'openai') {
        text = await callOpenAI(params, targetModelId, signal);
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
        toast.error('Problema com chaves ou créditos no OpenRouter. Tentando fallback alternativo...');
        
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

  // DeepSeek como último recurso via OpenRouter
  if (getOpenRouterApiKey()) {
    try {
      const { signal: lastSignal, clear: lastClear } = createTimeoutSignal(60_000);
      const text = await callOpenRouter(params, 'deepseek/deepseek-v4-flash', lastSignal);
      lastClear();
      if (text.trim()) {
        lastUsedModel = 'DeepSeek V4 Flash (último recurso)';
        return text.trim();
      }
    } catch (deepseekErr) {
      console.warn('DeepSeek último recurso também falhou.', deepseekErr);
    }
  }

  throw lastErr;
}

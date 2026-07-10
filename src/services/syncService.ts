import { supabase } from '../config/supabase';

export interface SyncMessage {
  type: 'MOBILE_CONNECTED' | 'RECORDING_STATUS' | 'TRANSCRIPTION_RESULT' | 'TRIGGER_AI' | 'DESKTOP_READY' | 'PATIENT_SYNC';
  payload?: {
    pacienteNome?: string;
    isRecording?: boolean;
    isTranscribing?: boolean;
    text?: string;
    action?: 'SOAP' | 'JUSTIFICATIVA';
    /** Chave estável do texto — o desktop ignora reenvios idênticos (evita duplicar). */
    dedupeKey?: string;
    /**
     * Envio manual e explícito (botão "Enviar p/ Queixa"): ignora a deduplicação
     * e garante que o texto entre na Queixa. Idempotente no desktop — só acrescenta
     * se o texto ainda não estiver lá, então clicar duas vezes não duplica.
     */
    force?: boolean;
  };
  /** Identificador único da mensagem — usado para deduplicar entre os dois transportes */
  _id?: string;
  /** Identificador da instância emissora — evita processar as próprias mensagens */
  _sender?: string;
}

const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return (
    !!url &&
    !url.includes('dummy') &&
    !url.includes('placeholder') &&
    !!key &&
    !key.includes('dummy') &&
    !key.includes('placeholder')
  );
};

// Tempo máximo que cada transporte tem para confirmar um publish. Passou disso,
// consideramos falha (false) e seguimos — nunca deixamos o publish pendurado.
const PUBLISH_TIMEOUT_MS = 8000;

/** Garante que a promessa resolva em no máximo `ms` (valor `false` no estouro). */
const withTimeout = (p: Promise<boolean>, ms: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), ms);
    p.then(
      (v) => { clearTimeout(timer); resolve(v); },
      () => { clearTimeout(timer); resolve(false); },
    );
  });
};

/**
 * Chave curta e estável derivada do texto — igual texto → igual chave. Permite
 * ao desktop reconhecer um reenvio do MESMO texto (ex.: pelo botão Gerar SOAP) e
 * não acrescentá-lo duas vezes no prontuário. Não é criptográfica; só dedupe.
 */
export function transcriptDedupeKey(text: string): string {
  const s = (text || '').trim();
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return `${s.length}:${(h >>> 0).toString(36)}`;
}

const randomId = (): string => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    // crypto indisponível fora de contexto seguro — usa fallback abaixo
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

/**
 * Serviço de sincronização Desktop ↔ Celular.
 *
 * Usa DOIS transportes AO MESMO TEMPO (Supabase Realtime quando configurado +
 * ntfy.sh sempre). Toda mensagem é publicada em ambos e deduplicada na chegada
 * pelo campo `_id`. Assim, mesmo que um lado fique com o Supabase quebrado
 * (canal não inscrito, realtime desabilitado, rede bloqueando websocket),
 * o ntfy.sh garante a entrega — e vice-versa.
 */
export class SyncService {
  private roomId: string;
  private instanceId = randomId();
  private sseSource: EventSource | null = null;
  private supabaseChannel: ReturnType<typeof supabase.channel> | null = null;
  private supabaseJoined = false;
  private seenIds: string[] = [];
  private closed = false;
  private sseReconnectTimer: number | null = null;
  // Falhas de SSE consecutivas SEM reconectar. O ntfy.sh fecha o stream de tempos
  // em tempos (idle/keepalive) e espera reconexão silenciosa — um fechamento
  // isolado é rotina, não queda. Só avisamos o app de "conexão perdida" depois
  // de várias falhas seguidas, para o selo não piscar laranja a cada blip.
  private sseFailures = 0;
  private static readonly SSE_FAILURE_GRACE = 3;
  private onMessageCb: ((msg: SyncMessage) => void) | null = null;
  private onErrorCb: ((err: unknown) => void) | null = null;

  constructor(roomId: string) {
    this.roomId = roomId.trim().replace(/\s+/g, '').toLowerCase();
  }

  private get ntfyTopicUrl() {
    return `https://ntfy.sh/arcanjo-lab-room-${this.roomId}`;
  }

  /**
   * Inscreve nos dois transportes e escuta mensagens da sala.
   */
  public subscribe(onMessage: (msg: SyncMessage) => void, onError?: (err: unknown) => void) {
    this.onMessageCb = onMessage;
    this.onErrorCb = onError || null;
    this.closed = false;

    this.startSupabase();
    this.startNtfy();

    return () => this.close();
  }

  private handleIncoming(msg: SyncMessage, source: 'supabase' | 'ntfy') {
    if (this.closed || !msg || typeof msg.type !== 'string') return;
    // Chegou mensagem → o canal está vivo. Zera falhas de SSE acumuladas.
    this.sseFailures = 0;
    // Ignora mensagens publicadas por esta própria instância (eco do ntfy)
    if (msg._sender && msg._sender === this.instanceId) return;
    // Deduplica mensagens que chegam pelos dois transportes
    if (msg._id) {
      if (this.seenIds.includes(msg._id)) return;
      this.seenIds.push(msg._id);
      if (this.seenIds.length > 300) this.seenIds.splice(0, 150);
    }
    console.log(`[SyncService] (${source}) received:`, msg.type);
    this.onMessageCb?.(msg);
  }

  private startSupabase() {
    if (!isSupabaseConfigured()) {
      console.log('[SyncService] Supabase não configurado — usando apenas ntfy.sh');
      return;
    }
    try {
      const channelName = `arcanjo-sync-${this.roomId}`;
      this.supabaseChannel = supabase.channel(channelName, {
        config: {
          broadcast: { self: false },
        },
      });

      this.supabaseChannel
        .on('broadcast', { event: 'sync-event' }, ({ payload }: { payload: SyncMessage }) => {
          this.handleIncoming(payload, 'supabase');
        })
        .subscribe((status: string) => {
          this.supabaseJoined = status === 'SUBSCRIBED';
          if (status === 'SUBSCRIBED') {
            console.log('[SyncService] Supabase channel subscribed');
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            // Não é fatal: o ntfy.sh continua carregando as mensagens
            console.warn(`[SyncService] Supabase channel ${status} — seguindo via ntfy.sh`);
          }
        });
    } catch (err) {
      console.warn('[SyncService] Supabase indisponível, seguindo via ntfy.sh', err);
      this.supabaseChannel = null;
      this.supabaseJoined = false;
    }
  }

  private startNtfy() {
    if (this.closed) return;
    try {
      this.sseSource = new EventSource(`${this.ntfyTopicUrl}/sse`);
    } catch (err) {
      console.error('[SyncService] Falha ao abrir SSE ntfy.sh:', err);
      this.scheduleNtfyReconnect();
      return;
    }

    this.sseSource.onopen = () => {
      console.log('[SyncService] ntfy.sh SSE conectado');
      // Reconexão bem-sucedida — zera o contador de falhas.
      this.sseFailures = 0;
    };

    this.sseSource.onmessage = (event) => {
      try {
        const rawData = JSON.parse(event.data);
        if (rawData.event === 'message' && rawData.message) {
          const parsedMsg = JSON.parse(rawData.message) as SyncMessage;
          this.handleIncoming(parsedMsg, 'ntfy');
        }
      } catch (err) {
        console.error('[SyncService] Error parsing ntfy.sh message:', err);
      }
    };

    this.sseSource.onerror = () => {
      // O EventSource reconecta sozinho em erros transitórios.
      // Só tratamos como problema quando a conexão foi encerrada de vez.
      if (this.sseSource?.readyState === EventSource.CLOSED) {
        this.sseFailures++;
        console.warn(`[SyncService] ntfy.sh SSE fechado (falha ${this.sseFailures}) — agendando reconexão`);
        this.scheduleNtfyReconnect();
        // Só declara "conexão perdida" após várias falhas seguidas sem reconectar
        // — um fechamento isolado é rotina do ntfy.sh e a reconexão é silenciosa.
        // Assim o selo do celular não pisca laranja ("desconectado") a cada blip.
        if (this.sseFailures >= SyncService.SSE_FAILURE_GRACE && !this.supabaseJoined && this.onErrorCb) {
          this.onErrorCb(new Error('Conexão de sincronização perdida. Reconectando...'));
        }
      }
    };
  }

  private scheduleNtfyReconnect() {
    if (this.closed || this.sseReconnectTimer !== null) return;
    this.sseReconnectTimer = window.setTimeout(() => {
      this.sseReconnectTimer = null;
      if (this.sseSource) {
        this.sseSource.close();
        this.sseSource = null;
      }
      this.startNtfy();
    }, 3000);
  }

  /**
   * Publica a mensagem na sala pelos DOIS transportes.
   * Retorna true se pelo menos um deles confirmou o envio.
   *
   * IMPORTANTE: cada tentativa é LIMITADA POR TEMPO. Sem isso, um POST ao
   * ntfy.sh (ou um send do Supabase) que fica pendurado numa rede móvel
   * instável travava o publish para sempre — e, como a transcrição/reenvio
   * aguardava aqui, a UI ficava presa girando ("Whisper..."/"Enviando...") e
   * só um refresh liberava novo reenvio. Agora o publish sempre resolve.
   */
  public async publish(message: SyncMessage): Promise<boolean> {
    const msg: SyncMessage = { ...message, _id: randomId(), _sender: this.instanceId };
    console.log('[SyncService] Publishing:', msg.type);

    const body = JSON.stringify(msg);

    // Publica nos DOIS transportes EM PARALELO — evita somar as latências
    // (Supabase + ntfy.sh eram sequenciais, o que atrasava a chegada do texto).
    const attempts: Array<Promise<boolean>> = [];

    // 1) Supabase Realtime (somente quando o canal está realmente inscrito)
    if (this.supabaseChannel && this.supabaseJoined) {
      const channel = this.supabaseChannel;
      attempts.push(
        withTimeout(
          channel
            .send({ type: 'broadcast', event: 'sync-event', payload: msg })
            .then((status: string) => {
              if (status !== 'ok') console.warn(`[SyncService] Supabase send retornou "${status}"`);
              return status === 'ok';
            })
            .catch((err: unknown) => {
              console.warn('[SyncService] Supabase publish falhou', err);
              return false;
            }),
          PUBLISH_TIMEOUT_MS,
        ),
      );
    }

    // 2) ntfy.sh — sempre, para garantir a ponte entre lados em transportes diferentes.
    //    AbortController encerra o fetch pendurado; withTimeout garante o retorno.
    const ac = new AbortController();
    const abortTimer = setTimeout(() => ac.abort(), PUBLISH_TIMEOUT_MS);
    attempts.push(
      withTimeout(
        fetch(this.ntfyTopicUrl, { method: 'POST', body, signal: ac.signal })
          .then((response) => response.ok)
          .catch((err: unknown) => {
            console.error('[SyncService] ntfy.sh publish falhou:', err);
            return false;
          })
          .finally(() => clearTimeout(abortTimer)),
        PUBLISH_TIMEOUT_MS,
      ),
    );

    const results = await Promise.all(attempts);
    return results.some(Boolean);
  }

  public close() {
    this.closed = true;
    if (this.sseReconnectTimer !== null) {
      clearTimeout(this.sseReconnectTimer);
      this.sseReconnectTimer = null;
    }
    if (this.sseSource) {
      this.sseSource.close();
      this.sseSource = null;
    }
    if (this.supabaseChannel) {
      supabase.removeChannel(this.supabaseChannel);
      this.supabaseChannel = null;
      this.supabaseJoined = false;
    }
    this.onMessageCb = null;
    this.onErrorCb = null;
  }
}

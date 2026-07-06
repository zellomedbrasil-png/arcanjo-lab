import { supabase } from '../config/supabase';

export interface SyncMessage {
  type: 'MOBILE_CONNECTED' | 'RECORDING_STATUS' | 'TRANSCRIPTION_RESULT' | 'TRIGGER_AI' | 'DESKTOP_READY' | 'PATIENT_SYNC';
  payload?: {
    pacienteNome?: string;
    isRecording?: boolean;
    isTranscribing?: boolean;
    text?: string;
    action?: 'SOAP' | 'JUSTIFICATIVA';
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
        console.warn('[SyncService] ntfy.sh SSE fechado — agendando reconexão');
        this.scheduleNtfyReconnect();
        if (!this.supabaseJoined && this.onErrorCb) {
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
      );
    }

    // 2) ntfy.sh — sempre, para garantir a ponte entre lados em transportes diferentes
    attempts.push(
      fetch(this.ntfyTopicUrl, { method: 'POST', body })
        .then((response) => response.ok)
        .catch((err: unknown) => {
          console.error('[SyncService] ntfy.sh publish falhou:', err);
          return false;
        }),
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

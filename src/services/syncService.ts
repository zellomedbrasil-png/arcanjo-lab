import { supabase } from '../config/supabase';

export interface SyncMessage {
  type: 'MOBILE_CONNECTED' | 'RECORDING_STATUS' | 'TRANSCRIPTION_RESULT' | 'TRIGGER_AI' | 'DESKTOP_READY' | 'PATIENT_SYNC';
  payload?: any;
}

const isDummySupabase = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return (
    !url ||
    url.includes('dummy') ||
    url.includes('placeholder') ||
    !key ||
    key.includes('dummy') ||
    key.includes('placeholder')
  );
};

export class SyncService {
  private roomId: string;
  private sseSource: EventSource | null = null;
  private supabaseChannel: any = null;

  constructor(roomId: string) {
    this.roomId = roomId.trim().replace(/\s+/g, '').toLowerCase();
  }

  /**
   * Subscribes to the room and listens for messages
   */
  public subscribe(onMessage: (msg: SyncMessage) => void, onError?: (err: any) => void) {
    if (!isDummySupabase()) {
      try {
        console.log('[SyncService] Using Supabase Realtime');
        const channelName = `arcanjo-sync-${this.roomId}`;
        this.supabaseChannel = supabase.channel(channelName, {
          config: {
            broadcast: { self: false },
          },
        });

        this.supabaseChannel
          .on('broadcast', { event: 'sync-event' }, ({ payload }: { payload: SyncMessage }) => {
            console.log('[SyncService] Supabase received:', payload);
            onMessage(payload);
          })
          .subscribe((status: string) => {
            if (status === 'SUBSCRIBED') {
              console.log('[SyncService] Supabase channel subscribed');
            } else if (status === 'CHANNEL_ERROR' && onError) {
              console.error('[SyncService] Supabase connection error');
              onError(new Error('Supabase channel error'));
            }
          });

        return () => {
          if (this.supabaseChannel) {
            supabase.removeChannel(this.supabaseChannel);
            this.supabaseChannel = null;
          }
        };
      } catch (err) {
        console.warn('[SyncService] Supabase subscription failed, falling back to ntfy.sh', err);
      }
    }

    // Fallback: ntfy.sh SSE
    console.log('[SyncService] Using ntfy.sh SSE fallback');
    const topicUrl = `https://ntfy.sh/arcanjo-lab-room-${this.roomId}/sse`;
    this.sseSource = new EventSource(topicUrl);

    this.sseSource.onmessage = (event) => {
      try {
        const rawData = JSON.parse(event.data);
        if (rawData.event === 'message' && rawData.message) {
          const parsedMsg = JSON.parse(rawData.message) as SyncMessage;
          console.log('[SyncService] ntfy.sh received:', parsedMsg);
          onMessage(parsedMsg);
        }
      } catch (err) {
        console.error('[SyncService] Error parsing ntfy.sh message:', err);
      }
    };

    this.sseSource.onerror = (err) => {
      console.error('[SyncService] ntfy.sh SSE error:', err);
      if (onError) onError(err);
    };

    return () => {
      if (this.sseSource) {
        this.sseSource.close();
        this.sseSource = null;
      }
    };
  }

  /**
   * Publishes a message to the room
   */
  public async publish(message: SyncMessage): Promise<boolean> {
    console.log('[SyncService] Publishing:', message);

    if (!isDummySupabase() && this.supabaseChannel) {
      try {
        await this.supabaseChannel.send({
          type: 'broadcast',
          event: 'sync-event',
          payload: message,
        });
        return true;
      } catch (err) {
        console.warn('[SyncService] Supabase publish failed, trying ntfy.sh fallback', err);
      }
    }

    // Fallback: ntfy.sh POST
    try {
      const response = await fetch(`https://ntfy.sh/arcanjo-lab-room-${this.roomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      return response.ok;
    } catch (err) {
      console.error('[SyncService] ntfy.sh publish failed:', err);
      return false;
    }
  }
}

// src/services/segmentedRecorder.ts
// Gravação de áudio em SEGMENTOS independentes, controlados por TAMANHO.
//
// Por que segmentar: a transcrição passa pelo proxy Edge /api/groq-transcribe,
// cujo corpo de requisição tem limite de ~4,5 MB. Uma consulta longa gera um
// arquivo maior que isso (erro "413 FUNCTION_PAYLOAD_TOO_LARGE").
//
// Estratégia: NÃO reduzir a qualidade do áudio (bitrate nativo do navegador —
// igual à versão que transcrevia bem). Em vez disso, medir o tamanho enquanto
// grava e, ao aproximar-se do limite, encerrar o segmento atual (arquivo
// completo e válido) e iniciar o próximo. Cada segmento fica < 3,5 MB e é
// transcrito separadamente; o texto é concatenado na ordem. Consultas curtas
// geram UM único segmento (sem cortes). Assim a duração é praticamente
// ilimitada SEM perder qualidade de captação.

// Limite por segmento com folga sob os ~4,5 MB do Edge (sobra p/ o último
// chunk e o overhead do multipart no proxy).
const SEGMENT_MAX_BYTES = 3_500_000;
// ondataavailable periódico (a cada 2s) para medir o tamanho acumulado.
const TIMESLICE_MS = 2000;

const MIME_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/mp4',
  'audio/aac',
];

function pickMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  for (const type of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return '';
}

export interface SegmentedRecordingResult {
  segments: Blob[];
  mimeType: string;
}

/**
 * Gravador que fecha o segmento por TAMANHO, produzindo múltiplos arquivos
 * completos e pequenos com a qualidade nativa do microfone. A UI dirige
 * start()/stop() e cuida de timer, wake lock e sincronização.
 */
export class SegmentedRecorder {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private segments: Blob[] = [];
  private currentChunks: Blob[] = [];
  private currentSize = 0;
  private rotating = false;
  private stopping = false;
  private resolveStop: ((r: SegmentedRecordingResult) => void) | null = null;
  private maxBytes: number;
  public mimeType = '';

  constructor(maxBytes: number = SEGMENT_MAX_BYTES) {
    this.maxBytes = maxBytes;
  }

  /** Abre o microfone e começa a gravar o primeiro segmento. */
  async start(): Promise<void> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Gravação indisponível: requer HTTPS/localhost para acessar o microfone.');
    }
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mimeType = pickMimeType();
    this.beginSegment();
  }

  private beginSegment(): void {
    if (!this.stream) return;
    this.currentChunks = [];
    this.currentSize = 0;

    // SEM audioBitsPerSecond → qualidade nativa do navegador (melhor transcrição).
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(this.stream, this.mimeType ? { mimeType: this.mimeType } : undefined);
    } catch {
      recorder = new MediaRecorder(this.stream);
    }
    this.recorder = recorder;

    recorder.ondataavailable = (event) => {
      if (!event.data || event.data.size === 0) return;
      this.currentChunks.push(event.data);
      this.currentSize += event.data.size;
      // Aproximou do limite → encerra este segmento e abre o próximo.
      if (!this.stopping && !this.rotating && this.currentSize >= this.maxBytes) {
        this.rotating = true;
        try { recorder.stop(); } catch { this.rotating = false; }
      }
    };

    recorder.onstop = () => {
      if (this.currentChunks.length) {
        this.segments.push(new Blob(this.currentChunks, { type: this.mimeType || 'audio/webm' }));
      }
      if (this.stopping) {
        this.stream?.getTracks().forEach((t) => t.stop());
        this.resolveStop?.({ segments: this.segments, mimeType: this.mimeType || 'audio/webm' });
        this.resolveStop = null;
      } else if (this.rotating) {
        this.rotating = false;
        this.beginSegment();
      }
    };

    // timeslice → mede o tamanho acumulado ao longo da gravação.
    recorder.start(TIMESLICE_MS);
  }

  /** Encerra a gravação e resolve com os segmentos coletados. */
  stop(): Promise<SegmentedRecordingResult> {
    this.stopping = true;
    this.rotating = false;
    return new Promise((resolve) => {
      this.resolveStop = resolve;
      if (this.recorder && this.recorder.state !== 'inactive') {
        try {
          this.recorder.stop();
        } catch {
          this.stream?.getTracks().forEach((t) => t.stop());
          resolve({ segments: this.segments, mimeType: this.mimeType || 'audio/webm' });
        }
      } else {
        this.stream?.getTracks().forEach((t) => t.stop());
        resolve({ segments: this.segments, mimeType: this.mimeType || 'audio/webm' });
      }
    });
  }

  /** Cancela sem esperar (ex.: desmontagem) — libera o microfone. */
  abort(): void {
    this.stopping = true;
    try { this.recorder?.stop(); } catch { /* ignora */ }
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.recorder = null;
  }
}

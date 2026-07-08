// src/services/segmentedRecorder.ts
// Gravação de áudio em SEGMENTOS independentes.
//
// Por que segmentar: a transcrição do celular (e do desktop em produção) passa
// pelo proxy Edge /api/groq-transcribe, cujo corpo de requisição tem limite de
// ~4,5 MB. Com o bitrate padrão do MediaRecorder (~128 kbps) isso estoura em
// ~5 min de consulta (erro "413 FUNCTION_PAYLOAD_TOO_LARGE").
//
// Solução: gravar em voz a ~20 kbps (5× menor, ótimo para fala) E trocar de
// MediaRecorder a cada `segmentMs`, gerando vários arquivos completos e
// pequenos (~0,9 MB por 5 min) — cada um bem abaixo do limite. Consultas curtas
// continuam gerando UM único segmento (sem cortes). Cada segmento é transcrito
// e o texto é concatenado na ordem.

const VOICE_BITRATE = 20_000;      // ~183 KB/min — ótimo p/ fala, Whisper lida bem
const DEFAULT_SEGMENT_MS = 300_000; // 5 min por segmento → ~0,9 MB (folga enorme)

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
 * Gravador que rotaciona o MediaRecorder por tempo, produzindo múltiplos
 * arquivos completos e pequenos. A UI dirige start()/stop() e cuida de
 * timer, wake lock e sincronização — este módulo só gerencia os segmentos.
 */
export class SegmentedRecorder {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private segments: Blob[] = [];
  private currentChunks: Blob[] = [];
  private rotateTimer: number | null = null;
  private rotating = false;
  private stopping = false;
  private resolveStop: ((r: SegmentedRecordingResult) => void) | null = null;
  private segmentMs: number;
  private audioBitsPerSecond: number;
  public mimeType = '';

  constructor(segmentMs: number = DEFAULT_SEGMENT_MS, audioBitsPerSecond: number = VOICE_BITRATE) {
    this.segmentMs = segmentMs;
    this.audioBitsPerSecond = audioBitsPerSecond;
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
    const options: MediaRecorderOptions = { audioBitsPerSecond: this.audioBitsPerSecond };
    if (this.mimeType) options.mimeType = this.mimeType;

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(this.stream, options);
    } catch {
      // Alguns aparelhos rejeitam audioBitsPerSecond — tenta sem o hint.
      recorder = new MediaRecorder(this.stream, this.mimeType ? { mimeType: this.mimeType } : undefined);
    }
    this.recorder = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) this.currentChunks.push(event.data);
    };

    recorder.onstop = () => {
      if (this.currentChunks.length) {
        this.segments.push(new Blob(this.currentChunks, { type: this.mimeType || 'audio/webm' }));
      }
      if (this.stopping) {
        // Parada definitiva: fecha o microfone e resolve com todos os segmentos.
        this.stream?.getTracks().forEach((t) => t.stop());
        this.resolveStop?.({ segments: this.segments, mimeType: this.mimeType || 'audio/webm' });
        this.resolveStop = null;
      } else if (this.rotating) {
        // Rotação de segmento: inicia o próximo imediatamente (gap de dezenas de ms).
        this.rotating = false;
        this.beginSegment();
      }
    };

    recorder.start();
    this.scheduleRotate();
  }

  private scheduleRotate(): void {
    this.clearRotate();
    this.rotateTimer = window.setTimeout(() => {
      if (this.stopping || !this.recorder) return;
      this.rotating = true;
      try { this.recorder.stop(); } catch { this.rotating = false; }
    }, this.segmentMs);
  }

  private clearRotate(): void {
    if (this.rotateTimer !== null) {
      clearTimeout(this.rotateTimer);
      this.rotateTimer = null;
    }
  }

  /** Encerra a gravação e resolve com os segmentos coletados. */
  stop(): Promise<SegmentedRecordingResult> {
    this.clearRotate();
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
    this.clearRotate();
    this.stopping = true;
    try { this.recorder?.stop(); } catch { /* ignora */ }
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.recorder = null;
  }
}

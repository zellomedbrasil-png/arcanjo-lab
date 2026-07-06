// src/services/liveSpeech.ts
// Ditado ao vivo via Web Speech API (webkitSpeechRecognition).
//
// No Chrome/Edge (desktop e Android) essa API é servida pelos motores de voz
// do Google — transcreve EM TEMPO REAL enquanto o médico fala, sem upload,
// sem chave e sem custo. É a rota "nativa do Google" mais rápida.
//
// Limitações: só Chrome/Edge (Firefox não implementa), exige internet, e em
// alguns Androids o reconhecimento para sozinho no silêncio — por isso
// reiniciamos automaticamente enquanto a sessão estiver ativa.

interface SpeechRecognitionResultLike {
  0: { transcript: string };
  isFinal: boolean;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: { length: number; [index: number]: SpeechRecognitionResultLike };
}
interface SpeechRecognitionErrorEventLike {
  error: string;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isLiveSpeechSupported(): boolean {
  return getSpeechRecognitionCtor() !== null;
}

export interface LiveSpeechController {
  /** Encerra a sessão de ditado. */
  stop: () => void;
}

export interface LiveSpeechOptions {
  lang?: string;
  /** Texto interino (parcial) — muda enquanto a pessoa fala. */
  onPartial?: (interimText: string) => void;
  /** Trecho finalizado — some da parcial e vira definitivo. */
  onFinal: (finalText: string) => void;
  onError?: (message: string) => void;
  onEnd?: () => void;
}

/**
 * Inicia o ditado ao vivo. Retorna um controller com stop().
 * Lança se a API não for suportada — checar antes com isLiveSpeechSupported().
 */
export function startLiveSpeech(opts: LiveSpeechOptions): LiveSpeechController {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) {
    throw new Error('Ditado ao vivo indisponível neste navegador. Use o Chrome ou o Edge.');
  }

  const recognition = new Ctor();
  recognition.lang = opts.lang || 'pt-BR';
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  // active = usuário ainda quer ditar; usamos para reiniciar após pausas.
  let active = true;
  let restarting = false;

  recognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0]?.transcript ?? '';
      if (result.isFinal) {
        const clean = transcript.trim();
        if (clean) opts.onFinal(clean);
      } else {
        interim += transcript;
      }
    }
    if (opts.onPartial) opts.onPartial(interim.trim());
  };

  recognition.onerror = (event) => {
    // "no-speech" e "aborted" são transitórios/esperados — não incomodam o usuário.
    if (event.error === 'no-speech' || event.error === 'aborted') return;
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      active = false;
      opts.onError?.('Permissão de microfone negada para o ditado ao vivo.');
      return;
    }
    opts.onError?.(`Erro no ditado ao vivo: ${event.error}`);
  };

  recognition.onend = () => {
    // Reinicia enquanto o médico não pediu parada (Android encerra no silêncio).
    if (active && !restarting) {
      restarting = true;
      setTimeout(() => {
        restarting = false;
        if (active) {
          try {
            recognition.start();
          } catch {
            // já rodando ou estado inválido — ignora
          }
        }
      }, 250);
    } else if (!active) {
      opts.onEnd?.();
    }
  };

  try {
    recognition.start();
  } catch (err) {
    active = false;
    throw err instanceof Error ? err : new Error('Falha ao iniciar o ditado ao vivo.');
  }

  return {
    stop: () => {
      active = false;
      try {
        recognition.stop();
      } catch {
        // ignora
      }
    },
  };
}

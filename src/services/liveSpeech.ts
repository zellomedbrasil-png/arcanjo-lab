// src/services/liveSpeech.ts
// Ditado ao vivo via Web Speech API (webkitSpeechRecognition).
//
// No Chrome/Edge (desktop e Android) essa API é servida pelos motores de voz
// do Google — transcreve EM TEMPO REAL enquanto o médico fala, sem upload,
// sem chave e sem custo. É a rota "nativa do Google" mais rápida.
//
// Limitações: só Chrome/Edge (Firefox não implementa), exige internet e acesso
// aos servidores de voz do Google. Quando o ambiente bloqueia esse acesso ou
// nega o microfone, a API dispara erros (network, not-allowed, ...). Este
// módulo trata esses erros como FATAIS — encerra a sessão com uma mensagem
// clara — e NUNCA entra em loop de reinício (a causa dos "diversos erros").

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
  /** Erro fatal: a sessão vai encerrar. Recebe mensagem amigável. */
  onError?: (message: string) => void;
  /** Chamado UMA vez quando a sessão termina (por stop, erro fatal ou fim natural). */
  onEnd?: () => void;
}

// Erros que NÃO reiniciam o reconhecimento — encerram a sessão.
const FATAL_ERRORS: Record<string, string> = {
  'not-allowed': 'Permissão de microfone negada. Autorize o microfone no navegador e tente de novo.',
  'service-not-allowed': 'O serviço de voz do Google não está disponível neste navegador/ambiente. Use o Whisper.',
  'network': 'Sem acesso ao serviço de voz do Google (rede). Use o Whisper ou tente outra conexão.',
  'audio-capture': 'Microfone não encontrado. Verifique o dispositivo de áudio.',
  'language-not-supported': 'Idioma não suportado pelo ditado ao vivo neste navegador.',
  'bad-grammar': 'Falha de configuração do ditado ao vivo. Use o Whisper.',
};

// Limite de segurança: mesmo em fim natural, nunca reinicia mais que isto
// numa mesma sessão (barreira final contra qualquer loop inesperado).
const MAX_RESTARTS = 120;

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

  // active   = usuário ainda quer ditar (permite reinício após pausas);
  // ended    = onEnd já foi disparado (garante chamada única);
  // restarts = barreira contra loop.
  let active = true;
  let ended = false;
  let restarts = 0;

  const finish = () => {
    if (ended) return;
    ended = true;
    active = false;
    opts.onEnd?.();
  };

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
    // Transitórios esperados — não são erros para o usuário e não encerram.
    if (event.error === 'no-speech' || event.error === 'aborted') return;

    // Qualquer outro erro é tratado como fatal: encerra a sessão SEM reiniciar.
    active = false;
    const msg = FATAL_ERRORS[event.error] || `Erro no ditado ao vivo: ${event.error}. Use o Whisper.`;
    opts.onError?.(msg);
    // O onend vem logo em seguida e dispara finish().
  };

  recognition.onend = () => {
    // Reinicia SOMENTE se o usuário ainda quer ditar (fim natural por silêncio,
    // ex. Android) e dentro do limite de segurança. Erros já zeraram `active`.
    if (active && restarts < MAX_RESTARTS) {
      restarts++;
      setTimeout(() => {
        if (!active) { finish(); return; }
        try {
          recognition.start();
        } catch {
          // Estado inválido/duplo start — encerra com segurança.
          finish();
        }
      }, 300);
      return;
    }
    finish();
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
        finish();
      }
    },
  };
}

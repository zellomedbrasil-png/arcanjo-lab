// src/services/recordingVault.ts
// Cofre LOCAL de gravações (IndexedDB) — rede de segurança contra perda de áudio.
//
// Por que existe: até então o áudio gravado no celular vivia SÓ na memória (RAM).
// Se a transcrição falhasse (rede fraca, timeout, cota, tela bloqueada, app
// recarregado), a gravação sumia — sem como reenviar nem salvar. Era a causa da
// perda de registro relatada.
//
// Agora, ao PARAR a gravação, os segmentos são gravados no IndexedDB ANTES de
// tentar transcrever. Mesmo que tudo falhe depois, o áudio continua salvo no
// próprio aparelho e pode ser: reenviado, baixado ou excluído. Uma rotina de
// limpeza remove gravações já enviadas/antigas para não pesar o armazenamento.
//
// IndexedDB guarda Blobs nativamente (sem base64), então não incha a memória.

const DB_NAME = 'arcanjo-recordings';
const DB_VERSION = 1;
const STORE = 'recordings';

// Políticas de retenção — mantêm o cofre leve sem descartar nada que ainda
// possa ser necessário para recuperar um registro.
const SENT_TTL_MS = 2 * 60 * 60 * 1000;   // enviada com sucesso: guarda 2h e apaga
const MAX_TTL_MS = 48 * 60 * 60 * 1000;   // qualquer gravação: teto absoluto de 48h
const MAX_ITEMS = 20;                      // no máximo 20 gravações guardadas

export type RecordingStatus = 'pending' | 'transcribing' | 'sent' | 'failed';

export interface StoredRecording {
  id: string;
  createdAt: number;
  patientName: string;
  mimeType: string;
  /** Segmentos de áudio na ordem — cada um é um arquivo completo e válido. */
  segments: Blob[];
  durationSec: number;
  sizeBytes: number;
  status: RecordingStatus;
  transcript?: string;
  error?: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB indisponível neste navegador.'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      // Se o navegador fechar a conexão (pressão de memória, versionchange),
      // invalida o cache para a próxima operação reabrir o banco.
      db.onclose = () => { dbPromise = null; };
      db.onversionchange = () => { db.close(); dbPromise = null; };
      resolve(db);
    };
    req.onerror = () => reject(req.error ?? new Error('Falha ao abrir o cofre de gravações.'));
  });
  // Falha na abertura NÃO fica cacheada — a próxima chamada tenta de novo.
  dbPromise.catch(() => { dbPromise = null; });
  return dbPromise;
}

function tx(db: IDBDatabase, mode: IDBTransactionMode): IDBObjectStore {
  return db.transaction(STORE, mode).objectStore(STORE);
}

function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Pede armazenamento persistente ao navegador — evita que o áudio salvo seja
 * descartado sob pressão de espaço enquanto ainda não foi enviado. Silencioso.
 */
export async function requestPersistentStorage(): Promise<void> {
  try {
    if (navigator.storage?.persist && navigator.storage.persisted) {
      const already = await navigator.storage.persisted();
      if (!already) await navigator.storage.persist();
    }
  } catch {
    // sem suporte — segue normalmente
  }
}

/** Gera um id único (usa crypto quando disponível). */
function newId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    // fora de contexto seguro
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Salva uma nova gravação (status inicial 'pending') e devolve o registro. */
export async function saveRecording(input: {
  patientName: string;
  mimeType: string;
  segments: Blob[];
  durationSec: number;
}): Promise<StoredRecording> {
  const db = await openDB();
  const sizeBytes = input.segments.reduce((sum, s) => sum + (s?.size ?? 0), 0);
  const rec: StoredRecording = {
    id: newId(),
    createdAt: Date.now(),
    patientName: input.patientName || '',
    mimeType: input.mimeType || 'audio/webm',
    segments: input.segments,
    durationSec: input.durationSec,
    sizeBytes,
    status: 'pending',
  };
  await reqToPromise(tx(db, 'readwrite').put(rec));
  return rec;
}

/** Atualiza campos de uma gravação existente (status, transcript, error...). */
export async function updateRecording(
  id: string,
  patch: Partial<Omit<StoredRecording, 'id'>>,
): Promise<void> {
  const db = await openDB();
  // get + put na MESMA transação, encadeados por callback (sem `await` no meio,
  // que auto-encerraria a transação). Atômico: uma exclusão concorrente não pode
  // acontecer entre a leitura e a escrita — o put não ressuscita registro apagado.
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    const store = transaction.objectStore(STORE);
    const getReq = store.get(id) as IDBRequest<StoredRecording | undefined>;
    getReq.onsuccess = () => {
      if (getReq.result) store.put({ ...getReq.result, ...patch });
    };
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Falha ao atualizar gravação.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Atualização de gravação abortada.'));
  });
}

/**
 * Reconciliação na abertura da página: nenhuma transcrição pode estar em
 * andamento agora, então toda gravação presa em 'transcribing' é resto de uma
 * sessão interrompida (recarga, aba fechada, escrita perdida). Vira 'failed'
 * com orientação de reenvio — o selo "Enviando..." nunca mais fica eterno.
 */
export async function resetStaleTranscribing(): Promise<void> {
  try {
    const all = await listRecordings();
    for (const rec of all) {
      if (rec.status === 'transcribing') {
        await updateRecording(rec.id, {
          status: 'failed',
          error: 'Envio interrompido (página recarregada ou tempo esgotado). Toque em Reenviar.',
        });
      }
    }
  } catch {
    // reconciliação é best-effort — nunca deve travar a abertura
  }
}

/** Remove uma gravação do cofre. */
export async function deleteRecording(id: string): Promise<void> {
  const db = await openDB();
  await reqToPromise(tx(db, 'readwrite').delete(id));
}

/** Lista todas as gravações, da mais recente para a mais antiga. */
export async function listRecordings(): Promise<StoredRecording[]> {
  const db = await openDB();
  const all = await reqToPromise(tx(db, 'readonly').getAll() as IDBRequest<StoredRecording[]>);
  return (all || []).sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Remove gravações que já não precisam ocupar espaço:
 *  - enviadas com sucesso há mais de SENT_TTL_MS;
 *  - qualquer gravação além do teto absoluto MAX_TTL_MS;
 *  - excedente acima de MAX_ITEMS (descarta primeiro as já enviadas mais antigas).
 * Nunca apaga uma gravação 'failed'/'pending' recente — é justamente o que
 * precisa sobreviver para ser reenviada.
 */
export async function purgeOldRecordings(): Promise<void> {
  try {
    const all = await listRecordings();
    const now = Date.now();
    const toDelete = new Set<string>();

    for (const rec of all) {
      const age = now - rec.createdAt;
      if (rec.status === 'sent' && age > SENT_TTL_MS) toDelete.add(rec.id);
      if (age > MAX_TTL_MS) toDelete.add(rec.id);
    }

    // Excedente de contagem: mantém as mais recentes; corta o excesso, dando
    // preferência a descartar as já enviadas mais antigas.
    const survivors = all.filter((r) => !toDelete.has(r.id));
    if (survivors.length > MAX_ITEMS) {
      const overflow = survivors.length - MAX_ITEMS;
      const candidates = [...survivors]
        .sort((a, b) => {
          // enviadas primeiro (mais descartáveis), depois mais antigas primeiro
          if (a.status === 'sent' && b.status !== 'sent') return -1;
          if (b.status === 'sent' && a.status !== 'sent') return 1;
          return a.createdAt - b.createdAt;
        })
        .slice(0, overflow);
      candidates.forEach((r) => toDelete.add(r.id));
    }

    for (const id of toDelete) await deleteRecording(id);
  } catch {
    // limpeza é best-effort — nunca deve quebrar o fluxo de gravação
  }
}

/** Junta os segmentos em um único Blob para download/backup no aparelho. */
export function recordingToBlob(rec: StoredRecording): Blob {
  return new Blob(rec.segments, { type: rec.mimeType || 'audio/webm' });
}

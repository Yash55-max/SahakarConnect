import crypto from 'crypto';

export type IdempotencyStatus = 'PROCESSING' | 'COMPLETED';

export interface IdempotencyRecord {
  status: IdempotencyStatus;
  requestHash: string;
  responseStatus?: number;
  responseBody?: any;
  createdAt: number;
}

// In-memory store with 24-hour retention window
const idempotencyStore = new Map<string, IdempotencyRecord>();
const TTL_MS = 24 * 60 * 60 * 1000;

export function hashPayload(payload: any): string {
  const str = typeof payload === 'string' ? payload : JSON.stringify(payload || {});
  return crypto.createHash('sha256').update(str).digest('hex');
}

export function cleanupExpiredKeys(): void {
  const now = Date.now();
  for (const [key, record] of idempotencyStore.entries()) {
    if (now - record.createdAt > TTL_MS) {
      idempotencyStore.delete(key);
    }
  }
}

// Periodic TTL sweep every 60 minutes; unref to prevent hanging process exit in tests
const sweepTimer = setInterval(cleanupExpiredKeys, 60 * 60 * 1000);
if (sweepTimer.unref) {
  sweepTimer.unref();
}

/**
 * Atomically attempts to claim an idempotency key.
 * Prevents concurrent identical requests from racing past validation.
 */
export function claimIdempotencyKey(
  scopedKey: string,
  requestHash: string
): { state: 'NEW' | 'PROCESSING' | 'COMPLETED' | 'MISMATCH'; record?: IdempotencyRecord } {
  cleanupExpiredKeys();
  const existing = idempotencyStore.get(scopedKey);
  if (!existing) {
    const newRecord: IdempotencyRecord = {
      status: 'PROCESSING',
      requestHash,
      createdAt: Date.now(),
    };
    idempotencyStore.set(scopedKey, newRecord);
    return { state: 'NEW' };
  }

  if (existing.requestHash !== requestHash) {
    return { state: 'MISMATCH', record: existing };
  }

  if (existing.status === 'PROCESSING') {
    return { state: 'PROCESSING', record: existing };
  }

  return { state: 'COMPLETED', record: existing };
}

/**
 * Marks an in-flight idempotency key as successfully COMPLETED with cached response
 */
export function completeIdempotencyKey(
  scopedKey: string,
  responseStatus: number,
  responseBody: any
): void {
  const existing = idempotencyStore.get(scopedKey);
  if (existing) {
    existing.status = 'COMPLETED';
    existing.responseStatus = responseStatus;
    existing.responseBody = responseBody;
  }
}

/**
 * Releases a claimed key if an unhandled error occurred, allowing user to retry
 */
export function releaseIdempotencyKey(scopedKey: string): void {
  idempotencyStore.delete(scopedKey);
}

export function getIdempotentRecord(key: string): IdempotencyRecord | undefined {
  const record = idempotencyStore.get(key);
  if (!record) return undefined;
  if (Date.now() - record.createdAt > TTL_MS) {
    idempotencyStore.delete(key);
    return undefined;
  }
  return record;
}

export function setIdempotentRecord(
  key: string,
  requestHash: string,
  responseStatus: number,
  responseBody: any
): void {
  idempotencyStore.set(key, {
    status: 'COMPLETED',
    requestHash,
    responseStatus,
    responseBody,
    createdAt: Date.now(),
  });
}

export function clearIdempotencyStore(): void {
  idempotencyStore.clear();
}

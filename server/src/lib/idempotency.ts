import crypto from 'crypto';

export interface IdempotencyRecord {
  requestHash: string;
  responseStatus: number;
  responseBody: any;
  createdAt: number;
}

// In-memory store with 24-hour retention window
const idempotencyStore = new Map<string, IdempotencyRecord>();

export function hashPayload(payload: any): string {
  const str = typeof payload === 'string' ? payload : JSON.stringify(payload || {});
  return crypto.createHash('sha256').update(str).digest('hex');
}

export function getIdempotentRecord(key: string): IdempotencyRecord | undefined {
  const record = idempotencyStore.get(key);
  if (!record) return undefined;
  // Expire after 24 hours
  if (Date.now() - record.createdAt > 24 * 60 * 60 * 1000) {
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
    requestHash,
    responseStatus,
    responseBody,
    createdAt: Date.now(),
  });
}

export function clearIdempotencyStore(): void {
  idempotencyStore.clear();
}

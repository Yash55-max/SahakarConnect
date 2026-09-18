/**
 * Offline Resilience & Action Queue
 * Enables tradesmen working in basements, elevator shafts, or patchy cell zones
 * to buffer status updates and completion PIN entries in local storage.
 * Automatically synchronizes with the SahakarConnect backend upon reconnection.
 *
 * Security Note: Tokens are NOT stored in the persistent offline queue.
 * Active session credentials are read securely at the moment of synchronization.
 */

export interface QueuedOfflineAction {
  id: string;
  type: 'START_JOB' | 'COMPLETE_WITH_PIN';
  bookingId: string;
  payload: Record<string, any>;
  token?: string | null;
  createdAt: number;
  retries: number;
}

const STORAGE_KEY = 'sahakar_offline_action_queue';

type QueueChangeListener = (queue: QueuedOfflineAction[]) => void;
const listeners: Set<QueueChangeListener> = new Set();

function notifyListeners(queue: QueuedOfflineAction[]) {
  listeners.forEach((fn) => {
    try {
      fn(queue);
    } catch (err) {
      console.error('[OfflineQueue] Listener error:', err);
    }
  });
}

export const offlineQueue = {
  getQueue(): QueuedOfflineAction[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  enqueue(action: Omit<QueuedOfflineAction, 'id' | 'createdAt' | 'retries'>): QueuedOfflineAction {
    const queue = this.getQueue();
    const newEntry: QueuedOfflineAction = {
      type: action.type,
      bookingId: action.bookingId,
      payload: action.payload,
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: Date.now(),
      retries: 0,
    };
    queue.push(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    notifyListeners(queue);
    return newEntry;
  },

  remove(id: string): void {
    const queue = this.getQueue().filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    notifyListeners(queue);
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
    notifyListeners([]);
  },

  subscribe(listener: QueueChangeListener): () => void {
    listeners.add(listener);
    listener(this.getQueue());
    return () => {
      listeners.delete(listener);
    };
  },

  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  },

  /**
   * Synchronize all buffered actions sequentially to maintain strict ordering
   */
  async flush(): Promise<{ syncedCount: number; errors: any[] }> {
    const queue = this.getQueue();
    if (queue.length === 0 || !this.isOnline()) {
      return { syncedCount: 0, errors: [] };
    }

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const activeToken = localStorage.getItem('token') || sessionStorage.getItem('token');

    let syncedCount = 0;
    const errors: any[] = [];
    const remaining: QueuedOfflineAction[] = [];

    for (const item of queue) {
      try {
        let endpoint = '';
        let body: any = {};

        if (item.type === 'START_JOB') {
          endpoint = `${apiBase}/api/bookings/${item.bookingId}/status`;
          body = { status: 'IN_PROGRESS' };
        } else if (item.type === 'COMPLETE_WITH_PIN') {
          endpoint = `${apiBase}/api/bookings/${item.bookingId}/complete`;
          body = { completionOtp: item.payload.completionOtp };
        }

        const res = await fetch(endpoint, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(activeToken && { Authorization: `Bearer ${activeToken}` }),
          },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          syncedCount++;
        } else {
          const errData = await res.json().catch(() => ({}));
          // If server returned client error (e.g. invalid OTP 400), don't keep retrying forever
          if (res.status >= 400 && res.status < 500) {
            errors.push({ id: item.id, error: errData.error || `HTTP ${res.status}` });
          } else {
            // Keep in queue if 5xx server error
            item.retries += 1;
            remaining.push(item);
          }
        }
      } catch (networkErr: any) {
        // Network still unreachable
        item.retries += 1;
        remaining.push(item);
        errors.push({ id: item.id, error: networkErr.message });
        break; // Stop flushing remainder until network recovers
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
    notifyListeners(remaining);

    return { syncedCount, errors };
  },
};

// Global network online listener to trigger automatic queue synchronization
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[OfflineQueue] Network restored. Initiating queue synchronization...');
    offlineQueue.flush();
  });
}

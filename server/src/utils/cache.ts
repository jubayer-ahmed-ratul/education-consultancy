interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class InMemoryResponseCache {
  private readonly store = new Map<string, CacheEntry<unknown>>();
  private readonly inflight = new Map<string, Promise<unknown>>();

  async getOrSet<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const cached = this.store.get(key) as CacheEntry<T> | undefined;
    if (cached && cached.expiresAt > now) {
      return cached.value;
    }

    const pending = this.inflight.get(key) as Promise<T> | undefined;
    if (pending) {
      return pending;
    }

    const promise = loader()
      .then((value) => {
        this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
        return value;
      })
      .finally(() => {
        this.inflight.delete(key);
      });

    this.inflight.set(key, promise);
    return promise;
  }

  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  clearAll(): void {
    this.store.clear();
  }
}

export const responseCache = new InMemoryResponseCache();

// TODO (you): an in-memory cache where each entry expires after a set time.
// It needs a way to get a value (counting a hit or a miss), store a value,
// and report { entries, hits, misses, ttlSeconds }. The exact counting rules
// are on the assignment page. A Map with { value, expiresAt } entries works well.
export class TtlCache {
  constructor(ttlSeconds) {
    this.ttlSeconds = ttlSeconds;
    this.store = new Map();
    this.hits = 0;
    this.misses = 0;
  }
  set(key, value) {
    this.store.set(key, {
      value: value,
      expiresAt: Date.now() + this.ttlSeconds * 1000,
    });
  }
  get(key) {
    const entry = this.store.get(key);
    if (!entry || entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      this.misses += 1;
      return undefined;
    }
    this.hits += 1;
    return entry.value;
  }
  getStats() {
    const now = Date.now();

    for (const [key, entry] of this.store) {
      if (entry.expiresAt <= now) {
        this.store.delete(key);
      }
    }
    return {
      entries: this.store.size,
      hits: this.hits,
      misses: this.misses,
      ttlSeconds: this.ttlSeconds,
    };
  }
}

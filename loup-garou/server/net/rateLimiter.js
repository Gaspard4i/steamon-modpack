// Token bucket par clé (socket ou IP).
export class RateLimiter {
  constructor({ capacity, perSecond }) {
    this.capacity = capacity;
    this.perSecond = perSecond;
    this.buckets = new Map();
  }
  take(key, now = Date.now()) {
    let b = this.buckets.get(key);
    if (!b) b = { tokens: this.capacity, at: now };
    b.tokens = Math.min(this.capacity, b.tokens + ((now - b.at) / 1000) * this.perSecond);
    b.at = now;
    const ok = b.tokens >= 1;
    if (ok) b.tokens -= 1;
    this.buckets.set(key, b);
    return ok;
  }
  // Y a-t-il encore au moins un jeton (sans en consommer) ?
  has(key, now = Date.now()) {
    const b = this.buckets.get(key);
    if (!b) return true;
    return Math.min(this.capacity, b.tokens + ((now - b.at) / 1000) * this.perSecond) >= 1;
  }
  gc(now = Date.now()) {
    for (const [k, b] of this.buckets) if (now - b.at > 120000) this.buckets.delete(k);
  }
}

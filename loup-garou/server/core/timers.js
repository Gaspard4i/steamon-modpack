// Un seul minuteur actif à la fois (celui de la phase). Horodaté côté serveur.
export class TimerManager {
  constructor(now = () => Date.now()) {
    this.now = now;
    this.handle = null;
  }
  set(ms, fn) {
    this.clear();
    this.handle = setTimeout(() => {
      this.handle = null;
      fn();
    }, Math.max(0, ms));
    this.handle.unref?.();
    return this.now() + ms;
  }
  clear() {
    if (this.handle) clearTimeout(this.handle);
    this.handle = null;
  }
}

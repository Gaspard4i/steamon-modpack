// Store minimal : objet + subscribe.
const listeners = new Set();
const data = { state: null, joined: false, connected: false, offset: 0, kicked: false, toasts: [] };

export const store = {
  get: () => data,
  set(patch) {
    Object.assign(data, patch);
    for (const l of listeners) l(data);
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  toast(text) {
    const root = document.getElementById('toasts');
    if (!root) return;
    const d = document.createElement('div');
    d.className = 'toast';
    d.textContent = text;
    root.appendChild(d);
    setTimeout(() => d.classList.add('out'), 3500);
    setTimeout(() => d.remove(), 4200);
  },
};

export const now = () => Date.now() + data.offset;

import { io } from 'socket.io-client';
import { store } from './store.js';

const TOKEN_KEY = 'lg.token';
const PROFILE_KEY = 'lg.profile';

export const saved = {
  get token() { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set token(v) { try { v ? localStorage.setItem(TOKEN_KEY, v) : localStorage.removeItem(TOKEN_KEY); } catch { /* stockage indisponible */ } },
  get profile() { try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); } catch { return null; } },
  set profile(v) { try { localStorage.setItem(PROFILE_KEY, JSON.stringify(v)); } catch { /* stockage indisponible */ } },
};

export const socket = io({ transports: ['websocket'], autoConnect: false, reconnectionDelayMax: 4000 });

let lastVersion = -1;
socket.on('state:full', (view) => {
  if (!view) return;
  if (view.v < lastVersion && view.v !== 0) return; // paquet ancien
  lastVersion = view.v;
  store.set({ state: view, offset: view.serverNow - Date.now(), joined: true });
});
socket.on('toast', ({ text }) => store.toast(text));
socket.on('kicked', () => {
  saved.token = null;
  store.set({ state: null, joined: false, kicked: true });
});

socket.on('connect', () => {
  store.set({ connected: true });
  const token = saved.token;
  if (token) emit('table:join', { token }).then((r) => {
    if (!r.ok) { saved.token = null; store.set({ state: null, joined: false }); }
  });
});
socket.on('disconnect', () => store.set({ connected: false }));

export function emit(event, data) {
  return new Promise((resolve) => {
    if (!socket.connected) return resolve({ ok: false, code: 'SERVER_ERROR' });
    const t = setTimeout(() => resolve({ ok: false, code: 'SERVER_ERROR' }), 8000);
    socket.emit(event, data, (r) => { clearTimeout(t); resolve(r || { ok: false, code: 'SERVER_ERROR' }); });
  });
}

export async function join(profile, password) {
  if (!socket.connected) {
    socket.connect();
    await new Promise((res) => { const t = setTimeout(res, 6000); socket.once('connect', () => { clearTimeout(t); res(); }); });
  }
  const r = await emit('table:join', { ...profile, password });
  if (r.ok) { saved.token = r.token; saved.profile = profile; }
  return r;
}

export function boot() {
  if (saved.token) socket.connect();
}

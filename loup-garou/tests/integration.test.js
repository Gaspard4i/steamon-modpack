import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { io } from 'socket.io-client';

const PORT = 3299;
const URL = `http://127.0.0.1:${PORT}`;
let proc; let dir;
const clients = [];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(fn, ms = 4000) { const t = Date.now(); while (Date.now() - t < ms) { const v = await fn(); if (v) return v; await wait(30); } throw new Error('timeout'); }

function client() {
  const s = io(URL, { transports: ['websocket'], forceNew: true, reconnection: false });
  s.view = null;
  s.on('state:full', (v) => { s.view = v; });
  clients.push(s);
  return new Promise((res, rej) => { s.on('connect', () => res(s)); s.on('connect_error', rej); });
}
const emit = (s, ev, data) => new Promise((res) => s.emit(ev, data, res));

before(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lg-'));
  proc = spawn('node', ['server/index.js'], { env: { ...process.env, PORT: String(PORT), TABLE_PASSWORD: 'secret', DATA_DIR: dir, LOG_LEVEL: 'silent' }, stdio: 'ignore' });
  await until(async () => { try { return (await fetch(`${URL}/healthz`)).ok; } catch { return false; } }, 8000);
});
after(() => { clients.forEach((c) => c.close()); proc?.kill('SIGTERM'); });

test('mot de passe, unicité et lobby', async () => {
  const a = await client();
  assert.equal((await emit(a, 'table:join', { pseudo: 'Alice', color: 'garance', password: 'nope' })).code, 'BAD_PASSWORD');
  const ra = await emit(a, 'table:join', { pseudo: 'Alice', color: 'garance', password: 'secret' });
  assert.ok(ra.ok && ra.token);
  const b = await client();
  assert.equal((await emit(b, 'table:join', { pseudo: 'alice', color: 'ocre', password: 'secret' })).code, 'PSEUDO_TAKEN');
  assert.equal((await emit(b, 'table:join', { pseudo: 'Bob', color: 'garance', password: 'secret' })).code, 'COLOR_TAKEN');
  assert.equal((await emit(b, 'table:join', { pseudo: '<img src=x onerror=1>', color: 'ocre', password: 'secret' })).code, 'INVALID');
  assert.ok((await emit(b, 'table:join', { pseudo: 'Bob', color: 'ocre', password: 'secret' })).ok);
  await until(() => a.view?.players.length === 2);
  assert.equal(a.view.hostId, ra.id);
  // Un non-hôte ne peut pas lancer
  assert.equal((await emit(b, 'host:start', {})).code, 'NOT_ALLOWED');
  // Pas assez de joueurs
  assert.equal((await emit(a, 'host:start', {})).code, 'NOT_ENOUGH_PLAYERS');
});

test('partie : rôles privés, spectateur, reconnexion', async () => {
  const names = [['Cleo', 'vertdegris'], ['Dan', 'outremer'], ['Eve', 'sepia']];
  const extra = [];
  for (const [p, c] of names) { const s = await client(); assert.ok((await emit(s, 'table:join', { pseudo: p, color: c, password: 'secret' })).ok); extra.push(s); }
  const host = clients[0];
  assert.ok((await emit(host, 'host:start', {})).ok);
  await until(() => host.view?.phase.name === 'deal');
  // Chacun voit son rôle, jamais celui des autres (sauf loups entre eux)
  const all = [host, clients[1], ...extra];
  await until(() => all.every((c) => c.view?.you.role));
  for (const c of all) {
    for (const p of c.view.players) {
      if (p.id === c.view.you.id) continue;
      if (c.view.you.role === 'werewolf' && p.role === 'werewolf') continue;
      assert.equal(p.role, null);
    }
    assert.ok(!JSON.stringify(c.view).includes('token'));
  }
  // Spectateur en cours de partie
  const sp = await client();
  const r = await emit(sp, 'table:join', { pseudo: 'Fred', color: 'prune', password: 'secret' });
  assert.ok(r.ok && r.spectator);
  await until(() => sp.view?.you.spectator);
  assert.ok(sp.view.players.every((p) => p.role === null));
  // Action refusée hors phase
  assert.equal((await emit(extra[0], 'action:submit', { type: 'vote', targetId: 'x' })).code, 'WRONG_PHASE');
  // Reconnexion par token (sans mot de passe)
  const tokenClient = await client();
  const rj = await emit(tokenClient, 'table:join', { pseudo: 'Gus', color: 'indigo', password: 'secret' });
  tokenClient.close();
  await wait(100);
  const back = await client();
  const rr = await emit(back, 'table:join', { token: rj.token });
  assert.ok(rr.ok && rr.id === rj.id);
});

test('/status ne révèle ni rôles ni pseudos', async () => {
  const s = await (await fetch(`${URL}/status`)).json();
  assert.ok(s.players >= 4);
  assert.ok(!JSON.stringify(s).includes('Alice'));
});

test('arrêt propre écrit un snapshot', async () => {
  proc.kill('SIGTERM');
  await until(() => fs.existsSync(path.join(dir, 'state.json')), 4000);
  const j = JSON.parse(fs.readFileSync(path.join(dir, 'state.json'), 'utf8'));
  assert.equal(j.s.status, 'playing');
});

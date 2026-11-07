import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../server/core/game.js';
import { projectFor } from '../server/core/projection.js';
import { PALETTE } from '../shared/constants.js';

function seeded(seed) {
  let a = seed;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function table(n, seed = 1, cfg = {}) {
  const g = new Game({ rng: seeded(seed) });
  const ids = [];
  for (let i = 0; i < n; i++) ids.push(g.join({ pseudo: `Joueur${i}`, color: PALETTE[i].id }).id);
  g.setConfig(ids[0], { roles: { seer: true, witch: true, hunter: true, cupid: true, littlegirl: true, thief: true }, ...cfg });
  return { g, ids };
}

function botAct(g, id, rng) {
  const pr = projectFor(g, id).you.prompt;
  if (!pr) return;
  const t = () => pr.targets[Math.floor(rng() * pr.targets.length)];
  switch (pr.kind) {
    case 'wolf_vote': return g.dispatch(id, { type: 'wolf_vote', targetId: t() });
    case 'seer_look': return g.dispatch(id, { type: 'seer_look', targetId: t() });
    case 'witch': return g.dispatch(id, pr.canSave && rng() < 0.5 ? { type: 'witch', choice: 'save' } : rng() < 0.3 ? { type: 'witch', choice: 'poison', targetId: t() } : { type: 'witch', choice: 'pass' });
    case 'cupid_link': { const a = t(); let b = t(); while (b === a) b = t(); return g.dispatch(id, { type: 'cupid_link', targets: [a, b] }); }
    case 'thief_pick': return g.dispatch(id, { type: 'thief_pick', index: Math.floor(rng() * 3) - 1 });
    case 'spy': return g.dispatch(id, { type: 'spy' });
    case 'mayor_vote': return g.dispatch(id, { type: 'mayor_vote', targetId: t() });
    case 'vote': return g.dispatch(id, { type: 'vote', targetId: rng() < 0.1 ? null : t() });
    case 'hunter_shot': return g.dispatch(id, { type: 'hunter_shot', targetId: rng() < 0.2 ? null : t() });
    default:
  }
}

for (const n of [4, 5, 7, 10, 14, 18]) {
  test(`partie complète avec ${n} bots`, () => {
    for (let seed = 1; seed <= 15; seed++) {
      const { g, ids } = table(n, seed * 7 + n);
      const rng = seeded(seed + 100);
      assert.ok(g.start(ids[0]).ok);
      let guard = 0;
      while (g.s.status === 'playing' && guard++ < 400) {
        for (const id of ids) botAct(g, id, rng);
        g.timer.clear();
        g.onTimeout();
      }
      g.timer.clear();
      assert.equal(g.s.status, 'ended', `n=${n} seed=${seed} ne se termine pas (phase ${g.s.phase.name}/${g.s.phase.step})`);
      assert.ok(['village', 'wolves', 'lovers', 'none'].includes(g.s.winner));
    }
  });
}

test('projection : aucun rôle des autres avant révélation', () => {
  const { g, ids } = table(9, 3);
  g.start(ids[0]);
  g.timer.clear();
  for (const viewer of ids) {
    const v = projectFor(g, viewer);
    const me = g.s.players[viewer];
    for (const p of v.players) {
      if (p.id === viewer) continue;
      const other = g.s.players[p.id];
      const allowed = me.role === 'werewolf' && other.role === 'werewolf';
      if (!allowed) assert.equal(p.role, null, `${viewer} voit le rôle de ${p.id}`);
    }
    // Pas de fuite brute
    const json = JSON.stringify(v);
    assert.ok(!json.includes('"token"'), 'token dans la projection');
    assert.ok(!('extras' in v) || v.extrasCount !== undefined);
  }
});

test('unicité pseudo et couleur', () => {
  const g = new Game();
  assert.ok(g.join({ pseudo: 'Élodie', color: 'garance' }).ok);
  assert.equal(g.join({ pseudo: 'elodie', color: 'ocre' }).code, 'PSEUDO_TAKEN');
  assert.equal(g.join({ pseudo: 'Bob', color: 'garance' }).code, 'COLOR_TAKEN');
  assert.ok(g.join({ pseudo: 'Bob', color: 'ocre' }).ok);
});

test('reconnexion par token et spectateur en cours de partie', () => {
  const { g, ids } = table(5, 2);
  const tok = g.s.players[ids[1]].token;
  g.start(ids[0]);
  g.setConnected(ids[1], false);
  const r = g.join({ pseudo: 'x', color: 'x', token: tok });
  assert.ok(r.ok && r.reconnect);
  const s = g.join({ pseudo: 'Nouveau', color: PALETTE[10].id });
  assert.ok(s.ok && s.spectator);
  const v = projectFor(g, s.id);
  assert.ok(v.players.every((p) => p.role === null));
  g.timer.clear();
});

test('amoureux : mort en cascade', () => {
  const { g, ids } = table(8, 5);
  g.start(ids[0]);
  g.timer.clear();
  const [a, b] = ids;
  g.s.lovers = [a, b];
  g.kill(a, 'wolves');
  assert.equal(g.s.players[b].alive, false);
});

test('actions hors phase refusées', () => {
  const { g, ids } = table(6, 4);
  g.start(ids[0]);
  g.timer.clear();
  assert.equal(g.dispatch(ids[1], { type: 'vote', targetId: ids[2] }).code, 'WRONG_PHASE');
});

test('narrateur : la nuit avance à sa main, il ne voit aucun rôle', () => {
  const { g, ids } = table(7, 11);
  const [host, narr, ...players] = ids;
  assert.ok(g.setNarrator(host, narr).ok);
  assert.equal(g.setNarrator(players[0], narr).code, 'NOT_ALLOWED');
  assert.equal(g.gamers().length, 6);
  assert.ok(g.start(host).ok);
  assert.equal(g.s.players[narr].role, null);
  g.timer.clear();
  g.onTimeout(); // fin de la distribution (ou commande du narrateur)
  assert.equal(g.s.phase.name, 'night');
  assert.equal(g.timer.handle, null, 'pas de minuteur en nuit manuelle');
  assert.equal(g.s.phase.endsAt, null);
  const v = projectFor(g, narr);
  assert.equal(v.you.prompt.kind, 'narrator');
  assert.ok(v.you.prompt.steps.length >= 3);
  assert.ok(v.players.every((p) => p.role === null), 'le narrateur ne voit pas les identités');
  assert.ok(!JSON.stringify(v).includes('"wolfVotes"'));
  // Un joueur ne peut pas piloter
  assert.equal(g.dispatch(players[0], { type: 'narrator', cmd: 'next' }).code, 'NOT_ALLOWED');
  // Le narrateur enchaîne les étapes jusqu'à l'aube
  let guard = 0;
  while (g.s.phase.name === 'night' && guard++ < 20) assert.ok(g.dispatch(narr, { type: 'narrator', cmd: 'next' }).ok);
  assert.notEqual(g.s.phase.name, 'night');
  g.timer.clear();
});

test('narrateur : partie complète pilotée, un narrateur absent redonne la main au serveur', () => {
  for (let seed = 1; seed <= 10; seed++) {
    const { g, ids } = table(9, seed);
    const narr = ids[1];
    g.setNarrator(ids[0], narr);
    const rng = seeded(seed + 500);
    g.start(ids[0]);
    let guard = 0;
    while (g.s.status === 'playing' && guard++ < 500) {
      for (const id of ids) if (id !== narr) botAct(g, id, rng);
      g.dispatch(narr, { type: 'narrator', cmd: 'next' });
    }
    g.timer.clear();
    assert.equal(g.s.status, 'ended', `seed ${seed}`);
  }
  const { g, ids } = table(6, 3);
  g.setNarrator(ids[0], ids[1]);
  g.start(ids[0]);
  g.timer.clear();
  g.onTimeout();
  assert.equal(g.timer.handle, null);
  g.setConnected(ids[1], false);
  g.sweep();
  assert.ok(g.timer.handle, 'minuteur automatique relancé');
  g.timer.clear();
});

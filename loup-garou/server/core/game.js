// Moteur de la table unique. Aucune dépendance réseau : testable seul.
// - Machine à états déclarative (TRANSITIONS) pour les phases.
// - Rôles = Strategy (roles.js).
// - Actions = Commands ({type, targetId...}) validées puis appliquées par dispatch().
import crypto from 'node:crypto';
import {
  PHASE, LIMITS, DEFAULT_SETTINGS, SPECIAL_ROLES, ROLE_META, autoWolves, normPseudo, PALETTE,
} from '../../shared/constants.js';
import { ROLES, campOf, nightStepsFor } from './roles.js';
import { say } from './narration.js';
import { TimerManager } from './timers.js';

const TRANSITIONS = {
  [PHASE.LOBBY]: [PHASE.DEAL],
  [PHASE.DEAL]: [PHASE.NIGHT],
  [PHASE.NIGHT]: [PHASE.NIGHT, PHASE.DAY, PHASE.MAYOR, PHASE.HUNTER, PHASE.END],
  [PHASE.MAYOR]: [PHASE.DAY],
  [PHASE.DAY]: [PHASE.VOTE],
  [PHASE.VOTE]: [PHASE.NIGHT, PHASE.HUNTER, PHASE.END],
  [PHASE.HUNTER]: [PHASE.NIGHT, PHASE.DAY, PHASE.MAYOR, PHASE.HUNTER, PHASE.END],
  [PHASE.END]: [PHASE.LOBBY],
};

const COLOR_IDS = new Set(PALETTE.map((c) => c.id));
const err = (code) => ({ ok: false, code });
const OK = { ok: true };

export class Game {
  constructor({ rng = Math.random, now = () => Date.now(), onChange = () => {} } = {}) {
    this.rng = rng;
    this.now = now;
    this.onChange = onChange;
    this.timer = new TimerManager(now);
    this.chat = [];
    this.logSeq = 0;
    this.s = this.freshState();
  }

  freshState() {
    return {
      version: 0,
      status: 'lobby', // lobby | playing | ended
      hostId: null,
      settings: structuredClone(DEFAULT_SETTINGS),
      phase: { name: PHASE.LOBBY, step: null, endsAt: null, round: 0 },
      players: {},
      order: [],
      log: [],
      night: null,
      day: null,
      extras: [],
      activeRoles: [],
      mayorId: null,
      lovers: [],
      winner: null,
      resume: null,
      hunterId: null,
      stats: { village: 0, wolves: 0, lovers: 0, none: 0 },
    };
  }

  // ---------- utilitaires ----------
  changed() {
    this.s.version++;
    this.onChange();
  }
  rand(n) {
    return Math.floor(this.rng() * n);
  }
  pick(arr) {
    return arr[this.rand(arr.length)];
  }
  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = this.rand(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  uid(n = 8) {
    return crypto.randomBytes(n).toString('hex');
  }
  members() {
    return this.s.order.map((id) => this.s.players[id]);
  }
  gamers() {
    return this.members().filter((p) => !p.spectator);
  }
  alivePlayers() {
    return this.gamers().filter((p) => p.alive);
  }
  byToken(token) {
    return this.members().find((p) => p.token === token);
  }
  addLog(text, kind = 'info') {
    this.s.log.push({ n: ++this.logSeq, at: this.now(), kind, text });
    if (this.s.log.length > 300) this.s.log.shift();
  }
  goto(name, step = null) {
    const allowed = TRANSITIONS[this.s.phase.name] || [];
    if (!allowed.includes(name)) throw new Error(`Transition interdite ${this.s.phase.name} -> ${name}`);
    this.s.phase.name = name;
    this.s.phase.step = step;
  }
  arm(ms) {
    this.s.phase.endsAt = this.timer.set(ms, () => this.onTimeout());
  }
  rearm() {
    // Après restauration d'un snapshot.
    const { endsAt, name } = this.s.phase;
    if (name === PHASE.LOBBY || name === PHASE.END || !endsAt) return;
    this.s.phase.endsAt = this.timer.set(Math.max(500, endsAt - this.now()), () => this.onTimeout());
  }

  // ---------- table : connexion, profil ----------
  validateIdentity(pseudo, color, exceptId = null) {
    const np = normPseudo(pseudo);
    for (const m of this.members()) {
      if (m.id === exceptId) continue;
      if (normPseudo(m.pseudo) === np) return err('PSEUDO_TAKEN');
      if (m.color === color) return err('COLOR_TAKEN');
    }
    if (!COLOR_IDS.has(color)) return err('BAD_COLOR');
    return OK;
  }

  join({ pseudo, color, token }) {
    // Reconnexion par token.
    if (token) {
      const existing = this.byToken(token);
      if (existing) {
        existing.connected = true;
        existing.lastSeen = this.now();
        this.changed();
        return { ok: true, id: existing.id, token: existing.token, reconnect: true };
      }
    }
    if (this.members().length >= LIMITS.maxMembers) return err('TABLE_FULL');
    const v = this.validateIdentity(pseudo, color);
    if (!v.ok) return v;
    const spectator = this.s.status !== 'lobby' && this.s.status !== 'ended';
    const p = {
      id: this.uid(4),
      token: this.uid(16),
      pseudo,
      color,
      connected: true,
      lastSeen: this.now(),
      spectator,
      ready: false,
      role: null,
      alive: true,
      flags: {},
      notes: [],
    };
    this.s.players[p.id] = p;
    this.s.order.push(p.id);
    if (!spectator && !this.s.hostId) this.s.hostId = p.id;
    if (!spectator) this.addLog(`${p.pseudo} s’assoit à la table.`, 'info');
    this.changed();
    return { ok: true, id: p.id, token: p.token, spectator };
  }

  setConnected(id, connected) {
    const p = this.s.players[id];
    if (!p) return;
    p.connected = connected;
    p.lastSeen = this.now();
    this.changed();
  }

  removeMember(id, reason = 'leave') {
    const p = this.s.players[id];
    if (!p) return;
    const inGame = this.s.status === 'playing' && !p.spectator;
    if (inGame) {
      // En partie : le joueur reste à sa place (déconnecté), sauf expulsion par l'hôte.
      if (reason === 'kick') {
        p.connected = false;
        p.kicked = true;
        if (p.alive) {
          const before = new Set(this.alivePlayers().map((x) => x.id));
          this.kill(id, 'exil');
          this.announceDeaths([...before].filter((x) => !this.s.players[x].alive));
        }
      } else {
        p.connected = false;
      }
      this.changed();
      return;
    }
    delete this.s.players[id];
    this.s.order = this.s.order.filter((x) => x !== id);
    if (this.s.hostId === id) this.s.hostId = this.nextHost();
    this.changed();
  }

  nextHost() {
    const c = this.gamers().filter((p) => p.connected && !p.kicked)[0] || this.gamers().filter((p) => !p.kicked)[0];
    return c ? c.id : null;
  }

  setProfile(id, { pseudo, color }) {
    const p = this.s.players[id];
    if (!p) return err('UNKNOWN');
    if (this.s.status === 'playing' && !p.spectator) return err('WRONG_PHASE');
    const v = this.validateIdentity(pseudo, color, id);
    if (!v.ok) return v;
    p.pseudo = pseudo;
    p.color = color;
    this.changed();
    return OK;
  }

  setReady(id, ready) {
    const p = this.s.players[id];
    if (!p || p.spectator || this.s.status === 'playing') return err('WRONG_PHASE');
    p.ready = ready;
    this.changed();
    return OK;
  }

  // ---------- hôte ----------
  isHost(id) {
    return this.s.hostId === id;
  }

  setConfig(id, cfg) {
    if (!this.isHost(id)) return err('NOT_ALLOWED');
    if (this.s.status === 'playing') return err('WRONG_PHASE');
    const st = this.s.settings;
    if (cfg.roles) Object.assign(st.roles, cfg.roles);
    for (const k of ['wolves', 'mayor', 'dealSeconds', 'nightSeconds', 'discussionSeconds', 'voteSeconds']) {
      if (cfg[k] !== undefined) st[k] = cfg[k];
    }
    this.changed();
    return OK;
  }

  kick(hostId, targetId) {
    if (!this.isHost(hostId)) return err('NOT_ALLOWED');
    if (hostId === targetId) return err('NOT_ALLOWED');
    const t = this.s.players[targetId];
    if (!t) return err('UNKNOWN');
    this.removeMember(targetId, 'kick');
    return { ok: true, kickedPlayerId: targetId };
  }

  buildDeck() {
    const n = this.gamers().length;
    const st = this.s.settings;
    const maxWolves = Math.max(1, Math.floor((n - 1) / 2));
    const wolves = Math.min(maxWolves, st.wolves > 0 ? st.wolves : autoWolves(n));
    let specials = SPECIAL_ROLES.filter((r) => st.roles[r]);
    while (wolves + specials.length > n) specials.pop();
    const deck = [];
    for (let i = 0; i < wolves; i++) deck.push('werewolf');
    deck.push(...specials);
    while (deck.length < n) deck.push('villager');
    const extras = [];
    if (specials.includes('thief')) {
      for (let i = 0; i < 2; i++) extras.push(this.rng() < 0.2 ? 'werewolf' : 'villager');
    }
    return { deck, extras, wolves, specials };
  }

  start(id) {
    if (!this.isHost(id)) return err('NOT_ALLOWED');
    if (this.s.status === 'playing') return err('WRONG_PHASE');
    if (this.s.status === 'ended') this.backToLobby(id);
    const gamers = this.gamers();
    if (gamers.length < LIMITS.minPlayers) return err('NOT_ENOUGH_PLAYERS');
    const { deck, extras } = this.buildDeck();
    const shuffled = this.shuffle(deck);
    gamers.forEach((p, i) => {
      p.role = shuffled[i];
      p.alive = true;
      p.flags = {};
      p.notes = [];
      p.ready = false;
    });
    this.s.extras = extras;
    this.s.activeRoles = [...new Set([...shuffled, ...extras])];
    this.s.mayorId = null;
    this.s.lovers = [];
    this.s.winner = null;
    this.s.status = 'playing';
    this.s.phase.round = 0;
    this.s.log = [];
    this.s.night = null;
    this.s.day = null;
    this.chat = this.chat.filter((m) => m.channel === 'lobby').slice(-30);
    this.goto(PHASE.DEAL);
    this.addLog(say('deal', this.rng), 'narration');
    this.arm(this.s.settings.dealSeconds * 1000);
    this.changed();
    return OK;
  }

  backToLobby(id) {
    if (id !== null && !this.isHost(id)) return err('NOT_ALLOWED');
    this.timer.clear();
    const st = this.s;
    st.status = 'lobby';
    st.phase = { name: PHASE.LOBBY, step: null, endsAt: null, round: 0 };
    st.night = null;
    st.day = null;
    st.winner = null;
    st.mayorId = null;
    st.lovers = [];
    st.extras = [];
    st.resume = null;
    st.hunterId = null;
    for (const p of this.members()) {
      p.spectator = false; // les spectateurs rejoignent la partie suivante
      p.role = null;
      p.alive = true;
      p.flags = {};
      p.notes = [];
      p.ready = false;
    }
    // Les joueurs déconnectés ou expulsés quittent la table.
    for (const p of this.members()) {
      if (!p.connected || p.kicked) {
        delete st.players[p.id];
        st.order = st.order.filter((x) => x !== p.id);
      }
    }
    if (!st.players[st.hostId]) st.hostId = this.nextHost();
    this.changed();
    return OK;
  }

  resetTable(id) {
    if (!this.isHost(id)) return err('NOT_ALLOWED');
    return this.backToLobby(id);
  }

  // ---------- timeouts ----------
  onTimeout() {
    try {
      switch (this.s.phase.name) {
        case PHASE.DEAL: return this.startNight();
        case PHASE.NIGHT: return this.advanceNight();
        case PHASE.MAYOR: return this.resolveMayor();
        case PHASE.DAY: return this.startVote();
        case PHASE.VOTE: return this.resolveVote();
        case PHASE.HUNTER: return this.hunterTimeout();
        default: return undefined;
      }
    } catch (e) {
      console.error('[game] erreur de timeout', e);
      return undefined;
    }
  }

  // ---------- nuit ----------
  startNight() {
    const st = this.s;
    st.phase.round += 1;
    st.night = {
      steps: nightStepsFor(st.activeRoles, st.phase.round).map((r) => r.id),
      idx: -1,
      wolfVotes: {},
      victimId: null,
      saved: false,
      poisonId: null,
      caught: false,
      spied: false,
      acted: {},
    };
    st.day = null;
    this.goto(PHASE.NIGHT, 'sleep');
    this.addLog(say('nightFall', this.rng), 'narration');
    this.arm(4000);
    st.night.intro = true;
    this.changed();
  }

  advanceNight() {
    const st = this.s;
    const n = st.night;
    if (!n) return;
    if (n.intro) n.intro = false;
    // Fin d'étape précédente.
    const prev = n.steps[n.idx];
    if (prev === 'werewolf') this.finalizeWolves();
    n.idx += 1;
    if (n.idx >= n.steps.length) return this.dawn();
    const roleId = n.steps[n.idx];
    const role = ROLES[roleId];
    st.phase.step = role.step;
    n.acted = { ...n.acted };
    const hasActors = role.actors(this).length > 0;
    this.addLog(say(role.step === 'wolves' ? 'wolves' : role.step, this.rng), 'narration-night');
    // Étape sans acteur vivant : leurre aléatoire pour ne rien révéler.
    const ms = hasActors ? role.duration(this) * 1000 : (4 + this.rand(6)) * 1000;
    this.goto(PHASE.NIGHT, role.step);
    this.arm(ms);
    this.changed();
  }

  finalizeWolves() {
    const n = this.s.night;
    const tally = {};
    for (const t of Object.values(n.wolfVotes)) if (t) tally[t] = (tally[t] || 0) + 1;
    const max = Math.max(0, ...Object.values(tally));
    let victim = null;
    if (max > 0) victim = this.pick(Object.keys(tally).filter((k) => tally[k] === max));
    if (n.caught) {
      const girl = this.alivePlayers().find((p) => p.role === 'littlegirl');
      if (girl) victim = girl.id;
    }
    n.victimId = victim;
  }

  checkNightEarlyEnd() {
    const n = this.s.night;
    const role = ROLES[n.steps[n.idx]];
    if (!role || !role.done(this)) return;
    this.s.phase.endsAt = this.timer.set(1500, () => this.onTimeout());
  }

  dawn() {
    const st = this.s;
    const n = st.night;
    const deaths = [];
    if (n.victimId && !n.saved) deaths.push([n.victimId, 'wolves']);
    if (n.poisonId) deaths.push([n.poisonId, 'poison']);
    const before = new Set(this.alivePlayers().map((p) => p.id));
    for (const [id, cause] of deaths) this.kill(id, cause);
    const died = [...before].filter((id) => !st.players[id].alive);
    this.addLog(say(died.length ? 'dawnDeath' : 'dawnPeace', this.rng), 'narration');
    this.announceDeaths(died);
    this.afterDeaths('dawn');
  }

  // ---------- morts ----------
  kill(id, cause) {
    const p = this.s.players[id];
    if (!p || !p.alive || p.spectator) return;
    p.alive = false;
    p.deathCause = cause;
    if (p.role === 'hunter') p.flags.hunterPending = true;
    if (this.s.mayorId === id) {
      this.s.mayorId = null;
      this.addLog(`${p.pseudo} était maire. La mairie est vacante.`, 'info');
    }
    // Amoureux : le partenaire suit.
    if (this.s.lovers.includes(id)) {
      const other = this.s.lovers.find((x) => x !== id);
      const o = this.s.players[other];
      if (o && o.alive) {
        this.addLog(`${o.pseudo} ne survit pas à la perte de son amoureux.`, 'death');
        this.kill(other, 'amour');
      }
    }
  }

  announceDeaths(ids) {
    for (const id of ids) {
      const p = this.s.players[id];
      const role = p.role;
      const cause = {
        wolves: 'dévoré par les loups', poison: 'empoisonné', lynch: 'pendu par le village',
        hunter: 'abattu par le Chasseur', amour: 'mort de chagrin', exil: 'exilé de la table',
      }[p.deathCause] || 'mort';
      this.addLog(`${p.pseudo} est ${cause}. Il ou elle était : ${ROLE_META[role]?.name ?? role}.`, 'death');
    }
  }

  afterDeaths(kind) {
    const st = this.s;
    // Chasseur en attente ?
    const hunter = this.gamers().find((p) => p.flags.hunterPending && !p.alive);
    if (hunter) {
      st.hunterId = hunter.id;
      st.resume = kind;
      this.goto(PHASE.HUNTER, 'shot');
      this.addLog(say('hunter', this.rng), 'narration');
      this.arm(30000);
      this.changed();
      return;
    }
    const winner = this.checkWin();
    if (winner) return this.endGame(winner);
    if (kind === 'dawn') {
      if (st.settings.mayor && !st.mayorId && st.phase.round === 1) return this.startMayor();
      return this.startDay();
    }
    return this.startNight();
  }

  hunterTimeout() {
    const h = this.s.players[this.s.hunterId];
    if (h) h.flags.hunterPending = false;
    this.addLog('Le Chasseur est mort avant d’avoir pu tirer.', 'info');
    this.afterDeaths(this.s.resume);
  }

  checkWin() {
    const alive = this.alivePlayers();
    if (alive.length === 0) return 'none';
    const [a, b] = this.s.lovers;
    if (a && b && alive.length === 2 && alive.every((p) => this.s.lovers.includes(p.id))) {
      if (campOf(this.s.players[a].role) !== campOf(this.s.players[b].role)) return 'lovers';
    }
    const wolves = alive.filter((p) => campOf(p.role) === 'wolves').length;
    if (wolves === 0) return 'village';
    if (wolves >= alive.length - wolves) return 'wolves';
    return null;
  }

  endGame(winner) {
    this.timer.clear();
    const st = this.s;
    st.winner = winner;
    st.status = 'ended';
    st.stats[winner] = (st.stats[winner] || 0) + 1;
    const key = { village: 'winVillage', wolves: 'winWolves', lovers: 'winLovers', none: 'winNone' }[winner];
    this.addLog(say(key, this.rng), 'narration');
    this.goto(PHASE.END);
    st.phase.endsAt = null;
    st.night = null;
    this.changed();
  }

  // ---------- jour ----------
  startMayor() {
    this.s.day = { mayorVotes: {}, skip: {} };
    this.goto(PHASE.MAYOR);
    this.addLog(say('mayor', this.rng), 'narration');
    this.arm(40000);
    this.changed();
  }

  resolveMayor() {
    const tally = {};
    for (const t of Object.values(this.s.day.mayorVotes)) if (t) tally[t] = (tally[t] || 0) + 1;
    const max = Math.max(0, ...Object.values(tally));
    if (max > 0) {
      const top = Object.keys(tally).filter((k) => tally[k] === max);
      const id = this.pick(top);
      this.s.mayorId = id;
      this.addLog(`${this.s.players[id].pseudo} est élu maire. Sa voix compte double.`, 'info');
    } else {
      this.addLog('Personne n’a été élu maire.', 'info');
    }
    this.startDay();
  }

  startDay() {
    this.s.day = { votes: {}, skip: {}, mayorVotes: {} };
    this.goto(PHASE.DAY);
    this.addLog(say('discussion', this.rng), 'narration');
    this.arm(this.s.settings.discussionSeconds * 1000);
    this.changed();
  }

  startVote() {
    this.s.day.votes = {};
    this.goto(PHASE.VOTE);
    this.addLog(say('vote', this.rng), 'narration');
    this.arm(this.s.settings.voteSeconds * 1000);
    this.changed();
  }

  connectedAlive() {
    return this.alivePlayers().filter((p) => p.connected);
  }

  resolveVote() {
    const st = this.s;
    const tally = {};
    for (const [voter, target] of Object.entries(st.day.votes)) {
      if (!target) continue;
      const w = voter === st.mayorId ? 2 : 1;
      tally[target] = (tally[target] || 0) + w;
    }
    const max = Math.max(0, ...Object.values(tally));
    if (max === 0) {
      this.addLog(say('noVote', this.rng), 'narration');
      return this.afterDeaths('lynch');
    }
    const top = Object.keys(tally).filter((k) => tally[k] === max);
    if (top.length > 1) {
      this.addLog(say('tie', this.rng), 'narration');
      return this.afterDeaths('lynch');
    }
    const before = new Set(this.alivePlayers().map((x) => x.id));
    this.kill(top[0], 'lynch');
    this.announceDeaths([...before].filter((x) => !st.players[x].alive));
    this.afterDeaths('lynch');
  }

  // ---------- actions (Command) ----------
  dispatch(id, a) {
    const st = this.s;
    const p = st.players[id];
    if (!p || p.spectator) return err('NOT_ALLOWED');
    const phase = st.phase.name;
    const isAliveTarget = (tid) => tid && st.players[tid] && !st.players[tid].spectator && st.players[tid].alive;

    // Chasseur : peut agir mort, uniquement pendant sa phase.
    if (a.type === 'hunter_shot') {
      if (phase !== PHASE.HUNTER || st.hunterId !== id) return err('WRONG_PHASE');
      if (a.targetId) {
        if (!isAliveTarget(a.targetId)) return err('BAD_TARGET');
        this.addLog(`${p.pseudo} tire un dernier coup de feu sur ${st.players[a.targetId].pseudo}.`, 'death');
        const before = new Set(this.alivePlayers().map((x) => x.id));
        this.kill(a.targetId, 'hunter');
        const died = [...before].filter((x) => !st.players[x].alive);
        this.announceDeaths(died);
      }
      p.flags.hunterPending = false;
      this.afterDeaths(st.resume);
      return OK;
    }

    if (!p.alive) return err('DEAD');

    switch (a.type) {
      case 'vote': {
        if (phase !== PHASE.VOTE) return err('WRONG_PHASE');
        if (a.targetId && (!isAliveTarget(a.targetId) || a.targetId === id)) return err('BAD_TARGET');
        st.day.votes[id] = a.targetId || null;
        this.changed();
        if (this.connectedAlive().every((x) => x.id in st.day.votes)) {
          st.phase.endsAt = this.timer.set(1500, () => this.onTimeout());
        }
        return OK;
      }
      case 'mayor_vote': {
        if (phase !== PHASE.MAYOR) return err('WRONG_PHASE');
        if (a.targetId && !isAliveTarget(a.targetId)) return err('BAD_TARGET');
        st.day.mayorVotes[id] = a.targetId || null;
        this.changed();
        if (this.connectedAlive().every((x) => x.id in st.day.mayorVotes)) {
          st.phase.endsAt = this.timer.set(1500, () => this.onTimeout());
        }
        return OK;
      }
      case 'skip_discussion': {
        if (phase !== PHASE.DAY) return err('WRONG_PHASE');
        st.day.skip[id] = true;
        this.changed();
        const need = Math.floor(this.connectedAlive().length / 2) + 1;
        if (Object.keys(st.day.skip).length >= need) this.startVote();
        return OK;
      }
      default:
        return this.nightAction(p, a, isAliveTarget);
    }
  }

  nightAction(p, a, isAliveTarget) {
    const st = this.s;
    if (st.phase.name !== PHASE.NIGHT) return err('WRONG_PHASE');
    const n = st.night;
    const stepRole = ROLES[n.steps[n.idx]];
    const step = st.phase.step;
    if (n.intro || !stepRole) return err('WRONG_PHASE');

    switch (a.type) {
      case 'wolf_vote': {
        if (step !== 'wolves' || p.role !== 'werewolf') return err('NOT_ALLOWED');
        if (!isAliveTarget(a.targetId) || st.players[a.targetId].role === 'werewolf') return err('BAD_TARGET');
        n.wolfVotes[p.id] = a.targetId;
        const wolves = this.alivePlayers().filter((x) => x.role === 'werewolf');
        if (wolves.every((w) => n.wolfVotes[w.id])) n.acted.wolves = true;
        this.changed();
        this.checkNightEarlyEnd();
        return OK;
      }
      case 'spy': {
        if (step !== 'wolves' || p.role !== 'littlegirl' || n.spied) return err('NOT_ALLOWED');
        n.spied = true;
        const wolves = this.alivePlayers().filter((x) => x.role === 'werewolf');
        const seen = this.pick(wolves);
        const caught = this.rng() < 0.4;
        if (caught) {
          n.caught = true;
          for (const w of wolves) w.notes.push({ type: 'caught', round: st.phase.round });
        }
        p.notes.push({
          type: 'spy', round: st.phase.round, wolfId: seen ? seen.id : null, caught,
        });
        this.changed();
        return OK;
      }
      case 'seer_look': {
        if (step !== 'seer' || p.role !== 'seer' || n.acted[p.id]) return err('NOT_ALLOWED');
        if (!isAliveTarget(a.targetId) || a.targetId === p.id) return err('BAD_TARGET');
        n.acted[p.id] = true;
        p.notes.push({ type: 'seer', round: st.phase.round, targetId: a.targetId, role: st.players[a.targetId].role });
        this.changed();
        this.checkNightEarlyEnd();
        return OK;
      }
      case 'witch': {
        if (step !== 'witch' || p.role !== 'witch' || n.acted[p.id]) return err('NOT_ALLOWED');
        if (a.choice === 'save') {
          if (p.flags.lifeUsed || !n.victimId || n.saved) return err('NOT_ALLOWED');
          p.flags.lifeUsed = true;
          n.saved = true;
          p.notes.push({ type: 'witch_save', round: st.phase.round, targetId: n.victimId });
        } else if (a.choice === 'poison') {
          if (p.flags.deathUsed || !isAliveTarget(a.targetId) || a.targetId === p.id) return err('BAD_TARGET');
          p.flags.deathUsed = true;
          n.poisonId = a.targetId;
          p.notes.push({ type: 'witch_poison', round: st.phase.round, targetId: a.targetId });
        } else if (a.choice !== 'pass') {
          return err('BAD_TARGET');
        }
        n.acted[p.id] = true;
        this.changed();
        this.checkNightEarlyEnd();
        return OK;
      }
      case 'cupid_link': {
        if (step !== 'cupid' || p.role !== 'cupid' || n.acted[p.id]) return err('NOT_ALLOWED');
        const [x, y] = a.targets || [];
        if (!x || !y || x === y || !isAliveTarget(x) || !isAliveTarget(y)) return err('BAD_TARGET');
        st.lovers = [x, y];
        n.acted[p.id] = true;
        const px = st.players[x];
        const py = st.players[y];
        px.notes.push({ type: 'lover', partnerId: y });
        py.notes.push({ type: 'lover', partnerId: x });
        p.notes.push({ type: 'cupid', a: x, b: y });
        this.changed();
        this.checkNightEarlyEnd();
        return OK;
      }
      case 'thief_pick': {
        if (step !== 'thief' || p.role !== 'thief' || n.acted[p.id]) return err('NOT_ALLOWED');
        if (a.index === undefined) return err('BAD_TARGET');
        if (a.index >= 0) {
          const newRole = st.extras[a.index];
          if (!newRole) return err('BAD_TARGET');
          st.extras[a.index] = 'thief';
          p.role = newRole;
          p.notes.push({ type: 'thief', role: newRole });
        } else {
          p.notes.push({ type: 'thief', role: 'thief' });
        }
        n.acted[p.id] = true;
        this.changed();
        this.checkNightEarlyEnd();
        return OK;
      }
      default:
        return err('NOT_ALLOWED');
    }
  }

  // ---------- chat ----------
  chatChannelFor(p) {
    const ph = this.s.phase.name;
    if (p.spectator) return ph === PHASE.LOBBY || ph === PHASE.END ? 'lobby' : null;
    if (this.s.status !== 'playing') return 'lobby';
    if (!p.alive) return 'dead';
    if (ph === PHASE.NIGHT && p.role === 'werewolf') return 'wolves';
    if (ph === PHASE.DAY || ph === PHASE.VOTE || ph === PHASE.MAYOR || ph === PHASE.HUNTER) return 'village';
    return null;
  }

  canRead(viewer, channel) {
    if (channel === 'lobby') return true;
    if (channel === 'village') return true;
    if (viewer.spectator) return false;
    if (channel === 'dead') return !viewer.alive;
    if (channel === 'wolves') return viewer.role === 'werewolf' || (!viewer.alive && this.s.status === 'playing');
    return false;
  }

  sendChat(id, text) {
    const p = this.s.players[id];
    if (!p) return err('UNKNOWN');
    const channel = this.chatChannelFor(p);
    if (!channel) return err('WRONG_PHASE');
    this.chat.push({ id: this.uid(4), at: this.now(), channel, from: id, text });
    if (this.chat.length > 400) this.chat.shift();
    this.changed();
    return OK;
  }

  // ---------- entretien (appelé toutes les 5 s) ----------
  sweep() {
    const now = this.now();
    let dirty = false;
    for (const p of this.members()) {
      if (p.connected) continue;
      const away = now - (p.lastSeen || 0);
      const inGame = this.s.status === 'playing' && !p.spectator;
      if (!inGame && away > (p.spectator ? 120000 : 60000)) {
        delete this.s.players[p.id];
        this.s.order = this.s.order.filter((x) => x !== p.id);
        dirty = true;
      }
    }
    const host = this.s.players[this.s.hostId];
    if (!host || (!host.connected && now - host.lastSeen > 30000)) {
      const nh = this.nextHost();
      if (nh !== this.s.hostId) {
        this.s.hostId = nh;
        dirty = true;
      }
    }
    // Partie fantôme : plus personne depuis 10 minutes.
    if (this.s.status !== 'lobby' && this.members().every((p) => !p.connected && now - p.lastSeen > 600000)) {
      this.backToLobby(null);
      dirty = false;
    }
    if (dirty) this.changed();
  }

  // ---------- persistance ----------
  serialize() {
    return { s: this.s, chat: this.chat, logSeq: this.logSeq };
  }

  static restore(data, opts) {
    const g = new Game(opts);
    g.s = data.s;
    g.chat = data.chat || [];
    g.logSeq = data.logSeq || 0;
    for (const p of Object.values(g.s.players)) {
      p.connected = false;
      p.lastSeen = g.now();
    }
    g.rearm();
    return g;
  }
}

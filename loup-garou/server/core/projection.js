// Projection (read model) par joueur : ne contient QUE ce que ce joueur a le droit de savoir.
// Aucun état brut n'est jamais émis vers un client.
import { PHASE } from '../../shared/constants.js';
import { ROLES } from './roles.js';

function promptFor(game, p) {
  const s = game.s;
  const ph = s.phase.name;
  if (p.id === s.narratorId) return { kind: 'narrator', ...game.narratorView() };
  if (p.spectator) return null;
  if (!p.alive) {
    if (ph === PHASE.HUNTER && s.hunterId === p.id) {
      return { kind: 'hunter_shot', targets: game.alivePlayers().map((x) => x.id) };
    }
    return null;
  }
  const alive = game.alivePlayers();
  switch (ph) {
    case PHASE.DEAL:
      return { kind: 'deal' };
    case PHASE.NIGHT: {
      const n = s.night;
      if (!n || n.intro) return { kind: 'sleep' };
      const role = ROLES[n.steps[n.idx]];
      if (role && role.actors(game).some((a) => a.id === p.id)) return role.prompt(game, p);
      if (p.role === 'littlegirl' && s.phase.step === 'wolves') return { kind: 'spy', used: n.spied };
      return { kind: 'sleep' };
    }
    case PHASE.MAYOR:
      return {
        kind: 'mayor_vote',
        targets: alive.map((x) => x.id),
        myVote: s.day.mayorVotes[p.id] ?? null,
        voted: p.id in s.day.mayorVotes,
      };
    case PHASE.DAY: {
      const need = Math.floor(game.connectedAlive().length / 2) + 1;
      return { kind: 'discuss', skipped: !!s.day.skip[p.id], skipCount: Object.keys(s.day.skip).length, skipNeed: need };
    }
    case PHASE.VOTE:
      return {
        kind: 'vote',
        targets: alive.filter((x) => x.id !== p.id).map((x) => x.id),
        myVote: s.day.votes[p.id] ?? null,
        voted: p.id in s.day.votes,
      };
    default:
      return null;
  }
}

export function projectFor(game, viewerId) {
  const s = game.s;
  const me = s.players[viewerId];
  if (!me) return null;
  const ended = s.status === 'ended';
  const sees = (other) => {
    if (other.id === me.id) return true;
    if (ended) return true;
    if (!other.alive && s.status === 'playing') return true; // rôle révélé à la mort
    if (!me.alive && !me.spectator && s.status === 'playing') return true; // les morts voient tout
    if (me.role === 'werewolf' && other.role === 'werewolf' && !me.spectator) return true;
    return false;
  };
  const myLoverId = me.notes.find((x) => x.type === 'lover')?.partnerId ?? null;
  const day = s.day;

  const players = game.members().map((o) => {
    const showRole = s.status !== 'lobby' && !o.spectator && sees(o);
    return {
      id: o.id,
      pseudo: o.pseudo,
      color: o.color,
      connected: o.connected,
      ready: o.ready,
      spectator: o.spectator,
      narrator: o.id === s.narratorId,
      alive: o.spectator ? true : o.alive,
      isHost: o.id === s.hostId,
      mayor: o.id === s.mayorId,
      role: showRole ? o.role : null,
      lover: !!(myLoverId && o.id === myLoverId),
      deathCause: !o.alive && !o.spectator ? o.deathCause ?? null : null,
    };
  });

  const phase = { ...s.phase };
  const chat = game.chat
    .filter((m) => game.canRead(me, m.channel))
    .slice(-150)
    .map(({ id, at, channel, from, text }) => ({ id, at, channel, from, text }));

  return {
    v: s.version,
    serverNow: game.now(),
    status: s.status,
    phase,
    hostId: s.hostId,
    narratorId: s.narratorId,
    settings: s.settings,
    stats: s.stats,
    winner: s.winner,
    mayorId: s.mayorId,
    you: {
      id: me.id,
      role: s.status === 'lobby' ? null : me.role,
      alive: me.alive,
      spectator: me.spectator,
      notes: me.notes,
      prompt: promptFor(game, me),
      chatChannel: game.chatChannelFor(me),
      isHost: me.id === s.hostId,
      isNarrator: me.id === s.narratorId,
    },
    players,
    votes: s.phase.name === PHASE.VOTE && day ? day.votes : null,
    mayorVotes: s.phase.name === PHASE.MAYOR && day ? day.mayorVotes : null,
    extrasCount: s.extras.length,
    log: s.log.slice(-80),
    chat,
  };
}

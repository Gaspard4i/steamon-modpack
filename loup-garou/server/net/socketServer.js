import crypto from 'node:crypto';
import { Server } from 'socket.io';
import {
  joinSchema, profileSchema, readySchema, configSchema, kickSchema, actionSchema, chatSchema, narratorSchema,
} from '../../shared/schemas.js';
import { projectFor } from '../core/projection.js';
import { RateLimiter } from './rateLimiter.js';
import { config } from '../config.js';

const sha = (s) => crypto.createHash('sha256').update(s).digest();
const safeEqual = (a, b) => crypto.timingSafeEqual(sha(a), sha(b));

// Messages d'erreur côté client mappés depuis ces codes stables.
const ZOD_CODE = 'INVALID';

export function attachSocketServer(httpServer, game, log) {
  const io = new Server(httpServer, {
    transports: ['websocket'],
    maxHttpBufferSize: 10_000,
    cors: config.allowedOrigin ? { origin: config.allowedOrigin } : undefined,
    pingInterval: 20000,
    pingTimeout: 25000,
  });

  const joinLimiter = new RateLimiter({ capacity: 20, perSecond: 20 / 60 });
  const chatLimiter = new RateLimiter({ capacity: 5, perSecond: 1 });
  const actionLimiter = new RateLimiter({ capacity: 15, perSecond: 6 });
  const badPass = new RateLimiter({ capacity: 5, perSecond: 5 / 120 });
  setInterval(() => { joinLimiter.gc(); chatLimiter.gc(); actionLimiter.gc(); badPass.gc(); }, 60000).unref();

  const sockets = new Map(); // playerId -> Set<socket>

  function broadcastNow() {
    for (const [pid, set] of sockets) {
      const view = projectFor(game, pid);
      if (!view) continue;
      for (const s of set) s.emit('state:full', view);
    }
  }
  let pendingBroadcast = null;
  game.onChange = () => {
    if (pendingBroadcast) return;
    pendingBroadcast = setTimeout(() => {
      pendingBroadcast = null;
      broadcastNow();
      game.persist?.();
    }, 40);
  };

  function ack(cb, payload) {
    if (typeof cb === 'function') cb(payload);
  }
  function parse(schema, data, cb) {
    const r = schema.safeParse(data);
    if (!r.success) { ack(cb, { ok: false, code: ZOD_CODE }); return null; }
    return r.data;
  }

  io.on('connection', (socket) => {
    const ip = socket.handshake.headers['x-forwarded-for']?.split(',')[0].trim() || socket.handshake.address;
    let playerId = null;

    const guard = (limiter, cb) => {
      if (!limiter.take(socket.id)) { ack(cb, { ok: false, code: 'RATE_LIMIT' }); return false; }
      return true;
    };

    socket.on('table:join', (data, cb) => {
      if (playerId) return ack(cb, { ok: false, code: 'ALREADY_JOINED' });
      // Reconnexion par token : pas besoin de mot de passe (le token est secret et vient du serveur).
      const loose = data && typeof data === 'object' ? data : {};
      const tokenPlayer = typeof loose.token === 'string' ? game.byToken(loose.token) : null;
      if (tokenPlayer) {
        const r = game.join({ pseudo: '', color: '', token: loose.token });
        if (r.ok) return finishJoin(r, cb);
      }
      if (!joinLimiter.take(ip)) return ack(cb, { ok: false, code: 'RATE_LIMIT' });
      const d = parse(joinSchema, data, cb);
      if (!d) return undefined;
      if (config.password) {
        if (!badPass.has(ip)) return ack(cb, { ok: false, code: 'RATE_LIMIT' });
        if (!safeEqual(d.password, config.password)) {
          badPass.take(ip);
          return ack(cb, { ok: false, code: 'BAD_PASSWORD' });
        }
      }
      const r = game.join({ pseudo: d.pseudo, color: d.color });
      if (!r.ok) return ack(cb, r);
      return finishJoin(r, cb);
    });

    function finishJoin(r, cb) {
      playerId = r.id;
      if (!sockets.has(playerId)) sockets.set(playerId, new Set());
      sockets.get(playerId).add(socket);
      ack(cb, { ok: true, token: r.token, id: r.id, spectator: !!r.spectator });
      socket.emit('state:full', projectFor(game, playerId));
      log.info({ id: playerId }, 'joined');
      game.setConnected(playerId, true);
    }

    const needPlayer = (cb) => {
      if (!playerId || !game.s.players[playerId]) { ack(cb, { ok: false, code: 'NOT_JOINED' }); return false; }
      return true;
    };

    socket.on('profile:update', (data, cb) => {
      if (!needPlayer(cb) || !guard(actionLimiter, cb)) return;
      const d = parse(profileSchema, data, cb); if (!d) return;
      ack(cb, game.setProfile(playerId, d));
    });
    socket.on('lobby:ready', (data, cb) => {
      if (!needPlayer(cb) || !guard(actionLimiter, cb)) return;
      const d = parse(readySchema, data, cb); if (!d) return;
      ack(cb, game.setReady(playerId, d.ready));
    });
    socket.on('host:config', (data, cb) => {
      if (!needPlayer(cb) || !guard(actionLimiter, cb)) return;
      const d = parse(configSchema, data, cb); if (!d) return;
      ack(cb, game.setConfig(playerId, d));
    });
    socket.on('host:start', (_d, cb) => {
      if (!needPlayer(cb) || !guard(actionLimiter, cb)) return;
      ack(cb, game.start(playerId));
    });
    socket.on('host:reset', (_d, cb) => {
      if (!needPlayer(cb) || !guard(actionLimiter, cb)) return;
      ack(cb, game.resetTable(playerId));
    });
    socket.on('host:narrator', (data, cb) => {
      if (!needPlayer(cb) || !guard(actionLimiter, cb)) return;
      const d = parse(narratorSchema, data, cb); if (!d) return;
      ack(cb, game.setNarrator(playerId, d.id));
    });
    socket.on('host:kick', (data, cb) => {
      if (!needPlayer(cb) || !guard(actionLimiter, cb)) return;
      const d = parse(kickSchema, data, cb); if (!d) return;
      const r = game.kick(playerId, d.id);
      if (r.ok) {
        const set = sockets.get(d.id);
        if (set) for (const s of set) { s.emit('kicked'); s.disconnect(true); }
      }
      ack(cb, r);
    });
    socket.on('action:submit', (data, cb) => {
      if (!needPlayer(cb) || !guard(actionLimiter, cb)) return;
      const d = parse(actionSchema, data, cb); if (!d) return;
      try {
        ack(cb, game.dispatch(playerId, d));
      } catch (e) {
        log.error({ err: e }, 'dispatch error');
        ack(cb, { ok: false, code: 'SERVER_ERROR' });
      }
    });
    socket.on('chat:send', (data, cb) => {
      if (!needPlayer(cb) || !guard(chatLimiter, cb)) return;
      const d = parse(chatSchema, data, cb); if (!d) return;
      ack(cb, game.sendChat(playerId, d.text));
    });
    socket.on('table:leave', (_d, cb) => {
      if (!playerId) return ack(cb, { ok: true });
      const id = playerId;
      playerId = null;
      const set = sockets.get(id);
      if (set) { set.delete(socket); if (set.size === 0) sockets.delete(id); }
      game.removeMember(id, 'leave');
      ack(cb, { ok: true });
    });
    socket.on('state:resync', () => {
      if (playerId) socket.emit('state:full', projectFor(game, playerId));
    });
    socket.on('time:ping', (cb) => ack(cb, Date.now()));

    socket.on('disconnect', () => {
      if (!playerId) return;
      const set = sockets.get(playerId);
      if (set) {
        set.delete(socket);
        if (set.size === 0) {
          sockets.delete(playerId);
          game.setConnected(playerId, false);
        }
      }
    });
  });

  return {
    io,
    closeAll(message) {
      io.emit('toast', { text: message });
      io.close();
    },
  };
}

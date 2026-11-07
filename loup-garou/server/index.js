import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import pino from 'pino';
import { config } from './config.js';
import { Game } from './core/game.js';
import { attachSocketServer } from './net/socketServer.js';
import { createSnapshotStore } from './infra/snapshot.js';
import { PHASE } from '../shared/constants.js';

const log = pino({ level: process.env.LOG_LEVEL || 'info' });
const store = createSnapshotStore(config.dataDir, log);

// Table unique, créée ici et injectée partout (pas de variable globale importée).
let game;
const saved = store.load();
if (saved?.s) {
  try {
    game = Game.restore(saved, {});
    log.info({ phase: game.s.phase.name }, 'état restauré depuis le snapshot');
  } catch (e) {
    log.error({ err: e }, 'snapshot illisible, nouvelle table');
  }
}
if (!game) game = new Game();
game.persist = () => store.save(() => game.serialize());

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 'loopback');
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'connect-src': ["'self'", 'ws:', 'wss:'],
        'img-src': ["'self'", 'data:'],
        'style-src': ["'self'", "'unsafe-inline'"],
        'font-src': ["'self'", 'data:'],
        'script-src': ["'self'"],
        'object-src': ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(compression());

app.get('/healthz', (_req, res) => res.json({ ok: true }));
app.get('/status', (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({
    status: game.s.status,
    phase: game.s.phase.name === PHASE.LOBBY ? 'lobby' : 'partie',
    players: game.gamers().length,
    connected: game.members().filter((p) => p.connected).length,
    members: game.members().map((p) => ({ color: p.color, spectator: p.spectator })),
    passwordRequired: !!config.password,
  });
});

if (fs.existsSync(config.distDir)) {
  app.use(
    express.static(config.distDir, {
      index: false,
      setHeaders(res, file) {
        if (/\/assets\//.test(file) || /\/icons\//.test(file)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        else res.setHeader('Cache-Control', 'no-cache');
      },
    }),
  );
  app.use((_req, res) => res.sendFile(path.join(config.distDir, 'index.html')));
} else {
  app.get('/', (_req, res) => res.type('text').send('Client non construit : lancez `npm run build`.'));
}

const server = http.createServer(app);
const net = attachSocketServer(server, game, log);

setInterval(() => game.sweep(), 5000).unref();

server.listen(config.port, config.host, () => {
  log.info(`Loup-Garou en écoute sur http://${config.host}:${config.port}${config.password ? ' (mot de passe actif)' : ' (SANS mot de passe)'}`);
  game.rearm();
});

function shutdown(sig) {
  log.info({ sig }, 'arrêt propre');
  game.timer.clear();
  store.flushSync(() => game.serialize());
  net.closeAll('Le village se rendort, revenez dans un instant.');
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 2000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

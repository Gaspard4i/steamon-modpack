import '@fontsource/pirata-one/400.css';
import '@fontsource/im-fell-english/400.css';
import '@fontsource/im-fell-english/400-italic.css';
import '@fontsource/spectral/400.css';
import '@fontsource/spectral/400-italic.css';
import '@fontsource/spectral/600.css';
import './styles.css';
import { store } from './net/store.js';
import { boot, saved } from './net/socket.js';
import { mountEntry } from './ui/entry.js';
import { mountScene } from './ui/scene.js';
import { startEmbers } from './fx/fx.js';

const app = document.getElementById('app');
let view = null; // 'entry' | 'scene'
let current = null;

function show(kind) {
  if (view === kind) return;
  current?.destroy();
  app.replaceChildren();
  view = kind;
  current = kind === 'scene' ? mountScene(app) : mountEntry(app);
  document.body.dataset.time = 'night';
  document.body.dataset.view = kind;
}

store.subscribe((d) => {
  const inGame = d.joined && d.state;
  // Pendant une reconnexion avec token, on garde l'écran de chargement plutôt que de clignoter vers l'entrée.
  if (inGame) { show('scene'); current.update(d.state); }
  else if (!(saved.token && !d.connected && view === 'scene')) show('entry');
});

boot();
show(saved.token ? 'scene' : 'entry');
if (saved.token) {
  // Écran vide le temps de la reconnexion ; bascule vers l'entrée si le token est refusé.
  setTimeout(() => { if (!store.get().state) show('entry'); }, 4000);
}
startEmbers();

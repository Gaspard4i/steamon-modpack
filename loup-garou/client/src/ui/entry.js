import { PALETTE, LIMITS, PSEUDO_RE } from '@shared/constants.js';
import { h, icon } from './dom.js';
import { colorPicker } from './colors.js';
import { join, saved } from '../net/socket.js';
import { err } from '../texts.js';
import { openRules, openCredits } from './pages.js';
import { store } from '../net/store.js';

export function mountEntry(root) {
  const profile = saved.profile || {};
  let status = null;
  let busy = false;

  const pseudo = h('input', {
    id: 'pseudo', name: 'pseudo', type: 'text', maxlength: LIMITS.pseudoMax, autocomplete: 'nickname',
    autocapitalize: 'words', spellcheck: 'false', placeholder: 'Ton nom de villageois', value: profile.pseudo || '',
  });
  const count = h('span', { class: 'count' }, '0/16');
  const password = h('input', { id: 'pw', name: 'password', type: 'password', autocomplete: 'off', placeholder: 'Mot de passe du village' });
  const pwField = h('label', { class: 'field', hidden: true }, h('span', { class: 'lbl' }, 'Mot de passe'), password);
  const msg = h('p', { class: 'form-msg', role: 'alert' });
  const picker = colorPicker({ selected: profile.color || null, taken: new Set(), onPick: () => { msg.textContent = ''; } });
  const roster = h('div', { class: 'roster' });
  const tableState = h('p', { class: 'table-state' }, 'Le village est silencieux…');
  const btn = h('button', { class: 'btn primary big', type: 'submit' }, icon('seal'), h('span', {}, 'S’asseoir à la table'));

  const syncCount = () => { count.textContent = `${pseudo.value.length}/${LIMITS.pseudoMax}`; };
  pseudo.addEventListener('input', () => { syncCount(); msg.textContent = ''; });
  syncCount();

  const form = h('form', { class: 'poster-form', novalidate: true, onsubmit: async (e) => {
    e.preventDefault();
    if (busy) return;
    const p = pseudo.value.normalize('NFC').trim().replace(/\s+/g, ' ');
    if (p.length < LIMITS.pseudoMin || p.length > LIMITS.pseudoMax || !PSEUDO_RE.test(p)) { msg.textContent = err('INVALID'); pseudo.focus(); return; }
    if (!picker.value) { msg.textContent = 'Choisis la couleur de ton cachet.'; return; }
    busy = true; btn.disabled = true; msg.textContent = '';
    const r = await join({ pseudo: p, color: picker.value }, password.value);
    busy = false; btn.disabled = false;
    if (!r.ok) {
      msg.textContent = err(r.code);
      if (r.code === 'COLOR_TAKEN') { picker.value = null; refresh(); }
      return;
    }
    store.set({ kicked: false });
  } },
    h('label', { class: 'field' }, h('span', { class: 'lbl' }, 'Pseudo', count), pseudo),
    h('div', { class: 'field' }, h('span', { class: 'lbl' }, 'Ta couleur'), picker.el),
    pwField, msg, btn,
  );

  const poster = h('main', { class: 'entry' },
    h('div', { class: 'hero' },
      h('h1', { class: 'display title' }, 'Loup-Garou'),
      h('p', { class: 'tagline' }, 'Une table, une nuit, des amis. L’un d’eux ment.'),
    ),
    h('section', { class: 'poster paper nailed' },
      h('h2', { class: 'poster-head display' }, 'Avis aux habitants'),
      h('p', { class: 'poster-sub' }, 'Prenez place autour du feu. La partie commence quand l’hôte le décide.'),
      form,
      h('div', { class: 'poster-foot' }, tableState, roster),
    ),
    h('footer', { class: 'entry-foot' },
      h('button', { class: 'link', onclick: openRules }, 'Les règles'),
      h('span', { 'aria-hidden': 'true' }, '·'),
      h('button', { class: 'link', onclick: openCredits }, 'Crédits'),
    ),
  );
  if (store.get().kicked) msg.textContent = 'L’hôte t’a chassé de la table.';
  root.appendChild(poster);

  async function refresh() {
    try {
      const r = await fetch('/status', { cache: 'no-store' });
      status = await r.json();
    } catch { return; }
    const taken = new Set(status.members.map((m) => m.color));
    picker.setTaken(taken);
    pwField.hidden = !status.passwordRequired;
    roster.replaceChildren(...status.members.map((m) => {
      const c = PALETTE.find((x) => x.id === m.color);
      return h('span', { class: `pip${m.spectator ? ' spec' : ''}`, style: { '--c': c?.hex || '#888' }, title: c?.name || '' });
    }));
    if (status.status === 'lobby') {
      tableState.textContent = status.players
        ? `${status.players} villageois attendent autour du feu.`
        : 'Le village est silencieux. Sois le premier à t’asseoir.';
    } else {
      tableState.textContent = `La nuit est tombée, une partie est en cours (${status.players} joueurs). Tu pourras l’observer.`;
    }
  }
  refresh();
  const iv = setInterval(refresh, 3000);
  return { destroy() { clearInterval(iv); poster.remove(); } };
}

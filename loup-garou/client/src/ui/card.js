import { ROLE_META } from '@shared/constants.js';
import { h, icon } from './dom.js';
import { flipCard } from '../fx/fx.js';

// Carte à jouer : dos (face cachée) et face (rôle). `flipped` = face visible.
export function roleCard(role, { flipped = false, interactive = false, small = false } = {}) {
  const m = ROLE_META[role] || { name: '???', icon: 'villager', desc: '', camp: 'village' };
  const front = h('div', { class: `card-face front camp-${m.camp}` },
    h('div', { class: 'card-frame' },
      h('div', { class: 'card-name display' }, m.name),
      h('div', { class: 'card-art' }, icon(m.icon)),
      h('div', { class: 'card-camp' }, m.camp === 'wolves' ? 'Camp des loups' : 'Camp du village'),
      h('p', { class: 'card-desc' }, m.desc),
    ),
  );
  const back = h('div', { class: 'card-face back' }, h('div', { class: 'card-frame' }, icon('moon', 'back-moon'), h('span', { class: 'display' }, 'Thiercelieux')));
  const card = h('div', { class: `card${small ? ' small' : ''}${flipped ? ' flipped' : ''}`, tabindex: interactive ? 0 : -1 },
    h('div', { class: 'card-inner' }, back, front));
  if (interactive) {
    const toggle = () => flipCard(card, !card.classList.contains('flipped'));
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  }
  return card;
}

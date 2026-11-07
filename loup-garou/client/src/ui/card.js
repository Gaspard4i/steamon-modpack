import { ROLE_META } from '@shared/constants.js';
import { h, icon } from './dom.js';
import { flipCard } from '../fx/fx.js';

// Carte à jouer au format portrait. Si /cards/<role>.webp existe, elle remplace l'icône.
function art(role, m) {
  const box = h('div', { class: 'card-art' }, icon(m.icon));
  const img = new Image();
  img.className = 'card-img';
  img.alt = '';
  img.decoding = 'async';
  img.onload = () => { box.classList.add('has-img'); };
  img.onerror = () => img.remove();
  img.src = `/cards/${role}.webp`;
  box.appendChild(img);
  return box;
}

export function roleCard(role, { flipped = false, interactive = false, small = false, medium = false } = {}) {
  const m = ROLE_META[role] || { name: '???', icon: 'villager', desc: '', camp: 'village' };
  const front = h('div', { class: `card-face front camp-${m.camp}` },
    h('div', { class: 'card-frame' },
      art(role, m),
      h('div', { class: 'card-banner' },
        h('div', { class: 'card-name display' }, m.name),
        h('div', { class: 'card-camp' }, m.camp === 'wolves' ? 'Les loups' : 'Le village'),
      ),
      h('p', { class: 'card-desc' }, m.desc),
    ),
  );
  const back = h('div', { class: 'card-face back' },
    h('div', { class: 'card-frame' },
      icon('moon', 'back-moon'),
      h('span', { class: 'display back-title' }, 'Thiercelieux'),
      icon('werewolf', 'back-wolf'),
    ));
  const card = h('div', {
    class: `card${small ? ' small' : ''}${medium ? ' medium' : ''}${flipped ? ' flipped' : ''}`,
    tabindex: interactive ? 0 : -1,
    role: interactive ? 'button' : null,
    'aria-label': interactive ? 'Retourner la carte' : null,
  }, h('div', { class: 'card-inner' }, back, front));
  if (interactive) {
    const toggle = () => flipCard(card, !card.classList.contains('flipped'));
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  }
  return card;
}

import { PALETTE } from '@shared/constants.js';
import { h, icon } from './dom.js';

// Palette de cachets de cire. `taken` = Set d'ids déjà pris (grisés, barrés).
export function colorPicker({ selected = null, taken = new Set(), onPick }) {
  const root = h('div', { class: 'seals', role: 'radiogroup', 'aria-label': 'Couleur' });
  const btns = new Map();
  let current = selected;
  for (const c of PALETTE) {
    const b = h('button', {
      type: 'button', class: 'seal', role: 'radio', title: c.name, 'aria-label': c.name,
      style: { '--c': c.hex },
      onclick: () => { if (b.disabled) return; current = c.id; sync(); onPick?.(c.id); },
    }, h('span', { class: 'seal-face' }, icon('seal', 'seal-ico')));
    btns.set(c.id, b);
    root.appendChild(b);
  }
  function sync() {
    for (const [id, b] of btns) {
      const isTaken = taken.has(id) && id !== selected;
      b.disabled = isTaken;
      b.classList.toggle('taken', isTaken);
      b.classList.toggle('on', id === current);
      b.setAttribute('aria-checked', id === current ? 'true' : 'false');
    }
  }
  sync();
  return {
    el: root,
    get value() { return current; },
    set value(v) { current = v; sync(); },
    setTaken(t) { taken = t; if (current && taken.has(current) && current !== selected) current = null; sync(); },
  };
}

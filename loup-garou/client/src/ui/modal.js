import { h } from './dom.js';

export function openModal({ title, body, onClose, wide = false }) {
  const root = document.getElementById('modal-root');
  const close = () => { back.remove(); document.removeEventListener('keydown', onKey); onClose?.(); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  const back = h('div', { class: 'modal-back', onclick: (e) => { if (e.target === back) close(); } },
    h('div', { class: `modal paper${wide ? ' wide' : ''}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      h('header', {}, h('h2', { class: 'display' }, title), h('button', { class: 'x', 'aria-label': 'Fermer', onclick: close }, 'Fermer')),
      h('div', { class: 'modal-body' }, body),
    ),
  );
  document.addEventListener('keydown', onKey);
  root.appendChild(back);
  return close;
}

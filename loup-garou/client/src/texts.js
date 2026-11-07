import { ROLE_META } from '@shared/constants.js';

export const ERRORS = {
  PSEUDO_TAKEN: 'Un autre villageois porte déjà ce nom.',
  COLOR_TAKEN: 'Cette couleur vient d’être prise. Choisis-en une autre.',
  BAD_PASSWORD: 'Le mot de passe du village est incorrect.',
  TABLE_FULL: 'La table est pleine, il n’y a plus de place.',
  INVALID: 'Ce choix n’est pas valide. Vérifie ton pseudo (2 à 16 caractères, sans symboles).',
  RATE_LIMIT: 'Doucement, tu vas trop vite. Réessaie dans un instant.',
  NOT_ALLOWED: 'Tu ne peux pas faire cela.',
  WRONG_PHASE: 'Ce n’est pas le moment.',
  BAD_TARGET: 'Cette cible n’est pas valable.',
  NOT_ENOUGH_PLAYERS: 'Il faut au moins 4 joueurs pour lancer la partie.',
  DEAD: 'Tu es mort, les morts ne votent plus.',
  NOT_JOINED: 'Tu n’es pas assis à la table.',
  SERVER_ERROR: 'Le village a trébuché. Réessaie.',
  BAD_COLOR: 'Couleur inconnue.',
};
export const err = (code) => ERRORS[code] || 'Quelque chose a mal tourné.';

export const roleName = (r) => ROLE_META[r]?.name ?? '???';

export function phaseTitle(st) {
  const { name, round } = st.phase;
  switch (name) {
    case 'lobby': return 'Autour du feu';
    case 'deal': return 'La distribution';
    case 'night': return `Nuit ${round}`;
    case 'mayor': return 'Élection du maire';
    case 'day': return `Jour ${round}`;
    case 'vote': return `Jour ${round} · le vote`;
    case 'hunter': return 'Le dernier souffle';
    case 'end': return 'Fin de partie';
    default: return '';
  }
}

export const SLEEP_LINES = [
  'Tu dors. Quelque part, une porte grince.',
  'Les yeux fermés, tu écoutes la forêt respirer.',
  'Le village retient son souffle. Ne bouge pas.',
  'Un hurlement, très loin. Tu fais semblant de ne pas l’entendre.',
];

export const CAUSE = {
  wolves: 'dévoré', poison: 'empoisonné', lynch: 'pendu', hunter: 'abattu', amour: 'mort d’amour', exil: 'exilé',
};

export const WINNER = {
  village: { title: 'Le village a gagné', sub: 'La dernière bête est tombée. Thiercelieux peut dormir.' },
  wolves: { title: 'Les loups ont gagné', sub: 'Il ne reste plus assez d’humains pour leur résister.' },
  lovers: { title: 'Les amoureux ont gagné', sub: 'Contre tous, leur histoire continue.' },
  none: { title: 'Plus personne', sub: 'Thiercelieux n’est plus qu’un nom sur une pierre.' },
};

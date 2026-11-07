// Constantes partagées client + serveur. Aucune dépendance réseau ni DOM.

// 18 couleurs de pigments / encres anciennes, une par place.
export const PALETTE = [
  { id: 'garance',   name: 'Rouge garance',   hex: '#b3342b' },
  { id: 'ocre',      name: 'Ocre jaune',      hex: '#d4a02f' },
  { id: 'vertdegris',name: 'Vert-de-gris',    hex: '#5f9e8f' },
  { id: 'outremer',  name: 'Bleu outremer',   hex: '#3a56a8' },
  { id: 'sepia',     name: 'Brun sépia',      hex: '#8a5a3b' },
  { id: 'rosevieux', name: 'Rose vieux',      hex: '#c98a8f' },
  { id: 'mousse',    name: 'Vert mousse',     hex: '#6f8a3c' },
  { id: 'brule',     name: 'Orange brûlé',    hex: '#c9622a' },
  { id: 'ardoise',   name: 'Gris ardoise',    hex: '#8793a0' },
  { id: 'prune',     name: 'Violet prune',    hex: '#8a4f8c' },
  { id: 'turquoise', name: 'Turquoise pâle',  hex: '#79c1c4' },
  { id: 'cuivre',    name: 'Cuivre',          hex: '#b9733f' },
  { id: 'bordeaux',  name: 'Bordeaux',        hex: '#7d2236' },
  { id: 'olive',     name: 'Olive',           hex: '#8f8d3a' },
  { id: 'indigo',    name: 'Indigo',          hex: '#5c4fa0' },
  { id: 'sable',     name: 'Sable',           hex: '#d9c28f' },
  { id: 'liedevin',  name: 'Lie-de-vin',      hex: '#a24a5e' },
  { id: 'petrole',   name: 'Bleu pétrole',    hex: '#2f7c8c' },
];

export const LIMITS = {
  minPlayers: 4,
  maxMembers: 18, // joueurs + spectateurs (une couleur chacun)
  pseudoMin: 2,
  pseudoMax: 16,
  chatMax: 280,
};

export const PHASE = {
  LOBBY: 'lobby',
  DEAL: 'deal',
  NIGHT: 'night',
  MAYOR: 'mayor',
  DAY: 'day',
  VOTE: 'vote',
  HUNTER: 'hunter',
  END: 'end',
};

export const CAMP = { VILLAGE: 'village', WOLVES: 'wolves', LOVERS: 'lovers' };

// Métadonnées d'affichage des rôles (le comportement est dans server/core/roles.js).
export const ROLE_META = {
  werewolf: {
    name: 'Loup-Garou', camp: 'wolves', icon: 'werewolf',
    desc: 'Chaque nuit, les loups dévorent un villageois. Le jour, ils mentent pour ne pas être démasqués.',
    tip: 'La nuit, tu te réveilles avec les autres loups et vous choisissez une victime ensemble. Le jour, fais comme si de rien n’était.',
  },
  villager: {
    name: 'Villageois', camp: 'village', icon: 'villager',
    desc: 'Aucun pouvoir, sinon sa voix. Il doit trouver les loups avant qu’il ne soit trop tard.',
    tip: 'Tu dors la nuit. Le jour, écoute, débats et vote pour pendre un loup.',
  },
  seer: {
    name: 'Voyante', camp: 'village', icon: 'seer',
    desc: 'Chaque nuit, elle découvre la vraie carte d’un habitant.',
    tip: 'Chaque nuit, tu désignes un joueur et tu vois sa carte. Garde le secret, mais guide le village sans te faire repérer.',
  },
  witch: {
    name: 'Sorcière', camp: 'village', icon: 'witch',
    desc: 'Une potion de vie, une potion de mort. Une seule fois chacune.',
    tip: 'Tu apprends qui les loups ont choisi. Tu peux le sauver, ou tuer quelqu’un. Une seule potion par nuit, chacune une seule fois dans la partie.',
  },
  hunter: {
    name: 'Chasseur', camp: 'village', icon: 'hunter',
    desc: 'En mourant, il emporte quelqu’un avec lui.',
    tip: 'Si tu meurs, de n’importe quelle façon, tu désignes aussitôt un joueur qui meurt avec toi.',
  },
  cupid: {
    name: 'Cupidon', camp: 'village', icon: 'cupid',
    desc: 'La première nuit, il lie deux habitants par l’amour.',
    tip: 'La première nuit, tu désignes deux amoureux (tu peux en faire partie). Si l’un meurt, l’autre meurt de chagrin.',
  },
  littlegirl: {
    name: 'Petite Fille', camp: 'village', icon: 'littlegirl',
    desc: 'La nuit, elle peut épier les loups, au risque d’être surprise.',
    tip: 'Pendant le tour des loups, tu peux les épier. Si tu es repérée, ils te dévorent à la place de leur victime.',
  },
  thief: {
    name: 'Voleur', camp: 'village', icon: 'thief',
    desc: 'La première nuit, il peut échanger sa carte contre l’une des deux cartes laissées de côté.',
    tip: 'La première nuit, tu vois deux cartes mises de côté. Tu peux en prendre une à la place de la tienne, ou garder ta carte.',
  },
};

// Ordre de préférence quand il faut couper des rôles (premier = gardé en dernier).
export const SPECIAL_ROLES = ['seer', 'witch', 'hunter', 'cupid', 'littlegirl', 'thief'];

export const DEFAULT_SETTINGS = {
  roles: { seer: true, witch: true, hunter: true, cupid: false, littlegirl: false, thief: false },
  wolves: 0, // 0 = automatique
  mayor: true,
  dealSeconds: 14,
  nightSeconds: 25,
  discussionSeconds: 120,
  voteSeconds: 45,
};

export const SETTING_BOUNDS = {
  dealSeconds: [8, 40],
  nightSeconds: [12, 90],
  discussionSeconds: [20, 600],
  voteSeconds: [15, 180],
};

export function autoWolves(n) {
  return Math.max(1, Math.round(n / 4));
}

// Normalisation pour comparer les pseudos (casse + accents).
export function normPseudo(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');
}

export const PSEUDO_RE = /^[\p{L}\p{N}][\p{L}\p{N} '’\-]*$/u;

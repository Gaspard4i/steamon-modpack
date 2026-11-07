import { ROLE_META } from '@shared/constants.js';
import { h, icon } from './dom.js';
import { openModal } from './modal.js';
import { roleCard } from './card.js';

// Contenu des règles, partagé entre la fenêtre (accueil) et l'onglet "Règles" de la partie.
export function rulesNodes() {
  const roles = Object.entries(ROLE_META).map(([id, m]) =>
    h('li', { class: 'rule-role' },
      roleCard(id, { flipped: true, small: true }),
      h('div', {},
        h('strong', {}, m.name),
        h('p', {}, m.desc),
        h('p', { class: 'tip' }, m.tip))));
  return [
    h('p', {}, 'Thiercelieux est hanté. Parmi les habitants se cachent des loups-garous. Le village doit les démasquer avant d’être dévoré. Les loups veulent manger tout le monde.'),
    h('h3', {}, 'Déroulement'),
    h('p', {}, h('strong', {}, 'La nuit. '), 'Tout le monde ferme les yeux. Les rôles se réveillent un par un : Voleur, Cupidon, Voyante, Loups, Sorcière. À l’écran, tu vois quand c’est ton tour. Les autres dorment.'),
    h('p', {}, h('strong', {}, 'Le jour. '), 'Le village découvre qui est mort et sa carte est révélée. On débat, puis on vote. Le joueur qui reçoit le plus de voix est pendu. En cas d’égalité, personne n’est pendu.'),
    h('h3', {}, 'Le maire'),
    h('p', {}, 'Le premier jour, le village élit un maire. Sa voix compte double pendant les votes. S’il meurt, la mairie reste vacante.'),
    h('h3', {}, 'Victoire'),
    h('ul', {},
      h('li', {}, 'Le village gagne quand tous les loups sont morts.'),
      h('li', {}, 'Les loups gagnent quand ils sont au moins aussi nombreux que les autres.'),
      h('li', {}, 'Deux amoureux de camps opposés gagnent seuls s’ils sont les derniers en vie.')),
    h('h3', {}, 'Le narrateur'),
    h('p', {}, 'L’hôte peut désigner un joueur comme narrateur. Il ne joue pas : il n’a pas de carte. Il voit seulement la liste des rôles à appeler dans l’ordre de la nuit, et il fait avancer la partie (étape suivante, fin de la discussion, ouverture et clôture du vote). Les joueurs votent eux-mêmes, et les votes sont comptés automatiquement. Sans narrateur, c’est le jeu qui rythme la partie avec des minuteurs.'),
    h('h3', {}, 'Le chat'),
    h('p', {}, 'Le jour, le village discute à voix haute ou par écrit. La nuit, seuls les loups peuvent s’écrire entre eux. Les morts ont leur propre salon et voient toutes les cartes, mais ne doivent rien révéler aux vivants.'),
    h('h3', {}, 'Les cartes'),
    h('p', { class: 'hint' }, 'Dans la partie, touche ta carte pour la retourner et relire ce que tu dois faire.'),
    h('ul', { class: 'rule-roles' }, roles),
  ];
}

export function openRules() {
  openModal({ title: 'Les règles', wide: true, body: h('div', { class: 'prose' }, rulesNodes()) });
}

const CREDITS = {
  lorc: ['Loup (wolf-head)', 'Voyante (third-eye)', 'Sorcière (potion-ball)', 'Cupidon (cupidon-arrow)', 'Chasseur (arrow-cluster)', 'Petite Fille (hood)', 'Lune (moon-claws)', 'Crâne (skull-crossed-bones)', 'Couronne (crown)', 'Fiole de vie (heart-bottle)', 'Fiole de mort (poison-bottle)', 'Hurlement (wolf-howl)', 'Feu de camp (campfire)', 'Sapin (pine-tree)', 'Corbeau (raven)', 'Soleil (sun)', 'Dague (plain-dagger)', 'Sablier (hourglass)', 'Parchemin (scroll-unfurled)', 'Marteau (hammer-drop)'],
  delapouite: ['Voleur (robber)', 'Villageois (pitchfork)', 'Coq (rooster)', 'Aube (sunrise)', 'Bulle (chat-bubble)', 'Tombe (graveyard)', 'Tampon (stamper)', 'Chauve-souris (bat)'],
};

export function openCredits() {
  const li = (a) => a.map((t) => h('li', {}, t));
  openModal({
    title: 'Crédits',
    wide: true,
    body: h('div', { class: 'prose' },
      h('p', {}, 'Aucune illustration de ce site n’a été dessinée pour l’occasion. Toutes viennent de bibliothèques libres de droit.'),
      h('h3', {}, 'Icônes (game-icons.net, CC BY 3.0)'),
      h('p', {}, h('a', { href: 'https://game-icons.net', target: '_blank', rel: 'noopener' }, 'game-icons.net'),
        ', licence ', h('a', { href: 'https://creativecommons.org/licenses/by/3.0/', target: '_blank', rel: 'noopener' }, 'CC BY 3.0'), '. Couleurs modifiées par CSS.'),
      h('h4', {}, 'Par Lorc'), h('ul', { class: 'cols' }, li(CREDITS.lorc)),
      h('h4', {}, 'Par Delapouite'), h('ul', { class: 'cols' }, li(CREDITS.delapouite)),
      h('h3', {}, 'Polices (SIL Open Font License 1.1)'),
      h('ul', {},
        h('li', {}, 'Pirata One, Rodrigo Fuenzalida'),
        h('li', {}, 'IM Fell English, Igino Marini'),
        h('li', {}, 'Spectral, Production Type')),
      h('h3', {}, 'Code'),
      h('ul', {}, h('li', {}, 'Socket.IO (MIT)'), h('li', {}, 'GSAP (licence standard gratuite)'), h('li', {}, 'Vite (MIT)'), h('li', {}, 'Express, Zod, Helmet, Pino (MIT)')),
      h('p', {}, 'Jeu original : Les Loups-Garous de Thiercelieux, de Philippe des Pallières et Hervé Marly. Ce site est un projet de fans, non commercial.'),
    ),
  });
}

export { icon };

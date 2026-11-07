// Banque de phrases du narrateur. Écrites pour l'ambiance : village de Thiercelieux, conte macabre.

const BANK = {
  deal: [
    'Les cartes sont distribuées. Regardez la vôtre, et gardez le secret.',
    'Chacun reçoit un destin face cachée. Ne le montrez à personne.',
    'Le feu crépite. Les cartes passent de main en main. Une seule dit la vérité sur vous.',
  ],
  nightFall: [
    'La nuit tombe sur Thiercelieux. Le village s’endort…',
    'Les volets se ferment un à un. Dans la forêt, quelque chose s’éveille.',
    'Le dernier cierge s’éteint. Le village s’endort, la lune est haute.',
  ],
  thief: ['Le Voleur ouvre les yeux. Deux cartes dorment sur la table…'],
  cupid: ['Cupidon ouvre les yeux et décoche sa flèche. Deux cœurs ne feront plus qu’un.'],
  seer: ['La Voyante ouvre les yeux. Qui sera l’objet de sa vision ?'],
  wolves: ['Les Loups-Garous ouvrent les yeux. Ils choisissent leur festin.'],
  witch: ['La Sorcière ouvre les yeux. Une fiole pour guérir, une fiole pour tuer.'],
  dawnPeace: [
    'Le coq chante. Tout le village s’éveille… et personne ne manque à l’appel.',
    'L’aube se lève sur un village soulagé : cette nuit, nul n’a été emporté.',
  ],
  dawnDeath: [
    'Le coq chante. Le village s’éveille dans un silence lourd.',
    'L’aube se lève, grise. Quelqu’un ne répondra plus jamais à l’appel.',
  ],
  mayor: ['Le village se rassemble sur la place pour élire son maire.'],
  discussion: [
    'Chacun a la parole. Accusez, défendez-vous, mentez si vous l’osez.',
    'Les regards se croisent. Quelqu’un ici ment. Qui ?',
  ],
  vote: [
    'Le temps des paroles est fini. Le village doit désigner un coupable.',
    'À vos cachets. Qui sera pendu à l’aube ?',
  ],
  tie: ['Les voix se partagent à égalité. Le village hésite, et personne n’est pendu.'],
  noVote: ['Personne n’a osé désigner de coupable. Le village se rendort, inquiet.'],
  hunter: ['Le Chasseur agonise, mais son doigt serre encore la gâchette…'],
  winVillage: ['La dernière bête est tombée. Le village peut enfin dormir en paix.'],
  winWolves: ['Il ne reste plus assez d’humains pour résister. Les loups règnent sur Thiercelieux.'],
  winLovers: ['Contre tous, deux amoureux survivent. Que leur histoire soit sans fin.'],
  winNone: ['Plus personne. Thiercelieux n’est plus qu’un nom sur une pierre.'],
};

export function say(key, rng = Math.random) {
  const list = BANK[key] || [''];
  return list[Math.floor(rng() * list.length)];
}

// Registre des rôles (pattern Strategy). Ajouter un rôle = ajouter une entrée ici.
// Chaque rôle à action nocturne déclare : step, nightOrder, firstNightOnly,
// actors(game), done(game), duration(game), prompt(game, p).
// Le moteur ne contient aucun `switch(role)`.

const alive = (game) => game.alivePlayers();
const withRole = (game, role) => alive(game).filter((p) => p.role === role);

export const ROLES = {
  villager: { id: 'villager', camp: 'village' },

  werewolf: {
    id: 'werewolf',
    camp: 'wolves',
    step: 'wolves',
    nightOrder: 30,
    actors: (g) => withRole(g, 'werewolf'),
    done: (g) => g.s.night.acted.wolves === true,
    duration: (g) => Math.round(g.s.settings.nightSeconds * 1.5),
    prompt: (g, p) => {
      const votes = {};
      for (const w of withRole(g, 'werewolf')) votes[w.id] = g.s.night.wolfVotes[w.id] ?? null;
      return {
        kind: 'wolf_vote',
        targets: alive(g).filter((x) => x.role !== 'werewolf').map((x) => x.id),
        votes,
        voted: g.s.night.wolfVotes[p.id] !== undefined,
      };
    },
  },

  seer: {
    id: 'seer',
    camp: 'village',
    step: 'seer',
    nightOrder: 20,
    actors: (g) => withRole(g, 'seer'),
    done: (g) => withRole(g, 'seer').every((p) => g.s.night.acted[p.id]),
    duration: (g) => g.s.settings.nightSeconds,
    prompt: (g, p) => ({
      kind: 'seer_look',
      targets: alive(g).filter((x) => x.id !== p.id).map((x) => x.id),
      done: !!g.s.night.acted[p.id],
    }),
  },

  witch: {
    id: 'witch',
    camp: 'village',
    step: 'witch',
    nightOrder: 40,
    actors: (g) => withRole(g, 'witch'),
    done: (g) => withRole(g, 'witch').every((p) => g.s.night.acted[p.id]),
    duration: (g) => Math.round(g.s.settings.nightSeconds * 1.2),
    prompt: (g, p) => ({
      kind: 'witch',
      victimId: g.s.night.victimId,
      canSave: !p.flags.lifeUsed && !!g.s.night.victimId && !g.s.night.saved,
      canPoison: !p.flags.deathUsed,
      targets: alive(g).filter((x) => x.id !== p.id).map((x) => x.id),
      done: !!g.s.night.acted[p.id],
    }),
  },

  hunter: { id: 'hunter', camp: 'village' },

  cupid: {
    id: 'cupid',
    camp: 'village',
    step: 'cupid',
    nightOrder: 10,
    firstNightOnly: true,
    actors: (g) => withRole(g, 'cupid'),
    done: (g) => withRole(g, 'cupid').every((p) => g.s.night.acted[p.id]),
    duration: (g) => g.s.settings.nightSeconds,
    prompt: (g, p) => ({
      kind: 'cupid_link',
      targets: alive(g).map((x) => x.id),
      done: !!g.s.night.acted[p.id],
    }),
  },

  thief: {
    id: 'thief',
    camp: 'village',
    step: 'thief',
    nightOrder: 5,
    firstNightOnly: true,
    actors: (g) => withRole(g, 'thief'),
    done: (g) => withRole(g, 'thief').every((p) => g.s.night.acted[p.id]),
    duration: (g) => g.s.settings.nightSeconds,
    prompt: (g, p) => ({
      kind: 'thief_pick',
      options: g.s.extras.slice(),
      done: !!g.s.night.acted[p.id],
    }),
  },

  // Petite Fille : agit pendant l'étape des loups (action 'spy'), voir game.js.
  littlegirl: { id: 'littlegirl', camp: 'village' },
};

export const campOf = (role) => ROLES[role]?.camp ?? 'village';

// Étapes de nuit, triées, pour l'ensemble des rôles présents dans la partie.
export function nightStepsFor(activeRoles, round) {
  return Object.values(ROLES)
    .filter((r) => r.step && activeRoles.includes(r.id) && !(r.firstNightOnly && round > 1))
    .sort((a, b) => a.nightOrder - b.nightOrder);
}

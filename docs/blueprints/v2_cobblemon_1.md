# Blueprint V2 - cobblemon_1 (Trainer's First Steps)

Vague 2 de la refonte des quetes FTB Steamon. Groupe **Cobblemon** `2A4A6BF9FB018712`.
Ce document est un BLUEPRINT pret-a-ecrire : il fixe la structure (quetes, ids, shapes, positions, taches exactes, deps, idees de reward, cles lang). Il ne contient ni SNBT final ni textes joueur.

- SNBT final = quest-config-writer (traduit ce blueprint + les textes).
- Textes joueur (title/subtitle/desc) = quest-writer (remplit les cles lang de la section finale).
- Chaque item / task / recette liste provient de la MATIERE DE RECHERCHE verrouillee par l'orchestrator (confirmee runtime via mc-knowledge / RCON). quest-config-writer re-verifie chaque item via `/give` et chaque recette via JEI avant d'ecrire.

Regles appliquees : registre anti-repetition (master plan section 3.2 = frontiere COBBLEMON stricte), non-blocage du tronc (section 4), archetype A3 (tronc court + eventail), shapes semantiques (`pentagon` = Cobblemon), FORMAT B pour les reward tables. Jamais de tiret cadratin.

Convention couleur (annexe A reference, rappel pour quest-writer) : Pokemon `&c`, PC/bleu `&9`, friendship/evolution/breeding `&d`, items `&e`, dimensions couleur dediee, tips `&f&lTip:&r`. Le mot "Pokemon" toujours en `&c`.

---

## Convention d'IDs de ce blueprint

Tous les ids ci-dessous sont des hex 16 UNIQUES. Le config-writer les reprend tels quels.

**ID CANONIQUE IMPOSE (contrainte absolue de l'orchestrator)** : la racine du chapitre (quete C-ROOT, `select_starter`) porte l'id **`4EFD1A480A12986D`**. Cet id est deja reference par le `quest_link` PORTE COBBLEMON du tronc overworld (V1, `3A02A19D4EF0E25E` -> linked_quest `4EFD1A480A12986D`). NE PAS le changer. Tous les autres ids sont neufs et uniques.

Palette de shapes utilisee ici (convention Steamon section 7) :
- `pentagon` size 2.5 = racine de chapitre Cobblemon + jalon de convergence final (forme dediee Pokemon, surdimensionnee).
- `pentagon` size 1.5-2.0 = jalon Pokemon MAJEUR du tronc (catch, healing_machine, pc, pasture).
- `octagon` = "trouve une source / un bloc naturel" (apricorn tree, safepastures).
- `rsquare` = jalon a reward table (trio de balls termine, HUD apps termine).
- `hexagon` size 1.1 = craft de machine Cobblemon secondaire (le tronc utilise pentagon ; hexagon reste pour un sous-node de branche).
- `heart` = item affectif (pet-your-cobblemon).
- `diamond` size 1.0 = tip lateral optionnel (une ball speciale, une app HUD, un tip mount).
- `circle` = convergence / node checkmark / tip meta / cible de quest_link.
- `square` size 0.9 = craft / obtention terminale d'une sous-branche.
- `none` + invisible = node fantome connecteur (si le config-writer en a besoin pour ancrer la convergence sans spaghetti).

---

## 1. Metadonnees chapitre

| Champ | Valeur |
|---|---|
| filename | `cobblemon_1.snbt` |
| id chapitre | `44802B3EA281E38A` |
| group | `2A4A6BF9FB018712` (Cobblemon) |
| order_index | `0` (premier chapitre du groupe Cobblemon) |
| title in-game (cle lang) | `&cTrainer's First Steps` |
| icon | `cobblemon:poke_ball` |
| default_quest_shape | `pentagon` (identite Cobblemon ; les branches surchargent avec diamond/octagon/etc.) |
| default_hide_dependency_lines | `false` (le tronc court DOIT montrer ses lignes : le joueur suit starter -> catch -> heal -> pc -> pasture ; on cache localement les traits sur le SEUL node de convergence finale via `hide_dependency_lines:true`) |
| progression_mode | herite global `flexible` (les deps du tronc imposent deja l'ordre ; le flexible autorise de piocher librement dans l'eventail post-tronc) |

Intention du chapitre : le premier pas de dresseur. Une racine surdimensionnee (choisir son starter, arrive tot dans la Journey via la PORTE COBBLEMON d'overworld), un tronc court et 100% deterministe (attraper 1 Pokemon -> healing machine -> PC -> pasture), puis un large eventail post-tronc qui enseigne TOUT le reste des bases du dresseur (l'echelle des balls significatives, les balls speciales, la friendship, les Ride mounts, les apps HUD, le pet affectif, le pasture securise), qui reconverge sur un jalon final "Trainer Ready". ~6 obligatoire / ~26 optionnel. 33 quetes au total (cible 30-36 respectee).

Frontiere stricte (registre 3.2) : ce chapitre possede starter, catch, PC/healing/pasture (usage), les balls SIGNIFICATIVES (poke/great/ultra + 3 speciales, PAS la collection des 29), friendship, journey-mounts, HUD apps. Il NE traite PAS : la grille des 18 types (= cobblemon_2), breeding/EV/IV/TMs (= cobblemon_3), berries brutes (= berries), pierres d'evolution/mega (= evolution_items), held items competitifs (= pvp_items), et surtout la FABRICATION des balls via Create klinks-n-klangs (= create_3). Le smartphone est un TIP renvoyant a create_3 (sa recette vanilla est desactivee, Create-only).

---

## 2. Topologie visuelle (grille planifiee AVANT coordonnees)

Axe vertical descendant = progression (y croissant vers le bas), comme le tronc overworld V1. Le tronc central est en x=0. Les branches optionnelles rayonnent a gauche (x negatif) et a droite (x positif), equilibrees.

```
                                   C-ROOT (0,0) pentagon 2.5  [select_starter]
                                      |  (ligne visible)
                                   C-CATCH (0,3) pentagon 2.0  [catch amount:1]
                                      |
                                   C-HEAL (0,6) pentagon 1.8  [craft healing_machine]
                                      |
                                   C-PC (0,9) pentagon 1.8   [craft pc]
                                      |
                                   C-PAST (0,12) pentagon 1.8 [craft pasture]  (PC avant pasture: pasture consomme un pc)
                                      |
     ...........................  eventail post-tronc (accroche a C-CATCH et C-PAST) ...........................

   BRANCHE BALLS (droite, accrochee a C-CATCH via C-APRI)
      C-APRI (3,3) octagon        [item apricorn : source naturelle]
        |-> C-POKE (5,1.5)        [craft poke_ball]
        |-> C-GREAT (6.5,3)       [craft great_ball]
        |-> C-ULTRA (5,4.5)       [craft ultra_ball]   -> converge sur C-BALLKIT (7,6) rsquare (trio termine, reward table)
      Balls speciales (optional, accrochees a C-BALLKIT) :
        C-HEALB (8.5,4.5) diamond [craft heal_ball]
        C-NETB  (9.5,6)   diamond [craft net_ball]
        C-QUICKB(8.5,7.5) diamond [craft quick_ball]
        C-DUSKB (10.5,4.5) diamond[craft dusk_ball]
        C-TIMERB(10.5,7.5) diamond[craft timer_ball]

   BRANCHE HUD/APPS (droite basse, accrochee a C-CATCH)
      C-POKENAV (3.5,6) diamond   [craft cobblenav:pokenav_item_base]
      C-CATCHIND (3.5,7.5) diamond[HUD catch-indicator : checkmark]
      C-SPAWNAL (3.5,9) diamond   [HUD spawn-alerts : checkmark]
      C-COUNTER (3.5,10.5) diamond[HUD counter : checkmark]  -> converge sur C-APPKIT (5.5,9) rsquare (apps HUD, reward)
      C-PHONE (5.5,10.5) circle   [TIP smartphone -> quest_link create_3]

   BRANCHE FRIENDSHIP + MOUNTS + PET (gauche proche, accrochee a C-CATCH / C-HEAL / C-PAST)
      C-PET (-3,4.5) heart 1.0       [pet-your-cobblemon : interaction affective]
      C-FRIEND (-3.5,6) pentagon 1.5 [friendship : soothe_bell ; jalon Pokemon majeur]
      C-MOUNT (-3.5,9) pentagon 1.5  [Ride mount : shift+clic droit sur un Pokemon rideable]
      C-SAFEPAST (-3.5,12) octagon   [safepastures : pature securisee, accrochee a C-PAST]

   BRANCHE TIPS PREMIERE PARTIE (gauche eloignee, accrochee a C-CATCH)
      C-WILDBATTLE (-5.5,3) pentagon 1.2 [tip combat sauvage]
      C-TEAM (-5.5,4.5) diamond          [tip gestion d'equipe]
      C-NICKNAME (-5.5,6) diamond        [tip renommer]

   CONVERGENCE FINALE
      C-READY (0,15.5) pentagon 2.5  [checkmark "Trainer Ready"]
        deps = min_required_dependencies parmi {C-PAST, C-BALLKIT, C-FRIEND, C-MOUNT, C-APPKIT}
        hide_dependency_lines: true (evite le spaghetti des 5 branches)
```

Espacement : vertical 3 sur le tronc (les pentagon 2.0 ont besoin de marge), 1.5 dans les colonnes de branches. Horizontal : tronc x=0, premieres branches a x=+/-3 a 3.5, sous-branches jusqu'a x=+/-9.5. 0 overlap (le validator verifie ; les centres sont espaces >= 1.5, les gros nodes >= 2.5). Lignes visibles sur le tronc, cachees sur la convergence finale.

Symetrie : cote droit = obtention/technique (balls, apps HUD) ; cote gauche = relation/vie (friendship, pet, mount, safepasture). Le tronc central reste l'ossature deterministe.

---

## 3. Liste des quetes

Notation par entree : id, role, shape+size, position (x,y), task exacte, dependencies (par id), optional, idee reward (tier/type, PAS l'item exact - regle reward != objectif).

Rappel task type natif Cobblemon : `cobblemon_tasks:cobblemon_task` avec champs `action`, `amount` (suffixe `NL` = long), `pokemon`, `pokemon_type`, `poke_ball_used`, `shiny`, etc. Utilise pour tout objectif Cobblemon comportemental (starter/catch/mount). Les crafts d'items (machines, balls, apps) restent des tasks `type:"item"` classiques (obtenir/detenir l'item). Les features HUD passives (catch-indicator, spawn-alerts, counter) sont des `type:"checkmark"` (auto-valide, tip) car ce sont des toggles d'affichage sans item ni action detectable garantie.

### C-ROOT - Racine "Choose Your Starter" (TRONC, RACINE)
- id : **`4EFD1A480A12986D`** (IMPOSE, cible du quest_link overworld)
- role : racine du chapitre, entree du tronc Cobblemon. Cible de la PORTE COBBLEMON (overworld quest_link `3A02A19D4EF0E25E`).
- shape : `pentagon`, size `2.5` (surdimensionnee, identite Cobblemon)
- position : `x: 0.0d, y: 0.0d`
- icon : `cobblemon:poke_ball`
- task : `cobblemon_tasks:cobblemon_task`, `action: "select_starter"` (confirme runtime). Pas d'amount (une selection suffit).
- dependencies : aucune (racine ; le lien avec overworld est un quest_link cote overworld, pas une dep dure ici).
- optional : `false`.
- reward : leger mais accueillant. `type:"item"` `cobblemon:poke_ball` x5 (le kit de depart pour commencer a capturer) + `type:"xp" xp:50`. NB reward != objectif : l'objectif est de CHOISIR un starter (pas d'obtenir une ball), donc des balls en reward sont valides et utiles.
- intention desc : accroche (le premier compagnon, le vrai debut de l'aventure de dresseur) ; tip (utilise le PokeDex / le mecanisme de selection de starter du pack pour choisir ton premier `&c`Pokemon`&r` ; c'est un choix, prends celui qui te parle) ; but (poser le point de depart de tout le parcours Cobblemon).

### C-CATCH - "Gotta Catch One" (TRONC : premiere capture)
- id : `A940F2657D23B520`
- role : maillon 2 du tronc. Premiere capture reelle.
- shape : `pentagon`, size `2.0`
- position : `x: 0.0d, y: 3.0d`
- icon : `cobblemon:poke_ball` (ou `cobblemon:great_ball` pour varier ; recommande poke_ball)
- task : `cobblemon_tasks:cobblemon_task`, `action: "catch"`, `amount: 1L` (confirme runtime). Pas de `pokemon`/`pokemon_type` (n'importe lequel : on ne touche pas la grille des types = cobblemon_2).
- dependencies : `["4EFD1A480A12986D"]`
- optional : `false`.
- reward : `type:"item"` `cobblemon:great_ball` x3 (tier au-dessus de la poke_ball = incitation, pattern echelle des balls) + `type:"xp" xp:50`.
- intention desc : accroche (ton premier Pokemon sauvage attrape a la main) ; tip (affaiblis un Pokemon sauvage en combat puis lance une `&c`Poke Ball`&r` ; plus ses PV sont bas, meilleures les chances ; le HUD de capture t'aide a viser) ; but (maitriser la boucle fondamentale du jeu).

### C-HEAL - "Field Medic" (TRONC : healing machine)
- id : `6ECCC8EB97DFBFAB`
- role : maillon 3 du tronc. Soigner son equipe.
- shape : `pentagon`, size `1.8`
- position : `x: 0.0d, y: 6.0d`
- icon : `cobblemon:healing_machine`
- task : `type:"item"`, item `cobblemon:healing_machine` count 1 (le joueur craft/detient la machine). Recette confirmee : 3 copper + 2 iron + redstone + max_revive. NB pack : `infiniteHealerCharge:true` donc pas de cout d'energie a expliquer.
- dependencies : `["A940F2657D23B520"]`
- optional : `false`.
- reward : `type:"item"` `cobblemon:potion` x3 (soin portable, complementaire de la machine, pas l'objet demande) + `type:"xp" xp:60`.
- intention desc : accroche (un dresseur sans infirmerie ne va pas loin) ; tip (craft la `&9`Healing Machine`&r` : 3 copper + 2 iron + redstone + max revive ; sur ce pack elle a une charge infinie, soigne toute ton equipe instantanement, gratuitement) ; but (ne jamais rester bloque avec une equipe KO).

### C-PC - "Cloud Storage" (TRONC : PC)
- id : `9B2561AD144854CA`
- role : maillon 4 du tronc. Stockage des Pokemon. DOIT venir AVANT le pasture (le pasture consomme un pc au craft).
- shape : `pentagon`, size `1.8`
- position : `x: 0.0d, y: 9.0d`
- icon : `cobblemon:pc`
- task : `type:"item"`, item `cobblemon:pc` count 1. Recette confirmee : iron + glass + copper + smooth_stone (PAS de link_cable sur ce pack).
- dependencies : `["6ECCC8EB97DFBFAB"]`
- optional : `false`.
- reward : `type:"item"` `cobblemon:exp_candy_m` x2 (accelerateur de niveau, thematique dresseur) + `type:"xp" xp:60`.
- intention desc : accroche (six Pokemon en equipe, mais des centaines a collectionner) ; tip (craft le `&9`PC`&r` : iron + glass + copper + smooth stone ; 30 boites de 30, transfere tes `&c`Pokemon`&r` entre equipe et stockage ; survole un `&c`Pokemon`&r` pour voir espece/type/nature/capacite) ; but (gerer une vraie collection).

### C-PAST - "Room to Roam" (TRONC : pasture)
- id : `FBFDB803FA88EABC`
- role : maillon 5 (terminal du tronc). Le pature. Consomme un PC au craft -> ordre PC avant pasture respecte par la dep.
- shape : `pentagon`, size `1.8`
- position : `x: 0.0d, y: 12.0d`
- icon : `cobblemon:pasture`
- task : `type:"item"`, item `cobblemon:pasture` count 1. Recette confirmee : planks + un PC (craft) + wheat + hopper.
- dependencies : `["9B2561AD144854CA"]`
- optional : `false`.
- reward : `type:"item"` `cobblemon:exp_candy_l` x1 + `type:"xp" xp:75`. (Fin du tronc = reward un cran au-dessus.)
- intention desc : accroche (tes `&c`Pokemon`&r` meritent de courir libres) ; tip (craft le `&9`Pasture`&r` : planks + un PC + wheat + hopper ; il consomme un PC, garde-en un second pour le stockage ; les `&c`Pokemon`&r` deposes gagnent de la `&d`friendship`&r` en roaming) ; but (installer une base de dresseur vivante). NB registre : le pasture est ENSEIGNE ici ; cobblemon_3 (breeding) l'UTILISE mais ne le re-enseigne pas.

---

### BRANCHE BALLS (droite) - obtention via apricorns/craft cobblemon (PAS la fab Create = create_3)

### C-APRI - "Harvest the Apricorns" (BRANCHE balls : source)
- id : `7082AF35C30286A6`
- role : porte d'entree de la branche balls. Apricorns = generation naturelle deterministe (arbres a apricorns), pas de RNG lourd.
- shape : `octagon` (trouver/recolter une source naturelle)
- position : `x: 3.0d, y: 3.0d`
- icon : `cobblemon:red_apricorn`
- task : `type:"item"`, item `cobblemon:red_apricorn` count 4 (deterministe : les arbres a apricorns poussent naturellement ; 4 = de quoi faire une poke_ball). Optionnellement config-writer peut utiliser un smart_filter sur le tag `cobblemon:apricorns` si on accepte n'importe quelle couleur ; recommande rester sur red (la couleur de la poke_ball) pour la clarte pedagogique.
- dependencies : `["A940F2657D23B520"]` (accrochee au premier catch : on a envie de plus de balls apres la 1re capture)
- optional : `true` (la branche balls entiere est non-bloquante : le joueur peut avancer avec ses balls de depart)
- reward : `type:"item"` mix apricorns d'autres couleurs (`cobblemon:blue_apricorn` x3 + `cobblemon:black_apricorn` x3) pour amorcer les great/ultra balls, + `type:"xp" xp:20`. (Pattern ATMons apricorn reward, mais pas l'apricorn deja recolte : on donne d'AUTRES couleurs = complementaire.)
- intention desc : accroche (les balls ne tombent pas du ciel, elles poussent) ; tip (trouve un `&2`apricorn tree`&r`, recolte les `&c`red apricorns`&r` ; chaque couleur sert une ball differente ; laisse-les repousser) ; but (devenir autonome en balls sans dependre du hasard).

### C-POKE - "The Poke Ball" (BRANCHE balls : tier 1)
- id : `C819164A41D8CE17`
- role : la ball de base craftee. Premiere du trio obligatoire de la branche.
- shape : `circle`, size 1.0
- position : `x: 5.0d, y: 1.5d`
- icon : `cobblemon:poke_ball`
- task : `type:"item"`, item `cobblemon:poke_ball` count 1 (recette : 4 red_apricorn + copper base). config-writer verifie la recette exacte en JEI.
- dependencies : `["7082AF35C30286A6"]`
- optional : `true`
- reward : `type:"item"` `cobblemon:apricorn_seed` variantes OU `cobblemon:great_ball` x2 (tier au-dessus) + `type:"xp" xp:20`.
- intention desc : accroche (la ball rouge et blanche, l'icone du dresseur) ; tip (assemble 4 `&c`red apricorns`&r` + une base copper pour la `&c`Poke Ball`&r`) ; but (savoir fabriquer ses propres balls).

### C-GREAT - "The Great Ball" (BRANCHE balls : tier 2)
- id : `3999053B22950532`
- role : ball tier 2. Meilleur taux de capture.
- shape : `circle`, size 1.0
- position : `x: 6.5d, y: 3.0d`
- icon : `cobblemon:great_ball`
- task : `type:"item"`, item `cobblemon:great_ball` count 1 (recette : blue + red apricorn + iron ; verifier JEI).
- dependencies : `["C819164A41D8CE17"]`
- optional : `true`
- reward : `type:"item"` `cobblemon:ultra_ball` x2 (tier au-dessus) + `type:"xp" xp:25`.
- intention desc : accroche (quand la Poke Ball ne suffit plus) ; tip (`&9`blue`&r` + `&c`red apricorn`&r` + iron pour la `&a`Great Ball`&r`, meilleur taux de capture) ; but (attraper des especes plus coriaces).

### C-ULTRA - "The Ultra Ball" (BRANCHE balls : tier 3)
- id : `FA147EC7DC390B63`
- role : ball tier 3, sommet du trio obligatoire. La branche converge ensuite sur C-BALLKIT.
- shape : `circle`, size 1.0
- position : `x: 5.0d, y: 4.5d`
- icon : `cobblemon:ultra_ball`
- task : `type:"item"`, item `cobblemon:ultra_ball` count 1 (recette : black + yellow apricorn + gold ; verifier JEI).
- dependencies : `["3999053B22950532"]`
- optional : `true`
- reward : `type:"item"` `cobblemon:exp_candy_m` x1 + `type:"xp" xp:30`.
- intention desc : accroche (le fer de lance de la capture serieuse) ; tip (`&8`black`&r` + `&e`yellow apricorn`&r` + gold pour l'`&b`Ultra Ball`&r`) ; but (completer l'echelle des balls de base). NB : la `master_ball` est ENDGAME, EXCLUE de ce chapitre.

### C-BALLKIT - "Ball Craftsman" (BRANCHE balls : convergence + reward table)
- id : `A0455F305A103B31`
- role : node de convergence du trio poke/great/ultra. Porte une reward table (jalon a rsquare).
- shape : `rsquare`
- position : `x: 7.0d, y: 6.0d`
- icon : `cobblemon:ultra_ball`
- task : `type:"checkmark"` (auto-valide une fois les 3 balls faites ; c'est un jalon de synthese, pas un nouveau craft). Alternative config-writer : re-demander la detention simultanee des 3 via 3 tasks item ; recommande checkmark pour ne pas re-consommer.
- dependencies : `["C819164A41D8CE17", "3999053B22950532", "FA147EC7DC390B63"]` (les 3 balls du trio)
- optional : `true`
- reward : `type:"random" table_id:<first_steps_rewards en long>L` (tirage `first_steps_rewards` = mix balls/soin/candy, adapte au theme) + `type:"xp" xp:40`.
- intention desc : accroche (tu es desormais ton propre forgeron de balls) ; tip (rappelle les 3 tiers et leurs taux ; garde du stock d'apricorns) ; but (autonomie totale en captures ; jalon de la branche). NB registre : la FABRICATION via Create klinks (blank/stencil/paint) N'est PAS ici, elle est en create_3 ; ici c'est le craft cobblemon natif via apricorns.

### C-HEALB - "Heal Ball" (BRANCHE balls : speciale 1, optionnelle)
- id : `F9FDA82A0BF51F79`
- role : ball speciale distincte (soigne a la capture).
- shape : `diamond`, size 1.0
- position : `x: 8.5d, y: 4.5d`
- icon : `cobblemon:heal_ball`
- task : `type:"item"`, item `cobblemon:heal_ball` count 1 (verifier recette JEI).
- dependencies : `["A0455F305A103B31"]`
- optional : `true`
- reward : `type:"item"` `cobblemon:potion` x2 + `type:"xp" xp:20`.
- intention desc : accroche (attrape et soigne d'un seul geste) ; tip (la `&d`Heal Ball`&r` restaure PP et PV du `&c`Pokemon`&r` capture) ; but (capturer sans detour par la Healing Machine).

### C-NETB - "Net Ball" (BRANCHE balls : speciale 2, optionnelle)
- id : `62C8BFB2AB5D2B11`
- role : ball speciale distincte (bonus sur Water/Bug).
- shape : `diamond`, size 1.0
- position : `x: 9.5d, y: 6.0d`
- icon : `cobblemon:net_ball`
- task : `type:"item"`, item `cobblemon:net_ball` count 1 (verifier recette JEI).
- dependencies : `["A0455F305A103B31"]`
- optional : `true`
- reward : `type:"item"` `cobblemon:great_ball` x3 + `type:"xp" xp:20`.
- intention desc : accroche (la ball des filets) ; tip (la `&b`Net Ball`&r` a un meilleur taux sur les `&c`Pokemon`&r` de type Water et Bug) ; but (specialiser sa capture). NB : ne PAS mentionner la grille des 18 types (= cobblemon_2), juste ces deux types comme cible de la ball.

### C-QUICKB - "Quick Ball" (BRANCHE balls : speciale 3, optionnelle)
- id : `7EAED42C6A7FE302`
- role : ball speciale distincte (bonus au 1er tour).
- shape : `diamond`, size 1.0
- position : `x: 8.5d, y: 7.5d`
- icon : `cobblemon:quick_ball`
- task : `type:"item"`, item `cobblemon:quick_ball` count 1 (verifier recette JEI).
- dependencies : `["A0455F305A103B31"]`
- optional : `true`
- reward : `type:"item"` `cobblemon:exp_candy_s` x3 + `type:"xp" xp:20`.
- intention desc : accroche (frappe vite ou pas du tout) ; tip (la `&e`Quick Ball`&r` a un taux tres eleve si lancee au tout premier tour du combat) ; but (attraper les fuyards). NB : `master_ball` reste exclue (endgame).

### C-DUSKB - "Dusk Ball" (BRANCHE balls : speciale 4, optionnelle)
- id : `A66818F5B4AF49B3`
- role : ball speciale distincte (bonus nuit/grotte). N'ajoute PAS de progression vers la collection des 29 : reste dans le socle "balls significatives".
- shape : `diamond`, size 1.0
- position : `x: 10.5d, y: 4.5d`
- icon : `cobblemon:dusk_ball`
- task : `type:"item"`, item `cobblemon:dusk_ball` count 1 (CONFIRMER existence + recette JEI ; si invalide sur ce pack, config-writer retire cette quete).
- dependencies : `["A0455F305A103B31"]`
- optional : `true`
- reward : `type:"item"` `cobblemon:great_ball` x3 + `type:"xp" xp:20`.
- intention desc : accroche (la ball des tenebres) ; tip (la `&8`Dusk Ball`&r` a un meilleur taux la nuit ou sous terre) ; but (capturer pendant tes sessions de minage). NB : cible de capture liee au MOMENT, pas au type (pas la grille cobblemon_2).

### C-TIMERB - "Timer Ball" (BRANCHE balls : speciale 5, optionnelle)
- id : `3AE1C9A46B1C372F`
- role : ball speciale distincte (bonus combats longs).
- shape : `diamond`, size 1.0
- position : `x: 10.5d, y: 7.5d`
- icon : `cobblemon:timer_ball`
- task : `type:"item"`, item `cobblemon:timer_ball` count 1 (CONFIRMER existence + recette JEI ; si invalide, retirer).
- dependencies : `["A0455F305A103B31"]`
- optional : `true`
- reward : `type:"item"` `cobblemon:exp_candy_s` x3 + `type:"xp" xp:20`.
- intention desc : accroche (la patience recompensee) ; tip (la `&e`Timer Ball`&r` gagne en efficacite a chaque tour du combat qui passe) ; but (venir a bout des captures tenaces).

---

### BRANCHE HUD / APPS (droite basse) - apps Cobblemon + features HUD (registre : proprietaire des HUD apps)

### C-POKENAV - "PokeNav Online" (BRANCHE apps : app craftable)
- id : `A14E1413A7255AC4`
- role : app HUD craftable (cobblenav). Point d'entree de la branche apps.
- shape : `diamond`, size 1.0
- position : `x: 3.5d, y: 6.0d`
- icon : `cobblenav:pokenav_item_base` (ITEM CONFIRME : `cobblenav:pokenav_item_base`, PAS `cobblenav:pokenav_item` sans suffixe = INVALIDE)
- task : `type:"item"`, item `cobblenav:pokenav_item_base` count 1 (craftable, confirme).
- dependencies : `["A940F2657D23B520"]` (accrochee au premier catch)
- optional : `true`
- reward : `type:"item"` `cobblemon:exp_candy_s` x2 + `type:"xp" xp:25`.
- intention desc : accroche (un GPS pour dresseur) ; tip (craft le `&9`PokeNav`&r` : suit tes `&c`Pokemon`&r`, les spawns et ta position ; ouvre-le avec sa touche assignee) ; but (naviguer le monde en dresseur equipe).

### C-CATCHIND - "Catch Indicator" (BRANCHE apps : feature HUD)
- id : `9AFDD0DF0A309D41`
- role : feature HUD passive (indicateur de taux de capture).
- shape : `diamond`, size 1.0
- position : `x: 3.5d, y: 7.5d`
- icon : `cobblemon:poke_ball`
- task : `type:"checkmark"` (feature d'affichage, pas d'item ni d'action detectable garantie ; tip auto-valide).
- dependencies : `["A14E1413A7255AC4"]`
- optional : `true`
- reward : `type:"item"` `cobblemon:poke_ball` x4 + `type:"xp" xp:15`.
- intention desc : accroche (vise avant de lancer) ; tip (le `&f`Catch Indicator`&r` HUD affiche tes chances de capture en temps reel selon la ball et les PV restants) ; but (arreter de gacher des balls).

### C-SPAWNAL - "Spawn Alerts" (BRANCHE apps : feature HUD)
- id : `561444B593FB545A`
- role : feature HUD passive (alertes de spawn rares).
- shape : `diamond`, size 1.0
- position : `x: 3.5d, y: 9.0d`
- icon : `cobblemon:great_ball`
- task : `type:"checkmark"`.
- dependencies : `["A14E1413A7255AC4"]`
- optional : `true`
- reward : `type:"item"` `cobblemon:exp_candy_s` x2 + `type:"xp" xp:15`.
- intention desc : accroche (ne rate plus une apparition rare) ; tip (les `&f`Spawn Alerts`&r` te previennent quand un `&c`Pokemon`&r` notable apparait a proximite) ; but (chasser efficacement).

### C-COUNTER - "Encounter Counter" (BRANCHE apps : feature HUD ; converge sur C-APPKIT)
- id : `0EFB1690409C3FB1`
- role : feature HUD passive (compteur de rencontres/chaine). Dernier node avant la convergence apps. NB : `counter:counter` a CONFIRMER runtime par mc-knowledge ; si le compteur n'est pas exposable en task, garder en checkmark (deja le cas).
- shape : `diamond`, size 1.0
- position : `x: 3.5d, y: 10.5d`
- icon : `cobblemon:premier_ball`
- task : `type:"checkmark"`.
- dependencies : `["A14E1413A7255AC4"]`
- optional : `true`
- reward : `type:"item"` `cobblemon:exp_candy_s` x2 + `type:"xp" xp:15`.
- intention desc : accroche (compte tes rencontres) ; tip (le `&f`Encounter Counter`&r` suit combien de fois tu as croise une espece, utile pour les chasses au long cours) ; but (mesurer sa perseverance).

### C-APPKIT - "Fully Equipped" (BRANCHE apps : convergence + reward table)
- id : `7EE7BCE8B583CDDF`
- role : convergence de la branche apps HUD. Jalon a reward table.
- shape : `rsquare`
- position : `x: 5.5d, y: 9.0d`
- icon : `cobblenav:pokenav_item_base`
- task : `type:"checkmark"` (synthese : le joueur a active ses outils de dresseur).
- dependencies : `["A14E1413A7255AC4", "9AFDD0DF0A309D41", "561444B593FB545A", "0EFB1690409C3FB1"]`
- optional : `true`
- reward : `type:"random" table_id:<first_steps_rewards en long>L` + `type:"xp" xp:30`.
- intention desc : accroche (ton interface de dresseur est complete) ; tip (recap des apps/HUD actives ; rappelle qu'on peut les toggle) ; but (jalon confort de la branche apps).

### C-PHONE - "The Smartphone" (BRANCHE apps : TIP + quest_link create_3)
- id : `AE83CD51E4B55EA2`
- role : TIP renvoyant a create_3 (le smartphone a sa recette vanilla DESACTIVEE sur ce pack, il se fabrique via Create dans create_3). PAS un objectif de craft ici.
- shape : `circle`, size 1.0
- position : `x: 5.5d, y: 10.5d`
- icon : `cobblemon_smartphone:blue_smartphone` (visuel du tip ; verifier l'id de couleur exact via mc-knowledge, ex `cobblemon_smartphone:blue_smartphone`)
- task : `type:"checkmark"` (tip meta, se valide en lisant ; le VRAI craft est en create_3).
- dependencies : `["A14E1413A7255AC4"]`
- optional : `true`
- reward : `type:"item"` `cobblemon:exp_candy_s` x1 + `type:"xp" xp:15` (leger, c'est un tip).
- intention desc : accroche (le vrai centre de controle du dresseur) ; tip (le `&9`Smartphone`&r` regroupe la Pokedex, la carte et plus ; sur Steamon sa recette classique est desactivee, il se fabrique via `&6`Create`&r` - vois le chapitre `&6`Sparks & Circuits`&r`) ; but (savoir OU l'obtenir, sans le craft ici).
- quest_link associe : voir section 4 (C-PHONE -> racine create_3).

---

### BRANCHE FRIENDSHIP / MOUNTS / PET / SAFEPASTURE (gauche) - relation et vie

### C-FRIEND - "Best Friends" (BRANCHE relation : friendship, jalon Pokemon)
- id : `CDBED359A578D966`
- role : jalon friendship. Forme pentagon (jalon Pokemon majeur, pas juste diamond).
- shape : `pentagon`, size `1.5`
- position : `x: -3.5d, y: 6.0d`
- icon : `cobblemon:soothe_bell`
- task : `type:"item"`, item `cobblemon:soothe_bell` count 1 (le soothe_bell accelere la friendship ; obtenir/detenir la cloche est l'objectif concret et deterministe ; la friendship elle-meme monte par interactions). Alternative si un champ `action` friendship existe : verifier ; recommande item soothe_bell (deterministe, pattern ATMons).
- dependencies : `["6ECCC8EB97DFBFAB"]` (accrochee a la Healing Machine : on prend soin de son equipe)
- optional : `true`
- reward : `type:"item"` `cobblemon:rare_candy` x1 (la friendship debloque des evolutions ; le rare candy est un clin d'oeil progression) + `type:"xp" xp:30`.
- intention desc : accroche (ce n'est pas Palworld : tes `&c`Pokemon`&r` t'aiment ou pas) ; tip (la `&d`Friendship`&r` monte en combattant a leurs cotes, en les gardant en equipe et au pature ; le `&d`Soothe Bell`&r` tenu accelere le gain) ; but (debloquer les evolutions par affection et des `&c`Pokemon`&r` plus forts). NB registre : les evolutions par pierre = evolution_items ; ici on parle SEULEMENT du mecanisme friendship.

### C-PET - "A Gentle Touch" (BRANCHE relation : pet, affectif, heart)
- id : `40BDCA363D216C6E`
- role : interaction affective (pet-your-cobblemon). Distinct de friendship (c'est visuel/affectif, pas le gain de friendship). Forme heart.
- shape : `heart`, size 1.0
- position : `x: -3.0d, y: 4.5d`
- icon : `cobblemon:poke_ball` (ou une icone de coeur si dispo ; recommande poke_ball par defaut)
- task : `type:"checkmark"` (l'action "caresser" un Pokemon n'est pas forcement une task detectable ; tip auto-valide, ton leger).
- dependencies : `["A940F2657D23B520"]` (des qu'on a un Pokemon a caresser)
- optional : `true`
- reward : `type:"item"` `cobblemon:oran_berry` x3 (petit soin sympa) + `type:"xp" xp:15`.
- intention desc : accroche (parfois il suffit d'une caresse) ; tip (approche un `&c`Pokemon`&r` sorti de sa ball et interagis pour le caresser ; c'est de l'affection visuelle, distincte de la `&d`Friendship`&r` mecanique) ; but (profiter du cote vivant de tes compagnons). NB registre : ne PAS confondre avec friendship (deja C-FRIEND).

### C-MOUNT - "Ride Along" (BRANCHE relation : Ride mount, jalon Pokemon)
- id : `CE03F4789DA43429`
- role : jalon Ride mount (journey-mounts). Monter/voler sur un Pokemon rideable. Forme pentagon (jalon Pokemon majeur).
- shape : `pentagon`, size `1.5`
- position : `x: -3.5d, y: 9.0d`
- icon : `cobblemon:poke_ball` (ou icone d'un Pokemon rideable typique ; recommande poke_ball generique)
- task : `type:"checkmark"` (le Ride se fait par shift+clic droit natif sur un Pokemon rideable ; PAS d'item selle, PAS de juice ; l'action de monter n'est pas garantie detectable en task -> checkmark tip). Si un `action` mount/ride existe dans le task type, mc-knowledge le confirme ; sinon checkmark.
- dependencies : `["FBFDB803FA88EABC"]` (accrochee au pasture : on a une base et des Pokemon poses)
- optional : `true`
- reward : `type:"item"` `cobblemon:exp_candy_m` x1 + `type:"xp" xp:30`.
- intention desc : accroche (pourquoi marcher quand on peut chevaucher) ; tip (`&e`shift + clic droit`&r` sur un `&c`Pokemon`&r` rideable pour le monter ; certains volent, d'autres nagent ; PAS besoin de selle ni d'item) ; but (voyager plus vite et plus loin). NB INVALIDES a NE PAS demander : `journeymount:*aprijuice`, `journeymount:*juice` (tous invalides). L'aprijuice sera renvoye ici depuis cobblemon_food (quest_link entrant), mais ce chapitre n'utilise AUCUN item juice.

### C-SAFEPAST - "Safe Pastures" (BRANCHE relation : safepastures, octagon)
- id : `B2ACB02FBB7711B9`
- role : pature securisee (safepastures). Extension du pasture. Octagon (amenager une zone/source).
- shape : `octagon`, size 1.0
- position : `x: -3.5d, y: 12.0d`
- icon : `cobblemon:pasture`
- task : `type:"checkmark"` (safepastures est une mecanique de protection du pature ; verifier via mc-knowledge s'il expose un item/bloc dedie ; a defaut checkmark tip). Si un item safepastures existe, config-writer le met en task item.
- dependencies : `["FBFDB803FA88EABC"]`
- optional : `true`
- reward : `type:"item"` `cobblemon:oran_berry` x4 + `type:"xp" xp:20`.
- intention desc : accroche (un pature ou tes `&c`Pokemon`&r` sont a l'abri) ; tip (les `&2`Safe Pastures`&r` empechent tes `&c`Pokemon`&r` deposes de subir les degats/mobs hostiles ; amenage une zone dediee) ; but (laisser roamer sans risque).

---

### BRANCHE TIPS DE PREMIERE PARTIE (gauche eloignee) - mecaniques de dresseur non couvertes ailleurs

Ces tips enseignent des GESTES de dresseur (combat, gestion d'equipe) que ni overworld ni les autres branches ne couvrent, et qui n'empietent pas sur cobblemon_2/3 (pas de types, pas d'EV/IV, pas de TM). Tous `checkmark` (gestes non garantis detectables) et `optional:true`. Accroches a C-CATCH (des qu'on a un Pokemon).

### C-WILDBATTLE - "Your First Wild Battle" (TIP : combat sauvage)
- id : `3A86AE66284F9486`
- role : tip du premier combat contre un `&c`Pokemon`&r` sauvage (distinct de la CAPTURE : ici on parle du combat lui-meme, envoyer/rappeler, attaquer). Ne double PAS C-CATCH (qui vise la capture) ni la League (dresseurs = adventure).
- shape : `pentagon`, size 1.2
- position : `x: -5.5d, y: 3.0d`
- icon : `cobblemon:poke_ball`
- task : `type:"checkmark"`. (Alternative si `action:"defeat"` amount:1 est fiable en early : config-writer peut l'utiliser ; `defeat` est confirme dans le task type. Recommande : `cobblemon_tasks:cobblemon_task` action `defeat` amount:1L si ca ne cree pas de friction, sinon checkmark.)
- dependencies : `["A940F2657D23B520"]`
- optional : `true`
- reward : `type:"item"` `cobblemon:potion` x2 + `type:"xp" xp:25`.
- intention desc : accroche (tout dresseur a un premier combat) ; tip (`&e`send out`&r` un `&c`Pokemon`&r`, choisis une attaque ; affaiblis l'adversaire pour le capturer, ou mets-le KO pour l'XP ; `&e`recall`&r` pour changer) ; but (comprendre le combat, pas seulement la capture).

### C-TEAM - "Manage Your Team" (TIP : ordre / send out / recall)
- id : `76871DBF4BB19F4F`
- role : tip de gestion d'equipe (ordre des 6, envoyer/rappeler, soigner en combat). Complementaire du PC (stockage) : ici c'est l'EQUIPE active.
- shape : `diamond`, size 1.0
- position : `x: -5.5d, y: 4.5d`
- icon : `cobblemon:poke_ball`
- task : `type:"checkmark"`.
- dependencies : `["A940F2657D23B520"]`
- optional : `true`
- reward : `type:"item"` `cobblemon:exp_candy_s` x2 + `type:"xp" xp:20`.
- intention desc : accroche (une equipe bien geree gagne des combats) ; tip (reorganise l'ordre de tes 6 `&c`Pokemon`&r`, le premier sort en combat ; utilise une `&c`Potion`&r` en combat via le menu sac) ; but (piloter son equipe en direct). NB : ne PAS parler d'EV/IV/natures competitives (= cobblemon_3).

### C-NICKNAME - "Nickname & Bond" (TIP : renommer)
- id : `AF69F19846ECCBA6`
- role : tip cosmetique (renommer un `&c`Pokemon`&r`), petit geste attachant. Distinct de friendship (mecanique) et de pet (affectif visuel).
- shape : `diamond`, size 1.0
- position : `x: -5.5d, y: 6.0d`
- icon : `cobblemon:soothe_bell`
- task : `type:"checkmark"`.
- dependencies : `["A940F2657D23B520"]`
- optional : `true`
- reward : `type:"item"` `cobblemon:oran_berry` x3 + `type:"xp" xp:15`.
- intention desc : accroche (un nom, une histoire) ; tip (dans le menu d'un `&c`Pokemon`&r`, renomme-le comme tu veux) ; but (s'attacher a ses compagnons). Ton leger.

---

### CONVERGENCE FINALE

### C-READY - "Trainer Ready" (CONVERGENCE : jalon final du chapitre)
- id : `32E4C9E97A102287`
- role : node de convergence final. Le joueur a couvert les bases du dresseur. Surdimensionne, forme pentagon (identite Cobblemon, symetrique de la racine).
- shape : `pentagon`, size `2.5`
- position : `x: 0.0d, y: 15.5d`
- icon : `cobblemon:poke_ball` (ou un badge ; recommande poke_ball, identite du chapitre)
- task : `type:"checkmark"` (jalon de synthese).
- dependencies : `["FBFDB803FA88EABC", "A0455F305A103B31", "CDBED359A578D966", "CE03F4789DA43429", "7EE7BCE8B583CDDF"]` (C-PAST + C-BALLKIT + C-FRIEND + C-MOUNT + C-APPKIT)
- **dependency_requirement / min_required_dependencies** : `min_required_dependencies: 2`. NON-BLOCAGE CRITIQUE : seul C-PAST (fin du tronc deterministe) est garanti fait ; les 4 autres branches sont optionnelles. Exiger 2 sur 5 garantit que le joueur qui a fini le tronc + AU MOINS une branche valide le jalon, sans etre bloque par une branche qu'il n'a pas envie de faire. (C-PAST compte comme 1 ; il suffit d'une seule autre branche.)
- `hide_dependency_lines: true` (5 branches convergent : on cache les traits pour eviter le spaghetti).
- optional : `false` (jalon de fin, mais non-bloquant grace au min_required_dependencies 2).
- reward : le plus gros du chapitre. `type:"random" table_id:<first_steps_rewards en long>L` (tirage premium du theme) + `type:"item" numismatics:spur` x8 (PREMIERE monnaie Numismatics du parcours Cobblemon, graduee au tier debut de chapitre, FORMAT B item) + `type:"xp_levels" xp_levels:3`. Alternative : creer une table `cobblemon_supplies` dediee (voir section 5) si first_steps_rewards est trop generique pour un jalon de fin ; recommande reutiliser first_steps_rewards (deja thematique balls/candies/soin, parfait pour un dresseur debutant).
- intention desc : accroche (registre prestige leger : tu n'es plus un novice, tu es un dresseur) ; tip (recap de ce qui est acquis : capturer, soigner, stocker, elever l'affection, chevaucher, fabriquer ses balls ; la suite = les 18 types, l'elevage, les dimensions) ; but (jalon de passage ; premiere monnaie ; ouvre mentalement vers cobblemon_2/3 et les dimensions).

---

## 4. quest_links (cobblemon_1)

Un `quest_link` affiche une quete d'un AUTRE chapitre a l'interieur de celui-ci (lien de decouverte/renvoi). cobblemon_1 en a UN sortant a poser en V2, plus un entrant deja pose par overworld (rappel) et un entrant a venir de cobblemon_food (V4).

### C-PHONE -> create_3 (SORTANT, a figer en V2)
- quest_link id : `E33FF45DB528317D`
- linked_quest CIBLE : racine du chapitre **create_3** (`Sparks & Circuits`). L'id de cette racine N'EST PAS ENCORE FIGE (create_3 = Vague 2, pas encore blueprinte).
- **Proposition d'id canonique a reserver pour la racine create_3** : `7FD87542D311BA8A`. L'orchestrator tranche : soit il fige cet id comme `id` de la racine create_3 quand create_3 sera blueprinte, soit quest-architect note "a lier en V2" et le config-writer met a jour ce linked_quest avec l'id reel de la racine create_3 une fois connu.
- position d'affichage : a cote de C-PHONE, ex `x: 6.5d, y: 10.5d`.
- shape du lien : `gear` (forme dediee Create, signale le renvoi vers l'univers Create).
- note production : DEPENDANCE DE PRODUCTION V2. Tant que create_3 n'est pas ecrit, ce lien pointe dans le vide (inoffensif, FTB n'affiche rien). Le smartphone lui-meme se craft dans create_3 ; ce lien est la porte de sortie "va le fabriquer la-bas".

### Rappel liens ENTRANTS (poses ailleurs, pour coherence, PAS a ecrire ici)
- **overworld -> cobblemon_1** (V1, DEJA POSE) : quest_link overworld `3A02A19D4EF0E25E`, linked_quest = `4EFD1A480A12986D` (C-ROOT). C'est la PORTE COBBLEMON. Confirme que C-ROOT DOIT porter `4EFD1A480A12986D` (contrainte respectee).
- **create_3 -> cobblemon_1** (V2, a poser cote create_3) : la quete "Poke Ball fabrication" de create_3 (klinks-n-klangs) pointera vers cobblemon_1 (les balls). Cote cobblemon_1, RIEN a faire : c'est create_3 qui pose le lien. Registre : la FAB Create des balls appartient a create_3, pas ici.
- **cobblemon_food -> cobblemon_1** (V4, a poser cote cobblemon_food) : l'aprijuice de cobblemon_food renvoie vers C-MOUNT (Ride mounts). Cote cobblemon_1, RIEN a faire.

---

## 5. Reward tables (cobblemon_1)

### `first_steps_rewards` - REUTILISEE (existe deja)
- id : `300C2F87515349E9` (EXISTE, fichier `docs/quests/reward_tables/first_steps_rewards.snbt`).
- contenu actuel (verifie) : poke_ball x5 (w40), numismatics:spur (w35), oran_berry x3 (w25), great_ball x2 (w25), potion (w15), exp_candy_s (w15), full_heal (w10), premier_ball (w5), rare_candy (w2). loot_size 1. FORMAT actuel = A-PLAT (sans champ `type`).
- **AJUSTEMENT REQUIS par le config-writer** : la table est au format A-PLAT (invalide sur ce pack, bug "Air"). Le config-writer DOIT la reecrire au FORMAT B (chaque reward avec `type:"item"`), conformement a la reference 3.5. Contenu a conserver (deja parfait pour un dresseur debutant : balls, soin, candies, une pincee de spur). Aucun changement d'items requis, seulement le passage au FORMAT B.
- utilisee par : C-BALLKIT (`A0455F305A103B31`), C-APPKIT (`7EE7BCE8B583CDDF`), C-READY (`32E4C9E97A102287`). Les 3 tirent dans cette table via `type:"random" table_id:<300C2F87515349E9 en long signe>L`.
- table_id en long : le config-writer convertit `300C2F87515349E9` (hex) en long decimal signe + suffixe `L` (voir reference 3.5).

### `cobblemon_supplies` - OPTIONNELLE (a creer SI besoin)
- non requise si first_steps_rewards suffit (recommande : suffit). Si l'orchestrator veut differencier le jalon final C-READY d'un tirage plus riche, creer une petite table `cobblemon_supplies` (id a generer, ex `054926C20D4F1ECD`) au FORMAT B : mix great_ball/ultra_ball (w eleve), exp_candy_m (w moyen), rare_candy (w bas 2-3), numismatics:spur x4 (w moyen). Tier "debut de chapitre". Dans ce cas C-READY tire `cobblemon_supplies` au lieu de `first_steps_rewards`.
- decision par defaut de ce blueprint : NE PAS creer cobblemon_supplies pour l'instant. Reutiliser first_steps_rewards partout. (Moins de tables a maintenir, coherence.)

---

## 6. Cles lang a produire (par quest-writer)

Pour chaque entree : title + subtitle + description (accroche -> tip/mecanique -> but), style ATM/All-the-Mons, anglais, `&` echappes, palette couleur respectee. quest-writer ne redige PAS ici ; il remplit les cles ci-dessous a partir des intentions donnees en section 3.

Cle chapitre :
- `chapter.44802B3EA281E38A.title` = `&cTrainer's First Steps`. Intention : nommer le chapitre d'ouverture Cobblemon.

Cles quetes (title / subtitle / desc) :
- C-ROOT `4EFD1A480A12986D` : "Choose Your Starter". Intention : premiere selection de starter, le vrai debut. Ton chaleureux.
- C-CATCH `A940F2657D23B520` : "Gotta Catch One". Intention : boucle de capture de base, HUD d'aide.
- C-HEAL `6ECCC8EB97DFBFAB` : "Field Medic". Intention : healing machine, recette, charge infinie sur ce pack.
- C-PC `9B2561AD144854CA` : "Cloud Storage". Intention : PC, recette, boites, hover pour infos.
- C-PAST `FBFDB803FA88EABC` : "Room to Roam". Intention : pasture, recette, consomme un PC, friendship en roaming.
- C-APRI `7082AF35C30286A6` : "Harvest the Apricorns". Intention : source deterministe des balls, couleurs.
- C-POKE `C819164A41D8CE17` : "The Poke Ball". Intention : craft tier 1.
- C-GREAT `3999053B22950532` : "The Great Ball". Intention : craft tier 2, meilleur taux.
- C-ULTRA `FA147EC7DC390B63` : "The Ultra Ball". Intention : craft tier 3 ; master_ball = endgame (mentionner comme "plus tard").
- C-BALLKIT `A0455F305A103B31` : "Ball Craftsman". Intention : synthese trio, autonomie balls.
- C-HEALB `F9FDA82A0BF51F79` : "Heal Ball". Intention : ball speciale, soigne a la capture.
- C-NETB `62C8BFB2AB5D2B11` : "Net Ball". Intention : ball speciale, bonus Water/Bug (sans invoquer la grille des types).
- C-QUICKB `7EAED42C6A7FE302` : "Quick Ball". Intention : ball speciale, bonus 1er tour.
- C-DUSKB `A66818F5B4AF49B3` : "Dusk Ball". Intention : ball speciale, bonus nuit/grotte.
- C-TIMERB `3AE1C9A46B1C372F` : "Timer Ball". Intention : ball speciale, bonus combats longs.
- C-POKENAV `A14E1413A7255AC4` : "PokeNav Online". Intention : app craftable, navigation.
- C-CATCHIND `9AFDD0DF0A309D41` : "Catch Indicator". Intention : HUD taux de capture.
- C-SPAWNAL `561444B593FB545A` : "Spawn Alerts". Intention : HUD alertes de spawn.
- C-COUNTER `0EFB1690409C3FB1` : "Encounter Counter". Intention : HUD compteur de rencontres.
- C-APPKIT `7EE7BCE8B583CDDF` : "Fully Equipped". Intention : synthese apps HUD.
- C-PHONE `AE83CD51E4B55EA2` : "The Smartphone". Intention : TIP, recette Create-only, renvoi create_3.
- C-FRIEND `CDBED359A578D966` : "Best Friends". Intention : friendship, soothe bell, "pas Palworld".
- C-PET `40BDCA363D216C6E` : "A Gentle Touch". Intention : pet affectif, distinct de friendship.
- C-MOUNT `CE03F4789DA43429` : "Ride Along". Intention : Ride mount, shift+clic droit, pas de selle.
- C-SAFEPAST `B2ACB02FBB7711B9` : "Safe Pastures". Intention : pature securise.
- C-WILDBATTLE `3A86AE66284F9486` : "Your First Wild Battle". Intention : combat sauvage (send out/attack/recall), distinct de la capture.
- C-TEAM `76871DBF4BB19F4F` : "Manage Your Team". Intention : ordre d'equipe, potion en combat (pas d'EV/IV).
- C-NICKNAME `AF69F19846ECCBA6` : "Nickname & Bond". Intention : renommer un Pokemon, ton leger.
- C-READY `32E4C9E97A102287` : "Trainer Ready". Intention : jalon final prestige leger, recap + ouverture cobblemon_2/3/dimensions.
- quest_link C-PHONE->create_3 `E33FF45DB528317D` : PAS de cle lang (un quest_link affiche le titre de la quete liee).

---

## 7. Controles de conformite (recap pour orchestrator / validator)

### Non-blocage (regle 4)
- Tronc obligatoire = C-ROOT -> C-CATCH -> C-HEAL -> C-PC -> C-PAST. 100% deterministe et borne : select_starter (choix), catch 1 (garanti en combat), 3 crafts de machines cobblemon (recettes deterministes, ingredients accessibles : copper/iron/glass/redstone/max_revive/wheat/hopper/planks). Aucun RNG lourd, aucun drop rare, aucune structure. OK.
- Aucun item RNG/rare/long dans le tronc : les apricorns (branche) sont deterministes mais la branche entiere est `optional:true` de toute facon. Les balls speciales, HUD, mount, pet, safepasture : tous `optional:true`. OK.
- C-READY : `min_required_dependencies: 2` sur 5 deps. Le joueur ayant fini le tronc (C-PAST fait) n'a besoin que d'UNE branche de plus pour valider. Jamais bloque par une branche non desiree. OK.
- master_ball EXCLUE (endgame). Pas de collection des 29 balls. OK (registre 3.2, chevauchement v2 resolu 3.5).

### Anti-repetition (registre 3.2 - frontiere COBBLEMON)
- Ce chapitre POSSEDE : select_starter, catch (base), PC/healing_machine/pasture (usage), balls significatives (poke/great/ultra + heal/net/quick), friendship, journey-mounts, HUD apps (pokenav/catch-indicator/spawn-alerts/counter). Conforme au registre.
- NON traite ici (delegue) : grille 18 types (cobblemon_2), breeding/EV/IV/TMs (cobblemon_3), berries brutes (berries), pierres/mega (evolution_items), held items competitifs (pvp_items), FAB balls via Create klinks (create_3), aprijuice/produits (cobblemon_food). Aucune task de ce blueprint ne touche a ces domaines. OK.
- Le smartphone n'est PAS un craft ici (recette Create-only) : TIP + quest_link vers create_3. Respecte la frontiere avec create_3. OK.
- Net Ball : mentionne Water/Bug comme cible de la ball SANS enseigner la grille des types (qui reste a cobblemon_2). OK.

### Items / tasks a RE-VERIFIER par config-writer via mc-knowledge avant ecriture
- `cobblemon_tasks:cobblemon_task` action `select_starter` (confirme), `catch` amount:1L (confirme), `defeat` (confirme, utilisable pour C-WILDBATTLE si sans friction, sinon checkmark). `mount`/`ride` action : NON confirmee -> C-MOUNT reste `checkmark` a defaut.
- `counter:counter` en task : NON confirme -> C-COUNTER reste `checkmark`.
- Recettes exactes (JEI) : healing_machine (3 copper + 2 iron + redstone + max_revive), pc (iron + glass + copper + smooth_stone), pasture (planks + pc + wheat + hopper), poke_ball (4 red_apricorn + copper base), great_ball (blue+red apricorn + iron), ultra_ball (black+yellow apricorn + gold), heal_ball/net_ball/quick_ball/dusk_ball/timer_ball (recettes a confirmer JEI).
- **C-DUSKB / C-TIMERB CONDITIONNELLES** : `cobblemon:dusk_ball` et `cobblemon:timer_ball` existence + recette a CONFIRMER runtime. Si l'un n'existe pas / n'est pas craftable sur ce pack, config-writer RETIRE la quete correspondante (et l'orchestrator applique un ajout de compensation, voir note comptage). Ne PAS inventer.
- Items a confirmer via /give : `cobblenav:pokenav_item_base` (confirme valide), `cobblemon:soothe_bell`, `cobblemon:heal_ball`/`net_ball`/`quick_ball`/`dusk_ball`/`timer_ball`, `cobblemon_smartphone:<color>_smartphone` (id de couleur exact), `cobblemon:exp_candy_s/m/l`, `cobblemon:potion`, `cobblemon:oran_berry`, `cobblemon:rare_candy`, `numismatics:spur`.
- INVALIDES a NE JAMAIS utiliser (confirme) : `cobblemon:poke_puff`, `cobblemon:cream_puff`, `cobblemon:linking_cord`, `cobblenav:pokenav_item` (sans suffixe), `cobblenav:pokefinder_item_base`, `journeymount:*aprijuice`, `journeymount:*juice`. Aucun de ces items n'apparait dans ce blueprint. OK.

### Reward != objectif (regle 2)
- C-ROOT (choisir starter) -> reward = poke_ball (pas un starter). OK.
- C-CATCH (attraper) -> reward = great_ball (tier au-dessus, pas la poke_ball utilisee). OK.
- C-HEAL (healing machine) -> reward = potion (soin portable, pas la machine). OK.
- Chaque craft de ball -> reward = ball du tier SUPERIEUR ou candy, jamais la ball craftee. OK.
- Jalons a table (BALLKIT/APPKIT/READY) -> tirage first_steps_rewards + xp/spur. OK.

### Layout (0 overlap, symetrie)
- Tronc x=0, y de 0 a 15.5, pas de 3. Branches droite x=3 a 9.5, gauche x=-3 a -3.5. Convergence x=0 y=15.5. Centres espaces >= 1.5, gros nodes (pentagon 2.0-2.5) espaces >= 3 sur le tronc. Le validator confirme 0 overlap.
- Lignes visibles sur le tronc (le joueur suit), cachees sur C-READY (`hide_dependency_lines:true`). default_hide_dependency_lines chapitre = false.

### Comptage
- Obligatoires (tronc, `optional:false`) : C-ROOT, C-CATCH, C-HEAL, C-PC, C-PAST, C-READY = **6**.
- Optionnelles (`optional:true`) : C-APRI, C-POKE, C-GREAT, C-ULTRA, C-BALLKIT, C-HEALB, C-NETB, C-QUICKB, C-DUSKB, C-TIMERB, C-POKENAV, C-CATCHIND, C-SPAWNAL, C-COUNTER, C-APPKIT, C-PHONE, C-PET, C-FRIEND, C-MOUNT, C-SAFEPAST, C-WILDBATTLE, C-TEAM, C-NICKNAME = **23**. (C-BALLKIT et C-APPKIT sont optional:true mais servent de convergence de branche.)
- + quest_link C-PHONE->create_3 (1, pas une quete comptee).
- **Total quetes = 29** (+1 quest_link). Ratio 6 obligatoire / 23 optionnel = conforme au brief (~5-6 / ~24-30) et a la cible 30-36 (29, en bas de fourchette, ce qui est sain : chapitre d'ouverture, on ne noie pas le debutant).

### Note : si l'orchestrator veut viser le haut de fourchette (32-36)
Ajouts possibles, tous `optional:true`, sans casser le registre : split C-POKENAV en "PokeNav craft" + "PokeNav Pokedex" (+1), un tip "Send Out / Recall" separe de C-TEAM (+1), un tip "Heal at a Healing Machine in the field" distinct de C-HEAL (+1), une 6e ball speciale confirmee (+1). Non applique par defaut : 29 est un bon volume pour un chapitre d'accueil (lisibilite > exhaustivite). Les balls C-DUSKB/C-TIMERB sont conditionnees a leur validite runtime (voir controles) : si invalides, on retombe a 27 et l'orchestrator applique les ajouts ci-dessus pour compenser.
```
```

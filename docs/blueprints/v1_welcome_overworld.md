# Blueprint V1 - Welcome + Overworld (Steamon Journey)

Vague 1 de la refonte des quetes FTB Steamon. Groupe **Getting Started** `3DBCC9E2D8397D4A`.
Ce document est un BLUEPRINT pr-a-ecrire : il fixe la structure (quetes, ids, shapes, positions, deps, taches, idees de reward, cles lang). Il ne contient ni SNBT final ni textes joueur.

- SNBT final = quest-config-writer (traduit ce blueprint + les textes).
- Textes joueur (title/subtitle/desc) = quest-writer (remplit les cles lang listees en section finale de chaque chapitre).
- Chaque item/advancement listе a ete confirme par quest-mc-knowledge (matiere de recherche VERROUILLEE fournie par l'orchestrator). quest-config-writer re-verifie via /give avant d'ecrire.

Regles appliquees : non-blocage du tronc (section 4 du master plan), anti-repetition (section 3), shapes semantiques (section 7 + reference 5.1), FORMAT B pour les reward tables. Jamais de tiret cadratin.

Convention couleur (annexe A reference, rappel pour quest-writer) : Pokemon `&c`, machines Create `&6`, rotational power/cogs `&d`, fluides `&b`, items/logistics `&e`, contraptions `&a`, dimensions couleur dediee, tips `&f&lTip:&r`.

---

## Convention d'IDs de ce blueprint

Tous les ids ci-dessous sont des hex 16 UNIQUES generes pour la V1. Ils remplacent les ids v2 (la v2 est jetee). Le config-writer les reprend tels quels. Deux ids sont des CIBLES de production (racines create_1 / cobblemon_1) : ils n'existent pas encore, ils seront la valeur `id` de la racine de ces chapitres quand ils seront ecrits en Vague 2. Notes explicites en section quest_links.

Palette de shapes utilisee ici :
- `hexagon` size 2.5-3.0 = racine de chapitre tronc + jalons majeurs de la Journey (couleur dimension a venir).
- `hexagon` size 1.5 = maillon deterministe du tronc vertical.
- `gear` size 2.0 = jalon "porte / gate" a saveur Create (fin de Journey, convergence dimensions).
- `circle` size 1.0-1.5 = tip checkmark / convergence / node advancement leger.
- `diamond` size 1.0 = tip lateral optionnel (QoL, confort).
- `octagon` = "trouve / place un bloc de survie" (waystone, magnum torch).
- `square` = craft de survie (gravestone bloc).
- `none` + invisible = node fantome connecteur.

---

# CHAPITRE 1 - WELCOME

## 1. Metadonnees chapitre

| Champ | Valeur |
|---|---|
| filename | `welcome` |
| id chapitre | `E6E8E3EA674E6CD1` |
| group | `3DBCC9E2D8397D4A` (Getting Started) |
| order_index | `0` |
| title in-game (cle lang) | `&eWelcome to Steamon` |
| icon | `cobblemon:poke_ball` (identite du pack, deja l'icone globale) |
| default_quest_shape | `circle` (grille de tips, archetype A4) |
| default_hide_dependency_lines | `true` (grille de tips en eventail : on cache les traits pour eviter le spaghetti ; seule la convergence garde un sens logique cache) |
| progression_mode | herite global `flexible` |

Intention du chapitre : ecran d'accueil. Une racine surdimensionnee gratuite (obtenue des qu'on entre en jeu), qui pose les 2 univers (Create = machines, Cobblemon = Pokemon) + la ligne Discord + la philosophie non-bloquante. Autour, un eventail de 8 tips checkmark tous `optional:true` (backpack, waystone, compass, quests-are-optional, discord, commandes/QoL). Convergence via un node fantome invisible qui n'affiche rien mais sert d'ancre. Les 2 portes quest_link (create/cobblemon) NE sont PAS ici : elles vivent dans overworld.

## 2. Liste des quetes

Grille : racine au centre `(0,0)`, size 3. Eventail sur 2 anneaux autour. Espacement >= 2 pour laisser respirer la size 3. Symetrie gauche/droite.

### W0 - Racine "Welcome to Steamon" (TRONC-accueil)
- id : `D5792F747EE0F514`
- role : racine de chapitre, entree de la grille.
- shape : `hexagon`, size `3.0` (surdimensionnee, distincte).
- position : `x: 0.0d, y: 0.0d`
- icon : `cobblemon:poke_ball`
- task : `type: "dimension"`, `dimension: "minecraft:overworld"` (validee : le joueur l'a des qu'il entre en jeu = bienvenue gratuite).
- dependencies : aucune.
- optional : `false` (c'est la porte d'entree, mais elle s'auto-complete instantanement donc ne bloque rien).
- reward : leger. xp 10 + petit kit survie via table `first_steps_rewards` (torches/pain), FORMAT B `type:"random"`. Idee : `type:"item"` numismatics:spur x5 + `type:"xp" xp:10` en inline, OU un tirage `first_steps_rewards`. Recommande : xp 10 inline + 1 tirage `first_steps_rewards`.
- intention desc : accroche les 2 univers Create/Cobblemon, dit que la Steamon Journey (chapitre overworld) est le fil rouge, invite Discord.

### W1 - Tip "Quests are optional" (TIP philosophie)
- id : `63248C846CF59B64`
- role : tip, pose la regle non-bloquante.
- shape : `circle`, size `1.0`
- position : `x: 0.0d, y: -2.5d` (juste au-dessus de la racine, place d'honneur)
- icon : `ftbquests:book` (livre de quetes ; si absent au registre, fallback `minecraft:writable_book` - config-writer verifie)
- task : `type: "checkmark"`
- dependencies : `["D5792F747EE0F514"]`
- optional : `true`
- reward : xp 10 inline (pas d'item, c'est un tip meta).
- intention desc : explique que rien n'est obligatoire, que le tronc (Steamon Journey) est un guide et non une contrainte, que les branches Create/Cobblemon se font dans l'ordre qu'on veut.

### W2 - Tip "Your Backpack" (TIP usage)
- id : `567E86E514462ED3`
- role : tip usage sophisticatedbackpacks.
- shape : `circle`, size `1.0`
- position : `x: -2.5d, y: -1.5d`
- icon : `sophisticatedbackpacks:backpack`
- task : `type: "checkmark"` (usage, pas craft : on n'oblige pas a fabriquer le backpack tot).
- dependencies : `["D5792F747EE0F514"]`
- optional : `true`
- reward : les INGREDIENTS du backpack, pas le backpack (regle reward != objectif). Inline `type:"item"` minecraft:string x6 + minecraft:leather x2 + xp 10.
- intention desc : accroche (ranger sa vie), tip (recette SLS/SCS/LLL string+leather+coffre, clic pour ouvrir, systeme d'upgrades stack/pickup/feeding), but (le confort d'inventaire des le debut).

### W3 - Tip "Getting Around" (TIP usage waystone)
- id : `6C7E421CADAC0FE5`
- role : tip usage waystones (la waystone de spawn est deja placee) + return scroll.
- shape : `circle`, size `1.0`
- position : `x: -2.5d, y: 1.5d`
- icon : `waystones:waystone`
- task : `type: "checkmark"` (usage : le craft de waystone est trop cher tot car il exige warp_stone -> ender_pearl ; on enseigne l'USAGE de la waystone de depart, pas le craft).
- dependencies : `["D5792F747EE0F514"]`
- optional : `true`
- reward : `waystones:return_scroll` x3 + xp 10 (utilitaire teleport de retour, coherent, pas la waystone elle-meme).
- intention desc : accroche (voyager vite), tip (la waystone du spawn est active ; clic droit pour la lier ; return_scroll ramene au dernier point ; le craft complet viendra plus tard), but (poser un reseau de teleport).

### W4 - Tip "The Compass" (TIP usage natures-compass)
- id : `58EDB0CCF666DD0C`
- role : tip natures-compass (trouver un biome).
- shape : `circle`, size `1.0`
- position : `x: 2.5d, y: -1.5d`
- icon : `naturescompass:naturescompass` (CORRECTION ID : pas d'underscore, confirme par la matiere de recherche).
- task : `type: "item"`, `item: naturescompass:naturescompass` (ici on PEUT demander le craft : recette accessible SLS/LCL/SLS sapling+log+compass, deterministe et pas chere). consume_items : false.
- dependencies : `["D5792F747EE0F514"]`
- optional : `true`
- reward : `minecraft:redstone` x8 + `minecraft:iron_ingot` x2 + xp 10 (ingredients d'une boussole, coherent, pas la compass elle-meme).
- intention desc : accroche (ne plus jamais errer), tip (clic droit ouvre la liste des biomes, selectionne, la boussole pointe le biome le plus proche), but (base de l'exploration ; renvoi au chapitre exploration V3).

### W5 - Tip "Join the Community" (TIP Discord)
- id : `A136866BCA203769`
- role : tip Discord / ping roles.
- shape : `circle`, size `1.0`
- position : `x: 2.5d, y: 1.5d`
- icon : `minecraft:player_head` (ou `minecraft:paper` si player_head donne un rendu vide - config-writer choisit)
- task : `type: "checkmark"`
- dependencies : `["D5792F747EE0F514"]`
- optional : `true`
- reward : xp 15 inline (tip social, pas d'item ; leger bonus).
- intention desc : accroche (Steamon est une communaute), tip (lien Discord steamon, salons #how-to-join / #announcements, roles de ping opt-in), but (rester au courant des updates et events). quest-writer met le lien Discord reel dans la desc.

### W6 - Tip "Useful Commands & QoL" (TIP commandes)
- id : `C92DC14B3FD2A5A3`
- role : tip commandes utiles et QoL transverse.
- shape : `circle`, size `1.0`
- position : `x: -1.6d, y: 2.6d`
- icon : `minecraft:command_block` (si non donnable en survie, fallback `minecraft:oak_sign` - config-writer verifie ; l'icone n'a pas besoin d'etre donnable, juste au registre item).
- task : `type: "checkmark"`
- dependencies : `["D5792F747EE0F514"]`
- optional : `true`
- reward : xp 10 + `minecraft:torch` x8 inline (petit confort).
- intention desc : accroche (petits gestes qui changent tout), tip (liste courte : /back si dispo, sleep/phantom, la touche Ponder "W" de Create, ouvrir le smartphone Cobblemon, le HUD de capture), but (jouer confortablement). NB : ne pas dupliquer les 4 mecaniques de recolte (elles sont dans overworld, quete O-QOL). Ici on reste sur des commandes/raccourcis generaux.

### W7 - Tip "The Two Worlds" (TIP les 2 univers)
- id : `E2FD3EF613340EE1`
- role : tip qui pose explicitement Create vs Cobblemon et renvoie aux 2 portes (dans overworld).
- shape : `circle`, size `1.0`
- position : `x: 1.6d, y: 2.6d`
- icon : `create:cogwheel` (moitie Create ; l'autre univers est evoque en desc)
- task : `type: "checkmark"`
- dependencies : `["D5792F747EE0F514"]`
- optional : `true`
- reward : xp 15 + `create:andesite_alloy` x2 (clin d'oeil Create) OU `cobblemon:poke_ball` x1. Recommande : xp 15 + `numismatics:spur` x5 (neutre, ne favorise pas un univers).
- intention desc : accroche (deux mondes, un pack), tip (Create = machines/automatisation via rotational power ; Cobblemon = attraper/entrainer des Pokemon ; les deux se debloquent dans la Steamon Journey via 2 portes), but (choisir par quoi commencer, aucun ordre impose).

### W8 - Node fantome de convergence (CONNECTEUR invisible)
- id : `62975073AC885D99`
- role : ancre logique cachee, ferme proprement la grille sans polluer le visuel. Ne s'affiche jamais, n'est jamais completable a la main.
- shape : `none` (invisible de toute facon)
- position : `x: 0.0d, y: 4.5d` (sous la grille, hors champ visuel utile)
- icon : aucun
- task : `type: "checkmark"`
- flags : `invisible: true`, `optional: true`
- dependencies : `["567E86E514462ED3","6C7E421CADAC0FE5","58EDB0CCF666DD0C","A136866BCA203769","C92DC14B3FD2A5A3","E2FD3EF613340EE1"]` (les 6 tips usage), `min_required_dependencies: 1` (des qu'UN tip est fait, l'ancre est logiquement satisfaite ; ne bloque rien puisque optional+invisible).
- reward : aucun (node fantome).
- intention desc : aucune (invisible, pas de texte joueur).

## 3. quest_links (welcome)
Aucun dans welcome. Les 2 portes create/cobblemon sont dans overworld (decision master plan section 7).

## 4. Reward tables (welcome)
- Reutilise `first_steps_rewards` (id existant `300C2F87515349E9`) pour le tirage de la racine W0. Table deja au FORMAT B, contenu leger (poke_ball/spur/oran_berry/potion/candy). A garder telle quelle. Si le config-writer juge le contenu trop "cobblemon" pour un accueil neutre, ajouter 2 entrees survie (torches, pain) au FORMAT B `{id:"<hex16>", type:"item", item:{id:"minecraft:torch",count:8}, weight:15.0f}` et `{... minecraft:bread count:4 weight:12.0f}`. Ne pas creer de nouvelle table pour welcome.
- Tous les autres rewards welcome sont inline (xp + petits items), pas de table dediee.

## 5. Topologie visuelle (welcome)
Etoile a un centre. Racine hexagon size 3 au centre `(0,0)`. Anneau de 6 tips circle autour (W1 en haut, W2/W3 a gauche, W4/W5 a droite, W6/W7 en bas), rayon ~2.5. Node fantome W8 sous la grille en `(0,4.5)`. Lignes de dependance CACHEES (`default_hide_dependency_lines:true`) : la grille se lit comme un menu, pas comme une chaine. Symetrie stricte gauche/droite (W2<->W4, W3<->W5, W6<->W7). Aucun overlap : la size 3 de la racine occupe ~1.5 unite de rayon, les tips sont a 2.5, marge OK.

## 6. Cles lang a produire (welcome) - pour quest-writer
Prefixe `chapter.` et `quest.` selon le format ATMons (lang/en_us.snbt). Le config-writer confirme le namespace exact (ftbquests genere `quest.<id>.title` etc.).

- `chapter.E6E8E3EA674E6CD1.title` -> titre chapitre. Intention : "Welcome to Steamon", accueil.
- W0 `D5792F747EE0F514` : `.title` / `.quest_subtitle` / `.quest_desc`. Intention desc : pose les 2 univers + Discord + fil rouge Journey.
- W1 `63248C846CF59B64` : title/subtitle/desc. Intention : philosophie non-bloquante.
- W2 `567E86E514462ED3` : title/subtitle/desc. Intention : usage + upgrades du backpack.
- W3 `6C7E421CADAC0FE5` : title/subtitle/desc. Intention : usage waystone de spawn + return scroll.
- W4 `58EDB0CCF666DD0C` : title/subtitle/desc. Intention : usage natures-compass pour trouver un biome.
- W5 `A136866BCA203769` : title/subtitle/desc. Intention : rejoindre le Discord (lien reel).
- W6 `C92DC14B3FD2A5A3` : title/subtitle/desc. Intention : commandes/raccourcis QoL (sans doublonner la recolte).
- W7 `E2FD3EF613340EE1` : title/subtitle/desc. Intention : Create vs Cobblemon, 2 portes.
- W8 `62975073AC885D99` : AUCUNE cle (node fantome invisible, pas de texte).

---

# CHAPITRE 2 - OVERWORLD (The Steamon Journey)

## 1. Metadonnees chapitre

| Champ | Valeur |
|---|---|
| filename | `overworld` |
| id chapitre | `8082BDEB0536DB1D` |
| group | `3DBCC9E2D8397D4A` (Getting Started) |
| order_index | `1` |
| title in-game (cle lang) | `&aThe Steamon Journey` |
| icon | `minecraft:grass_block` |
| default_quest_shape | `hexagon` |
| default_hide_dependency_lines | `false` (le tronc DOIT montrer ses lignes : le joueur suit le chemin ; seuls quelques nodes de convergence cachent leurs traits en local via `hide_dependency_lines:true`) |
| progression_mode | herite global `flexible` (les deps imposent deja l'ordre du tronc ; le flexible autorise les branches laterales en parallele) |

Intention : la colonne vertebrale deterministe wood -> stone -> iron (fer fondu fusionne) -> outils fer -> diamant, puis nether portal, puis end. Archetype A3 (tronc + gate + eventail). Chemin critique 100% deterministe et borne. 2 portes quest_link laterales (Create a gauche/haut, Cobblemon a droite/bas) accrochees tot. QoL de recolte = 1 SEULE quete tip multi-pages en branche laterale. gravestone + magnum-torch = 2 tips lateraux optionnels. Fin de Journey = node "gear" a min_required_dependencies (N dimensions sur 4) qui ne bloque jamais.

Le tronc vertical descend en Y (y croissant vers le bas = progression). Branches laterales a gauche (x negatif) et droite (x positif). C'est un axe vertical, pas horizontal (corrige le layout v2 qui etait horizontal et melangeait wither skull/echo shard dans le tronc).

## 2. Layout - plan de grille (a lire avant les coords)

Axe principal (tronc) sur la colonne `x = 0`, du haut vers le bas :
```
 y=0    J-ROOT  (hexagon 2.5)   racine Steamon Journey
 y=2.5  J1      (hexagon 1.5)   wood + crafting table
 y=5    J2      (hexagon 1.5)   stone tools (mine_stone -> upgrade_tools)
 y=7.5  J3      (hexagon 1.5)   iron smelted (smelt_iron, fusion four+smelt)
 y=10   J4      (hexagon 1.5)   iron tools
 y=12.5 J5      (hexagon 1.5)   diamond (mine_diamond)
 y=15   J6      (hexagon 1.5)   nether portal (enter_the_nether)   = amorce dimension
 y=17.5 GATE-N  (gear 2.0)      convergence "into the depths": pointe nether/end
 y=20   J-END   (hexagon 2.5)   fin de la Steamon Journey (N dims sur 4)
```
Branches laterales (x != 0), accrochees a un maillon du tronc, alignees proprement :
```
 PORTE COBBLEMON  quest_link a droite, pres de J1 (accroche tot)   x=+3.5 y=2.5
 PORTE CREATE     quest_link a gauche, pres de J3 (apres le fer)    x=-3.5 y=7.5
 O-QOL   tip recolte (multi-pages)      x=+3.5  y=5      circle 1.5
 O-GRAVE tip gravestone (bloc craft)    x=-3.5  y=12.5   square 1.0
 O-MAGNUM tip magnum torch              x=+3.5  y=12.5   octagon 1.0
 GATE-NETHER link -> nether chapitre    x=-3.5 y=15  (quest_link, V3)
 GATE-END    link -> end chapitre       x=+3.5 y=17.5 (quest_link, V3)
```
Espacement vertical 2.5 (les hexagon 1.5 ont besoin de marge), horizontal 3.5 (branches loin du tronc pour lisibilite). 0 overlap. Lignes du tronc visibles, branches visibles aussi (peu nombreuses, restent lisibles).

## 3. Liste des quetes

### J-ROOT - Racine "The Steamon Journey" (TRONC)
- id : `38AE9C9E0567DD5C`
- role : racine de chapitre, tete du tronc.
- shape : `hexagon`, size `2.5`
- position : `x: 0.0d, y: 0.0d`
- icon : `minecraft:grass_block`
- task : `type: "checkmark"` (elle s'ouvre d'elle-meme ; la vraie progression commence a J1). Alternative : `type:"item" #minecraft:logs count:1` pour forcer le tout premier bois. Recommande : task item `#minecraft:logs` (tag) count 1 -> capte le J0 "premier bois" du plan sans creer un cran separe.
  - task retenue : `type:"item"`, `item:{ id:"#minecraft:logs", count:1 }` (tag item, config-writer met le format tag correct FTB : `item:"#minecraft:logs"` ou nbt tag selon parseur).
- dependencies : aucune.
- optional : `false`.
- reward : xp 10 + `minecraft:oak_log` x8 inline (relance le bois), OU tirage `journey_rewards` non (trop fort pour le debut). Recommande : xp 10 + oak_log x8.
- intention desc : accroche (tout grand voyage commence par un arbre), tip (casse du bois, la Journey te guide cran par cran ; chaque etape debloque la suivante), but (poser le premier pas deterministe).

### J1 - "Craft & Create" (TRONC : crafting table)
- id : `7723C8CD56413D01`
- role : maillon tronc, wood -> table de craft + pioche bois.
- shape : `hexagon`, size `1.5`
- position : `x: 0.0d, y: 2.5d`
- icon : `minecraft:crafting_table`
- tasks : deux items, `type:"item"` minecraft:crafting_table count 1 ET `type:"item"` minecraft:wooden_pickaxe count 1 (les deux, comme v2). consume_items:false.
- dependencies : `["38AE9C9E0567DD5C"]`
- optional : `false`.
- reward : xp 15 + `minecraft:coal` x8 inline (prepare le four).
- intention desc : accroche (l'outil qui debloque tout), tip (4 planches = table ; la pioche bois ouvre la pierre), but (avoir de quoi crafter et miner).

### J2 - "Stone Age" (TRONC : outils pierre)
- id : `1FC375EFCBACAF00`
- role : maillon tronc, pierre + outils pierre. Fusionne mine_stone et upgrade_tools en 1 cran (le plan permet de preferer advancement ; upgrade_tools implique deja d'avoir mine la pierre).
- shape : `hexagon`, size `1.5`
- position : `x: 0.0d, y: 5.0d`
- icon : `minecraft:stone_pickaxe`
- task : `type:"advancement"`, `advancement:"minecraft:story/upgrade_tools"`, criterion "".
- dependencies : `["7723C8CD56413D01"]`
- optional : `false`.
- reward : xp 20 + `minecraft:coal` x12 inline (charbon, cf idee reward J2/J3 du brief). Alternative : tirage `stone_collector_rewards` (existe, id `5EB21AE0CB9B32A8`) mais son contenu est cobblemon-pierres -> pas thematique ici. Recommande : xp 20 + charbon x12 inline.
- intention desc : accroche (la pierre, socle de tout), tip (mine de la cobblestone, upgrade tes outils bois en pierre), but (durabilite et acces au fer).

### J3 - "Iron Will" (TRONC : fer fondu, fusion four+smelt)
- id : `9420BFEF9297CA54`
- role : maillon tronc, four + premier lingot de fer. Fusionne "construire un four" et "fondre du fer" en 1 cran via smelt_iron (le plan dit : fusionner four+smelt en 1 cran).
- shape : `hexagon`, size `1.5`
- position : `x: 0.0d, y: 7.5d`
- icon : `minecraft:iron_ingot`
- task : `type:"advancement"`, `advancement:"minecraft:story/smelt_iron"`, criterion "".
- dependencies : `["1FC375EFCBACAF00"]`
- optional : `false`.
- reward : xp 50 + tirage table uncommon (accelerateur). Recommande : xp 50 + `minecraft:bucket` x1 + tirage `journey_rewards`? non (journey_rewards est endgame). Utiliser un item inline utile : `minecraft:iron_ingot` x4 + `minecraft:bucket` x1 + xp 50. Le brief dit "accelerateur/table uncommon" ; comme on n'a pas de table uncommon dediee overworld, config-writer peut soit rester inline (recommande), soit creer une petite table `journey_early_rewards` (voir section reward tables).
- intention desc : accroche (le metal qui change une civilisation), tip (construis un four, cuis le minerai brut ; le seau ouvre l'eau/lave et le nether plus tard), but (equiper le fer).
- NB PORTE CREATE accrochee ici (voir quest_links) : apres J3 le joueur a du fer, condition confortable pour decouvrir Create.

### J4 - "Tools of the Trade" (TRONC : outils fer)
- id : `E88560D89D5A44CB`
- role : maillon tronc, outils fer.
- shape : `hexagon`, size `1.5`
- position : `x: 0.0d, y: 10.0d`
- icon : `minecraft:iron_pickaxe`
- task : `type:"advancement"`, `advancement:"minecraft:story/iron_tools"`, criterion "".
- dependencies : `["9420BFEF9297CA54"]`
- optional : `false`.
- reward : xp 50 + `minecraft:iron_ingot` x6 + `numismatics:spur` x1 inline.
- intention desc : accroche (le fer taille la pierre et la profondeur), tip (pioche fer = acces au diamant, a la redstone, aux minerais profonds), but (descendre miner en securite).

### J5 - "Diamonds Are Forever" (TRONC : diamant)
- id : `26D544BAA33397E4`
- role : maillon tronc, premier diamant.
- shape : `hexagon`, size `1.5`
- position : `x: 0.0d, y: 12.5d`
- icon : `minecraft:diamond`
- task : `type:"advancement"`, `advancement:"minecraft:story/mine_diamond"`, criterion "".
- dependencies : `["E88560D89D5A44CB"]`
- optional : `false`.
- reward : xp 100 + outil pre-enchante via components (jamais un diamant brut : regle reward != objectif). Recommande : `minecraft:diamond_pickaxe` avec component `minecraft:enchantments` {efficiency:2, unbreaking:1} + xp 100. FORMAT reward item inline avec components (config-writer ecrit la structure components ftbquests). Alternative si component trop lourd : tirage d'une table rare `journey_rewards` (existe deja, endgame-ish mais acceptable en 1 tirage ici).
- intention desc : accroche (la pierre precieuse la plus utile du jeu), tip (mine profond niveau Y -59, attention a la lave ; le diamant ouvre l'enclume, l'obsidienne, l'equipement de pointe), but (s'equiper pour les dimensions).

### J6 - "Gateway to Hell" (TRONC : nether portal)
- id : `C456DE3D938F58E2`
- role : maillon tronc, portail nether (amorce dimension). Reste dans overworld comme jalon d'entree, le contenu nether vit dans le chapitre nether (V3).
- shape : `hexagon`, size `1.5`
- position : `x: 0.0d, y: 15.0d`
- icon : `minecraft:obsidian`
- task : `type:"advancement"`, `advancement:"minecraft:story/enter_the_nether"`, criterion "".
- dependencies : `["26D544BAA33397E4"]`
- optional : `false`.
- reward : xp 100 + kit nether leger inline : `minecraft:cooked_beef` x8 + `minecraft:flint_and_steel` x1 + `numismatics:spur` x1.
- intention desc : accroche (le premier autre monde), tip (10 obsidiennes minimum, briquet, allume ; le nether = quartz, blaze, or, netherite), but (ouvrir la porte des dimensions ; la suite se joue dans le chapitre The Nether).

### GATE-N - "Into the Depths" (CONVERGENCE : porte dimensions)
- id : `7081A84E2ED86395`
- role : node de convergence a saveur "gate". Point d'ancrage des 2 gates de dimension (nether/end) et pivot vers la fin de Journey. Ce node reste dans overworld ; les vrais gates `type:dimension` vivent dans les chapitres nether/end (V3), overworld POINTE vers eux via quest_link.
- shape : `gear`, size `2.0`
- position : `x: 0.0d, y: 17.5d`
- icon : `create:brass_ingot` (saveur Create pour le gear ; ou `minecraft:ender_eye`). Recommande `minecraft:ender_eye` (thematique dimension/end a venir).
- task : `type:"advancement"`, `advancement:"minecraft:story/follow_ender_eye"`, criterion "" (deterministe borne : le stronghold est localise par lancer d'yeux, borne par natures-compass ; valide non-bloquant par le plan).
  - NB : J7 stronghold et J-END entree-du-End sont ici fusionnes/enchaines. follow_ender_eye = trouver le stronghold. L'ENTREE du End (`minecraft:end/root`) est le vrai gate END et vit dans le chapitre end (V3) ; overworld pointe vers.
- dependencies : `["C456DE3D938F58E2"]`
- optional : `false` (deterministe borne).
- reward : xp 100 + `minecraft:ender_pearl` x4 + `minecraft:blaze_powder` x4 inline (de quoi fabriquer des yeux, coherent avec l'objectif).
- intention desc : accroche (le seuil des mondes profonds), tip (yeux de l'ender = ender pearl + blaze powder ; lance-les pour trouver le stronghold ; la boussole de biomes aide), but (converger vers l'End et clore la Journey).

### J-END - "Journey's End" (FIN DE STEAMON JOURNEY, node non-bloquant)
- id : `5528A682AF93D1A6`
- role : node terminal de la Steamon Journey. Ne bloque JAMAIS : exige N dimensions sur 4 via min_required_dependencies (ex 2 sur 4). Depend des gates de dimension qui vivent dans les chapitres V3 ; en V1 on cable les deps sur les nodes overworld disponibles + on prevoit les liens de production. Voir note de production.
- shape : `gear`, size `2.5` (distincte, surdimensionnee, cloture de chapitre).
- position : `x: 0.0d, y: 20.0d`
- icon : `minecraft:dragon_egg` (trophee de fin ; coherent avec `journey_rewards` dont l'icone est dragon_egg).
- task : `type:"advancement"`, `advancement:"minecraft:end/root"`, criterion "" (entrer dans l'End = le vrai jalon terminal deterministe borne de la Journey vanilla).
- dependencies (V1, non-bloquant) : `["7081A84E2ED86395"]` (GATE-N) en dep dure. En V3, ajouter en deps les gates de dimension nether/end/aether/otherside et passer `min_required_dependencies` a 2 (2 dims sur 4). Voir note production ci-dessous.
- optional : `false` (mais rendu non-bloquant par le fait que son unique prerequis dur est deterministe ; les dims optionnelles viendront en OR via min_required_dependencies en V3).
- reward : le plus gros de la Journey. xp_levels 5-10 + tirage `journey_rewards` (epic, existe id `102F9B9151F548D8`) + PREMIERE recompense Numismatics graduee : `numismatics:sun` x1 (type item, FORMAT B), petit palier. Structure : `type:"xp_levels" xp_levels:8` + `type:"random" table_id:<journey_rewards en long>L` + `type:"item" numismatics:sun count:1`.
- intention desc : accroche (tu as traverse le monde, du premier arbre a l'autre bout du reel), tip (la Journey est finie ; le reste du pack -- Create, Cobblemon, Aether, Otherside, la League -- t'attend en post-game), but (jalon de prestige ; premiere vraie monnaie Numismatics).

### Branche laterale : O-QOL - "Work Smarter" (TIP recolte, multi-pages)
- id : `3043C909D31355DE`
- role : LA quete unique qui explique les 4 mecaniques PASSIVES de recolte. Branche laterale, hors chaine verticale critique. Multi-pages ({@pagebreak}) : 1 checkmark, 4 mecaniques expliquees.
- shape : `circle`, size `1.5`
- position : `x: 3.5d, y: 5.0d` (a droite, entre J2 et J3)
- icon : `minecraft:iron_hoe` (recolte) ou `veinmining:...` non craftable ; recommande `minecraft:diamond_pickaxe` non (deja pris) -> `minecraft:iron_hoe`.
- task : `type:"checkmark"`.
- dependencies : `["7723C8CD56413D01"]` (accessible tot, des J1).
- optional : `true` (branche QoL, jamais bloquante).
- reward : houe fer + graines + os, PAS l'enchantement veinmining. Inline : `minecraft:iron_hoe` x1 + `minecraft:wheat_seeds` x8 + `minecraft:bone_meal` x8 + xp 20.
- intention desc (multi-pages) :
  - page 1 accroche : "Steamon adoucit la corvee. Voici 4 automatismes."
  - page 2 : `veinmining` -- ENCHANTEMENT veinmining:veinmining (max niv 3) a mettre sur une pioche (voie vanilla enchant table/anvil) ; mine une veine entiere d'un coup.
  - page 3 : `tree-harvester` (passif) -- abat l'arbre entier et REPLANTE automatiquement ; `universal-bone-meal` (passif) -- la farine d'os agit sur bien plus de blocs.
  - page 4 : `rightclickharvest` (passif) -- clic droit sur une culture mure recolte ET replante d'un geste. NB cut-through N'EXISTE PAS (retire), ne pas le mentionner.
  - but : gagner du temps de survie.

### Branche laterale : O-GRAVE - "Death Insurance" (TIP gravestone)
- id : `D563B85D7AE2D984`
- role : tip gravestone. La tombe apparait automatiquement a la mort ; on peut aussi crafter le bloc.
- shape : `square`, size `1.0` (craft de survie)
- position : `x: -3.5d, y: 12.5d` (a gauche, au niveau du diamant)
- icon : `gravestone:gravestone`
- task : `type:"item"`, `item:{ id:"gravestone:gravestone", count:1 }` (craft C_/C_/DDD cobblestone+dirt, deterministe pas cher). consume_items:false.
- dependencies : `["E88560D89D5A44CB"]` (apres les outils fer, quand on descend miner et risque de mourir).
- optional : `true`.
- reward : torches + food (PAS une gravestone). Inline : `minecraft:torch` x16 + `minecraft:cooked_beef` x6 + xp 20.
- intention desc : accroche (mourir sans tout perdre), tip (a la mort une tombe garde ton stuff ; clic droit pour recuperer ; le bloc se craft aussi cobblestone+dirt), but (miner l'esprit tranquille).

### Branche laterale : O-MAGNUM - "Hold the Line" (TIP magnum torch)
- id : `A4599F985915BA78`
- role : tip magnum-torch (anti-hostiles, protege la base). Obtention en overworld ; l'usage reseau/exploration renvoye a V3.
- shape : `octagon`, size `1.0` (bloc utilitaire de survie a placer)
- position : `x: 3.5d, y: 12.5d` (a droite, au niveau du diamant)
- icon : `magnumtorch:diamond_magnum_torch`
- task : `type:"item"`, `item:{ id:"magnumtorch:diamond_magnum_torch", count:1 }` (recette mid-game a base de fire_charge ; deterministe borne, accessible apres le fer/diamant). consume_items:false.
- dependencies : `["26D544BAA33397E4"]` (apres le diamant, mid-game).
- optional : `true`.
- reward : gold + amethyst (PAS une torch). Inline : `minecraft:gold_ingot` x4 + `minecraft:amethyst_shard` x4 + xp 30.
- intention desc : accroche (une base ou rien ne spawn), tip (la magnum torch bloque le spawn des hostiles dans un large rayon spherique ; 3 tiers, le diamant couvre le plus large), but (securiser sa base sans spammer des torches ; reseau vu au chapitre exploration).

## 4. quest_links (overworld) - AVEC notes de production V2/V3

Les quest_links pointent vers des racines de chapitres pas encore ecrits. Le config-writer les pose avec le `linked_quest` = id racine CIBLE ci-dessous, et laisse le lien inactif tant que le chapitre cible n'existe pas (FTB tolere un linked_quest orphelin : il n'affiche rien tant que la cible n'est pas chargee). Activation reelle a la Vague 2 (create_1, cobblemon_1) et Vague 3 (nether, end).

### PORTE COBBLEMON (V2)
- quest_link id : `3A02A19D4EF0E25E`
- linked_quest CIBLE : racine du chapitre cobblemon_1 = **`4EFD1A480A12986D`** (id a reserver comme `id` de la racine cobblemon_1 quand quest-architect blueprintera cobblemon_1 en Vague 2 ; a defaut, aligner sur l'id racine reel de cobblemon_1).
- shape : `pentagon` (forme dediee Cobblemon), size `1.5`
- position : `x: 3.5d, y: 2.5d` (a droite, tot, des J1)
- note production : DEPENDANCE DE PRODUCTION V2. Tant que cobblemon_1 n'est pas ecrit, ce lien pointe dans le vide (inoffensif). Quand cobblemon_1 est blueprinte, sa racine DOIT porter l'id `4EFD1A480A12986D` (ou le config-writer met a jour ce linked_quest avec l'id reel). L'orchestrator tranche : soit on fige `4EFD1A480A12986D` comme id canonique de la racine cobblemon_1, soit on repasse ici en V2.

### PORTE CREATE (V2)
- quest_link id : `7B9BA962C45CD841`
- linked_quest CIBLE : racine du chapitre create_1 = **`5D00FEC7C79E27E1`** (id a reserver comme `id` de la racine create_1 en Vague 2 ; a defaut aligner sur l'id racine reel de create_1).
- shape : `gear` (forme dediee Create), size `1.5`
- position : `x: -3.5d, y: 7.5d` (a gauche, apres le fer J3)
- note production : DEPENDANCE DE PRODUCTION V2. Meme regle : create_1 racine doit porter `5D00FEC7C79E27E1`, ou mise a jour ici.

### GATE NETHER (V3)
- quest_link id : `525E4F2EE40A3077`
- linked_quest CIBLE : le node gate `type:dimension minecraft:the_nether` du chapitre nether = **`36F75F3A69E5E07F`** (id a reserver pour ce gate en Vague 3).
- shape : `hexagon` (forme dediee Dimension), size `2.0`
- position : `x: -3.5d, y: 15.0d` (a gauche, au niveau de J6 nether portal)
- note production : DEPENDANCE DE PRODUCTION V3. Le vrai gate `type:dimension` vit dans nether.snbt. overworld ne fait que POINTER. A activer quand nether est ecrit.

### GATE END (V3)
- quest_link id : `7DC8B35D752B3FB9`
- linked_quest CIBLE : le node gate `minecraft:end/root` du chapitre end = **`9135F25ABC2A5D26`** (id a reserver pour ce gate en Vague 3). NB : J-END overworld porte deja end/root comme jalon terminal de la Journey ; le chapitre end aura son propre gate detaille. Le lien overworld->end pointe vers l'eventail post-gate du chapitre end, pas vers J-END.
- shape : `hexagon`, size `2.0`
- position : `x: 3.5d, y: 17.5d` (a droite, au niveau de GATE-N)
- note production : DEPENDANCE DE PRODUCTION V3.

Recap ids CIBLES a figer (a communiquer a l'orchestrator pour coherence inter-vagues) :
- racine create_1 = `5D00FEC7C79E27E1`
- racine cobblemon_1 = `4EFD1A480A12986D`
- gate nether (type:dimension the_nether) = `36F75F3A69E5E07F`
- gate end (end/root, eventail) = `9135F25ABC2A5D26`

## 5. Reward tables (overworld)

- `journey_rewards` (id existant `102F9B9151F548D8`, FORMAT B, icone dragon_egg, contenu epic : cog/master_ball/rare_candy/precision_mechanism/netherite_ingot/crown) : utilisee UNIQUEMENT par J-END (`5528A682AF93D1A6`), 1 tirage. table_id en long : convertir `102F9B9151F548D8` en decimal signe + `L` (le config-writer calcule ; valeur = 1166321876959840472L d'apres l'usage v2 existant du meme id de table au node kill_dragon -- A RE-VERIFIER par le config-writer, car en v2 ce long etait associe a un autre id ; recompute obligatoire).
- Tous les autres rewards overworld sont INLINE (xp + items de progression coherents). Pas besoin de nouvelle table pour le tronc.
- OPTION (a la main du config-writer) : creer une petite table `journey_early_rewards` (nouvel id hex, FORMAT B, tier uncommon : iron_ingot, bucket, coal, apple, saddle faible poids) pour J3/J4 au lieu d'inline, si on veut de la variance. NON obligatoire ; l'inline suffit et reste lisible. Si creee : `id` neuf `4E46EE8BA9F02432`, `loot_size:1`, `use_title:true`, entrees FORMAT B.

Rappel FORMAT B au config-writer (le SEUL valide) :
```
reward table entry : { id:"<hex16_unique>", type:"item", item:{ id:"<ns:item>", count:N }, weight:<f> }
lien quete->table : { id:"<hex16_unique>", type:"random", table_id:<long_signed>L }
```
Le format a-plat sans `type` est INVALIDE (bug "Air").

## 6. Topologie visuelle (overworld)

Colonne verticale unique sur `x=0` : J-ROOT (2.5) -> J1 -> J2 -> J3 -> J4 -> J5 -> J6 -> GATE-N (gear 2.0) -> J-END (gear 2.5). Lignes de dependance VISIBLES sur toute la colonne (le joueur lit le chemin de haut en bas). C'est un tronc DROIT et lisible, pas un losange (le losange branch-and-converge est reserve aux chapitres univers ; ici la Journey est une echelle).

Branches laterales symetriques accrochees au tronc, lignes visibles (peu nombreuses) :
- droite : PORTE COBBLEMON (pentagon, y=2.5), O-QOL (circle, y=5), O-MAGNUM (octagon, y=12.5), GATE END (hexagon, y=17.5).
- gauche : PORTE CREATE (gear, y=7.5), O-GRAVE (square, y=12.5), GATE NETHER (hexagon, y=15).

Equilibre gauche/droite : 3 elements a gauche, 4 a droite (acceptable ; on peut deplacer O-QOL a gauche si l'orchestrator veut 3/3 strict, mais O-QOL a droite equilibre le vide sous la PORTE COBBLEMON). Aucun overlap : colonne a x=0, branches a x=+/-3.5, ecart 3.5 > 1.5 requis ; verticalement pas de collision (les branches tombent sur des y du tronc mais decalees en x).

Convergence : GATE-N (gear) recoit le tronc et rassemble symboliquement les gates ; J-END recoit GATE-N (et en V3 les gates dims en min_required_dependencies). Aucun node de convergence a beaucoup de deps ici, donc pas besoin de `hide_dependency_lines` local (sauf J-END en V3 quand il aura 4-5 deps : lui mettre `hide_dependency_lines:true` a ce moment).

## 7. Cles lang a produire (overworld) - pour quest-writer

- `chapter.8082BDEB0536DB1D.title` -> "The Steamon Journey".
- J-ROOT `38AE9C9E0567DD5C` : title/subtitle/desc. Intention : premier pas, le bois, le tronc guide.
- J1 `7723C8CD56413D01` : title/subtitle/desc. Intention : table de craft + pioche bois.
- J2 `1FC375EFCBACAF00` : title/subtitle/desc. Intention : pierre + outils pierre.
- J3 `9420BFEF9297CA54` : title/subtitle/desc. Intention : four + fer fondu (fusion four+smelt).
- J4 `E88560D89D5A44CB` : title/subtitle/desc. Intention : outils fer.
- J5 `26D544BAA33397E4` : title/subtitle/desc. Intention : diamant, miner profond.
- J6 `C456DE3D938F58E2` : title/subtitle/desc. Intention : portail nether.
- GATE-N `7081A84E2ED86395` : title/subtitle/desc. Intention : yeux de l'ender, stronghold, seuil des dims.
- J-END `5528A682AF93D1A6` : title/subtitle/desc. Intention : fin de la Journey, prestige, post-game.
- O-QOL `3043C909D31355DE` : title/subtitle/desc MULTI-PAGES (4 pages, voir intention detaillee ci-dessus). Intention : 4 mecaniques passives de recolte.
- O-GRAVE `D563B85D7AE2D984` : title/subtitle/desc. Intention : gravestone, mourir sans tout perdre.
- O-MAGNUM `A4599F985915BA78` : title/subtitle/desc. Intention : magnum torch, securiser la base.
- quest_links : PAS de cles lang (un quest_link n'a pas de texte propre ; il affiche le titre de la quete liee).

---

# NOTES TRANSVERSES (les deux chapitres)

## Anti-repetition (registre section 3) - controle
- waystone : enseignee en USAGE ici (welcome W3). Le craft complet et le reseau vivent en exploration (V3). Overworld ne re-enseigne pas la waystone. OK.
- natures-compass : craft ici (welcome W4), usage/reseau exploration V3. OK.
- backpack : USAGE ici (welcome W2). storage_util (Life & Style V5) enseignera les upgrades avances. Pas de doublon (ici = tip d'usage de base). OK.
- 4 mecaniques de recolte : 1 SEULE quete O-QOL (overworld). Aucune autre quete du pack ne les redemande. OK. (registre 6.1 storage/util ligne veinmining -> overworld).
- gravestone : tip ici (overworld O-GRAVE, obtention/usage de base). adventure_loot (V5) le mentionne en tip renvoi seulement, ne le re-enseigne pas. OK (registre 6.1).
- magnum-torch : obtention ici (overworld O-MAGNUM). exploration (V3) traite le reseau/usage avance. Pas de doublon d'obtention. OK.
- advancements vanilla (mine_stone/upgrade_tools/smelt_iron/iron_tools/mine_diamond/enter_the_nether/follow_ender_eye/end/root) : n'appartiennent a aucun chapitre mod, usage legitime dans le tronc. Aucun autre chapitre ne les reutilise (les dims utilisent type:dimension et leurs propres advancements). OK.
- La quete W7 (Two Worlds) et les portes quest_link ne CRAFTENT rien de Create/Cobblemon : elles pointent. Aucun item Create/Cobblemon detaille ici (respect de la consigne). OK.

## Non-blocage (section 4) - controle
- Tronc overworld 100% deterministe borne : logs, crafting_table, advancements vanilla story/*, obsidian, follow_ender_eye (borne par eye-throwing + boussole), end/root. Aucun RNG lourd, aucun drop < 5%, aucune structure ultra-rare requise. OK.
- wither_skull : ABSENT du tronc (contrairement a la v2 qui le mettait en ligne). Il vivra en branche optionnelle du chapitre nether (V3). OK.
- echo_shard / ancient debris / netherite : ABSENTS du tronc overworld. Renvoyes aux chapitres dims/nether en branches. OK.
- J-END exige, en V3, N dims sur 4 via min_required_dependencies (2/4) : ne bloque jamais sur aether/otherside. En V1 son unique dep dure est GATE-N (deterministe). OK.
- Tous les tips lateraux (O-QOL, O-GRAVE, O-MAGNUM) et tous les tips welcome sont optional:true : ils ne bloquent aucun enfant. OK.

## Dependances de production (recap pour l'orchestrator)
1. welcome et overworld peuvent etre ecrits MAINTENANT (Vague 1). Aucun de leurs nodes internes ne depend d'un chapitre externe.
2. Les 4 quest_links d'overworld pointent vers des cibles a figer :
   - create_1 racine = `5D00FEC7C79E27E1` (Vague 2)
   - cobblemon_1 racine = `4EFD1A480A12986D` (Vague 2)
   - gate nether = `36F75F3A69E5E07F` (Vague 3)
   - gate end = `9135F25ABC2A5D26` (Vague 3)
   Le config-writer pose les quest_links avec ces linked_quest ; ils restent inertes jusqu'a ce que les cibles existent. Quand create_1/cobblemon_1/nether/end sont blueprintes, leur racine/gate DOIT porter l'id cible correspondant (l'orchestrator fige ces ids), sinon repasser mettre a jour les linked_quest.
3. J-END : en V3, ajouter en dependencies les gates de dimension et passer min_required_dependencies a 2. En V1, dep dure unique = GATE-N.

## Verifications residuelles a faire par le config-writer avant ecriture (via quest-mc-knowledge)
- `naturescompass:naturescompass` donnable et craftable (recette sapling+log+compass).
- `gravestone:gravestone` bloc craftable (C_/C_/DDD).
- `magnumtorch:diamond_magnum_torch` au registre + recette fire_charge.
- `sophisticatedbackpacks:backpack`, `waystones:waystone`, `waystones:return_scroll`, `numismatics:sun`, `numismatics:spur` donnables.
- `veinmining:veinmining` = ENCHANTEMENT (pas un item task) : O-QOL est bien un checkmark, pas une task d'enchant. Ne pas creer de task "obtiens l'enchantement".
- advancement ids exacts (tous confirmes present/non-overrides par la matiere verrouillee) ; re-check story/upgrade_tools, story/smelt_iron, story/follow_ender_eye, end/root.
- icones non donnables (command_block, player_head) : verifier qu'elles s'affichent (icone n'a pas besoin d'etre donnable, juste au registre).
- table_id long de `journey_rewards` : recomputer depuis l'hex `102F9B9151F548D8` (ne pas copier aveuglement le long v2).

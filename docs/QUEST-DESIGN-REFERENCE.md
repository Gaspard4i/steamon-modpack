# QUEST-DESIGN-REFERENCE.md

Bible de design des quetes FTB du modpack **Steamon** (Create x Cobblemon, MC 1.21.1 NeoForge).
Synthese des PATTERNS extraits des modpacks de reference audites (ATMons, BigChadGuys Plus, Prominence II, Mayview), transposes a Steamon.

**Statut** : inspiration, pas copie. Ces packs sont All Rights Reserved et n'ont PAS les memes mods que Steamon. On transpose les principes, jamais le contenu (textes, IDs, structures exactes).

**Regle de style de CE doc** : jamais de tiret cadratin. Exemples cites en anglais (vrais textes des refs), corps du doc en francais.

**Sources auditees** (chemins absolus) :
- `modpack/docs/quest-references/ATMons/` (ATM10 + Cobblemon, LE plus pertinent : Create + tech + Cobblemon + RCTMod + Deeper Darker + Aquaculture). Textes joueur dans `lang/en_us/chapters/`.
- `modpack/docs/quest-references/BigChadGuys-Plus-Modrinth/` (Create + Cobblemon + Farmer's Delight + economie + Aether/End). Textes INLINE dans le SNBT. Le plus proche du perimetre Steamon.
- `modpack/docs/quest-references/Prominence-II-Hasturian-Era/` (RPG lore-driven, chapter_groups par meta-theme).
- `modpack/docs/quest-references/Mayview/` (Create + Farmer's Delight, plus leger).

---

## 0. Rappel des regles de design Steamon (a promouvoir dans chaque chapitre)

Ces regles sont deja etablies (voir memoire `steamon-quest-design-rules`). Elles PRIMENT sur tout pattern des refs.

1. **Reward != objectif** : ne jamais donner en reward l'item exact demande par la task. Reward logique et varie (materiau lie, item de progression, utilitaire). Seule exception toleree : les items "a farmer" ou l'on veut encourager le stock (les refs le font sur les pierres d'evolution, reward = pierre x3).
2. **Description obligatoire en 3 temps** : accroche/lore -> tip/mecanique -> but/pourquoi c'est un jalon. Chaque quete non triviale a une description.
3. **Anti-repetition inter-sections** : un item/mecanique enseigne dans un seul chapitre. Pas de doublon de task ou de tip entre chapitres.
4. **Non-blocage du tronc** : tout objectif RNG, rare, long ou dependant du hasard va en BRANCHE optionnelle (`optional: true`, hors chemin critique). Le tronc principal reste deterministe et borne.
5. **Couvrir tous les mods** : chaque mod du pack a sa presence en quete (au moins un tip). Voir la liste des univers Steamon plus bas.
6. **Split culinary** : Farmer's Delight base et ses addons (Nether's/Aether's/End's/Miner's/Cultural, Brewin') se decoupent en sections coherentes, sans repetition de recettes entre elles.
7. **Jackpot Myths & Legends** : les key items/legendaires M&L sont des rewards jackpot ultra-rares en branche optionnelle, jamais dans le tronc.
8. **Reward table au FORMAT B (imbrique avec type)** : `{ id:'<hex16_unique>', type:'item', item:{ id, count }, weight }`. Le format a-plat sans `type` est INVALIDE (bug "Air"). Voir section 3.5.

---

## 1. Decoupage en chapitres et groupes

### 1.1 Deux niveaux : chapter_groups (onglets) + chapters (fichiers)

`chapter_groups.snbt` liste les grands onglets ; chaque `chapters/*.snbt` est un chapitre place dans un groupe via son champ `group`.

**ATMons** : 11 groupes, un chapitre par mod (`create.snbt`, `ars_nouveau.snbt`, `mekanism.snbt`...). Approche "un mod = un chapitre". Beaucoup de chapitres (60+), granularite fine.

**BigChadGuys** (le modele a suivre pour Steamon) : groupes par DOMAINE fonctionnel, titres colores :
```
{ id: "...", title: "&6BigChadGuys Plus" }      (tronc / intro)
{ id: "...", title: "&bCommunity Quests" }
{ id: "...", title: "&cCobblemon" }
{ id: "...", title: "&2Agriculture" }
{ id: "...", title: "&6Food &fand &6Drink" }
{ id: "...", title: "&9Homemaking" }            (deco/mobilier)
{ id: "...", title: "&bStorage" }
{ id: "...", title: "&aTransportation" }
{ id: "...", title: "&4The Nether" }
{ id: "...", title: "&5The End" }
{ id: "...", title: "&6Create &f(&bComing Soon&f)" }
```
Source : `BigChadGuys-Plus-Modrinth/chapter_groups.snbt`.

**Prominence II** : groupes par META-theme narratif, pas par mod :
```
Tutorials / Campaign / Seasonal Events / Realms / Combat & Gear / Magic / Tech / Quest To Eternal Knowledge
```
Source : `Prominence-II-Hasturian-Era/chapter_groups.snbt`. Interessant pour un pack a fil rouge fort.

### 1.2 Taille moyenne d'un chapitre

Observe dans ATMons :
- Chapitre "hub d'entree" (getting_started Cobblemon) : ~40 quetes (dont 18 type-gems en grille).
- Chapitre mod moyen (create) : ~50 quetes item.
- Chapitre dimension (deeper_and_darker) : ~48 quetes, le plus dense.
- Chapitre collection (catch_em_all fossiles) : ~34 quetes.
- Chapitre tips/QoL (tips_and_tricks) : ~28 quetes independantes.

**Recommandation Steamon** : viser 20 a 50 quetes par chapitre. En dessous de 15 : fusionner. Au dessus de 55 : scinder (ex. Create base vs Create automation vs Create trains).

### 1.3 Tronc principal vs branches (ratio observe)

Les refs NE font PAS un unique tronc lineaire geant. Le motif dominant est :
- **un tronc court** (chaine lineaire de 4 a 8 quetes deterministes) qui mene a un **node gate**,
- puis un **eventail** de quetes secondaires qui rayonnent, souvent cachees jusqu'au passage du gate.

Ratio approximatif obligatoire/optionnel dans un chapitre : ~60% sur le tronc + eventail deterministe, ~40% en branches libres/optionnelles/niche.

`progression_mode` (dans `data.snbt` global OU par chapitre) :
- `"flexible"` (ATMons, food/tips) = ordre libre, le joueur pioche.
- `"linear"` (BigChadGuys global) = ordre impose par les deps, `lock_message: "Complete the previous quests!"`.

**Recommandation Steamon** : `flexible` par defaut (2 univers a explorer en parallele Create/Cobblemon), `linear` seulement sur une eventuelle chapitre-tutoriel d'intro.

### 1.4 Quatre archetypes de chapitre (a piocher selon le mod)

1. **Grille de collection + gate "one_completed"**. N quetes identiques sans deps -> un node convergent avec `dependency_requirement: "one_completed"` + `hide_dependency_lines: true`. Ex ATMons catch_em_all : 23 quetes-fossiles (task `structure`) convergent sur un node "Archeology" (task = crafter une brush) qui exige "au moins UN fossile trouve". Transposable a "attrape un Pokemon de chaque type".
2. **Paire biome -> item en eventail**. Quete `biome` (shape octagon, "ou trouver") debloque une quete `item` (l'obtenir). Ex ATMons evolution : 10 paires pierre d'evolution. Directement portable (meme mod cobblemon, memes tags).
3. **Tronc gate -> eventail post-gate cache**. Chaine lineaire courte jusqu'a un node gear size 2.0 = le gate (souvent `type: "dimension"`), puis explosion de quetes cachees par `hide_until_deps_complete: true`. Ex ATMons deeper_and_darker (ancient_city -> kill warden -> heart_of_the_deep -> GATE otherside -> 4 biomes hubs -> ~30 quetes). Parfait pour Aether, Deeper Darker/Otherside, Nether, End de Steamon.
4. **Grille de bounties independants + checkmark convergence**. Quetes-racines libres, un node checkmark a ~8 deps + `hide_dependency_lines`. Ex ATMons tips_and_tricks. Parfait pour un chapitre "decouverte des mods / QoL / tips".

---

## 2. Patterns de redaction (exemples reels cites)

### 2.1 Structure d'un texte de quete

Trois champs joueur :
- `title` : court, colore, souvent avec le nom de l'item/mecanique en couleur.
- `subtitle` : une ligne. Sert de PUNCHLINE / accroche / one-liner. C'est la que le ton passe.
- `description` : le corps. 1 phrase (contenu trivial) a plusieurs paragraphes (mecanique complexe).

Dans ATMons, titres et descriptions sont dans `lang/en_us/chapters/*.snbt` (cle `quest.<ID>.title`, `.quest_subtitle`, `.quest_desc`). Dans BigChadGuys, ils sont INLINE dans le SNBT du chapitre. Steamon suivra le modele ATMons (lang separe) pour faciliter une future trad.

### 2.2 Le patron "accroche -> tip mecanique -> but" (long, pour les mecaniques)

Exemple reel, ATMons Create, l'Encased Fan (`create.snbt` lang, quest `1E9B2D814F50A265`), subtitle = `"This blows!"` :
```
The &6Encased Fan&r is one of the most underrated Machines in &6&lCreate&r.

You can place it down and it'll face you, or Shift Right Click to place it facing away from you.

When given &dRotational Power&r &e&oClockwise&r, it will blow air away from it. When given &dRotational Power&r &9&oCounter-Clockwise&r it will suck air toward it. [...]

We can use &cLava&r to &6Blast&e Items&r like a Furnace. [...] If we put Fire in front of the Fan we can Smoke Items. [...] instead of Lava we can also place Water in front of it. This will wash whatever is in front of it like Concrete Powder into Concrete. [...]
```
Structure : phrase d'accroche (pourquoi c'est utile/sous-cote) -> comment ca marche precisement (sens de rotation, placement) -> ce que ca debloque (recettes blast/smoke/wash/haunt). C'est LE modele pour toute machine Create de Steamon.

Autre exemple, ATMons Create, le Deployer (`create.snbt` lang, quest `3314FBC4FEAE1D08`), subtitle = `"Poke"` :
```
&6Deployer&r is a very fun &6Machine&r for poking!

By poking, I mostly mean &eItem Interactions&r that we can preform. Place an &eItem&r into the &6Deployer Hand&r, and then give it &dRotational Power&r. It will then place the &eItem&r into the Block on a &eDepot&f or &eBelt&r below.

This will mimick many actions that we can do, like adding &6Wax&r to &cCopper&r.

You'll most likely use it for &8Andesite&r/&cCopper&r/&eBrass&r Casings and &4Polished Rose Quartz&r.
```

### 2.3 Le patron Cobblemon core (pedagogique, ton familier)

Exemple reel, ATMons getting_started, le PC (`getting_started.snbt` lang, quest `3932FF3765BFACD3`) :
```
The &9PC&r is a Machine for Storing &cPokemon&r.

It has 30 Boxes each which can fit 30 &cPokemon&r. You can Drag &cPokemon&r from your Team into the &9PC&r or vice versa.

When hovering over any &cPokemon&r in the Menu you can see their Name, Species, Type, Nature, Ability, Held Items, and Moves. [...]
```
Note la couleur SYSTEMATIQUE : `&cPokemon&r` toujours en rouge, `&9PC&r` en bleu, `&dFriendship&r` en rose. Cette codification-couleur est constante dans tout le chapitre et aide la lecture. A adopter pour Steamon (definir une palette : Pokemon = rouge, mecaniques Create = or, fluides = bleu, rotational power = rose, etc.).

Exemple de ton familier assumé, ATMons getting_started, Friendship (`2EA725733AC5B290`) :
```
&dFriendship Value&r is necessary for Evolving and Fighting.

This isn't Palworld, you can't just abuse your &cPokemons&r and still have them work for you. [...]
```
Le ton s'autorise blagues, adresses directes ("I'm not listing every single Pokemon, use the Wiki!"), commentaires perso ("&bMudkip&r is my favorite!"). A doser pour Steamon (public international EN) : rester leger mais clair.

### 2.4 Le patron court + humoristique (contenu trivial/vanilla)

Pour le contenu simple, description tres courte et subtitle = jeu de mots. Exemples reels, ATMons food_and_farming (`food_and_farming.snbt` lang) :
- title `"The Bread of Life"`, subtitle `"Quick and Simple"`.
- title `"You're so sweet"`, subtitle `"Pour some Sugar on me!"`, desc `"You should have everything you need already."`
- title `"I'm not gonna make an Egg pun"`, subtitle `"...or am I?"`, desc `"Chickens will lay these naturally. [...] I guess the chickens are just getting... &oEggs-ercise!!!&r."`
- title `"The Start of a Fisher"`, subtitle `"Willy Would be Proud"`.
- title `"THE BEST THING SINCE SLICED BREAD"` (le multiblock kitchen).

Regle : plus le contenu est trivial, plus la description est courte et le titre/subtitle joue sur l'humour. Plus la mecanique est complexe, plus la description est longue et pedagogique.

### 2.5 Le patron "outline + renvoi au Ponder" (Create, alternative legere)

Prominence II ne detaille pas chaque machine Create : il met un texte court dans le SUBTITLE et renvoie au systeme Ponder de Create. Exemple reel (`Prominence-II/create.snbt`, quest racine `2D3191960D3277B6`) :
```
Welcome to Create, a steampunk mod that lets you build contraptions to do most things you can think of.

Create offers great guides for most of its items by hovering over them in REI or in your inventory and holding down 'W' to "ponder" the item. This brings up a menu explaining to use said item.

Because of this the chapter is mostly focused on letting you know what exists and giving you a rough outline of the progression of the mod.
```
Deux philosophies possibles pour Steamon :
- **ATMons** : tout expliquer en detail (long, chaleureux, autonome).
- **Prominence** : lister ce qui existe + renvoyer au Ponder (court, moins de maintenance).
Recommandation : hybride. Le tronc Create de Steamon explique en detail les mecaniques CLES (rotational power, stress, casings, contraptions, sequenced assembly) facon ATMons, et mentionne le Ponder ("Hold W to Ponder") comme tip transversal ; les machines annexes ont une description courte facon Prominence.

### 2.6 Le patron "tables d'info" via {@pagebreak}

Une seule quete peut porter plusieurs pages de doc via `{@pagebreak}`. Exemple reel, ATMons catch_em_all "Fossils" (`07016F654CFFAA20`) : page 1 = spoiler warning, page 2 = table fossile->Pokemon, page 3 = les 4 fossiles a combiner. Idem type-gems ATMons : chaque type a une desc "Strong vs / Vulnerable to" (tableau des faiblesses de type), ex Fire (`0328E5E416D0F785`) :
```
&nStrong&r
&aBug&r &2Grass&r &bIce&r &7Steel&r
&nVunerable&r
&6Rock&r &6Ground&r &bWater&r
```
A voler pour Steamon : les quetes-type Cobblemon peuvent embarquer la table des forces/faiblesses (utile en jeu).

### 2.7 Images et embeds

- `{image:namespace:textures/...png width:N height:N align:center}` dans une description : aide visuelle (ATMons met une image de repere pour CHAQUE structure de fossile, ex `{image:atm:textures/questpics/pokemon/find_birch.png width:200 height:100 align:center}`).
- Images de chapitre (champ `images:[]` en tete de fichier) : titre decoratif, logo, liens Discord cliquables (`click: "https://discord.gg/..."`), et surtout images conditionnelles `dependency: "<questid>"` qui n'apparaissent qu'une fois la quete faite (deeper_and_darker revele ses visuels d'aide apres le gate).

**Note Steamon** : les images custom exigent un resourcepack (textures/questpics). Utiliser des icones d'items existants (`image: "minecraft:item/emerald"`) quand on n'a pas d'asset, comme le fait BigChadGuys.

### 2.8 Prefixes de titre typographes (Prominence)

Prominence prefixe ses titres par categorie : `&f&lHow To&r: &aQuesting!`, `&e&lUpgrading:&f &fChests`. Lisible et scannable. Adoptable pour Steamon (ex. `&f&lTip:&r ...`, `&6&lCreate:&r ...`, `&c&lCatch:&r ...`).

---

## 3. Patterns de reward

### 3.1 Gradation par tier (regle transversale)

- Petites quetes / etapes : `xp` flat 10 a 100, ou un petit item inline.
- Jalons (rsquare/gros node) : item premium + reward table `type: "random"` + `xp: 100`.
- Sommet de chaine : `xp: 250` + reward table de rang superieur.
Exemple reel, echelle des cannes a peche ATMons food_and_farming : iron -> gold -> diamond -> neptunium, xp croissant 25 -> 50 -> 100 -> 250, chaque cran tape une reward table differente (rang croissant).

### 3.2 Types de reward observes

- `type: "item"` inline : `{ id:'...', item:{ count:1, id:'...' }, count:N, random_bonus:M, type:'item' }`. `random_bonus` ajoute une variance de quantite (ex `count:8` + `random_bonus:8` = 8 a 16).
- `type: "xp"` (points d'xp) et `type: "xp_levels"` (niveaux). xp flat pour la masse, xp_levels pour les jalons (1 a 10, jusqu'a 100 sur les tables legendaires).
- `type: "random"` + `table_id: <long>L` : tire dans une reward table. Toujours accompagne de `exclude_from_claim_all: true` (empeche de rafler tous les loots via le bouton claim-all). Ex bounty_board ATMons.
- `type: "loot"` : variante de table (coexiste avec random dans tips_and_tricks).
- `type: "choice"` : le joueur choisit un reward parmi plusieurs (utile pour laisser choisir un starter-item, un materiau, etc.).

### 3.3 Reward != objectif (exemples reels)

- Task = crafter une `minecraft:brush` -> reward = `sophisticatedbackpacks:backpack` (ATMons catch_em_all).
- Task = cooking_table -> reward = 8 bread + xp 100 (ATMons food).
- Task = tuer 5 zombies -> reward = 5 rotten_flesh + xp 10, palier suivant reward = reward table (ATMons bounty_board).
Exception assumee : pierres d'evolution, reward = pierre x3 (encourager le farm). A n'utiliser que quand le farm est le but.

### 3.4 Rewards "finis" via components (sans casser l'economie de craft)

Donner un item pre-configure au lieu de l'item final craftable :
- Livre pre-enchante : `stored_enchantments` (ATMons warden gear : sharpness 5, efficiency 5, protection 4...).
- Cube d'energie pre-charge : component `mekanism:energy`.
- Potion : `potion_contents`.
- Item nomme + lore custom : `minecraft:custom_name` + `minecraft:lore` (ATMons bounty "Sword of AlfredGG" pour avoir tue le Wandering Trader).
Steamon : parfait pour offrir une recompense "prestige" sans donner la recette (ex. une pokeball nommee, un outil Create pre-configure).

### 3.5 Reward tables : FORMAT B (imbrique avec type), tiers et organisation par theme

ATTENTION FORMAT (verdict empirique 2026-08, decompilation ftb-quests 2101.1.28 + 19 tables deja deployees sur le serveur test). Le format "a-plat" (`{ id:"item", item:{...}, weight }` sans champ `type`) est **STRUCTURELLEMENT INVALIDE** pour cette version de FTB Quests : sans champ `type` lisible par `RewardTypes.getRewardType()`, le reward tombe en null et s'affiche "Air" en jeu (c'est LA cause du bug historique). Les exemples a-plat des refs BigChadGuys/ATMons ci-dessous datent de versions anterieures et NE DOIVENT PAS etre reproduits tels quels. Le SEUL format valide sur Steamon est le FORMAT B ci-dessous.

**FORMAT B (le SEUL valide sur Steamon, a appliquer partout)**. Chaque entree de `rewards:[]` a TROIS elements distincts : un `id` hex 16 UNIQUE par entree, un `type` (path ResourceLocation ftbquests valide), et le payload du type a plat.

Reward item (dans une reward_table) :
```
{ id: "<hex16_unique>", type: "item", item: { id: "minecraft:diamond", count: 1 }, weight: 40.0f }
```
Reward xp :
```
{ id: "<hex16_unique>", type: "xp", xp: 50 }
```
Reward monnaie Numismatics (= item classique, PAS le CurrencyReward FTB natif) :
```
{ id: "<hex16_unique>", type: "item", item: { id: "numismatics:spur", count: 4 }, weight: 40.0f }
```
Lien quete -> reward_table (dans un fichier de chapitre, type random) :
```
{ id: "<hex16_unique>", type: "random", table_id: <table_id_decimal_signe>L }
```
`table_id` = l'`id` hex de la reward_table cible converti en long DECIMAL signe + suffixe `L` (ex table `id:"242242FEF05835A5"` -> `table_id: 2603717197295007141L`). Types valides pour `type`: item, xp, currency, random, loot, choice, command, advancement, toast, gamestage, xp_levels, all_table.

Structure d'une reward_table complete :
```
{
  id: "<hex16_table>"
  loot_size: 1            // nombre de tirages
  use_title: true
  rewards: [
    { id:"<hex16_a>", type:"item", item:{ id:"minecraft:torch", count:4 }, weight:10.0f }
    { id:"<hex16_b>", type:"item", item:{ id:"minecraft:diamond", count:1 }, weight:3.0f }
  ]
}
```
`weight` = poids de tirage (items communs poids eleve 10-15, rares poids bas 2-3).

**Tiers de rarete (concept, transposable)** : common (utilitaires, weights eleves) / uncommon / rare (poids 2-3) / epic / legendary. La rareté du reward est CONTEXTUALISEE par l'effort de la tache, pas arbitraire.

**Organisation par theme** : tables nommees par domaine ET par tier (ex `create_materials`, `cobblemon_supplies`, `culinary_bag`, `economy_bag`, `myths_legends_jackpot`, `repeating_daily`). Idee de reward repetable (facon `repeating_cobblemon_quests`) : mix economie + consommables (ex 4 emerald + 3 exp_candy + 8 great_ball + 5 relic_coin), a ecrire au FORMAT B.

**Plan de tables pour Steamon** (a construire au FORMAT B ci-dessus, jamais a-plat) :
- Par tier de rarete : `common`, `uncommon`, `rare`, `epic`, `legendary`.
- Par theme : `create_materials`, `cobblemon_supplies` (balls/candies/berries), `culinary_bag`, `economy_bag` (numismatics), un `myths_legends_jackpot` (key items M&L en poids infime).
- Par quete repetable : une table dediee, mix economie + consommables (facon `repeating_cobblemon_quests`).

---

## 4. Gestion des dependances et non-blocage

### 4.1 Techniques de dependance

- `dependencies: ["<id1>", "<id2>"]` : la quete apparait/se debloque quand TOUTES ses deps sont faites (AND par defaut). Branch-and-converge : ex cake ATMons depend de (chaine sucre) ET (chaine ble).
- `dependency_requirement: "one_completed"` : gate OR. La quete se debloque des qu'UNE des deps listees est faite. Ex ATMons catch_em_all : node "Archeology" depend des 23 fossiles en `one_completed` (trouve n'importe lequel). Ex BigChadGuys economie : selling bin diamant depend de (iron OU redstone bin). Puissant pour "fais AU MOINS UNE des voies".
- `min_required_dependencies: N` : variante numerique (N deps parmi la liste suffisent). Utile pour "complete 3 des 5 quetes ci-dessus".

### 4.2 Techniques de visibilite (progressive reveal)

- `hide_dependency_lines: true` (sur la quete) et `default_hide_dependency_lines: true` (sur le chapitre) : masque les traits de dependance qui partent vers/depuis un node a beaucoup de deps (evite le plat de spaghettis). A METTRE sur tous les nodes de convergence.
- `hide_until_deps_complete: true` : la quete est INVISIBLE tant que ses deps ne sont pas finies. Cree l'effet de decouverte (tout le post-gate de deeper_darker). A utiliser pour reveler un contenu apres un jalon.
- `hide_until_deps_visible: true` : visible des que ses deps sont visibles (moins strict).
- `hide_details_until_startable` : cache le detail tant que non demarrable.

### 4.3 Non-blocage (la regle Steamon numero 4, appliquee)

- `optional: true` : la quete ne bloque JAMAIS ses enfants ni la progression du chapitre. C'est le mecanisme central du non-blocage. Ex ATMons evolution : les 4 evolutions de niche (Alcreamie sweets, Ceruledge armors, Galarica, Ursaluna peat) sont `optional:true`. Ex BigChadGuys : tout le chapitre economie a sa racine `optional:true`.
- **Regle Steamon** : tout objectif RNG (shiny, drop rare, key item M&L), long (mega-farm), ou dependant d'une structure rare -> `optional:true` ET hors du chemin critique. Le tronc ne doit jamais dependre d'une quete optionnelle.
- Concretement : un item comme le wither skull, un legendaire, une pokeball master, un fossile precis -> branche optionnelle non-bloquante. Le gate de progression passe par un objectif DETERMINISTE a cote (ex. "entre dans la dimension" plutot que "obtiens l'item rare X").

### 4.4 Node fantome connecteur (astuce structurelle)

`invisible: true` + `optional: true` + tasks `checkmark` : node jamais affiche ni completable par le joueur, sert de point d'ancrage logique/visuel cache. Present dans 3 des 5 chapitres ATMons audites (welcome, food, tips, deeper_darker), toujours meme signature. Utile pour structurer sans polluer la grille.

---

## 5. Layout visuel

### 5.1 Semantique des shapes (constante a travers ATMons)

| shape | usage | exemple |
|---|---|---|
| `gear` size 2.0-3.0 | node majeur / gate / racine Create | racine Create, gate dimension otherside |
| `pentagon` size 1.5 | jalon secondaire important | first_catch, pokenav complet |
| `hexagon` | quete a taches multiples / rang | defaut deeper_darker, BigChadGuys |
| `octagon` | "trouve la source / structure / biome" | biomes pierres d'evo, ancient_city, pokecenter |
| `diamond` | quete utilitaire / appareil standard | appareils cuisine, tips QoL |
| `rsquare` (round square) size 1.5 | jalon recompense (porte souvent une reward table) | market, cake, cooking_table |
| `circle` | convergence / advancement / checkmark | nodes a N deps, gates advancement |
| `square` | craft final / recompense de fin de chaine | armes warden, devolution |
| `heart` | item special affectif / unique | heart_of_the_deep, capture custom |
| `none` | grille de collection (pas d'encart) | 18 type-gems, 23 fossiles |

**Convention Steamon a poser** : `gear` = jalon Create ET gate de progression ; une forme dediee Cobblemon (ex `pentagon` ou `heart`) pour les jalons Pokemon ; `octagon` pour "trouver un biome/structure" ; `rsquare` pour les jalons a reward table ; `circle` pour les convergences. Documenter la convention et s'y tenir (aide la lisibilite cross-chapitre).

### 5.2 Tailles

- `size: 3.0` racine de chapitre (ATMons andesite root).
- `size: 1.5 a 2.0` jalons.
- `size: 1.0` (defaut) quetes standard.
- `size: 0.8 a 0.9` sous-quetes mineures.
- `icon_scale: 1.5-2.0` sur les grilles pour lisibilite des icones.

### 5.3 Grille et positionnement (eviter les overlaps)

- Coordonnees `x`/`y` en doubles, `grid_scale: 0.5` (global data.snbt). Les quetes se placent sur une grille demi-unite.
- **Pattern branch-and-converge** : racine centrale (x=0 ou point d'entree), branches qui divergent en eventail (x negatifs a gauche, x positifs a droite, y croissant vers le bas = progression), reconvergence sur un node commun. Ex ATMons Create : andesite (x=-6,y=0) racine -> alloy -> shaft -> gearbox/press/mixer en eventail, plusieurs convergent sur basin/mechanical arm.
- **Colonnes de bounty** : chaque mob = une colonne verticale (x fixe), paliers 5/10/50/100 en y decroissant. Ex bounty_board : zombie x=-7, skeleton x=-5, creeper x=-3, chacun avec 4 paliers empiles.
- **Grille de collection** : lignes serrees, ex 18 type-gems ATMons en 2 rangees (y=-7 a -9, x=-1 a 4), shape none, icon_scale 2.0.
- **Regle anti-overlap** : espacer d'au moins 1.5 unite entre centres de quetes voisines (les gros nodes size 2-3 ont besoin de plus). Le validator Steamon verifie 0 overlap de coordonnees.

### 5.4 Gestion des lignes de dependance

- `default_hide_dependency_lines: true` au niveau chapitre pour les chapitres denses (deeper_darker, tips).
- `hide_dependency_lines: true` cible sur les nodes de convergence a N deps (evite le spaghetti).
- Garder les lignes VISIBLES sur le tronc principal (le joueur doit voir le chemin), les CACHER sur les grilles/eventails.

---

## 6. Idees originales a voler (transposables Steamon)

1. **Collection grid des 18 types Cobblemon** (calquee sur la grille des 23 fossiles + le gate one_completed). "Attrape un Pokemon de chaque type", chaque case porte l'icone du type et sa table Strong/Vulnerable en description, reward jackpot sur le node convergent. Task = `cobblemon_tasks:cobblemon_task` action catch avec `pokemon_type` (voir BigChadGuys cobblemon.snbt qui fait deja exactement ca avec les gymbadges comme icones).

2. **Eventail biome -> pierre d'evolution** (ATMons evolution, meme mod). 10 paires : quete `biome` (`#cobblemon:has_ore/ore_fire_stone_normal`) octagon "ou trouver" -> quete `item` "obtenir la pierre" + une quete "cette pierre fait evoluer X, Y, Z". Portable tel quel.

3. **Bounty board a paliers** (ATMons/BigChadGuys). Une colonne par mob, paliers kill 5/10/50/100, rewards graduels (items du mob + reward table partagee entre paliers + xp croissant), palier final pentagon size 1.5 avec table de rang superieur. Boss uniques (Warden, Ender Dragon, boss de mods) en nodes size 1.5 a reward jackpot. Transposable aux mobs Steamon (Create golems, mobs de dimensions, dresseurs RCTMod).

4. **Gate de dimension a revelation progressive** (ATMons deeper_darker). Tronc court -> node gear = `type:"dimension"` -> tout le contenu cache par `hide_until_deps_complete`, ET les images d'aide du chapitre liees par `dependency:` au gate (l'UI se remplit d'indices une fois entre). Parfait pour Aether, Otherside, Nether, End de Steamon.

5. **Echelle de rarete a reward table croissante** (cannes Aquaculture ATMons). Transposable aux tiers de pokeballs (poke -> great -> ultra -> master), aux tiers de sacs Numismatics, aux paliers de selling bin (BigChadGuys : wood -> iron -> diamond -> netherite, chaque cran plus de slots + shipping plus rapide, reward = ingot du tier suivant).

6. **Chapitre economie complet** (BigChadGuys economie). Selling bin (tiers), daily shop, wallet a interet compose, pickpocketing (task custom). Directement inspirant pour le chapitre Numismatics de Steamon. Textes tres pedagogiques (voir 2.x). Racine `optional:true` (economie = confort, pas obligatoire).

7. **Quetes repetables** (BigChadGuys `repeating_cobblemon_quests` reward table). Une quete repetable qui redonne une table mix economie + consommables a chaque completion. Idee : daily/rotation Cobblemon pour Steamon (deja au TODO economie/trainers).

8. **Reward = item pre-enchante / pre-configure via components** (5, 3.4). Prix "prestige" sans casser le craft. Ex pour Steamon : pokeball nommee de recompense, outil Create pre-regle, livre pre-enchante.

9. **Node checkmark hub a N deps + hide_dependency_lines** pour cloturer proprement un chapitre "decouverte des mods".

10. **Cheat-sheet integree** (type-gems Strong/Vulnerable, table fossile->Pokemon via pagebreak). Les quetes peuvent servir de reference in-game.

11. **exclude_from_claim_all: true systematique** sur toute reward table = garde-fou anti-farm a generaliser.

12. **Liens externes cliquables** dans les images de chapitre (`click:"https://discord.gg/..."`, ou lien vers un spreadsheet de spawns comme BigChadGuys cobblemon.snbt). Steamon peut linker son Discord / sa map / son wiki.

---

## 7. Transposition Steamon (par pattern)

Rappel des univers/mods a couvrir : **Create** (+ createaddition electricite, create_dragons_plus, central kitchen, sequenced assembly...), **Cobblemon** (+ mega showdown, myths & legends, RCTMod trainers, cobblemon quests), **dimensions** (Aether, Deeper Darker/Otherside, Nether, End), **cuisine** (Farmer's Delight + Nether's/Aether's/End's/Miner's/Cultural + Brewin'), **Numismatics** (economie), **Waystones, storage, decor**.

| Pattern ref | Application Steamon |
|---|---|
| chapter_groups par domaine (BigChadGuys) | Groupes : Getting Started, Create, Cobblemon, Dimensions (Aether/Otherside/Nether/End), Cuisine, Economy, Storage & Decor, Tips. Titres colores. |
| un mod = un tip minimum (regle 5) | Chaque addon (createaddition, dragons_plus, central kitchen, mega showdown, brewin') a au moins une quete-tip dans le chapitre du domaine parent, sans repeter le tronc. |
| tronc court + gate + eventail cache (archetype 3) | Chaque dimension : tronc deterministe (materiaux du portail) -> gate `type:"dimension"` -> eventail cache (blocs, mobs, loot). Aether, Otherside, Nether, End. |
| collection grid + one_completed (archetype 1) | "Attrape un Pokemon de chaque type" (18 cases). Optionnellement "un fossile / un legendaire" en grille. |
| paire biome->item (archetype 2) | Pierres d'evolution Cobblemon (meme tags). Minerais Create. Ingredients de cuisine par biome. |
| bounty board (idee 3) | Mobs Steamon + dresseurs RCTMod. Boss (Warden, dragons de create_dragons_plus, legendaires) en nodes jackpot. |
| Create detaille facon ATMons (2.2/2.5) | Tronc Create : andesite -> alloy -> casings -> rotational power -> stress -> contraptions -> sequenced assembly (precision mechanism). Descriptions longues pedagogiques + mention Ponder. createaddition (electricite) = sous-branche. |
| Cobblemon core facon ATMons (2.3) | Getting started : starter, pokeball, catch, PC, pasture, healing machine, friendship, evolution, battles, trainers RCTMod. Codification couleur (&cPokemon&r). |
| split culinary (regle 6) | Un chapitre Cuisine avec sections : Farmer's Delight base / addons par dimension (Nether's/Aether's/End's/Miner's/Cultural) / Create central kitchen / Brewin'. Zero recette dupliquee entre sections. |
| economie complete (idee 6) | Chapitre Numismatics : monnaie, spring/depot, echanges, distributeur. Racine optional. Quetes repetables (idee 7). |
| jackpot M&L (regle 7) | Key items / legendaires Myths & Legends = rewards jackpot ultra-rares (poids infime) en branche optionnelle. Jamais dans un tronc, jamais un objectif de gate. |
| reward tables a-plat par tier + theme (3.5) | Construire les tables Steamon au format a-plat BigChadGuys. Tiers common->legendary + themes create/cobblemon/culinary/economy + myths_legends_jackpot. |
| non-blocage (regle 4 / 4.3) | Tout shiny, drop rare, structure rare, key item = `optional:true` hors chemin critique. Gates sur objectifs deterministes (dimension, craft borne). |
| shapes semantiques (5.1) | Poser la convention : gear=Create/gate, forme Cobblemon dediee=jalon Pokemon, octagon=trouver, rsquare=jalon a table, circle=convergence. |

---

## 8. Fiche mod : create_2 (brass -> automation, jetpacks, cuisine-pont)

Recherche consolidee pour le chapitre create_2 (`Rotational Power`). Perimetre STRICT (registre 3.1) : zinc/brass/brass_casing, precision_mechanism + sequenced_assembly (demo ici seulement), deployer/mechanical_arm/mechanical_crafter, bulk processing dragons-plus, jetpacks/backtank, central-kitchen (pont cuisine), molten-vents. Ne deborde jamais sur create_1/3/4.

### 8.1 Progression reelle brass -> automation (ordre a respecter)
Chaine deterministe verifiee (Create 6.x, coherente ATMons + Mayview) :
1. **zinc** : zinc_ore -> crushing/smelting -> zinc_ingot. Le zinc n'est PAS un spawn special, c'est un minerai overworld standard (comme le cuivre). Molten Vents (voir 8.7) est une source ALTERNATIVE d'orestones, PAS la source de zinc.
2. **brass** : mixer heated (mechanical_mixer + basin CHAUFFE par blaze burner) avec 1 copper_ingot + 1 zinc_ingot -> brass_ingot. Le "heated" est le point-cle a enseigner (un basin non chauffe echoue). Le mixer/basin appartiennent a create_1 -> create_2 les REUTILISE (dependance, pas re-enseignement).
3. **brass_casing** : brass_ingot applique sur stripped log (comme andesite/copper casing). Debloque les machines "puissantes".
4. **precision_mechanism** : via SEQUENCED ASSEMBLY (voir 8.2). C'est le 1er craft multi-etapes du jeu, LE concept nouveau de create_2.
5. **automation** : deployer (utilise pour l'assembly), puis mechanical_arm et mechanical_crafter (les 3 machines d'automation, toutes en brass_casing).

### 8.2 SEQUENCED ASSEMBLY (mecanique-cle a enseigner ICI, exemple = precision mechanism)
Principe verifie (wiki Create + ATMons quest `1712C3B3CF158843`) : un item de base est pose sur un **depot** (ou une **belt**) et passe N fois de suite dans une sequence de machines (**deployer** le plus souvent, parfois **press/saw/spout**). A chaque passage il devient un "incomplete item" d'un stade superieur, jusqu'a l'item final. Si la sequence est interrompue ou fausse, l'item incomplet peut etre perdu.

Recette canonique du **precision_mechanism** :
- base = **golden sheet** (= gold_ingot presse au mechanical_press).
- sequence par cycle = 3 deployers appliquant dans l'ordre : 1 **cogwheel**, puis 1 **large_cogwheel**, puis 1 **iron_nugget**.
- **repeter le cycle 5 fois** (donc jusqu'a 15 applications de deployer sur le meme sheet qui avance sur la belt/depot).
- au terme : **80% de reussite** (20% de perte). Cette variance RNG est un TIP a signaler (ne pas en faire un objectif bloquant : demander "obtiens 1 precision mechanism" et non "obtiens-en 8 d'un coup").

Pedagogie : la quete precision_mechanism DOIT expliquer le concept sequenced assembly (belt + deployers en ligne + repetition), pas juste demander l'item. C'est le seul endroit du pack ou on l'enseigne.

### 8.3 Les 3 machines d'automation (roles distincts, toutes en brass_casing)
Descriptions verifiees (ATMons lang, directement transposables au ton) :
- **deployer** (`3314FBC4FEAE1D08`, subtitle "Poke") : "mimique une main de joueur". Place/utilise un item tenu sur le bloc/depot/belt en face quand il recoit de la rotation. Usages : appliquer wax/casings, polir le rose quartz, ET etre l'outil de la sequenced assembly. C'est la porte d'entree de l'automation.
- **mechanical_arm** (`3F2C1A81C17D2D67`, subtitle "Why do it yourself when Robot can do it better?") : bras a config avant pose (comme weighted ejector). Portee 4 blocs, prend sur belts/depots, depose sur belts/depots/funnels. Modes de distribution (round robin / forced / prefer first). Transporteur point-a-point.
- **mechanical_crafter** (`4194397DFD0199C2`) : AUTO-CRAFTING en grille + crafts trop grands pour une table 3x3 (ex crushing wheel). On pose plusieurs crafters, on oriente les fleches (wrench), on alimente en items, on donne la rotation. JALON structurant (debloque les gros crafts type crushing wheel). 

### 8.4 Bulk processing (create-dragons-plus)
Verifie : create-dragons-plus = bulk-processing via encased fan + utilitaires fluides + deco. PAS des dragons/mobs (confirme). Il ETEND le fan de create_1 (blast/smoke/wash/haunt) avec des "bulk air current" recipes :
- **bulk coloring** (dye fluid), **bulk freezing** (powder snow, gele l'eau), **bulk ending** (dragon's breath fluid, infuse "energie de l'End"), **bulk sanding** (quicksand, polit / sand paper recipes), **bulk blasting** (efface neige, fond la glace, allume), **bulk splashing** (eteint le feu, solidifie concrete powder).
- + **Fluid Hatch** (comme Item Hatch mais pour fluid tanks : depot/retrait pratique).
Angle quete : le fan de base est enseigne en create_1 -> create_2 ne re-enseigne PAS le fan, il montre les recettes bulk EN PLUS (1-2 quetes tip : "colore/gele en masse avec ton fan + un fluide"). Non bloquant.

### 8.5 Jetpack + backtank (2 mods distincts, roles DIFFERENTS)
Attention piege : ce ne sont PAS deux jetpacks concurrents.
- **create-stuff-additions (createsa)** : AJOUTE les items. Tier BRASS : **brass jetpack** (voler), **brass exoskeleton** (armor + strength/haste), **extendo grip** (reach +4, knockback ; via "brass hand"), portable drill. (Variantes netherite = via un mod separe Create Stuff & Netherite Additions, endgame -> plutot create_4/adventure, PAS create_2.) Tier brass = coherent avec le perimetre create_2.
- **create-curios-jetpack** : mod de COMPATIBILITE, n'ajoute rien. Permet de porter le jetpack/backtank en slot **curios "back"** au lieu du chestplate (garde la fonction, perd le bonus d'armure). 
- **backtank** : c'est du Create de base (create:copper_backtank, puis create:netherite_backtank), reservoir d'air pour jetpack / potato cannon / diving. Recette copper_backtank (Mayview) : 2 andesite_alloy + 1 shaft + 3 copper_ingot + 1 copper_block, rechargeable a la rotation.
Angle quetes (2-3) : (a) craft le backtank + explique la recharge par rotation, (b) craft le brass jetpack createsa, (c) TIP curios : "porte ton backtank dans le slot curios back (mod create-curios-jetpack) pour garder ton chestplate". Le jetpack complet est confort/fun -> branche optionnelle, pas gate.

### 8.6 create-central-kitchen (LE pont Create <-> Farmer's Delight)
Verifie (Modrinth 2.0.0, "Cooking Automation only") : il ne re-enseigne AUCUNE recette FD, il rend les blocs FD automatisables par les machines Create. Ponts exacts :
- **Packager** unpacking support pour **Cooking Pot** (Farmer's Delight) et **Keg** (Brewin'). => on alimente une cooking pot via des packages Create.
- **Mechanical Arm** interaction : Cooking Pot, Skillet, Stove, Cutting Board (l'insertion cooking pot via arm = slot container seulement, les ingredients passent par le packager).
- **Heat source** : tous les boiler heaters accelerent cooking pot + skillet.
- transforme auto les recettes **Cutting Board (knife)** de FD en recettes **Sawing** (mechanical_saw) ET **Deploying** (deployer). => on decoupe a la chaine.
- transforme les recettes **Keg pouring** (Brewin') en Filling/Draining.
Formulation du PONT (cloture create_2, RENVOIE a farmers_delight SANS re-enseigner les recettes FD) : "Tu sais cuisiner a la main (voir chapitre Farm to Table). Maintenant AUTOMATISE-le : un packager alimente ta cooking pot, un mechanical arm sert les plats, ta cutting board devient une ligne de sawing." Prerequis logique : avoir fait le socle FD (dependance inter-chapitre) OU au moins le deployer/arm de create_2. Le node final du chapitre pointe vers farmers_delight (quest_link).

### 8.7 create-molten-vents (CORRECTION vs brief : PAS une source de chaleur)
Verifie (Modrinth) : ce n'est PAS un heat source pour blaze burner. C'est un systeme de **generation renouvelable d'orestones Create** a partir de lave. Mecanique : on trouve une structure "molten vent" (souvent sous l'eau), on casse la "dormant orestone" (orestone + magma) pour l'activer, on verse de la lave -> genere les orestones (Veridium, Asurine, Crimsite, Ochrum, Scorchia, Scoria). NE produit ni zinc ni copper orestone (hors scope). 
Angle : 1 TIP optionnel "source renouvelable d'orestones deco/craft via la lave" (octagon "trouve un molten vent"). Non bloquant, purement bonus (les orestones sont surtout deco/palette). Ne PAS le presenter comme heat source.

### 8.8 Decoupage A3 recommande pour create_2 (~14-18 tronc / reste opt, cible 26-32)
Racine **gear size 2.5-3.0** (coherent convention Create) = "brass" ou un node d'entree du chapitre. Pattern branch-and-converge :
- **Tronc metal (lineaire, lignes visibles)** : zinc_ingot -> brass_ingot (mixer heated) -> brass_casing. 3 jalons deterministes.
- **Gate sequenced assembly** : precision_mechanism (gear/rsquare) apres brass_casing + deployer. Le deployer est prerequis (il sert a l'assembly). 
- **Branche automation** (diverge de brass_casing) : deployer -> mechanical_arm, mechanical_crafter. 3 machines.
- **Branche bulk** (diverge, optionnelle) : 1-2 tips dragons-plus (renvoie au fan de create_1).
- **Branche gadgets/jetpack** (optionnelle) : backtank -> brass jetpack -> tip exoskeleton/extendo grip/curios. Fun, non bloquant.
- **Convergence finale rsquare** = le pont central-kitchen (reward table create_materials) qui RENVOIE a farmers_delight. Cloture le chapitre.
- **Molten vents** : 1 octagon optionnel isole.
Ratio ~60% tronc+automation deterministe, ~40% bulk/jetpack/vents optionnels.

### 8.9bis IDs VERIFIES (quest-mc-knowledge, RCON + jars serveur, 2026-07)
Create base (`create:`) : zinc_ore, raw_zinc, crushed_raw_zinc, zinc_ingot, brass_ingot, brass_casing, precision_mechanism, deployer, mechanical_arm, mechanical_crafter, brass_sheet, rose_quartz, polished_rose_quartz, copper_backtank, netherite_backtank, **extendo_grip** (extendo grip est dans Create BASE, pas createsa). Tous EXISTENT.
Recette precision_mechanism confirmee : `data/create/recipe/sequenced_assembly/precision_mechanism.json`, type `create:sequenced_assembly`, base `#c:plates/gold`, `loops:5`, 3 etapes type `create:deploying` (deployer requis), transitional `create:incomplete_precision_mechanism`.
Addons (namespaces REELS, attention aux tirets) :
- **create_sa** (Create Stuff Additions) : jetpack = `create_sa:brass_jetpack_chestplate` (aussi andesite/copper/netherite), exo = `create_sa:brass_exoskeleton_chestplate` (idem tiers). Ce sont des CHESTPLATES, PAS de backtank propre. Le backtank vient de Create base (`create:copper_backtank`).
- **create_jetpack_curios** : AUCUN item propre. Declare juste un slot curios "back". Ne jamais faire une task "craft X" dessus -> uniquement un TIP "porte ton jetpack/backtank en slot dos".
- **molten_vents** (namespace SANS tiret, mod "Molten Vents") : blocs `molten_vents:dormant_molten_<type>` et `molten_vents:active_molten_<type>`, type ∈ {ochrum, scoria, veridium, asurine, crimsite, scorchia}. Il n'existe PAS d'id `create-molten-vents:molten_vent`.
- **create_dragons_plus** (Create Dragon's Plus) : bulk processing + deco, PAS de dragons. Bloc bulk cle = `create_dragons_plus:fluid_hatch`. Le bulk utilise l'Encased Fan de Create base (tags `create_dragons_plus:fan_processing_catalysts`), pas de fan propre.
- **create_central_kitchen** : AUCUN bloc/item propre (0 entree data/). Pur pont de recettes/comportements sur les blocs FD + machines Create existants. Ne jamais faire "craft un bloc central_kitchen" -> le chapitre demande d'AUTOMATISER (mechanical_arm sur cooking pot, deployer/saw sur cutting board), pas de crafter un item du mod.

### 8.9 Rewards create_2 (FORMAT B, jamais l'item demande)
- zinc_ingot -> reward copper_ingot / andesite_alloy (materiaux lies).
- brass_ingot -> reward brass_sheet ou zinc en stock (pour encourager la prod).
- brass_casing -> reward quelques brass_casing supplementaires OU un deployer partiel (materiaux d'automation).
- precision_mechanism -> reward gold_ingot + iron_nugget (les intrants, comme ATMons ne re-donne pas l'item ; ou un petit xp jalon).
- deployer/arm/crafter -> reward depot / belts / cogwheels (logistique complementaire).
- pont central-kitchen (fin de chapitre) -> reward table `create_materials` (tier uncommon) + xp jalon + qq **numismatics:spur** (economie fin de chapitre, format item classique).
Toujours `exclude_from_claim_all: true` sur les tables.

---

## 9. Fiche mod : create_3 (electricite FE, enchantement industriel, transmission, pont Poke Ball)

Recherche consolidee pour le chapitre create_3 (`Sparks & Circuits`, racine gear FIGEE `7FD87542D311BA8A`). Perimetre STRICT (registre 3.1) : createaddition (FE), create-enchantment-industry (XP liquide), create-enchantable-machinery (tip mecanique), create-ender-transmission (transmission), klinks-n-klangs (fabrication Poke Balls = PONT Cobblemon qui clot le chapitre). Tout est VERIFIE au registre runtime (mc-knowledge, RCON /give) + datapack steamon-tweaks lu. Ne deborde jamais sur create_2 (deployer/arm/precision) ni create_4 (steel/nuclear/vaults/trains).

### 9.1 IDs verifies (registre runtime) et PIEGES a bannir

Namespaces confirmes : `createaddition`, `create_enchantment_industry` (avec underscores), `createenchantablemachinery`, `createendertransmission`, `create_klinks_n_klangs`, `cobblemon_smartphone`, `cobblemon`.

createaddition (tous EXISTENT + donnables sauf mention) : `copper_wire`, `connector` ("Small Connector"), `large_connector`, `small_light_connector`, `capacitor` (l'item batterie, le VRAI id), `modular_accumulator` (le bloc de stockage multiblock fonctionnel), `electric_motor`, `alternator`, `rolling_mill`, `tesla_coil`, `portable_energy_interface`, `barbed_wire`, `redstone_relay`, `digital_adapter`, `liquid_blaze_burner`, `spool`, `copper_spool`, `gold_spool`, `festive_spool`, `electrum_spool`, `electrum_ingot`/`_nugget`/`_sheet`/`_rod`/`_wire`/`_block`, `electrum_amulet`, `iron_wire`/`iron_rod`, `gold_wire`/`gold_rod`, `copper_rod`, `brass_rod`, `zinc_sheet`, `straw`, `diamond_grit`, `chocolate_cake`.

PIEGES createaddition (lang orphelin OU inexistant, NE PAS mettre en task) :
- `createaddition:accumulator` -> **N'EXISTE PAS** au registre (cle lang orpheline). L'accumulateur reel = `createaddition:modular_accumulator`. Le message initial disait "capacitor PAS accumulator" : en fait `capacitor` ET `modular_accumulator` existent (ce sont 2 choses : batterie item vs bloc de stockage), seul le simple `accumulator` est le fantome.
- `createaddition:heater` / `induction_heater` / `charger` -> **N'EXISTENT PAS**. Aucun "heater" ni "charger" dans le mod. Le seul "chauffe" = `createaddition:liquid_blaze_burner`. (Le registre 3.1 mentionnait heater/charger a tort, les retirer.)
- `createaddition:bronze_rod`, `seed_oil` (nu), `copper_goblet`, `gold_goblet`, `brass_figurine` -> lang present mais ABSENTS du registre.

create_enchantment_industry (namespace avec underscores) :
- `create_enchantment_industry:experience` = un FLUIDE (XP liquide), PAS un item -> pour une task "obtenir", utiliser le bucket `create_enchantment_industry:experience_bucket` ("Bucket o' Enchanting").
- Blocs EXISTANTS donnables : `printer`, `blaze_enchanter`, `blaze_forger`, `experience_hatch`, `experience_lantern`, `grindstone_drain`, `mechanical_grindstone`, `super_experience_block`.
- Items EXISTANTS donnables : `enchanting_template`, `super_enchanting_template`, `experience_bucket`, `super_experience_nugget`, `experience_cake` (+ `_base`, `_slice`).
- PIEGES : `create_enchantment_industry:disenchanter` -> **N'EXISTE PAS** sous cet id (le desenchantement passe par `blaze_forger` / `grindstone_drain`+`mechanical_grindstone`). `hyper_experience`/`impregnated` -> non trouves sous ce nom ; l'equivalent "XP superieur" = `super_experience_nugget`/`super_experience_block`. NE PAS ecrire de task sur un "disenchanter" ni un "hyper_experience" item.

createenchantablemachinery : **AUCUN item ni bloc au registre**. C'est une mecanique data-driven pure (on applique des enchantements Minecraft -- Efficiency/Fortune/Silk Touch -- aux blocs Create existants : drill, saw, harvester, fan, millstone, press, mixer, crushing wheel). => aucune task item possible, seulement un TIP + eventuellement une task advancement/checkmark.

createendertransmission (4 blocs, tous EXISTENT donnables) : `item_transmitter`, `fluid_transmitter`, `energy_transmitter`, `chunk_loader`. PIEGE : PAS de "rotation transmitter" (le mod transmet item/fluide/energie, PAS la rotation kinetic a distance ; le chunk_loader consomme du kinetic mais ne transmet rien). Le registre 3.1 disait "transmitters (rotation/energie)" -> corriger en "item/fluide/energie".

create_klinks_n_klangs (verifie) : `blank_ball` EXISTE donnable. Toutes les `unpainted_X_ball` et `unfinished_X_ball` EXISTENT (great/ultra/dive/dusk/quick/heal/net/nest/timer/luxury/safari/sport/park/repeat/level/lure/moon/love/heavy/fast/friend/dream). Les `X_ball_stencil` EXISTENT pour ces memes balls. PIEGES : `cherish_ball_stencil`, `master_ball_stencil`, `premier_ball_stencil` -> **N'EXISTENT PAS** (cherish et premier ont des recettes custom dediees ; master ball non fabricable via klinks). Les 7 `X_paint` (red/white/blue/yellow/green/black/pink) sont des FLUIDES (pas des items) -> pour une task item utiliser les buckets `X_paint_bucket`. `molten_rare_candy` et `protein` = fluides sans bucket (non donnables) ; `liquid_medicinal_brew` a un bucket `liquid_medicinal_brew_bucket` (donnable).

cobblemon_smartphone : les 16 couleurs `X_smartphone` EXISTENT donnables. cobblemon : les 30 balls citees EXISTENT toutes donnables, y compris `master_ball` (pas de piege).

### 9.2 Progression electricite createaddition (l'ordre reel des jalons)

Verifie (source mrh0/createaddition lang + wiki + BCG-CF quest tree). La mecanique centrale a ENSEIGNER = le **pont energie bidirectionnel** entre le monde kinetic Create (rotation, SU/stress) et le Forge Energy (FE) :
- **Alternator** : kinetic -> FE. Genere du FE a partir de la rotation (min 32 RPM, sortie proportionnelle au RPM). "Create -> electricite".
- **Electric Motor** : FE -> kinetic. Genere de la rotation a partir du FE, RPM reglable au panneau arriere. "electricite -> Create". C'est le sens inverse (75% d'efficacite globale sur l'aller-retour).

Ordre des jalons (racine gear -> branche electricite) :
1. **Rolling Mill** (RACINE fonctionnelle de la branche elec) : machine kinetic qui transforme les plates en rods et les rods en wires. C'est le pre-requis physique de TOUT le reste (connecteurs, spools, machines). Recette (BCG) : iron sheets + andesite alloy + shafts + andesite casing.
2. **Wires + Rods** via Rolling Mill : copper_wire (le plus basique), puis iron/gold/electrum. Les **spools** (bobines) s'enroulent a partir des wires et servent d'intrant recurrent.
3. **Connectors** (small + large) : inserent/extraient le FE des blocs, relies par des wires. Pose du reseau electrique.
4. **Electrum** : alliage **or + argent** (PAS or+cuivre), via `create:mixing` (heated) -> 2x electrum_ingot. Depend d'un mod fournissant l'argent (`c:ingots/silver`) ; sinon la recette est desactivee. electrum_wire (rolling mill) sert aux machines avancees. => 1 SEULE quete electrum (registre 3.1).
5. **Alternator + Electric Motor** : la paire pont kinetic<->FE. A regrouper dans UN node pedagogique (les 2 sens ensemble, comme BCG).
6. **Capacitor** : l'item batterie portable (stocke du FE, sert a crafter motor/alternator/tesla). **Modular Accumulator** : le bloc de stockage multiblock (gros buffer FE, wrench pour definir input/output).
7. **Tesla Coil** : charge des items / applique des effets a distance (endgame de la branche). 
8. **Portable Energy Interface** : transfert FE vers/depuis les contraptions mobiles (trains, bogeys) -- fait le lien avec create_4 sans y deborder.

### 9.3 Progression enchantement industriel (create-enchantment-industry)

Verifie (fork DragonsPlus Create 6 + BCG-CF quest tree). Mecanique a enseigner = **industrialiser l'XP et l'enchantement** :
- **Liquid Experience** (`create_enchantment_industry:experience`) : XP sous forme fluide, stockable/transportable. On l'obtient en versant des Bottles o' Enchanting sur un item drain, OU via le desenchantement d'items (grindstone_drain / blaze_forger), OU depuis les experience_nuggets.
- **Blaze Enchanter** : un Blaze Burner transforme en table d'enchantement automatique (via un "Enchanting Guide"/template). Consomme du Liquid Experience. Enchante les items sur le tapis en dessous.
- **Printer** : copie/duplique les enchanted books, written books, name tags, train schedules. Les enchanted books exigent le printer alimente en Liquid XP.
- **Super/Hyper enchanting** : `super_experience_nugget`/`super_experience_block` pour enchanter au-dela des limites vanilla (capstone).

Jalons (2-3 quetes, branche enchantement) :
1. **Hub "Unlock Enchantment Industry"** (checkmark, gate derriere copper_casing/fluides de create_1) -> ouvre la branche.
2. **Blaze Enchanter** (+ le template/guide) : quete item + advancement "enchant an item". Le coeur.
3. **Printer** : quete item + advancement "duplicate an enchanted book".
4. (optionnel) **Super Experience** : capstone qui exige le Liquid XP et donne acces au super-enchanting. `optional:true`.

### 9.4 create-enchantable-machinery (1 tip, PAS de task item)

Ce que ca apporte : appliquer des enchantements Minecraft aux MACHINES Create pour les booster. Efficiency (drill/saw/fan/millstone/press/mixer/crushing wheel/plough = +vitesse/-consommation), Fortune (drill/harvester = +drops), Silk Touch (drill/saw/crushing wheel). Se voit avec les Engineer's Goggles. **Aucun item propre** => 1 seule quete TIP (checkmark ou advancement), placee apres la branche enchantement (synergie parfaite : on fabrique les enchantements industriellement en 9.3, puis on les applique aux machines ici). Task possible : utiliser une enclume/table d'enchantement sur un Mechanical Drill. Le TIP explique la synergie enchantment-industry -> enchantable-machinery.

### 9.5 create-ender-transmission (1-2 quetes)

4 blocs. Mecanique : transmettre item/fluide/energie sans cable, sur distance illimitee ET cross-dimension. Le **chunk_loader** charge un chunk avec de l'energie kinetic (maintient une contraption/farm active meme joueur absent). Jalons :
1. **Un transmitter** (energy ou item) : quete tip "transmission sans fil" (pose l'idee du reseau a distance).
2. **Chunk Loader** : quete utile (garde une ferme active). Recettes custom datapack : chunk_loader via crafting, les 3 transmitters via mechanical_crafting. Non-bloquant, confort d'automatisation.

### 9.6 PONT Poke Ball via klinks-n-klangs (LE coeur de create_3, clot le chapitre)

Le pipeline EXACT (lu dans le datapack steamon-tweaks, override actif). C'est la mecanique-signature du chapitre et le pont vers Cobblemon :

**Etape 0 - blank_ball** : `create_klinks_n_klangs:blank_ball` (fabrique via le jar klinks, typiquement press/deployer sur composants ; c'est la coquille vide de base).

**Deux voies de fabrication selon la ball** :
- **Voie "fill" (balls unicolores)** : `create:filling` (Spout) qui verse un dye sur un blank/unpainted ball -> la ball finale. Ex `poke_ball_fill.json` : `blank_ball` + 1000mB `create_dragons_plus:red_dye` -> `cobblemon:poke_ball`. Idem premier_ball, azure/citrine/roseate/slate/verdant (balls apricorn colorees).
- **Voie "painting" (balls multicolores)** : `create:sequenced_assembly` sur un `unpainted_X_ball` avec plusieurs etapes de `create:filling` (250mB de dye a chaque passe, alternant les couleurs) via un `unfinished_X_ball` comme transitional item -> la ball finale. Ex great_ball = blue/red/blue ; ultra_ball = yellow/black/yellow ; dive_ball = blue/white/blue. Une quinzaine de balls suivent ce schema (great, ultra, dive, dusk, quick, heal, net, nest, timer, luxury, safari, sport, park, repeat, level, lure, moon, love, heavy, fast, friend, dream).
- **Cas speciaux (recettes custom steamon dediees, PAS de stencil)** : `cherish_ball` = sequenced_assembly avec deploying (netherite_ingot) + filling (red_paint, white_paint) + pressing, 2 loops (recette `steamon:cherish_ball_sequenced`). `premier_ball` = premier_ball_fill. `master_ball` = NON fabricable via klinks (reste un reward jackpot / rare).

**Point cle datapack** : les recettes internes `X_paint_mix` du mod klinks sont DESACTIVEES (`neoforge:false`) ; le pack utilise les **dyes de create_dragons_plus** (`create_dragons_plus:red_dye`, etc.) comme fluide de remplissage, sauf cherish_ball qui utilise les vrais fluides `create_klinks_n_klangs:red_paint`/`white_paint`. Le systeme "stencil" existe dans le jar (great_ball_stencil...) mais le datapack Steamon passe surtout par unpainted_ball + filling/sequenced_assembly.

**Consequence design** : ce pont fait REUTILISER tout ce que create_3 a enseigne (Spout/filling = create_1 fluides, sequenced_assembly = create_2 -- donc create_3 DEPEND de create_1 et create_2). Le node final "fabrique ta premiere Poke Ball via Create" est un gear qui CLOT create_3 et renvoie (quest_link) vers cobblemon_1 racine `4EFD1A480A12986D` (les balls y sont utilisees, pas fabriquees). Le registre 3.1 est respecte : cobblemon_1 mentionne l'ACHAT/drop des balls, create_3 en enseigne la FABRICATION.

### 9.7 cobblemon_smartphone (debouche, recette Create-only)

Le smartphone Cobblemon (les 16 couleurs `cobblemon_smartphone:X_smartphone`) a sa recette VANILLA desactivee (`neoforge:false`) ; SEULE la recette `create:mechanical_crafting` du datapack steamon-tweaks est active. Pattern 3x5 (`black_smartphone_create.json`) : tag `steamon:pokefinders` (contient les 7 `cobblenav:pokefinder_item_*`), tinted_glass, `waystones:warp_stone`, `cobblemon:healing_machine`, `computercraft:computer_advanced`, `cobblemon:pc`, `create:precision_mechanism` (create_2), ender_chest, apricorn de la couleur. Le smartphone sort pre-upgrade (pokenav + waystone via custom_data). => create_3 doit inclure sa fabrication (Mechanical Crafter, donc depend de create_2) OU au minimum le lister comme debouche. C'est la cible du quest_link "smartphone" depuis cobblemon_1.

### 9.8 Decoupage A3 propose (racine gear 7FD87542D311BA8A -> 3 branches -> convergence + pont)

Pattern retenu (issu de BCG-CF : tronc kinetic commun -> hubs "Unlock X" checkmark size 1.5 -> eventails, PAS de quest_link interne). ~14-18 tronc, cible 22-28.

- **Racine** : gear size 2.5-3.0 `7FD87542D311BA8A` "Sparks & Circuits", accrochee au reseau via le quest_link smartphone de cobblemon_1. Depend de create_1 (fluides/casing) et pointe l'idee "electrifier Create".
- **Branche A - Electricite** (tronc principal, lignes visibles) : Rolling Mill (gear) -> Wires/Rods (copper_wire) -> Connectors -> Electrum (1 quete) -> Alternator+Motor (node pont kinetic<->FE, pentagon/gear) -> Capacitor + Modular Accumulator -> Tesla Coil -> Portable Energy Interface. ~8 quetes.
- **Branche B - Enchantement** : hub checkmark "Unlock Enchantment Industry" (gate copper_casing) -> Blaze Enchanter (item+advancement) -> Printer (item+advancement) -> [opt] Super Experience. + 1 tip enchantable-machinery en aval (synergie). ~4-5 quetes.
- **Branche C - Transmission** : 1 transmitter tip -> Chunk Loader. ~2 quetes, non-bloquant.
- **Convergence + PONT** : node "Poke Ball Factory" (gear, clot le chapitre) qui DEPEND d'avoir l'electricite + les fluides/sequenced_assembly. Sous-noeuds : blank_ball -> poke_ball (fill) -> great/ultra (painting/sequenced) -> [opt] cherish_ball. + le node cobblemon_smartphone (Mechanical Crafter). Le node final renvoie (quest_link) vers cobblemon_1. ~4-6 quetes.
- Reward table de fin de chapitre (rsquare) + numismatics:spur (economie fin de chapitre, format item classique).

### 9.9 Rewards create_3 (jamais l'item demande, FORMAT B, varie)

- Rolling Mill -> reward andesite alloy / iron sheets (les intrants) + xp jalon 50.
- copper_wire / spools -> reward `create:experience_nugget` x8-12 (monnaie tech interne, pattern BCG) ou capacitor amorce.
- Connectors -> reward quelques wires/spools supplementaires.
- Electrum -> reward electrum_nugget x9 OU gold/silver ingots (les intrants), pas l'ingot lui-meme.
- Alternator+Motor (jalon pont) -> reward table `create_materials` (tier uncommon) + xp 100.
- Capacitor/Accumulator -> reward le bloc x2-3 (amorcage, pattern BCG accumulator "craft 1 recois 3") OU un cable/connector.
- Tesla Coil -> reward xp 100 + petite table.
- Blaze Enchanter -> reward `experience_bucket` (Liquid XP) ou lapis/glow ink (intrants du super XP).
- Printer -> reward paper/book stack OU un enchanted book pre-configure (components).
- Chunk Loader -> reward table utilitaire.
- Poke Ball Factory (clot, jalon fort) -> reward table `cobblemon_supplies` (great_ball/ultra_ball x N, pattern BCG defeat-ladder) + xp 150 + numismatics:spur. JAMAIS le blank_ball ou la ball demandee en reward direct.
- cobblemon_smartphone -> reward un apricorn stack ou un pokefinder (pas un smartphone).
Toujours `exclude_from_claim_all: true` sur les tables.

### 9.10 Corrections a remonter au registre 3.1 (QUEST-MASTER-PLAN)

- `createaddition:accumulator` -> remplacer par `modular_accumulator` (bloc) ; garder `capacitor` (item batterie). Les deux coexistent, seul `accumulator` nu est fantome.
- Retirer "heater" et "charger" de la ligne createaddition du registre 3.1 : n'existent pas dans le mod.
- ender-transmission : corriger "transmitters (rotation/energie)" -> "item/fluide/energie transmitters + chunk_loader". Pas de transmission de rotation.
- enchantment-industry : retirer "disenchanter" comme item (n'existe pas sous cet id ; desenchantement = blaze_forger/grindstone). "hyper experience" -> "super_experience".
- klinks : le pont passe par blank_ball + unpainted_ball + filling/sequenced_assembly avec dyes create_dragons_plus (pas les stencils natifs) ; cherish/master/premier n'ont pas de stencil.

---

## 10. Fiche mod : cuisine Farmer's Delight (socle + addons) -- split en 2 chapitres

Recherche consolidee (jars 1.21.1 NeoForge de l'instance Steamon, lang + recipe types LUS ; ref BigChadGuys `ffarmers_delight.snbt` pour les patterns). Perimetre : `farmers_delight` (socle overworld) + `delight_addons` (Nether/Aether/End/Miner/Cultural + Brewin'). Objectif : 2 chapitres, ZERO plat duplique entre les deux ni entre addons. Chaque addon a un THEME d'ingredients propre (sa dimension/son biome) => l'anti-repetition est naturelle si on respecte les namespaces.

### 10.0 Mods reellement installes + namespaces VERIFIES (instance Steamon)

| Mod | jar | namespace | statut quete |
|---|---|---|---|
| Farmer's Delight | FarmersDelight-1.21.1-1.3.2 | `farmersdelight` | SOCLE (chapitre 1) |
| My Nether's Delight | MyNethersDelight-1.21.1-1.10.2 | `mynethersdelight` | addon (chapitre 2) |
| The Aether's Delight | aethersdelight-0.1.4.2 | `aethersdelight` | addon (chapitre 2) |
| Ends Delight | ends_delight-2.5.1 | `ends_delight` | addon (chapitre 2) |
| Miners Delight | minersdelight-1.21.1-1.4.5 | `minersdelight` | addon (chapitre 2) |
| Cultural Delights | culturaldelights-0.17.8 | `culturaldelights` | addon (chapitre 2) |
| Brewin' And Chewin' | BrewinAndChewin-4.4.2 | `brewinandchewin` | addon (chapitre 2, section a part = fermentation) |
| Chef's Delight | chefsdelight-1.0.5 | `chefsdelight` | AUTOMATISATION (pas de plat propre : villager Chef/Cook + cooking auto). 1 TIP max, PAS de tasks item. Cousin de central-kitchen (pont Create). |
| Tomtaru's CF Tweaks | TMTCF-2.0.3 | (tweaks) | datapack de tweaks (recettes/loot cross Cobblemon x FD). PAS d'items propres, PAS de quete. |

NON confirmes dans l'instance Steamon (present dans le pw.toml mais jar absent de l'instance testee) : `display-delight`, `gensokyo-delight`. A traiter comme deco/niche => hors quete tant que non confirmes (voir 10.7). Verifier au registre runtime avant toute task.

### 10.1 CHAPITRE 1 -- farmers_delight (socle) : la chaine de progression reelle

Progression VERIFIEE (lang + recipe types `cooking`/`cutting`, ref BigChadGuys) : FD n'a PAS de gate technologique. Un seul jalon OBLIGATOIRE pour cuisiner : le **flint_knife** (1er outil, avant meme le fer) + les 4 blocs de cuisson. Tout le reste (les ~90 plats) est OPTIONNEL / de confort. => le tronc du chapitre 1 doit tenir en ~5-7 quetes deterministes (les stations), le reste en branches "plats" non-bloquantes.

**Ordre logique du tronc (obligatoire pour cuisiner) :**
1. **flint_knife** (`farmersdelight:flint_knife`) = PREMIER outil, craftable des le spawn (flint + stick + string). C'est la porte d'entree. Tier ensuite : iron -> golden -> diamond -> netherite knife (tag `farmersdelight:tools/knives`, les 5 verifies). Le knife sert au cutting board ET tue en laissant des "cuts" (chicken_cuts, minced_beef via cutting board).
2. **cutting_board** (`farmersdelight:cutting_board`) : pose un item dessus, clic-droit avec un knife -> decoupe (chicken -> cuts, log -> planks + strip bark, etc.). Station de decoupe, pas de chaleur.
3. **cooking_pot** (`farmersdelight:cooking_pot`) : les SOUPES/RAGOUTS. DOIT etre posee sur un bloc chaud (campfire, stove, magma block). Sort avec un bol (recuperable). Le coeur de FD.
4. **skillet** (`farmersdelight:skillet`) : la poele. Cuit vite, et se tient EN MAIN pour cuisiner sans station (mecanique cachee, voir 10.3). Peut aussi servir d'arme.
5. **stove** (`farmersdelight:stove`) : source de chaleur qui cuit jusqu'a 6 items poses dessus SANS carburant permanent une fois allumee (au campfire pres). Sert de base a la cooking pot/skillet.
6. **cooking (campfire)** : TIP -- on peut deja cuire 4 items sur un simple campfire vanilla (barbecue), la cooking pot n'est pas requise pour tout. Non bloquant.

**Compost / sol (branche agriculture, non bloquant mais TRES utile) :**
- **organic_compost** (`farmersdelight:organic_compost`) : bloc obtenu en empilant matiere organique (rotten flesh, bonemeal, etc.), murit en **rich_soil**.
- **rich_soil** / **rich_soil_farmland** : sol qui a une chance de faire pousser les cultures d'un stade en plus (croissance acceleree passive). Jalon "farming" a enseigner.

### 10.2 CHAPITRE 1 -- les 6-10 plats/items SIGNATURE a mettre en quete (socle)

FD base a ~90 items. NE PAS tous les mettre en task (anti-pattern BigChadGuys : 200+ quetes food monotones toutes reward xp 25, illisible). Selectionner les plus EMBLEMATIQUES et qui enseignent une station differente :

| Item (namespace `farmersdelight:`) | Ce qu'il enseigne / pourquoi signature |
|---|---|
| `hamburger` | l'icone de FD (c'est l'icone du chapitre BigChadGuys). Chaine complete beef_patty + bun. |
| `cooking_pot` | la station cle (deja au tronc). |
| `beef_stew` OU `vegetable_soup` | premier ragout cooking pot (soupe = bol reutilisable). |
| `apple_pie` (block) | les tartes = pie_crust + cooking, se posent et se coupent en slices (feast block). |
| `dog_food` | niche utile : nourrit/soigne les loups (mecanique cachee, tip d'elevage). |
| `roast_chicken_block` OU `stuffed_pumpkin` | les FEAST blocks : gros plats poses au sol, plusieurs parts, pour un banquet multijoueur. |
| `fried_egg` / `bacon_and_eggs` | plat skillet basique (enseigne la poele). |
| `mixed_salad` | salade = cutting board sans chaleur, rassemble plusieurs legumes crus. |
| `honey_glazed_ham_block` | feast prestige (miel + ham), bon en reward de fin de section. |
| `nourishment` (mecanique) | TIP checkmark : les meilleurs plats donnent l'effet Nourishment (bloque la perte de faim hors regen). Argument central "pourquoi cuisiner". |

Cap conseille : ~10-14 quetes plats max sur le socle (le reste reste craftable en jeu sans quete). Les plats "meat cuts" (chicken_cuts, minced_beef, bacon...) peuvent etre regroupes sous 1-2 quetes "prepare tes viandes au cutting board" plutot qu'une quete par cut.

### 10.3 CHAPITRE 1 -- les mecaniques cachees / tips a transmettre en description (4-6)

Ce sont les "tips & tricks" que la quete DOIT enseigner (regle description en 3 temps) :
1. **Skillet en main** : le skillet peut etre TENU et utilise pour cuisiner sans le poser, et sert d'arme de melee (assomme + cuit). Mecanique meconnue, gros confort early.
2. **Cutting board = 0 cout** : decouper sur cutting board ne consomme PAS d'energie ni de carburant, juste le knife (durabilite). Permet 1 log -> 4 planks + bonus, strip bark, transformer 1 aliment en portions.
3. **Cuisson au campfire vanilla** : pas besoin de cooking pot pour commencer -- 4 items sur un campfire = barbecue. La cooking pot sert aux RECETTES a plusieurs ingredients (soupes).
4. **Nourishment** : certains plats "complets" donnent l'effet Nourishment = la faim ne descend plus tant qu'on ne regen pas de vie. Le VRAI interet de cuisiner (vs manger du pain).
5. **Rich soil** : composter (organic_compost -> rich_soil) donne un sol a croissance amelioree. Boucle agriculture.
6. **Knife tiers = drops** : tuer un mob avec un knife peut donner des "cuts" bonus (ex : hoglin tue au knife -> `farmersdelight:ham`). Interaction cachee chasse/cuisine.

### 10.4 CHAPITRE 2 -- delight_addons : theme d'ingredients par addon (anti-repetition)

Regle d'or anti-doublon : CHAQUE addon cuisine avec les ingredients de SA dimension/son biome. Aucun plat overworld FD ne reapparait. Un plat = un seul namespace = un seul chapitre. Structurer le chapitre 2 en 6 sections (une par addon), chacune gate derriere l'acces a sa dimension quand c'est logique (Nether/Aether/End) -- mais NON bloquant pour le tronc principal du pack (branche optionnelle cuisine).

Pour chaque addon : 3-5 items signature + 1 tip + son element UNIQUE.

#### Nether's Delight (`mynethersdelight`) -- cuisine du Nether
- **Element unique** : le **Blazier** (`blazier_block`) = un campfire du Nether (cuit avec la chaleur du feu de l'ame), et la **Resurgent Soil** (`resurgent_soil`/`_farmland`) = terre qui permet de cultiver DANS le Nether. Ingredients : hoglin (loin/sausage), strider (minced/slice/loaf), ghast (ghasta/cream), bullet pepper + powdery cannon (cultures Nether).
- **Signature (3-5)** : `hoglin_loin` (decoupe du hoglin, la viande de base Nether), `stuffed_hoglin` (feast block Nether prestige), `plate_of_ghasta_with_cream` (le plat "pate" iconique, ghast tears), `hot_wings_bucket` (bullet pepper piquant), `nether_burger` OU `striderloaf_block` (feast strider).
- **TIP** : cultiver au Nether via Resurgent Soil + cuire au Blazier -> permet une base alimentaire sans revenir a l'overworld. Le bullet pepper (piment) donne des plats "spicy" a effets.

#### The Aether's Delight (`aethersdelight`) -- cuisine de l'Aether
- **Element unique** : un TIER D'OUTILS/MACHINES propre. **Arkenium** (minerai Aether : `arkenium_ore` -> `arkenium_ingot` -> `arkenium_knife`), et des stations dediees : `holystone_furnace`, `holystone_smoker`, `holystone_stove`, `arkenium_blast_furnace`. + knives par materiau Aether (holystone/zanite/gravitite). Ingredients : Moa (la volaille de l'Aether), gingerbread, peppermint, parsnip/leek/ginger, blue/enchanted berries.
- **Signature (3-5)** : `arkenium_knife` (le knife Aether, jalon outil), `moa_stew` (ragout de Moa, viande signature), `gingerbread_moa` (patisserie iconique via cookie cutter), `blue_berry_muffin` OU `white_apple_pie` (dessert Aether), `peppermint_tea` OU `ginger_ale` (boisson Aether).
- **TIP** : l'Aether a ses PROPRES stations de cuisson (holystone stove/smoker) et son minerai Arkenium pour le knife -- ne pas ramener son materiel overworld. Les cookie cutters (man/moa/star) faconnent le gingerbread.

#### Ends Delight (`ends_delight`) -- cuisine de l'End
- **Element unique** : cuisiner l'inhospitalier (chorus, shulker, endermite, DRAGON). Le **chorus fruit** devient farine/the/vin ; le **dragon** se mange (dragon_leg, dragon_meat, fried_dragon_egg -- prestige endgame). Knives dedies (end_stone/purpur/dragon_tooth). Recipe types propres (`food_campfire_cooking`, `food_smoking`).
- **Signature (3-5)** : `chorus_fruit_pie` (feast block chorus, le plat central), `dragon_leg` OU `roasted_dragon_steak` (viande de dragon = prestige, gate derriere la fin de l'End), `bubble_tea` / `chorus_fruit_milk_tea` (boisson signature), `stir_fried_shulker_meat` (shulker), `chorus_cookie` (dessert simple pour amorcer).
- **TIP** : le chorus fruit se transforme (grain -> farine, the, vin, popsicle) ; manger du dragon (dragon_leg) est un plat de prestige de fin de jeu. Le `fried_dragon_egg` consomme un oeuf non-hatchable (attention : recette avec liquid_dragon_egg, niche).

#### Miners Delight (`minersdelight`) -- cuisine souterraine
- **Element unique** : le **Copper Pot** (`copper_pot`) = une cooking pot PORTABLE qui produit des "soup cups" (bol en cuivre nomade), et le **Cave Carrot** (`cave_carrots`/`wild_cave_carrots`) = une culture qui pousse SOUS TERRE (a la lumiere faible). Nourriture de speleo : arthropodes, spider leg, bat wing, glow squid, silverfish eggs. Theme "survie en caverne".
- **Signature (3-5)** : `copper_pot` (la station nomade, jalon), `cave_carrot` (culture souterraine, ingredient de base), `insect_stew` OU `cooked_arthropod` (nourriture de caverne assumee), `cave_hamburger` (le burger du mineur), `nutritional_bar` / `golden_nutritional_bar` (barre energetique compacte pour longues expes).
- **TIP** : le Copper Pot se transporte et sert des "cups" (rations legeres) -- parfait pour miner loin de sa base. Les cave carrots poussent en cave (pas besoin de soleil). Manger les insectes/arachnides que la mine offre = zero retour surface.

#### Cultural Delights (`culturaldelights`) -- cuisine du monde
- **Element unique** : des CULTURES nouvelles (avocado tree, corn, cucumber, eggplant) et des plats "du monde reel" : tacos, burritos, empanadas, sushi rolls (midori/tropical/calamari roll), tortillas. Registre "cuisine internationale" plutot qu'une dimension.
- **Signature (3-5)** : `beef_burrito` OU `chicken_taco` (Tex-Mex, l'identite du mod), `empanada`, `midori_roll` / `tropical_roll` (sushi, roll medley), `avocado_toast` (avocado = arbre nouveau), `elote` / `creamed_corn` (mais, culture nouvelle).
- **TIP** : plante l'avocado tree, le mais, le concombre, l'aubergine pour de nouvelles cultures ; fais tes tortillas (corn dough) pour la ligne tacos/burritos. Les rolls (sushi) se coupent en slices sur cutting board.

#### Brewin' And Chewin' (`brewinandchewin`) -- FERMENTATION (section a part)
- **Element unique = mecanique differente de toute la cuisine** : la **FERMENTATION**, pas la cuisson. Bloc central le **Keg** (`keg`) : on y verse un liquide de base + des ingredients + une temperature, et le temps transforme (recipe type `brewinandchewin:fermenting`, ex verifie : vodka + carotte + sweet berries + the -> kombucha, 9600 ticks). + **Heating Cask** (chauffe/accelere), fromages fermentes (Flaxen/Scarlet Cheese Wheel qui MURISSENT du unripe au ripe). Boire donne des effets d'alcool (Tipsy/Intoxication/Raging/Sweet Heart).
- **Signature (3-5)** : `keg` (la station de fermentation, jalon obligatoire de la section), `beer` OU `mead` (alcool de base), `flaxen_cheese_wheel` (fromage qui murit, mecanique temps), `rice_wine` / `vodka` (spiritueux, base d'autres recettes), `kimchi` / `jerky` (conserves fermentees non-alcool). Cocktails avances en opt : `bloody_mary`, `red_rum`, `salty_folly`.
- **TIP** : la fermentation est passive et prend du TEMPS (le Keg travaille tout seul), a l'oppose de la cooking pot. Les fromages passent d'un etat "unripe" a "ripe" en vieillissant. Les alcools donnent des buffs ET des malus (Tipsy brouille la vue) -- a doser. NB : Brewin' depend de `farmersrespite` pour certaines recettes (the) -- verifier au registre avant task croisee.

### 10.5 Rewards cuisine (FORMAT B, jamais le plat demande)

Les refs (BigChadGuys) donnent TOUT en `xp` (25 ou 50) sur les centaines de quetes food. C'est monotone MAIS coherent avec la regle "reward != objectif" et le non-blocage (aucun plat ne gate rien). Pour Steamon, GRADUER et VARIER au lieu du xp systematique :
- **plat simple** (1 station) -> xp 25-50 (garder le pattern ref pour le volume) OU un ingredient utile (seeds de la culture concernee, ex reward de corn dish = corn_kernels x8).
- **jalon station** (cutting_board, cooking_pot, skillet, keg, copper_pot, arkenium_knife) -> reward MATERIEL lie : un autre outil/station partiel, du charbon/campfire, xp 50. Jamais le bloc demande.
- **feast block prestige** (roast_chicken, stuffed_hoglin, chorus_fruit_pie, honey_glazed_ham) -> petite reward table `culinary_bag` (tier uncommon) + xp 100.
- **fin de section addon** (rsquare) -> reward table `culinary_bag` graduee au tier de la dimension + eventuellement 1 numismatics:spur (economie fin de chapitre, PAS systematique).
- **exception boisson/alcool Brewin'** : reward un ingredient de fermentation (levure/sucre/glace) plutot que la boisson.
- Toujours `exclude_from_claim_all: true`.

### 10.6 Decoupage recommande (2 chapitres, pour quest-architect)

- **Chapitre 1 `farmers_delight`** (socle, icone `farmersdelight:hamburger`) : racine gear/rsquare "Farm to Table". Tronc lineaire des 5-6 stations (knife -> cutting_board -> cooking_pot/skillet -> stove -> compost). Puis eventail de ~10-14 plats signature (branches non-bloquantes) + 2-3 tips checkmark (nourishment, skillet-en-main, rich_soil). Le node final peut renvoyer (quest_link) vers create_2/central-kitchen (l'AUTOMATISATION de FD, deja documentee 8.6) et vers le chapitre 2 addons.
- **Chapitre 2 `delight_addons`** : un groupe visuel a 6 sections (Nether/Aether/End/Miner/Cultural/Brewin'), chacune ~4-6 quetes (station + 3-5 plats + tip). Les sections dimension (Nether/Aether/End) peuvent DEPENDRE de l'acces a la dimension (dependance inter-chapitre sur les racines nether `36F75F3A69E5E07F` / end `4000000000000B01` / aether) mais restent hors tronc critique (cuisine = confort). Brewin' est la section "fermentation" a part (mecanique distincte). Miner/Cultural sont accessibles des l'overworld.
- **Anti-repetition garantie** : chapitre 1 = uniquement namespace `farmersdelight`. Chapitre 2 = uniquement les 6 namespaces addons, chacun dans sa section. Aucun item ne peut apparaitre deux fois (namespaces disjoints). Les stations partagees (cutting board, cooking pot) sont enseignees UNE fois au chapitre 1 ; les addons les REUTILISENT sans re-quete (sauf leurs stations PROPRES : Blazier, Copper Pot, Keg, holystone stove, arkenium knife).

### 10.7 Ce qui NE doit PAS etre en quete (cuisine)

- **Chef's Delight** (`chefsdelight`) : pas de plat propre (villager Chef/Cook + automatisation de cuisson). Au plus 1 TIP dans le chapitre central-kitchen/create (embauche un Cook, automatise). PAS de task item.
- **Tomtaru's CF Tweaks** : datapack de recettes/loot, aucun item propre. Invisible au joueur. Zero quete.
- **Blocs deco/mobilier sans gameplay** : tous les `_cabinet` (12+ bois), `_canvas_sign` / `_wall_sign` / `_hanging_sign` (16 couleurs x3 = 48 signes), `tatami`, `canvas_rug`, `straw_bale`, `rope`/`rope_fence`, `safety_net`, les `_crate` de stockage cosmetique, les `_trophy` (Nether), tout le bloc-set `powdery_*` (planks/stairs/door/fence... du bois Nether deco). => a la rigueur 1 quete "deco" transverse OPTIONNELLE, jamais une quete par bloc.
- **Cuts/portions intermediaires en masse** : minced_beef, chicken_cuts, cod_slice, salmon_slice, ham, pumpkin_slice, cake_slice, tous les `_slice` de tartes/rolls. Ce sont des ingredients, pas des plats. Regrouper sous 1-2 quetes "cutting board" au lieu d'une par cut (le socle FD en a ~20).
- **display-delight / gensokyo-delight** : jars non confirmes dans l'instance testee. Deco/niche presume. NE PAS ecrire de task tant que quest-mc-knowledge n'a pas confirme les items au registre runtime.
- **Effets/enchantements** (`effect.*`, `enchantment.mynethersdelight.poaching`) : jamais des tasks item.

### 10.8 Patterns retenus de la ref BigChadGuys (`ffarmers_delight.snbt`) + garde-fous

- **BON a transposer** : icone chapitre = `farmersdelight:hamburger` ; racine `optional:true` + `checkmark` "Accept Rewards" (node d'accueil du chapitre, cf. section 6 invisible/checkmark) ; subtitles ULTRA-courts qui expliquent la station ("Similar to a campfire, but it holds 6 items" pour le stove ; "Used to chop items, place items on it, then right-click with a knife. It can also strip bark from logs" pour le cutting board) ; le node "Nourishment" en `optional:true` checkmark comme tip transverse ; regrouper la task cutting_board avec un `itemfilters:tag` `farmersdelight:tools/knives` (accepte n'importe quel knife).
- **A NE PAS reproduire (anti-pattern)** : BigChadGuys met ~180 quetes food (tout FD + oceansdelight + ubesdelight) en une seule grille geante, chacune reward `xp 25`, sans description, sans progression. C'est exhaustif mais illisible et monotone. Steamon fait l'INVERSE : peu de quetes, chacune signature, avec description en 3 temps et rewards varies/gradues. La completude n'est pas un objectif -- la pedagogie et la lisibilite le sont.
- La ref melange plusieurs addons (oceansdelight, ubesdelight) dans le meme chapitre "farmers_delight" -- Steamon SPLITTE proprement (socle vs addons, 6 sections nommees) pour la lisibilite et l'anti-repetition.

---

## Annexe A : palette de couleurs coherente (codification par theme)

ATMons applique une palette CONSTANTE : chaque concept a toujours la meme couleur, dans tout le pack. Ca aide la lecture (le joueur reconnait "Pokemon" au rouge, "Rotational Power" au rose). Palette observee (codes Minecraft `&x`) :

| Concept | Couleur | Code |
|---|---|---|
| Pokemon (le mot, partout) | rouge | `&c` |
| PC / fluides / eau | bleu / aqua | `&9` / `&b` |
| Friendship / evolution / breeding | rose | `&d` |
| Machines Create | orange/or | `&6` |
| Rotational Power / cogs | rose | `&d` |
| Items (au sens Create logistics) | jaune | `&e` |
| Contraptions / glue | vert clair | `&a` |
| Trains | violet | `&5` |
| Trainers (RCTMod) | rouge fonce | `&4` |
| Andesite / shafts / gris | gris fonce | `&8` |

Autres balises : `&l` gras, `&n` souligne, `&o` italique, `&r` reset, `&k` texte obfusque (caracteres animes, ATMons l'utilise pour masquer le nom d'un dresseur inconnu). Retours ligne dans les descriptions : `\n\n` (echapper les `&` en SNBT).

**A poser pour Steamon** : definir une palette figee et la documenter (proposition : Pokemon = `&c`, Create machines = `&6`, rotational power = `&d`, fluids = `&b`, items/logistics = `&e`, contraptions = `&a`, trains = `&5`, dresseurs/league = `&4`, economie/numismatics = `&2` ou `&6`, dimensions = couleur par dimension). quest-writer doit s'y tenir sur TOUS les chapitres.

## Annexe B : parametres globaux observes (data.snbt)

Reference pour les valeurs par defaut a poser dans le `data.snbt` de Steamon :
- `default_quest_shape: "circle"` (ATMons) ou `"hexagon"` (BigChadGuys). Steamon : au choix, une forme neutre.
- `default_autoclaim_rewards: "disabled"` : le joueur clique pour reclamer (permet les choix/tables).
- `default_consume_items: false` : les items de task ne sont pas consommes par defaut (ATMons/BigChadGuys). A decider par quete (mettre `consume_items:true` sur les quetes "remets X").
- `progression_mode: "flexible"` (ATMons) vs `"linear"` (BigChadGuys). Steamon : flexible (2 univers paralleles).
- `grid_scale: 0.5` : grille demi-unite.
- `detection_delay: 20-60` : delai de detection des tasks item.
- `loot_crate_no_drop` : boss 0 / monster 600 / passive 4000 (parametres de drop de crates, si utilises).
- IDs de chapitre/quete/table = 16 caracteres hexadecimaux uniques (voir memoire `ftb-quests-snbt-format`).

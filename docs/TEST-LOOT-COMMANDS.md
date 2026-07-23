# Commandes de test — Loot & Spawns (Steamon 2.0)

Commandes RCON / in-game (op requis) pour vérifier les modifs de loot et de spawn du datapack `steamon-tweaks`.

Serveur test : `/resourceworld` non concerné ici. Utiliser depuis la console serveur ou en jeu (op).

---

## 1. Loot des structures MVS (Moog's Voyager Structures) adaptées

Les loot tables de ces structures ont été enrichies (Cobblemon + Create + légendaires M&L à 1/1M, Master Ball 2%, Shiny Card/Golden Cap à 1/100k).

Tester une loot table = la faire drop dans un conteneur ou soi-même :

```
# Donne le contenu d'une loot table au joueur (roll unique)
/loot give @s loot mvs:abandoned
/loot give @s loot mvs:cathedral_rare
/loot give @s loot mvs:crystal
/loot give @s loot mvs:rare
/loot give @s loot mvs:pillager
```

### Toutes les loot tables MVS adaptées

| Structure | Commande |
|---|---|
| Abandoned | `/loot give @s loot mvs:abandoned` |
| Cart | `/loot give @s loot mvs:cart` |
| Large Carts | `/loot give @s loot mvs:large_carts` |
| Large Carts 2 | `/loot give @s loot mvs:large_carts_2` |
| Cartographer Tower | `/loot give @s loot mvs:cartographer_tower` |
| Cathedral (base) | `/loot give @s loot mvs:cathedral_base` |
| Cathedral (common) | `/loot give @s loot mvs:cathedral_common` |
| Cathedral (rare) | `/loot give @s loot mvs:cathedral_rare` |
| Crystal | `/loot give @s loot mvs:crystal` |
| Floating Islands | `/loot give @s loot mvs:floating_islands` |
| General | `/loot give @s loot mvs:general` |
| Houses — Books | `/loot give @s loot mvs:houses_books` |
| Houses — Brewing | `/loot give @s loot mvs:houses_brewing` |
| Houses — Common | `/loot give @s loot mvs:houses_common` |
| Houses — Desert | `/loot give @s loot mvs:houses_desert` |
| Houses — Flower | `/loot give @s loot mvs:houses_flower` |
| Houses — Rare | `/loot give @s loot mvs:houses_rare` |
| Houses — Uncommon | `/loot give @s loot mvs:houses_uncommon` |
| Jungle Tower | `/loot give @s loot mvs:jungle_tower` |
| Mushroom Pond | `/loot give @s loot mvs:mushroom_pond` |
| Pillager | `/loot give @s loot mvs:pillager` |
| Pond | `/loot give @s loot mvs:pond` |
| Rare | `/loot give @s loot mvs:rare` |
| Stable | `/loot give @s loot mvs:stable` |
| Swamps | `/loot give @s loot mvs:swamps` |

### Simuler plusieurs rolls d'un coup (voir la rareté)

```
# 20 rolls de la loot rare pour voir apparaitre les items rares (Master Ball 2%, etc.)
/loot give @s loot mvs:rare
# (repeter, ou utiliser un datapack de test / dropper le loot dans un conteneur)
```

Astuce : pour spammer un roll, garde la commande dans le presse-papier ou fais une macro. Les items 1/1M (légendaires M&L) ne sortiront quasi jamais à la main — c'est voulu.

---

## 2. Légendaires — spawn naturel bloqué (74 Pokémon)

Les 74 légendaires obtenables via les key items Myths & Legends ont leur **spawn naturel désactivé** (override `enabled:false` sur `legendary_spawns_atm`).

### Vérifier qu'un légendaire ne spawn PAS naturellement

Il n'y a pas de commande directe pour "tester un spawn désactivé". La vérif se fait par observation (aucun spawn sauvage) OU en lisant le datapack :

```
# verifier que la spawn pool est bien override (cote serveur, lecture fichier)
# world/datapacks/steamon-tweaks/data/legendary_spawns_atm/spawn_pool_world/<nom>.json
# -> doit contenir "enabled": false
```

### Forcer l'apparition d'un légendaire pour tester (via key item ou spawn direct)

```
# spawn direct d'un legendaire (pour test, contourne le blocage)
/pokespawn arceus
/pokespawn mewtwo
/pokespawn rayquaza

# donner un key item Myths & Legends (la voie legitime prevue)
/give @s mythsandlegends:<key_item>
```

### Liste des 74 légendaires bloqués (spawn naturel off)

arceus, articuno, azelf, calyrex, celebi, cobalion, cosmog, cresselia, darkrai,
dialga,엔ei (voir fichiers), enamorus, entei, eternatus, genesect, giratina, glastrier,
groudon, ho_oh, jirachi, kartana, keldeo, kubfu, kyogre, kyurem, landorus, latias,
latios, lugia, lunala, magearna, manaphy, marshadow, melmetal, meloetta, mesprit,
mew, mewtwo, moltres, necrozma, palkia, phione, raikou, rayquaza, regice, regidrago,
regieleki, regigigas, regirock, registeel, reshiram, shaymin, silvally, solgaleo,
spectrier, suicune, tapu_bulu, tapu_fini, tapu_koko, tapu_lele, terrakion, thundurus,
tornadus, type_null, uxie, victini, virizion, volcanion, xerneas, yveltal, zacian,
zamazenta, zapdos, zekrom, zeraora.

> La liste exacte = les fichiers présents dans
> `data/legendary_spawns_atm/spawn_pool_world/` (74 fichiers).

---

## 3. Vérifs rapides datapack

```
# recharger le datapack apres modif
/reload

# lister les datapacks actifs (steamon-tweaks doit y etre)
/datapack list

# tester une recette desactivee (doit dire "Unknown recipe" ou ne rien donner)
/recipe give @s cobblemon_utility:atk_bottle_cap
```

---

## 4. Loot Moog's — items spéciaux à surveiller

Dans les loot MVS enrichies, les paliers de rareté :

| Item | Chance | Où |
|---|---|---|
| Légendaire M&L (key item) | **1 / 1 000 000** | loot `rare`, `crystal`, `cathedral_rare` |
| Shiny Card | **1 / 100 000** | idem |
| Golden Cap | **1 / 100 000** | idem |
| Master Ball | **2 %** | loot `rare` |
| Candies / stones Cobblemon | pool dédié | toutes les MVS |

Pour vérifier les chances exactes : lire les fichiers
`data/mvs/loot_table/<structure>.json` (champ `chance` / `weight`).

---

## 5. Spawn un coffre rempli avec une loot table (MEILLEURE méthode de test)

Plutôt que `/loot give` (qui roll chaque pool à part et noie le cobblemon dans le vanilla),
place un **coffre** avec la loot table assignée → il se remplit à l'ouverture, tu vois TOUT le contenu.

```
# placer un coffre avec la loot mvs:rare a la position x y z
/setblock ~1 ~ ~ minecraft:chest{LootTable:"mvs:rare"}

# ou a une position absolue
/setblock 11 68 85 minecraft:chest{LootTable:"mvs:rare"}
```

Remplace `mvs:rare` par n'importe quelle table :
```
/setblock ~1 ~ ~ minecraft:chest{LootTable:"mvs:crystal"}
/setblock ~1 ~ ~ minecraft:chest{LootTable:"mvs:cathedral_rare"}
/setblock ~1 ~ ~ minecraft:chest{LootTable:"mvs:pillager"}
/setblock ~1 ~ ~ minecraft:chest{LootTable:"mvs:abandoned"}
```

**Chaque ouverture d'un NOUVEAU coffre = un nouveau roll.** Pour re-tester, casse le coffre
et replace-en un neuf (un coffre déjà ouvert garde son contenu).

### Structure d'une loot MVS (ex: rare) — ce qui est dedans

| Pool | Contenu | Rolls |
|---|---|---|
| 0 | Vanilla (diamant, fer, or, émeraude...) | 1-4 |
| 1 | Vanilla + armures | 1-2 |
| 2 | **Cobblemon** (master_ball, rare_candy, ability_capsule, pp_max, exp_candy, evolution stones...) | 1 garanti |
| 3 | **Myths & Legends** key items (adamant_orb, azure_flute, DNA splicer... = les 1/1M légendaires) | 1 (poids faible) |
| 4-5 | Cobblemon bonus | 1 |

Donc chaque coffre `rare` donne AU MOINS 1 item Cobblemon (pool 2) + une chance de key item légendaire (pool 3).

---

## 6. Localiser une structure pour voir les loots en jeu

Pour juger si les loots sont cheatés, va voir les vrais coffres dans les structures MVS générées.

### Localiser + s'y téléporter

```
# localiser la structure la plus proche (donne les coordonnees)
/locate structure mvs:cathedral

# puis te teleporter aux coordonnees affichees
/tp @s <x> <y> <z>
```

### Structures MVS avec du loot intéressant (à tester en priorité)

| Structure | Loot table | Commande locate |
|---|---|---|
| **Cathedral** (grosse, loot rare) | cathedral_base/common/rare | `/locate structure mvs:cathedral` |
| **Crystal** (loot rare) | crystal | `/locate structure mvs:crystal` |
| **Castle Ruins** | rare | `/locate structure mvs:castle_ruins` |
| **Cartographer Tower** | cartographer_tower | `/locate structure mvs:cartographer_tower` |
| **Diorite Tower** | rare | `/locate structure mvs:diorite_tower` |
| **Barn** | stable | `/locate structure mvs:barn` |
| **Desert House** | houses_desert | `/locate structure mvs:desert_house` |
| **Deepslate House** | houses_common | `/locate structure mvs:deepslate_house` |
| **Azalea House** | houses_flower | `/locate structure mvs:azelea_house` |

### Astuce : générer la structure sur place (si /locate ne trouve rien près de toi)

```
# placer directement la structure a ta position (si tu as la commande /place)
/place structure mvs:cathedral

# ou forcer la generation d'un coffre avec la loot (voir section 5)
/setblock ~1 ~ ~ minecraft:chest{LootTable:"mvs:cathedral_rare"}
```

### Ce qu'il faut regarder pour juger si c'est cheaté

- **Trop de diamants/netherite** dans les coffres communs ?
- **Master Ball trop fréquente** ? (elle est à 2% dans `rare`, ne devrait sortir que rarement)
- **Items Cobblemon en trop grande quantité** (rare candies, evolution stones) ?
- **Key items légendaires M&L** : ne devraient JAMAIS sortir naturellement (1/1M) — si tu en vois, c'est un bug de poids.

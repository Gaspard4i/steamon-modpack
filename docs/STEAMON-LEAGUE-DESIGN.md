# Steamon League — Design Form

Remplis ce formulaire pour concevoir la Steamon League (8 gyms + Elite Four + Champion).
Quand tu as fini, dis-moi "c'est bon" et l'agent `steamon-league` construira la league à partir de ça.

**Distribution** : la league va dans le **modpack** (datapack `steamon-tweaks`, distribué à tous via Modrinth), pas juste sur le serveur.
**Accès** : forcé dès le spawn (`initialSeries = steamon`) — tout nouveau joueur démarre dans la Steamon League.

---

## Contraintes (imposées, à respecter)

Ces règles cadrent l'équilibrage — remplis en les respectant, ou dis-moi si tu veux les changer.

| Étape | Niveau ~ | Taille équipe | Item de soin (bag) |
|---|---|---|---|
| Gym 1 | 12-15 | **3 Pokémon max** | 0-1 potion |
| Gym 2 | 18-22 | 3-4 | 1-2 potion |
| Gym 3 | 24-28 | 4 | 2 super potion |
| Gym 4 | 30-34 | 4-5 | 2 super potion |
| Gym 5 | 36-40 | 5 | 2 hyper potion |
| Gym 6 | 42-46 | 5 | 3 hyper potion |
| Gym 7 | 48-52 | 5-6 | 3 hyper potion |
| Gym 8 | 54-58 | 6 | 3 max potion + 1 full restore |
| Elite Four (×4) | 60-66 | 6 | full restore |
| Champion | 68-72 | 6 | full restore + revive |

Règles :
- **Courbe régulière** : chaque gym ~+6 niveaux sur le précédent. Pas de saut brutal.
- **Mono-type ou dominante** : chaque gym a un TYPE principal (l'équipe respecte ce type). Un ou deux "coverage" hors-type autorisés sur les gyms tardifs.
- **Elite Four** : 4 dresseurs forts, chacun un type/thème distinct, dans l'ordre. Le champion les suit (requiredDefeats).
- **Pokémon valides Cobblemon 1.7.3** uniquement (l'agent vérifie species/moves/abilities — si tu mets un Pokémon absent, il te le signalera).
- **Ordre imposé** : gym1 → gym2 → ... → gym8 → E4(1→2→3→4) → Champion (via requiredDefeats, le joueur doit battre dans l'ordre).

---

## GYM 1 — (le plus facile, 3 Pokémon max)

- **Nom du gym leader** : Gaz
- **Type principal** : Aucun theme carnival
- **Thème / ambiance** (facultatif, pour les dialogues) : carnival and clown 
- **Ville/lieu** (facultatif) : at a carnival in a tent the circus tent 
- **Équipe** (3 max, format : Espèce niveau — ex "Geodude 13") :
  1. mr mime de galar
  2. Brionne
  3. male Pyroar
- **Signature item** (badge/item évoquant le gym, ex minecraft:iron_ingot) : carnival gym badge 
- **Dialogue avant combat** (1 phrase, anglais) : 
- **Dialogue si le joueur gagne** (1 phrase) : 

## GYM 2 —

- **Nom** : Tama
- **Type principal** : fying
- **Thème** : aether 
- **Lieu** : aether silver dingeon the valkyrie dungeon 
- **Équipe** (3-4) : 
  1. 
  2. 
  3. 
  4. Altaria shiny
- **Signature item** : aether gym badge 
- **Dialogue avant** : 
- **Dialogue défaite** : 

## GYM 3 —

- **Nom** : Miguel
- **Type principal** : Ice and fairy 
- **Thème** : Frostfae 
- **Lieu** : snowing cherry mountains or floating island 
- **Équipe** (4) : 
  1.  Givrali
  2. momartik
  3.  Nymphali 
  4. Shiny 	Alolan Ninetales
- **Signature item** : frostfae gym badge 
- **Dialogue avant** : 
- **Dialogue défaite** : 

## GYM 4 —

- **Nom** : Tee
- **Type principal** : normal and water 
- **Thème** : pirate and turtle 
- **Lieu** : pirate ship in the sea or a dock open to sea 
- **Équipe** (4-5) : 
  1. carabaff
  2. Shuckle
  3. tortank
  4. shiny Spruce Sapling Torterra 
  5. terapagos
- **Signature item** : terra crystal terrapagos  forme stellaire +
- **Dialogue avant** : 
- **Dialogue défaite** : 

## GYM 5 —

- **Nom** : Tom 
- **Type principal** : Ground, rock and ice 
- **Thème** : archelogue 
- **Lieu** : in a cave or a search camp or in a school
- **Équipe** (5) :
  1. Vacilys
  2.  Rexillius
  3. gimmighoul in a chest 
  4. Mega ptéra 
  5.  shiny Tutétékri
- **Signature item** : archelog badge if it exist if not we have to create it from scratch 
- **Dialogue avant** : 
- **Dialogue défaite** : 

## GYM 6 —

- **Nom** : Dr. human
- **Type principal** : grass  
- **Thème** : weed 
- **Lieu** : greenhouse
- **Équipe** (5) :
  1. Ludicolo
  2. shiny Roserade
  3.   Miascarade
  4. Fragilady 
  5. shiny Méga-Scovilain
- **Signature item** : 
- **Dialogue avant** : 
- **Dialogue défaite** : 

## GYM 7 —

- **Nom** : Blade
- **Type principal** :  
- **Thème** : Dark and chaos 
- **Lieu** : the end cathedrale ( the end or a chathedrale or a dungeon)
- **Équipe** (5-6) :
  1. shiny mega Greninja
  2. Weavile
  3. Urshifu 
  4. Brute Bonnet
  5. Darkrai 
  6.  shiny Kingambit
- **Signature item** : 
- **Dialogue avant** : 
- **Dialogue défaite** : 

## GYM 8 — (le dernier gym, équipe complète)

- **Nom** : professor Hex
- **Type principal** : steel 
- **Thème** : Steampunk , iron will 
- **Lieu** : any steampunk or creeate structure, overworld
- **Équipe** (6) : check this https://pokepast.es/b4cc00ef94953654
  1. 
  2. shiny and 75% netherite 
  3. 
  4.  
  5. shiny 
  6.  
- **Signature item** : 
- **Dialogue avant** : 
- **Dialogue défaite** : 

---

## ELITE FOUR

### E4 #1 —
- **Nom** : Pai
- **Type/thème** : ghost  
- **Équipe** (6) :
  1. shiny netherite goldengo  2. mega shiny  Ectoplasma  3.  Courrousinge 4.Paragruel  5.  Lugulabre 6.  Lanssorien
- **Dialogue avant** : 

### E4 #2 —
- **Nom** : Gaz 
- **Type/thème** : circus team again
- **Équipe** (6) :
  1. shiny mr rime  2. shiny Primarina  3.  shiny félinferno 4. shiny Poliwrath    5. shiny meowscadra  6.shiny  Blacephaon
- **Dialogue avant** : 

### E4 #3 —
- **Nom** : Tama
- **Type/thème** : earthy types(rock and ground)/ heavy sandstorm team
- **Équipe** (6) :
1 Tyranitar 
2 Excadrill 
3 Garchomp 
4 Hippowdon 
5 Glimmora 
6 Mamoswine
- **Dialogue avant** : 

### E4 #4 —
- **Nom** : Professor Bee
- **Type/thème** : Bee 
- **Équipe** (6) :
  1.  2.  3.  4.  5.  6. 
- **Dialogue avant** : 

---

## CHAMPION — (le boss final)

- **Nom du champion** : Gazai
- **Thème / identité** (le champion peut être multi-type, une équipe "signature") : 
- **Équipe** (6) :
  1. simiabraz
  2. empoleon 
  3. torterra spruce form
  4. shiny fully netherite golhedngo
  5. shiny mega golurk
  6. shiny golett but a cheated one with crazy ability crazy teratyping, crazy stats and crazy 
- **Signature item / trophée** : trophé de la league 
- **Dialogue avant le combat final** : 
- **Dialogue si le joueur devient champion** : 

---

## Options globales (facultatif)

- **Nom de la league** (défaut "Steamon League") : 
- **Récompense de fin de league** (item spécial pour avoir battu le champion, ex un item rare / trophée) : trophé + acces au commande de tp ( tpa tpahere etc ( donc de bnase il faut les bloqué pour les nouveau joueur non op ) )
- **Les gyms spawnent-ils partout, ou dans des structures/lieux fixes ?** (par défaut : spawn naturel dans l'overworld selon la progression) : 
- **Autre chose que tu veux** : i want every pokmeon to have names fully 31 iv and check for the best move set for evry team and choose move set also if gym leader are in double or single  like tama elite 4 is double, gaz elite 4 is double blade is double drhuman is double hex is double  and miguel is double 
 i also want the quests to be linked to those defeat etc, and rewarded in ftb quests also if they win leaguethey also get shiny powder + golden candy + master ball 
 

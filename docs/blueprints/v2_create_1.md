# Blueprint V2 - create_1 (Cogs & Crates)

Vague 2 de la refonte des quetes FTB Steamon. Groupe **Create** `348AE7020234F2D4`, `order_index: 0`.
Ce document est un BLUEPRINT pret-a-ecrire : il fixe la structure (quetes, ids, shapes, positions, deps, taches, idees de reward, cles lang). Il ne contient ni SNBT final ni textes joueur.

- SNBT final = quest-config-writer (traduit ce blueprint + les textes ; re-verifie chaque item via quest-mc-knowledge / /give avant d'ecrire).
- Textes joueur (title/subtitle/desc) = quest-writer (remplit les cles lang de la section finale).
- Progression Create confirmee par la matiere de recherche (Create 6.0.10, MC 1.21.1). Item-ids majoritairement confirmes par le chapitre Create d'ATMons (ref auditee).

Regles appliquees : registre anti-repetition section 3.1 du master plan (FRONTIERE STRICTE : zero item create_2/3/4), non-blocage (tronc deterministe borne), branch-and-converge (archetype A3), shapes semantiques (gear = Create), FORMAT B pour les reward tables. Jamais de tiret cadratin.

Convention couleur (rappel pour quest-writer) : machines Create `&6`, rotational power/cogs `&d`, fluides `&b`, items/logistics `&e`, contraptions/glue `&a`, andesite/shafts/gris `&8`, stress (mecanique cle) accent `&c` sur "overstressed".

## CONTRAINTE CANONIQUE

La racine de create_1 porte l'id **`5D00FEC7C79E27E1`** (deja reference par le quest_link PORTE CREATE du tronc overworld V1, quest_link id `7B9BA962C45CD841`). Cet id est FIGE. Tous les autres ids sont des hex 16 uniques generes pour ce blueprint.

## FRONTIERE STRICTE (registre 3.1) - ce qui est INTERDIT ici

Ne JAMAIS mettre en task dans create_1 (appartiennent a create_2/3/4) :
- zinc_ingot, brass_ingot, brass_casing, brass_funnel, brass_tunnel (create_2). ATMons a un `create:brass_funnel` : on ne le reprend PAS. Ici seulement `andesite_funnel`.
- precision_mechanism, deployer, mechanical_arm, mechanical_crafter, sequenced_assembly (create_2).
- weighted_ejector, cart_assembler, chassis, gantry, rope_pulley, schematicannon, mechanical_piston, contraption bearings avances (create_2 : logistique/contraptions avancees). On garde ici uniquement windmill_bearing (source de rotation basique, optionnel).
- createaddition / electricite FE, capacitor, connector, electric_motor (create_3).
- trains, track, bogey, createnuclear, vibrant-vaults (create_4).

Ce qui EST le perimetre create_1 : andesite_alloy -> shaft -> cogs -> andesite_casing -> machines de base (millstone/press/mixer+basin/encased_fan) -> copper_casing -> fluides de base (pipe/pump/spout/tank/hose_pulley/item_drain) + sources de rotation (hand_crank/water_wheel/windmill) + 3 tips mecaniques (speed/stress/rotation) + Ponder + niches optionnelles (nozzle/andesite logistics/blaze heating/create-compressed/integrated-farming/encased/cobblestone).

---

# 1. Metadonnees chapitre

| Champ | Valeur |
|---|---|
| filename | `create_1` |
| id chapitre | `4C0F9A2E7B1D8635` |
| group | `348AE7020234F2D4` (Create) |
| order_index | `0` |
| title in-game (cle lang) | `&6Cogs \& Crates` (le `&` de l'esperluette est echappe `\&` en SNBT) |
| icon | `create:cogwheel` (ATMons utilise `large_cogwheel` pour son root ; on garde `cogwheel` pour l'onglet, cogwheel = premiere piece emblematique) |
| default_quest_shape | `gear` (identite Create ; la plupart des quetes-machines heritent gear) |
| default_hide_dependency_lines | `false` (le tronc Create doit montrer ses lignes : le joueur suit la progression alloy->casing->machines ; les branches optionnelles en bas portent `hide_dependency_lines:true` en local) |
| progression_mode | herite global `flexible` (les deps imposent deja l'ordre ; flexible autorise de piocher entre les 3 branches en parallele) |

Intention du chapitre : enseigner les KINETICS de base de Create facon ATMons (detaille, pedagogique) mais borne au tier andesite+copper. Racine gear surdimensionnee (Ponder + andesite alloy) -> diverge en 3 branches (KINETICS / PROCESSING / FLUIDS) -> reconverge sur un jalon rsquare "Workshop Ready" (reward table). Les niches optionnelles pendent en bas, lignes cachees, toutes `optional:true`. Ratio vise : ~17 tronc-Create obligatoire, ~13 optionnel = 30 quetes.

---

# 2. Plan de grille (a lire avant les coordonnees)

Axe : la racine est a GAUCHE (`x = -12`), la progression coule vers la DROITE (x croissant), pattern branch-and-converge horizontal (comme ATMons dont le root andesite est a x=-6 et le reste s'etale a droite). Trois branches empilees verticalement (KINETICS en haut y negatif, PROCESSING au centre y~0, FLUIDS en bas y positif), qui reconvergent a droite sur le rsquare final. Les niches optionnelles forment une rangee tout en bas (y >= 7).

```
                          KINETICS (haut, y de -6 a -1)
 ROOT -> ALLOY -> [SHAFT -> COGS -> ...tips speed/stress/rotation... ]
   |         \                                                        \
   |          -> ANDESITE_CASING (pivot) -> PROCESSING (centre, y ~ 0..2) -> CONVERGE (rsquare)
   |                                     \                                   /
   |                                      -> COPPER_CASING -> FLUIDS (bas, y 3..5)
   |
   +-- (optionnels en rangee basse y 7..9 : compressed / integrated-farming / encased / cobblestone / nozzle / andesite logistics / blaze heating)
```

Colonnes principales (x) : ROOT -12, ALLOY -10, SHAFT -8.5 (branchpoint kinetics), ANDESITE_CASING -8 (pivot central/bas), puis les 3 branches s'etalent de x=-6.5 a x=-0.5, convergence CONVERGE a x=1.5, cloture WORKSHOP a x=3.5.

Espacement : >= 1.5 unite entre centres. Les gros nodes (root gear 3.0, casings gear 2.0, rsquare 2.0) ont ~2.0 de marge. Vertical entre branches : KINETICS a y de -6..-1, PROCESSING a y -0.5..2, FLUIDS a y 3..5. 0 overlap.

---

# 3. Liste des quetes

Legende role : **TRONC** = chemin Create obligatoire (deterministe borne, lignes visibles). **BRANCHE** = maillon d'une des 3 branches, obligatoire-souple (dep du converge mais via one_completed, donc non-bloquant). **TIP** = quete pedagogique checkmark/item (mecanique). **OPT** = optionnel niche `optional:true`, lignes cachees.

Reward : par defaut FORMAT B inline (materiau Create adjacent + xp), jamais l'item demande. Tables seulement au converge/cloture. Idees d'items rewards confirmees par ATMons (ex fan -> nozzle+lava+soul_campfire).

---

## BLOC A - RACINE + ALLOY (tronc)

### R0 - Racine "Cogs & Crates" (TRONC, racine chapitre)
- id : **`5D00FEC7C79E27E1`** (FIGE)
- role : racine, entree du chapitre + meta-tip Ponder + rotational power.
- shape : `gear`, size `3.0` (surdimensionnee, distincte).
- position : `x: -12.0d, y: 0.0d`
- icon : `create:cogwheel`
- task : `type: "item"`, `item: { id: "create:andesite_alloy", count: 1 }`, `consume_items: false`. (Le tout premier jalon Create = fabriquer de l'andesite alloy : andesite + iron nugget. Deterministe, tres tot.)
- dependencies : aucune (racine ; accrochee au tronc overworld par le quest_link retour, voir section 4).
- optional : `false`.
- reward : `create:andesite_alloy` x8 (on encourage le stock du materiau de base, exception "farmer" toleree) + xp 25 inline. FORMAT B.
- intention desc (patron accroche->tip->but, LONG car mecanique cle) :
  - accroche : Create = machines a vapeur/rouages, on construit des contraptions.
  - tip META Ponder : maintenir **W** sur un item dans l'inventaire ou JEI ouvre le **Ponder**, le guide integre de Create. C'est LA ressource a utiliser tout au long du chapitre.
  - tip Rotational Power : les machines tournent grace au **Rotational Power** ; les **shafts** transmettent en ligne droite, les **cogwheels** changent la direction et inversent le sens, un large cog relie a un petit double la vitesse (et inversement la divise par 2).
  - but : l'**andesite alloy** (andesite + iron nugget) est le materiau fondateur ; on en fabrique presque tout au debut.

### A1 - "Andesite Alloy" -> pivot (TRONC)
- NOTE : la racine R0 fait deja la task andesite_alloy. A1 n'est donc PAS une redite de l'alloy ; A1 est le premier SHAFT (voir K1). On passe direct de R0 (alloy) au branchement. Pas de quete A1 separee pour eviter le doublon alloy. (Le config-writer ne cree pas de node "alloy" bis.)

---

## BLOC B - BRANCHE KINETICS (haut, y negatif)

Point d'entree kinetics = K1 (shaft), qui depend de R0. Les cogs, gearboxes et les 3 tips mecaniques rayonnent depuis K1/K2.

### K1 - "Shaft" (TRONC/entree KINETICS)
- id : `1A7F3C9D02E4B865`
- role : premiere piece transmise ; entree de la branche kinetics.
- shape : `gear`, size `1.75`
- position : `x: -8.5d, y: -2.0d`
- icon : `create:shaft`
- task : `type:"item"`, `item:{ id:"create:shaft", count:1 }`, consume_items:false.
- dependencies : `["5D00FEC7C79E27E1"]`
- optional : `false`.
- reward : `create:shaft` x8 (materiau de base, farm encourage) + xp 15 inline.
- intention desc : accroche (l'axe qui porte la rotation), tip (le shaft transmet en ligne droite ; encase-le dans un andesite/copper casing pour l'habiller et le proteger), but (relier tes premieres machines).

### K2 - "Cogwheels" (TRONC KINETICS)
- id : `2B8E4D0A13F5C976`
- role : cogwheel + large_cogwheel, coeur de la transmission.
- shape : `gear`, size `1.5`
- position : `x: -6.5d, y: -3.0d`
- icon : `create:large_cogwheel`
- tasks : deux items -> `type:"item" create:cogwheel count:1` ET `type:"item" create:large_cogwheel count:1`. consume_items:false.
- dependencies : `["1A7F3C9D02E4B865"]`
- optional : `false`.
- reward : `create:cogwheel` x6 + `create:large_cogwheel` x2 + xp 20 inline.
- intention desc : accroche (les dents qui font tout tourner), tip (un cog change la direction de 90 degres et INVERSE le sens ; large<->small = vitesse x2 ou /2 ; aligne bien les dents), but (controler vitesse et sens de tes machines).

### K3 - "Gearbox & Clutch" (BRANCHE KINETICS, controle)
- id : `3C9F5E1B24061A87`
- role : gearbox (redirection) + clutch/gearshift (controle redstone) en un node.
- shape : `gear`, size `1.25`
- position : `x: -6.5d, y: -4.5d`
- tasks : `type:"item" create:gearbox count:1` ET `type:"item" create:clutch count:1` ET `type:"item" create:gearshift count:1`. (3 items, confirme au registre par ATMons.) consume_items:false.
- dependencies : `["2B8E4D0A13F5C976"]`
- optional : `false`.
- reward : `create:shaft` x4 + `minecraft:redstone` x12 + `minecraft:lever` x1 + xp 20 inline (composants de controle, ATMons-style pour clutch/gearshift).
- intention desc : accroche (distribuer et couper la rotation), tip (le **gearbox** envoie la rotation dans 4 directions ; le **clutch** coupe le flux sur signal redstone ; le **gearshift** INVERSE le sens sur redstone), but (des systemes qui demarrent/s'arretent/s'inversent a la demande).

### K4 - TIP "Speed & RPM" (TIP mecanique 2/4)
- id : `4D0A6F2C35172B98`
- role : enseigne la vitesse (RPM) via le speedometer.
- shape : `gear`, size `1.25`
- position : `x: -8.5d, y: -4.5d`
- icon : `create:speedometer`
- task : `type:"item"`, `item:{ id:"create:speedometer", count:1 }`, consume_items:false.
- dependencies : `["1A7F3C9D02E4B865"]` (des le shaft, la mecanique vitesse est pertinente tot).
- optional : `false` (tip pedagogique du tronc, mais leger).
- reward : `create:shaft` x8 + xp 20 inline (ATMons donne exactement 8 shafts au speedometer).
- intention desc : accroche (a quelle vitesse ca tourne ?), tip (le **speedometer** lit le **RPM** d'un axe ; beaucoup de machines ont un minimum, ex le **mixer exige 30 RPM** ; accelere avec un large->small cog), but (diagnostiquer et regler la vitesse de tes machines).

### K5 - TIP "Stress & SU" (TIP mecanique 3/4, LA mecanique cle)
- id : `5E1B7A3D46283CA9`
- role : enseigne le Stress (Stress Units) via le stressometer. LE premier mur du joueur.
- shape : `gear`, size `1.5` (legerement plus gros : mecanique cle).
- position : `x: -8.5d, y: -6.0d`
- icon : `create:stressometer`
- task : `type:"item"`, `item:{ id:"create:stressometer", count:1 }`, consume_items:false.
- dependencies : `["1A7F3C9D02E4B865"]`
- optional : `false`.
- reward : `create:shaft` x8 + `create:andesite_alloy` x4 + xp 30 inline (ATMons donne 8 shafts au stressometer ; on ajoute de l'alloy pour construire plus de sources).
- intention desc (LONG, mecanique cle) : accroche (pourquoi tout s'arrete d'un coup ?), tip (chaque source de rotation fournit une **capacite** de Stress ; chaque machine **consomme** du Stress ; si la demande depasse l'offre, tout devient **&coverstressed&r** et se bloque ; le **stressometer** mesure la charge ; ajoute des **water wheels** pour plus de capacite), but (comprendre et eviter l'overstress, le principal obstacle de Create).

### K6 - TIP "Hand Crank" (TIP source manuelle, tip early)
- id : `6F2C8B4E57394DB0`
- role : premiere source de rotation, manuelle. Tip d'amorce ("avant l'automatique").
- shape : `gear`, size `1.0`
- position : `x: -6.5d, y: -6.0d`
- icon : `create:hand_crank`
- task : `type:"item"`, `item:{ id:"create:hand_crank", count:1 }`, consume_items:false.
- dependencies : `["1A7F3C9D02E4B865"]`
- optional : `true` (source d'appoint, pas indispensable ; ATMons la met sans dep dure vers la suite).
- reward : `create:cogwheel` x1 + xp 10 inline (ATMons donne 1 cogwheel a la hand crank).
- intention desc : accroche (la rotation a la force du poignet), tip (clic droit sur la **hand crank** = un burst de rotation ; parfait pour tester une machine, ouvrir une porte, actionner ponctuellement ; pas pour de l'automatique continu), but (une source instantanee avant de passer a la water wheel).

### K7 - "Water Wheel" (TRONC KINETICS, JALON = 1re vraie source auto)
- id : `7A3D9C5F68405EC1`
- role : LE jalon source de rotation. La premiere source automatique fiable.
- shape : `gear`, size `1.75` (jalon).
- position : `x: -6.5d, y: -1.0d` (remonte vers le pivot, car c'est un jalon central de la branche).
- icon : `create:water_wheel`
- tasks : `type:"item" create:water_wheel count:1` (ET optionnellement `create:large_water_wheel count:1` en 2e task si tu veux les deux ; ATMons donne les deux en reward). Recommande : 1 task water_wheel simple pour ne pas bloquer.
- dependencies : `["2B8E4D0A13F5C976"]` (apres les cogs, on sait relier une source).
- optional : `false`.
- reward : `create:water_wheel` x1 + `create:large_water_wheel` x1 + `minecraft:water_bucket` x1 + xp 30 inline (calque ATMons water_wheel reward).
- intention desc (jalon) : accroche (l'eau qui travaille pour toi), tip (place une **water wheel** contre de l'eau courante ; elle fournit une capacite de **Stress** constante sans carburant ; la **large water wheel** en donne plus ; combine plusieurs sources pour alimenter de gros reseaux), but (ta premiere source d'energie automatique, la fin de la manivelle).

### K8 - OPT "Windmill" (OPT source alternative)
- id : `8B4E0D6A79516FD2`
- role : source alternative (bearing + sails). Optionnelle (plus de setup).
- shape : `gear`, size `1.0`
- position : `x: -5.0d, y: -6.5d` (rangee kinetics, extremite)
- icon : `create:windmill_bearing`
- tasks : `type:"item" create:windmill_bearing count:1` ET `type:"item" create:white_sail count:1` (ATMons demande exactement ces deux). consume_items:false.
- dependencies : `["7A3D9C5F68405EC1"]`
- optional : `true` ; `hide_dependency_lines:true`.
- reward : `create:white_sail` x8 + `create:super_glue` x1 + xp 20 inline (calque ATMons windmill reward).
- intention desc : accroche (le vent comme moteur), tip (assemble un **windmill bearing** + au moins 8 **sails** collees, active le bearing : le vent tourne la structure et genere du Stress ; le rendement depend du nombre et de la surface des voiles), but (une source sans eau, utile en hauteur ou en desert).

---

## BLOC C - PIVOT ANDESITE CASING (tronc, branchpoint central)

### P0 - "Andesite Casing" (TRONC, pivot vers PROCESSING et COPPER)
- id : `9C5F1E7B8A627003`
- role : le casing andesite, prerequis de presque toutes les machines. Pivot : depend de l'alloy (R0), debloque PROCESSING et la voie copper.
- shape : `gear`, size `2.0` (jalon structurel).
- position : `x: -8.0d, y: 0.0d`
- icon : `create:andesite_casing`
- task : `type:"item"`, `item:{ id:"create:andesite_casing", count:1 }`, consume_items:false. (Recette : andesite alloy + strippé log + andesite. Deterministe.)
- dependencies : `["5D00FEC7C79E27E1"]` (depend de la racine/alloy ; parallele a la branche kinetics, ce qui laisse le joueur choisir kinetics d'abord ou casing d'abord).
- optional : `false`.
- reward : `create:andesite_casing` x4 (ATMons donne 4) + xp 25 inline.
- intention desc : accroche (le coffrage qui rend une machine "vraie"), tip (l'**andesite casing** habille shafts et cogs et sert de base a presque toutes les machines de ce tier ; recette = andesite alloy + rondin ecorce + andesite), but (la piece-cle qui ouvre les machines de traitement).

---

## BLOC D - BRANCHE PROCESSING (centre, y ~ -0.5 a 2)

Toutes dependent de P0 (andesite_casing). Les machines de traitement de base.

### PR1 - "Millstone" (BRANCHE PROCESSING)
- id : `0D6A2F8C9B738114`
- role : premier broyeur (pas de rotation externe cote sortie ; broie in-place).
- shape : `gear`, size `1.25`
- position : `x: -6.0d, y: -0.5d`
- icon : `create:millstone`
- task : `type:"item"`, `item:{ id:"create:millstone", count:1 }`, consume_items:false.
- dependencies : `["9C5F1E7B8A627003"]`
- optional : `false`.
- reward : `minecraft:iron_ore` x4 + `minecraft:cobblestone` x16 + xp 15 inline (matiere a broyer, coherent, pas la machine).
- intention desc : accroche (moudre sans usine), tip (le **millstone** broie un item pose dedans quand on lui donne de la rotation ; parfait tot pour transformer minerais en poudre, faire de la farine, etc. ; sortie par le bas ou clic), but (ton premier procede de transformation).

### PR2 - "Mechanical Press" (BRANCHE PROCESSING, jalon)
- id : `1E7B3A9D0C849225`
- role : press (fabrique plaques, aplati, sert au packing). Jalon car tres utilise.
- shape : `gear`, size `1.5`
- position : `x: -4.0d, y: -0.5d`
- icon : `create:mechanical_press`
- task : `type:"item"`, `item:{ id:"create:mechanical_press", count:1 }`, consume_items:false.
- dependencies : `["9C5F1E7B8A627003"]`
- optional : `false`.
- reward : `minecraft:iron_ingot` x9 + `minecraft:gold_ingot` x1 + xp 20 inline (calque ATMons press reward).
- intention desc : accroche (la presse a tout faire), tip (le **mechanical press** pose au-dessus d'un depot/belt aplati les items en plaques ; combine-le avec un **basin** pour le "compacting" / packing 2x2 3x3 ; a besoin de rotation), but (plaques et compression, base de tant de recettes).

### PR3 - "Mixer & Basin" (BRANCHE PROCESSING, jalon)
- id : `2F8C4B0E1D95A336`
- role : mechanical_mixer + basin (melange/brassage). Rappelle le seuil 30 RPM (lien K4).
- shape : `gear`, size `1.5`
- position : `x: -2.0d, y: -0.5d`
- icon : `create:mechanical_mixer`
- tasks : `type:"item" create:mechanical_mixer count:1` ET `type:"item" create:basin count:1`. consume_items:false.
- dependencies : `["9C5F1E7B8A627003"]`
- optional : `false`.
- reward : `minecraft:glowstone_dust` x5 + `minecraft:redstone` x5 + `minecraft:nether_wart` x5 + xp 20 inline (calque ATMons mixer reward, ingredients de brassage).
- intention desc : accroche (melanger des ingredients en un produit), tip (le **mechanical mixer** au-dessus d'un **basin** combine plusieurs items selon une recette ; il exige au moins **30 RPM** (voir le speedometer) ; recupere la sortie sous le basin), but (le brassage, cle des recettes composees et plus tard des alliages).

### PR4 - "Encased Fan" (BRANCHE PROCESSING, tip mecanique fun)
- id : `3A9D5C1F2E06B447`
- role : encased_fan (blast/smoke/wash/haunt). Emblematique, tres pedagogique (calque exact ATMons).
- shape : `gear`, size `1.5`
- position : `x: 0.0d, y: -0.5d`
- icon : `create:encased_fan`
- task : `type:"item"`, `item:{ id:"create:encased_fan", count:1 }`, consume_items:false.
- dependencies : `["9C5F1E7B8A627003"]`
- optional : `false`.
- reward : `create:nozzle` x1 + `minecraft:lava_bucket` x1 + `minecraft:soul_campfire` x1 (calque EXACT du reward ATMons encased_fan : le kit pour equiper le fan tout de suite) + xp 25 inline.
- intention desc (LONG, patron ATMons) : accroche (une machine sous-cotee), tip (le **encased fan** souffle dans le sens ou la rotation l'entraine ; place de la **lave** devant = il **blast** comme un four ; du **feu** = il **smoke** ; de l'**eau** = il **wash** (ex sable en ce que de droit) ; du **soul fire** = **haunt**), but (un four/laveur multi-usage tres bon marche, la porte des procedes en volume). NB : le **nozzle** (reward) diffuse l'effet en zone, voir la niche N-NOZZLE.

---

## BLOC E - VOIE COPPER + BRANCHE FLUIDS (bas, y 1.5 a 5)

### CU0 - "Copper Casing" (TRONC, pivot FLUIDS)
- id : `4B0E6D2A3F17C558`
- role : casing copper, prerequis des machines a fluides. Pivot de la branche fluides.
- shape : `gear`, size `1.75` (jalon).
- position : `x: -8.0d, y: 2.0d`
- icon : `create:copper_casing`
- task : `type:"item"`, `item:{ id:"create:copper_casing", count:1 }`, consume_items:false.
- dependencies : `["9C5F1E7B8A627003"]` (apres andesite_casing : la logique de casing est acquise ; recette copper = copper sheet + log ; on peut aussi depend de R0 seul, mais enchainer sur P0 garde le flux lisible).
- optional : `false`.
- reward : `create:copper_casing` x4 (ATMons donne 4) + xp 25 inline.
- intention desc : accroche (le coffrage des fluides), tip (le **copper casing** (feuille de cuivre + rondin, via press) est la base des machines qui manipulent des **&bliquides&r** ; presse du cuivre en sheet d'abord), but (ouvrir toute la logistique des fluides).

### FL1 - "Fluid Pipes & Pump" (BRANCHE FLUIDS)
- id : `5C1F7E3B4A28D669`
- role : fluid_pipe + mechanical_pump (transport de fluides).
- shape : `gear`, size `1.25`
- position : `x: -6.0d, y: 3.5d`
- icon : `create:fluid_pipe`
- tasks : `type:"item" create:fluid_pipe count:1` ET `type:"item" create:mechanical_pump count:1`. consume_items:false.
- dependencies : `["4B0E6D2A3F17C558"]`
- optional : `false`.
- reward : `create:fluid_pipe` x10 (ATMons donne 10) + `minecraft:water_bucket` x1 + xp 20 inline.
- intention desc : accroche (faire couler les liquides), tip (les **&bfluid pipes&r** transportent l'eau/lave/miel ; une **mechanical pump** met le fluide en mouvement et impose le sens ; les pipes doivent former un circuit ferme entre sources et cuves), but (deplacer des fluides a volonte).

### FL2 - "Fluid Tank" (BRANCHE FLUIDS)
- id : `6D2A8F4C5B39E770`
- role : fluid_tank (stockage de fluides).
- shape : `gear`, size `1.25`
- position : `x: -4.0d, y: 3.5d`
- icon : `create:fluid_tank`
- task : `type:"item"`, `item:{ id:"create:fluid_tank", count:1 }`, consume_items:false.
- dependencies : `["4B0E6D2A3F17C558"]`
- optional : `false`.
- reward : `create:fluid_tank` x2 + `minecraft:glass` x8 + xp 15 inline.
- intention desc : accroche (ou stocker un lac), tip (le **fluid tank** stocke de grands volumes ; empile-les en hauteur et largeur pour une seule cuve geante ; une fenetre montre le niveau), but (tampon de fluides pour tes machines).

### FL3 - "Spout" (BRANCHE FLUIDS)
- id : `7E3B9A5D6C40F881`
- role : spout (remplit des items avec du fluide, ex bottling).
- shape : `gear`, size `1.25`
- position : `x: -2.0d, y: 3.5d`
- icon : `create:spout`
- task : `type:"item"`, `item:{ id:"create:spout", count:1 }`, consume_items:false.
- dependencies : `["5C1F7E3B4A28D669"]` (apres pipes/pump : il faut amener le fluide au spout).
- optional : `false`.
- reward : `minecraft:bucket` x3 + `minecraft:glass_bottle` x3 + `create:blaze_cake_base` x1 + xp 20 inline (calque ATMons spout reward).
- intention desc : accroche (verser un fluide dans un item), tip (le **spout** au-dessus d'un depot/belt remplit un item avec le fluide qu'on lui pipe (potions, blaze cakes, etc.) ; sa contrepartie l'**item drain** vide un item de son fluide, voir la niche), but (embouteiller et remplir automatiquement).

### FL4 - "Hose Pulley" (BRANCHE FLUIDS, jalon fin de branche)
- id : `8F4C0B6E7D51A992`
- role : hose_pulley (pomper/deverser des masses de fluide dans le monde). Fin haute de la branche fluides.
- shape : `gear`, size `1.5`
- position : `x: 0.0d, y: 3.5d`
- icon : `create:hose_pulley`
- task : `type:"item"`, `item:{ id:"create:hose_pulley", count:1 }`, consume_items:false.
- dependencies : `["5C1F7E3B4A28D669"]`
- optional : `false`.
- reward : `minecraft:water_bucket` x2 + `create:mechanical_pump` x1 + xp 25 inline (calque ATMons hose_pulley reward).
- intention desc : accroche (vider un ocean, remplir une vallee), tip (la **hose pulley** descend un tuyau et pompe (ou deverse) des nappes de fluide entieres ; combine-la avec pump + tank pour un reservoir infini d'eau), but (approvisionner tes machines en fluide a l'echelle).

---

## BLOC F - CONVERGENCE + CLOTURE (droite)

### CV - "Machine Shop" (CONVERGENCE 3 branches, node checkmark)
- id : `9A5D1C7F8E62B0A3`
- role : node de convergence des 3 branches. Ne demande pas un nouvel item : valide que le joueur a touche aux 3 aspects. Non-bloquant via one_completed.
- shape : `circle`, size `1.5`
- position : `x: 1.5d, y: 1.5d` (centre-droit, entre les 3 branches)
- icon : `create:andesite_casing`
- task : `type:"checkmark"`.
- dependencies : `["3A9D5C1F2E06B447","8F4C0B6E7D51A992","5E1B7A3D46283CA9"]` (fin PROCESSING = encased_fan, fin FLUIDS = hose_pulley, mecanique cle KINETICS = stressometer). `dependency_requirement: "one_completed"` (des qu'UNE des 3 branches est terminee, la convergence est franchissable -> aucune branche ne bloque le chapitre). `hide_dependency_lines: true` (evite le spaghetti des 3 traits).
- optional : `false` (mais non-bloquant par one_completed).
- reward : xp 30 + 1 tirage `cogs_crates_rewards` (uncommon Create materials). FORMAT B `type:"random"`.
- intention desc : accroche (ton atelier prend forme), tip (tu as vu les 3 piliers : la **rotation** (kinetics), le **traitement** (machines) et les **&bfluides&r** ; combine-les pour automatiser), but (valider les bases avant le tier suivant).

### WORKSHOP - "Workshop Ready" (CLOTURE chapitre, rsquare reward table)
- id : `0B6E2D8A9F73C1B4`
- role : cloture du chapitre create_1. Jalon a reward table. Pointe (via quest_link create_2 futur) vers Rotational Power. Premiere recompense Numismatics du chapitre (au rsquare final SEULEMENT, comme la regle).
- shape : `rsquare`, size `2.0` (jalon a reward table, convention).
- position : `x: 3.5d, y: 1.5d`
- icon : `create:copper_casing` (ou `create:andesite_casing` ; recommande copper : symbolise la maitrise des 2 casings).
- task : `type:"checkmark"` (cloture ; le joueur a fait le tour). Alternative : `type:"item"` andesite_casing x8 pour une "preuve" ; recommande checkmark pour ne pas re-taxer.
- dependencies : `["9A5D1C7F8E62B0A3"]` (le converge).
- optional : `false`.
- reward : xp_levels 5 + 1 tirage `cogs_crates_rewards` (uncommon) + `numismatics:spur` x8 (PREMIERE monnaie Numismatics du chapitre, petit palier, FORMAT B item). Structure : `{type:"xp_levels", xp_levels:5}` + `{type:"random", table_id:<cogs_crates_rewards long>L}` + `{type:"item", item:{id:"numismatics:spur", count:8}}`.
- intention desc (registre prestige leger) : accroche (l'atelier andesite est complet), tip (tu maitrises alloy, casings, rotation, traitement et fluides ; la suite = le **&elaiton&r** (brass), la precision et l'automatisation avancee dans **Rotational Power**), but (jalon de fin de tier ; premiere monnaie ; porte vers create_2).

---

## BLOC G - NICHES OPTIONNELLES (rangee basse, y 7..9, toutes optional:true, lignes cachees)

Toutes ces quetes : `optional: true`, `hide_dependency_lines: true`. Elles pendent sous le chapitre, ne bloquent rien, rendent create_1 vivant. Dep : la plupart sur P0 (andesite_casing) ou R0, selon prerequis reel.

### N-NOZZLE - OPT "Nozzle" (niche fan)
- id : `1C7F3E9D0A84D2C5`
- role : nozzle sur le fan (diffusion en zone).
- shape : `octagon`, size `1.0`
- position : `x: 0.0d, y: 7.0d`
- icon : `create:nozzle`
- task : `type:"item"`, `item:{ id:"create:nozzle", count:1 }`, consume_items:false.
- dependencies : `["3A9D5C1F2E06B447"]` (encased_fan). optional:true, hide_dependency_lines:true.
- reward : `minecraft:iron_ingot` x4 + xp 15 inline.
- intention desc : accroche (souffler en spherique), tip (le **nozzle** sur la face d'un encased fan diffuse l'effet (froid/chaleur/wash) dans une zone autour, au lieu d'un jet directionnel), but (traiter une aire, ex zone de refroidissement).

### N-LOGISTICS - OPT "Andesite Logistics" (niche logistique items, PAS brass)
- id : `2D8A4F0E1B95E3D6`
- role : andesite_funnel + andesite_tunnel + chute + smart_chute (transport d'items andesite-tier). ATTENTION : PAS create:funnel (n'existe pas), c'est create:andesite_funnel. PAS de brass_funnel/tunnel (create_2).
- shape : `octagon`, size `1.25`
- position : `x: 2.0d, y: 7.0d`
- icon : `create:andesite_funnel`
- tasks : `type:"item" create:andesite_funnel count:1` ET `type:"item" create:andesite_tunnel count:1` ET `type:"item" create:chute count:1` ET `type:"item" create:smart_chute count:1`. consume_items:false. (Tous confirmes au registre par ATMons.)
- dependencies : `["9C5F1E7B8A627003"]` (andesite_casing). optional:true, hide_dependency_lines:true.
- reward : `create:belt_connector` x8 + `create:andesite_funnel` x2 + xp 20 inline (belts = ATMons donne du belt_connector aux logistics).
- intention desc : accroche (deplacer des items sans les toucher), tip (l'**&eandesite funnel&r** insere/extrait entre inventaire et belt ; le **tunnel** repartit sur une belt ; le **chute** transporte verticalement, le **smart chute** filtre ; c'est la logistique de base, le laiton offrira mieux plus tard), but (chainer tes machines par des belts et funnels).

### N-DRAIN - OPT "Item Drain" (niche fluide)
- id : `3E9B5A1F2C06F4E7`
- role : item_drain (vider le fluide d'un item, ex vider des seaux/bottles sur belt).
- shape : `octagon`, size `1.0`
- position : `x: 4.0d, y: 7.0d`
- icon : `create:item_drain`
- task : `type:"item"`, `item:{ id:"create:item_drain", count:1 }`, consume_items:false.
- dependencies : `["4B0E6D2A3F17C558"]` (copper_casing). optional:true, hide_dependency_lines:true.
- reward : `minecraft:bucket` x4 + xp 15 inline.
- intention desc : accroche (recuperer le fluide d'un contenant), tip (l'**item drain** vide un item rempli (seau, bouteille) de son **&bfluide&r** quand il passe dessus, et rend le contenant vide ; complementaire du spout), but (recycler des fluides depuis des items).

### N-DRILLSAW - OPT "Drill & Saw" (niche outils fixes)
- id : `4F0C6B2A3D17A5F8`
- role : mechanical_drill + mechanical_saw en poste fixe (hors contraption). Niche fun.
- shape : `octagon`, size `1.0`
- position : `x: 6.0d, y: 7.0d`
- icon : `create:mechanical_saw`
- tasks : `type:"item" create:mechanical_drill count:1` ET `type:"item" create:mechanical_saw count:1`. consume_items:false.
- dependencies : `["9C5F1E7B8A627003"]`. optional:true, hide_dependency_lines:true.
- reward : `minecraft:oak_sapling` x6 + `minecraft:iron_ore` x4 + xp 20 inline (calque ATMons drill/saw rewards).
- intention desc : accroche (des outils qui bossent seuls), tip (le **mechanical drill** casse le bloc devant lui, la **mechanical saw** coupe (arbres, planches, decoupe FD plus tard) ; en poste fixe avec de la rotation, sans contraption), but (mini-automatisation de recolte de bloc).

### N-HEATING - OPT "Blaze Heating" (niche chauffage, reste andesite-tier)
- id : `5A1D7C3B4E28B609`
- role : blaze_burner + blaze_cake (chauffage des basins pour recettes chauffees). Mini-arc.
- shape : `octagon`, size `1.0`
- position : `x: 8.0d, y: 7.0d`
- icon : `create:blaze_burner`
- tasks : `type:"item" create:blaze_burner count:1` ET `type:"item" create:blaze_cake count:1`. consume_items:false.
- dependencies : `["2F8C4B0E1D95A336"]` (mixer/basin : le chauffage sert au basin). optional:true, hide_dependency_lines:true.
- reward : `create:empty_blaze_burner` x3 + `minecraft:coal_block` x4 + xp 20 inline (calque ATMons blaze_burner reward).
- intention desc : accroche (le feu qui cuisine tes recettes), tip (attrape un blaze pour le **blaze burner** ; nourri au charbon il chauffe (**heated**), au **blaze cake** il surchauffe (**superheated**) ; certaines recettes de basin exigent de la chaleur), but (debloquer les recettes chauffees du mixer/basin).

### N-COMPRESSED - OPT "Create Compressed" (niche QoL, mod addon)
- id : `6B2E8D4C5F39C71A`
- role : create-compressed (blocs compresses 9x, QoL de stockage). Namespace runtime a extraire du jar (slug Modrinth `Sy4Box1J`, filename `create_compressed-2.2.0` -> namespace probable `create_compressed` ou `createcompressed`). DOUTEUX : le config-writer confirme le namespace + un item emblematique via quest-mc-knowledge.
- shape : `octagon`, size `1.0`
- position : `x: 10.0d, y: 7.0d`
- icon : DOUTEUX (ex `createcompressed:compressed_...` a confirmer ; fallback `create:andesite_casing`).
- task : `type:"item"`, item DOUTEUX = un bloc compresse du mod (ex un ingot/nugget block compresse). Config-writer choisit un item accessible andesite-tier. consume_items:false.
- dependencies : `["5D00FEC7C79E27E1"]`. optional:true, hide_dependency_lines:true.
- reward : `create:andesite_alloy` x8 + xp 15 inline.
- intention desc : accroche (compresser pour ranger), tip (create-compressed permet de compacter des ressources en blocs 9x (et au-dela) pour gagner de la place et du transport ; se decompresse a l'inverse), but (une QoL de stockage precoce). NB config-writer : SI le namespace/l'item n'est pas confirme donnable, passer la task en `checkmark` plutot que d'inventer un id.

### N-INTFARM - OPT "Integrated Farming: Roost" (niche mod addon)
- id : `7C3F9E5D6A40D82B`
- role : create-integrated-farming, le **roost** (poulailler automatique) + fishing net. Namespace a extraire (slug `9k1pAsfR`, filename `create-integrated-farming-1.2.6` -> namespace probable `create_integrated_farming` ou `integrated_farming`). DOUTEUX. NB recherche : ce mod dependrait de create-dragons-plus (create_2) ; le config-writer VERIFIE que l'item roost est bien au registre runtime et donnable AVANT de le mettre ; sinon checkmark.
- shape : `octagon`, size `1.0`
- position : `x: 12.0d, y: 7.0d`
- icon : DOUTEUX (ex `...:roost` ; fallback `minecraft:egg`).
- task : `type:"item"`, item DOUTEUX = le roost (ou un item accessible du mod). consume_items:false. Fallback `checkmark` si non confirme.
- dependencies : `["9C5F1E7B8A627003"]`. optional:true, hide_dependency_lines:true.
- reward : `minecraft:egg` x8 + `minecraft:wheat_seeds` x8 + xp 15 inline.
- intention desc : accroche (une ferme qui tourne seule), tip (le **roost** de Create: Integrated Farming automatise l'elevage (oeufs/animaux) avec de la rotation ; le fishing net peche passivement), but (une automatisation fermiere douce, dans le theme Create). NB config-writer : verifier disponibilite avant d'ecrire ; sinon checkmark.

### N-ENCASED - OPT "Casing Styles" (niche cosmetique, mod addon)
- id : `8D4A0F6E7B51E93C`
- role : create-encased (habillage cosmetique : encaser shafts/pipes en styles varies). Namespace a extraire (slug `hSSqdyU1` -> probable `create_encased` ou `encased`). DOUTEUX.
- shape : `octagon`, size `1.0`
- position : `x: 14.0d, y: 7.0d`
- icon : DOUTEUX (ex un encased shaft variant ; fallback `create:andesite_casing`).
- task : `type:"item"`, item DOUTEUX = un bloc encased du mod. Fallback `checkmark`. consume_items:false.
- dependencies : `["9C5F1E7B8A627003"]`. optional:true, hide_dependency_lines:true.
- reward : `create:andesite_casing` x4 + `create:copper_casing` x2 + xp 15 inline.
- intention desc : accroche (habiller ses machines), tip (create-encased ajoute des variantes cosmetiques de casings/encased shafts pour styliser tes contraptions sans changer leur fonction), but (une usine qui a de la gueule). NB config-writer : checkmark si item non confirme.

### N-COBBLE - OPT "Cobblestone Engine" (niche mod addon, PRUDENCE crash NBT)
- id : `9E5B1A7F8C62F04D`
- role : create-cobblestone (generation de cobblestone via Create). Namespace : slug `ihpnEd80`, filename `createcobblestone-1.4.11` -> namespace probable `createcobblestone`. PRUDENCE : ce mod a cause un crash NBT (voir memoire steamon-native-crash-createcobblestone). 1 tip MAX. Si le validator/config-writer juge instable ou l'item non donnable proprement -> SKIP cette quete entierement.
- shape : `octagon`, size `1.0`
- position : `x: 16.0d, y: 7.0d`
- icon : DOUTEUX ; fallback `minecraft:cobblestone`.
- task : `type:"checkmark"` RECOMMANDE (ne pas demander un craft d'un mod a risque NBT ; un checkmark evite tout probleme d'item). Alternative item seulement si config-writer confirme un id donnable stable.
- dependencies : `["5D00FEC7C79E27E1"]`. optional:true, hide_dependency_lines:true.
- reward : `minecraft:cobblestone` x32 + xp 10 inline.
- intention desc : accroche (de la pierre a l'infini), tip (create-cobblestone genere de la cobblestone via une machine Create, pratique pour les recettes en volume), but (une source de cobble automatisee). NB config-writer : SKIP si instable (memoire crash NBT) ; sinon garder en checkmark.

---

# 4. quest_links (create_1)

### Lien RETOUR vers overworld (le tronc)
- Le tronc overworld (V1) porte deja un quest_link PORTE CREATE (`7B9BA962C45CD841`, gear size 1.5, a `x:-3.5 y:7.5` dans overworld) dont le `linked_quest` cible = `5D00FEC7C79E27E1` (= R0). C'est LE lien d'accroche. Rien a refaire cote overworld.
- OPTIONNEL (recommande pour la navigation) : ajouter DANS create_1 un quest_link retour vers la racine overworld, pour que le joueur revienne au tronc depuis Create.
  - quest_link id : `A0F62B8D4E17C395`
  - linked_quest CIBLE : `38AE9C9E0567DD5C` (J-ROOT de overworld, "The Steamon Journey").
  - shape : `hexagon` (forme dediee tronc/Journey), size `1.5`
  - position : `x: -14.0d, y: 0.0d` (a gauche de R0, hors de la grille des quetes).
  - note : purement navigationnel, non-bloquant, n'affiche que le titre de la quete liee.

### Lien SORTIE vers create_2 (a poser en Vague 2 quand create_2 existe)
- Le node WORKSHOP (`0B6E2D8A9F73C1B4`) est le point de sortie vers create_2 (Rotational Power). Le quest_link create_1 -> create_2 sera pose quand create_2 sera blueprinte (sa racine portera un id a figer par l'orchestrator). NE PAS l'inventer ici.
- Le quest_link create_3 -> cobblemon (Poke Ball) est gere en create_3, PAS ici.

---

# 5. Reward tables

### `cogs_crates_rewards` (REUTILISER si existe en v2, sinon CREER)
- Recherche : aucune table `cogs_crates_rewards` trouvee dans le repo actuel (grep negatif). => a CREER par le config-writer.
- id table : `C05C4A7E5B100D12` (hex 16 valide ; le config-writer peut regenerer si collision).
- role : tier **uncommon** Create materials. Utilisee par CV (converge) et WORKSHOP (cloture).
- `loot_size: 1`, `use_title: true`, `exclude_from_claim_all: true` (garde-fou anti-farm).
- contenu indicatif FORMAT B (materiaux Create adjacents andesite/copper-tier, pas d'item create_2+) :
  - `{ id:"<hex>", type:"item", item:{ id:"create:andesite_alloy", count:8 }, weight:15.0f }`
  - `{ id:"<hex>", type:"item", item:{ id:"create:shaft", count:8 }, weight:15.0f }`
  - `{ id:"<hex>", type:"item", item:{ id:"create:cogwheel", count:6 }, weight:12.0f }`
  - `{ id:"<hex>", type:"item", item:{ id:"create:andesite_casing", count:4 }, weight:10.0f }`
  - `{ id:"<hex>", type:"item", item:{ id:"create:copper_casing", count:3 }, weight:8.0f }`
  - `{ id:"<hex>", type:"item", item:{ id:"create:belt_connector", count:8 }, weight:10.0f }`
  - `{ id:"<hex>", type:"item", item:{ id:"create:super_glue", count:1 }, weight:6.0f }`
  - `{ id:"<hex>", type:"item", item:{ id:"create:fluid_tank", count:2 }, weight:6.0f }`
  - `{ id:"<hex>", type:"item", item:{ id:"minecraft:copper_block", count:4 }, weight:8.0f }`
  - (option rare) `{ id:"<hex>", type:"item", item:{ id:"create:water_wheel", count:1 }, weight:3.0f }`
- Lien quete->table (dans CV et WORKSHOP) : `{ id:"<hex16_unique>", type:"random", table_id:<cogs_crates_rewards en long decimal signe>L }`. Le config-writer calcule le long depuis l'hex de la table.

### Pas de deuxieme table
- Le brief mentionne `create_materials` common/uncommon : une seule table `cogs_crates_rewards` (uncommon) suffit pour create_1 (2 usages : CV + WORKSHOP). Ne pas creer de table common separee ; les petites recompenses du chapitre sont toutes inline (materiau adjacent + xp), ce qui reste lisible. Si l'orchestrator veut une common partagee multi-chapitres Create, la creer au niveau global (hors create_1), pas ici.

---

# 6. Topologie visuelle (create_1)

Losange horizontal branch-and-converge (calque de l'esprit ATMons : root a gauche, flux vers la droite) :

```
  x:  -14   -12    -10   -8.5  -8    -6.5  -6    -4    -2    0     1.5   3.5
 y:-6.5                    K5·         K8
 y:-6.0                    K5    K6
 y:-4.5              K4    K3
 y:-3.0                    K2
 y:-2.0              K1
 y:-1.0                    K7
 y: 0.0  [link] ROOT  ALLOY.. P0                                     
 y:-0.5                          (P0)  PR1   PR2   PR3   PR4
 y: 1.5                                                        CV   WORKSHOP
 y: 2.0                          CU0
 y: 3.5                          (CU0) FL1   FL2   FL3   FL4
 y: 7.0        N-NOZZLE(0) N-LOGISTICS(2) N-DRAIN(4) N-DRILLSAW(6) N-HEATING(8) N-COMPRESSED(10) N-INTFARM(12) N-ENCASED(14) N-COBBLE(16)
```

Lecture :
- **Colonne racine** : `link retour(-14)` -> `ROOT(-12)`. ROOT alimente 2 fils : la branche KINETICS (via K1 shaft en haut-gauche) et le pivot P0/CU0 (andesite/copper casing).
- **KINETICS** (haut, y negatif) : K1(shaft) -> K2(cogs) -> K3(gearbox), avec K4(speed), K5(stress), K6(hand_crank), K7(water_wheel jalon), K8(windmill opt). Rayonne autour de x -8.5..-5.
- **PROCESSING** (centre, y -0.5) : P0(andesite_casing pivot) -> PR1(millstone) PR2(press) PR3(mixer/basin) PR4(encased_fan), en ligne horizontale x -6..0.
- **FLUIDS** (bas, y 3.5) : CU0(copper_casing pivot) -> FL1(pipes/pump) FL2(tank) FL3(spout) FL4(hose_pulley), en ligne horizontale.
- **Convergence** : CV(circle, x1.5 y1.5) recoit PR4 + FL4 + K5 en `one_completed` (hide_dependency_lines) -> WORKSHOP(rsquare, x3.5 y1.5) = cloture + table.
- **Niches** : rangee unique tout en bas (y7), espacees de 2 en x (0,2,4,6,8,10,12,14,16), toutes optional + hide_dependency_lines. Elles pendent sans relier visuellement (les traits vers leurs parents P0/CU0/R0 sont caches).

Lignes de dependance : VISIBLES sur le tronc (ROOT->casings->branches, le joueur suit) ; CACHEES localement sur CV (3 deps convergentes) et sur toutes les niches (rangee basse). Espacement >= 1.5 partout ; les gros nodes (ROOT 3.0, casings 1.75-2.0, WORKSHOP 2.0) ont >= 2.0 de marge. 0 overlap : verifier que ROOT(size3 -> rayon ~1.5) a -12 ne touche pas ALLOY (pas de node alloy separe) ni le link(-14). Marge 2.0 OK.

Symetrie : KINETICS en haut et FLUIDS en bas sont equilibrees autour de PROCESSING (centre), formant le losange. Les 3 branches ont des longueurs comparables (4-5 nodes chacune) et convergent au meme point.

---

# 7. Cles lang a produire (create_1) - pour quest-writer

Prefixe selon le format ATMons (lang/en_us.snbt : `quest.<id>.title`, `.quest_subtitle`, `.quest_desc` ; `chapter.<id>.title`). Le config-writer confirme le namespace exact genere par ftbquests. Chaque quete non triviale = 3 temps (accroche -> tip -> but).

- `chapter.4C0F9A2E7B1D8635.title` -> titre chapitre. Intention : "Cogs & Crates", l'atelier andesite de Create.
- R0 `5D00FEC7C79E27E1` : title/subtitle/desc. Intention : racine ; Ponder (W) + rotational power + andesite alloy (LONG).
- K1 `1A7F3C9D02E4B865` : title/subtitle/desc. Intention : shaft, transmission en ligne droite.
- K2 `2B8E4D0A13F5C976` : title/subtitle/desc. Intention : cogwheels, direction/inversion/vitesse x2 /2.
- K3 `3C9F5E1B24061A87` : title/subtitle/desc. Intention : gearbox + clutch + gearshift, controle redstone.
- K4 `4D0A6F2C35172B98` : title/subtitle/desc. Intention : speedometer, RPM, seuil 30 RPM du mixer.
- K5 `5E1B7A3D46283CA9` : title/subtitle/desc. Intention : stress/SU, overstressed = le 1er mur (LONG, mecanique cle).
- K6 `6F2C8B4E57394DB0` : title/subtitle/desc. Intention : hand crank, source manuelle d'appoint.
- K7 `7A3D9C5F68405EC1` : title/subtitle/desc. Intention : water wheel, 1re source auto (jalon).
- K8 `8B4E0D6A79516FD2` : title/subtitle/desc. Intention : windmill, source vent optionnelle.
- P0 `9C5F1E7B8A627003` : title/subtitle/desc. Intention : andesite casing, pivot des machines.
- PR1 `0D6A2F8C9B738114` : title/subtitle/desc. Intention : millstone, premier broyeur.
- PR2 `1E7B3A9D0C849225` : title/subtitle/desc. Intention : mechanical press, plaques/packing.
- PR3 `2F8C4B0E1D95A336` : title/subtitle/desc. Intention : mixer + basin, brassage, 30 RPM.
- PR4 `3A9D5C1F2E06B447` : title/subtitle/desc. Intention : encased fan, blast/smoke/wash/haunt (LONG, patron ATMons).
- CU0 `4B0E6D2A3F17C558` : title/subtitle/desc. Intention : copper casing, pivot fluides.
- FL1 `5C1F7E3B4A28D669` : title/subtitle/desc. Intention : fluid pipes + pump.
- FL2 `6D2A8F4C5B39E770` : title/subtitle/desc. Intention : fluid tank, stockage fluides.
- FL3 `7E3B9A5D6C40F881` : title/subtitle/desc. Intention : spout, remplir des items.
- FL4 `8F4C0B6E7D51A992` : title/subtitle/desc. Intention : hose pulley, pomper des nappes.
- CV `9A5D1C7F8E62B0A3` : title/subtitle/desc. Intention : convergence 3 piliers.
- WORKSHOP `0B6E2D8A9F73C1B4` : title/subtitle/desc. Intention : cloture, prestige leger, porte vers create_2 (LONG-ish).
- N-NOZZLE `1C7F3E9D0A84D2C5` : title/subtitle/desc. Intention : nozzle, diffusion en zone.
- N-LOGISTICS `2D8A4F0E1B95E3D6` : title/subtitle/desc. Intention : andesite funnel/tunnel/chute/smart_chute.
- N-DRAIN `3E9B5A1F2C06F4E7` : title/subtitle/desc. Intention : item drain, vider un item de son fluide.
- N-DRILLSAW `4F0C6B2A3D17A5F8` : title/subtitle/desc. Intention : drill + saw en poste fixe.
- N-HEATING `5A1D7C3B4E28B609` : title/subtitle/desc. Intention : blaze burner + cake, chauffage basin.
- N-COMPRESSED `6B2E8D4C5F39C71A` : title/subtitle/desc. Intention : create-compressed, blocs 9x QoL.
- N-INTFARM `7C3F9E5D6A40D82B` : title/subtitle/desc. Intention : roost, ferme auto (Integrated Farming).
- N-ENCASED `8D4A0F6E7B51E93C` : title/subtitle/desc. Intention : create-encased, habillage cosmetique.
- N-COBBLE `9E5B1A7F8C62F04D` : title/subtitle/desc. Intention : create-cobblestone, cobble auto (prudence).
- quest_links (`A0F62B8D4E17C395`) : PAS de cle lang (affiche le titre de la quete liee).

---

# 8. Items DOUTEUX a faire verifier par config-writer (via quest-mc-knowledge / /give)

Confirmes par ATMons (ref auditee, meme famille Create) mais RE-verifier au registre runtime Steamon (Create 6.0.10, pas ATM10) :
- `create:andesite_alloy`, `create:shaft`, `create:cogwheel`, `create:large_cogwheel`, `create:gearbox`, `create:clutch`, `create:gearshift`.
- `create:andesite_casing`, `create:copper_casing`.
- `create:millstone`, `create:mechanical_press`, `create:mechanical_mixer`, `create:basin`, `create:encased_fan`.
- `create:speedometer`, `create:stressometer`, `create:hand_crank`, `create:water_wheel`, `create:large_water_wheel`, `create:windmill_bearing`, `create:white_sail`.
- `create:fluid_pipe`, `create:mechanical_pump`, `create:fluid_tank`, `create:spout`, `create:hose_pulley`, `create:item_drain`.
- `create:andesite_funnel` (PAS `create:funnel`), `create:andesite_tunnel`, `create:chute`, `create:smart_chute`.
- `create:mechanical_drill`, `create:mechanical_saw`, `create:blaze_burner`, `create:blaze_cake`, `create:empty_blaze_burner`, `create:blaze_cake_base`.
- rewards : `create:nozzle`, `create:super_glue`, `create:belt_connector`, `minecraft:soul_campfire`.
- `numismatics:spur` (donnable ; confirme en usage V1).

VRAIMENT douteux (namespace runtime a EXTRAIRE du jar, pas juste /give) :
- create-compressed (slug `Sy4Box1J`, jar `create_compressed-2.2.0`) : namespace probable `createcompressed`/`create_compressed`. Trouver un item bloc-compresse donnable andesite-tier. Sinon N-COMPRESSED -> checkmark.
- create-integrated-farming (slug `9k1pAsfR`, jar `create-integrated-farming-1.2.6`) : namespace probable `create_integrated_farming`/`integrated_farming`. Trouver l'item **roost**. VERIFIER que le mod (dep create-dragons-plus) charge bien et que l'item est donnable. Sinon N-INTFARM -> checkmark.
- create-encased (slug `hSSqdyU1`, jar `Create Encased-1.9.0`) : namespace probable `create_encased`/`encased`. Un bloc encased cosmetique. Sinon N-ENCASED -> checkmark.
- create-cobblestone (slug `ihpnEd80`, jar `createcobblestone-1.4.11`) : namespace probable `createcobblestone`. PRUDENCE CRASH NBT (memoire steamon-native-crash-createcobblestone). N-COBBLE recommande en **checkmark**, ou SKIP si le validator confirme instable.

Note config-writer : pour toute niche dont l'item n'est pas confirme donnable proprement, REMPLACER la task item par `checkmark` (jamais inventer un id). Une niche en checkmark reste valide et non-bloquante.

---

# 9. Controle registre 3.1 + non-blocage (auto-audit)

## Anti-repetition (frontiere 3.1)
- Zero item create_2/3/4 en task : verifie. Aucun brass/zinc/precision/deployer/arm/crafter/sequenced/electricite/train/nuclear. Le seul `brass_funnel` d'ATMons a ete VOLONTAIREMENT retire (remplace par andesite_funnel dans N-LOGISTICS).
- andesite_alloy/casing, shaft/cogs/gearbox, water_wheel/windmill, millstone/press/mixer/basin/encased_fan, copper_casing + fluides, andesite_funnel, create-compressed, create-integrated-farming : tous proprietaires de create_1 (registre 3.1). Aucun n'est redemande ailleurs (culinary RENVOIE a create_1 sans re-crafter). OK.
- hand_crank/speedometer/stressometer : mecaniques enseignees ici uniquement. OK.

## Non-blocage
- TRONC obligatoire (R0, K1, K2, K3, K4, K5, K7, P0, PR1, PR2, PR3, PR4, CU0, FL1, FL2, FL3, FL4, CV, WORKSHOP) = 100% deterministe borne (crafts andesite/copper-tier, aucun RNG/drop rare/structure). Aucun objectif < 5% ni long. OK.
- CV utilise `dependency_requirement:"one_completed"` sur (PR4, FL4, K5) : le chapitre se termine des qu'UNE branche est finie -> aucune branche ne bloque. OK.
- Toutes les niches (N-*) sont `optional:true` : ne bloquent aucun enfant. K6 (hand_crank) et K8 (windmill) aussi optional. OK.
- Les items a risque (create-cobblestone NBT) sont en niche optional + recommandes en checkmark ou SKIP. OK.
- Comptage : ~19 nodes tronc/branche obligatoire-souple + 2 opt kinetics (K6,K8) + 8 niches opt = 29 quetes + 1 quest_link retour. Dans la cible 28-34. Ratio obligatoire/optionnel ~ 65/35, conforme.

## Recap ids figes (pour l'orchestrator, coherence inter-vagues)
- racine create_1 = `5D00FEC7C79E27E1` (FIGE, cible du quest_link overworld).
- cloture create_1 (point de sortie vers create_2) = WORKSHOP `0B6E2D8A9F73C1B4` (a reutiliser comme source du futur quest_link create_1 -> create_2).
- table cogs_crates_rewards = `C05C4A7E5B100D12` (a creer ; regenerable si collision).

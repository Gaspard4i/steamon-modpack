# QUEST-MASTER-PLAN.md

Plan directeur de la refonte complete des quetes FTB du modpack **Steamon** (Create x Cobblemon, MC 1.21.1 NeoForge).

Ce document est le cadre de TOUTE la refonte (Phase A tache 3). Il definit les groupes, les chapitres, le registre anti-repetition "qui enseigne quoi", le tronc principal non-bloquant, le split culinary, la couverture 100% des mods, et l'ordre de production Phase C.

Il ne contient PAS de SNBT ni de textes joueur (respectivement quest-config-writer et quest-writer). Il donne la topologie de layout par chapitre, pas les coordonnees exactes.

Regle de style : jamais de tiret cadratin. Anglais pour les titres in-game cites, francais pour le corps.

Statut fondations consommees : QUEST-DESIGN-REFERENCE.md (434 lignes, 4 archetypes + shapes semantiques + branch-and-converge), steamon-quest-design-rules (memoire projet), 4 progressions documentees (create, cobblemon, aether, deeperdarker), format SNBT confirme. Structure v2 lue (21 chapitres, 734 quetes).

---

## 0. Decisions de cadrage (les grands arbitrages)

1. **7 chapter groups** (les 6 qui marchent + 1 nouveau **Life & Style**). Justification en section 1. On garde les 6 ids existants, on regenere chapter_groups.snbt proprement (fix du bug des 6 groupes fantomes), on ajoute 1 id neuf pour Life & Style.
2. **Un mod-univers = un chapter group** pour les 2 gros piliers (Create, Cobblemon). Les mods satellites vont dans le group du domaine parent, jamais un chapitre par petit mod (anti-eparpillement, contrairement a ATMons).
3. **Tronc principal = "Steamon Journey"** dans Getting Started, prolonge par les gates de dimensions. 100% deterministe (section 4). Les 2 univers Create et Cobblemon sont des branches paralleles accrochees au tronc par un seul lien de decouverte chacune, jamais gate obligatoire.
4. **Couverture elargie vs v2** : le v2 ne couvrait pas deep-aether, deeper-oceans, supplementaries, sophisticated storage, immersive-aircraft, exposure, toute la deco, curios/accessoires, storage/util. La refonte ajoute le group Life & Style (deco + curios + storage + util + instruments) et enrichit Dimensions (deep-aether, deeper-oceans).
5. **Split culinary en 4 chapitres** repartis sur 2 groups (section 5) : le socle FD + addons dimensionnels dans Life & Style, le pont Create-cuisine reste dans Create, la bouffe Cobblemon reste dans Cobblemon. Aucune recette dupliquee entre les 4.
6. **Registre anti-repetition unique** (section 3) : chaque item/mecanique-cle est enseigne dans UN SEUL chapitre. Les chevauchements v2 sont tranches explicitement.

---

## 1. Chapter groups (les grands onglets)

Liste finale. Les 6 premiers ids sont ceux REELLEMENT references par les chapitres v2 (a conserver). Le 7e est neuf.

| order | id (16 hex) | title in-game (couleur) | role | contenu |
|---|---|---|---|---|
| 0 | `3DBCC9E2D8397D4A` | `&eGetting Started` | tronc + hub | welcome, Steamon Journey (overworld), daily/repeatables |
| 1 | `348AE7020234F2D4` | `&6Create` | univers 1 | create_1..4 + create-cuisine pont + electricite + trains + nuclear |
| 2 | `2A4A6BF9FB018712` | `&cCobblemon` | univers 2 | cobblemon_1..3 + berries + evolution + battle/pvp + cobblemon-food + mega/legends |
| 3 | `1AF20BFA15DC3940` | `&bDimensions` | exploration | nether, end, aether(+deep), otherside(+deeper-oceans) + exploration/structures |
| 4 | `2C0FD201CD572F12` | `&2Culinary` | cuisine (socle) | farmers_delight, delight_addons (nether/aether/end/miner/cultural + brewin) |
| 5 | `9F0C4E7A1B6D8352` | `&dLife & Style` (NEUF) | confort/vie | decoration, storage_util, curios_accessories, comfort_food_display |
| 6 | `175FA950F5B31EAB` | `&5Adventure` | endgame/loot | steamon_league (RCTMod), adventure_loot (relics/artifacts/gear), economy (numismatics) |

**Justification du 7e group (Life & Style)** :
- La cuisine socle (FD + addons) est deja son propre group Culinary. La mettre AUSSI avec la deco surchargerait. On garde Culinary focalise "cuisine" et on cree Life & Style pour la sphere "je m'installe, je decore, je range, je m'accessoirise" (deco 15 mods, storage/util 11 mods, curios/access 6 mods, instruments 3 mods) qui n'avait AUCUN chapitre en v2.
- Alternative rejetee : tout fusionner dans Culinary. Rejetee car cela melange deux intentions (cuisiner vs amenager) et donne un group obese de 8+ chapitres.
- Alternative rejetee : mettre storage/curios dans Getting Started. Rejetee car Getting Started doit rester le tronc court et lisible, pas un fourre-tout.
- Le "comfort_food_display" (chefs-delight villagers + display-delight + comforts + create-central-kitchen cote presentation) fait le pont thematique entre Culinary et Life & Style : il vit dans Life & Style et RENVOIE a Culinary par dependance, sans re-enseigner les recettes FD.

**Note pour Culinary** : garder l'onglet Culinary meme si Life & Style existe. Les deux ont des roles distincts (cuisiner = Culinary ; amenager/servir/decorer = Life & Style). Le split culinary (section 5) place le socle FD dans Culinary et le confort de table dans Life & Style.

---

## 2. Liste exhaustive des chapitres

Archetypes (rappel doc) :
- **A1** = grille de collection + gate one_completed.
- **A2** = paire biome->item en eventail.
- **A3** = tronc gate -> eventail post-gate cache (dimensions).
- **A4** = grille de bounties/tips independants + checkmark convergence.

Roles : **TRONC** (chemin critique) / **BRANCHE** (parallele, non-bloquant mais structurant) / **COLLECTION** (grille) / **SUPPORT** (confort/tips).

### Group 0 - Getting Started (`3DBCC9E2D8397D4A`)

| # | filename | titre | mods couverts | role | archetype | taille | enseigne d'unique |
|---|---|---|---|---|---|---|---|
| 0 | welcome | `Welcome to Steamon` | pack meta, waystones, natures-compass, sophisticated-backpacks (1er tip), FTB quests UI | TRONC | A4 | 8-10 | le fonctionnement du livre de quetes, les 2 univers, ping Discord, le backpack et la waystone de depart |
| 1 | overworld | `The Steamon Journey` | vanilla progression, veinmining/tree-harvester, universal-bone-meal, rightclickharvest, gravestone, magnum-torch | TRONC | A3 | 14-18 | la colonne vertebrale : wood->stone->iron->diamond->netherite, les QoL de recolte (une seule quete outils), les 2 portes vers Create et Cobblemon |
| 2 | daily_quests | `Daily Bounties` | transverse (repeatable) | SUPPORT | A4 | 6-10 | quetes repetables rotation (economie + consommables), reset quotidien |

### Group 1 - Create (`348AE7020234F2D4`)

| # | filename | titre | mods couverts | role | archetype | taille | enseigne d'unique |
|---|---|---|---|---|---|---|---|
| 0 | create_1 | `Cogs & Crates` | create base (andesite->copper), create-compressed, create-integrated-farming, create-encased, create-cobblestone(prudence) | TRONC-Create | A3 | 28-34 | kinetics de base : andesite alloy, shafts/cogs, sources de rotation, millstone/press/mixer/basin, casings andesite+copper |
| 1 | create_2 | `Rotational Power` | create base (zinc->brass->precision->automation), create-central-kitchen(pont), create-dragons-plus(bulk), create_sa jetpacks, create-curios-jetpack, create-molten-vents | BRANCHE | A3 | 26-32 | brass, precision mechanism, deployer/mechanical arm/sequenced assembly/mechanical crafter, bulk processing fan, jetpacks/backtank |
| 2 | create_3 | `Sparks & Circuits` | createaddition (FE), create-enchantment-industry, create-enchantable-machinery, create-ender-transmission, klinks-n-klangs(pont Cobblemon) | BRANCHE | A3 | 22-28 | electricite FE, XP liquide/printer, transmission a distance, ET la fabrication de Poke Balls (pont, clot le chapitre) |
| 3 | create_4 | `Beyond the Machine` | trains (steam-n-rails, blocks-bogies), create-vibrant-vaults, create-connected, create-ultimate-factory(a verifier), createnuclear (endgame) | BRANCHE endgame | A3 | 22-28 | trains/rails/schedules, stockage vault, factory/logistics, et le reacteur nucleaire en branche optionnelle jackpot |

### Group 2 - Cobblemon (`2A4A6BF9FB018712`)

| # | filename | titre | mods couverts | role | archetype | taille | enseigne d'unique |
|---|---|---|---|---|---|---|---|
| 0 | cobblemon_1 | `Trainer's First Steps` | cobblemon core, pokenav/cobblenav, smartphone, catch-indicator/spawn-alerts/counter, journey-mounts, pet-your-cobblemon, safepastures | TRONC-Cobblemon | A3 | 30-36 | starter, capture, PC, heal, pasture, friendship, les balls SIGNIFICATIVES (pas collection exhaustive), monter/voler, HUD apps |
| 1 | cobblemon_2 | `The Type Trials` | cobblemon (18 types), fight-or-flight-reborn, capture-xp, exp-all, cobblestats, move-inspector | COLLECTION | A1 | 22-26 | grille des 18 types (attrape un de chaque) + cheat-sheet forces/faiblesses, spawns agressifs, partage XP |
| 2 | cobblemon_3 | `Breeding & Battle Mastery` | cobbreeding, utility+(IV/EV), retraining, cobblestats, unchained(refonte combat), simpletms, more-cobblemon-tweaks, armory | BRANCHE | A2+A4 | 26-32 | elevage (Pasture, Destiny Knot/Everstone/Ditto), EV/IV (vitamins, bottle caps), TMs/TRs, streaks unchained, armures Cobblemon |
| 3 | berries | `Berry Farmer` | berryharvester, berry-pouch, tomtarus-tweaks(pont cuisine) | COLLECTION | A2 | 18-24 (reduit de 73) | les berries brutes : culture, harvest, pouch, effets. Source unique des berries (cooking utilise les PRODUITS, pas les berries) |
| 4 | evolution_items | `The Evolution Path` | cobblemon (stones + link cable + held evo items), navas-zamega(via mega), mega-showdown(mega/dyna/tera) | BRANCHE (A2) | A2 | 24-30 | eventail biome->pierre d'evolution + trade evos (link cable) + le systeme Mega (bracelet, key stone, mega stones) |
| 5 | pvp_items | `Competitive Corner` | cobblemon held items, simpletms(competitif), release-rewards | COLLECTION/SUPPORT | A4 | 20-26 | held items competitifs, movesets, parting gifts. NON bloquant (confort PvP) |
| 6 | cobblemon_food | `Poke-Cuisine` (ex cobblemon_cooking, split) | cobblemon food (poke puffs/roasted berries datapack), tomtarus-tweaks(produits), gensokyo-delight(niche) | SUPPORT | A4 | 18-22 (reduit de 87) | la cuisine POUR les Pokemon (aprijuice mounts, roasted berries, poke snacks) a partir des PRODUITS de berries, pas des berries brutes |
| 7 | myths_legends | `Myths & Legends` (NEUF) | myths-and-legends, raiddens, paleontology | COLLECTION optionnelle | A1 | 20-28 | les key items legendaires (jackpot), les raids (raid dens), les fossiles (paleontology). 100% optionnel, jamais dans un tronc |

### Group 3 - Dimensions (`1AF20BFA15DC3940`)

| # | filename | titre | mods couverts | role | archetype | taille | enseigne d'unique |
|---|---|---|---|---|---|---|---|
| 0 | nether | `Into the Nether` | vanilla nether, my-nethers-delight(tip renvoi), fight-or-flight | TRONC-dim | A3 | 18-24 | portail nether, materiaux (quartz, blaze, netherite scrap deterministe borne), 1 type Pokemon dedie (Fire) |
| 1 | end | `The Final Frontier` | vanilla end, ends-delight(tip renvoi), yungs-better-end-island | TRONC-dim | A3 | 18-24 | portail end, elytra, dragon (branche opt), shulker, 1 type Pokemon dedie (Dragon) |
| 2 | aether | `The Aether` | aether, deep-aether, the-aethers-delight(tip renvoi), immersive-aircraft(acces alt) | BRANCHE-dim | A3 | 20-28 | portail eau/glowstone, tiers Skyroot->Gravitite, donjons Bronze/Silver/Gold, Deep Aether (Skyjade/Stratus), 1 type Pokemon dedie |
| 3 | otherside | `The Otherside` | deeperdarker, deeper-oceans, miners-delight(tip renvoi) | BRANCHE-dim | A3 | 22-28 | Ancient City, Warden->Heart of the Deep, portail Otherside, Resonarium->Warden gear, deeper-oceans, 1 type Pokemon dedie (Dark) |
| 4 | exploration | `Uncharted` (NEUF) | biomes-weve-gone, continents, yungs-cave-biomes, oh-the-trees-youll-grow, yungs-better-dungeons/mineshafts/strongholds, structures(ct-overhaul-village/sky-villages/towns-and-towers/moogs/explorify), lootr/lootrmon, natures-compass, waystones, magnum-torch | BRANCHE | A4 | 24-30 | l'exploration de surface : biomes/arbres modded, structures a piller (lootr chests instancies), villages, compass/waystone reseau |

### Group 4 - Culinary (`2C0FD201CD572F12`)

| # | filename | titre | mods couverts | role | archetype | taille | enseigne d'unique |
|---|---|---|---|---|---|---|---|
| 0 | farmers_delight | `Farm to Table` (ex culinary base) | farmers-delight base, slice-and-dice(pont Create->FD outils) | TRONC-cuisine | A3 | 24-30 | le socle FD : cooking pot, cutting board, skillet, cuisine de campfire, farm/knife/compost. Slice-and-dice comme accelerateur |
| 1 | delight_addons | `Delights of the World` | my-nethers-delight, the-aethers-delight, ends-delight, miners-delight, cultural-delights, brewin-and-chewin | BRANCHE | A2 | 26-32 | les plats specifiques par dimension/culture + la fermentation/boissons Brewin. Une section par addon, zero recette FD-base dupliquee |

### Group 5 - Life & Style (`9F0C4E7A1B6D8352`) NEUF

| # | filename | titre | mods couverts | role | archetype | taille | enseigne d'unique |
|---|---|---|---|---|---|---|---|
| 0 | decoration | `Home & Hearth` | chipped, rechiseled, another-furniture, immersive-furniture, beautify, supplementaries(+squared), amendments, double-doors, immersive-paintings, bellsandwhistles, klinksnklangs(deco), create-deco/copycats/design-n-decor, create-dragons-plus(deco), cobblefurnies, rechiseled-cobblemon | SUPPORT | A4 | 22-28 | la deco et le mobilier : blocs chisel/rechisel, meubles, supplementaries utilitaires, copycats/deco Create, deco Cobblemon |
| 1 | storage_util | `Order & Efficiency` | sophisticated-storage/backpacks(+create-integration), trash-cans, item-obliterator, create-vibrant-vaults(tip renvoi), construction-sticks | SUPPORT | A4 | 16-22 | le rangement (barrels/backpacks upgrades), la gestion des dechets, les sticks de construction. Renvoie a Create pour les vaults |
| 2 | curios_accessories | `Trinkets & Charms` | curios, accessories, simple-hats, crawl, comforts, relics(tip), artifacts(tip), cosmeticarmours | SUPPORT | A4 | 14-20 | le systeme d'accessoires (slots curios), chapeaux, sacs de couchage/hamacs comforts, cosmetics. Renvoie a Adventure pour relics/artifacts |
| 3 | comfort_food_display | `The Good Life` | chefs-delight(villagers cuisiniers), display-delight, immersive-melodies, exposure(appareil photo), pet-your-cobblemon(tip) | SUPPORT | A4 | 14-18 | l'art de vivre : servir/exposer les plats (display-delight), villageois cuisiniers (chefs-delight), musique, photo (exposure). Renvoie a Culinary pour cuisiner |

### Group 6 - Adventure (`175FA950F5B31EAB`)

| # | filename | titre | mods couverts | role | archetype | taille | enseigne d'unique |
|---|---|---|---|---|---|---|---|
| 0 | steamon_league | `The Steamon League` | rctmod/rctapi/tim-core, RCTMod trainers/gyms/Elite Four/Champion | BRANCHE endgame | A3 | 12-16 | la ligue de dresseurs : gyms dans l'ordre (advancement defeat_count), Elite Four, Champion. Gate par requiredDefeats |
| 1 | adventure_loot | `Relics & Legends` | relics, artifacts, reliquified-artifacts, advanced-netherite, armor-of-the-ages, cobblemon-armory(tip), gravestone(tip), spuds-shops(marchands) | BRANCHE | A4 | 22-28 | le gear d'aventure : relics (leveling), artifacts, netherite avance, armures de set. Marchands spuds-shops |
| 2 | economy | `The Merchant's Path` (NEUF, ex-inclus adventure) | numismatics, spuds-shops(pont) | BRANCHE optionnelle | A4 | 14-18 | l'economie Numismatics : monnaie (spurs/cogs/sun/crown), spring/depot, echanges, distributeur. Racine optional |

**Total chapitres : 26** (vs 21 en v2). Nouveaux : myths_legends, exploration, economy + les 4 chapitres de Life & Style, moins les fusions/renommages. Ventilation : Getting Started 3, Create 4, Cobblemon 8, Dimensions 5, Culinary 2, Life & Style 4, Adventure 3 = 29 fichiers. (Note : cobblemon_food remplace cobblemon_cooking allege ; economy detache d'adventure_loot.)

Recompte exact des fichiers : Getting Started(3) + Create(4) + Cobblemon(8) + Dimensions(5) + Culinary(2) + Life&Style(4) + Adventure(3) = **29 chapitres**. Fourchette quetes totale estimee : 560-720 (vs 734 v2, mais mieux reparties et 0 doublon).

---

## 3. Registre maitre "qui enseigne quoi" (anti-repetition)

Regle : chaque ligne = une mecanique/item-cle, enseignee dans UN SEUL chapitre. Tout agent qui veut mettre cet item/mecanique en task DOIT verifier ici d'abord. Si absent, l'ajouter avant d'ecrire.

### 3.1 CREATE (chevauchements intra-Create tranches)

| Mecanique / item-cle | Chapitre proprietaire | Interdit ailleurs |
|---|---|---|
| andesite_alloy, andesite_casing | create_1 | create_2/3/4, culinary |
| shaft, cogwheel, large_cogwheel, gearbox | create_1 | partout ailleurs |
| water_wheel, windmill, source de rotation | create_1 | - |
| millstone, mechanical_press, mechanical_mixer, basin | create_1 | culinary (culinary RENVOIE a create_1) |
| copper_casing, fluid pipes/tanks/spout/chute | create_1 | create_2/3 |
| encased_fan (blast/smoke/wash) | create_1 | create_2 (dragons-plus bulk renvoie) |
| create-compressed (blocs 9x) | create_1 | - |
| create-integrated-farming (roost) | create_1 | culinary |
| zinc_ingot, brass_ingot, brass_casing | create_2 | create_1/3/4 |
| precision_mechanism | create_2 | create_3/4 (sequenced assembly demo ici seulement) |
| deployer, mechanical_arm, mechanical_crafter | create_2 | culinary, create_3/4 (culinary RENVOIE) |
| sequenced_assembly (mecanique) | create_2 | - |
| andesite_funnel (attention: PAS create:funnel) | create_1 | - |
| bulk processing (dragons-plus: create_dragons_plus:fluid_hatch via encased fan de create_1) | create_2 | - |
| molten_vents (generateur ORESTONES depuis lave, PAS heat source): molten_vents:dormant/active_molten_<type> | create_2 (tip) | - |
| jetpack (create_sa:brass_jetpack_chestplate/brass_exoskeleton), backtank (create:copper/netherite_backtank), extendo_grip (create base), create_jetpack_curios (0 item, slot curios TIP) | create_2 | create_4 |
| central-kitchen (0 item craftable: PONT pur, automatiser FD via mechanical_arm/deployer/packager) | create_2 (pont) | culinary (culinary RENVOIE a create_2, ne recraft pas les machines) |
| copper_wire, connector, capacitor, electric_motor, alternator, modular_accumulator (PAS accumulator qui n'existe pas), rolling_mill, tesla_coil, portable_energy_interface | create_3 | create_4 |
| electricite FE (createaddition), pont kinetic<->FE (alternator=FE depuis kinetic, motor=kinetic depuis FE), electrum_ingot (or+argent) | create_3 | - |
| liquid experience (FLUIDE, via experience_bucket), printer, blaze_enchanter, super_experience (PAS hyper_experience), desenchant via blaze_forger/grindstone_drain (PAS disenchanter qui n'existe pas) (enchantment-industry) | create_3 | culinary, cobblemon |
| create-enchantable-machinery (AUCUN item, tip/mecanique data-driven seulement) | create_3 (tip) | - |
| ender-transmission (item/fluid/energy_transmitter + chunk_loader, PAS rotation) | create_3 | create_4 |
| Poke Ball fabrication (klinks: blank_ball + filling dyes + sequenced_assembly ; PAS de X_ball_stencil pour cherish/master/premier ; paints = fluides ; cherish=steamon:cherish_ball_sequenced ; master=NON fabricable=reward jackpot) | create_3 (pont, clot, DEPEND create_1 fluides + create_2 sequenced) | cobblemon_1 (obtention via apricorns/craft cobblemon, PAS fab Create) |
| track, bogey, train_station, schedule, steam-n-rails | create_4 | - |
| vibrant-vaults (stockage) | create_4 | storage_util (storage_util RENVOIE a create_4) |
| create-connected, ultimate-factory | create_4 | - |
| raw_uranium (PAS createnuclear:uranium), yellowcake, fuel_rod, reactor_core, reactor casing/controller | create_4 (branche optionnelle) | - |
| steel_ingot, electrum_ingot | create_3 (electrum) / create_4 (steel si nuclear) | UNE seule quete chacun |

### 3.2 COBBLEMON (chevauchements berries/cooking/evolution tranches)

| Mecanique / item-cle | Chapitre proprietaire | Interdit ailleurs |
|---|---|---|
| starter selection (select_starter) | cobblemon_1 | - |
| catch (mecanique de base) | cobblemon_1 | - |
| PC, healing_machine, pasture (usage) | cobblemon_1 | cobblemon_3 (breeding USE pasture mais l'enseigne pas) |
| balls significatives (poke/great/ultra + 1-2 speciales) | cobblemon_1 | pas de collection exhaustive des 29 balls |
| friendship | cobblemon_1 | - |
| journey-mounts (Ride, monter/voler) | cobblemon_1 | cobblemon_food (aprijuice renvoie ici) |
| HUD apps: pokenav (cobblenav:pokenav_item_base), catch-indicator, spawn-alerts, counter. Smartphone (cobblemon_smartphone) = recette vanilla DÉSACTIVÉE, fabrication Create-only en create_3 (mechanical_crafting datapack) -> cobblemon_1 = TIP + quest_link vers create_3 (7FD87542D311BA8A), PAS objectif de craft ici | cobblemon_1 | fabrication smartphone = create_3 |
| grille 18 types (catch un de chaque) + cheat-sheet | cobblemon_2 | dimensions (les dim ont 1 TYPE dedie chacune, pas la grille) |
| fight-or-flight, capture-xp, exp-all | cobblemon_2 | - |
| breeding (Destiny Knot, Everstone, Ditto, cobbreeding) | cobblemon_3 | - |
| EV/IV (vitamins, bottle caps utility+, retraining) | cobblemon_3 | - |
| TMs/TRs (simpletms mecanique) | cobblemon_3 | pvp_items (pvp USE les TM competitifs, enseigne pas le systeme) |
| unchained streaks (KO/captures d'affilee) | cobblemon_3 | - |
| armory (armures/armes Pokemon) | cobblemon_3 | adventure_loot (renvoie) |
| more-cobblemon-tweaks (items craftables) | cobblemon_3 | - |
| oran_berry, rare_candy + TOUTES berries brutes | berries | cobblemon_food, cobblemon_cooking (interdits: ils utilisent les PRODUITS) |
| berry culture/harvest/pouch (berryharvester, berry-pouch) | berries | - |
| pierres d'evolution (fire/water/thunder/leaf/moon/sun/dawn/dusk/ice/shiny stone) | evolution_items | - |
| link_cable, trade evos, held evo items (metal_coat, kings_rock, dragon_scale) | evolution_items | - |
| mega system (bracelet, key stone, mega stones, mega-showdown) | evolution_items | myths_legends (M&L != mega) |
| navas-zamega (megas Z-A) | evolution_items (apres mega base) | - |
| held items competitifs | pvp_items | cobblemon_3 (cobblemon_3 = obtention, pvp = usage competitif) |
| release-rewards (parting gifts) | pvp_items | - |
| aprijuice, roasted berries, poke snacks (PRODUITS transformes) | cobblemon_food | berries (interdit: berries = brutes) |
| gensokyo-delight (niche) | cobblemon_food | culinary |
| key items legendaires M&L (jackpot) | myths_legends | partout ailleurs (jamais dans un tronc) |
| raid dens (raid crystals, catching charm) | myths_legends | - |
| paleontology (fossiles, resurrection machine) | myths_legends | - |

### 3.3 DIMENSIONS (types Pokemon repartis, 1 par dimension, zero doublon)

| Dimension | Type Pokemon dedie a capturer | Materiaux/jalons deterministes | Interdit ailleurs |
|---|---|---|---|
| nether | **Fire** CONFIRMÉ (50 espèces is_nether : Charizard/Magmar/Torkoal ; légendaires Heatran/Reshiram) | quartz, blaze rod, magma, netherite scrap (borne, pas gate) | Fire hors nether |
| end | **Psychic** CONFIRMÉ (Dragon FAUX : 0 espèce Dragon is_end). Psychic dominant : Metagross/Sigilyph/Beheeyem/Unown. Giratina/Eternatus = légendaire signature en TIP (pas mécanique catch) | elytra, chorus, shulker, ender pearl | Psychic ici = OK (cobblemon_2 grille garde psychic aussi mais end = spawn réel) |
| aether | **PAS de catch-by-type** (0 spawn Cobblemon dédié aether:the_aether confirmé). Objectifs = contenu NATIF Aether (Skyroot/Zanite/Gravitite tiers, donjons Bronze/Silver/Gold, medals). Optionnel : catch N Pokémon (any type) | Skyroot/Zanite/Gravitite, medals, Sun altar | - |
| otherside | **PAS de catch-by-type** (0 spawn Cobblemon dédié deeperdarker:otherside confirmé). Objectifs = contenu NATIF (Heart of the Deep, Resonarium, Warden gear). Otherside DÉJÀ propre au qcheck (0/0), enrichir seulement si demandé | Heart of the Deep, Resonarium, Warden gear | - |
| overworld/exploration | tous les autres types (grille cobblemon_2) | - | la grille reste dans cobblemon_2 |

Note (CONFIRMÉ terrain 2026-08-03) : seuls **nether (Fire)** et **end (Psychic)** ont des spawns Cobblemon réels par dimension -> quête catch-by-type possible. **aether et otherside n'ont AUCUN spawn_pool_world dédié** (mods Aether/DeeperDarker n'apportent aucun data/cobblemon) -> NE PAS faire de quête catch-by-type (bug silencieux garanti). Leurs objectifs = matériaux/mobs/structures natifs de la dimension. dimension_ids exacts : minecraft:the_nether, minecraft:the_end, aether:the_aether, deeperdarker:otherside.

### 3.4 CUISINE (split, zero recette dupliquee entre les 4 chapitres cuisine)

| Domaine cuisine | Chapitre proprietaire | Contenu | Interdit ailleurs |
|---|---|---|---|
| FD socle (cooking pot, cutting board, skillet, knife, compost, campfire cooking) | farmers_delight | recettes de base FD + slice-and-dice comme accelerateur | delight_addons, comfort_food_display |
| plats par dimension/culture + fermentation | delight_addons | nether's/aether's/end's/miner's/cultural + brewin (boissons) | farmers_delight |
| pont Create->cuisine (central kitchen, packager, sawing cutting board) | create_2 | automatisation cuisine via Create | culinary (RENVOIE a create_2) |
| cuisine POUR Pokemon (aprijuice, roasted berries, poke snacks) | cobblemon_food | produits transformes des berries | berries, culinary |
| servir/exposer (display-delight), villageois cuisiniers (chefs-delight) | comfort_food_display | presentation, PNJ cuisiniers | farmers_delight, delight_addons |

Machines Create utilisees en cuisine (deployer, mixer, mechanical arm, andesite funnel) : PROPRIETE de create_1/create_2. La cuisine ne les RE-ENSEIGNE jamais ; elle exige simplement que le joueur ait fait la quete Create correspondante (dependance inter-chapitre via quest_link) OU decrit "utilise ton mixer (voir Create)" sans en faire une task de craft de la machine.

### 3.5 Chevauchements v2 explicitement resolus

| Chevauchement v2 | Decision |
|---|---|
| deployer/mixer/mechanical_arm/andesite_funnel dans Create ET Culinary | Create garde. Culinary renvoie par dependance, ne craft jamais la machine. |
| andesite_casing/precision_mechanism/copper_casing/capacitor/copper_wire/connector/steel_ingot/raw_uranium/reactor_core/electrum_ingot demandes plusieurs fois | Chaque item = UNE quete, chapitre assigne en 3.1. |
| oran_berry/rare_candy dans berries ET cobblemon_cooking | berries garde les berries brutes. cobblemon_food utilise les produits. |
| types Pokemon dupliques (ghost/dragon/dark) entre end/otherside/nether | 1 type unique par dimension (3.3), grille complete en cobblemon_2. |
| Poke Balls collection quasi-redondante (cobblemon_1) | cobblemon_1 garde SEULEMENT les balls significatives. La FABRICATION va en create_3 (klinks). Pas de collection des 29. |
| culinary trop gros (79 quetes) et cobblemon_cooking (87) | split en farmers_delight + delight_addons + cobblemon_food + comfort_food_display. |

---

## 4. Tronc principal non-bloquant (Steamon Journey)

Le tronc = chaine deterministe, chaque maillon est un objectif borne en temps et sans RNG lourd. Il vit dans overworld (Getting Started) et se prolonge par les gates de dimensions.

### 4.1 Sequence des jalons deterministes (chemin critique)

```
welcome (livre + backpack + waystone de depart)
  -> overworld J1: first tree/wood (deterministe)
  -> overworld J2: stone tools + furnace
  -> overworld J3: iron (deterministe: minage garanti)
  -> overworld J4: diamond (deterministe: minage profond garanti)
  -> [PORTE CREATE]  quest_link -> create_1 racine (decouverte, non bloquant)
  -> [PORTE COBBLEMON] quest_link -> cobblemon_1 racine (decouverte, non bloquant)
  -> overworld J5: nether portal (obsidian, deterministe)
  -> [GATE NETHER] type:dimension -> nether chapitre
  -> overworld J6: end portal / eyes of ender (borne, voir note)
  -> [GATE END] type:dimension -> end chapitre
```

### 4.2 Ce qui N'EST PAS sur le chemin critique (branches, hors gate)

- **Aether** : accroche depuis overworld (glowstone dispo des le nether) mais GATE via `type:dimension aether`, en BRANCHE. Pas prerequis de end.
- **Otherside** : GATE via Heart of the Deep (drop Warden). Warden = combat long/dangereux -> BRANCHE optionnelle, JAMAIS prerequis du tronc. Le gate otherside depend de "tuer le Warden" qui est en soi la quete, mais rien en aval du tronc ne depend d'otherside.
- **Nether netherite** : le netherite complet (ancient debris a faible %) reste une quete BORNEE "trouve X ancient debris" mais NON bloquante pour la suite (le tronc n'exige jamais une armure netherite pour avancer). L'ancient_debris quete v2 (bug titre "Air") est reecrite par quest-writer, non gate.
- **wither_skeleton_skull** (bug v2 bloquant) : passe en BRANCHE optionnelle du nether, `optional:true`, aucun enfant du tronc ne depend d'elle. Resolu.
- **Create et Cobblemon entiers** : branches paralleles. Le tronc les DEBLOQUE (quest_link de decouverte) mais ne DEPEND jamais d'eux pour progresser dans les dimensions. Un joueur peut faire les dimensions sans finir Create.

### 4.3 Notes de non-blocage validees

- End portal via eyes of ender : les eyes exigent ender pearls (endermen) + blaze powder (nether). Les deux sont deterministes en temps borne (spawn garanti). Acceptable en tronc. Le stronghold (localisation RNG) est mitige par natures-compass/eye-throwing vanilla -> borne. OK.
- Aucun gate de dimension ne depend d'un drop < 5% ou d'une structure ultra-rare. Confirme.
- Les 2 gates vraiment optionnels (aether, otherside) sont hors chemin critique : le joueur "termine" la Steamon Journey avec nether+end faits, aether/otherside/league en post-game.
- **min_required_dependencies / one_completed** : le node "endgame Steamon Journey" (s'il existe) exige "N dimensions sur 4" (ex 2 sur 4) plutot que les 4, pour ne jamais bloquer sur aether/otherside.

---

## 5. Split culinary detaille

13 mods culinaires repartis en 4 chapitres (+ 1 pont Create), zero recette dupliquee.

| Mod culinaire | Chapitre | Role dans le chapitre |
|---|---|---|
| farmers-delight | farmers_delight (Culinary) | socle : cooking pot, cutting board, skillet, knife, campfire, compost, farm |
| slice-and-dice | farmers_delight (Culinary) | pont Create->FD (outils cutting), accelerateur, une quete tip |
| my-nethers-delight | delight_addons (Culinary) | section Nether : plats nether |
| the-aethers-delight | delight_addons (Culinary) | section Aether : plats aether (renvoie a la dim aether) |
| ends-delight | delight_addons (Culinary) | section End : plats end |
| miners-delight | delight_addons (Culinary) | section Miner : plats de mine (renvoie a otherside) |
| cultural-delights | delight_addons (Culinary) | section Cultural : plats du monde |
| brewin-and-chewin | delight_addons (Culinary) | fermentation, boissons (branche distincte du chapitre) |
| create-central-kitchen | create_2 (Create) | automatisation cuisine via Create (packager, sawing) |
| chefs-delight | comfort_food_display (Life & Style) | villageois cuisiniers, PNJ |
| display-delight | comfort_food_display (Life & Style) | exposer/servir les plats (deco) |
| gensokyo-delight | cobblemon_food (Cobblemon) | niche Touhou, cuisine annexe |
| tomtarus-tweaks | berries (produits) + cobblemon_food | pont cobblemon berries->FD |

Principe : **cuisiner** = Culinary (socle + addons). **Automatiser la cuisine** = Create (central kitchen). **Cuisiner pour les Pokemon** = Cobblemon (cobblemon_food). **Servir/exposer/PNJ** = Life & Style (comfort_food_display). Chaque chapitre a un angle unique, aucune recette de base FD n'est redemandee dans les addons.

---

## 6. Couverture complete (chaque famille de mods -> un chapitre)

### 6.1 Mapping exhaustif

| Famille (inventaire) | Mods | Chapitre(s) | Statut |
|---|---|---|---|
| CULINARY (13) | farmers-delight, slice-and-dice | farmers_delight | couvert |
| | nether's/aether's/end's/miner's/cultural/brewin | delight_addons | couvert |
| | create-central-kitchen | create_2 | couvert (pont) |
| | chefs-delight, display-delight | comfort_food_display | couvert |
| | gensokyo-delight | cobblemon_food | couvert (niche) |
| | tomtarus-tweaks | berries + cobblemon_food | couvert (pont) |
| CREATE base + addons (~28) | create, encased, compressed, cobblestone, integrated-farming | create_1 | couvert |
| | createaddition, enchantment-industry, enchantable-machinery, ender-transmission, klinks-n-klangs | create_3 | couvert |
| | create-molten-vents, dragons-plus, sa jetpacks, curios-jetpack, central-kitchen | create_2 | couvert |
| | steam-n-rails, blocks-bogies, vibrant-vaults, connected, ultimate-factory, createnuclear | create_4 | couvert |
| | create-deco, copycats, design-n-decor, bellsandwhistles | decoration | couvert (deco) |
| | numismatics | economy | couvert |
| | create-dreams-and-desires, create-let-the-adventure-begin | A VERIFIER (voir 6.3) | ambigu |
| | create-stuff-additions (armes/gadgets) | create_2 (gadgets) + adventure_loot (armes) | couvert |
| COBBLEMON addons (~30) | cobblemon core, pokenav, cobblenav, smartphone, catch-indicator, spawn-alerts, counter, journey-mounts, pet-your-cobblemon, safepastures, integrations | cobblemon_1 | couvert |
| | mega-showdown, navas-zamega | evolution_items | couvert |
| | unchained, fight-or-flight-reborn, capture-xp, exp-all, cobblestats, move-inspector, simpletms, more-cobblemon-tweaks, cobbreeding, utility+, retraining, armory | cobblemon_2/3 | couvert |
| | berryharvester, berry-pouch | berries | couvert |
| | myths-and-legends, raiddens, paleontology | myths_legends | couvert |
| | release-rewards | pvp_items | couvert |
| | cobblefurnies, rechiseled-cobblemon | decoration | couvert (deco) |
| | rctmod, rctapi, tim-core | steamon_league | couvert |
| DIMENSIONS/EXPLO (~24) | aether, deep-aether | aether | couvert |
| | deeperdarker, deeper-oceans | otherside | couvert |
| | bwg, continents, yungs-cave-biomes, oh-the-trees, yungs-better-dungeons/mineshafts/strongholds/end-island, ct-overhaul-village, sky-villages, towns-and-towers, moogs-voyager, explorify, lootr, lootrmon, natures-compass, waystones | exploration (+ end pour end-island, welcome pour waystone/compass tip) | couvert |
| | immersive-aircraft | aether (acces alt) + comfort_food_display(tip fun) | couvert |
| STORAGE/UTIL (~11) | sophisticated-storage/backpacks(+create-integration), trash-cans, item-obliterator, construction-sticks | storage_util | couvert |
| | veinmining (enchantement), tree-harvester, universal-bone-meal, rightclickharvest | overworld (1 quete TIP checkmark, 4 mecaniques passives) | couvert. NB: cut-through N'EXISTE PAS dans le pack (retire), et le mod reel de ce nom est du combat, pas de la recolte. |
| | universal-bone-meal, rightclickharvest | overworld | couvert |
| DECO (~15) | chipped, rechiseled, another-furniture, immersive-furniture, beautify, supplementaries(+squared), amendments, double-doors, immersive-paintings, display-delight | decoration (display-delight en comfort_food) | couvert |
| | exposure | comfort_food_display | couvert |
| | cobblefurnies | decoration | couvert |
| AVENTURE/LOOT/GEAR (~11) | relics, artifacts, reliquified-artifacts, advanced-netherite, armor-of-the-ages, cosmeticarmours(->curios), gravestone(->overworld tip) | adventure_loot | couvert |
| | cobblemon-armory | cobblemon_3 (obtention) + adventure_loot(tip) | couvert |
| | magnum-torch | overworld + exploration | couvert |
| | spuds-shops | economy + adventure_loot(marchands) | couvert |
| | numismatics | economy | couvert |
| CURIOS/ACCESS (~6) | curios, accessories, simple-hats, crawl, comforts | curios_accessories | couvert |
| | waystones | welcome + exploration | couvert |
| INSTRUMENTS/NICHE (~3) | immersive-melodies | comfort_food_display | couvert |
| | klinksnklangs | create_3 (balls) + decoration (deco) | couvert |
| | exposure | comfort_food_display | couvert |

### 6.2 Mods NON mis en quete (decides, avec raison)

| Mod | Raison |
|---|---|
| cc-tweaked (ComputerCraft) | Hors-theme (informatique/programmation), aucun lien Create/Cobblemon, public non cible. Aucune quete. |
| ~120 mods TECHNIQUE/QoL/libs (perf, libs, UI/HUD, claims, backups) | Infrastructure invisible. Aucune quete (regle : pas de quete sur les libs). Exception : les HUD Cobblemon (catch-indicator/counter) ont 1 tip dans cobblemon_1 car ils sont gameplay-facing. |
| create-threaded-trains | Perf pure, deja note "pas de quete" dans la progression. |

### 6.3 Mods ambigus tranches

| Mod | Decision | Justification |
|---|---|---|
| create-ultimate-factory | INCLURE dans create_4 (1-2 quetes tip) MAIS quest-mod-researcher doit confirmer la fonction exacte avant ecriture. Si c'est un gen de ressources cheat-like, le mettre en branche optionnelle discrete, pas en jalon. | Fonction a verifier. |
| create-dragons-plus | INCLURE : bulk-processing (create_2) + deco (decoration). PAS des dragons (confirme par progression create). | Progression documentee. |
| create-dreams-and-desires, create-let-the-adventure-begin, create-dragons-plus(aventure) | A VERIFIER par quest-mod-researcher/quest-mc-knowledge. Si contenu aventure reel (mobs/structures/boss) -> 1-2 quetes dans adventure_loot ou exploration. Si pack de blocs deco -> decoration. Par defaut : 1 tip fun optionnel, jamais un jalon, tant que non confirme. | Contenu non confirme. |
| exposure (appareil photo) | INCLURE : 1-2 quetes fun optionnelles dans comfort_food_display (prendre une photo de son equipe/base). Non bloquant. | Fun, cadre "art de vivre". |
| immersive-aircraft | INCLURE : quete fun optionnelle (acces alternatif Aether, ou balade) dans aether + tip comfort_food_display. Non bloquant. | Vehicule, transversal. |
| cosmeticarmours | curios_accessories (cosmetique) | Slot cosmetique = famille curios. |
| create-stuff-additions | gadgets/armes : gadgets dans create_2 (extendo grip, potato cannon), armes dans adventure_loot | Double nature. |

---

## 7. Layout par chapitre (topologie, pas coordonnees)

Le config-writer posera les x/y exacts. Ici la TOPOLOGIE et les shapes semantiques (convention Steamon figee) :

**Convention shapes (a appliquer partout)** :
- `gear` size 2.5-3.0 = racine d'un chapitre Create + tout gate de progression Create.
- `pentagon` size 2.0-2.5 = racine d'un chapitre Cobblemon (forme dediee Pokemon) + jalons Pokemon majeurs.
- `hexagon` size 2.0-2.5 = racine d'un chapitre Dimension / gate `type:dimension`.
- `heart` = racine Life & Style + item affectif (pet-your-cobblemon, comforts).
- `diamond` size 2.0 = racine Culinary + jalons cuisine.
- `rsquare` = jalon a reward table (fin de chaine, market, kit).
- `octagon` = "trouve un biome/structure/source" (pierres d'evo, structures exploration, donjons aether).
- `circle` = convergence / node checkmark a N deps / advancement gate.
- `square` = craft final de fin de chaine (armures endgame, staff).
- `none` = case de grille de collection (18 types, key items M&L, fossiles).

**Topologie par chapitre (pattern branch-and-converge)** :

- **welcome** : racine circle size 2 -> 3-4 tips en eventail (backpack, waystone, 2 univers) -> convergence checkmark invisible vers overworld.
- **overworld** : racine hexagon size 2.5 (Steamon Journey) -> chaine lineaire verticale wood/stone/iron/diamond (le tronc, lignes VISIBLES) -> 2 branches laterales quest_link (Create a gauche, Cobblemon a droite) -> gates nether/end en bas (hexagon).
- **create_1..4** : chacun racine gear size 3 a gauche -> diverge en branches (kinetics / fluides / logistics) -> reconverge sur un jalon rsquare (fin de chapitre, reward table). create_3 se clot sur le node "Poke Ball" (pont Cobblemon, gear). create_4 : la branche nucleaire part en optional en bas.
- **cobblemon_1** : racine pentagon size 2.5 -> tronc court (starter->catch->PC->heal) -> eventail (pasture, friendship, mounts, HUD apps) -> convergence pentagon "trainer ready".
- **cobblemon_2** : grille 18 types (none, icon_scale 2, 2 rangees de 9) -> convergence circle one_completed "Type Master" (hide_dependency_lines) reward jackpot.
- **cobblemon_3** : 3 branches (breeding / EV-IV / TM-unchained) qui divergent d'une racine pentagon -> reconvergence "Mastery".
- **berries** : eventail A2 (paires biome->berry) + node pouch. Reduit, pas 73 quetes.
- **evolution_items** : eventail A2 (10 paires biome-octagon -> pierre) + branche mega (bracelet->key stone->mega stones) en bas.
- **pvp_items / cobblemon_food** : grilles A4 independantes + checkmark convergence.
- **myths_legends** : grille A1 (key items en none, hide lines) + node one_completed jackpot. Racine optional. Sous-branches raids + paleontology.
- **nether/end** : A3 court -> gate hexagon -> eventail cache (hide_until_deps_complete) : materiaux, 1 type Pokemon (octagon catch), branches optionnelles (wither skull nether, dragon end).
- **aether/otherside** : A3 dense -> gate hexagon size 2.5 (portail) -> eventail cache tiers materiaux (octagon donjons) -> chaine armures endgame (square) -> Deep Aether / Deeper biomes en extension.
- **exploration** : A4 grille de structures (octagon) + biomes/arbres, convergence circle. Waystone reseau au centre.
- **farmers_delight** : diamond racine -> tronc FD (pot/board/skillet) -> eventail recettes -> rsquare "master".
- **delight_addons** : une colonne par addon (nether/aether/end/miner/cultural/brewin), paliers verticaux, convergence.
- **decoration/storage_util/curios_accessories/comfort_food_display** : A4 grilles independantes de tips, racine heart/circle size 2, checkmark convergence, hide_dependency_lines. Beaucoup d'optional.
- **steamon_league** : A3 lineaire (gym1->...->Elite4->Champion) via advancement defeat_count, lignes visibles (le joueur suit l'ordre).
- **adventure_loot** : A4 (relics/artifacts/netherite/set armors en branches) + marchands.
- **economy** : A4 racine optional circle -> selling/wallet/shop en eventail -> tiers rsquare.

**Regles de layout transverses** : lignes de dependance VISIBLES sur les troncs (overworld, create troncs, league) ; CACHEES sur les grilles/convergences (cobblemon_2, myths_legends, Life & Style). Espacement >= 1.5 unite, 0 overlap (validator verifie). Symetrie sur les eventails (branches equilibrees gauche/droite).

**quest_links inter-chapitres** (le tronc pointe vers les chapitres) :
- overworld -> create_1 racine (linked_quest)
- overworld -> cobblemon_1 racine (linked_quest)
- create_2 (central kitchen) <-> farmers_delight (renvoi cuisine)
- create_3 (klinks Poke Ball) -> cobblemon_1 (les balls)
- delight_addons (aether's/miner's) -> aether/otherside (renvoi dimension)
- cobblemon_food (aprijuice) -> cobblemon_1 (mounts)
- storage_util (vaults) -> create_4 (renvoi vault)
- curios_accessories (relics/artifacts tip) -> adventure_loot
- comfort_food_display -> farmers_delight (renvoi cuisiner)

---

## 8. Ordre de production Phase C (recommande)

Principe : produire d'abord le squelette de progression (le joueur doit pouvoir jouer le tronc), puis les 2 univers, puis les dimensions, puis le confort. Dependances de production = un chapitre en amont doit exister pour que les quest_link/gates aval resolvent.

**Vague 1 - fondation (bloque tout le reste)** :
1. `chapter_groups.snbt` regenere (7 groupes, ids fixes) + `data.snbt` verifie. FIX du bug fantome.
2. welcome
3. overworld (Steamon Journey, le tronc) - CRITIQUE, tout s'y accroche.

**Vague 2 - les 2 univers (paralleles, accroches au tronc)** :
4. create_1 (racine Create, referencee par overworld)
5. cobblemon_1 (racine Cobblemon, referencee par overworld)
6. create_2, create_3 (klinks depend de create_1 ; Poke Ball pointe cobblemon_1)
7. cobblemon_2, cobblemon_3

**Vague 3 - dimensions (gates apres overworld)** :
8. nether, end (troncs dim, gates apres overworld)
9. aether, otherside (branches dim)
10. exploration

**Vague 4 - cuisine + cobblemon annexe** :
11. farmers_delight, delight_addons (delight_addons renvoie aux dims -> apres vague 3)
12. berries, evolution_items, cobblemon_food, pvp_items
13. create_4 (endgame, apres create_2/3)

**Vague 5 - confort + endgame** :
14. Life & Style : decoration, storage_util, curios_accessories, comfort_food_display
15. Adventure : steamon_league (coordonner avec agent steamon-league), adventure_loot, economy
16. myths_legends (jackpots, apres que les reward tables jackpot existent)
17. daily_quests (repeatables, en dernier : reference des reward tables de plusieurs chapitres)

**Contraintes de production explicites** :
- chapter_groups AVANT tout chapitre (sinon group inexistant -> refus de chargement).
- overworld AVANT create_1/cobblemon_1 (les quest_link du tronc).
- create_1 AVANT create_2/3 (deps kinetics) ; create_2/3 AVANT create_4.
- Les reward tables jackpot (myths_legends_rewards) AVANT myths_legends.
- delight_addons APRES les dimensions (renvois aether's/miner's).
- Chaque chapitre passe par : quest-mod-researcher (progression) -> quest-architect (blueprint detaille par chapitre, moi) -> quest-writer + quest-config-writer (textes + SNBT) -> quest-validator. Anti-repetition verifiee contre le registre (section 3) a chaque chapitre.

---

## 9. Points a confirmer avant/pendant production (via quest-mc-knowledge / quest-mod-researcher)

- Type Pokemon exact par dimension (is_nether/is_end/is_aether/is_otherside dans spawn_pool_world). Ne pas inventer.
- Fonction reelle de create-ultimate-factory, create-dreams-and-desires, create-let-the-adventure-begin (contenu aventure vs deco).
- Items invalides connus a NE PAS utiliser (deja liste) : cobblemon:poke_puff/cream_puff, journeymount:*aprijuice (non donnables), create:funnel (->andesite_funnel), createaddition:accumulator (->capacitor), createnuclear:uranium (->raw_uranium). Verifier chaque item par /give.
- Feathers EV +1 NON obtenables depuis Cobblemon 1.6 : ne pas les demander (cobblemon_3 utilise vitamins/mochi).
- Crafts a verifier JEI : Warden Helmet, Reinforced Echo Shard (otherside), Mega Bracelet/Stones exact, Cherish Ball (recette custom netherite).
- create-cobblestone : prudence (a cause un crash NBT). 1 tip max, tester en isolation.

---

## Annexe : correspondance v2 -> refonte

| v2 (21 chap) | refonte (29 chap) | action |
|---|---|---|
| welcome | welcome | garder, enrichir |
| overworld | overworld | garder = tronc, delink wither skull |
| daily_quests | daily_quests | garder, brancher reward tables |
| create_1..4 | create_1..4 | garder noms, appliquer registre (dedup items) |
| cobblemon_1 | cobblemon_1 | reduire balls (pas collection 29) |
| cobblemon_2 (113 q) | cobblemon_2 (grille types) + cobblemon_3 (mastery) | scinder |
| cobblemon_3 (67 q) | absorbe dans cobblemon_3 + pvp_items | reorganiser |
| berries (73 q) | berries (reduit) | degonfler, brutes seulement |
| cobblemon_cooking (87 q) | cobblemon_food (reduit) | degonfler, produits seulement |
| evolution_items | evolution_items + mega branch | enrichir mega |
| pvp_items | pvp_items | garder |
| nether/end/aether/otherside | idem + enrichis (deep-aether, deeper-oceans) | enrichir |
| (absent) | exploration | NOUVEAU |
| (absent) | myths_legends | NOUVEAU |
| culinary (79 q) | farmers_delight + delight_addons | scinder |
| (absent) | Life & Style: decoration/storage_util/curios_accessories/comfort_food_display | NOUVEAU group |
| steamon_league | steamon_league | garder (agent steamon-league) |
| adventure_loot | adventure_loot + economy | detacher economy |

---

## 10. Suivi d'avancement (mis a jour par quest-orchestrator)

### Etat des vagues
- **Vague 1 CLOSE (v1, incomplete)** : welcome + overworld refondus, deployes, reload 0 erreur. Fige les 4 cibles quest_link overworld : create_1=`5D00FEC7C79E27E1`, cobblemon_1=`4EFD1A480A12986D`, nether=`36F75F3A69E5E07F`, end=`4000000000000B01`. ATTENTION : validee trop tot (10 quetes sans titre/desc, 7 checkmark welcome orphelins subsistaient).
- **Vague 1 REPRISE CLOSE (2026-08-03)** : correction du residuel welcome + overworld. welcome 9->8 quetes (checkmark cogwheel `6BC2F36454120A89` supprime = doublon porte Create ; icone command_block->torch sur `38700AB387BF8F4B` ; racine `1B6DD754A1659453` + 2 checkmarks "Join the Community"/"Surviving the First Night" textes ajoutes). overworld : 5 quetes sans texte rediges (iron/iron_tools/nether_portal/gravestone/magnum_torch) ; tronc chaine en ligne continue (deps ajoutees 0E609DBE->5ADB3AB9, 26D544BA->0E609DBE, 7081A84E->5CDA7F5E, gravestone 22B0B4F4->5ADB3AB9) ; 3 quest_links portes ajoutes (Create gear x-3.5/y2.5, Cobblemon pentagon x3.5/y2.5, Nether hexagon x3.5/y15.0). 2 defauts herites corriges (overlap torch/waystone : torch deplacee a (0,2.6) ; reward=objectif racine oak_log->oak_sapling). Boot 0 erreur (`Loaded 8 chapter groups, 21 chapters, 704 quests` = 705-1 supprimee). 2 titres de chapitre orphelins purges du lang (`8082BDEB0536DB1D`, `E6E8E3EA674E6CD1`) et remplaces par les ids reels (`290C02C15C8843CE` welcome, `111CC61C07A52AD5` overworld).
- **REGLE quest_link : FTB purge silencieusement au boot tout quest_link dont la cible n'existe pas.** (RESOLU en Vague 3 : le lien Nether est retabli, voir ci-dessous.)

### Vague 3 lot 1 CLOSE (2026-08-03) : nether + end + lien Nether retabli
- **nether "Into the Nether"** (id 3EF16F7A003E45D5) : 13->11 quetes. BUG "Air" corrige (quete `401CF50145120356` item vide -> minecraft:ancient_debris x2). Gate racine creee id `36F75F3A69E5E07F` (renommage de l'ex-40996153FB959512, advancement enter_the_nether, hexagon). Types nettoyes : SEUL Fire (confirme 50 especes) ; dark supprime, ex-dark->ghast_tear, ex-ground->magma_cream. 2 quetes supprimees (checkmark doublon 4000000000000A01 + dark catch 407DE90E67F64A06). Convergence netherite 408EF2591FC945BB min_required 2. Branche wither NON ajoutee (RNG inutile). Validator PASS qcheck 0/0/0 deps=10.
- **end "The Final Frontier"** (id 2139644C7994A01B) : 16 quetes. Dragon ELIMINE (0 espece is_end confirme terrain) -> Psychic (Sigilyph/Unown/Metagross, tips). Advancements reconvertis (find_end_city/elytra/levitate/dragon_egg/dragon_breath) au lieu d'items uniques exiges. Tip legendaire Giratina/Eternatus en lore Q14 (reward jackpot M&L table 3468789012281550202L), pas de catch legendaire. Convergence Master of the End 4053CC3CE24C8C96 min_required 1. 3 nouveaux ids (4054629EF17E4552/4059CC3CE24C1001/4066CC3CE24C1002). Defaut mineur dragon_head double corrige -> end_crystal sur convergence. Validator PASS qcheck 0/0/0 deps=15.
- **LIEN NETHER RETABLI** : le quest_link Nether (id link `0100000000000A01` -> cible `36F75F3A69E5E07F`, hexagon x3.5 y15.0) a ete AJOUTE dans overworld et SURVIT au boot (la gate existe maintenant). overworld a ses 4 portes : Create `5D00FEC7C79E27E1`, Cobblemon `4EFD1A480A12986D`, Nether `36F75F3A69E5E07F`, End `4000000000000B01`.
- Boot 585 quests, 20 reward tables, 0 invalid item, lang OK. Parite repo=serveur sur tout. Lang fusionne depuis serveur LIVE (0 regression vagues precedentes).

### Vague 3 RESTE : aether + exploration
- **aether** (id 11428B5DCB284F18) : RETIRER toute catch-by-type (0 spawn Cobblemon dedie confirme -> bug garanti). Objectifs = contenu NATIF (portail glowstone+eau, tiers Skyroot/Holystone/Zanite/Gravitite, donjons Bronze/Silver/Gold via advancements aether:*, items Dart Shooter/accessoires/Sun Altar, Deep Aether Skyjade/Stratus). 1 catch generique any-type optionnel OK. ~20 quetes. Recherche faite (pieges : agate/adibium INEXISTANTS, gold_dungeon_key pas golden, notch_hammer inexistant, immersive_aircraft items a confirmer).
- **exploration "Uncharted"** (NOUVEAU chapitre, group Dimensions) : ~18 quetes 100% optionnelles. Structures (betterdungeons/betterstrongholds/bettermineshafts/mvs/skyvillages/explorify), biomes (biomeswevegone/yungscavebiomes), Lootr/Lootrmon (coffres instancies, tip SMP majeur), waystones/warp scrolls/nature's compass/magnum torch. PAS de dim mining (aucune installee). Recherche faite.
- otherside DEJA propre (0/0), laisser sauf besoin coherence liens.
- **Vague 2A/2B CLOSE** (2026-08-01) : create_1 (31 quetes) + cobblemon_1 (23 quetes) refondus, deployes serveur test, RESTART + reload FTB Quests 0 erreur (`Loaded 8 chapter groups, 21 chapters, 708 quests, 19 reward tables`, 0 "invalid item"). Validator PASS. Racines alignees sur overworld. create_1 clot proprement a copper_casing (brass/precision/deco RETIRES -> create_2/decoration). cobblemon_1 : collection 29 balls reduite a 6 significatives, node "3 spurs gratos" supprime, 2 quest_links sortants vers create_3 `7FD87542D311BA8A`. reward table `cogs_crates_rewards` creee, `first_steps_rewards` reutilisee.

### IMPORTANT : le `/reload` in-game ne recharge PAS FTB Quests
FTB Quests ne s'accroche pas au hook `/reload` (datapacks/KubeJS). Pour qu'il relise les SNBT modifies a froid, il faut un **RESTART** du service `steamon-test.service` (`sudo systemctl restart steamon-test.service`). Le log de boot montre alors `[FTB Quests]: Loading quests from ...` + `Loaded N chapter groups...`. C'est CE log (0 "Tried to load invalid item") qui fait foi, pas le `/reload`.

### Dettes techniques a traiter dans les vagues futures (detectees en Vague 2)
1. **Doublon `create:crafting_blueprint`** : present en tip dans create_1 (proprietaire legitime, QoL de craft) ET dans create_4 (quete `21C400000000000C`). Quand create_4 sera refait (Vague 4), RETIRER ce tip de create_4 (renvoyer a create_1). crafting_blueprint = propriete create_1.
2. **Titres de chapitres casses dans en_us.snbt** (le `\&` a ete perdu, double espace) : `chapter.388F59E226EBC45B.title: "Myths  Legends"` et `chapter.5EFD32D15CC97C4F.title: "Adventure  Loot"` et `quest.3000000000000C01.title: "Welcome to Myths  Legends"`. A corriger quand ces chapitres seront refaits (Vague 5) ou lors de la regen chapter_groups.
3. **Chapitres DUPLIQUES dans le lang** (bug fantome a trancher a la regen chapter_groups + Vagues 4/5) : "Evolution Items" (`74F26D82D9CE04F2` + `C0157DBF045118CA`), "PvP Battle Items" (`2A69463259A2529A` + `C0CE44042B5F1369`), "Cobblemon Cooking" (`5A5AC189BB6CF2ED` + `C0F466D125501734`). Identifier le bon id de chaque paire, supprimer le fantome.
4. **Orphelins lang purges** : la fusion Vague 2 a retire 508 cles lang mortes (quetes v2 disparues, convention `.quest_desc`/`.quest_subtitle`). en_us est passe de ~3378 a 2277 lignes. Les chapitres encore en v2 (aether/end/nether/culinary/etc.) gardent leurs cles ; a refondre vague par vague.

### Procedure de deploiement confirmee (Vague 2)
1. config-writer ecrit dans le REPO (3 emplacements). Fragments lang FINAL en scratchpad (JAMAIS en_us directement).
2. orchestrator fusionne les fragments dans en_us.snbt (script, 1 passe), sync vers docs/quests/lang.
3. orchestrator : scp local -> /tmp gazai -> sudo cp en place (root:root 644) -> save-all -> annonce chat -> `systemctl restart steamon-test`.
4. Verifier le log de boot FTB Quests (0 invalid item, N chapters/quests loaded).
5. validator -> verdict PASS obligatoire. Si FAIL, corriger + redeployer + re-valider.

### Vague 2C CLOSE (2026-08-01) : create_2 + create_3
- create_2 (Rotational Power, 21 q) + create_3 (Sparks \& Circuits, 22 q) refondus, validator PASS, déployés serveur test, reload 0 erreur (705 quests, 0 invalid item).
- Chaînage Create complet : create_1 capstone `17D2B573D0192137` -> create_2 racine `72B7A55C0E1D0001` (dep + quest_link) ; create_3 racine `7FD87542D311BA8A` (cible cobblemon_1) -> quest_link sortant vers cobblemon_1 `4EFD1A480A12986D`.
- electrum RETIRÉ de create_3 (INFABRIQUABLE : tag c:ingots/silver vide, recette mixing jamais chargée). Tronc élec = root->rolling_mill->wires->connectors->energy_bridge->capacitor->convergence->poke_ball_factory.
- 3 items reward invalides corrigés au reload : createaddition:experience_nugget->create:experience_nugget, create:copper_ingot->minecraft:copper_ingot, molten_vents:asurine->create:asurine.

### LEÇON MAJEURE Vague 2C : IDs hex 1er char <= 7 OBLIGATOIRE
FTB Quests 2101 RÉGÉNÈRE silencieusement au save disque tout id (quête/task/reward/quest_link) dont le 1er caractère hex est >= 8 (8-F), car il dépasse Long.MAX_VALUE positif. create_1 (préfixe CE) et cobblemon_1 (préfixe CB) ont eu leurs quest-ids réécrits ~5 min après le boot -> lang cassé (Unnamed) SANS erreur au log. Résolu en rapatriant la version régénérée par FTB (ids <= 7) et en remappant le lang par position. create_2/3 (préfixe 7) n'étaient pas touchés. RÈGLE consignée en mémoire [[ftbquests-id-first-char-le7]]. TOUS les config-writers doivent générer des ids à préfixe 0-7 uniquement. Détection : après restart + save, comparer quest-ids serveur vs repo ; si divergence -> ids >=8 régénérés.

### Procédure affinée : FTB réécrit les fichiers au format canonique
Après un reload, FTB Quests réécrit les .snbt qu'il a chargés (format multi-lignes canonique, suppression des clés à valeur défaut). Pour garder la parité repo=serveur byte-à-byte, RAPATRIER les fichiers depuis le serveur test vers les 3 emplacements repo après validation. rcon_client.py sur /tmp gazai est effacé à chaque reboot -> le recréer si besoin.

### Vague 2D CLOSE (2026-08-03) : cobblemon_2 + cobblemon_3 refondus
- **cobblemon_2 "The Type Trials"** (id chapitre `680467472FCE4635`) : 108q -> **23q** (1 gate `3000000000000B01` + grille 18 types + convergence Type Master `2000000000000201` optional all_completed + 3 tips). Reward table `type_master_rewards` CRÉÉE (id hex `2AABBCC000000001` = table_id `3074758703430238209L`, jackpot). Préfixe quêtes `2...`.
- **cobblemon_3 "Breeding \& Battle Mastery"** (id `388F59E226EBC45B`) : 61q -> **26q** (gate `3000000000000C01` + 3 branches breeding/EV-IV/TM-armory + convergence Battle Master `7C30000000000401` min_required_dependencies:2 optional). Préfixe `7C3...`.
- Déployé, restart, boot 0 erreur : `Loaded 8 chapter groups, 21 chapters, 584 quests, 20 reward tables` (704->584 = -120). Validator PASS (2 chapitres). Dep entrante des 2 = `44FCB07F176B20CD`.
- **CORRECTION MAJEURE task type** : le VRAI task type Cobblemon est **`cobblemon_tasks:cobblemon_task`** (pas `cobblemon_quests:cobblemon` comme écrit à tort ci-dessus en cours de vague). Format prouvé terrain (nether/end/aether/otherside/cobblemon_1 déployés). Champs : `action` + `pokemon_type: "fire"` (STRING, PAS array `["fire"]`) + `pokemon: "ditto"` (STRING) + `amount: NL`. Voir [[steamon-cobblemon-quests-task-type]] pour le format complet.
- **CORRECTION table_id battle_master** : `battle_master_rewards` = `7496482881432646114L` (hex `6808DB766C96F1E2`). Le v2 pointait `3468789012281550202L` qui = **myths_legends_rewards** (`30239D3A6DD1E57A`), erreur car v2 cobblemon_3 était M&L. Ne pas confondre.
- **Contenu v2 hors-mission écarté** : cobblemon_2 v2 (mega/armory/fossils) et cobblemon_3 v2 (~50 key items M&L) appartiennent à evolution_items/myths_legends. Préservé dans `scratchpad/v2_preserve/` pour Vague 5.

### LEÇON CRITIQUE Vague 2D : TOUJOURS fusionner le lang depuis l'état SERVEUR courant
PIÈGE le plus grave rencontré. En Vague 2D j'ai fusionné le nouveau lang à partir d'un `en_us.snbt` scratchpad PÉRIMÉ (rapatrié en début de session, état PRÉ-Vague 1). Résultat : j'ai ÉCRASÉ les 10 clés welcome/overworld ajoutées en Vague 1 -> régression SILENCIEUSE (welcome racine + 8 quêtes redevenues "Unnamed" en jeu, sans aucune erreur au log). Le validator qui relit un lang déjà régressé ne voit rien d'anormal côté SNBT.
RÈGLE ABSOLUE : avant toute fusion lang, RAPATRIER `en_us.snbt` depuis le SERVEUR (`sudo cp` -> scp) comme base, JAMAIS réutiliser une copie scratchpad d'une session/vague antérieure. Le serveur est la seule source de vérité du lang courant (FTB ne réécrit pas le lang, donc serveur = dernier état déployé). Après fusion, VÉRIFIER que les clés des vagues PRÉCÉDENTES sont toujours présentes (spot-check quelques ids de chaque chapitre déjà refait), pas seulement les nouvelles.

### OUTIL DE VALIDATION OBLIGATOIRE : /tmp/qcheck.py (VPS)
Le validator DOIT coller la sortie brute de `/tmp/qcheck.py` (croise snbt+lang, compte par chapitre : noTitle, noDesc, brokenDep, chkNoTitle/gratosChk, deps) pour tout verdict PASS. Un PASS non prouvé par cette sortie = rejeté (règle imposée par team-lead). ATTENTION faux positifs légitimes à lister explicitement (jamais silencieusement) : les `quest_links` (linked_quest) et les nodes `invisible: true` (convergence) n'ont PAS de titre propre -> qcheck les flagge en noTitle mais c'est normal. Tout autre noTitle/noDesc hors racine = vrai défaut.

### DETTE RÉSOLUE (2026-08-03) : dépendances create_1 + cobblemon_1
create_1 et cobblemon_1 avaient un arbre VISUEL mais quasi aucun `dependencies` (0 gating). CORRIGÉ : quest-architect a produit un blueprint de deps (branch-and-converge selon la vraie progression), config-writer a appliqué, déployé, re-qcheck.
- create_1 : deps passé de 1 à 30 (tronc andesite->casing->machines->copper + 3 bassins kinetics/processing/fluids convergeant vers 3 checkpoints min_required:2 + capstone Master of Cogs min_required:2/3).
- cobblemon_1 : deps passé de 1 à 22 (tronc starter->catch->PC->heal + éventail pasture/friendship/mounts/HUD/balls + convergence Trainer Ready 44FCB07F176B20CD avec min_required_dependencies:3/6 pour non-blocage).
- quest_links sortants préservés. qcheck final : create_1 0/0/0 deps=30 ; cobblemon_1 0/0/0 deps=22.
Les convergences déjà présentes avaient min_required_dependencies mais SANS assez de parents (incomplétables) : le blueprint leur a donné leurs parents.

### LEÇON Vague 2D : purge lang par BLOC (arrays multi-lignes)
Quand on remplace un chapitre v2, il faut purger ses anciennes clés lang. PIÈGE : les clés `.description: [` / `.quest_desc: [` sont MULTI-LIGNES (array). Une purge "supprime la ligne contenant l'id" retire la ligne de clé MAIS laisse le contenu de l'array + le `]` ORPHELINS -> casse le parsing de TOUT le fichier lang (`Failed to read en_us.snbt: Expected ':' @ ligne:col` -> FTB ignore le lang entier -> toutes les quêtes "Unnamed"). Détection : le log `can't read lang file` au boot. Correction : purger par BLOC (quand une clé purgée finit par `[` sans `]`, sauter jusqu'au `]` fermant inclus). Toujours vérifier crochets équilibrés + 0 ligne de contenu hors array après purge, ET vérifier le log boot (0 "Failed to read en_us").

### RÉSERVE Myths & Legends pour Vague 5 (À NE PAS PERDRE)
Le fichier v2 `cobblemon_3.snbt` (id `388F59E226EBC45B`) contenait en réalité ~90 quêtes Myths & Legends collection (54 key items distincts : adamant_orb, azure_flute, gs_ball, hoopa_ring, diancies_crown, dna_splicer, genesect_drive, cornerstone/hearthflame/wellspring masks, orbs, tablets, etc.). Le v2 (cobblemon_2 collection + cobblemon_3 M&L) est PRÉSERVÉ dans `scratchpad/v2_preserve/` (cobblemon_2_v2.snbt, cobblemon_3_v2_myths.snbt). Quand je ferai le chapitre myths_legends (Vague 5), récupérer ces 54 items + leurs textes comme base de la grille jackpot. NE PAS re-inventer, réutiliser.

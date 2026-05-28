# Changelog

All notable changes to the Steamon modpack.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and uses [SemVer](https://semver.org/).

## [1.0.3] - 2026-05-28

### Added
- **Visible Traders** (client + server): a villager's *locked* trades (the higher-tier
  offers normally hidden until you level the villager up) are now shown in the trade
  screen, so you can see what a villager will eventually sell before grinding it. Pairs
  with Easy Villagers' trade cycling. Trades revert if the mod is ever removed (no exploit).

### Changed
- **Discord bridge: advancement messages removed from chat.** Every player advancement
  used to spam the Discord #in-game-chat ("X has made the advancement …"); those messages
  are now off. Normal chat, joins/leaves and deaths still bridge as before.

## [1.0.2] - 2026-05-28

Bug-fix and balance pass: kills the night-time mobs that slipped past our spawn rules,
removes a redundant mod that made villager trades cycle twice, locks down a carriable
block, and adds the last batch of Mega-item crafting recipes.

### Removed
- **Trade Cycling** mod removed. It did the exact same thing as Easy Villagers (cycle a
  villager's offers), and both were bound to the same key — so a single press cycled the
  trade **twice**. Easy Villagers keeps the feature on **C**; now one press = one cycle.

### Changed
- **Hostile spawns tightened (In Control).** Phantoms (the night-time "insomnia" mobs)
  and village-siege / reinforcement zombies were still spawning at night because they
  don't use the normal spawn path our rule blocked. They're now denied too, and
  `doInsomnia` is off so phantoms never trigger in the first place. Spawners, trial
  spawners and summons are unaffected.
- **Carry On: Cobblemon Display Case is no longer carriable.** Picking it up with Carry On
  could drop its stored item / desync its block entity, so it's blacklisted like the
  other inventory-sensitive blocks.

### Added (custom recipes — steamon-tweaks datapack)
- **Mega items are now craftable**, so Mega Evolution no longer depends purely on finding
  drops:
  - **Keystone**: compress a Radiated Mega Meteorite block 20× in a sequenced assembly —
    70% chance to yield the Keystone, otherwise you get a plain Mega Meteorite block back.
    Also a Create deploying recipe.
  - **Mega Stone**, **Blank Z-Crystal**, **Wishing Star**, **Sparkling Stone** (light & dark):
    each gets a shaped recipe plus a Create variant (deploying / mixing / assembly).

## [1.0.1] - 2026-05-27

### Added
- **Starter Kit** (server): every new player gets a random kit on first join (1 of 7 variants) —
  a Pokédex (random color), 10 Poké Balls, Running Shoes, a Sophisticated Backpack, 10 Oran Berries,
  and 4 random-color Apricorn seeds. Admins can re-give with `/sk give <player> <kit>`.
- **Just Zoom** (client): zoom keybind set to **C**, adjustable with the scroll wheel.
- **Sodium Dynamic Lights** + **Create: Dynamic Lights** (client): held/dropped light-emitting items
  (and Create light sources) now light up their surroundings.

### Changed
- Sophisticated Backpacks are now owner-locked (other players can't open them).

## [1.0.0] - 2026-05-27 — First stable release

Out of beta. Full recap of the pack and everything that changed across the betas.

### Content & mods
- Create x Cobblemon core (MC 1.21.1 / NeoForge).
- Mega Showdown + AllTheMons x MSD (Mega Evolution, Dynamax, Terastallization, Z-Moves).
- Cobblemon addons: Fight or Flight, Unchained, Capture XP, CobbleStats, Counter, Release Rewards,
  Safe Pastures, Paleontology, CobBreeding, SimpleTMs, Cobblemon Industries (Create), Smartphone,
  PokeNav/CobbleNav, Cobbledex.
- Large Create stack (Steam'n'Rails, Createaddition, Create Nuclear, Ultimate Factory, and more).
- Worldgen: Terralith, Tectonic, Towns & Towers, CTOV, YUNG's structures, Explorify, Sky Villages.
- QoL/social: Waystones (+ teleport pets), Simple Voice Chat, Sophisticated Storage & Backpacks,
  Jade, JEI, Carry On, Gravestone, Easy Villagers, Tree Harvester, Open Parties & Claims,
  Discord <-> MC chat bridge.
- Client: Xaero's minimap (mob icons, top-right), default resourcepacks pre-enabled,
  CraftPresence ("Playing Steamon"), tuned default options.

### Changed (balance & config)
- Hostile mobs no longer spawn naturally at night, except in the Aether, the Otherside (Deep Dark
  dimension) and the vanilla Deep Dark biome. Spawners / trial spawners / summons still work.
- Cobblemon can no longer spawn in the Otherside dimension.
- Magnum Torch (diamond) also blocks wild Cobblemon and Radical trainers, wider range.
- Carry On: only block-entity blocks are carriable; Create machines & Pokémon stay non-carriable.
- Waystones: warp cost ~1 level (same dim) / ~3 levels (interdimensional).
- Claims (OPAC): 5 forceloads, 500 claims per player (stack in parties).
- Mega Showdown: multiple Megas, Dynamax anywhere, Tera shard cost reduced to 16.
- Tree Harvester: chop without sneaking, no auto-replant.
- Create Nuclear: reactor explosion disabled.
- Jade: shows all Pokémon stats (caught or not).
- Gravestone: owner-only grave breaking. Servercore perf tuning. Internal mod backups disabled.
- Eternal Steak / Everlasting Beef: loot removed (no longer obtainable).
- Minecraft tutorial (move/jump/punch a tree) disabled by default.

### Added (custom recipes — steamon-tweaks datapack)
- Smartphone: Mechanical Crafter recipe (any pokefinder + apricorn + warp stone + healing machine +
  nether star + PC + precision mechanism + ender chest); vanilla recipe removed; re-dye to any color.
- Base villager (Easy Villagers): emeralds + brown mushroom + Heart of the Deep + any crop.
- 18 Type Gems (amethyst + diamond + a type item).
- 18 Tera Shards + Stellar: gem -> 4 shards via cutting board (iron+ pickaxe / diamond+ knife) or
  Create saw; reverse 4 shards + 4 diamonds -> 1 gem; Stellar = nether star cut the same way.
- Rare Candy: Create sequenced assembly (exp candy XL -> deploy apricorn -> spout honey ->
  deploy paper -> deploy blue dye -> press); old mixing recipe removed.
- Applin apples: Sweet (honeycomb), Tart (sweet berries), Syrupy (honey bottles).
- Skeleton Skull: bone block on a cutting board (+ bonus bone meal). Wither Skeleton Skull: mixing
  (wither rose + skull) OR a 10-step sequenced assembly (80% success, scrap on failure).
- Wither Rose: haunting a poppy -> 1% wither rose / 99% ash.
- Nether Star duplication: 4 stellar shards + 4 diamonds + 1 star -> 2.
- Cobblemon staples now craftable: everstone, leftovers, lucky egg.
- All Cobblemon medicines ported to Create mixing (27 recipes, same berries as brewing);
  brewing stand & campfire still work too.

## [Unreleased]

### Added
- Initial repository structure (packwiz client + server, GitHub Actions CI)

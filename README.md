# Steamon

[![Modrinth](https://img.shields.io/badge/Modrinth-Steamon-1bd96a?logo=modrinth&logoColor=white)](https://modrinth.com/project/steamon)
[![Minecraft](https://img.shields.io/badge/Minecraft-1.21.1-62b47a?logo=minecraft&logoColor=white)](https://www.minecraft.net/)
[![NeoForge](https://img.shields.io/badge/Loader-NeoForge_21.1-d97706)](https://neoforged.net/)
[![License](https://img.shields.io/badge/License-All_Rights_Reserved-red)](LICENSE)

**A cozy, adventurous, Pokémon-flavored automation modpack for Minecraft 1.21.1 — built around Create, Cobblemon, and Sophisticated Storage.**

Steamon is what happens when a Cobblemon trainer falls in love with steampunk engineering and decides to build a pastoral village from scratch. Tame your first Pokémon, automate your kitchen with Create contraptions, decorate your homestead with Macaw's furniture, and clear gym leaders along the way.

Distributed exclusively on Modrinth as two variants:

- **Steamon Client** — optimized for FPS, shader-ready (Iris + Sodium), full QoL stack
- **Steamon Server** — optimized for TPS, ships with curated Cobblemon datapacks (Indigo League, gym leaders, trainer NPCs)

---

## Quick install

### Client (player)

1. Install the [Modrinth App](https://modrinth.com/app)
2. Browse Modpacks, search **Steamon**, click *Install* on the Client version
3. Launch — done

Also works with Prism Launcher, ATLauncher, MultiMC, and any other `.mrpack`-compatible launcher.

### Server (host)

See [`docs/INSTALL.md`](docs/INSTALL.md) for the full server setup.

---

## What's inside

### The three pillars

| Mod | Role |
|---|---|
| **Create 6.0.10** | Mechanical automation, trains, factories |
| **Cobblemon 1.7.3** | Pokémon mechanics, capture, battles |
| **Sophisticated Storage** + Backpacks | Smart, upgradable storage |

### Automation — Create ecosystem

Create itself, plus a curated set of stable, well-maintained addons:

- **Steam 'n' Rails** — passenger trains, signals, station hubs
- **Create: New Age** — electricity, batteries, capacitors
- **Create Crafts & Additions** — energy bridging with other mods
- **Create Deco** — decorative steampunk blocks
- **Create: Connected** — extra mechanical components and contraption-friendly blocks
- **Create: Enchantment Industry** — automated enchanting and printing
- **Create: Numismatics** — automated economy, coins, payment terminals
- **Create Big Cannons** — cannons, ballistics
- **Create: Diesel Generators** — fuel-based power generation

### Adventure — Pokémon journey

- **Cobblemon: Mega Showdown** — Mega Evolutions, Z-moves, Gigantamax
- **Cobblemon Integrations** + **Knowlogy** — cross-mod compat and in-game Pokédex
- **Radical Cobblemon Trainers** — wandering NPC trainers with rosters
- **AllTheMons** + **ATM x MSD** + **Radiants** (server-side datapacks) — extended dex and shiny-alternative forms
- **CobbleBuilds: Leaders**, **Radical Gyms & Structures**, **Cobblemon: Indigo** (server) — full Indigo League progression with gyms, Elite Four, Champion

### Adventure — exploration

- **Terralith** — vastly expanded biome generation
- **Towns and Towers** + **When Dungeons Arise** + **Repurposed Structures**
- **YUNG's Better Dungeons / Mineshafts / Strongholds**
- **Waystones** — fast travel network
- **Xaero's Minimap** + **World Map** + Cobblemon icon overlay

### Cozy — homestead & farm

- **Farmer's Delight** — cooking, crops, kitchens
- **Aquaculture 2** — fishing, biome-specific fish
- **Friends & Foes** — gentler vanilla-friendly mobs
- **Supplementaries** — small but lovely vanilla-extension blocks
- **Chipped** — every wood, stone, and brick in every shape
- **Macaw's Bridges / Roofs / Furniture / Fences and Walls** — building variety
- **Beautify!** — small decorative items

### RPG-lite — accessories & artifacts

- **Accessories** (NeoForge-native, unified successor to Curios) — accessory slots
- **Relics** — themed relic items with subtle effects
- **Artifacts** (mowzie) — randomly-generated dungeon loot

### Quality of life

JEI, Jade, AppleSkin, Mouse Tweaks, Inventory Profiles Next, Bookshelf, Controlling — everything you expect from a 2026 modpack.

### Performance — client (in `Steamon Client` only)

Sodium, Iris (shaders ready), FerriteCore, ModernFix, EntityCulling, ImmediatelyFast, Dynamic FPS.

A **Complementary Reimagined** shader pack ships in `shaderpacks/` (disabled by default).

### Performance — server (in `Steamon Server` only)

Lithium for NeoForge, ServerCore, Spark, Alternate Current, Noisium.

### Visuals (client)

- **Fresh Animations** + Fresh Moves / Fresh Player extensions
- **XaerosCobblemon** — Pokémon icons on the minimap
- **RCT Trainers+** textures and animations

---

## Two variants — why?

A modpack distributed once-fits-all forces servers to ship Sodium and Iris uselessly (server doesn't render) and players to pay for ServerCore tuning that does nothing on their machine. Steamon splits these concerns:

- **Client** ships everything a player needs, with FPS mods baked in
- **Server** strips client-only renderers, ships server perf mods + datapack content (gyms, trainers, league)

Both variants share the same mod core (Create, Cobblemon, Storage, structures, cozy/farm), so multiplayer is seamless — install the Client variant, connect to a server running the Server variant.

---

## Versioning and releases

The repository uses semantic versioning. Releases are triggered by Git tags:

```bash
git tag v1.0.0-client && git push origin v1.0.0-client   # publishes the client pack
git tag v1.0.0-server && git push origin v1.0.0-server   # publishes the server pack
```

The `Publish Modpack` GitHub Action then builds the `.mrpack` with packwiz and uploads it to Modrinth automatically.

---

## Development

Source of truth: [packwiz](https://packwiz.infra.link/) (TOML files, one per mod, in `client/mods/` and `server/mods/`).

### Add a mod

```bash
cd client  # or server
packwiz modrinth add <slug>
packwiz refresh
```

### Build a `.mrpack` locally

```bash
cd client
packwiz modrinth export
# → produces Steamon Client-<version>.mrpack
```

---

## Roadmap

- [x] v0.1 — Core mod selection, dual client/server packs, CI pipeline
- [ ] v0.2 — Custom configs (Relics balance, Cobblemon Terralith spawn patch, server.properties tuning)
- [ ] v0.3 — Questbook (FTB Quests or Heracles), progression-guided onboarding
- [ ] v0.4 — Custom Cobblemon spawn rebalance for Terralith biomes
- [ ] v1.0 — First stable release with full smoke-test in solo and multiplayer

---

## Credits

Every mod in this pack is the work of its respective authors. The pack is curated by [Gaspard4i](https://github.com/Gaspard4i). Special thanks to the Cobblemon, Create, and Modrinth communities.

---

## License

The pack contents (mods, resource packs, shaders) are distributed under each author's individual license — please consult the original mod pages on Modrinth.

The configuration files, mod selection, and build scripts in this repository are © 2026 Gaspard Catry, All Rights Reserved. Personal use and forking for personal play are explicitly permitted. See [`LICENSE`](LICENSE).

# Steamon

**A cozy, adventurous, Pokémon-flavored automation modpack for Minecraft 1.21.1 — built around Create, Cobblemon, and Sophisticated Storage.**

Steamon is what happens when a Cobblemon trainer falls in love with steampunk engineering and decides to build a pastoral village from scratch. Tame your first Pokémon, automate your kitchen with Create contraptions, decorate your homestead with Macaw's furniture, and clear gym leaders along the way.

Distributed as two variants:

- **Steamon Client** — optimized for FPS, shader-ready (Iris + Sodium), full QoL stack
- **Steamon Server** — optimized for TPS, ships with curated Cobblemon datapacks (Indigo League, gym leaders, trainer NPCs)

---

## The three pillars

| Mod | Role |
|---|---|
| **Create 6.0.10** | Mechanical automation, trains, factories |
| **Cobblemon 1.7.3** | Pokémon mechanics, capture, battles |
| **Sophisticated Storage** + Backpacks | Smart, upgradable storage |

## Automation — Create ecosystem

Create itself, plus a curated set of stable, well-maintained addons: **Steam 'n' Rails** (passenger trains, signals), **Create: New Age** (electricity), **Create Crafts & Additions** (energy bridging), **Create Deco** (steampunk blocks), **Create: Connected**, **Create: Enchantment Industry** (automated enchanting), **Create: Numismatics** (in-game economy), **Create Big Cannons**, **Create: Diesel Generators**.

## Adventure — Pokémon journey

- **Cobblemon: Mega Showdown** — Mega Evolutions, Z-moves, Gigantamax
- **Cobblemon Integrations** + **Knowlogy** — cross-mod compat and in-game Pokédex
- **Radical Cobblemon Trainers** — wandering NPC trainers with rosters
- **AllTheMons** + **ATM x MSD** + **Radiants** (server-side datapacks) — extended dex and shiny-alternative forms
- **CobbleBuilds: Leaders**, **Radical Gyms & Structures**, **Cobblemon: Indigo** — full Indigo League progression with gyms, Elite Four, Champion

## Adventure — exploration

**Terralith** (vastly expanded biome generation), **Towns and Towers**, **When Dungeons Arise**, **Repurposed Structures**, **YUNG's Better Dungeons / Mineshafts / Strongholds**, **Waystones** (fast travel), **Xaero's Minimap** with Cobblemon icons.

## Cozy — homestead & farm

**Farmer's Delight** (cooking, crops, kitchens), **Aquaculture 2** (fishing), **Friends & Foes** (gentler vanilla-friendly mobs), **Supplementaries** (small but lovely vanilla-extension blocks), **Chipped** (every wood, stone, and brick in every shape), **Macaw's** series (Bridges, Roofs, Furniture, Fences and Walls), **Beautify!**.

## RPG-lite — accessories & artifacts

**Accessories** (NeoForge-native, unified successor to Curios) + **Relics** (themed relic items with subtle effects) + **Artifacts** (mowzie, dungeon loot).

## Quality of life

JEI, Jade, AppleSkin, Mouse Tweaks, Inventory Profiles Next, Bookshelf, Controlling.

## Performance — client variant only

Sodium, Iris (shaders ready), FerriteCore, ModernFix, EntityCulling, ImmediatelyFast, Dynamic FPS. A **Complementary Reimagined** shader pack ships in `shaderpacks/` (disabled by default — enable in Video Settings → Shaders).

## Performance — server variant only

Lithium for NeoForge, ServerCore, Spark, Alternate Current, Noisium.

## Visuals (client)

**Fresh Animations** + Fresh Moves / Fresh Player extensions, **XaerosCobblemon** (Pokémon icons on the minimap), **RCT Trainers+** textures and animations.

---

## Installation

### Client

1. Install the [Modrinth App](https://modrinth.com/app)
2. Browse Modpacks → search **Steamon** → click *Install* on the **Client** version
3. Launch — done

Also works with Prism Launcher, ATLauncher, MultiMC, and any other `.mrpack`-compatible launcher.

### Server

1. Download the latest **Server** `.mrpack` from this page
2. Unzip into a fresh server directory
3. Install **NeoForge 21.1.230** on top
4. Edit `server.properties` if needed (defaults: view-distance 8, simulation-distance 6)
5. Recommended JVM: Java 21, 8 GB RAM minimum (`-Xms8G -Xmx8G -XX:+UseG1GC`)

Full server setup notes: [GitHub repo — `docs/INSTALL.md`](https://github.com/Gaspard4i/steamon-modpack/blob/main/docs/INSTALL.md)

---

## Why two variants?

A modpack distributed once-fits-all forces servers to ship Sodium and Iris uselessly (server doesn't render) and players to pay for ServerCore tuning that does nothing on their machine. Steamon splits these concerns:

- **Client** ships everything a player needs, with FPS mods baked in
- **Server** strips client-only renderers, ships server perf mods + datapack content (gyms, trainers, league)

Both variants share the same mod core, so multiplayer is seamless: install the Client variant, connect to a server running the Server variant.

---

## Source code

The pack is built with [packwiz](https://packwiz.infra.link/) — every mod tracked in a TOML file under `client/mods/` or `server/mods/`. Source on [GitHub](https://github.com/Gaspard4i/steamon-modpack).

CI publishes a new version to Modrinth automatically on every `v*-client` / `v*-server` Git tag.

## Credits

Every mod in this pack is the work of its respective authors. The pack is curated by [Gaspard4i](https://github.com/Gaspard4i). Huge thanks to the Cobblemon, Create, and Modrinth communities.

## Issues, ideas, contributions

[Open an issue on GitHub](https://github.com/Gaspard4i/steamon-modpack/issues).

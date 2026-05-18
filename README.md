<div align="center">

![Steamon — Create × Cobblemon](.modrinth/banner.png)

# Steamon

**A cozy automation + Pokémon modpack — Create × Cobblemon × Sophisticated Storage**

[![Modrinth](https://img.shields.io/badge/Modrinth-Steamon-1bd96a?logo=modrinth&logoColor=white)](https://modrinth.com/project/steamon)
[![Minecraft](https://img.shields.io/badge/Minecraft-1.21.1-62b47a?logo=minecraft&logoColor=white)](https://www.minecraft.net/)
[![NeoForge](https://img.shields.io/badge/Loader-NeoForge_21.1-d97706)](https://neoforged.net/)
[![CI](https://github.com/Gaspard4i/steamon-modpack/actions/workflows/publish.yml/badge.svg)](https://github.com/Gaspard4i/steamon-modpack/actions)
[![License](https://img.shields.io/badge/License-All_Rights_Reserved-red)](LICENSE)

</div>

---

A cozy automation + Pokémon modpack where you tame your first Pikachu, automate your kitchen with Create contraptions, and clear gym leaders along the way — all in the same world.

Ships as **two variants** on Modrinth:

- **Steamon Client** — optimized for FPS, shader-ready, full QoL
- **Steamon Server** — optimized for TPS, curated Cobblemon datapacks (Indigo League, gyms, trainers)

---

## Why Steamon?

Most Create+Cobblemon packs are kitchen-sink: hundreds of mods, no focus, painful to onboard. Steamon picks **three pillars** and builds a tight, opinionated experience around them.

- **Create 6.0** — automation, trains, factories
- **Cobblemon 1.7.3** — the full Pokémon journey
- **Sophisticated Storage** — smart, upgradable storage

Everything else is curated to support these three. No filler.

---

## What's inside

| Theme | Highlights |
|---|---|
| **Create** | Steam 'n' Rails, New Age (electricity), Numismatics (economy), Big Cannons, Diesel Generators, Crafts & Additions, Deco, Connected, Enchantment Industry |
| **Cobblemon** | Mega Showdown, Knowlogy (in-game Pokédex), AllTheMons, Radical Cobblemon Trainers, Indigo League (gyms, Elite Four, Champion) |
| **Adventure** | Terralith, YUNG's series, When Dungeons Arise, Towns and Towers, Repurposed Structures, Waystones |
| **Cozy & Farm** | Farmer's Delight, Aquaculture, Friends & Foes, Supplementaries, Chipped, Macaw's (Bridges, Roofs, Furniture, Fences and Walls), Beautify |
| **RPG-lite** | Accessories (NeoForge-native), Relics, Artifacts |
| **Maps** | Xaero's Minimap & World Map with Cobblemon icon overlay |
| **Client perf** | Sodium, Iris, FerriteCore, ModernFix, EntityCulling, ImmediatelyFast, Dynamic FPS |
| **Server perf** | Lithium, ServerCore, Spark, Alternate Current, Noisium |
| **Visuals** | Fresh Animations, Fresh Moves, XaerosCobblemon, RCT Trainers+, Complementary Reimagined shader |

Full list of mods with versions: see `client/mods/` and `server/mods/` (one `.pw.toml` file per mod).

---

## Why two variants?

A one-size-fits-all modpack forces servers to ship Sodium and Iris uselessly (server doesn't render) and forces players to pay for ServerCore tuning that does nothing on their machine. Steamon splits these concerns:

| | Client | Server |
|---|---|---|
| Sodium / Iris / EntityCulling | ✅ | ❌ |
| Resource packs / shaders | ✅ | ❌ |
| Xaero's Minimap | ✅ | ❌ |
| Lithium / ServerCore / Noisium | ❌ | ✅ |
| Gym datapacks (Indigo, RGS, CobbleBuilds) | ❌ | ✅ |
| RCT NPC trainers | ✅ | ✅ |
| Core mod set (Create, Cobblemon, Storage, structures, cozy) | ✅ | ✅ |

Both variants share the same core, so multiplayer is seamless: install Client, connect to a server running Server.

---

## Install

### Client

1. Install the [Modrinth App](https://modrinth.com/app)
2. Browse Modpacks → search **Steamon** → click *Install* on the **Client** version
3. Launch

Also works with Prism Launcher, ATLauncher, MultiMC — anything that accepts `.mrpack`.

### Server

See [`docs/INSTALL.md`](docs/INSTALL.md).

---

## Dev

Source of truth: [packwiz](https://packwiz.infra.link/) — every mod is tracked in a TOML file under `client/mods/` or `server/mods/`.

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

### Release

```bash
git tag v1.0.0-client && git push origin v1.0.0-client   # publishes the client pack
git tag v1.0.0-server && git push origin v1.0.0-server   # publishes the server pack
```

The `Publish Modpack` GitHub Action builds the `.mrpack` with packwiz and uploads it to Modrinth automatically.

---

## Roadmap

- ✅ **v0.1** — Core mod selection, dual client/server packs, CI pipeline
- 🔧 **v0.2** — Custom configs (Relics balance, Terralith spawn patch, server tuning)
- 📜 **v0.3** — Questbook (FTB Quests or Heracles)
- 🌍 **v0.4** — Custom Cobblemon spawn rebalance for Terralith biomes
- 🚀 **v1.0** — First stable release with full smoke-test in solo and multiplayer

---

## Credits

Every mod, resource pack, and shader in this pack is the work of its respective authors. Modpack curated by [Gaspard4i](https://github.com/Gaspard4i). Special thanks to the Cobblemon, Create, and Modrinth communities.

## License

Pack contents distributed under each mod author's individual license — consult their original Modrinth pages.

The configuration files, mod selection, and build scripts in this repository are © 2026 Gaspard Catry, All Rights Reserved. Personal use and forking for personal play are explicitly permitted. See [`LICENSE`](LICENSE).

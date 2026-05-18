<div align="center">

![Steamon — Create × Cobblemon](.modrinth/banner.png)

# Steamon

**A Create × Cobblemon modpack for Minecraft 1.21.1 on NeoForge**

[![Modrinth](https://img.shields.io/badge/Modrinth-Steamon-1bd96a?logo=modrinth&logoColor=white)](https://modrinth.com/project/steamon)
[![Minecraft](https://img.shields.io/badge/Minecraft-1.21.1-62b47a?logo=minecraft&logoColor=white)](https://www.minecraft.net/)
[![NeoForge](https://img.shields.io/badge/Loader-NeoForge_21.1-d97706)](https://neoforged.net/)
[![CI](https://github.com/Gaspard4i/steamon-modpack/actions/workflows/publish.yml/badge.svg)](https://github.com/Gaspard4i/steamon-modpack/actions)
[![License](https://img.shields.io/badge/License-All_Rights_Reserved-red)](LICENSE)

</div>

---

## About

Steamon is built around three pillars: **Create** for automation and ingenuity, **Cobblemon** for the full Pokémon experience, and **Sophisticated Storage** for smart inventory management. Everything else is curated to support these three — no kitchen-sink, no hundreds of irrelevant mods.

The pack ships as two separate variants on Modrinth:

- **Steamon Client** — for players. Bundles client performance mods (Sodium, Iris, FerriteCore, …), shader-ready, full QoL stack.
- **Steamon Server** — for server hosts. Strips client-only renderers, ships server performance mods (Lithium, ServerCore, Noisium) and curated Cobblemon datapacks (full Indigo League with gyms, Elite Four, Champion).

Install the Client variant for singleplayer or to connect to a server. Install the Server variant when you host the server.

## Technical details

- Minecraft **1.21.1**, mod loader **NeoForge 21.1.230**.
- Both variants are `.mrpack` files — installable via Modrinth App, Prism Launcher, ATLauncher, MultiMC, and any compatible launcher.
- Recommended: 8 GB RAM minimum for the client (12 GB with shaders enabled). 8 GB minimum for the server, 12 GB for 10+ concurrent players. Java 21 required.
- Built with [packwiz](https://packwiz.infra.link/); published automatically to Modrinth via GitHub Actions on each release tag.

## Install

### Client

1. Install the [Modrinth App](https://modrinth.com/app).
2. Browse Modpacks → search **Steamon** → click *Install* on the Client version.
3. Launch.

Works equally well with Prism Launcher, ATLauncher, MultiMC, or any launcher that accepts `.mrpack`.

### Server

See [`docs/INSTALL.md`](docs/INSTALL.md) for the full server setup.

## Repository layout

```
steamon-modpack/
├── .github/workflows/publish.yml   CI for Modrinth release on tag
├── .modrinth/                      Banner, icon, body.md (sources for the Modrinth listing)
├── client/                         packwiz pack: client variant
│   ├── pack.toml
│   ├── mods/*.pw.toml
│   ├── config/
│   ├── resourcepacks/
│   └── shaderpacks/
├── server/                         packwiz pack: server variant
│   ├── pack.toml
│   ├── mods/*.pw.toml
│   ├── config/
│   └── world/datapacks/
└── docs/
    ├── INSTALL.md
    ├── CONFIG_NOTES.md
    └── CHANGELOG.md
```

## Working on the pack

Source of truth: [packwiz](https://packwiz.infra.link/). Every mod is tracked in a TOML file under `client/mods/` or `server/mods/`.

```bash
# Add a mod
cd client          # or server
packwiz modrinth add <slug>
packwiz refresh

# Build a .mrpack locally
cd client
packwiz modrinth export
```

## Release

Tag the commit you want to publish:

```bash
git tag v1.0.0-client && git push origin v1.0.0-client
git tag v1.0.0-server && git push origin v1.0.0-server
```

The `Publish Modpack` GitHub Action builds the `.mrpack` with packwiz and uploads it to Modrinth.

## Roadmap

- v0.1 — Core mod selection, dual client/server packs, CI pipeline. **Done.**
- v0.2 — Custom configs (Relics balance, Terralith spawn patch, server tuning).
- v0.3 — Questbook (FTB Quests or Heracles).
- v0.4 — Custom Cobblemon spawn rebalance for Terralith biomes.
- v1.0 — First stable release with full smoke-test in solo and multiplayer.

## Credits

Every mod, resource pack and shader in this pack is the work of its respective authors. Modpack curated by [Gaspard4i](https://github.com/Gaspard4i). Thanks to the Cobblemon, Create and Modrinth communities.

## License

Pack contents are distributed under each mod author's individual license — consult their original Modrinth pages.

The configuration files, mod selection and build scripts in this repository are © 2026 Gaspard Catry, All Rights Reserved. Personal use and forking for personal play are explicitly permitted. See [`LICENSE`](LICENSE).

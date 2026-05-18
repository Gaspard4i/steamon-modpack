# Steamon

Modpack Modrinth combinant **Create** (automatisation), **Cobblemon** (Pokémon) et **Sophisticated Storage** dans une ambiance cozy + adventure + farm.

Deux variantes :
- **Steamon Client** — optimisations FPS, shaders, QoL
- **Steamon Server** — optimisations TPS, datapacks gameplay (gym leaders, trainers)

Distribué exclusivement via Modrinth : https://modrinth.com/project/steamon

## Stack

- Minecraft 1.21.1
- NeoForge
- Source-of-truth : packwiz
- Publication automatique : GitHub Actions

## Installation

Voir `docs/INSTALL.md`.

## Release

```bash
git tag v1.0.0-client && git push origin v1.0.0-client
git tag v1.0.0-server && git push origin v1.0.0-server
```

La CI publie automatiquement sur Modrinth.

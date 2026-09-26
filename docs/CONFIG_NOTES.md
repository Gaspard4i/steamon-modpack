# Configuration notes

## Relics — Disabling Infinite Steak

The **Infinite Steak** item from Relics lets the player eat without limits and breaks the food-diversity balance. To disable it:

1. Launch the game once so Relics generates its config files
2. Open `config/relics/items/infinite_steak.toml`
3. Set `enabled = false`
4. Save and relaunch

Server-side alternative: add the item to the `disabled_items` list in `config/relics-common.toml`:

```toml
disabled_items = ["relics:infinite_steak"]
```

## Cobblemon spawn in Terralith

Cobblemon does not spawn natively in Terralith biomes. The **AllTheMons x Mega Showdown** datapack (already shipped with the server variant) provides expanded spawn configs. If some Terralith biomes feel empty:

- Manually add a universal "Cobblemon Biome Spawn Patch" datapack (search on Modrinth as needed)
- Or edit `config/cobblemon/spawning/biome_categories.json` to map Terralith biomes to Cobblemon categories

## Sodium / Iris

Sodium ships enabled. Iris ships with no active shader (the Complementary Reimagined `.zip` is in `shaderpacks/` but disabled). To enable: Video Settings → Shaders → pick Complementary Reimagined.

## Recommended server RAM

- 8 GB minimum
- 12 GB recommended for 10+ concurrent players
- Java 21 required (NeoForge 1.21.x)

Typical launch: `java -Xms8G -Xmx8G -XX:+UseG1GC -jar neoforge-server.jar nogui`

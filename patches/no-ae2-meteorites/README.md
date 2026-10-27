# No AE2 Meteorites

Tiny custom datapack that overrides AE2's `data/ae2/tags/worldgen/biome/has_meteorites.json`
tag with `"replace": true, "values": []`, emptying the only biome tag the
meteorite structure is allowed to generate in. AE2 itself has no config
toggle to fully disable meteorite worldgen (its `[worldGen]` config
section only controls loot inside meteorites, not whether they generate
at all), so this is the standard data-driven way to turn the feature off
without touching anything else about AE2.

Ships through the Global Packs mod (see `mods/globalpacks.pw.toml`) instead
of a plain `world/datapacks/` entry: packwiz's `datapack-folder` resolves
relative to the instance folder, not the active save, so it only ever
reaches a world literally named `world`, never true for a singleplayer
save, and not guaranteed on a dedicated server either. Global Packs loads
everything in `datapacks/` into whichever world is actually open.

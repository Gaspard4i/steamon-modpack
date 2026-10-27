# Cobblemon Rarer Habitats

Overrides `data/cobblemon/worldgen/structure_set/habitats/habitats.json`
to double the spacing between Cobblemon habitat structures (the small
jigsaw structures carrying Habitat Blocks that bias Pokemon spawns).

All 30 habitats share a single structure_set, so this halves the
density of every habitat type at once rather than targeting one. Ships
through the Global Packs mod (see `mods/globalpacks.pw.toml`) so it
applies to whichever world is actually open, the same way as
`no-ae2-meteorites`.

| | Vanilla Cobblemon | Steamon |
|---|---|---|
| spacing | 30 | 60 |
| separation | 14 | 28 |

Source: https://gitlab.com/cable-mc/cobblemon/-/raw/main/common/src/main/resources/data/cobblemon/worldgen/structure_set/habitats/habitats.json

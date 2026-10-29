# Cobblemon Rarer Habitats

Overrides `data/cobblemon/worldgen/structure_set/habitats/habitats.json`
to reduce the density of Cobblemon habitat structures (the small jigsaw
structures carrying Habitat Blocks that bias Pokemon spawns).

All 30 habitats share a single structure_set, so this scales the
density of every habitat type at once rather than targeting one. Ships
through the Global Packs mod (see `mods/globalpacks.pw.toml`) so it
applies to whichever world is actually open, the same way as
`no-ae2-meteorites`.

Density in `random_spread` placement scales with 1/spacing^2, so going
from 60 to 190 (x3.16 spacing) is a 10x reduction on top of the earlier
2x. Net effect vs vanilla: 20x rarer habitats.

| | Vanilla Cobblemon | Steamon (first pass) | Steamon (current) |
|---|---|---|---|
| spacing | 30 | 60 | 190 |
| separation | 14 | 28 | 89 |

Source: https://gitlab.com/cable-mc/cobblemon/-/raw/main/common/src/main/resources/data/cobblemon/worldgen/structure_set/habitats/habitats.json

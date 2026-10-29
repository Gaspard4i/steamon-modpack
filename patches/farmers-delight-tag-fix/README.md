# Farmer's Delight Tag Fix

Self-hosted datapack, not a mod. Farmer's Delight 1.3.4 (the latest
release) ships its custom `c:*` item tags under the pre-1.21 path
`data/c/tags/item/` (singular) instead of `data/c/tags/items/` (plural)
Minecraft 1.21+ requires. Same bug as Let's Do Meadow, see
patches/meadow-tag-fix/README.md.

Result: every Cooking Pot recipe that uses one of those tags
(`c:crops/beetroot`, `c:foods/vegetable`, `c:drinks/milk`, etc.) resolves
to zero items, so JEI shows the slot as missing/magenta even though the
recipe itself is correctly registered.

On top of the path fix, `c:crops/beetroot` doesn't exist anywhere in the
jar at all (every other crop tag is defined, beetroot just got missed),
so it's added here pointing at `minecraft:beetroot`, and referenced from
the re-published `crops.json` umbrella tag.

Update when Farmer's Delight ships a release that fixes this upstream:
drop this patch and remove it from
`client/datapacks/farmers-delight-tag-fix.pw.toml` and
`server/datapacks/farmers-delight-tag-fix.pw.toml`.

Current Farmer's Delight version this was extracted from: 1.3.4
(NeoForge 1.21.1, 2026-10-29).

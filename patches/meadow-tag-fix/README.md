# Meadow Tag Fix

Self-hosted datapack, not a mod. Let's Do Meadow 1.4.10 (the latest
release) ships its custom `c:*` and `meadow:*` item tags under the
pre-1.21 path `data/<namespace>/tags/item/` (singular) instead of the
`data/<namespace>/tags/items/` (plural) path Minecraft 1.21+ requires.

Result: every Cookpot or Woodcutter recipe that uses one of those tags
(`c:salts`, `c:milks`, `c:cheese`, `c:eggs`, `c:wheat`, `meadow:pine_logs`,
etc.) resolves to zero items. The recipe is still registered and still
works if you happen to have the right item, but JEI can't preview it
(shows the slot as missing/magenta) and the tag itself is empty for
anything that depends on it.

This datapack re-publishes the same tag files (extracted straight from
the Meadow jar, byte-for-byte content, nothing changed but the path)
under `tags/items/` so the game actually finds them. Vanilla
`minecraft:*` tags Meadow also ships at the wrong path are intentionally
excluded here - those are redundant with real vanilla tags and don't
need fixing.

Update when Meadow ships a release that fixes this upstream: drop this
patch and remove it from `client/datapacks/meadow-tag-fix.pw.toml` and
`server/datapacks/meadow-tag-fix.pw.toml`.

Current Meadow version this was extracted from: 1.4.10 (NeoForge 1.21.1,
2026-10-29).

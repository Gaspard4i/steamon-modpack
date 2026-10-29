# Disable Smartphone Craft

Self-hosted datapack. Disables both crafting paths for the Cobblemon
Smartphone, as requested:

- The Mechanical Crafter recipes Apricogs adds for it: disabled via its
  own config instead (`client/config/apricogs-common.toml` and
  `server/config/apricogs-common.toml`, `compatibility.cobblemon_smartphone
  = false`), not by this datapack.
- The original crafting table recipes the Cobblemon Smartphone mod
  itself ships (16 colors, `data/cobblemon_smartphone/recipe/*.json`):
  overridden here with `minecraft:crafting_special_emptymap`, the
  standard way to cleanly disable a datapack recipe without touching the
  mod's jar.

Smartphones are no longer craftable by default. Remove this datapack
(and flip the Apricogs config flag back) to restore either path.

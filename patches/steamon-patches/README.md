# Steamon Patches

A single merged datapack bundling several small fixes and tweaks that
used to ship as separate zips. Merged into one file so the CurseForge
upload only introduces one unknown file instead of several at once,
which was triggering CurseForge's manual review on every release that
added or changed one of these patches.

Ships through the Global Packs mod, same as the other self-hosted
patches in this repo.

## Contents

- **Meadow tag fix**: fixes Let's Do Meadow 1.4.10 shipping its `c:`
  and `meadow:` item tags under the pre-1.21 `tags/item/` path instead
  of `tags/items/`, which broke JEI recipe previews.
- **Farmer's Delight tag fix**: same bug in Farmer's Delight 1.3.4,
  plus adds the missing `c:crops/beetroot` tag entry.
- **Disable Smartphone craft**: disables the base Cobblemon Smartphone
  crafting table recipes (all 16 colors). Paired with the
  `compatibility.cobblemon_smartphone = false` flag in
  `apricogs-common.toml` to also drop Apricogs' Mechanical Crafter
  recipes.
- **Molten Vents rarer**: makes Molten Vents spawn 10x more rarely
  (chance x10 on all 12 placed features, land and aquatic variants).

See each original patch's README in git history (pre-merge) for the
full technical detail on why each fix was needed.

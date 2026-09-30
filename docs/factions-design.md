# Factions - design recap

Status: draft / not implemented yet. This is a working document to fix ideas
before building anything - lore is a starting proposal, not final canon.

## Vision

Three permanent factions on the SMP, picked once at the start of a player's
playtime and never switchable afterward:

- **Team Relic**
- **Team Spark**
- **Team Might**

Each faction has its own starting kit, its own passive bonuses (things the
other two factions don't get), and its own FTB Quests questline with its own
rewards - even when a quest exists in more than one faction's line, the
reward it gives can differ per faction.

The factions are rivals **on paper only**. There is no PvP enforcement and no
mechanical faction-warfare system. Players are free to trade with, help, or
betray members of other factions at will - the rivalry is flavor, not a
constraint. A player's faction is also independent from their FTB Team
(co-op party): picking Relic doesn't stop you from partying up with Spark or
Might friends.

## Lore proposal (draft)

Working theme, leaning on what's already in the pack (Cobblemon + Create):

- **Team Relic** - archaeology and ancient power. Ruins, fossils, forgotten
  civilizations. Ties naturally to `Cobblemon: Paleontology`, the `Relics`
  mod (artifact items with random powers), and structure-heavy exploration
  mods already in the pack (Towns and Towers, Moog's Structures, YUNG's
  dungeons/strongholds). Identity: the past has power, if you're willing to
  dig for it.
- **Team Spark** - energy and invention. Kinetic power, electricity,
  automation. Ties to Create's kinetic systems and Applied Energistics 2.
  Identity: the future is built, not found.
- **Team Might** - raw strength and combat. Ties to combat/armor mods
  (Armor of the Ages, Cosmetic Armours) and could lean on Fighting-type
  Cobblemon for its early questline. Identity: power is proven, not claimed.

None of this is locked in - swap themes, names, or flavor text freely. The
point of writing it down here is just to have something concrete to react to
instead of starting from a blank page.

## Sub-roles (draft)

The pick is two-tier, closer to Origins remixed around teams than a flat
3-way choice: pick a team, then pick a sub-role within that team. Whether
the sub-role is permanent the same way the team is, or can be changed later,
is still open (see Open questions).

- **Team Relic**: Explorer, Miner, Professor, *(one more TBD)*
- **Team Spark**: Engineer, Rancher, *(rest TBD)*
- **Team Might**: Elite Trainer, *(rest TBD)*

No mechanical effect defined per sub-role yet - only the team-level bonuses
below are specified so far. Sub-roles could end up being flavor/cosmetic
only, or carry their own small perk on top of the team bonus - open call.

## Bonuses (draft values)

Team-level passive bonuses, always-on, permanent for as long as the player
stays in that team (i.e. forever, per the permanence rule above):

| Team  | Bonus 1              | Bonus 2   |
|-------|-----------------------|-----------|
| Relic | +0.5 step height       | +2 luck   |
| Spark | +3 block reach         | +1 luck   |
| Might | +3 entity reach        | +1 luck   |

These all map directly to vanilla 1.21.1 attributes - no custom effect
needed for any of them:

- `minecraft:generic.step_height` (Relic)
- `minecraft:generic.luck` (all three, different amounts)
- `minecraft:player.block_interaction_range` (Spark)
- `minecraft:player.entity_interaction_range` (Might)

Since every bonus here is a plain attribute modifier, applying them is
simpler than the generic "custom MobEffect" plan in the technical section
below: a permanent `AttributeModifier` added on first join (and idempotently
re-checked on login, in case the player's attribute base ever resets) covers
all of these without needing a registered MobEffect at all. Worth revisiting
that section once sub-role perks are defined, in case one of those *does*
need a real effect (e.g. something time-limited or stacking).

## Mechanics summary

- **Faction choice**: once, on first join. No in-game way to change it
  afterward (no player-facing "reroll" command/item).
- **Starting kit**: different items given on first join, per faction.
- **Passive bonuses**: each faction gets at least one permanent perk the
  others don't have (buff/effect, not just flavor).
- **Quests**: each faction sees its own questline (or its own branch of a
  shared tree). Shared quests can still pay out different rewards per
  faction.
- **No mechanical rivalry**: no forced PvP, no faction-locked chat/claims.
  Purely narrative.

## Technical approach (research recap, 2026-09-29)

Full findings from the research pass are summarized here; nothing below is
implemented yet.

**No new mod needed.** Everything is achievable with what's already in the
pack: KubeJS (+ Kotlin for Forge + Rhino), FTB Quests, FTB Teams, FTB XMod
Compat.

- **FTB Teams is the wrong tool for "faction".** A player can only belong to
  one FTB Team at a time (this is an open FTB limitation, not a config
  option), so tying "Team Relic" to a real FTB Team would block a Relic
  player from co-op-partying with Spark/Might friends - which breaks the
  explicit requirement that faction and co-op party stay independent.
  Faction must be tracked as its own permanent per-player flag, separate
  from FTB Teams entirely.
- **Permanent flag**: store it in KubeJS `player.persistentData` (real
  player NBT, source of truth, invisible to players) and mirror the same
  value into a scoreboard objective (e.g. `faction`, value 1/2/3) so FTB
  Quests Command Rewards and datapack functions can read it too. No
  player-facing command ever writes to it - that's what makes it permanent
  in practice. A cosmetic advancement on pick is a nice-to-have for flavor.
- **First-join detection**: no dedicated "first ever join" KubeJS event
  exists; the standard pattern is `PlayerEvents.loggedIn` + check if the
  persistent-data flag is unset yet.
- **Starting kit / passive bonuses**: same first-join script branch calls
  `player.give(...)` per faction; passive bonuses are custom permanent
  `MobEffect`s (registered via `StartupEvents.registry('mob_effect', ...)`)
  re-applied on `loggedIn`/`respawned` so they survive death.
- **Per-faction questline gating**: FTB Quests has no native
  scoreboard/player-condition visibility system (confirmed against current
  docs and an open upstream feature request). The standard workaround: one
  hidden marker quest per faction, force-completed the moment a player picks
  (via command or KubeJS), then every faction-specific chapter depends on
  that marker quest. Config-only in the quest editor, aside from the one
  force-complete call.
- **Per-faction reward variance on a shared quest**: either a Command Reward
  that calls a datapack function using
  `execute if score @s faction matches N run give ...` (no KubeJS needed),
  or a Custom Reward + the `FTBQuestsEvents.customReward` KubeJS hook
  (provided by FTB XMod Compat, already in the pack) for anything needing
  real logic.
- **Origins-style mods exist for 1.21.1 NeoForge** (`origins-neoforge` by
  IAFEnvoy, `neo-origins` by CyberDay1) but are **not recommended** - neither
  has FTB Quests integration, so the hard part (quest/reward variance) would
  still need to be hand-built on top, and both add real maintenance surface
  for a feature that's otherwise a few days of KubeJS scripting.

### Before building the full tree

- Proof-of-concept: confirm `FTBQuestsEvents.customReward` and `.completed`
  actually fire correctly under the pack's current FTB XMod Compat build
  (21.1.10) with one dummy quest, before authoring the full 3-faction tree
  on top of it.
- Decide the pick UI: custom KubeJS screen vs. a "chapter 0" quest-book
  selector vs. something else. Not a technical blocker, just a decision.

## Open questions

- Final lore/names/flavor text per faction.
- Remaining sub-roles: Relic's 4th, most of Spark's and Might's list.
- Whether sub-role is permanent like team, or changeable, and whether it
  carries its own mechanical perk or stays flavor/cosmetic.
- Exact starting kit per faction (bonuses are now drafted, kit isn't).
- How big each faction's questline should be relative to the shared
  progression content.
- Pick-UI choice (see above) - and whether it's one screen (team + sub-role
  together) or two separate steps.

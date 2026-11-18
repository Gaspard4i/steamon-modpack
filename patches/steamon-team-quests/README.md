# Steamon Team Quests

Links the FTB Quests questlines to the Steamon Origin team the player picks
(Spark, Might, Relic, Wooloo).

## How it works

- `steamon-team-quests.zip` (this folder's `pack/`) is a global datapack
  (loaded through Global Packs) that overrides the four `team_*.json` origin
  files to add a small tracker power. On pick, that power runs
  `scoreboard players set @s steamon_team <N>` (1=Spark, 2=Might, 3=Relic,
  0=Wooloo).
- `server/config/ftbquests/quests/chapters/team_{spark,might,relic}.snbt`
  each hold a hidden "gate" quest (`invisible: true`) with a `checkmark`
  task. A tick function
  (`data/steamon/functions/team_quests/tick.mcfunction`, registered in
  `#minecraft:tick`) completes the matching gate for every player whose
  `steamon_team` score matches that team.
- Everything else in a team's chapter should depend on that chapter's gate
  quest, so it stays invisible until the player has actually joined that
  team.
- `team_wooloo.snbt` instead holds 3 visible, always-available choice
  quests ("Follow the Spark/Might/Relic questline"). Each one's command
  reward sets `steamon_team` directly, same as the real Origins powers
  would, so picking one unlocks that team's chapter exactly like joining
  the team for real. There is no in-game lock after a choice is made; if
  that is wanted later, add a second scoreboard flag and gate the other two
  choice quests on it.

## Adding the actual quests

Add new quests to each `chapters/team_*.snbt` file, each one depending
(directly or transitively) on that chapter's gate quest id so FTB Quests'
`hide_until_deps_visible` keeps them hidden until the gate completes.

| Chapter | Gate quest id |
|---|---|
| Team Spark | `1111111111111101` |
| Team Might | `1111111111111102` |
| Team Relic | `1111111111111103` |

## League quests

The League (shared-data/trainer-ids.json, chapter "League", beats L1 to
L10) stays inside the same 3 chapter files, one per series
(team_spark.snbt / team_might.snbt / team_relic.snbt). No separate
League chapter exists or is needed: every League trainer id is already
unique per series (for example spark_crystal_isla_01, not shared with
the other series), and its `requires` field already points at other
trainer ids in the same series, most often the series' own
`<series>_marlo_02` rematch (the Ch5 "after the fall" fight), which
plays the role of "finished Ch5" without the generator needing any
special case for it.

Concretely: each arm (e4 type) requires the series' marlo_02 win, each
leader requires its own two arms, and the rival's final duel (L10)
requires the series' three leaders. `tools/generate_team_quests.py`
needs no change for this: it already writes every trainer of a series
(Ch1 through League) into that series' single chapter file, and
`format_quest`'s dependency resolution (`quest_id_for` on each id in
`requires`) already works the same way for a League id as for any
other trainer id, since League ids are plain entries in
trainer-ids.json like all the others.

## Required advancement task per story trainer quest

RCT only treats a trainer as a "key trainer" (full spawn level diff,
level cap source, progress graph) when it is `"optional": false` and
linked into its series' trainer graph via `requiredDefeats`. VERIFIED
by reading RCTMod source (`PlayerState.isKeyTrainer`,
`SeriesGraph.getNext`), see shared-data/research-answers.md (Q3) in
steamon-shared. A quest's `rctmod:trainers/defeat_<id>` advancement task
for a story-critical fight is only meaningful if the trainer side
actually set that trainer up this way. If a defeat task never
completes in testing, check the trainer's `optional` flag and
`requiredDefeats` chain before assuming the quest side is broken.

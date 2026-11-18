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

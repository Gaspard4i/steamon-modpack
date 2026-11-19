# Steamon Team Reset

Resets a team's FTB Quests chapter when the player picks a different
Steamon Origin team. Replaces the earlier scoreboard-based bridge
(patches/steamon-team-quests, removed), which depended on an
unverified custom Origins power loading correctly from a datapack
override. This uses the mod's own officially documented mechanism
instead: C:\Users\catry\dev\steamon-origin\ftbquests\README.md.

## How it works

Steamon Origin itself grants the advancement `steamon:team/<team>`
(spark, relic, might) when the player picks a team, and ends its choose
function with `function #steamon:team_chosen`. This datapack adds a
function to that tag (`data/steamon/tags/function/team_chosen.json`)
that resets the FTB Quests chapter of every team the player is not in
(`data/steamon_quests/function/reset_other_teams.mcfunction`), using
the real chapter ids:

| Chapter | id |
|---|---|
| Team Spark | `1111111111111001` |
| Team Might | `1111111111111002` |
| Team Relic | `1111111111111003` |

Each team chapter's gate quest (in
server/config/ftbquests/quests/chapters/team_{spark,might,relic}.snbt)
is `invisible: true` with a single `advancement` task on
`steamon:team/<team>`, and the chapter has
`hide_quest_until_deps_visible: true`. The mod grants that advancement
on the next player tick after choosing, which completes the gate and
reveals the chapter. Team Wooloo's 3 choice quests
(team_wooloo.snbt) grant the same advancement directly
(`/advancement grant @s only steamon:team/<team>`) instead of picking
a real Origins team.

## Limits (per the mod's own README)

- FTB Quests progress belongs to the FTB team (party), not the player.
  Keep players in their own FTB team if each chapter must stay private.
- The reset removes chapter progress; already claimed rewards are not
  taken back.
- The old chapter stays visible for one tick after a team change until
  the reset function runs.

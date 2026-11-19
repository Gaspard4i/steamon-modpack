# Runs when a player chooses a team (function tag #steamon:team_chosen).
# Resets the quest chapter of each team the player is not in, so changing
# team loses the old chapter's progress and it disappears again.
execute unless entity @s[tag=steamon.team.spark] run ftbquests change_progress @s reset 1111111111111001
execute unless entity @s[tag=steamon.team.relic] run ftbquests change_progress @s reset 1111111111111003
execute unless entity @s[tag=steamon.team.might] run ftbquests change_progress @s reset 1111111111111002

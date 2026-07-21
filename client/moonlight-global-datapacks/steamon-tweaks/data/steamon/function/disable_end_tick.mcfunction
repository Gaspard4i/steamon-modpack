# Disable End access (temporary, reversible) — DISABLED BY DEFAULT.
# Bug fixed: the old version used `execute in the_end as @a` which selects ALL
# players (the `in` only sets the execution dimension, it does NOT filter the
# selector) — so everyone got teleported to spawn every tick. The correct
# filter is `if dimension`, which tests the executing player's real dimension.
# To enable: add "steamon:disable_end_tick" back to data/minecraft/tags/function/tick.json
execute as @a if dimension minecraft:the_end run title @s actionbar {"text":"The End is closed for now.","color":"light_purple"}
execute as @a if dimension minecraft:the_end run tp @s -133.5 71.0 -137.5

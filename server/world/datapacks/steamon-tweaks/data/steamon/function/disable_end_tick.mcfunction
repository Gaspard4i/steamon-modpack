# Disable End access (temporary, reversible).
# Any player in the_end is bounced back to the overworld spawn (-133 71 -138).
# To re-open the End: remove "steamon:disable_end_tick" from
# data/minecraft/tags/function/tick.json (and delete this file).
execute in minecraft:the_end as @a run title @s actionbar {"text":"The End is closed for now.","color":"light_purple"}
execute in minecraft:the_end as @a in minecraft:overworld run tp @s -133.5 71.0 -137.5

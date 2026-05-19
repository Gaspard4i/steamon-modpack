"""Find where bone names + origins live in newer Blockbench .bbmodel format."""
import json

with open(r"C:\Users\GaspardCatry\Documents\personel\projects\steamon-modpack\.ballviewer\public\appletun.bbmodel") as f:
    d = json.load(f)

print("top-level keys:", list(d.keys()))
print()
# Check whether there's a separate "groups" array
for key in ("groups", "bones", "group_lookup"):
    if key in d:
        print(f"--- {key} (count={len(d[key])}) ---")
        print(json.dumps(d[key][:2] if isinstance(d[key], list) else d[key], indent=2)[:600])
        break
else:
    print("No groups/bones key. Let's check if outliner nodes carry name+origin in a sibling field.")
    n = d["outliner"][0]
    print("first outliner node full content (truncated):")
    print(json.dumps(n, indent=2)[:1500])

# Check for animations to see what bone names exist
if "animations" in d and d["animations"]:
    anim = d["animations"][0]
    print()
    print("First animation keys:", list(anim.keys()))
    if "animators" in anim:
        anim_keys = list(anim["animators"].keys())[:6]
        print("animators bone keys sample:", anim_keys)
        sample = list(anim["animators"].values())[0]
        print("first animator sample:", json.dumps(sample, indent=2)[:300])

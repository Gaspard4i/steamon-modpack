"""Fetch the official Cobblemon .bbmodel files for the pokeballs."""
import urllib.request, os, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DST = os.path.join(ROOT, ".ballviewer", "public")
os.makedirs(DST, exist_ok=True)

for name in ["poke_ball", "ancient_poke_ball"]:
    url = f"https://gitlab.com/cable-mc/cobblemon-assets/-/raw/master/blockbench/poke_balls/{name}.bbmodel"
    out = os.path.join(DST, f"{name}.bbmodel")
    urllib.request.urlretrieve(url, out)
    print(f"downloaded {out}  ({os.path.getsize(out)} bytes)")

with open(os.path.join(DST, "poke_ball.bbmodel")) as f:
    d = json.load(f)

print(f"\nMeta: {d['meta']}")
print(f"Resolution: {d['resolution']}")
print(f"Elements: {len(d['elements'])}")
print(f"Textures: {len(d['textures'])}")
for i, t in enumerate(d["textures"][:8]):
    src = t.get("source", "")
    print(f"  [{i}] name={t.get('name'):20} src_len={len(src)} mode={t.get('mode')}")

# Inspect first cube element
for el in d["elements"]:
    if el.get("type") == "cube" or el.get("type") is None:
        print(f"\nFirst cube: {json.dumps(el, indent=2)[:600]}")
        break

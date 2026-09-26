"""Fetch Flapple + Appletun .bbmodels from cobblemon-assets and dump their
bone hierarchy so we know what's articulable."""
import urllib.request, os, json

DST = r"C:\Users\GaspardCatry\Documents\personel\projects\steamon-modpack\.ballviewer\public"
os.makedirs(DST, exist_ok=True)

MONS = [("0841_flapple", "flapple"), ("0842_appletun", "appletun")]

for folder, slug in MONS:
    base = f"https://gitlab.com/cable-mc/cobblemon-assets/-/raw/master/blockbench/pokemon/gen8/{folder}"
    out = os.path.join(DST, f"{slug}.bbmodel")
    urllib.request.urlretrieve(f"{base}/{slug}.bbmodel", out)
    print(f"{slug}.bbmodel: {os.path.getsize(out)} bytes")
    with open(out) as f:
        d = json.load(f)
    tex_names = [t.get("name") for t in d["textures"]]
    print(f"  textures: {tex_names}")

    def names(node, depth=0):
        if isinstance(node, dict):
            print("  " + "  " * depth + node.get("name", "?"))
            for c in node.get("children", []):
                names(c, depth + 1)

    print("  bones:")
    for n in d["outliner"]:
        names(n)

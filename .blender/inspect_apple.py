"""Inspect bbmodel outliner structure - keys actually used per node."""
import json

with open(r"C:\Users\GaspardCatry\Documents\personel\projects\steamon-modpack\.ballviewer\public\appletun.bbmodel") as f:
    d = json.load(f)

n = d["outliner"][0]
print("top-level outliner node keys:", list(n.keys()))
print("name:", n.get("name"))
print("uuid:", n.get("uuid"))
print()
# Walk a few levels
def walk(node, depth=0, max_depth=4):
    if isinstance(node, dict):
        nm = node.get("name") or node.get("uuid", "")[:8] + "?"
        print("  " * depth + f"{nm}  origin={node.get('origin')}  rotation={node.get('rotation')}")
        if depth < max_depth:
            for c in node.get("children", []):
                walk(c, depth + 1, max_depth)
walk(n)

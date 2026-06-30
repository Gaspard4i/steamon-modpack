#!/usr/bin/env python3
# Generateur de badges Steamon.
# Edite badges.txt (un badge par ligne: slug | Nom Affiche), puis lance ce script.
# Il (re)genere : les models, les overrides dans paper.json, un PNG placeholder
# pour chaque badge qui n'a pas encore de texture, et BADGES-README.txt (commandes /give).
# Les PNG que tu as deja dessines NE sont PAS ecrases.

import json, struct, zlib, os, io, sys

HERE = os.path.dirname(os.path.abspath(__file__))
NS = "steamon"                     # namespace du resourcepack
BASE_ITEM = "minecraft:paper"      # item de base re-skinne
CMD_START = 1001                   # premier custom_model_data

TEX_DIR   = os.path.join(HERE, "assets", NS, "textures", "item")
MODEL_DIR = os.path.join(HERE, "assets", NS, "models", "item")
PAPER_JSON = os.path.join(HERE, "assets", "minecraft", "models", "item", "paper.json")
BADGES_TXT = os.path.join(HERE, "badges.txt")
README = os.path.join(HERE, "BADGES-README.txt")

# couleurs placeholder cycliques (juste pour distinguer avant ton art)
PALETTE = [(120,120,120),(90,160,220),(240,200,40),(200,90,180),
           (200,120,200),(210,170,110),(220,80,40),(110,180,90),
           (150,150,220),(220,150,90),(90,200,160),(200,200,90)]


def parse_badges():
    badges = []
    if not os.path.exists(BADGES_TXT):
        print("ERREUR: badges.txt introuvable."); sys.exit(1)
    with io.open(BADGES_TXT, encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            if not line or line.startswith("#"):
                continue
            if "|" not in line:
                print(f"  (ignore, pas de '|') : {line}"); continue
            slug, name = [p.strip() for p in line.split("|", 1)]
            slug = slug.lower().replace(" ", "_")
            badges.append((slug, name))
    return badges


def make_png(path, rgb, size=16):
    r, g, b = rgb
    raw = bytearray()
    for y in range(size):
        raw.append(0)
        for x in range(size):
            border = x == 0 or y == 0 or x == size-1 or y == size-1
            raw += bytes((30,30,30,255)) if border else bytes((r,g,b,255))
    def chunk(typ, data):
        c = typ + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xffffffff)
    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n"
                + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
                + chunk(b"IDAT", zlib.compress(bytes(raw)))
                + chunk(b"IEND", b""))


def main():
    badges = parse_badges()
    if not badges:
        print("Aucun badge dans badges.txt."); return
    os.makedirs(TEX_DIR, exist_ok=True)
    os.makedirs(MODEL_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(PAPER_JSON), exist_ok=True)

    overrides = []
    readme = ["Steamon Gym Badges — items = minecraft:paper + custom_model_data.", "",
              "Donne un badge (1.21.1) :", ""]
    seen = set()
    for i, (slug, name) in enumerate(badges):
        if slug in seen:
            print(f"  DOUBLON ignore : {slug}"); continue
        seen.add(slug)
        cmd = CMD_START + i

        # model
        with io.open(os.path.join(MODEL_DIR, f"badge_{slug}.json"), "w", encoding="utf-8") as f:
            json.dump({"parent": "minecraft:item/generated",
                       "textures": {"layer0": f"{NS}:item/badge_{slug}"}}, f, indent=2)

        # texture placeholder seulement si absente (on n'ecrase jamais ton art)
        tex = os.path.join(TEX_DIR, f"badge_{slug}.png")
        if not os.path.exists(tex):
            make_png(tex, PALETTE[i % len(PALETTE)])
            tag = "(placeholder cree)"
        else:
            tag = "(texture existante gardee)"

        overrides.append({"predicate": {"custom_model_data": cmd},
                          "model": f"{NS}:item/badge_{slug}"})
        give = (f"/give @p minecraft:paper[custom_model_data={cmd},"
                f"custom_name='{{\"text\":\"{name}\"}}']")
        readme.append(f"{cmd}  {name}  (badge_{slug}.png)")
        readme.append(f"     {give}")
        print(f"  OK  {cmd}  badge_{slug}  {tag}")

    # paper.json avec tous les overpaths
    with io.open(PAPER_JSON, "w", encoding="utf-8") as f:
        json.dump({"parent": "minecraft:item/generated",
                   "textures": {"layer0": "minecraft:item/paper"},
                   "overrides": overrides}, f, indent=2)

    readme += ["", "Pour AJOUTER un badge : ajoute une ligne dans badges.txt (slug | Nom),",
               "relance ce script, puis dessine assets/steamon/textures/item/badge_<slug>.png (16x16).",
               "Recharge en jeu avec F3+T."]
    with io.open(README, "w", encoding="utf-8") as f:
        f.write("\n".join(readme) + "\n")

    print(f"\nTermine : {len(seen)} badge(s). paper.json + models + README regeneres.")
    print("Recharge en jeu avec F3+T (ou relance l'instance).")


if __name__ == "__main__":
    main()

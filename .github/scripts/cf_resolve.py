#!/usr/bin/env python3
"""Resolve Modrinth-sourced packwiz mods to CurseForge references.

For each mods/*.pw.toml that lacks an [update.curseforge] block, search the
CurseForge Core API by the mod's display name, find a 1.21.1 + NeoForge file,
and rewrite the .pw.toml in packwiz's curseforge format (mode=metadata:curseforge)
so the export references it in manifest.json instead of embedding the jar.

Requires env CF_CORE_KEY. Usage: cf_resolve.py <mods_dir>
"""
import os
import re
import sys
import json
import time
import pathlib
import urllib.parse
import urllib.request

API = "https://api.curseforge.com"
KEY = os.environ["CF_CORE_KEY"]
GAME_ID = 432              # Minecraft
CLASS_MODS = 6             # Mc-Mods
CLASS_RESOURCEPACKS = 12   # Resource Packs
TARGET_MC = "1.21.1"
# CF modLoaderType: 1=Forge 4=Fabric 6=NeoForge 5=Quilt
NEOFORGE = 6

# Mods whose Modrinth slug differs from the CF slug — map to the CF project id
# directly (name/slug search alone can't find them or returns wrong projects).
PROJECT_OVERRIDES = {
    "chefs-delight": 832983,                                   # chefs-delight-forge
    "xaeros-minimap-world-map-waystones-compatibility-forge": 887484,
    "c2me-neoforge": 533097,                                   # CF slug is "c2me"
}

# Mods where the pack's exact jar version is absent from CF, but the mod has a
# redistribution-restricted license and therefore MUST be a CF reference. For
# these we accept the newest compatible CF file instead of an exact filename
# match (a patch-level version drift is acceptable here).
ALLOW_NEWEST = {
    "balm",           # ARR — redistribution forbidden; CF may lack the exact jar version
    "gravestone-mod", # ARR — redistribution forbidden (slug: gravestone-mod on CF)
    "glitchcore",     # ARR — redistribution forbidden
    "default-options", # ARR — redistribution forbidden
    "terrablender",   # ARR — redistribution forbidden; CF must reference, not embed
}


def api_get(path, params=None):
    url = API + path
    if params:
        url += "?" + urllib.parse.urlencode(params, doseq=True)
    req = urllib.request.Request(url, headers={
        "x-api-key": KEY,
        "Accept": "application/json",
        "User-Agent": "github.com/Gaspard4i/steamon-modpack",
    })
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(2 * (attempt + 1))
                continue
            return None
        except Exception:
            time.sleep(1)
    return None


def parse_pw(text):
    name = re.search(r'^name\s*=\s*"(.*)"', text, re.M)
    fn = re.search(r'^filename\s*=\s*"(.*)"', text, re.M)
    side = re.search(r'^side\s*=\s*"(.*)"', text, re.M)
    return (
        name.group(1) if name else None,
        fn.group(1) if fn else None,
        side.group(1) if side else "both",
    )


def file_is_compatible(f, require_loader=True):
    """Usable if gameVersions include 1.21.1 (and NeoForge for mods).

    Resource packs carry no loader tag, so require_loader=False there.
    """
    gvs = f.get("gameVersions", [])
    if TARGET_MC not in gvs:
        return False
    if not require_loader:
        return True
    return any(g.lower() == "neoforge" for g in gvs)


def best_file(files, wanted_filename, allow_newest=False, require_loader=True):
    """Pick the CF file whose fileName EXACTLY matches the pack's jar.

    Name-based search returns false positives (e.g. "In Control" -> ToastControl),
    so we only trust an exact filename match. No match -> caller reports a MISS
    for manual handling, which is far safer than silently shipping a wrong/older
    file. allow_newest relaxes this to the newest compatible file (curated set,
    plus resource packs whose archive name commonly drifts from the CF fileName).
    """
    if wanted_filename:
        for f in files:
            if f.get("fileName") == wanted_filename:
                return f
    if allow_newest:
        compat = [f for f in files if file_is_compatible(f, require_loader)]
        compat.sort(key=lambda f: f.get("fileDate", ""), reverse=True)
        if compat:
            return compat[0]
    return None


def sha1_of(f):
    for h in f.get("hashes", []):
        if h.get("algo") == 1:   # 1 = sha1
            return h.get("value")
    return None


def candidate_ids(slug, name, class_id):
    """Yield CF project IDs to try, most-precise first.

    The packwiz filename (slug) usually equals the CF slug, so an exact slug
    lookup is the reliable path. Name search is a noisy fallback.
    """
    seen = set()
    # 0) hardcoded override for slugs that differ between Modrinth and CF
    if slug in PROJECT_OVERRIDES:
        pid = PROJECT_OVERRIDES[slug]
        seen.add(pid); yield pid
    # 1) exact slug match (Modrinth slug == CF slug in the common case)
    if slug:
        d = api_get("/v1/mods/search", {
            "gameId": GAME_ID, "classId": class_id, "slug": slug, "pageSize": 5,
        })
        for m in (d or {}).get("data", []):
            if m["id"] not in seen:
                seen.add(m["id"]); yield m["id"]
    # 2) name search fallback
    if name:
        d = api_get("/v1/mods/search", {
            "gameId": GAME_ID, "classId": class_id, "gameVersion": TARGET_MC,
            "searchFilter": name, "pageSize": 10, "sortField": 6, "sortOrder": "desc",
        })
        for m in (d or {}).get("data", []):
            if m["id"] not in seen:
                seen.add(m["id"]); yield m["id"]


def resolve_mod(slug, name, filename, class_id=CLASS_MODS):
    """Return (project_id, file_id, file_name, sha1) or None.

    Only accepts a file whose fileName exactly matches the pack's jar, except
    for the curated ALLOW_NEWEST set and resource packs (whose archive name
    often differs from the CF fileName) where the newest compatible file is taken.
    """
    is_rp = class_id == CLASS_RESOURCEPACKS
    allow_newest = slug in ALLOW_NEWEST or is_rp
    require_loader = not is_rp
    for pid in candidate_ids(slug, name, class_id):
        params = {"gameVersion": TARGET_MC, "pageSize": 50}
        if not is_rp:
            params["modLoaderType"] = NEOFORGE
        files_resp = api_get(f"/v1/mods/{pid}/files", params)
        if not files_resp:
            continue
        f = best_file(files_resp.get("data", []), filename, allow_newest, require_loader)
        if f:
            return pid, f["id"], f["fileName"], sha1_of(f)
    return None


PW_TEMPLATE = '''name = "{name}"
filename = "{filename}"
side = "{side}"

[download]
hash-format = "sha1"
hash = "{sha1}"
mode = "metadata:curseforge"

[update]
[update.curseforge]
file-id = {file_id}
project-id = {project_id}
'''


def resolve_dir(directory, class_id, resolved, failed):
    if not directory.is_dir():
        return
    for pw in sorted(directory.glob("*.pw.toml")):
        text = pw.read_text(encoding="utf-8")
        if "[update.curseforge]" in text:
            continue
        name, filename, side = parse_pw(text)
        slug = pw.name[:-len(".pw.toml")]   # Modrinth slug == filename stem
        if not name:
            failed.append((pw.name, "no name"))
            continue
        r = resolve_mod(slug, name, filename, class_id)
        if not r or not r[3]:
            failed.append((pw.name, f"no CF match for '{name}'"))
            print(f"MISS {pw.name}: {name}")
            continue
        pid, fid, fname, sha1 = r
        pw.write_text(PW_TEMPLATE.format(
            name=name, filename=fname, side=side,
            sha1=sha1, file_id=fid, project_id=pid,
        ), encoding="utf-8")
        resolved.append(pw.name)
        print(f"OK   {pw.name}: project {pid} file {fid} ({fname})")
        time.sleep(0.15)


def main():
    # arg can be a mods dir (legacy) or a pack root containing mods/ + resourcepacks/
    root = pathlib.Path(sys.argv[1])
    resolved, failed = [], []
    if root.name == "mods":
        resolve_dir(root, CLASS_MODS, resolved, failed)
        resolve_dir(root.parent / "resourcepacks", CLASS_RESOURCEPACKS, resolved, failed)
    else:
        resolve_dir(root / "mods", CLASS_MODS, resolved, failed)
        resolve_dir(root / "resourcepacks", CLASS_RESOURCEPACKS, resolved, failed)

    print(f"\nResolved {len(resolved)} / {len(resolved)+len(failed)} leftovers")
    if failed:
        print("Still unresolved (left in overrides — fine if Modrinth-only):")
        for n, why in failed:
            print(f"  - {n}: {why}")


if __name__ == "__main__":
    main()

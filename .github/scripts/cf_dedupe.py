#!/usr/bin/env python3
"""Remove duplicate CurseForge references from a packwiz mods dir.

`packwiz curseforge detect` creates a new .pw.toml named after the CF slug even
when the mod is already present under its Modrinth slug. Two .pw.toml then carry
the same CF file-id, and CurseForge rejects the manifest ("File ID ... appears
more than once"). This dedupes by file-id, keeping one .pw.toml per CF file.

Keep heuristic: prefer the .pw.toml whose stem matches the jar's base name
(the "real" entry), else the shortest stem, else lexicographically first — and
delete the rest. Usage: cf_dedupe.py <mods_dir> [<mods_dir> ...]
"""
import re
import sys
import pathlib
import collections


def file_id(text):
    m = re.search(r'^file-id\s*=\s*(\d+)', text, re.M)
    return int(m.group(1)) if m else None


def filename(text):
    m = re.search(r'^filename\s*=\s*"(.*)"', text, re.M)
    return m.group(1) if m else ""


def score(pw, fname):
    """Lower is better — the entry we keep."""
    stem = pw.name[:-len(".pw.toml")]
    jar_base = re.sub(r'[-_ ].*$', '', fname).lower()
    exact = 0 if jar_base and stem.lower().startswith(jar_base[:4]) else 1
    return (exact, len(stem), stem)


def main():
    by_id = collections.defaultdict(list)
    for d in sys.argv[1:]:
        for pw in pathlib.Path(d).glob("*.pw.toml"):
            text = pw.read_text(encoding="utf-8")
            fid = file_id(text)
            if fid is not None:
                by_id[fid].append((pw, filename(text)))

    removed = 0
    for fid, entries in by_id.items():
        if len(entries) < 2:
            continue
        entries.sort(key=lambda e: score(e[0], e[1]))
        keep = entries[0][0]
        for pw, _ in entries[1:]:
            pw.unlink()
            removed += 1
            print(f"dedupe fileID {fid}: kept {keep.name}, removed {pw.name}")
    print(f"\nRemoved {removed} duplicate .pw.toml")


if __name__ == "__main__":
    main()

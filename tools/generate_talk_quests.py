#!/usr/bin/env python3
"""Generates the Talk-only story quests (checkmark, no trainer fight) from
the shared encounters workbook, one per series chapter.

Talk rows (Type == "Talk") live in the Fights tab of
steamon-shared/shared-data/steamos-story-encounters.xlsx, alongside the
Battle rows that tools/generate_team_quests.py already turns into
defeat-advancement quests. This script only touches Talk rows and keeps
entirely separate id/marker namespaces from that script so the two can
run against the same chapter files without colliding.

Chained by beat within a series ("1.1" < "1.2" < ... < "5.6"), using a
natural sort so "L10" sorts after "L9" rather than after "L1". The "H"
beat (Hub, a permanent presence at spawn) is NOT chained: it only
depends on the chapter gate, since the workbook describes it as always
available rather than a one-time story beat.

Usage: python3 tools/generate_talk_quests.py <path to encounters.xlsx>
Writes into server/config/ftbquests/quests/chapters/team_{spark,might,relic}.snbt
(a separate AUTO-GENERATED TALK QUESTS block, never the gate quest or the
combat quest block) and appends matching keys to
server/config/ftbquests/quests/lang/en_us.snbt.
"""
import hashlib
import re
import sys
from pathlib import Path

try:
    import openpyxl
except ImportError:
    print("Requires openpyxl: pip install openpyxl")
    raise

REPO_ROOT = Path(__file__).resolve().parent.parent
CHAPTERS_DIR = REPO_ROOT / "server" / "config" / "ftbquests" / "quests" / "chapters"
LANG_FILE = REPO_ROOT / "server" / "config" / "ftbquests" / "quests" / "lang" / "en_us.snbt"

VERSION_TO_CHAPTER_FILE = {
    "Spark": CHAPTERS_DIR / "team_spark.snbt",
    "Might": CHAPTERS_DIR / "team_might.snbt",
    "Relic": CHAPTERS_DIR / "team_relic.snbt",
}

GATE_QUEST_ID = {
    "Spark": "1111111111111101",
    "Might": "1111111111111102",
    "Relic": "1111111111111103",
}

AUTO_BLOCK_START = "\t\t// AUTO-GENERATED talk quests, see tools/generate_talk_quests.py"
AUTO_BLOCK_END = "\t\t// END AUTO-GENERATED talk quests"

LANG_AUTO_START = "\t// AUTO-GENERATED talk quest lang keys, see tools/generate_talk_quests.py"
LANG_AUTO_END = "\t// END AUTO-GENERATED talk quest lang keys"

# A handful of names in the workbook were saved with mangled accented
# characters (literal "?" where an accent should be, e.g. "Am?lie").
# Fix the ones we have actually seen; anything else surfaces as a
# visible "?" rather than being silently guessed.
NAME_FIXES = {
    "Am?lie": "Amelie",
    "Pok?mon": "Pokemon",
    "Pok?dex": "Pokedex",
}


def fix_mangled_text(text: str) -> str:
    for bad, good in NAME_FIXES.items():
        text = text.replace(bad, good)
    return text


def natural_beat_key(beat: str):
    """P0 first, then numeric beats in order, H (Hub) and L-beats (League)
    sorted naturally (L2 < L10), H placed after the numbered chapters."""
    if beat == "P0":
        return (0, 0, 0)
    if beat == "H":
        return (1, 0, 0)
    if beat.startswith("L"):
        return (3, int(beat[1:]), 0)
    major, _, minor = beat.partition(".")
    return (2, int(major), int(minor) if minor else 0)


def quest_id_for(series: str, beat: str, npc: str) -> str:
    digest = hashlib.sha1(f"talk:{series}:{beat}:{npc}".encode()).hexdigest()
    return digest[:16].upper()


def task_id_for(series: str, beat: str, npc: str) -> str:
    digest = hashlib.sha1(f"talktask:{series}:{beat}:{npc}".encode()).hexdigest()
    return digest[:16].upper()


def load_talk_rows(xlsx_path: str) -> dict:
    wb = openpyxl.load_workbook(xlsx_path, data_only=True)
    ws = wb["Fights"]
    rows = list(ws.iter_rows(min_row=2, values_only=True))
    by_series: dict[str, list[dict]] = {"Spark": [], "Might": [], "Relic": []}

    for beat, chapter, moment, version, npc, kind, _team_no, note in rows:
        if kind != "Talk":
            continue
        if version not in by_series:
            continue
        by_series[version].append(
            {
                "beat": beat,
                "chapter": fix_mangled_text(chapter or ""),
                "moment": fix_mangled_text(moment or ""),
                "npc": fix_mangled_text(npc or ""),
                "note": fix_mangled_text(note or ""),
            }
        )

    for version, rows in by_series.items():
        rows.sort(key=lambda r: natural_beat_key(r["beat"]))

    return by_series


def format_quest(row: dict, series: str, gate_id: str, previous_id: str | None) -> tuple[str, str, str, str]:
    qid = quest_id_for(series, row["beat"], row["npc"])
    tid = task_id_for(series, row["beat"], row["npc"])
    deps = [gate_id]

    if row["beat"] != "H" and previous_id:
        deps.append(previous_id)

    deps_str = ", ".join(f'"{d}"' for d in deps)
    quest_snbt = (
        "\t\t{\n"
        f'\t\t\tid: "{qid}"\n'
        f"\t\t\tdependencies: [{deps_str}]\n"
        "\t\t\tx: 0.0d\n"
        "\t\t\ty: 0.0d\n"
        "\t\t\ttasks: [\n"
        "\t\t\t\t{\n"
        f'\t\t\t\t\tid: "{tid}"\n'
        '\t\t\t\t\ttype: "checkmark"\n'
        "\t\t\t\t}\n"
        "\t\t\t]\n"
        "\t\t\trewards: [ ]\n"
        "\t\t}"
    )

    title = f'Talk to {row["npc"]}'
    description = row["note"] or row["moment"] or f'A conversation during {row["chapter"]}.'
    lang_snbt = (
        f'\tquest.{qid}.title: "{escape_snbt(title)}"\n'
        f'\tquest.{qid}.description: [ "{escape_snbt(description)}" ]'
    )

    return quest_snbt, lang_snbt, qid, tid


def escape_snbt(text: str) -> str:
    return text.replace("\\", "\\\\").replace('"', '\\"')


def replace_block(text: str, start_marker: str, end_marker: str, body: str, insert_after: str) -> str:
    pattern = re.compile(re.escape(start_marker) + r".*?" + re.escape(end_marker), re.DOTALL)
    block = f"{start_marker}\n{body}\n{end_marker.rsplit(chr(9), 0)[0] if False else ''}{end_marker}"
    # keep a leading tab/indent consistent with the rest of the file
    block = f"{start_marker}\n{body}\n\t\t{end_marker.lstrip(chr(9))}" if start_marker.startswith("\t\t") else f"{start_marker}\n{body}\n\t{end_marker.lstrip(chr(9))}"

    if pattern.search(text):
        return pattern.sub(block, text)

    return text.replace(insert_after, insert_after + block + "\n", 1)


def main(xlsx_path: str) -> None:
    by_series = load_talk_rows(xlsx_path)

    for version, chapter_path in VERSION_TO_CHAPTER_FILE.items():
        rows = by_series[version]
        gate_id = GATE_QUEST_ID[version]
        quest_blocks = []
        lang_blocks = []
        previous_id: str | None = None

        for row in rows:
            quest_snbt, lang_snbt, qid, _tid = format_quest(row, version, gate_id, previous_id)
            quest_blocks.append(quest_snbt)
            lang_blocks.append(lang_snbt)
            if row["beat"] != "H":
                previous_id = qid

        chapter_text = chapter_path.read_text(encoding="utf-8")
        chapter_text = replace_block(
            chapter_text,
            AUTO_BLOCK_START,
            AUTO_BLOCK_END,
            ",\n".join(quest_blocks),
            "\tquests: [\n",
        )
        chapter_path.write_text(chapter_text, encoding="utf-8")

        lang_text = LANG_FILE.read_text(encoding="utf-8")
        series_lang_start = f"{LANG_AUTO_START} ({version})"
        series_lang_end = f"{LANG_AUTO_END} ({version})"
        lang_text = replace_block(
            lang_text,
            series_lang_start,
            series_lang_end,
            "\n".join(lang_blocks),
            "{\n",
        )
        LANG_FILE.write_text(lang_text, encoding="utf-8")

        print(f"{version}: wrote {len(rows)} talk quests into {chapter_path}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)
    main(sys.argv[1])

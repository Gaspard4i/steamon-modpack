#!/usr/bin/env python3
"""Regenerates the per-beat trainer quests in server/config/ftbquests/quests/chapters/.

Reads trainer-ids.json (format documented in steamon-shared/PROTOCOL.md)
and writes one checkmark quest per trainer with an advancement task on
rctmod:trainers/defeat_<id>, dependent on the chapter's gate quest and
on each trainer's own requires chain. Run again whenever trainer-ids.json
changes; existing quest ids are kept stable by deriving them from the
trainer id so re-running does not create duplicates or new ids.

Usage: python3 tools/generate_team_quests.py <path to trainer-ids.json>
Writes into server/config/ftbquests/quests/chapters/team_{spark,might,relic}.snbt,
replacing only the auto-generated quests block, never the gate quest.
"""
import hashlib
import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
CHAPTERS_DIR = REPO_ROOT / "server" / "config" / "ftbquests" / "quests" / "chapters"
LANG_FILE = REPO_ROOT / "server" / "config" / "ftbquests" / "quests" / "lang" / "en_us.snbt"

SERIES_TO_CHAPTER_FILE = {
    "steamos_spark": CHAPTERS_DIR / "team_spark.snbt",
    "steamos_might": CHAPTERS_DIR / "team_might.snbt",
    "steamos_relic": CHAPTERS_DIR / "team_relic.snbt",
}

GATE_QUEST_ID = {
    "steamos_spark": "1111111111111101",
    "steamos_might": "1111111111111102",
    "steamos_relic": "1111111111111103",
}

AUTO_BLOCK_START = "\t\t// AUTO-GENERATED trainer quests, see tools/generate_team_quests.py"
AUTO_BLOCK_END = "\t\t// END AUTO-GENERATED trainer quests"


def quest_id_for(trainer_id: str) -> str:
    """Stable 16 hex char id derived from the trainer id, so reruns never change it."""
    digest = hashlib.sha1(("quest:" + trainer_id).encode()).hexdigest()
    return digest[:16].upper()


def task_id_for(trainer_id: str) -> str:
    digest = hashlib.sha1(("task:" + trainer_id).encode()).hexdigest()
    return digest[:16].upper()


def format_quest(trainer: dict, gate_id: str) -> str:
    qid = quest_id_for(trainer["id"])
    tid = task_id_for(trainer["id"])
    deps = [gate_id] + [
        quest_id_for(req) for group in trainer["requires"] for req in group
    ]
    # First dependency group (AND of ORs) is flattened to AND for now;
    # FTB Quests dependencies are a flat AND list, OR groups in
    # trainer-ids.json need a loot_crate/choice quest if ever used for
    # real branching. None of the 184 entries use more than one OR
    # option per group as of 2026-11-19, so flattening is safe today.
    deps_str = ", ".join(f'"{d}"' for d in deps)
    return (
        "\t\t{\n"
        f'\t\t\tid: "{qid}"\n'
        f"\t\t\tdependencies: [{deps_str}]\n"
        "\t\t\tx: 0.0d\n"
        "\t\t\ty: 0.0d\n"
        "\t\t\ttasks: [\n"
        "\t\t\t\t{\n"
        f'\t\t\t\t\tid: "{tid}"\n'
        '\t\t\t\t\ttype: "advancement"\n'
        f'\t\t\t\t\tadvancement: "rctmod:trainers/defeat_{trainer["id"]}"\n'
        "\t\t\t\t}\n"
        "\t\t\t]\n"
        "\t\t\trewards: [ ]\n"
        "\t\t}"
    )


def replace_auto_block(chapter_text: str, generated_quests: str) -> str:
    pattern = re.compile(
        re.escape(AUTO_BLOCK_START) + r".*?" + re.escape(AUTO_BLOCK_END),
        re.DOTALL,
    )
    block = f"{AUTO_BLOCK_START}\n{generated_quests}\n\t\t{AUTO_BLOCK_END}"

    if pattern.search(chapter_text):
        return pattern.sub(block, chapter_text)

    # No auto block yet: insert right after the quests: [ opening bracket,
    # before the existing (hand written) gate quest entry. FTB Quests'
    # SNBT list syntax has no trailing comma requirement between entries
    # on separate lines, so a plain newline separator is enough.
    return chapter_text.replace("\tquests: [\n", "\tquests: [\n" + block + "\n", 1)


def main(trainer_ids_path: str) -> None:
    data = json.loads(Path(trainer_ids_path).read_text(encoding="utf-8"))
    by_series: dict[str, list[dict]] = {}

    for trainer in data["trainers"]:
        by_series.setdefault(trainer["series"], []).append(trainer)

    for series, chapter_path in SERIES_TO_CHAPTER_FILE.items():
        trainers = by_series.get(series, [])
        gate_id = GATE_QUEST_ID[series]
        quests_snbt = ",\n".join(format_quest(t, gate_id) for t in trainers)
        chapter_text = chapter_path.read_text(encoding="utf-8")
        chapter_path.write_text(
            replace_auto_block(chapter_text, quests_snbt), encoding="utf-8"
        )
        print(f"{series}: wrote {len(trainers)} quests into {chapter_path}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)
    main(sys.argv[1])

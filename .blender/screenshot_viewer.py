"""Headless screenshots of the Vite ball-viewer to show what the pose
editor actually looks like end-to-end.

Outputs:
  .blender/output/viewer_golett.png   — Golett selected, head bone gizmo
  .blender/output/viewer_appletun.png — Appletun selected, body bone gizmo
  .blender/output/viewer_flapple.png  — Flapple shiny + head bone gizmo
"""

import os
from pathlib import Path
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
OUT = HERE / "output"
OUT.mkdir(exist_ok=True)

URL = "http://localhost:5180/"

CASES = [
    {
        "filename": "viewer_golett.png",
        "subject_label": "Golett",
        "shiny": False,
        "bone_to_pick": "head",
    },
    {
        "filename": "viewer_appletun.png",
        "subject_label": "Appletun",
        "shiny": False,
        "bone_to_pick": "body",
    },
    {
        "filename": "viewer_flapple.png",
        "subject_label": "Flapple",
        "shiny": True,
        "bone_to_pick": "head",
    },
]


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--disable-web-security", "--use-gl=angle", "--enable-webgl"],
        )
        context = browser.new_context(
            viewport={"width": 1600, "height": 900},
            device_scale_factor=1,
        )
        page = context.new_page()
        page.on("console", lambda msg: print(f"  [console] {msg.text[:200]}"))
        page.on("pageerror", lambda err: print(f"  [PAGEERROR] {err}"))

        page.goto(URL)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(2500)

        for case in CASES:
            print(f"\n=== {case['filename']}")
            # Click the subject button in the left sidebar
            try:
                page.get_by_role("button", name=case["subject_label"]).click()
            except Exception as e:
                print(f"  subject click failed: {e}")
                continue
            page.wait_for_timeout(1500)

            # Toggle shiny if needed
            if case["shiny"]:
                try:
                    # Right panel has a "Shiny" checkbox label
                    page.get_by_text("Shiny", exact=True).click()
                    page.wait_for_timeout(400)
                except Exception as e:
                    print(f"  shiny toggle failed: {e}")

            # Click a bone in the right "Bone list" panel
            try:
                page.get_by_role("button", name=case["bone_to_pick"], exact=True).click()
                page.wait_for_timeout(800)
            except Exception as e:
                print(f"  bone pick failed: {e}")

            # Screenshot
            out_path = OUT / case["filename"]
            page.screenshot(path=str(out_path), full_page=False)
            print(f"  -> {out_path}  ({out_path.stat().st_size} bytes)")

        browser.close()


if __name__ == "__main__":
    run()

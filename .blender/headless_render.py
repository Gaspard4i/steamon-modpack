"""
Headless 3D renderer using Playwright + Chromium.

Spins up a local HTTP server over .blender/, then opens each renderer HTML
with the right query params and screenshots the canvas to PNGs.

Outputs in .blender/output/:
  - pokeball_3d.png
  - cog_3d.png
  - avatar_pose.png
"""

import http.server
import socketserver
import threading
import time
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
OUT = HERE / "output"
OUT.mkdir(exist_ok=True)

PORT = 8765


def start_server():
    handler = http.server.SimpleHTTPRequestHandler
    # serve from project root so URLs like .blender/assets/... work
    import os
    os.chdir(ROOT)
    httpd = socketserver.TCPServer(("127.0.0.1", PORT), handler)
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    return httpd


def screenshot(page, url, output_path, wait_render=True):
    page.goto(url)
    if wait_render:
        page.wait_for_function("window.__rendered === true", timeout=15000)
    # Slight extra delay to ensure the GPU produced the frame
    page.wait_for_timeout(300)
    canvas = page.locator("canvas").first
    canvas.screenshot(path=str(output_path), omit_background=True)
    print(f"  -> {output_path}  ({output_path.stat().st_size} bytes)")


def main():
    httpd = start_server()
    base = f"http://127.0.0.1:{PORT}"
    print(f"Server up on {base}")

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--disable-web-security", "--enable-webgl", "--use-gl=angle"],
        )
        context = browser.new_context(
            viewport={"width": 1024, "height": 1024},
            device_scale_factor=1,
        )
        page = context.new_page()
        page.on("console", lambda msg: print(f"  [console] {msg.text}"))
        page.on("pageerror", lambda err: print(f"  [PAGEERROR] {err}"))

        # 1) Pokeball
        print("Rendering Pokeball...")
        ball_url = (f"{base}/.blender/render_bedrock.html"
                    f"?model=/.blender/assets/poke_ball.geo.json"
                    f"&texture=/.blender/assets/poke_ball_3d.png"
                    f"&w=64&h=32&rotX=18&rotY=30&zoom=0.85")
        screenshot(page, ball_url, OUT / "pokeball_3d.png")

        # 2) Cog Create — Java model
        print("Rendering Cog Create...")
        tex_map = {
            "cogwheel_axis": "/.blender/assets/create/cogwheel_axis.png",
            "axis_top": "/.blender/assets/create/axis_top.png",
            "cogwheel": "/.blender/assets/create/cogwheel.png",
            "large_cogwheel": "/.blender/assets/create/large_cogwheel.png",
            "stripped_spruce_log": "/.blender/assets/create/stripped_spruce_log.png",
        }
        import urllib.parse
        cog_url = (f"{base}/.blender/render_java.html"
                   f"?model=/.blender/assets/create/large_cogwheel.json"
                   f"&textures={urllib.parse.quote(json.dumps(tex_map))}"
                   f"&texW=32&texH=32&rotX=30&rotY=45&zoom=1.3")
        screenshot(page, cog_url, OUT / "cog_3d.png")

        # 3) Avatar
        print("Rendering Avatar (leaning pose)...")
        page.goto(f"{base}/.blender/pose_avatar.html")
        page.wait_for_load_state("networkidle")
        # Wait for skinview3d to create the canvas
        page.wait_for_selector("#canvas-container canvas", timeout=15000)
        page.wait_for_timeout(2500)
        page.click("#pose-leaning")
        page.wait_for_timeout(800)
        canvas = page.locator("#canvas-container canvas").first
        canvas.screenshot(path=str(OUT / "avatar_pose.png"), omit_background=True)
        print(f"  -> {OUT / 'avatar_pose.png'}  ({(OUT / 'avatar_pose.png').stat().st_size} bytes)")

        browser.close()

    httpd.shutdown()
    print("Done.")


if __name__ == "__main__":
    main()

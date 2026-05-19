"""
Compose the final Steamon banner (900x300) and logo (512x512) from three
transparent-background 3D renders: Pokéball (Cobblemon), Cog (Create) and
the avatar pose.

Expected input files in .blender/output/:
  - pokeball_3d.png   (transparent, from Blockbench)
  - cog_3d.png        (transparent, from Blockbench)
  - avatar_pose.png   (transparent, from pose_avatar.html)

Output:
  - banner.png       (900x300)
  - logo_512.png     (512x512)

Run:
  python .blender/build_compose.py
"""

from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import math

HERE = Path(__file__).resolve().parent
OUT = HERE / "output"

POKEBALL_PATH = OUT / "pokeball_3d.png"
COG_PATH      = OUT / "cog_3d.png"
AVATAR_PATH   = OUT / "avatar_pose.png"

# Forest-green Steamon palette
FOREST_DARK = (35, 60, 38, 255)
FOREST = (60, 95, 60, 255)
FOREST_BRIGHT = (75, 115, 70, 255)
GOLD = (220, 170, 70, 255)
GOLD_LIGHT = (245, 215, 130, 255)
CREAM = (250, 240, 215, 255)


def cozy_background(w, h):
    img = Image.new("RGBA", (w, h), FOREST)
    d = ImageDraw.Draw(img)
    for y in range(h):
        t = y / h
        r = int(FOREST_DARK[0] * (1 - t) + FOREST_BRIGHT[0] * t)
        g = int(FOREST_DARK[1] * (1 - t) + FOREST_BRIGHT[1] * t)
        b = int(FOREST_DARK[2] * (1 - t) + FOREST_BRIGHT[2] * t)
        d.line([(0, y), (w, y)], fill=(r, g, b, 255))
    for x in range(0, w, 6):
        for yy in range(0, h, 6):
            d.point((x, yy), fill=(255, 255, 255, 10))
    return img


def fit_height(img, target_h):
    """Resize keeping aspect ratio."""
    ratio = target_h / img.height
    return img.resize((int(img.width * ratio), target_h), Image.LANCZOS)


def fit_width(img, target_w):
    ratio = target_w / img.width
    return img.resize((target_w, int(img.height * ratio)), Image.LANCZOS)


def make_banner(out_path):
    W, H = 1800, 600
    bg = cozy_background(W, H)

    # --- Cog (very back, large, behind everything; cropped tightly)
    if COG_PATH.exists():
        cog = Image.open(COG_PATH).convert("RGBA")
        cog = cog.crop(cog.getbbox())
        cog = fit_height(cog, int(H * 1.0))
        cog = cog.rotate(-8, expand=True, resample=Image.BICUBIC)
        # Slightly fade so it reads as background scenery
        alpha = cog.split()[3].point(lambda p: int(p * 0.85))
        cog.putalpha(alpha)
        bg.alpha_composite(cog, (int(W * 0.06), int(H * 0.05)))

    # --- Pokeball (middle layer, smaller than cog so cog teeth show around it)
    if POKEBALL_PATH.exists():
        ball = Image.open(POKEBALL_PATH).convert("RGBA")
        ball = ball.crop(ball.getbbox())
        ball = fit_height(ball, int(H * 0.55))
        bx = int(W * 0.10)
        by = int(H * 0.30)
        bg.alpha_composite(ball, (bx, by))

    # --- Avatar leaning against the ball, foreground (smaller so it doesn't dominate)
    if AVATAR_PATH.exists():
        av = Image.open(AVATAR_PATH).convert("RGBA")
        av = av.crop(av.getbbox())
        av = fit_height(av, int(H * 0.85))
        ax = int(W * 0.21)
        ay = H - av.height + 8
        bg.alpha_composite(av, (ax, ay))

    # --- Title
    try:
        title_font = ImageFont.truetype("C:/Windows/Fonts/impact.ttf", 230)
        sub_font = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 56)
        tag_font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 38)
    except IOError:
        title_font = sub_font = tag_font = ImageFont.load_default()

    d = ImageDraw.Draw(bg)
    # Measure the title width to right-align safely within the banner.
    title_bbox = d.textbbox((0, 0), "STEAMON", font=title_font)
    title_w = title_bbox[2] - title_bbox[0]
    # Place title so its right edge sits comfortably inside the banner.
    text_x = W - title_w - int(W * 0.06)
    text_y = 145
    d.text((text_x + 6, text_y + 6), "STEAMON", font=title_font, fill=(0, 0, 0, 200))
    for dx, dy in [(-4, 0), (4, 0), (0, -4), (0, 4),
                   (-3, -3), (3, 3), (-3, 3), (3, -3)]:
        d.text((text_x + dx, text_y + dy), "STEAMON", font=title_font, fill=GOLD)
    d.text((text_x, text_y), "STEAMON", font=title_font, fill=CREAM)
    d.text((text_x + 10, text_y + 248), "Create × Cobblemon",
           font=sub_font, fill=GOLD_LIGHT)
    d.text((text_x + 10, text_y + 320), "Minecraft 1.21.1 — NeoForge",
           font=tag_font, fill=(220, 220, 200, 255))

    final = bg.resize((900, 300), Image.LANCZOS)
    final.save(out_path, "PNG", optimize=True)
    return out_path


def make_logo(out_path, size=512):
    SS = 2
    W = size * SS
    bg = cozy_background(W, W)

    # Cog: very large, fills most of the canvas; behind everything
    if COG_PATH.exists():
        cog = Image.open(COG_PATH).convert("RGBA")
        cog = fit_height(cog, int(W * 1.05))
        cog = cog.rotate(-10, expand=True, resample=Image.BICUBIC)
        alpha = cog.split()[3].point(lambda p: int(p * 0.55))
        cog.putalpha(alpha)
        bg.alpha_composite(cog, ((W - cog.width) // 2, (W - cog.height) // 2))

    # Pokeball: centered, ~55% size — cog teeth visible around the rim
    if POKEBALL_PATH.exists():
        ball = Image.open(POKEBALL_PATH).convert("RGBA")
        ball = fit_height(ball, int(W * 0.55))
        bg.alpha_composite(ball, ((W - ball.width) // 2, (W - ball.height) // 2 - int(W * 0.05)))

    # Avatar: leaning against the ball, foreground, lower-right
    if AVATAR_PATH.exists():
        av = Image.open(AVATAR_PATH).convert("RGBA")
        av = av.crop(av.getbbox())
        av = fit_height(av, int(W * 0.75))
        ax = (W - av.width) // 2 + int(W * 0.08)
        ay = W - av.height + int(W * 0.02)
        bg.alpha_composite(av, (ax, ay))

    final = bg.resize((size, size), Image.LANCZOS)
    final.save(out_path, "PNG", optimize=True)
    return out_path


if __name__ == "__main__":
    missing = [p for p in (POKEBALL_PATH, COG_PATH, AVATAR_PATH) if not p.exists()]
    if missing:
        print("Missing render(s) — fall back will skip those layers:")
        for p in missing:
            print(f"  - {p}")

    banner = make_banner(OUT / "banner.png")
    print(f"Wrote {banner}")
    logo = make_logo(OUT / "logo_512.png", size=512)
    print(f"Wrote {logo}")

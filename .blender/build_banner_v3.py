"""
Compose the Steamon Modrinth banner reproducing the layout from
steamon_v1.png (user sketch):

  +-----------------------------------------------------------+
  |                                                           |
  | [avatar]     [_pokeball at his feet_]                     |
  |                                                           |
  |                     [BIG COG behind]                      |
  |                                              S T E A M O N|
  |                                              ───────×────── (gold)
  |                                              ────────────── (white)
  |                                                           |
  +-----------------------------------------------------------+

Forest green background, rust-brown Create cog as a hero element rotated 90°
behind the foreground, Gaz4i avatar 3D-rendered with his right hand naturally
hanging next to a Pokeball at his feet, "STEAMON" wordmark right-aligned in
cream with a gold + white underline + small "×" centered between the strokes.

Source assets:
  .blender/output/avatar_pose.png     transparent 3D render of Gaz4i (leaning)
  .blender/output/cog_3d.png          transparent 3D render of Create cog
  .blender/output/pokeball_3d.png     transparent 3D render of the Pokeball
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = Path(__file__).resolve().parent
OUT = HERE / "output"

AVATAR = OUT / "avatar_pose.png"
COG    = OUT / "cog_3d.png"
POKE   = OUT / "pokeball_3d.png"

BANNER_W = 1920
BANNER_H = 640

# Color palette pulled from the user's v1 sketch
FOREST_BG   = (108, 138, 84, 255)   # main green
FOREST_DARK = ( 86, 113, 66, 255)
FOREST_LITE = (122, 156, 96, 255)
COG_TINT    = (172,  98,  76, 255)  # rust-brown overlay color on the cog
GOLD        = (228, 196, 115, 255)
GOLD_DARK   = (185, 156,  88, 255)
CREAM       = (244, 232, 196, 255)
WHITE_INK   = (240, 240, 235, 255)
SHADOW      = (  0,   0,   0, 110)


def background(w, h):
    img = Image.new("RGBA", (w, h), FOREST_BG)
    d = ImageDraw.Draw(img)
    # Very subtle vertical gradient (lighter at top)
    for y in range(h):
        t = y / h
        r = int(FOREST_LITE[0] * (1 - t) + FOREST_DARK[0] * t)
        g = int(FOREST_LITE[1] * (1 - t) + FOREST_DARK[1] * t)
        b = int(FOREST_LITE[2] * (1 - t) + FOREST_DARK[2] * t)
        d.line([(0, y), (w, y)], fill=(r, g, b, 255))
    # Soft vignette in the corners
    vignette = Image.new("L", (w, h), 0)
    vd = ImageDraw.Draw(vignette)
    cx, cy = w // 2, h // 2
    max_r = (w**2 + h**2) ** 0.5 / 2
    for r in range(int(max_r), 0, -8):
        a = int(40 * (r / max_r) ** 2.4)
        vd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=255 - a)
    vignette = vignette.filter(ImageFilter.GaussianBlur(40))
    dark = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    dark.putalpha(Image.eval(vignette, lambda v: 255 - v).point(lambda p: int(p * 0.35)))
    img.alpha_composite(dark)
    return img


def fit_height(img, target_h):
    if img.height == 0:
        return img
    ratio = target_h / img.height
    new_w = max(1, int(round(img.width * ratio)))
    return img.resize((new_w, target_h), Image.LANCZOS)


def tint_image(img, color, strength=0.55):
    """Apply a colored multiply on the visible (alpha>0) pixels."""
    r, g, b, a = img.split()
    tint = Image.new("RGB", img.size, color[:3])
    rgb = Image.composite(tint, Image.merge("RGB", (r, g, b)), Image.new("L", img.size, int(255 * strength)))
    return Image.merge("RGBA", (*rgb.split(), a))


def soft_shadow_for(img, blur=12, opacity=0.45, offset=(0, 14)):
    """Make a soft drop shadow from img's alpha channel."""
    alpha = img.split()[3]
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sh.putalpha(alpha.point(lambda p: int(p * opacity)))
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    canvas = Image.new("RGBA", (img.width + abs(offset[0]) * 2, img.height + abs(offset[1]) * 2), (0, 0, 0, 0))
    canvas.alpha_composite(sh, (abs(offset[0]) + offset[0], abs(offset[1]) + offset[1]))
    return canvas


def crop_alpha(img):
    bbox = img.getbbox()
    return img.crop(bbox) if bbox else img


def find_font(candidates, size):
    for name in candidates:
        try:
            return ImageFont.truetype(name, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()


def draw_steamon_wordmark(canvas, anchor_right_x, center_y):
    """Draw STEAMON + gold underline + white underline + small × on the gold line.

    anchor_right_x = the rightmost x the text is allowed to occupy
    center_y       = the vertical center of the whole wordmark block
    """
    title_font = find_font([
        "C:/Windows/Fonts/impact.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
        "Impact",
    ], size=260)
    sub_font = find_font([
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/arial.ttf",
    ], size=44)

    d = ImageDraw.Draw(canvas)

    bbox = d.textbbox((0, 0), "STEAMON", font=title_font)
    title_w = bbox[2] - bbox[0]
    title_h = bbox[3] - bbox[1]

    title_x = anchor_right_x - title_w
    title_y = int(center_y - title_h * 0.78)

    # Drop shadow on the title
    shadow_img = Image.new("RGBA", (title_w + 80, title_h + 80), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow_img)
    sd.text((40, 40), "STEAMON", font=title_font, fill=(0, 0, 0, 180))
    shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(8))
    canvas.alpha_composite(shadow_img, (title_x - 40 + 6, title_y - 40 + 8))

    # Light gold "stroke" by drawing 8 offset copies behind
    for dx, dy in [(-3, 0), (3, 0), (0, -3), (0, 3),
                   (-2, -2), (2, 2), (-2, 2), (2, -2)]:
        d.text((title_x + dx, title_y + dy), "STEAMON", font=title_font, fill=GOLD_DARK)
    # Main fill on top
    d.text((title_x, title_y), "STEAMON", font=title_font, fill=CREAM)

    # Underlines: gold line with × in the middle, white line below
    underline_y = title_y + title_h + 22
    line_left = title_x + 10
    line_right = title_x + title_w - 10

    # Compute where to put the × (centered, with gaps on each side of the line)
    cross_text = "x"
    cb = d.textbbox((0, 0), cross_text, font=sub_font)
    cw = cb[2] - cb[0]
    cx = (line_left + line_right) // 2
    gap = 22
    # Gold line: two segments with a gap for the ×
    line_thickness = 6
    d.line([(line_left, underline_y), (cx - cw // 2 - gap, underline_y)],
           fill=GOLD, width=line_thickness)
    d.line([(cx + cw // 2 + gap, underline_y), (line_right, underline_y)],
           fill=GOLD, width=line_thickness)
    # The × itself
    d.text((cx - cw // 2, underline_y - cb[3] // 2 - 8), cross_text, font=sub_font, fill=GOLD)

    # White line below — full width, no break
    white_y = underline_y + 38
    d.line([(line_left + 30, white_y),
            (line_right - 30, white_y)],
           fill=WHITE_INK, width=4)

    # Subtitle "Create x Cobblemon" centered below the underlines, in cream
    tag_font = find_font([
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/arial.ttf",
    ], size=38)
    tag = "Create x Cobblemon"
    tb = d.textbbox((0, 0), tag, font=tag_font)
    tw = tb[2] - tb[0]
    tx = (line_left + line_right) // 2 - tw // 2
    ty = white_y + 14
    d.text((tx + 2, ty + 2), tag, font=tag_font, fill=(0, 0, 0, 160))
    d.text((tx, ty), tag, font=tag_font, fill=CREAM)


def make_banner(out_path):
    canvas = background(BANNER_W, BANNER_H)

    # ── Cog: huge, sits BEHIND the wordmark on the right half (per sketch v1).
    cog = Image.open(COG).convert("RGBA")
    cog = crop_alpha(cog)
    cog = fit_height(cog, int(BANNER_H * 1.85))  # overflows top & bottom
    cog = tint_image(cog, COG_TINT, strength=0.82)
    cog_shadow = soft_shadow_for(cog, blur=28, opacity=0.45, offset=(0, 24))
    # Place center near (62% W, 52% H), behind the title area
    cog_cx = int(BANNER_W * 0.62)
    cog_cy = int(BANNER_H * 0.50)
    cog_x = cog_cx - cog.width // 2
    cog_y = cog_cy - cog.height // 2
    canvas.alpha_composite(cog_shadow, (cog_x - 24, cog_y - 22))
    canvas.alpha_composite(cog, (cog_x, cog_y))

    # ── Avatar: foreground, left-third, ground-anchored, his right side
    # facing toward the pokeball at his feet.
    av = Image.open(AVATAR).convert("RGBA")
    av = crop_alpha(av)
    av = fit_height(av, int(BANNER_H * 0.95))
    av_shadow = soft_shadow_for(av, blur=22, opacity=0.45, offset=(0, 18))
    av_x = int(BANNER_W * 0.045)
    av_y = BANNER_H - av.height + 8
    canvas.alpha_composite(av_shadow, (av_x - 24, av_y - 18))
    canvas.alpha_composite(av, (av_x, av_y))

    # ── Pokeball: placed exactly under the avatar's right hand so it reads
    # as "he's resting his hand on it" like in the sketch.
    ball = Image.open(POKE).convert("RGBA")
    ball = crop_alpha(ball)
    ball = fit_height(ball, int(BANNER_H * 0.34))
    ball_shadow = soft_shadow_for(ball, blur=14, opacity=0.5, offset=(0, 14))
    # Right hand is roughly at (avatar_x + 0.78 * avatar_width, av_y + 0.62 * h)
    hand_x = av_x + int(av.width * 0.78)
    hand_y = av_y + int(av.height * 0.62)
    ball_x = hand_x - int(ball.width * 0.10)
    ball_y = hand_y - int(ball.height * 0.05)
    # Clamp ball so it stays grounded near the bottom
    ball_y = min(ball_y, BANNER_H - ball.height - 12)
    canvas.alpha_composite(ball_shadow, (ball_x - 18, ball_y - 14))
    canvas.alpha_composite(ball, (ball_x, ball_y))

    # ── Wordmark on the right, sitting on top of the cog
    draw_steamon_wordmark(canvas, anchor_right_x=BANNER_W - 70, center_y=BANNER_H // 2)

    canvas.save(out_path, "PNG", optimize=True)
    return out_path


def make_logo(out_path, size=512):
    """Square logo using the same elements, no wordmark."""
    canvas = background(size, size)

    cog = Image.open(COG).convert("RGBA")
    cog = crop_alpha(cog)
    cog = fit_height(cog, int(size * 1.05))
    cog = tint_image(cog, COG_TINT, strength=0.78)
    cog_shadow = soft_shadow_for(cog, blur=18, opacity=0.45, offset=(0, 16))
    cx = (size - cog.width) // 2
    cy = (size - cog.height) // 2 + int(size * 0.05)
    canvas.alpha_composite(cog_shadow, (cx, cy + 8))
    canvas.alpha_composite(cog, (cx, cy))

    ball = Image.open(POKE).convert("RGBA")
    ball = crop_alpha(ball)
    ball = fit_height(ball, int(size * 0.45))
    bs = soft_shadow_for(ball, blur=10, opacity=0.45, offset=(0, 10))
    bx = (size - ball.width) // 2 + int(size * 0.08)
    by = size - ball.height - int(size * 0.06)
    canvas.alpha_composite(bs, (bx, by + 4))
    canvas.alpha_composite(ball, (bx, by))

    av = Image.open(AVATAR).convert("RGBA")
    av = crop_alpha(av)
    av = fit_height(av, int(size * 0.80))
    avs = soft_shadow_for(av, blur=16, opacity=0.4, offset=(0, 12))
    ax = (size - av.width) // 2 - int(size * 0.12)
    ay = size - av.height + 4
    canvas.alpha_composite(avs, (ax, ay + 4))
    canvas.alpha_composite(av, (ax, ay))

    canvas.save(out_path, "PNG", optimize=True)
    return out_path


if __name__ == "__main__":
    missing = [p for p in (AVATAR, COG, POKE) if not p.exists()]
    if missing:
        print("Missing input renders:")
        for p in missing:
            print(f"  - {p}")
        raise SystemExit(1)

    banner = make_banner(OUT / "banner.png")
    print(f"wrote {banner}")
    logo = make_logo(OUT / "logo_512.png")
    print(f"wrote {logo}")

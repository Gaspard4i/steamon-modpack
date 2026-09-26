"""
Pseudo-3D logo builder using PIL.

Renders:
- A giant Cobblemon Poke Ball (sphere + cog teeth from the SVG icon).
- A Minecraft player using Gaz4i's skin, drawn as a stack of textured
  isometric cubes (head, body, arms, legs).
- Output: .blender/output/banner.png (900x300) and logo_512.png (square).

Pure PIL, no Blender required. Run with:
    python .blender/build_fake3d.py
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import math

HERE = Path(__file__).resolve().parent
ASSETS = HERE / "assets"
OUT = HERE / "output"
OUT.mkdir(exist_ok=True)

SKIN = Image.open(ASSETS / "skin_gaz4i.png").convert("RGBA")

# ---------------------------------------------------------------------------
# Skin face extraction (vanilla 64x64 layout)
# ---------------------------------------------------------------------------

def extract_faces(part_uv, size_x, size_y, size_z):
    """
    Returns 6 PIL Images for: front, back, right, left, top, bottom.
    part_uv = (u, v) of the front-face top-left in the skin texture.
    """
    u, v = part_uv
    front = SKIN.crop((u, v, u + size_x, v + size_y))
    right = SKIN.crop((u + size_x, v, u + size_x + size_z, v + size_y))
    back = SKIN.crop((u + size_x + size_z, v, u + size_x + size_z + size_x, v + size_y))
    left = SKIN.crop((u - size_z, v, u, v + size_y))
    top = SKIN.crop((u, v - size_z, u + size_x, v))
    bottom = SKIN.crop((u + size_x, v - size_z, u + size_x + size_x, v))
    return front, back, right, left, top, bottom


PARTS = {
    # uv_front, sx, sy, sz
    "head":      ((8, 8),   8, 8, 8),
    "body":      ((20, 20), 8, 12, 4),
    "right_arm": ((44, 20), 4, 12, 4),
    "left_arm":  ((36, 52), 4, 12, 4),
    "right_leg": ((4, 20),  4, 12, 4),
    "left_leg":  ((20, 52), 4, 12, 4),
}


# ---------------------------------------------------------------------------
# Isometric cube renderer
# ---------------------------------------------------------------------------

# Isometric basis: x -> screen right + down-right; y (up) -> screen up;
# z (depth) -> screen left + down-left. We use a 30° dimetric to keep
# top face slightly larger and improve readability.

def render_iso_cube(sx, sy, sz, faces, scale=10, shade=(1.0, 0.85, 0.7)):
    """
    Render a textured isometric cube.
    sx, sy, sz: dimensions in 'pixels' from the source texture.
    faces: 6-tuple (front, back, right, left, top, bottom).
    scale: pixels per source-pixel for the rendered cube.
    shade: brightness multipliers for (top, right, front) faces — front face
           is the brightest so the figure faces the camera.
    Returns an RGBA image cropped tightly around the cube.
    """
    front, back, right, left, top, bottom = faces

    # Project an axis-aligned rectangle in 3D to a parallelogram in 2D.
    # Iso projection per cube unit (1 source pixel = `scale` screen pixels):
    #   X axis -> ( cos30, +sin30 ) * scale
    #   Y axis -> (    0,   -1    ) * scale     (Y is up)
    #   Z axis -> (-cos30, +sin30 ) * scale
    c = math.cos(math.radians(30))
    s = math.sin(math.radians(30))

    def project(x, y, z):
        return (x * c - z * c, -y + x * s + z * s)

    # Bounding box of the projected cube (8 corners)
    corners3d = [(x, y, z) for x in (0, sx) for y in (0, sy) for z in (0, sz)]
    pts2d = [project(*p) for p in corners3d]
    min_u = min(p[0] for p in pts2d)
    max_u = max(p[0] for p in pts2d)
    min_v = min(p[1] for p in pts2d)
    max_v = max(p[1] for p in pts2d)

    W = int(math.ceil((max_u - min_u) * scale)) + 4
    H = int(math.ceil((max_v - min_v) * scale)) + 4

    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))

    def to_screen(x, y, z):
        u, v = project(x, y, z)
        return ((u - min_u) * scale + 2, (v - min_v) * scale + 2)

    def apply_shade(img, mult):
        """Multiply RGB by mult while keeping alpha."""
        arr = img.convert("RGBA")
        r, g, b, a = arr.split()
        r = r.point(lambda p: min(255, int(p * mult)))
        g = g.point(lambda p: min(255, int(p * mult)))
        b = b.point(lambda p: min(255, int(p * mult)))
        return Image.merge("RGBA", (r, g, b, a))

    def warp_face(face_img, dst_corners):
        """
        Perspective-warp face_img (source rectangle) to the 4 destination
        corners (TL, TR, BR, BL in screen pixels).
        """
        # Upscale source with NEAREST to keep pixel-art crisp before warp.
        src_w, src_h = face_img.size
        face_img = face_img.resize((src_w * 8, src_h * 8), Image.NEAREST)
        src_w, src_h = face_img.size

        # PIL transform expects 8 coefficients computed from 4-point mapping.
        # The mapping is "destination -> source", so we solve a system.
        (x0, y0), (x1, y1), (x2, y2), (x3, y3) = dst_corners
        # Source corners: TL, TR, BR, BL of the source image
        sx_tl, sy_tl = 0, 0
        sx_tr, sy_tr = src_w, 0
        sx_br, sy_br = src_w, src_h
        sx_bl, sy_bl = 0, src_h

        # Build the 8-equation linear system for PIL.PERSPECTIVE.
        # We need coefficients (a,b,c,d,e,f,g,h) such that
        #   src_x = (a*dst_x + b*dst_y + c) / (g*dst_x + h*dst_y + 1)
        #   src_y = (d*dst_x + e*dst_y + f) / (g*dst_x + h*dst_y + 1)
        import numpy as np
        A = []
        B = []
        for (dx, dy), (sx_, sy_) in [
            ((x0, y0), (sx_tl, sy_tl)),
            ((x1, y1), (sx_tr, sy_tr)),
            ((x2, y2), (sx_br, sy_br)),
            ((x3, y3), (sx_bl, sy_bl)),
        ]:
            A.append([dx, dy, 1, 0, 0, 0, -sx_ * dx, -sx_ * dy])
            A.append([0, 0, 0, dx, dy, 1, -sy_ * dx, -sy_ * dy])
            B.append(sx_)
            B.append(sy_)
        coeffs = np.linalg.solve(np.array(A, dtype=np.float64), np.array(B, dtype=np.float64))

        # Find bounding box of dst corners, render face there, paste onto canvas.
        min_dx = int(min(x0, x1, x2, x3))
        min_dy = int(min(y0, y1, y2, y3))
        max_dx = int(math.ceil(max(x0, x1, x2, x3)))
        max_dy = int(math.ceil(max(y0, y1, y2, y3)))
        bw = max_dx - min_dx + 1
        bh = max_dy - min_dy + 1
        if bw <= 0 or bh <= 0:
            return

        # Shift coefficients to operate in the local bounding box frame.
        # If dst was originally (X,Y), now it's (X-min_dx, Y-min_dy). We compose:
        a, b, c, d, e, f, g, h = coeffs
        # src_x = (a*(x+min_dx) + b*(y+min_dy) + c) / (g*(x+min_dx) + h*(y+min_dy) + 1)
        # Rewriting: numerator = a*x + b*y + (a*min_dx + b*min_dy + c)
        #            denominator = g*x + h*y + (g*min_dx + h*min_dy + 1)
        # We'll just provide PIL the shifted coefficients.
        c2 = a * min_dx + b * min_dy + c
        f2 = d * min_dx + e * min_dy + f
        k = g * min_dx + h * min_dy + 1
        # PIL wants coefficients normalized so the denominator constant is 1:
        a, b, c, d, e, f = a / k, b / k, c2 / k, d / k, e / k, f2 / k
        g, h = g / k, h / k

        warped = face_img.transform(
            (bw, bh),
            Image.PERSPECTIVE,
            (a, b, c, d, e, f, g, h),
            Image.BICUBIC,
        )
        canvas.alpha_composite(warped, (min_dx, min_dy))

    # Top face (Y = sy)
    tl = to_screen(0, sy, 0)
    tr = to_screen(sx, sy, 0)
    br = to_screen(sx, sy, sz)
    bl = to_screen(0, sy, sz)
    warp_face(apply_shade(top, shade[0]), (tl, tr, br, bl))

    # Right face (X = sx) — facing camera-right
    tl = to_screen(sx, sy, 0)
    tr = to_screen(sx, sy, sz)
    br = to_screen(sx, 0, sz)
    bl = to_screen(sx, 0, 0)
    warp_face(apply_shade(right, shade[1]), (tl, tr, br, bl))

    # Front face (Z = 0) — facing camera
    tl = to_screen(0, sy, 0)
    tr = to_screen(sx, sy, 0)
    br = to_screen(sx, 0, 0)
    bl = to_screen(0, 0, 0)
    warp_face(apply_shade(front, shade[2]), (tl, tr, br, bl))

    return canvas


def render_player(scale=10):
    """
    Render the full player as one stacked image. Returns RGBA + reference
    anchor for the right-hand position (used to lean on the ball).
    """
    cubes = {}
    for name, (uv, sx, sy, sz) in PARTS.items():
        faces = extract_faces(uv, sx, sy, sz)
        cubes[name] = render_iso_cube(sx, sy, sz, faces, scale=scale)

    # Compose: feet on bottom, head on top, arms attached to body.
    head = cubes["head"]
    body = cubes["body"]
    ra = cubes["right_arm"]
    la = cubes["left_arm"]
    rl = cubes["right_leg"]
    ll = cubes["left_leg"]

    # Compute the total canvas. We'll place body center at (cx, body_top).
    # All positions in screen pixels.
    body_w, body_h = body.size
    head_w, head_h = head.size
    leg_w, leg_h = rl.size
    arm_w, arm_h = ra.size

    # Stack layout:
    #   y=0 .. head_h   : head
    #   then body
    #   then legs
    # Arms hang on each side.

    canvas_w = body_w + arm_w * 2
    canvas_h = head_h + body_h + leg_h - 4 * scale  # small overlap

    img = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))

    # Place body centered horizontally
    body_x = (canvas_w - body_w) // 2
    body_y = head_h - 1 * scale
    img.alpha_composite(body, (body_x, body_y))

    # Head
    head_x = body_x + (body_w - head_w) // 2
    head_y = 0
    img.alpha_composite(head, (head_x, head_y))

    # Legs
    leg_y = body_y + body_h - 1 * scale
    rl_x = body_x + 0
    ll_x = body_x + 4 * scale
    img.alpha_composite(rl, (rl_x, leg_y))
    img.alpha_composite(ll, (ll_x, leg_y))

    # Arms — right arm raised (rotated 60° toward upper-right)
    # Quick effect: paste the right arm rotated.
    ra_rot = ra.rotate(-55, expand=True, resample=Image.BICUBIC)
    ra_x = body_x + body_w - 3 * scale
    ra_y = body_y - 2 * scale
    img.alpha_composite(ra_rot, (ra_x, ra_y))

    # Left arm hanging straight
    la_x = body_x - arm_w + 2 * scale
    la_y = body_y
    img.alpha_composite(la, (la_x, la_y))

    return img


# ---------------------------------------------------------------------------
# Pokéball (drawn with PIL, since the Cobblemon 64x32 texture is a UV-unwrap)
# ---------------------------------------------------------------------------

def render_pokeball(diameter, with_cog=True):
    """Draw a Pokéball with optional cog teeth around it. Returns RGBA."""
    SS = 4
    D = diameter * SS
    img = Image.new("RGBA", (D + 2, D + 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    cx, cy = D // 2 + 1, D // 2 + 1
    R = diameter * SS // 2
    STROKE = max(4, diameter // 22) * SS

    RED = (230, 57, 70, 255)
    BLACK = (26, 26, 26, 255)
    WHITE = (255, 255, 255, 255)
    GOLD = (220, 170, 70, 255)

    if with_cog:
        TOOTH_W = int(R * 0.28)
        TOOTH_IN = R + STROKE // 2
        TOOTH_OUT = R + int(R * 0.22)
        for ang in range(0, 360, 45):
            rad = math.radians(ang)
            ux, uy = math.sin(rad), -math.cos(rad)
            tx, ty = math.cos(rad), math.sin(rad)
            hw = TOOTH_W / 2
            pts = [
                (cx + ux * TOOTH_IN - tx * hw, cy + uy * TOOTH_IN - ty * hw),
                (cx + ux * TOOTH_IN + tx * hw, cy + uy * TOOTH_IN + ty * hw),
                (cx + ux * TOOTH_OUT + tx * hw, cy + uy * TOOTH_OUT + ty * hw),
                (cx + ux * TOOTH_OUT - tx * hw, cy + uy * TOOTH_OUT - ty * hw),
            ]
            d.polygon(pts, fill=GOLD, outline=BLACK, width=STROKE // 2)

    # Ball
    d.ellipse((cx - R, cy - R, cx + R, cy + R), fill=WHITE,
              outline=BLACK, width=STROKE)
    d.pieslice((cx - R, cy - R, cx + R, cy + R), 180, 360,
               fill=RED, outline=BLACK, width=STROKE)
    d.rectangle((cx - R, cy - STROKE // 2, cx + R, cy + STROKE // 2),
                fill=BLACK)
    d.ellipse((cx - R, cy - R, cx + R, cy + R), outline=BLACK, width=STROKE)

    HUB = int(R * 0.27)
    HUB_IN = int(R * 0.14)
    HUB_DOT = int(R * 0.06)
    d.ellipse((cx - HUB, cy - HUB, cx + HUB, cy + HUB),
              fill=WHITE, outline=BLACK, width=STROKE)
    d.ellipse((cx - HUB_IN, cy - HUB_IN, cx + HUB_IN, cy + HUB_IN), fill=BLACK)
    d.ellipse((cx - HUB_DOT, cy - HUB_DOT, cx + HUB_DOT, cy + HUB_DOT),
              fill=WHITE)

    return img.resize((diameter + 2, diameter + 2), Image.LANCZOS)


# ---------------------------------------------------------------------------
# Background
# ---------------------------------------------------------------------------

def cozy_background(w, h):
    img = Image.new("RGBA", (w, h), (60, 95, 60, 255))
    d = ImageDraw.Draw(img)
    FOREST_DARK = (35, 60, 38, 255)
    FOREST_BRIGHT = (75, 115, 70, 255)
    # vertical gradient
    for y in range(h):
        t = y / h
        r = int(FOREST_DARK[0] * (1 - t) + FOREST_BRIGHT[0] * t)
        g = int(FOREST_DARK[1] * (1 - t) + FOREST_BRIGHT[1] * t)
        b = int(FOREST_DARK[2] * (1 - t) + FOREST_BRIGHT[2] * t)
        d.line([(0, y), (w, y)], fill=(r, g, b, 255))
    # subtle texture
    for x in range(0, w, 6):
        for y in range(0, h, 6):
            d.point((x, y), fill=(255, 255, 255, 10))
    return img


# ---------------------------------------------------------------------------
# Final composition
# ---------------------------------------------------------------------------

def make_banner(out_path, W=1800, H=600):
    bg = cozy_background(W, H)

    # Pokéball
    ball_d = int(H * 0.85)
    ball = render_pokeball(ball_d, with_cog=True)
    ball_x = int(W * 0.25) - ball_d // 2
    ball_y = (H - ball_d) // 2
    bg.alpha_composite(ball, (ball_x, ball_y))

    # Player — slightly smaller so it fits beside the ball
    player = render_player(scale=12)
    # Slightly tilt the player to lean toward the ball
    player_rot = player.rotate(-8, expand=True, resample=Image.BICUBIC)
    p_w, p_h = player_rot.size
    p_x = ball_x + ball_d - int(p_w * 0.55)
    p_y = ball_y + ball_d - p_h + int(H * 0.05)
    bg.alpha_composite(player_rot, (p_x, p_y))

    # Title text
    try:
        title_font = ImageFont.truetype("C:/Windows/Fonts/impact.ttf", 220)
        sub_font = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 56)
        tag_font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 38)
    except IOError:
        title_font = sub_font = tag_font = ImageFont.load_default()

    d = ImageDraw.Draw(bg)
    text_x = int(W * 0.58)
    GOLD = (220, 170, 70, 255)
    GOLD_LIGHT = (245, 215, 130, 255)
    CREAM = (250, 240, 215, 255)

    # Drop shadow + gold outline + cream fill
    d.text((text_x + 6, 130 + 6), "STEAMON", font=title_font, fill=(0, 0, 0, 180))
    for dx, dy in [(-4, 0), (4, 0), (0, -4), (0, 4),
                   (-3, -3), (3, 3), (-3, 3), (3, -3)]:
        d.text((text_x + dx, 130 + dy), "STEAMON", font=title_font, fill=GOLD)
    d.text((text_x, 130), "STEAMON", font=title_font, fill=CREAM)

    d.text((text_x + 10, 380), "Create × Cobblemon", font=sub_font, fill=GOLD_LIGHT)
    d.text((text_x + 10, 455), "Minecraft 1.21.1 — NeoForge",
           font=tag_font, fill=(220, 220, 200, 255))

    final = bg.resize((900, 300), Image.LANCZOS)
    final.save(out_path, "PNG", optimize=True)
    return out_path


def make_icon(out_path, size=512):
    SS = 2
    W = size * SS
    bg = cozy_background(W, W)
    ball_d = int(W * 0.86)
    ball = render_pokeball(ball_d, with_cog=True)
    bg.alpha_composite(ball, ((W - ball_d) // 2, (W - ball_d) // 2))

    # Smaller player perched on the ball's right side
    player = render_player(scale=8)
    player_rot = player.rotate(-12, expand=True, resample=Image.BICUBIC)
    p_w, p_h = player_rot.size
    p_x = W - p_w - int(W * 0.04)
    p_y = (W - ball_d) // 2 + ball_d // 4
    bg.alpha_composite(player_rot, (p_x, p_y))

    final = bg.resize((size, size), Image.LANCZOS)
    final.save(out_path, "PNG", optimize=True)
    return out_path


if __name__ == "__main__":
    banner = make_banner(OUT / "banner.png")
    icon = make_icon(OUT / "logo_512.png", size=512)
    print(f"Wrote {banner}")
    print(f"Wrote {icon}")

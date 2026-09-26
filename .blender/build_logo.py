"""
Steamon logo builder — Blender Python script.

Builds a 3D scene:
  - The Cobblemon Poké Ball (from common/.../poke_balls/models/poke_ball.geo.json),
    scaled to be a giant ~3m sphere, textured with poke_ball.png.
  - A Minecraft player model wearing Gaz4i's skin, leaning against the ball
    like it's a counter (right elbow rested on top, body angled).
  - Studio lighting + camera framed for a 1:1 square logo.
  - Renders a 1024x1024 PNG to .blender/output/logo.png.

Usage from project root:
  blender --background --python .blender/build_logo.py

Requires Blender 4.0+ (any recent version works — uses only the standard bpy API).

Tested with: Blender 4.2 LTS on Windows.
"""

import bpy
import bmesh
import json
import math
from mathutils import Vector
from pathlib import Path

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

HERE = Path(__file__).resolve().parent
ASSETS = HERE / "assets"
OUT = HERE / "output"
OUT.mkdir(exist_ok=True)

GEO_FILE = ASSETS / "poke_ball.geo.json"
BALL_TEX = ASSETS / "poke_ball_3d.png"
SKIN_TEX = ASSETS / "skin_gaz4i.png"

# Bedrock model units = 1/16 block. We multiply to get nicer Blender scale.
# A vanilla Poké Ball "ball" bone is 8 wide => 0.5 block. We scale x10 to make
# it ~5m, so the player looks tiny next to it — the "huge ball counter" vibe.
BEDROCK_TO_BLENDER = 1.0 / 16.0
BALL_SCALE = 10.0


# ---------------------------------------------------------------------------
# Scene reset
# ---------------------------------------------------------------------------

def reset_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    # Also wipe orphans
    for block in (bpy.data.meshes, bpy.data.materials, bpy.data.images,
                  bpy.data.textures, bpy.data.armatures):
        for item in list(block):
            if item.users == 0:
                block.remove(item)


# ---------------------------------------------------------------------------
# Bedrock geometry importer (minimal — only what poke_ball.geo.json uses)
# ---------------------------------------------------------------------------

def add_bedrock_cube(name, origin, size, inflate=0.0, uv=(0, 0), tex_w=64, tex_h=32):
    """
    Build a single Bedrock-style cube as a Blender mesh.
    origin = bedrock-units lower-NW-front corner (X-right, Y-up, Z-south).
    size   = bedrock-units (sx, sy, sz).
    inflate adds uniform thickness (used by poke_ball for outline layers).
    Returns the created object.
    """
    ox, oy, oz = origin
    sx, sy, sz = size
    # apply inflate
    ox -= inflate; oy -= inflate; oz -= inflate
    sx += 2 * inflate; sy += 2 * inflate; sz += 2 * inflate

    mesh = bpy.data.meshes.new(name)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)

    bm = bmesh.new()
    # Corners (Bedrock Y-up matches Blender Z-up after we rotate; we use Y up here
    # then rotate the whole scene at the end).
    p = [
        (ox,      oy,      oz),
        (ox + sx, oy,      oz),
        (ox + sx, oy + sy, oz),
        (ox,      oy + sy, oz),
        (ox,      oy,      oz + sz),
        (ox + sx, oy,      oz + sz),
        (ox + sx, oy + sy, oz + sz),
        (ox,      oy + sy, oz + sz),
    ]
    verts = [bm.verts.new(v) for v in p]
    # Faces: -Z, +Z, -X, +X, -Y, +Y
    faces = [
        (verts[0], verts[1], verts[2], verts[3]),  # back  (-Z)
        (verts[5], verts[4], verts[7], verts[6]),  # front (+Z)
        (verts[4], verts[0], verts[3], verts[7]),  # left  (-X)
        (verts[1], verts[5], verts[6], verts[2]),  # right (+X)
        (verts[4], verts[5], verts[1], verts[0]),  # bottom(-Y)
        (verts[3], verts[2], verts[6], verts[7]),  # top   (+Y)
    ]
    for f in faces:
        bm.faces.new(f)

    bm.faces.ensure_lookup_table()

    # Bedrock UV unwrap (simplified box layout):
    #   Top:   uv_x = uv[0] + sz,  uv_y = uv[1],          w = sx, h = sz
    #   Bot:   uv_x = uv[0] + sz + sx, uv_y = uv[1],      w = sx, h = sz
    #   West:  uv_x = uv[0],           uv_y = uv[1] + sz, w = sz, h = sy
    #   North: uv_x = uv[0] + sz,      uv_y = uv[1] + sz, w = sx, h = sy
    #   East:  uv_x = uv[0] + sz + sx, uv_y = uv[1] + sz, w = sz, h = sy
    #   South: uv_x = uv[0] + 2*sz + sx, uv_y = uv[1] + sz, w = sx, h = sy
    u, v = uv
    uv_layer = bm.loops.layers.uv.new()

    def uv_norm(px, py):
        return (px / tex_w, 1.0 - py / tex_h)

    def assign(face_idx, ul, vt, w, h, flip_v=False):
        face = bm.faces[face_idx]
        # 4 loops, order matches the verts tuple above. We map them as quad.
        corners = [(ul, vt + h), (ul + w, vt + h), (ul + w, vt), (ul, vt)]
        if flip_v:
            corners = [(c[0], vt + h - (c[1] - vt)) for c in corners]
        for loop, (px, py) in zip(face.loops, corners):
            loop[uv_layer].uv = uv_norm(px, py)

    # We pass the original (uninflated) sizes for UV — the inflated layers reuse
    # the same UV but at slightly larger scale; for the small inflate values this
    # is visually fine.
    osx, osy, osz = size
    assign(0, u + osz + osx, v + osz, osx, osy)            # back / north
    assign(1, u + osz,       v + osz, osx, osy)            # front / south (but Bedrock convention differs — see below)
    assign(2, u,             v + osz, osz, osy)            # left / west
    assign(3, u + osz + osx, v + osz, osz, osy)            # right / east (reusing slot for simplicity)
    assign(4, u + osz + osx, v,       osx, osz, flip_v=True)  # bottom
    assign(5, u + osz,       v,       osx, osz)            # top

    bm.to_mesh(mesh)
    bm.free()
    return obj


def import_bedrock_geo(geo_path, ball_tex_path):
    with open(geo_path) as f:
        data = json.load(f)

    geom = data["minecraft:geometry"][0]
    desc = geom["description"]
    tex_w = desc.get("texture_width", 64)
    tex_h = desc.get("texture_height", 32)

    ball_objects = []
    for bone in geom["bones"]:
        for i, cube in enumerate(bone.get("cubes", [])):
            obj = add_bedrock_cube(
                name=f"{bone['name']}_{i}",
                origin=cube["origin"],
                size=cube["size"],
                inflate=cube.get("inflate", 0.0),
                uv=tuple(cube["uv"]),
                tex_w=tex_w,
                tex_h=tex_h,
            )
            ball_objects.append(obj)

    # Material with the Bedrock texture
    mat = bpy.data.materials.new("PokeBall")
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Roughness"].default_value = 0.35
    tex_node = nt.nodes.new("ShaderNodeTexImage")
    tex_node.image = bpy.data.images.load(str(ball_tex_path))
    tex_node.image.colorspace_settings.name = 'sRGB'
    tex_node.interpolation = 'Closest'  # pixel-art look
    nt.links.new(tex_node.outputs["Color"], bsdf.inputs["Base Color"])

    for obj in ball_objects:
        obj.data.materials.append(mat)

    # Parent + scale + rotate to Z-up
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
    parent = bpy.context.object
    parent.name = "PokeBall_Root"
    for obj in ball_objects:
        obj.parent = parent
    parent.scale = (BEDROCK_TO_BLENDER * BALL_SCALE,) * 3
    parent.rotation_euler = (math.radians(90), 0, 0)  # Y-up -> Z-up
    return parent


# ---------------------------------------------------------------------------
# Minecraft player model
# ---------------------------------------------------------------------------

PLAYER_PARTS = [
    # (name, origin, size, uv[topleft of front face])  — classic 64x64 layout
    ("head",      (-4, 24, -4), (8, 8, 8), (8,  8)),
    ("body",      (-4, 12, -2), (8, 12, 4), (20, 20)),
    ("right_arm", (-7, 12, -2), (4, 12, 4), (44, 20)),
    ("left_arm",  ( 3, 12, -2), (4, 12, 4), (36, 52)),
    ("right_leg", (-4,  0, -2), (4, 12, 4), (4,  20)),
    ("left_leg",  ( 0,  0, -2), (4, 12, 4), (20, 52)),
]


def add_player_part(name, origin, size, uv_front, tex_w=64, tex_h=64):
    """
    Build a Minecraft-style cuboid with proper UV unwrap for vanilla skin layout.
    uv_front = (u, v) of the front face's top-left in pixels.
    """
    ox, oy, oz = origin
    sx, sy, sz = size

    mesh = bpy.data.meshes.new(name)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)

    bm = bmesh.new()
    p = [
        (ox,      oy,      oz),
        (ox + sx, oy,      oz),
        (ox + sx, oy + sy, oz),
        (ox,      oy + sy, oz),
        (ox,      oy,      oz + sz),
        (ox + sx, oy,      oz + sz),
        (ox + sx, oy + sy, oz + sz),
        (ox,      oy + sy, oz + sz),
    ]
    verts = [bm.verts.new(v) for v in p]
    faces = [
        (verts[0], verts[1], verts[2], verts[3]),  # 0 back  (-Z)
        (verts[5], verts[4], verts[7], verts[6]),  # 1 front (+Z)
        (verts[4], verts[0], verts[3], verts[7]),  # 2 left  (-X)
        (verts[1], verts[5], verts[6], verts[2]),  # 3 right (+X)
        (verts[4], verts[5], verts[1], verts[0]),  # 4 bottom(-Y)
        (verts[3], verts[2], verts[6], verts[7]),  # 5 top   (+Y)
    ]
    for f in faces:
        bm.faces.new(f)
    bm.faces.ensure_lookup_table()

    # Vanilla MC skin box-unwrap:
    #   layout (origin = uv_front top-left "front" rectangle):
    #     top(sz x sx), bottom(sz x sx) on the row above front;
    #     left(sz), front(sx), right(sz), back(sx) on the same row.
    u, v = uv_front
    uv_layer = bm.loops.layers.uv.new()

    def uv_norm(px, py):
        return (px / tex_w, 1.0 - py / tex_h)

    def assign(face_idx, ul, vt, w, h, flip_h=False):
        face = bm.faces[face_idx]
        corners = [(ul, vt + h), (ul + w, vt + h), (ul + w, vt), (ul, vt)]
        if flip_h:
            corners = [(ul + w - (c[0] - ul), c[1]) for c in corners]
        for loop, (px, py) in zip(face.loops, corners):
            loop[uv_layer].uv = uv_norm(px, py)

    # face index → MC face → uv rect (px, py, w, h)
    # MC convention:
    #   front:  (u,        v,        sx, sy)
    #   right:  (u - sz,   v,        sz, sy)
    #   back:   (u + sx,   v,        sx, sy)  -> actually back is (u + sx + sz, v, sx, sy)
    #   left:   (u + sx,   v,        sz, sy)
    #   top:    (u,        v - sz,   sx, sz)
    #   bottom: (u + sx,   v - sz,   sx, sz)
    # Indices in our faces list: 0 back, 1 front, 2 left, 3 right, 4 bottom, 5 top.
    assign(1, u,                  v,           sx, sy)            # front
    assign(3, u + sx,             v,           sz, sy)            # right (Blender +X)
    assign(0, u + sx + sz,        v,           sx, sy)            # back
    assign(2, u - sz,             v,           sz, sy)            # left  (Blender -X)
    assign(5, u,                  v - sz,      sx, sz)            # top
    assign(4, u + sx,             v - sz,      sx, sz, flip_h=True)  # bottom

    bm.to_mesh(mesh)
    bm.free()
    return obj


def build_player(skin_tex_path):
    parts = []
    for name, origin, size, uv in PLAYER_PARTS:
        parts.append(add_player_part(name, origin, size, uv))

    mat = bpy.data.materials.new("PlayerSkin")
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Roughness"].default_value = 0.6
    tex_node = nt.nodes.new("ShaderNodeTexImage")
    tex_node.image = bpy.data.images.load(str(skin_tex_path))
    tex_node.image.colorspace_settings.name = 'sRGB'
    tex_node.interpolation = 'Closest'
    nt.links.new(tex_node.outputs["Color"], bsdf.inputs["Base Color"])
    # Alpha-aware to support transparent skin layers (hat, jacket)
    bsdf.inputs.get("Alpha")  # noop, just for clarity
    nt.links.new(tex_node.outputs["Alpha"], bsdf.inputs["Alpha"])
    mat.blend_method = 'CLIP'

    for obj in parts:
        obj.data.materials.append(mat)

    # Parent
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
    root = bpy.context.object
    root.name = "Player_Root"
    for obj in parts:
        obj.parent = root

    # Player units = 1/16 block as well. Apply same scale, Z-up rotation,
    # and pose the right arm slightly upward to make him "lean".
    root.scale = (BEDROCK_TO_BLENDER,) * 3
    root.rotation_euler = (math.radians(90), 0, 0)
    return root, dict(zip([n for n, *_ in PLAYER_PARTS], parts))


def pose_leaning_on_ball(player_root, parts):
    """
    Tilt the player so he leans against the ball:
    - Whole body tilts ~12° toward the ball (around its forward axis).
    - Right arm is rotated upward to look like it's resting on top of the ball.
    """
    # Apply body tilt at the empty level.
    player_root.rotation_euler = (
        math.radians(90),       # Z-up
        math.radians(-12),      # body tilt toward ball
        math.radians(20),       # face the camera slightly
    )

    # Right arm: rotate upward at its top pivot
    right_arm = parts["right_arm"]
    # Set origin to shoulder (top of the arm box, x = -4 ie inner side)
    bpy.context.view_layer.objects.active = right_arm
    bpy.ops.object.select_all(action='DESELECT')
    right_arm.select_set(True)
    # Move origin to shoulder by translating mesh
    # Pivot at (-5, 24, 0) in bedrock units
    me = right_arm.data
    for v in me.vertices:
        v.co.x -= -5
        v.co.y -= 24
        v.co.z -= 0
    right_arm.location.x = -5
    right_arm.location.y = 24
    right_arm.location.z = 0
    # Now rotate
    right_arm.rotation_euler = (
        math.radians(75),    # raise forward + up
        math.radians(10),
        math.radians(-5),
    )


# ---------------------------------------------------------------------------
# Camera, lights, render
# ---------------------------------------------------------------------------

def setup_camera():
    bpy.ops.object.camera_add(
        location=(3.6, -4.2, 2.2),
        rotation=(math.radians(75), 0, math.radians(40)),
    )
    cam = bpy.context.object
    cam.data.lens = 60
    bpy.context.scene.camera = cam
    return cam


def setup_lights():
    # Key light
    bpy.ops.object.light_add(type='AREA', location=(4, -3, 5))
    key = bpy.context.object
    key.data.energy = 1500
    key.data.size = 4
    key.rotation_euler = (math.radians(45), math.radians(30), 0)

    # Fill light
    bpy.ops.object.light_add(type='AREA', location=(-4, -2, 3))
    fill = bpy.context.object
    fill.data.energy = 400
    fill.data.size = 5

    # Rim light from behind
    bpy.ops.object.light_add(type='AREA', location=(0, 4, 4))
    rim = bpy.context.object
    rim.data.energy = 800
    rim.data.size = 3
    rim.rotation_euler = (math.radians(-60), 0, math.radians(180))


def setup_world_bg():
    world = bpy.context.scene.world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    # Cozy forest green to match the Modrinth icon
    bg.inputs[0].default_value = (0.20, 0.34, 0.21, 1.0)
    bg.inputs[1].default_value = 1.0


def render(filename, size=1024, transparent=False):
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 128
    scene.cycles.use_denoising = True
    scene.render.resolution_x = size
    scene.render.resolution_y = size
    scene.render.film_transparent = transparent
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA' if transparent else 'RGB'
    scene.render.filepath = str(OUT / filename)
    bpy.ops.render.render(write_still=True)
    print(f"Wrote {scene.render.filepath}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    reset_scene()
    ball = import_bedrock_geo(GEO_FILE, BALL_TEX)
    player_root, parts = build_player(SKIN_TEX)
    pose_leaning_on_ball(player_root, parts)

    # Position player to the left of the giant ball, feet on the ground (z=0)
    # Ball center after scale is roughly (0, 0, 4 * BALL_SCALE / 16) ~= 2.5 m.
    ball.location = (0, 0, 2.5)
    player_root.location = (-1.3, -1.2, 0)

    setup_camera()
    setup_lights()
    setup_world_bg()

    # 1024x1024 square logo with cozy green background
    render("logo.png", size=1024, transparent=False)
    # 512x512 transparent — for use as Modrinth icon
    bpy.context.scene.render.resolution_x = 512
    bpy.context.scene.render.resolution_y = 512
    bpy.context.scene.render.film_transparent = True
    bpy.context.scene.render.image_settings.color_mode = 'RGBA'
    bpy.context.scene.render.filepath = str(OUT / "logo_512_transparent.png")
    bpy.ops.render.render(write_still=True)
    print(f"Wrote {bpy.context.scene.render.filepath}")


if __name__ == "__main__":
    main()

# Blender / 3D logo pipeline

Three asset sources, then composed into the final banner and icon.

## 1. Pokéball (Cobblemon)

- Model: `assets/poke_ball.geo.json` (Bedrock geometry format)
- Texture: `assets/poke_ball_3d.png` (64×32, official Cobblemon)
- **How to render a transparent PNG**:
  1. Open https://web.blockbench.net/
  2. `File → Open Model` → pick `poke_ball.geo.json`
  3. Drag `poke_ball_3d.png` into the Textures panel
  4. `File → Render Scene`:
     - Background: gradient with alpha = 0 on both stops (transparent)
     - Resolution: 1024×1024
     - Angle: front-facing, slight tilt down (for the "ball on the ground" look)
  5. `Save render to image` → save as `output/pokeball_3d.png`

## 2. Cog Create (large cogwheel)

- Model: `assets/create/large_cogwheel.json` (Java block model, references parent `large_wheels`)
- Parent model: `assets/create/large_wheels.json`
- Textures: `large_cogwheel.png`, `cogwheel.png`, `cogwheel_axis.png`, `axis_top.png`, `stripped_spruce_log.png`
- **How to render a transparent PNG**:
  1. https://web.blockbench.net/
  2. `File → Open Model` → pick `large_cogwheel.json`
  3. Blockbench will ask for the parent — point to `large_wheels.json` (same folder)
  4. Drag all `.png` textures from `assets/create/` into the Textures panel
  5. `File → Render Scene` (same settings as Pokéball)
  6. Save as `output/cog_3d.png`

## 3. Avatar with custom pose

`pose_avatar.html` — a self-contained skinview3d viewer with your skin (Gaz4i) pre-loaded and pose presets.

### How to use

1. Open `pose_avatar.html` in Chrome/Firefox/Edge:
   ```
   cd <repo>/.blender
   start pose_avatar.html        # Windows
   # or
   xdg-open pose_avatar.html     # Linux
   ```
2. Pick a pose preset (Leaning / Arms crossed / Hands in pockets / Wave / Idle), or drag the sliders to tune.
3. Click **Télécharger PNG transparent** → downloads `avatar_pose.png`.
4. Move that file into `output/avatar_pose.png`.

### Notes

- Loads from `assets/skin_gaz4i.png` (relative path). If your browser blocks local file loads, run a tiny static server:
  ```
  python -m http.server 8000
  # then visit http://localhost:8000/.blender/pose_avatar.html
  ```
- The viewer uses `skinview3d@3.2.1` via CDN. No install needed.
- Background is fully transparent — the downloaded PNG has no green/blue backdrop.

## 4. Composition

When you have `pokeball_3d.png`, `cog_3d.png`, `avatar_pose.png` in `output/`, run:

```
python build_compose.py
```

It assembles them onto a 900×300 banner and a 512×512 logo with the forest-green
Steamon background and the STEAMON wordmark. Edit `build_compose.py` to tune
positions and sizes if needed.

## Alternative renders for the avatar (no install)

If `pose_avatar.html` doesn't fit your need, these online tools can also render
your skin with a custom pose:

- **MCRender Studio** — https://www.mcrender.net/studio (3 free renders per
  month, drag-and-drop limbs, transparent PNG)
- **Skin Poser** — https://alonsoaliaga.github.io/skin-poser/ (free, watermark on
  download)
- **NameMC** — https://namemc.com/skin/ (interactive viewer, screenshot only)
- **Crafatar / mc-heads / Identicraft** — fixed idle pose, no custom limbs

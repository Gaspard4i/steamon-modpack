import * as THREE from "three";

/**
 * Parse a Minecraft Java block/item model (`.json`).
 *
 * The Java format is very close to the .bbmodel `elements` block:
 * - `elements: [{from, to, rotation, faces}]`
 *   - `from`/`to` are corner coordinates in MODEL pixel space (0..16 per
 *     block); the cube spans `[from, to]`.
 *   - `rotation: { angle, axis, origin, rescale? }` rotates the cube around
 *     a pivot. Angle is one of -45, -22.5, 0, 22.5, 45.
 *   - `faces.<dir>.uv = [u0, v0, u1, v1]` in pixel coords of the assigned
 *     texture (which is `texture_width` × `texture_height`, defaulting to
 *     16×16 — but for Create the textures vary per face!).
 *   - `faces.<dir>.texture = "#tag"` references a texture variable.
 * - `textures: { "0": "create:block/foo", ... }` maps tags to texture paths.
 *
 * @param {object} model      The parsed JSON model.
 * @param {object} textures   { tag: THREE.Texture } map for each #tag.
 * @returns {THREE.Group}
 */
export function parseJavaModel(model, textures, opts = {}) {
  const root = new THREE.Group();
  const tagSize = {};
  // Cache image size per tag (textures may be 16×16 or larger)
  for (const tag in textures) {
    const t = textures[tag];
    if (t && t.image) {
      tagSize[tag] = { w: t.image.width, h: t.image.height };
    } else {
      tagSize[tag] = { w: 16, h: 16 };
    }
  }

  for (const el of model.elements || []) {
    const mesh = buildJavaElement(el, textures, tagSize);
    if (mesh) root.add(mesh);
  }

  // Center on origin so callers can place the model wherever they want
  const box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  root.position.set(-center.x, -box.min.y, -center.z);

  const wrap = new THREE.Group();
  wrap.add(root);
  return wrap;
}

const FACE_NAMES = ["east", "west", "up", "down", "south", "north"];
// Mapping from face name → axis sign in MC convention
//   east  = +X    west  = -X
//   up    = +Y    down  = -Y
//   south = +Z    north = -Z

function buildJavaElement(el, textures, tagSize) {
  const from = el.from;
  const to = el.to;
  const sx = to[0] - from[0];
  const sy = to[1] - from[1];
  const sz = to[2] - from[2];

  // Java models support `from`/`to` going OUTSIDE the [0,16]^3 cube
  // (e.g. -2..18 on the cog), so we just trust the values.

  // Build per-face material map. Different faces can reference different
  // textures — wrench uses #5 everywhere, cog uses #0 (axis side), #3 (axis
  // top), #4 (cogwheel side) and #particle (wood).
  const faceList = [];
  let needGeom = false;
  for (let i = 0; i < 6; i++) {
    const fname = FACE_NAMES[i];
    const f = (el.faces || {})[fname];
    if (!f) { faceList.push(null); continue; }
    const tag = (f.texture || "").replace(/^#/, "") || "particle";
    const tex = textures[tag] || textures.particle;
    if (!tex) { faceList.push(null); continue; }
    needGeom = true;
    faceList.push({ face: f, tag, tex });
  }
  if (!needGeom) return null;

  // Build a BoxGeometry with one material per face. THREE supports an
  // array material; the BoxGeometry's `groupStart` per face automatically
  // picks materials[face_index]. We create a small material per face,
  // reusing identical (tex, opaque) instances.
  const matCache = new Map();
  function getMat(tex, transparent) {
    const key = tex.uuid + (transparent ? "_t" : "_o");
    if (matCache.has(key)) return matCache.get(key);
    const m = new THREE.MeshStandardMaterial({
      map: tex,
      transparent,
      alphaTest: transparent ? 0.05 : 0,
      side: THREE.FrontSide,
      metalness: 0.1,
      roughness: 0.55,
      envMapIntensity: 0.9,
    });
    matCache.set(key, m);
    return m;
  }

  const geom = new THREE.BoxGeometry(sx || 0.001, sy || 0.001, sz || 0.001);
  const mats = [];
  for (let i = 0; i < 6; i++) {
    const f = faceList[i];
    if (!f) { mats.push(new THREE.MeshBasicMaterial({ visible: false })); continue; }
    // Heuristic: tags whose name suggests transparency (wrench has alpha)
    const transparent = /wrench|cogwheel$|gear/.test(f.tag);
    mats.push(getMat(f.tex, transparent));
  }
  // Apply per-face UVs based on each face's texture size
  applyFaceUVs(geom, faceList, tagSize);

  const mesh = new THREE.Mesh(geom, mats);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2,
    (from[2] + to[2]) / 2,
  );

  // Rotation around the `origin` pivot
  if (el.rotation && el.rotation.angle) {
    const r = el.rotation;
    const [px, py, pz] = r.origin || [8, 8, 8];
    const pivot = new THREE.Group();
    pivot.position.set(px, py, pz);
    const ang = THREE.MathUtils.degToRad(r.angle);
    if (r.axis === "x") pivot.rotation.x = ang;
    else if (r.axis === "y") pivot.rotation.y = ang;
    else if (r.axis === "z") pivot.rotation.z = ang;
    mesh.position.x -= px;
    mesh.position.y -= py;
    mesh.position.z -= pz;
    pivot.add(mesh);
    return pivot;
  }
  return mesh;
}

function applyFaceUVs(geom, faceList, tagSize) {
  const attr = geom.attributes.uv;
  for (let i = 0; i < 6; i++) {
    const f = faceList[i];
    if (!f) {
      attr.setXY(i * 4 + 0, 0, 0);
      attr.setXY(i * 4 + 1, 0, 0);
      attr.setXY(i * 4 + 2, 0, 0);
      attr.setXY(i * 4 + 3, 0, 0);
      continue;
    }
    let [u0, v0, u1, v1] = f.face.uv || [0, 0, 16, 16];
    const sz = tagSize[f.tag] || { w: 16, h: 16 };
    // Java models specify UVs in 16×16 reference space when texture_width
    // isn't set. Treat the rect as a fraction of (16 × 16) and then map to
    // the texture's actual aspect. For non-16 textures, the convention is
    // still to express UVs in 0..16 → divide by 16 to get 0..1.
    const W = 16, H = 16;
    let U0 = u0 / W, U1 = u1 / W;
    // Java V coord uses the same top-left origin as Bedrock pixels
    let V0 = 1 - v0 / H;
    let V1 = 1 - v1 / H;

    // Apply rotation (0/90/180/270) — rotates the texture sample on the
    // face. The Java spec: rotation rotates CCW when looking at the face.
    let corners = [
      [U0, V0], // TL
      [U1, V0], // TR
      [U0, V1], // BL
      [U1, V1], // BR
    ];
    const rot = (f.face.rotation || 0) % 360;
    if (rot === 90) {
      // TL → TR → BR → BL → TL  (rotate 90° CCW visually)
      corners = [
        [U1, V0],
        [U1, V1],
        [U0, V0],
        [U0, V1],
      ];
    } else if (rot === 180) {
      corners = [
        [U1, V1],
        [U0, V1],
        [U1, V0],
        [U0, V0],
      ];
    } else if (rot === 270) {
      corners = [
        [U0, V1],
        [U0, V0],
        [U1, V1],
        [U1, V0],
      ];
    }
    for (let k = 0; k < 4; k++) attr.setXY(i * 4 + k, corners[k][0], corners[k][1]);
  }
  attr.needsUpdate = true;
}

/**
 * Helper: resolve a textures dict from a Java model + a basepath map.
 * @param {object} modelTextures   { "0": "create:block/foo", ... }
 * @param {(name:string) => string|null} resolveAsset  Returns URL for a given
 *   Minecraft path (e.g. "create:block/cogwheel" → "/create_tex/cogwheel.png")
 * @returns {Promise<{[tag:string]: THREE.Texture}>}
 */
export async function loadJavaTextures(modelTextures, resolveAsset) {
  const out = {};
  const loader = new THREE.TextureLoader();
  for (const tag in modelTextures) {
    const ref = modelTextures[tag];
    const url = resolveAsset(ref);
    if (!url) continue;
    const tex = await new Promise((res, rej) => {
      loader.load(url, t => res(t), undefined, rej);
    });
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = false;
    // For a non-power-of-2 texture three needs WrapS/T set explicitly
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    out[tag] = tex;
  }
  return out;
}

import * as THREE from "three";

/**
 * Parse a Blockbench .bbmodel and build a THREE.Group ready to render.
 *
 * Why .bbmodel and not .geo.json?
 *
 * .geo.json stores only `cube.uv = [u_offset, v_offset]` and the renderer
 * is supposed to derive the six face rects via the standard cross-unwrap.
 * That cross-unwrap has many edge cases (negative size on up/down for V flip,
 * mirror_uv swap of east/west, degenerate flat cubes) that are easy to get
 * subtly wrong.
 *
 * .bbmodel saves the result of that unwrap, per face, already as a pixel
 * rect `[u0, v0, u1, v1]`. We can just translate those rects into UV
 * coordinates and skip the entire cross-unwrap logic.
 *
 * Texture handling: textures are embedded as base64 data URLs, ready to
 * feed to TextureLoader.
 */
export function parseBBModel(model, opts = {}) {
  const { textureIndex = 0, materials } = opts;

  const texW = model.resolution.width;
  const texH = model.resolution.height;

  // Build outliner tree → THREE hierarchy
  // The .bbmodel outliner is an array of either bone groups (objects with
  // `children`) or element UUIDs (strings referring to model.elements).
  // Newer bbmodel formats (4.5+) store bone metadata in a separate top-level
  // `groups` array indexed by uuid; the outliner only carries hierarchy.
  const elementsByUuid = {};
  for (const el of model.elements) {
    elementsByUuid[el.uuid] = el;
  }
  const groupsByUuid = {};
  if (Array.isArray(model.groups)) {
    for (const g of model.groups) {
      if (g && g.uuid) groupsByUuid[g.uuid] = g;
    }
  }

  // Map of bone name → THREE.Group so the caller can articulate individual
  // bones (head, arms, legs…) via direct rotation.set() calls.
  const bones = {};

  function buildNode(node, parentOrigin = [0, 0, 0]) {
    if (typeof node === "string") {
      const el = elementsByUuid[node];
      if (!el) return null;
      return buildElement(el, texW, texH, materials);
    }
    // Bone group — merge metadata from `groups[uuid]` when it exists
    // (newer Blockbench format) on top of inline outliner fields.
    const meta = (node.uuid && groupsByUuid[node.uuid]) || {};
    const name = node.name || meta.name || "bone";
    const origin = node.origin || meta.origin || [0, 0, 0];
    const rotation = node.rotation || meta.rotation || null;

    const group = new THREE.Group();
    group.name = name;
    // bbmodel bone origin is WORLD-space. Position it in PARENT-local space
    // by subtracting the parent's origin. Then the THREE transform chain
    // re-adds parent.position automatically.
    group.position.set(
      origin[0] - parentOrigin[0],
      origin[1] - parentOrigin[1],
      origin[2] - parentOrigin[2],
    );
    // Bake the bone's resting rotation into a separate child node, so the
    // user-controlled rotation (set externally on `group.rotation`) composes
    // cleanly on top of the rest pose. Without this, applying e.g. head.y=20°
    // would overwrite the resting tilt.
    const restNode = new THREE.Group();
    restNode.name = `${group.name}__rest`;
    if (rotation) {
      restNode.rotation.set(
        THREE.MathUtils.degToRad(rotation[0]),
        THREE.MathUtils.degToRad(rotation[1]),
        THREE.MathUtils.degToRad(rotation[2]),
      );
    }
    group.add(restNode);
    group.userData.isBone = true;
    group.userData.boneName = name;

    for (const child of node.children || []) {
      const childObj = buildNode(child, origin);
      if (!childObj) continue;
      // The child positions itself relative to `origin` already (recursion
      // passes parentOrigin=origin). But element children (strings → cubes)
      // were positioned at their world center by buildCubeFromBB — so we
      // must also subtract origin from them.
      if (typeof child === "string") {
        childObj.position.x -= origin[0];
        childObj.position.y -= origin[1];
        childObj.position.z -= origin[2];
      }
      restNode.add(childObj);
    }

    bones[group.name] = group;
    return group;
  }

  const root = new THREE.Group();
  for (const node of model.outliner) {
    const obj = buildNode(node);
    if (obj) root.add(obj);
  }
  root.userData.bones = bones;
  return root;
}

/**
 * Walk the bbmodel outliner to extract the bone hierarchy as a tree of
 * `{ name, children: [...] }` — useful for rendering a UI panel.
 *
 * Handles both legacy outliner-only format (older Cobblemon assets) and
 * the newer 4.5+ format where bone names live in `model.groups[uuid].name`.
 */
export function extractBoneTree(model) {
  const groupsByUuid = {};
  if (Array.isArray(model.groups)) {
    for (const g of model.groups) {
      if (g && g.uuid) groupsByUuid[g.uuid] = g;
    }
  }
  function walk(node) {
    if (typeof node === "string") return null;
    const meta = (node.uuid && groupsByUuid[node.uuid]) || {};
    const name = node.name || meta.name || "?";
    return {
      name,
      children: (node.children || []).map(walk).filter(Boolean),
    };
  }
  return model.outliner.map(walk).filter(Boolean);
}

function buildElement(el, texW, texH, materials) {
  if (el.type === "locator" || el.type === "null_object") {
    // Just placeholders — render nothing but keep the position
    const o = new THREE.Object3D();
    if (el.position) o.position.set(...el.position);
    return o;
  }
  if (el.type && el.type !== "cube") return null; // ignore mesh/etc for now

  return buildCubeFromBB(el, texW, texH, materials);
}

/**
 * Build a single cube using the .bbmodel `faces` dict, which carries
 * already-computed pixel rects per face.
 *
 * `from` and `to` are corner coordinates in MODEL space (not centered).
 * The cube center is (from + to)/2. Inflate enlarges every face by N
 * units; UVs stay mapped on the un-inflated size.
 *
 * Per-cube rotation is around `origin` (which is the rotation pivot in
 * bbmodel, NOT to be confused with bone.origin which is world-space).
 */
function buildCubeFromBB(el, texW, texH, materials) {
  const from = el.from;
  const to = el.to;
  const inflate = el.inflate || 0;

  const sx = to[0] - from[0];
  const sy = to[1] - from[1];
  const sz = to[2] - from[2];

  const ix = sx + 2 * inflate;
  const iy = sy + 2 * inflate;
  const iz = sz + 2 * inflate;

  // Detect flat (decal) cubes — one axis with size 0
  const isFlat = sx === 0 || sy === 0 || sz === 0;

  let geom;
  if (isFlat) {
    // PlaneGeometry on the missing axis. Apply face UV later.
    if (sz === 0) geom = new THREE.PlaneGeometry(sx || ix, sy || iy);
    else if (sx === 0) {
      geom = new THREE.PlaneGeometry(sz || iz, sy || iy);
      geom.rotateY(Math.PI / 2);
    } else {
      geom = new THREE.PlaneGeometry(sx || ix, sz || iz);
      geom.rotateX(-Math.PI / 2);
    }
  } else {
    geom = new THREE.BoxGeometry(ix, iy, iz);
  }

  applyFaceUVs(geom, el.faces, texW, texH, isFlat, sz === 0 ? "z" : sx === 0 ? "x" : "y");

  // Pick material — flat decal uses transparent variant, otherwise opaque
  const mat = isFlat ? materials.decal : (inflate > 0 ? materials.outer : materials.inner);

  const mesh = new THREE.Mesh(geom, mat);
  mesh.castShadow = !isFlat;
  mesh.receiveShadow = !isFlat;
  // Center of the cube in world space
  mesh.position.set(
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2,
    (from[2] + to[2]) / 2,
  );

  // Per-cube rotation around `origin` (the rotation pivot for this element)
  if (el.rotation && el.origin) {
    const [rx, ry, rz] = el.rotation;
    const [px, py, pz] = el.origin;
    if (rx !== 0 || ry !== 0 || rz !== 0) {
      const pivot = new THREE.Group();
      pivot.position.set(px, py, pz);
      pivot.rotation.set(
        THREE.MathUtils.degToRad(rx),
        THREE.MathUtils.degToRad(ry),
        THREE.MathUtils.degToRad(rz),
      );
      mesh.position.x -= px;
      mesh.position.y -= py;
      mesh.position.z -= pz;
      pivot.add(mesh);
      return pivot;
    }
  }
  return mesh;
}

/**
 * Apply the .bbmodel per-face UVs directly. Each face has a pixel rect
 * `[u0, v0, u1, v1]` already computed by Blockbench (with all the cross-
 * unwrap edge cases already baked in).
 */
function applyFaceUVs(geom, faces, texW, texH, isFlat, normalAxis) {
  if (!faces) return;
  const attr = geom.attributes.uv;
  // BoxGeometry face order: +X, -X, +Y, -Y, +Z, -Z
  // → Bedrock names: east, west, up, down, south, north
  const FACE_NAMES = ["east", "west", "up", "down", "south", "north"];

  if (isFlat) {
    // PlaneGeometry has only ONE face. Pick the right one based on the
    // missing axis: sz=0 → south or north visible from camera (-Z).
    const face = faces.north || faces.south || faces.up || faces.down || faces.east || faces.west;
    if (!face || !face.uv) return;
    setRect(attr, 0, face.uv, texW, texH);
    return;
  }

  for (let i = 0; i < 6; i++) {
    const f = faces[FACE_NAMES[i]];
    if (!f || !f.uv) {
      // Face culled (no texture) — collapse its UVs to a single texel
      attr.setXY(i * 4 + 0, 0, 0);
      attr.setXY(i * 4 + 1, 0, 0);
      attr.setXY(i * 4 + 2, 0, 0);
      attr.setXY(i * 4 + 3, 0, 0);
      continue;
    }
    setRect(attr, i, f.uv, texW, texH);
  }
  attr.needsUpdate = true;
}

function setRect(attr, faceIdx, uv, texW, texH) {
  // uv is [u0, v0, u1, v1] in pixel coordinates (Blockbench / Bedrock space:
  // origin at top-left of texture, V grows downward).
  // Three.js UV space has origin at bottom-left → invert V.
  const [u0, v0, u1, v1] = uv;
  const U0 = u0 / texW;
  const U1 = u1 / texW;
  const V0 = 1 - v0 / texH;
  const V1 = 1 - v1 / texH;
  // BoxGeometry & PlaneGeometry vertex order per face: TL, TR, BL, BR
  attr.setXY(faceIdx * 4 + 0, U0, V0);
  attr.setXY(faceIdx * 4 + 1, U1, V0);
  attr.setXY(faceIdx * 4 + 2, U0, V1);
  attr.setXY(faceIdx * 4 + 3, U1, V1);
}

/**
 * Return the texture name (without ".png") at the given index.
 */
export function getTextureName(model, idx) {
  const t = model.textures[idx];
  if (!t) return null;
  return (t.name || "").replace(/\.png$/i, "");
}

/**
 * Return the data URL of the texture at the given index.
 */
export function getTextureDataURL(model, idx) {
  const t = model.textures[idx];
  return t ? t.source : null;
}

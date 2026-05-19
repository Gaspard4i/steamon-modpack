import * as THREE from "three";

/**
 * Bedrock .geo.json → THREE.Group, using Blockbench's EXACT box-UV algorithm
 * (sourced from `js/outliner/types/cube.js::updateUV` in JannisX11/blockbench
 * master, around line 1285).
 *
 * Face/order convention (Canvas.face_order in Blockbench canvas.js line 357):
 *   three.js BoxGeometry face index → Bedrock face name
 *   0 (+X) → east
 *   1 (-X) → west
 *   2 (+Y) → up
 *   3 (-Y) → down
 *   4 (+Z) → south
 *   5 (-Z) → north
 *
 * Box-UV unwrap (with cube size = [sx, sy, sz]) — note that some sizes are
 * NEGATIVE on purpose (this is how Blockbench flips the up/down faces):
 *
 *   east : from=[0,         sz],   size=[ sz,  sy]
 *   west : from=[sz+sx,     sz],   size=[ sz,  sy]
 *   up   : from=[sz+sx,     sz],   size=[-sx, -sz]   <-- both negative
 *   down : from=[sz+sx*2,   0],    size=[-sx,  sz]   <-- x negative only
 *   south: from=[sz*2+sx,   sz],   size=[ sx,  sy]
 *   north: from=[sz,        sz],   size=[ sx,  sy]
 *
 * Per-face vertex UV slot order in BoxGeometry (slot index → corner):
 *   slot 0 = uv[0], uv[1]   (TL of pixel rect)
 *   slot 1 = uv[2], uv[1]   (TR)
 *   slot 2 = uv[0], uv[3]   (BL)
 *   slot 3 = uv[2], uv[3]   (BR)
 * where pixel rect is [from.x, from.y, from.x+size.x, from.y+size.y].
 *
 * Conversion to three's UV (origin at bottom-left, 0..1):
 *   u_three = uv_x / texW
 *   v_three = 1 - uv_y / texH      (since Blockbench multiplies stretch by -1)
 */

const BB_FACE_ORDER = ["east", "west", "up", "down", "south", "north"];

export function buildBedrockModel(geo, { innerMat, outerMat }) {
  const desc = geo.description || {};
  const texW = desc.texture_width || 64;
  const texH = desc.texture_height || 32;

  // Build one Group per bone at its world-space pivot
  const bones = {};
  for (const bone of geo.bones || []) {
    const g = new THREE.Group();
    g.name = bone.name;
    g.userData.pivot = bone.pivot || [0, 0, 0];
    g.userData.parent = bone.parent || null;
    g.position.set(...g.userData.pivot);
    if (bone.rotation) {
      g.rotation.set(
        THREE.MathUtils.degToRad(bone.rotation[0]),
        THREE.MathUtils.degToRad(bone.rotation[1]),
        THREE.MathUtils.degToRad(bone.rotation[2]),
      );
    }
    bones[bone.name] = g;

    // In Cobblemon's .geo.json, when two cubes in the same bone share the
    // same origin+size, one with inflate (outer shell at uv = [*, 20]) and
    // one without (base cube at uv = [*, 0]), the BASE cube is the normal
    // visual and the inflate shell is a "glow/aura" overlay used during the
    // capture animation. For a still render we want only the base cube.
    // So drop any cube that has inflate>0 if a non-inflate twin exists.
    const cubes = bone.cubes || [];
    const skipIdx = new Set();
    for (let i = 0; i < cubes.length; i++) {
      const a = cubes[i];
      if (!(a.inflate && a.inflate > 0)) continue; // a is the outer — look for a base twin
      for (let j = 0; j < cubes.length; j++) {
        if (i === j) continue;
        const b = cubes[j];
        if (b.inflate && b.inflate > 0) continue;
        if (sameVec3(a.origin, b.origin) && sameVec3(a.size, b.size)) {
          skipIdx.add(i);
          break;
        }
      }
    }

    for (let i = 0; i < cubes.length; i++) {
      if (skipIdx.has(i)) continue;
      const cube = cubes[i];
      const isOuter = cube.inflate && cube.inflate > 0;
      // A "decal" cube has size with a zero axis (e.g. the pokeball's flat
      // button at sz=0). Render it as a thin plane, not a degenerate box.
      const isDecal = cube.size.some(s => s === 0);
      const mat = isOuter ? outerMat : innerMat;
      const obj = isDecal
        ? makeDecal(cube, texW, texH, mat)
        : makeCube(cube, texW, texH, mat);
      obj.position.x -= g.userData.pivot[0];
      obj.position.y -= g.userData.pivot[1];
      obj.position.z -= g.userData.pivot[2];
      g.add(obj);
    }
  }

  // Wire up parent/child bones, converting positions to parent-local
  const root = new THREE.Group();
  for (const name in bones) {
    const g = bones[name];
    const pname = g.userData.parent;
    if (pname && bones[pname]) {
      const p = bones[pname];
      g.position.set(
        g.userData.pivot[0] - p.userData.pivot[0],
        g.userData.pivot[1] - p.userData.pivot[1],
        g.userData.pivot[2] - p.userData.pivot[2],
      );
      p.add(g);
    } else {
      root.add(g);
    }
  }
  return root;
}

function sameVec3(a, b) {
  return a && b && a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

/**
 * Bedrock allows cubes with size[k] === 0 — these are flat "decal" quads
 * (e.g. the pokeball's front button). We build a thin PlaneGeometry on the
 * appropriate axis and apply UVs from the matching face of the box unwrap.
 */
function makeDecal(cube, texW, texH, material) {
  const [ox, oy, oz] = cube.origin;
  const [sx, sy, sz] = cube.size;
  let normalAxis = sz === 0 ? "z" : sx === 0 ? "x" : "y";
  let plane;
  if (normalAxis === "z") {
    plane = new THREE.PlaneGeometry(sx, sy);
  } else if (normalAxis === "x") {
    plane = new THREE.PlaneGeometry(sz, sy);
    plane.rotateY(Math.PI / 2);
  } else {
    plane = new THREE.PlaneGeometry(sx, sz);
    plane.rotateX(-Math.PI / 2);
  }

  // For the north face (player-facing) of a flat cube with sz=0, Blockbench's
  // box-UV unwrap reduces to: north rect at (uOff+sz, vOff+sz) of size (sx, sy)
  // = (uOff, vOff) of size (sx, sy). Use that directly.
  if (Array.isArray(cube.uv)) {
    const [u, v] = cube.uv;
    const w = normalAxis === "z" ? sx : normalAxis === "x" ? sz : sx;
    const h = normalAxis === "z" ? sy : normalAxis === "x" ? sy : sz;
    const attr = plane.attributes.uv;
    const U0 = u / texW;
    const U1 = (u + w) / texW;
    const V0 = 1 - v / texH;
    const V1 = 1 - (v + h) / texH;
    // PlaneGeometry vertex order: TL, TR, BL, BR (same convention)
    attr.setXY(0, U0, V0);
    attr.setXY(1, U1, V0);
    attr.setXY(2, U0, V1);
    attr.setXY(3, U1, V1);
    attr.needsUpdate = true;
  }

  // Use a distinct material instance so the decal can have its own depth
  // bias and double-sided rendering without affecting the box materials.
  // Decal needs `transparent: true` to honor texture alpha (the button's
  // background pixels are alpha=0); FrontSide alone would cull the side
  // facing the camera depending on the cube's normal axis sign.
  const decalMat = material.clone();
  decalMat.transparent = true;
  decalMat.alphaTest = 0.05;
  decalMat.side = THREE.DoubleSide;
  decalMat.polygonOffset = true;
  decalMat.polygonOffsetFactor = -2;
  decalMat.polygonOffsetUnits = -2;
  decalMat.depthWrite = false; // avoid the decal occluding the cube behind it

  const mesh = new THREE.Mesh(plane, decalMat);
  mesh.castShadow = true;
  mesh.receiveShadow = false;
  mesh.position.set(ox + sx / 2, oy + sy / 2, oz + sz / 2);
  mesh.renderOrder = 2;
  return mesh;
}

function makeCube(cube, texW, texH, material) {
  const [ox, oy, oz] = cube.origin;
  const [sx, sy, sz] = cube.size;
  const inflate = cube.inflate || 0;

  // BoxGeometry is centered, so its world position must be origin + size/2.
  // Inflate spreads equally in every direction → center unchanged.
  const geom = new THREE.BoxGeometry(
    sx + 2 * inflate,
    sy + 2 * inflate,
    sz + 2 * inflate,
  );

  if (Array.isArray(cube.uv)) {
    applyBoxUV(geom, sx, sy, sz, cube.uv[0], cube.uv[1], texW, texH, cube.mirror === true);
  } else if (cube.uv && typeof cube.uv === "object") {
    applyPerFaceUV(geom, cube.uv, texW, texH);
  }

  const mesh = new THREE.Mesh(geom, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(ox + sx / 2, oy + sy / 2, oz + sz / 2);

  if (cube.rotation && cube.pivot) {
    const [rx, ry, rz] = cube.rotation;
    const [px, py, pz] = cube.pivot;
    const pivotNode = new THREE.Group();
    pivotNode.position.set(px, py, pz);
    pivotNode.rotation.set(
      THREE.MathUtils.degToRad(rx),
      THREE.MathUtils.degToRad(ry),
      THREE.MathUtils.degToRad(rz),
    );
    mesh.position.x -= px;
    mesh.position.y -= py;
    mesh.position.z -= pz;
    pivotNode.add(mesh);
    return pivotNode;
  }
  return mesh;
}

/**
 * Box-UV unwrap matching Blockbench `updateUV` exactly.
 * Returns per-face pixel rects, then converts to three UV space.
 */
function applyBoxUV(geom, sx, sy, sz, uOff, vOff, texW, texH, mirror) {
  // size negatives are intentional — they flip the texture sample on those axes
  let face_list = [
    { face: "east",  from: [0,            sz], size: [ sz,  sy] },
    { face: "west",  from: [sz + sx,      sz], size: [ sz,  sy] },
    { face: "up",    from: [sz + sx,      sz], size: [-sx, -sz] },
    { face: "down",  from: [sz + sx * 2,  0],  size: [-sx,  sz] },
    { face: "south", from: [sz * 2 + sx,  sz], size: [ sx,  sy] },
    { face: "north", from: [sz,           sz], size: [ sx,  sy] },
  ];

  if (mirror) {
    // Per Blockbench: shift from.x by size.x then negate size.x, then swap east↔west
    for (const f of face_list) {
      f.from[0] += f.size[0];
      f.size[0] *= -1;
    }
    const tmp = face_list[0];
    face_list[0] = face_list[1];
    face_list[1] = tmp;
  }

  const attr = geom.attributes.uv;
  // BB_FACE_ORDER maps three.js face index (0..5) → bedrock face name
  for (let i = 0; i < 6; i++) {
    const fname = BB_FACE_ORDER[i];
    const f = face_list.find(x => x.face === fname);
    // Exact transcription of Blockbench's `Cube.updateUV`:
    //   uv = [from.x, from.y, from.x+size.x, from.y+size.y] + uv_offset
    //   stretch = -1
    //   arr[k] = [uv[U]/pw, (uv[V]/ph)/stretch + 1]
    //          = [uv[U]/pw, 1 - uv[V]/ph]
    // where U,V are 0/2 or 1/3 depending on the slot (TL,TR,BL,BR).
    const uv = [
      f.from[0]             + uOff,  // uv[0]
      f.from[1]             + vOff,  // uv[1]
      f.from[0] + f.size[0] + uOff,  // uv[2]
      f.from[1] + f.size[1] + vOff,  // uv[3]
    ];
    // BoxGeometry per-face vertex order: slot 0=TL, 1=TR, 2=BL, 3=BR
    // BUT for faces with negative size (up, down in BB box-uv), the texture
    // is read "backwards", which automatically flips the sampling — we just
    // feed the raw values straight in.
    attr.setXY(i * 4 + 0, uv[0] / texW, 1 - uv[1] / texH);
    attr.setXY(i * 4 + 1, uv[2] / texW, 1 - uv[1] / texH);
    attr.setXY(i * 4 + 2, uv[0] / texW, 1 - uv[3] / texH);
    attr.setXY(i * 4 + 3, uv[2] / texW, 1 - uv[3] / texH);
  }
  attr.needsUpdate = true;
}

function applyPerFaceUV(geom, uvMap, texW, texH) {
  const attr = geom.attributes.uv;
  for (let i = 0; i < 6; i++) {
    const fname = BB_FACE_ORDER[i];
    const face = uvMap[fname];
    if (!face) continue;
    const [u, v] = face.uv;
    const [w, h] = face.uv_size || [0, 0];
    const U0 = u / texW;
    const U1 = (u + w) / texW;
    const V0 = 1 - v / texH;
    const V1 = 1 - (v + h) / texH;
    attr.setXY(i * 4 + 0, U0, V0);
    attr.setXY(i * 4 + 1, U1, V0);
    attr.setXY(i * 4 + 2, U0, V1);
    attr.setXY(i * 4 + 3, U1, V1);
  }
  attr.needsUpdate = true;
}

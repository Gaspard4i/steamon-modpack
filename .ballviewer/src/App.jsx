import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, TrackballControls, TransformControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { parseBBModel, getTextureDataURL, getTextureName, extractBoneTree } from "./bbmodel.js";
import { parseJavaModel, loadJavaTextures } from "./javamodel.js";

function useJSON(url) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let cancelled = false;
    fetch(url).then(r => r.json()).then(d => { if (!cancelled) setData(d); });
    return () => { cancelled = true; };
  }, [url]);
  return data;
}

function useTexture(dataURL) {
  const [tex, setTex] = useState(null);
  useEffect(() => {
    if (!dataURL) { setTex(null); return; }
    let cancelled = false;
    new THREE.TextureLoader().load(dataURL, t => {
      if (cancelled) return;
      t.magFilter = THREE.NearestFilter;
      t.minFilter = THREE.NearestFilter;
      t.colorSpace = THREE.SRGBColorSpace;
      t.generateMipmaps = false;
      setTex(t);
    });
    return () => { cancelled = true; };
  }, [dataURL]);
  return tex;
}

// ── Pokeball (.bbmodel) ──────────────────────────────────────────────────────

function Pokeball({ model, textureIndex, gloss, envOn, rot }) {
  const tex = useTexture(model ? getTextureDataURL(model, textureIndex) : null);
  const ref = useRef();
  useEffect(() => {
    if (!ref.current || !rot) return;
    ref.current.rotation.set(
      THREE.MathUtils.degToRad(rot.x),
      THREE.MathUtils.degToRad(rot.y),
      THREE.MathUtils.degToRad(rot.z),
    );
  }, [rot]);

  const built = useMemo(() => {
    if (!model || !tex) return null;
    const mk = (extra) => new THREE.MeshStandardMaterial({
      map: tex,
      transparent: false,
      alphaTest: 0.05,
      side: THREE.FrontSide,
      metalness: gloss ? extra.metalness : 0,
      roughness: gloss ? extra.roughness : 0.95,
      envMapIntensity: (gloss && envOn) ? extra.envMapIntensity : 0,
    });
    const inner = mk({ metalness: 0.1, roughness: 0.5, envMapIntensity: 0.85 });
    const outer = mk({ metalness: 0.2, roughness: 0.32, envMapIntensity: 1.0 });
    const decal = new THREE.MeshStandardMaterial({
      map: tex, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide,
      metalness: gloss ? 0.1 : 0,
      roughness: gloss ? 0.45 : 0.9,
      envMapIntensity: (gloss && envOn) ? 0.85 : 0,
      depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    });
    const root = parseBBModel(model, { textureIndex, materials: { inner, outer, decal } });
    const box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());
    const wrap = new THREE.Group();
    root.position.set(-center.x, -box.min.y, -center.z);
    wrap.add(root);
    return wrap;
  }, [model, tex, textureIndex, gloss, envOn]);

  return built ? <primitive ref={ref} object={built} /> : null;
}

// ── Articulated Pokemon model (.bbmodel with bone hierarchy) ────────────────

const Articulated = React.forwardRef(function Articulated(
  { model, textureIndex, gloss, envOn, rot, onBonesReady, onBoneClick },
  forwardedRef,
) {
  const tex = useTexture(model ? getTextureDataURL(model, textureIndex) : null);
  const ref = useRef();
  // Expose the inner ref to the parent
  useEffect(() => {
    if (typeof forwardedRef === "function") forwardedRef(ref.current);
    else if (forwardedRef) forwardedRef.current = ref.current;
  }, [forwardedRef]);

  const built = useMemo(() => {
    if (!model || !tex) return null;
    const mk = (extra) => new THREE.MeshStandardMaterial({
      map: tex, transparent: true, alphaTest: 0.05, side: THREE.FrontSide,
      metalness: gloss ? extra.metalness : 0,
      roughness: gloss ? extra.roughness : 0.95,
      envMapIntensity: (gloss && envOn) ? extra.envMapIntensity : 0,
    });
    const inner = mk({ metalness: 0.05, roughness: 0.6, envMapIntensity: 0.6 });
    const outer = mk({ metalness: 0.1, roughness: 0.45, envMapIntensity: 0.85 });
    const decal = new THREE.MeshStandardMaterial({
      map: tex, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide,
      metalness: 0, roughness: 0.8, envMapIntensity: 0,
      depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    });
    const root = parseBBModel(model, { textureIndex, materials: { inner, outer, decal } });
    const bones = root.userData.bones || {};
    // Compute bbox from MESHES only — locators (Object3D with no geometry)
    // can sit far from the body and would skew Box3.setFromObject's result.
    const box = new THREE.Box3();
    const tmp = new THREE.Box3();
    root.updateMatrixWorld(true);
    root.traverse((obj) => {
      if (obj.isMesh && obj.geometry) {
        if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
        tmp.copy(obj.geometry.boundingBox).applyMatrix4(obj.matrixWorld);
        box.union(tmp);
      }
    });
    if (box.isEmpty()) box.setFromObject(root); // fallback
    const center = box.getCenter(new THREE.Vector3());
    const wrap = new THREE.Group();
    root.position.set(-center.x, -box.min.y, -center.z);
    wrap.add(root);
    wrap.userData.bones = bones;
    wrap.userData.bbox = { size: box.getSize(new THREE.Vector3()), center };
    return wrap;
  }, [model, tex, textureIndex, gloss, envOn]);

  // Notify the parent once the model is built. Done in an effect so we
  // don't call setState during a parent render (React would silently drop
  // the update and the BoneList would stay empty forever).
  useEffect(() => {
    if (built && onBonesReady) {
      onBonesReady(built.userData.bones || {});
    }
  }, [built, onBonesReady]);

  // Whole-model rotation
  useEffect(() => {
    if (!ref.current || !rot) return;
    ref.current.rotation.set(
      THREE.MathUtils.degToRad(rot.x),
      THREE.MathUtils.degToRad(rot.y),
      THREE.MathUtils.degToRad(rot.z),
    );
  }, [rot]);

  // Click-to-select on mesh → find the closest ancestor bone group
  const handleClick = (e) => {
    if (!onBoneClick) return;
    e.stopPropagation();
    let cur = e.object;
    while (cur) {
      if (cur.userData?.isBone) {
        onBoneClick(cur);
        return;
      }
      cur = cur.parent;
    }
  };

  return built ? <primitive ref={ref} object={built} onClick={handleClick} /> : null;
});

// ── Java model (Create cog, wrench) ──────────────────────────────────────────

const CREATE_TEXTURE_MAP = {
  "create:block/cogwheel_axis":      "/create_tex/cogwheel_axis.png",
  "create:block/axis_top":           "/create_tex/axis_top.png",
  "create:block/large_cogwheel":     "/create_tex/large_cogwheel.png",
  "block/stripped_spruce_log":       "/create_tex/stripped_spruce_log.png",
  "create:item/wrench":              "/create_tex/wrench.png",
};
const resolveCreateAsset = (ref) => CREATE_TEXTURE_MAP[ref] || null;

function JavaModel({ url, rot }) {
  const model = useJSON(url);
  const [built, setBuilt] = useState(null);
  const ref = useRef();

  useEffect(() => {
    if (!model) { setBuilt(null); return; }
    let cancelled = false;
    (async () => {
      const tex = await loadJavaTextures(model.textures || {}, resolveCreateAsset);
      if (cancelled) return;
      const obj = parseJavaModel(model, tex);
      setBuilt(obj);
    })();
    return () => { cancelled = true; };
  }, [model]);

  useEffect(() => {
    if (!ref.current || !rot) return;
    ref.current.rotation.set(
      THREE.MathUtils.degToRad(rot.x),
      THREE.MathUtils.degToRad(rot.y),
      THREE.MathUtils.degToRad(rot.z),
    );
  }, [rot, built]);

  return built ? <primitive ref={ref} object={built} /> : null;
}

// ── Top-level UI ─────────────────────────────────────────────────────────────

function CaptureBridge({ canvasRef }) {
  const { gl } = useThree();
  useEffect(() => { if (canvasRef) canvasRef.current = gl.domElement; }, [gl, canvasRef]);
  return null;
}

const ANCIENT_KEYS = new Set([
  "ancient_poke_ball","ancient_great_ball","ancient_ultra_ball","ancient_heavy_ball",
  "ancient_feather_ball","ancient_gigaton_ball","ancient_ivory_ball","ancient_jet_ball",
  "ancient_leaden_ball","ancient_origin_ball","ancient_wing_ball","ancient_azure_ball",
  "ancient_citrine_ball","ancient_roseate_ball","ancient_slate_ball","ancient_verdant_ball",
]);

const SUBJECTS = [
  { id: "ball",     label: "Pokeball" },
  { id: "cog",      label: "Large cog (Create)" },
  { id: "wrench",   label: "Wrench (Create)" },
  { id: "golett",   label: "Golett" },
  { id: "appletun", label: "Appletun" },
  { id: "flapple",  label: "Flapple" },
];

// For each articulated subject: { url, textureMap: {variantKey: idx} }
const POKEMON_CONFIGS = {
  golett:   { url: "/golett.bbmodel",   variants: { normal: 0, shiny: 2 } },
  appletun: { url: "/appletun.bbmodel", variants: { normal: 0, shiny: 1 } },
  flapple:  { url: "/flapple.bbmodel",  variants: { normal: 0, shiny: 1 } },
};

const ENV_PRESETS = ["apartment", "city", "dawn", "forest", "lobby", "night", "park", "studio", "sunset", "warehouse"];

export default function App() {
  const standardModel = useJSON("/poke_ball.bbmodel");
  const ancientModel = useJSON("/ancient_poke_ball.bbmodel");
  const golettModel = useJSON("/golett.bbmodel");
  const appletunModel = useJSON("/appletun.bbmodel");
  const flappleModel = useJSON("/flapple.bbmodel");
  const [subject, setSubject] = useState("ball");
  const [shinyVariants, setShinyVariants] = useState({});
  // Tracks the currently selected bone (a THREE.Group) for gizmo control.
  const [selectedBone, setSelectedBone] = useState(null);
  const [gizmoMode, setGizmoMode] = useState("rotate"); // rotate | translate
  // Map of bone name → its THREE.Group. Stored in state (not a ref) so the
  // BoneList re-renders the moment the model finishes loading.
  const [boneMap, setBoneMap] = useState({});
  // Bone tree extracted from the active bbmodel for the side panel
  const [boneTree, setBoneTree] = useState([]);
  // Force-update tick when the gizmo modifies a bone (so the bone list
  // re-reads the new rotation values)
  const [, forceTick] = useState(0);
  const onGizmoChange = () => forceTick(t => t + 1);

  const isShiny = !!shinyVariants[subject];
  const setShinyFor = (s, val) => setShinyVariants(prev => ({ ...prev, [s]: val }));

  const handleBonesReady = (bones) => {
    setBoneMap(bones);
  };
  const handleBoneClick = (bone) => {
    setSelectedBone(bone);
  };
  // When the gizmo is being dragged, disable orbit/trackball so the drag
  // doesn't also rotate the camera.
  const cameraControlsRef = useRef();
  const onGizmoDraggingChanged = (e) => {
    const ctrl = cameraControlsRef.current;
    if (ctrl) ctrl.enabled = !e.value;
  };
  const selectBoneByName = (name) => {
    const b = boneMap[name];
    if (b) setSelectedBone(b);
  };
  const resetSelectedBone = () => {
    if (!selectedBone) return;
    selectedBone.rotation.set(0, 0, 0);
    selectedBone.position.x = selectedBone.userData.restPos?.x ?? selectedBone.position.x;
    forceTick(t => t + 1);
  };
  const resetAllBones = () => {
    for (const name in boneMap) {
      const b = boneMap[name];
      if (b) b.rotation.set(0, 0, 0);
    }
    forceTick(t => t + 1);
  };

  // Esc deselects the active bone (no gizmo)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setSelectedBone(null);
      else if (e.key === "r" && e.target.tagName !== "INPUT") setGizmoMode("rotate");
      else if (e.key === "g" && e.target.tagName !== "INPUT") setGizmoMode("translate");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Clear selection when subject changes (avoids gizmo pointing at a
  // disposed bone)
  useEffect(() => {
    setSelectedBone(null);
    setBoneMap({});
  }, [subject]);
  const [selectedKey, setSelectedKey] = useState("poke_ball");
  const canvasRef = useRef(null);

  // ── Manual rotation (sliders + free-rotate controls) ────────────────────
  const [rot, setRot] = useState({ x: 0, y: 0, z: 0 });
  const [controlsMode, setControlsMode] = useState("trackball"); // "trackball" | "orbit"
  const resetRotation = () => setRot({ x: 0, y: 0, z: 0 });

  // ── Render controls ─────────────────────────────────────────────────────
  const [shadowOn, setShadowOn]       = useState(true);
  const [shadowOpacity, setShadowOp]  = useState(0.45);
  const [shadowBlur, setShadowBlur]   = useState(2.8);
  const [keyIntensity, setKeyInt]     = useState(1.8);
  const [fillIntensity, setFillInt]   = useState(0.5);
  const [rimIntensity, setRimInt]     = useState(0.6);
  const [ambIntensity, setAmbInt]     = useState(0.28);
  const [envOn, setEnvOn]             = useState(true);
  const [envPreset, setEnvPreset]     = useState("apartment");
  const [gloss, setGloss]             = useState(true);
  const [gridBg, setGridBg]           = useState(true);

  const isAncient = ANCIENT_KEYS.has(selectedKey);
  const activeModel = isAncient ? ancientModel : standardModel;
  const textureList = useMemo(() => {
    if (!activeModel) return [];
    return activeModel.textures.map((t, i) => ({
      idx: i, key: getTextureName(activeModel, i), dataURL: t.source,
    }));
  }, [activeModel]);
  const textureIndex = useMemo(() => {
    const found = textureList.findIndex(t => t.key === selectedKey);
    return found >= 0 ? found : 0;
  }, [textureList, selectedKey]);
  useEffect(() => {
    if (!activeModel || textureList.length === 0 || subject !== "ball") return;
    if (!textureList.some(t => t.key === selectedKey)) {
      setSelectedKey(textureList[0].key);
    }
  }, [activeModel, textureList, selectedKey, subject]);

  const download = () => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const name =
      subject === "ball"   ? `${selectedKey}_3d.png` :
      subject === "cog"    ? "large_cogwheel_3d.png" :
      subject === "wrench" ? "wrench_3d.png" :
      POKEMON_CONFIGS[subject] ? `${subject}${isShiny ? "_shiny" : ""}_3d.png` :
      "model_3d.png";
    const link = document.createElement("a");
    link.download = name;
    link.href = cvs.toDataURL("image/png");
    link.click();
  };

  const cam = subject === "ball"
    ? { pos: [22, 18, 22], zoom: 28, target: [0, 4, 0] }
    : subject === "cog"
    ? { pos: [30, 26, 30], zoom: 14, target: [0, 8, 0] }
    : subject === "golett"
    ? { pos: [30, 22, 30], zoom: 18, target: [0, 6, 0] }
    : subject === "appletun"
    ? { pos: [30, 22, 30], zoom: 16, target: [0, 5, 0] }
    : subject === "flapple"
    ? { pos: [30, 18, 30], zoom: 26, target: [0, 4, 0] }
    : { pos: [22, 18, 22], zoom: 22, target: [0, 8, 0] };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "300px 1fr 280px",
      height: "100vh",
      color: "#e6e6e6",
      fontFamily: "system-ui, sans-serif",
      background: "#1a1d24",
    }}>
      {/* LEFT: subject + ball picker */}
      <aside style={{
        background: "#14171d",
        borderRight: "1px solid #2a2f3a",
        overflowY: "auto",
        padding: 12,
      }}>
        <SectionTitle>Subject</SectionTitle>
        <div style={{ display: "grid", gap: 4 }}>
          {SUBJECTS.map(s => (
            <button
              key={s.id}
              onClick={() => setSubject(s.id)}
              style={pickerBtn(subject === s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        {subject === "ball" && (
          <>
            <SectionTitle style={{ marginTop: 16 }}>Standard balls</SectionTitle>
            <Grid model={standardModel} active={selectedKey} onPick={setSelectedKey} ancient={false} />
            <SectionTitle style={{ marginTop: 16 }}>Ancient (Hisuian) balls</SectionTitle>
            <Grid model={ancientModel} active={selectedKey} onPick={setSelectedKey} ancient={true} />
          </>
        )}
      </aside>

      {/* CENTER: viewer */}
      <main style={{
        display: "flex", flexDirection: "column",
        padding: 16, gap: 12, alignItems: "center",
      }}>
        <div style={{
          width: 1024, height: 800,
          maxWidth: "100%", maxHeight: "calc(100vh - 160px)",
          background: gridBg
            ? "repeating-conic-gradient(#23262e 0% 25%, #1c1f25 25% 50%) 0 0 / 32px 32px"
            : "transparent",
          borderRadius: 8, overflow: "hidden",
        }}>
          <Canvas
            key={subject}
            orthographic
            camera={{ position: cam.pos, zoom: cam.zoom, near: 0.1, far: 400 }}
            shadows
            gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0);
              gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
              gl.outputColorSpace = THREE.SRGBColorSpace;
              gl.toneMapping = THREE.NeutralToneMapping;
              gl.toneMappingExposure = 1.0;
            }}
          >
            <CaptureBridge canvasRef={canvasRef} />
            <ambientLight intensity={ambIntensity} />
            <directionalLight
              position={[10, 18, 12]}
              intensity={keyIntensity}
              castShadow={shadowOn}
              shadow-mapSize={[2048, 2048]}
              shadow-camera-left={-25} shadow-camera-right={25}
              shadow-camera-top={25} shadow-camera-bottom={-25}
              shadow-camera-near={0.1} shadow-camera-far={120}
              shadow-bias={-0.0003} shadow-normalBias={0.05} shadow-radius={6}
            />
            <directionalLight position={[-12, 5, -8]} intensity={fillIntensity} color="#b6c8ff" />
            <directionalLight position={[-4, 8, -14]} intensity={rimIntensity} color="#ffe6c2" />
            {envOn && <Environment preset={envPreset} background={false} />}

            {subject === "ball" && activeModel && (
              <Pokeball model={activeModel} textureIndex={textureIndex} gloss={gloss} envOn={envOn} rot={rot} />
            )}
            {subject === "cog" && <JavaModel url="/large_cogwheel.model.json" rot={rot} />}
            {subject === "wrench" && <JavaModel url="/wrench.model.json" rot={rot} />}
            {subject === "golett" && golettModel && (
              <Articulated
                model={golettModel}
                textureIndex={POKEMON_CONFIGS.golett.variants[isShiny ? "shiny" : "normal"]}
                gloss={gloss} envOn={envOn} rot={rot}
                onBonesReady={handleBonesReady}
                onBoneClick={handleBoneClick}
              />
            )}
            {subject === "appletun" && appletunModel && (
              <Articulated
                model={appletunModel}
                textureIndex={POKEMON_CONFIGS.appletun.variants[isShiny ? "shiny" : "normal"]}
                gloss={gloss} envOn={envOn} rot={rot}
                onBonesReady={handleBonesReady}
                onBoneClick={handleBoneClick}
              />
            )}
            {subject === "flapple" && flappleModel && (
              <Articulated
                model={flappleModel}
                textureIndex={POKEMON_CONFIGS.flapple.variants[isShiny ? "shiny" : "normal"]}
                gloss={gloss} envOn={envOn} rot={rot}
                onBonesReady={handleBonesReady}
                onBoneClick={handleBoneClick}
              />
            )}
            {selectedBone && (
              <TransformControls
                object={selectedBone}
                mode={gizmoMode}
                size={0.8}
                onObjectChange={onGizmoChange}
                onMouseDown={() => { if (cameraControlsRef.current) cameraControlsRef.current.enabled = false; }}
                onMouseUp={() => { if (cameraControlsRef.current) cameraControlsRef.current.enabled = true; }}
              />
            )}

            {shadowOn && (
              <ContactShadows
                position={[0, 0, 0]}
                opacity={shadowOpacity}
                scale={36}
                blur={shadowBlur}
                far={28}
                resolution={1024}
              />
            )}

            {controlsMode === "trackball" ? (
              <TrackballControls
                ref={cameraControlsRef}
                target={cam.target}
                rotateSpeed={4}
                zoomSpeed={1.6}
                panSpeed={0.8}
                noPan={false}
                staticMoving={true}
                dynamicDampingFactor={0.15}
              />
            ) : (
              <OrbitControls
                ref={cameraControlsRef}
                target={cam.target}
                enablePan
                enableRotate
                enableZoom
                enableDamping
                dampingFactor={0.08}
                rotateSpeed={0.9}
                zoomSpeed={1.2}
                panSpeed={0.8}
                minZoom={3}
                maxZoom={300}
                minPolarAngle={-Infinity}
                maxPolarAngle={Infinity}
                minAzimuthAngle={-Infinity}
                maxAzimuthAngle={Infinity}
                mouseButtons={{
                  LEFT: THREE.MOUSE.ROTATE,
                  MIDDLE: THREE.MOUSE.DOLLY,
                  RIGHT: THREE.MOUSE.PAN,
                }}
                touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
              />
            )}
          </Canvas>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 13 }}>
            Selected: <b>{subject === "ball" ? selectedKey : subject}</b>
          </span>
          <button onClick={download} style={{
            background: "#2d8a4a", color: "#fff", border: 0,
            padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontWeight: 600,
          }}>
            Download transparent PNG
          </button>
          <span style={{ fontSize: 12, opacity: .6 }}>
            Left-drag rotate · right-drag pan · scroll zoom
          </span>
        </div>
      </main>

      {/* RIGHT: render controls */}
      <aside style={{
        background: "#14171d",
        borderLeft: "1px solid #2a2f3a",
        overflowY: "auto",
        padding: 12,
        display: "flex", flexDirection: "column", gap: 14,
      }}>
        {POKEMON_CONFIGS[subject] && (
          <>
            <SectionTitle>Variant</SectionTitle>
            <Toggle label="Shiny" checked={isShiny} onChange={(v) => setShinyFor(subject, v)} />

            <SectionTitle style={{ marginTop: 8 }}>Pose editor</SectionTitle>
            <span style={{ fontSize: 11, opacity: .65 }}>
              Click a body part in the 3D view to select it. Drag the colored
              gizmo rings (R/G/B = X/Y/Z) to rotate. Or pick from the bone list.
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setGizmoMode("rotate")}
                style={pickerBtn(gizmoMode === "rotate")}
              >Rotate</button>
              <button
                onClick={() => setGizmoMode("translate")}
                style={pickerBtn(gizmoMode === "translate")}
              >Translate</button>
            </div>
            <button onClick={() => setSelectedBone(null)} style={pickerBtn(false)}>
              Deselect (esc)
            </button>
            <button onClick={resetSelectedBone} disabled={!selectedBone} style={{
              background: "#3a2d2d", color: "#fff",
              border: "1px solid #5a3838",
              padding: "6px 10px", borderRadius: 6,
              cursor: selectedBone ? "pointer" : "not-allowed",
              fontSize: 12, opacity: selectedBone ? 1 : 0.5,
            }}>Reset selected bone</button>
            <button onClick={resetAllBones} style={{
              background: "#3a2d2d", color: "#fff",
              border: "1px solid #5a3838",
              padding: "6px 10px", borderRadius: 6,
              cursor: "pointer", fontSize: 12,
            }}>Reset all bones</button>

            <SectionTitle style={{ marginTop: 8 }}>Bone list</SectionTitle>
            <BoneList
              bones={boneMap}
              selected={selectedBone}
              onSelect={selectBoneByName}
            />
            <div style={{ height: 12 }} />
          </>
        )}
        <SectionTitle>Pose (rotate the model itself)</SectionTitle>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setControlsMode("trackball")} style={pickerBtn(controlsMode === "trackball")}>Trackball</button>
          <button onClick={() => setControlsMode("orbit")} style={pickerBtn(controlsMode === "orbit")}>Orbit</button>
        </div>
        <span style={{ fontSize: 11, opacity: .55 }}>
          Trackball = free 3-axis rotation (no gimbal lock). Orbit = pivot around target.
        </span>
        <Slider label="Rotation X" min={-180} max={180} step={1} value={rot.x} onChange={v => setRot(r => ({ ...r, x: v }))} suffix="°" />
        <Slider label="Rotation Y" min={-180} max={180} step={1} value={rot.y} onChange={v => setRot(r => ({ ...r, y: v }))} suffix="°" />
        <Slider label="Rotation Z" min={-180} max={180} step={1} value={rot.z} onChange={v => setRot(r => ({ ...r, z: v }))} suffix="°" />
        <button onClick={resetRotation} style={{
          background: "#3a2d2d", color: "#fff", border: "1px solid #5a3838",
          padding: "6px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12,
        }}>Reset rotation</button>

        <SectionTitle style={{ marginTop: 8 }}>Shadow</SectionTitle>
        <Toggle label="Contact shadow" checked={shadowOn} onChange={setShadowOn} />
        <Slider label="Shadow opacity" min={0} max={1} step={0.02} value={shadowOpacity} onChange={setShadowOp} disabled={!shadowOn} />
        <Slider label="Shadow blur" min={0} max={6} step={0.1} value={shadowBlur} onChange={setShadowBlur} disabled={!shadowOn} />

        <SectionTitle style={{ marginTop: 4 }}>Lighting</SectionTitle>
        <Slider label="Key light" min={0} max={4} step={0.05} value={keyIntensity} onChange={setKeyInt} />
        <Slider label="Fill light (cool)" min={0} max={2} step={0.05} value={fillIntensity} onChange={setFillInt} />
        <Slider label="Rim light (warm)" min={0} max={2} step={0.05} value={rimIntensity} onChange={setRimInt} />
        <Slider label="Ambient" min={0} max={1.5} step={0.02} value={ambIntensity} onChange={setAmbInt} />

        <SectionTitle style={{ marginTop: 4 }}>Environment</SectionTitle>
        <Toggle label="Use IBL environment" checked={envOn} onChange={setEnvOn} />
        <div>
          <div style={{ fontSize: 11, opacity: .7, marginBottom: 4 }}>Preset</div>
          <select
            value={envPreset}
            disabled={!envOn}
            onChange={e => setEnvPreset(e.target.value)}
            style={{
              width: "100%", padding: "6px 8px", borderRadius: 6,
              background: "#20242e", color: "#e6e6e6",
              border: "1px solid #2d3340",
            }}
          >
            {ENV_PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <SectionTitle style={{ marginTop: 4 }}>Material</SectionTitle>
        <Toggle label="Glossy (Blockbench-style)" checked={gloss} onChange={setGloss} />
        <span style={{ fontSize: 11, opacity: .55 }}>
          Off = matte Minecraft look. On = soft metallic highlights using the IBL.
        </span>

        <SectionTitle style={{ marginTop: 4 }}>Canvas</SectionTitle>
        <Toggle label="Show checker background" checked={gridBg} onChange={setGridBg} />
        <span style={{ fontSize: 11, opacity: .55 }}>
          Off = transparent. The exported PNG is always transparent regardless.
        </span>
      </aside>
    </div>
  );
}

function Grid({ model, active, onPick, ancient }) {
  if (!model) return <div style={{ fontSize: 12, opacity: .6 }}>Loading…</div>;
  const items = model.textures.map((t, i) => {
    const key = (t.name || "").replace(/\.png$/i, "");
    return { key, idx: i, src: t.source };
  }).filter(item => ancient ? item.key.startsWith("ancient_") : !item.key.startsWith("ancient_"));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
      {items.map(it => (
        <button key={it.key} onClick={() => onPick(it.key)} title={it.key} style={{
          background: active === it.key ? "#1f2e22" : "#20242e",
          border: `1px solid ${active === it.key ? "#3aaa5e" : "#2d3340"}`,
          borderRadius: 6, padding: 6, cursor: "pointer",
          display: "flex", justifyContent: "center", alignItems: "center",
          aspectRatio: "1", color: "#e6e6e6",
        }}>
          <img src={it.src} alt={it.key} style={{
            width: "100%", height: "100%",
            imageRendering: "pixelated", objectFit: "contain",
          }} />
        </button>
      ))}
    </div>
  );
}

// ── small UI atoms ───────────────────────────────────────────────────────────

function SectionTitle({ children, style }) {
  return <h2 style={{
    fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6,
    margin: "8px 0 6px", opacity: .65, ...style,
  }}>{children}</h2>;
}

function Toggle({ label, checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function Slider({ label, min, max, step, value, onChange, disabled, suffix }) {
  const formatted = step >= 1 ? Math.round(value).toString() : value.toFixed(2);
  return (
    <label style={{
      display: "flex", flexDirection: "column", gap: 4,
      fontSize: 12,
      opacity: disabled ? 0.45 : 1,
    }}>
      <span style={{ display: "flex", justifyContent: "space-between" }}>
        <span>{label}</span><b>{formatted}{suffix || ""}</b>
      </span>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        disabled={disabled}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: "100%" }}
      />
    </label>
  );
}

function BoneList({ bones, selected, onSelect }) {
  const names = bones ? Object.keys(bones).sort() : [];
  const selectedName = selected?.userData?.boneName;
  if (names.length === 0) {
    return <div style={{ fontSize: 11, opacity: .6 }}>(no bones — load a Pokemon first)</div>;
  }
  return (
    <div style={{
      maxHeight: 280, overflowY: "auto",
      display: "grid", gap: 2,
      background: "#1c1f27", padding: 6, borderRadius: 6,
      border: "1px solid #2d3340",
    }}>
      {names.map(n => (
        <button
          key={n}
          onClick={() => onSelect(n)}
          style={{
            textAlign: "left",
            background: selectedName === n ? "#1f2e22" : "transparent",
            border: `1px solid ${selectedName === n ? "#3aaa5e" : "transparent"}`,
            borderRadius: 4,
            padding: "4px 8px",
            color: "#e6e6e6",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function BoneControl({ name, value, onChange }) {
  const [open, setOpen] = useState(false);
  const hasValue = (value.x || 0) !== 0 || (value.y || 0) !== 0 || (value.z || 0) !== 0;
  return (
    <div style={{
      border: `1px solid ${hasValue ? "#3aaa5e" : "#2d3340"}`,
      borderRadius: 6,
      padding: "6px 8px",
      background: "#1c1f27",
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%",
          background: "transparent",
          border: 0,
          color: "#e6e6e6",
          padding: 0,
          cursor: "pointer",
          fontSize: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>{name}</span>
        <span style={{ fontSize: 10, opacity: 0.6 }}>
          {hasValue ? `${Math.round(value.x)}° ${Math.round(value.y)}° ${Math.round(value.z)}°` : (open ? "−" : "+")}
        </span>
      </button>
      {open && (
        <div style={{ marginTop: 6, display: "grid", gap: 4 }}>
          <Slider label="X" min={-180} max={180} step={1} value={value.x || 0} onChange={v => onChange("x", v)} suffix="°" />
          <Slider label="Y" min={-180} max={180} step={1} value={value.y || 0} onChange={v => onChange("y", v)} suffix="°" />
          <Slider label="Z" min={-180} max={180} step={1} value={value.z || 0} onChange={v => onChange("z", v)} suffix="°" />
        </div>
      )}
    </div>
  );
}

function pickerBtn(active) {
  return {
    background: active ? "#1f2e22" : "#20242e",
    border: `1px solid ${active ? "#3aaa5e" : "#2d3340"}`,
    borderRadius: 6, padding: "8px 10px", cursor: "pointer",
    color: "#e6e6e6", textAlign: "left", fontSize: 13,
  };
}

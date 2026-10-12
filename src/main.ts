import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { buildRoom, skyTexture, nightSkyTexture } from "./room";
import { buildObjects, type ElementName } from "./objects";
import { buildLights } from "./lighting";
import { buildSlotGrid } from "./slots";
import "./style.css";

const canvas = document.querySelector<HTMLCanvasElement>("#scene")!;
const labelEl = document.querySelector<HTMLDivElement>("#label")!;

// a small in-world popover before leaving the shrine
let navConfirmEl: HTMLDivElement | null = null;
function askNavigate(message: string, url: string): void {
  if (!navConfirmEl) {
    navConfirmEl = document.createElement("div");
    navConfirmEl.style.cssText =
      "position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);background:rgba(28,26,22,0.92);color:#f2efe8;padding:12px 16px;border-radius:12px;font:500 13px/1.4 system-ui,sans-serif;display:flex;gap:10px;align-items:center;z-index:60;box-shadow:0 8px 24px rgba(0,0,0,0.35)";
    document.body.appendChild(navConfirmEl);
  }
  navConfirmEl.innerHTML = "";
  const msg = document.createElement("span");
  msg.textContent = message;
  const go = document.createElement("button");
  go.textContent = "Go";
  go.style.cssText = "background:#6f8464;color:#fff;border:0;padding:6px 14px;border-radius:8px;cursor:pointer;font:600 12px system-ui";
  go.onclick = () => (window.location.href = url);
  const stay = document.createElement("button");
  stay.textContent = "Stay";
  stay.style.cssText = "background:transparent;color:#d8d2c4;border:1px solid rgba(216,210,196,0.5);padding:6px 14px;border-radius:8px;cursor:pointer;font:600 12px system-ui";
  stay.onclick = () => {
    if (navConfirmEl) navConfirmEl.style.display = "none";
  };
  navConfirmEl.append(msg, go, stay);
  navConfirmEl.style.display = "flex";
}

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 400);
// the origin view: behind/above top-1, looking at the balcony
camera.position.set(11, 11, 14);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 2.6, -6);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 8;
controls.maxDistance = 80;
controls.maxPolarAngle = Math.PI / 2.04;
controls.autoRotate = false;
controls.update();

const waterSheet = buildRoom(scene);

// ---- the speakers play Frank's track (click them) ----
const song = new Audio("/audio/song.mp4");
song.loop = true;
const objects = buildObjects(scene);

// ---- the monitors: black screens with code scrolling on them ----
interface CodeScreen { tex: THREE.CanvasTexture; ctx: CanvasRenderingContext2D; w: number; h: number }
const codeScreens: CodeScreen[] = [];
objects.monScreens.forEach((m, i) => {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = i === 0 ? 384 : 224;
  const ctx = c.getContext("2d") as CanvasRenderingContext2D;
  const tex = new THREE.CanvasTexture(c);
  const mat = m.material as THREE.MeshStandardMaterial;
  mat.color.set("#0c1016");
  mat.emissive.set("#ffffff");
  mat.emissiveIntensity = 0.85;
  mat.map = tex;
  mat.emissiveMap = tex;
  codeScreens.push({ tex, ctx, w: c.width, h: c.height });
});
function drawCode(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  // a calm editor, VS Code flavour — light code, not a data storm
  ctx.fillStyle = "#1e1e1e";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#252526"; // activity bar + sidebar
  ctx.fillRect(0, 0, 16, h);
  ctx.fillRect(16, 0, 40, h);
  ctx.fillStyle = "#2d2d2d"; // tab strip
  ctx.fillRect(56, 0, w - 56, 18);
  ctx.fillStyle = "#1e1e1e"; // gutter
  ctx.fillRect(56, 18, 34, h - 18);
  for (let s2 = 0; s2 < 5; s2++) {
    ctx.fillStyle = "#3c3c40";
    ctx.fillRect(22, 28 + s2 * 16, 22 + (s2 % 3) * 5, 4);
  }
  const rows = Math.floor((h - 30) / 21);
  for (let r = 0; r < rows; r++) {
    if (r % 3 === 2) continue; // airy — blank lines between snippets
    const y = 26 + r * 21;
    ctx.fillStyle = "#4a4a50"; // line numbers
    ctx.fillRect(62, y, 9, 3);
    const indent = ((r * 7 + 3) % 4) * 9;
    let x = 98 + indent;
    const nTokens = 1 + ((r * 5 + 2) % 2); // little snippets, not walls of code
    for (let k = 0; k < nTokens; k++) {
      const seed = (r * 31 + k * 17) % 97;
      const lw = 10 + (seed % 22);
      ctx.fillStyle = k === 0 ? "#6a9955" : seed % 2 ? "#9cdcfe" : "#ce9178";
      ctx.fillRect(x, y, lw, 4);
      x += lw + 8;
      if (x > w - 20) break;
    }
  }
  // a soft blinking cursor
  if (Math.floor(t * 1.1) % 2 === 0) {
    ctx.fillStyle = "#aeafad";
    ctx.fillRect(112, 22 + (Math.floor(t * 0.25) % rows) * 15, 4, 11);
  }
}
const lights = buildLights(scene);

// ---- placement grid (key G) + composed views (keys 1/2/3) ----
const slotGrid = buildSlotGrid();
scene.add(slotGrid);

interface View { pos: THREE.Vector3; target: THREE.Vector3 }
const views: Record<string, View> = {
  "1": { pos: new THREE.Vector3(0, 6.2, 11), target: new THREE.Vector3(0, 3, -13) },   // front on, facing out
  "2": { pos: new THREE.Vector3(11, 8, 12), target: new THREE.Vector3(0, 2.6, -7) },   // from the right
  "3": { pos: new THREE.Vector3(8, 26, 11), target: new THREE.Vector3(0, 0, -6) },     // from the top
};
let desired: View | null = null;

window.addEventListener("keydown", (e) => {
  if (e.key === "g" || e.key === "G") slotGrid.visible = !slotGrid.visible;
  if (e.key === "l" || e.key === "L") night = !night;
  const v = views[e.key];
  if (v) desired = v;
});

// ---------- interactivity: hover labels, click hooks ----------
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hovered: THREE.Object3D | null = null;
// the sliding glass is a little state machine (Frank 2026-10-12):
// 0 = closed; click pane 4 (slot 7) -> it tucks into pane 3;
// click pane 3 -> 3+4 stack into panes 1+2; click pane 1 or 2 -> everything returns
let glassState = 2; // the scene opens with the glass stacked left — balcony breathing
let projectorOn = false; // starts off — click the unit
let lampOn = true; // click the ghee lamp
let matRoll = 0; // yoga mat roll state (click to roll)
let matRollTarget = 0;
let cupFill = 0.5; // glass of water: 0.5 half (default) -> 0 -> 1 -> ...
let bagOut = false; // click the bag — the game slides out
let bagOutT = 0;
let ventMode = 1; // 0 = still, 1 = warm (red), 2 = cool (blue) — cycled by the switch

const elementNote: Record<ElementName, string> = {
  earth: "earth — soil, stone, what grows",
  water: "water — flow, glass, reflection",
  fire: "fire — warmth, light, the sun",
  air: "air — openings, breath, the view",
  space: "space — portal, shrine, sky",
};

function pick(): THREE.Object3D | null {
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(scene.children, true);
  for (const hit of hits) {
    let o: THREE.Object3D | null = hit.object;
    while (o) {
      if (o.userData?.element) return o;
      o = o.parent;
    }
  }
  return null;
}

canvas.addEventListener("pointermove", (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

canvas.addEventListener("click", () => {
  const target = pick();
  if (!target) return;
  const act = target.userData?.action;
  if (act === "glass-panel") {
    const i = target.userData.panelIndex as number;
    if (i === 3) glassState = 1;
    else if (i === 2) glassState = 2;
    else glassState = 0;
    labelEl.textContent =
      glassState === 0 ? "the glass returns — the room turns inward"
      : glassState === 1 ? "one pane tucks away — a breath of outside"
      : "the glass stacks left — the balcony opens";
    labelEl.style.opacity = "1";
    window.setTimeout(() => (labelEl.style.opacity = "0"), 1600);
    return;
  }
  if (act === "toggle-vents") {
    ventMode = (ventMode + 1) % 3;
    labelEl.textContent = ventMode === 0 ? "the air rests" : ventMode === 1 ? "warm air rises" : "cool air drifts";
    labelEl.style.opacity = "1";
    window.setTimeout(() => (labelEl.style.opacity = "0"), 1600);
    return;
  }
  if (act === "toggle-music") {
    if (song.paused) {
      song.volume = 0.55;
      void song.play();
      labelEl.textContent = "the speakers — Pandora, turning";
    } else {
      song.pause();
      labelEl.textContent = "the speakers rest";
    }
    labelEl.style.opacity = "1";
    window.setTimeout(() => (labelEl.style.opacity = "0"), 1600);
    return;
  }
  if (act === "play-piano") {
    labelEl.textContent = "a soft chord fills the room";
    labelEl.style.opacity = "1";
    window.setTimeout(() => (labelEl.style.opacity = "0"), 1600);
    return;
  }
  if (act === "open-pickleball") {
    if (!bagOut) {
      // still packed — this click opens the bag instead
      bagOut = true;
      labelEl.textContent = "the game comes out";
      labelEl.style.opacity = "1";
      window.setTimeout(() => (labelEl.style.opacity = "0"), 1600);
      return;
    }
    askNavigate("open pickleball.gqz.app?", "https://pickleball.gqz.app"); // the ball asks first
    return;
  }
  if (act === "open-gqz") {
    askNavigate("open gqz.app?", "https://gqz.app");
    labelEl.textContent = "gqz.app";
    labelEl.style.opacity = "1";
    window.setTimeout(() => (labelEl.style.opacity = "0"), 1600);
    return;
  }
  if (act === "bag-game") {
    bagOut = !bagOut;
    labelEl.textContent = bagOut ? "the game comes out" : "the game goes away";
    labelEl.style.opacity = "1";
    window.setTimeout(() => (labelEl.style.opacity = "0"), 1600);
    return;
  }
  if (act === "roll-mat") {
    matRollTarget = matRollTarget > 0.5 ? 0 : 1;
    labelEl.textContent = matRollTarget > 0.5 ? "the yoga mat rolls up" : "the yoga mat unrolls";
    labelEl.style.opacity = "1";
    window.setTimeout(() => (labelEl.style.opacity = "0"), 1600);
    return;
  }
  if (act === "glass-water") {
    cupFill = cupFill === 0.5 ? 0 : cupFill === 0 ? 1 : 0.5; // half -> empty -> full -> half
    labelEl.textContent = cupFill === 1 ? "the glass is full" : cupFill === 0 ? "the glass is empty" : "half a glass";
    labelEl.style.opacity = "1";
    window.setTimeout(() => (labelEl.style.opacity = "0"), 1600);
    return;
  }
  if (act === "toggle-lamp") {
    lampOn = !lampOn;
    labelEl.textContent = lampOn ? "the ghee lamp is lit" : "the ghee lamp rests";
    labelEl.style.opacity = "1";
    window.setTimeout(() => (labelEl.style.opacity = "0"), 1600);
    return;
  }
  if (act === "toggle-night") {
    night = !night;
    labelEl.textContent = night ? "night falls over the shrine" : "the day returns";
    labelEl.style.opacity = "1";
    window.setTimeout(() => (labelEl.style.opacity = "0"), 1600);
    return;
  }
  if (act === "toggle-projector") {
    projectorOn = !projectorOn;
    labelEl.textContent = projectorOn ? "the projector hums to life" : "the projector sleeps";
    labelEl.style.opacity = "1";
    window.setTimeout(() => (labelEl.style.opacity = "0"), 1600);
    return;
  }
  const { element, label } = target.userData as { element: ElementName; label: string };
  console.log("[shrine] activated:", element, "—", label);
  labelEl.textContent = elementNote[element];
  labelEl.style.opacity = "1";
  window.setTimeout(() => (labelEl.style.opacity = "0"), 1600);
});

// ---------- resize ----------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------- life ----------
const clock = new THREE.Clock();
let night = false;
let nightMix = 0;
const daySky = skyTexture();
const darkSky = nightSkyTexture();
const dayHorizon = new THREE.Color("#f6e2c2");
const nightHorizon = new THREE.Color("#22304f");
// ---- the projector's little world: an animated landscape canvas ----
const artCanvas = document.createElement("canvas");
artCanvas.width = 840;
artCanvas.height = 480;
const actx = artCanvas.getContext("2d") as CanvasRenderingContext2D;
const art = new THREE.CanvasTexture(artCanvas);
function drawLandscape(t: number): void {
  const w = artCanvas.width;
  const h = artCanvas.height;
  const sky = actx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#7fc4ff");
  sky.addColorStop(0.55, "#ffd9a0");
  sky.addColorStop(1, "#ffb27a");
  actx.fillStyle = sky;
  actx.fillRect(0, 0, w, h);
  actx.fillStyle = "#fff3c4";
  actx.beginPath();
  actx.arc(w * 0.68, h * 0.5 + Math.sin(t * 0.1) * 10, 46, 0, Math.PI * 2);
  actx.fill();
  for (const [hy, col, amp, spd] of [[0.62, "#3f6d4e", 28, 0.12], [0.74, "#2f5a3e", 40, 0.2], [0.87, "#24462f", 54, 0.3]] as Array<[number, string, number, number]>) {
    actx.fillStyle = col;
    actx.beginPath();
    actx.moveTo(0, h);
    for (let x = 0; x <= w; x += 12) {
      actx.lineTo(x, h * hy + Math.sin(x * 0.012 + t * spd) * amp);
    }
    actx.lineTo(w, h);
    actx.closePath();
    actx.fill();
  }
  actx.fillStyle = "rgba(255,255,255,0.85)";
  for (let i = 0; i < 4; i++) {
    const cx = ((t * 18 + i * 230) % (w + 180)) - 90;
    const cy = 66 + i * 44;
    actx.beginPath();
    actx.ellipse(cx, cy, 52, 18, 0, 0, Math.PI * 2);
    actx.ellipse(cx + 34, cy + 8, 34, 14, 0, 0, Math.PI * 2);
    actx.fill();
  }
  art.needsUpdate = true;
}

function animate(): void {
  const t = clock.getElapsedTime();

  // day/night mix (key L) — floor lights + wisps wake at night
  nightMix += ((night ? 1 : 0) - nightMix) * 0.045;
  lights.sun.intensity = 2.6 * (1 - nightMix * 0.88);
  lights.hemi.intensity = 0.85 - 0.62 * nightMix;
  lights.bounce.intensity = 0.22 - 0.12 * nightMix;
  renderer.toneMappingExposure = 1.12 - 0.26 * nightMix;
  scene.background = nightMix > 0.5 ? darkSky : daySky;
  (scene.fog as THREE.Fog).color.lerpColors(dayHorizon, nightHorizon, nightMix);
  const ventColor = ventMode === 1 ? "#ff6a4a" : "#6ab8ff";
  const ventOn = ventMode > 0;
  objects.floorLights.forEach((l) => {
    const pulse = 0.9 + Math.sin(t * 1.5 + ((l.userData.phase as number) ?? 0)) * 0.1;
    l.intensity = ventOn ? (2.4 + nightMix * 6) * pulse : 0;
    l.color.set(ventColor);
    const fm = l.userData.fixtureMat as THREE.MeshStandardMaterial | undefined;
    if (fm) {
      fm.emissive.set(ventOn ? ventColor : "#d9c9a8");
      fm.emissiveIntensity = ventOn ? 0.22 * pulse : 0.06;
    }
  });
  // the gill fins rotate UP when the air breathes, lie flat when it rests
  objects.ventFins.forEach((f) => {
    const target = ventOn ? 0.3 : 0.08; // blades lift a touch (lower angle)
    f.rotation.x += (target - f.rotation.x) * 0.07;
  });
  const warmth = 1 + nightMix * 0.45;
  objects.wisps.forEach((w) => {
    const phase = (t * 0.5 + (w.userData.phase as number)) % 2.6;
    w.position.y = 1.2 + phase;
    const puff = 0.85 + phase * 0.75; // steam swells as it rises
    w.scale.setScalar(puff);
    // steam: a slow sideways sway + tilt
    const sway = Math.sin(t * 1.6 + (w.userData.phase as number));
    w.rotation.z = sway * 0.22;
    const vx = (w.userData.vx as number) ?? 0;
    w.position.x += (Math.sin(t * 0.9 + (w.userData.phase as number)) * 0.18 - ((w.position.x - vx) * 0.02)) * 0.06;
    const wm = w.material as THREE.MeshBasicMaterial;
    wm.color.set(ventColor);
    wm.opacity = (ventOn ? 1 : 0) * (0.7 + nightMix * 0.2) * (1 - phase / 2.6);
  });

  codeScreens.forEach((s, i) => {
    drawCode(s.ctx, s.w, s.h, t * (i === 0 ? 1 : 0.75) + i * 10);
    s.tex.needsUpdate = true;
  });

  // subtle beams: gentle pulse with the mode color
  objects.steamBeams.forEach((s) => {
    const m = s.material as THREE.MeshBasicMaterial;
    m.color.set(ventColor);
    m.opacity = ventOn ? 0.15 + Math.sin(t * 1.8 + (s.userData.phase as number)) * 0.055 : 0;
  });

  // the water sheet flows down the rocks; the little wheel turns
  const flowMap = (waterSheet.material as THREE.MeshStandardMaterial).map;
  if (flowMap) flowMap.offset.y = -t * 0.22;
  objects.waterWheel.rotation.z += 0.014 + Math.sin(t * 2.3) * 0.006; // driven by the water

  // the portal breathes — faint circles merging and parting
  objects.portalVeils.forEach((v, i) => {
    const m = v.material as THREE.MeshBasicMaterial;
    m.opacity = 0.05 + i * 0.03 + Math.sin(t * 0.6 + i * 2.1) * 0.045 + Math.sin(t * 1.5 + i) * 0.025;
  });

  // the paddle and ball slide out of the bag — two phases: rise, then settle
  bagOutT += ((bagOut ? 1 : 0) - bagOutT) * 0.07;
  if (bagOutT < 0.5) {
    const seg = bagOutT * 2;
    objects.bagPaddle.position.set(0, 0.55 + seg * 1.6, 0.02);
    objects.bagPaddle.rotation.set(0, 0, 0);
    objects.bagBall.position.set(0, 0.95 + seg * 1.0, 0.02 + seg * 0.18);
    objects.bagBall.rotation.set(0, 0, 0);
  } else {
    const seg = (bagOutT - 0.5) * 2;
    objects.bagPaddle.position.set(seg * 0.95, 2.15 - seg * 2.09, 0.02 - seg * 0.12); // lays next to the bag
    objects.bagPaddle.rotation.set(seg * (-Math.PI / 2 + 0.15), seg * -0.55, 0);
    objects.bagBall.position.set(seg * 2.2, 1.95 - seg * 1.7, 0.2 + seg * 2.8); // rolls out, slightly adjusted
    objects.bagBall.rotation.set(seg * 2.2, seg * 1.4, 0);
  }

  // the yoga mat rolls and unrolls
  matRoll += (matRollTarget - matRoll) * 0.08;
  const MAT_X = 1.6; // closer to the bookshelf
  const rollR = 0.015 + matRoll * 0.34;
  objects.matRollCyl.scale.set(rollR, 1, rollR);
  objects.matRollCyl.position.set(MAT_X + 4.0 - matRoll * 8.0, 0.1 + rollR, -6.05); // rolls away from the bookshelf, clear of the door
  objects.yogaMat.scale.x = Math.max(0.02, 1 - matRoll);
  objects.yogaMat.position.x = MAT_X - 4.0 * matRoll;

  // the glass of water: half, empty or full
  objects.cupWater.scale.y = Math.max(0.01, cupFill * 2);
  objects.cupWater.position.y = 0.03 + cupFill * 0.39;

  const shimmerT = scene.userData.shimmerTex as THREE.CanvasTexture | undefined;
  if (shimmerT) shimmerT.offset.set(t * 0.012, t * 0.021);

  const cloudM = scene.userData.cloudMat as THREE.MeshStandardMaterial | undefined;
  if (cloudM) cloudM.opacity = 0.85 - nightMix * 0.8; // nearly gone at night — the near puff was staying bright

  // heat motes rise from the vents, swell, and fade at the top
  objects.heatMotes.forEach((mo) => {
    const mm = mo.material as THREE.MeshBasicMaterial;
    mm.color.set(ventColor);
    const ph = (mo.userData.phase as number) ?? 0;
    const cyc = (t * 0.3 + ph) % 1;
    mo.position.y = 0.45 + cyc * ((mo.userData.drift as number) ?? 1.6);
    // a slightly squiggly path up
    mo.position.x = ((mo.userData.baseX as number) ?? 0) + Math.sin(t * 2.1 + ph * 12) * 0.16;
    mo.position.z = ((mo.userData.baseZ as number) ?? 0) + Math.sin(t * 1.7 + ph * 9) * 0.13;
    mm.opacity = ventOn ? Math.sin(Math.PI * cyc) * 0.11 : 0;
    mo.scale.setScalar(0.7 + cyc * 1.5);
  });

  // gentle vertex ripple on the water bodies (not the lake)
  const ripples = (scene.userData.ripples ?? []) as Array<{ mesh: THREE.Mesh; base: Float32Array; amp: number; freq: number; speed: number }>;
  for (const rr of ripples) {
    const pos = rr.mesh.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let vi = 0; vi < arr.length; vi += 3) {
      const by = rr.base[vi + 1];
      if (by > 0.01) {
        const dx = rr.base[vi];
        const dz = rr.base[vi + 2];
        arr[vi + 1] = by + Math.sin(Math.sqrt(dx * dx + dz * dz) * rr.freq - t * rr.speed) * rr.amp;
      }
    }
    pos.needsUpdate = true;
  }

  // celestial life: sun sinks, moon + stars rise
  const starM = scene.userData.starMat as THREE.PointsMaterial | undefined;
  if (starM) starM.opacity = nightMix;
  const moonM = scene.userData.moonMat as THREE.MeshBasicMaterial | undefined;
  if (moonM) moonM.opacity = nightMix * 0.92;
  const moonGM = scene.userData.moonGlowMat as THREE.MeshBasicMaterial | undefined;
  if (moonGM) moonGM.opacity = nightMix * 0.22;
  const moonSM = scene.userData.moonShadowMat as THREE.MeshBasicMaterial | undefined;
  if (moonSM) moonSM.opacity = nightMix * 0.92;
  const sunM = scene.userData.sunMat as THREE.MeshBasicMaterial | undefined;
  if (sunM) {
    sunM.opacity = Math.max(0, 1 - nightMix * 1.4); // gone well before full night
    sunM.visible = nightMix < 0.85;
  }
  const sunGM = scene.userData.sunGlowMat as THREE.MeshBasicMaterial | undefined;
  if (sunGM) sunGM.opacity = 0.22 * Math.max(0, 1 - nightMix * 1.4);

  // the UST light ray — faint, clearest at night
  const ray = objects.lightRay.material as THREE.MeshBasicMaterial;
  ray.opacity += (((projectorOn ? 0.03 + nightMix * 0.075 : 0)) - ray.opacity) * 0.08;

  if (desired) {
    camera.position.lerp(desired.pos, 0.055);
    controls.target.lerp(desired.target, 0.055);
    if (camera.position.distanceTo(desired.pos) < 0.12) desired = null;
  }

  // the sliding glass: panels 0/1 drift left, 2/3 drift right (stacked open)
  objects.glassPanels.forEach((panel, i) => {
    const home = -7.8 + i * 5.2;
    let goal = home;
    if (glassState === 1 && i === 3) goal = 2.28;          // pane 4 into pane 3
    if (glassState === 2 && i === 2) goal = -2.92;         // pane 3 into pane 2
    if (glassState === 2 && i === 3) goal = -7.52;         // pane 4 into pane 1
    panel.position.x += (goal - panel.position.x) * 0.055;
  });

  // projector on/off glow
  const cloth = objects.screenCloth.material as THREE.MeshStandardMaterial;
  // blank wall when off; a living landscape when on
  if (projectorOn) {
    drawLandscape(t * 0.9);
    if (cloth.map !== art) {
      cloth.map = art;
      cloth.emissiveMap = art;
      cloth.emissive.set("#ffffff");
      cloth.color.set("#ffffff");
      cloth.needsUpdate = true;
    }
  } else if (cloth.map !== null) {
    cloth.map = null;
    cloth.emissiveMap = null;
    cloth.color.set("#e8d8bd");
    cloth.emissive.set("#dff0ff");
    cloth.needsUpdate = true;
  }
  const shimmer = projectorOn ? 0.42 + Math.sin(t * 2.7) * 0.04 + Math.sin(t * 6.1) * 0.02 : 0;
  cloth.emissiveIntensity += (shimmer - cloth.emissiveIntensity) * 0.08;
  // floating rocks drift and turn
  objects.floatRocks.forEach((r, i) => {
    r.position.y = (r.userData.baseY as number) + Math.sin(t * 0.55 + (r.userData.phase as number)) * ((r.userData.amp as number) ?? 0.28);
    r.rotation.y += 0.0018 + i * 0.0004;
    r.rotation.x = Math.sin(t * 0.22 + (r.userData.phase as number)) * 0.1;
  });

  const lens = objects.lensGlow.material as THREE.MeshStandardMaterial;
  lens.emissiveIntensity += ((projectorOn ? 2.2 : 0.05) - lens.emissiveIntensity) * 0.08;

  const flicker = 0.82 + Math.sin(t * 9.3) * 0.09 + Math.sin(t * 23.7) * 0.06;
  objects.fire.intensity = 22 * flicker * warmth;
  objects.fireCone.scale.setScalar(0.92 + Math.sin(t * 11) * 0.07 + Math.sin(t * 6.3) * 0.05);
  objects.fireCone.rotation.y = t * 0.4;
  objects.water.position.y = 1.18 + Math.sin(t * 1.6) * 0.012;
  const lampFlicker = 0.9 + Math.sin(t * 13) * 0.09 + Math.sin(t * 7.3) * 0.05 + Math.sin(t * 23) * 0.035;
  objects.lamp.intensity = lampOn ? (1.3 + lampFlicker * 0.8 + Math.sin(t * 2.2) * 0.2) * warmth : 0;
  objects.lampFlame.visible = lampOn;
  objects.lampGlow.visible = lampOn;
  objects.lampFlame.scale.set(0.92 + Math.sin(t * 15) * 0.1, lampFlicker, 0.92 + Math.sin(t * 11) * 0.1);
  objects.lampFlame.rotation.z = Math.sin(t * 9) * 0.12;
  objects.lampFlame.rotation.x = Math.sin(t * 6.2) * 0.08;
  const lfMat = objects.lampFlame.material as THREE.MeshStandardMaterial;
  lfMat.emissiveIntensity = 1.4 + lampFlicker * 0.9;

  const target = pick();
  if (target !== hovered) {
    hovered = target;
    if (hovered) {
      const { label } = hovered.userData as { label: string };
      labelEl.textContent = label;
      labelEl.style.opacity = "1";
      canvas.style.cursor = "pointer";
    } else {
      labelEl.style.opacity = "0";
      canvas.style.cursor = "grab";
    }
  }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

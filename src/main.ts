import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { buildRoom, skyTexture, nightSkyTexture } from "./room";
import { buildObjects, type ElementName } from "./objects";
import { buildLights } from "./lighting";
import { buildSlotGrid } from "./slots";
import "./style.css";

const canvas = document.querySelector<HTMLCanvasElement>("#scene")!;
const labelEl = document.querySelector<HTMLDivElement>("#label")!;

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

buildRoom(scene);
const objects = buildObjects(scene);
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
let glassState = 0;
let projectorOn = true;
let ventsOn = true;

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
    ventsOn = !ventsOn;
    labelEl.textContent = ventsOn ? "the vents breathe again" : "the air rests";
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
  actx.fillStyle = "rgba(220,240,255,0.7)";
  actx.fillRect(w * 0.22, h * 0.62, 11, h * 0.25);
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
  objects.floorLights.forEach((l) => (l.intensity = ventsOn ? 4 + nightMix * 11 : 0));
  const warmth = 1 + nightMix * 0.45;
  objects.wisps.forEach((w) => {
    const phase = (t * 0.5 + (w.userData.phase as number)) % 2.6;
    w.position.y = 1.2 + phase;
    // wavy air: a slow sideways sway + tilt
    const sway = Math.sin(t * 1.6 + (w.userData.phase as number));
    w.rotation.z = sway * 0.22;
    w.position.x += (Math.sin(t * 0.9 + (w.userData.phase as number)) * 0.18 - ((w.position.x - (w.userData.hot ? 9.55 : -9.55)) * 0.02)) * 0.06;
    (w.material as THREE.MeshBasicMaterial).opacity =
      (ventsOn ? 1 : 0) * (0.1 + nightMix * 0.1) * (1 - phase / 2.6);
  });

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
    r.position.y = (r.userData.baseY as number) + Math.sin(t * 0.55 + (r.userData.phase as number)) * 0.28;
    r.rotation.y += 0.0018 + i * 0.0004;
    r.rotation.x = Math.sin(t * 0.22 + (r.userData.phase as number)) * 0.1;
  });

  const lens = objects.lensGlow.material as THREE.MeshStandardMaterial;
  lens.emissiveIntensity += ((projectorOn ? 2.2 : 0.05) - lens.emissiveIntensity) * 0.08;

  const flicker = 0.82 + Math.sin(t * 9.3) * 0.09 + Math.sin(t * 23.7) * 0.06;
  objects.fire.intensity = 22 * flicker * warmth;
  objects.fireCone.scale.setScalar(0.94 + Math.sin(t * 11) * 0.07);
  objects.water.position.y = 0.82 + Math.sin(t * 1.6) * 0.012;
  objects.lamp.intensity = (14 + Math.sin(t * 2.2) * 0.5) * warmth;

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

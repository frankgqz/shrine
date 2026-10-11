import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { buildRoom } from "./room";
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

// Isometric-ish: a long lens from a corner — the "room in 3d" look
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 400);
camera.position.set(17, 13, 17);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 2.2, -0.5);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 8;
controls.maxDistance = 42;
controls.maxPolarAngle = Math.PI / 2.04;
controls.autoRotate = false; // composed view — the inspiration's feel
controls.update();

buildRoom(scene);
const objects = buildObjects(scene);
buildLights(scene);

// ---- the placement grid (key G) + composed camera views (keys 1/2/3) ----
const slotGrid = buildSlotGrid();
scene.add(slotGrid);

interface View { pos: THREE.Vector3; target: THREE.Vector3; az: [number, number] }
const views: Record<string, View> = {
  "1": { pos: new THREE.Vector3(-3, 8.2, -19), target: new THREE.Vector3(1.5, 3, 6), az: [-2.35, -1.15] }, // front on, facing out
  "2": { pos: new THREE.Vector3(19, 10, 15), target: new THREE.Vector3(-1, 2.6, -1), az: [-0.35, 0.85] },  // from the right
  "3": { pos: new THREE.Vector3(11, 27, 13), target: new THREE.Vector3(0, 0, 0), az: [-0.35, 0.85] },        // from the top
};
let desired: View | null = null;

function setView(v: View): void {
  desired = v;
  controls.minAzimuthAngle = v.az[0];
  controls.maxAzimuthAngle = v.az[1];
}
setView(views["2"]); // the classic corner composition to start

window.addEventListener("keydown", (e) => {
  if (e.key === "g" || e.key === "G") slotGrid.visible = !slotGrid.visible;
  const v = views[e.key];
  if (v) setView(v);
});

// ---------- interactivity: hover labels, click hooks ----------
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hovered: THREE.Object3D | null = null;

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
  if (target.userData?.action === "toggle-roller") {
    rollerOpen = !rollerOpen;
    labelEl.textContent = rollerOpen ? "the roller opens — the balcony breathes" : "the roller closes — the room turns inward";
    labelEl.style.opacity = "1";
    window.setTimeout(() => (labelEl.style.opacity = "0"), 1600);
    return;
  }
  const { element, label } = target.userData as { element: ElementName; label: string };
  // hook for per-element behaviour — e.g. stoke the fire, ripple the water
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

// ---------- life: fire flicker, water breath, roller travel ----------
const clock = new THREE.Clock();
let rollerOpen = false;
function animate(): void {
  const t = clock.getElapsedTime();

  // camera glide toward the chosen composed view
  if (desired) {
    camera.position.lerp(desired.pos, 0.055);
    controls.target.lerp(desired.target, 0.055);
    if (camera.position.distanceTo(desired.pos) < 0.12) desired = null;
  }

  // the roller rolls up toward the tube (y 3.85 -> 7.2)
  const panel = objects.rollerPanel;
  const goalY = rollerOpen ? 7.15 : 3.85;
  const goalScale = rollerOpen ? 0.06 : 1;
  panel.position.y += (goalY - panel.position.y) * 0.08;
  panel.scale.y += (goalScale - panel.scale.y) * 0.08;

  const flicker = 0.82 + Math.sin(t * 9.3) * 0.09 + Math.sin(t * 23.7) * 0.06;
  objects.fire.intensity = 22 * flicker;
  objects.fireCone.scale.setScalar(0.94 + Math.sin(t * 11) * 0.07);

  objects.water.position.y = 0.82 + Math.sin(t * 1.6) * 0.012;
  objects.lamp.intensity = 14 + Math.sin(t * 2.2) * 0.5;

  // hover label
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

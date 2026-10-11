import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Every object is tagged with its element + sits in the placement grid
// (see slots.ts). Furniture is ORIGINAL procedural modelling (Bruno's repo
// has no license — inspired by, never copied).

export type ElementName = "earth" | "water" | "fire" | "air" | "space";

function tag<T extends THREE.Object3D>(obj: T, element: ElementName, label: string): T {
  obj.userData = { element, label };
  obj.traverse((c) => (c.userData = { ...c.userData, element, label }));
  return obj as T;
}

const wood = new THREE.MeshStandardMaterial({ color: "#f2efe8", roughness: 0.65 });
const oak = new THREE.MeshStandardMaterial({ color: "#d8b98c", roughness: 0.75 });
const darkWood = new THREE.MeshStandardMaterial({ color: "#5d3b20", roughness: 0.8 });
const stone = new THREE.MeshStandardMaterial({ color: "#9b8b79", roughness: 0.95 });
const brass = new THREE.MeshStandardMaterial({ color: "#c9973f", roughness: 0.5, metalness: 0.45 });
const metal = new THREE.MeshStandardMaterial({ color: "#4a4a52", roughness: 0.45, metalness: 0.6 });
const fabric = new THREE.MeshStandardMaterial({ color: "#7d4b3a", roughness: 0.95 });

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export interface SceneObjects {
  fire: THREE.PointLight;
  lamp: THREE.PointLight;
  fireCone: THREE.Mesh;
  water: THREE.Mesh;
  glassPanels: THREE.Mesh[];
  floorLights: THREE.PointLight[];
  wisps: THREE.Mesh[];
  screenCloth: THREE.Mesh;
  lensGlow: THREE.Mesh;
  floatRocks: THREE.Mesh[];
}

export function buildObjects(scene: THREE.Scene): SceneObjects {
  // ============ DESK (slot 3) — top, drawer unit, slim legs ============
  const desk = new THREE.Group();
  desk.add(mesh(new THREE.BoxGeometry(2.7, 0.16, 8.2), wood, 0, 2.72, 0));
  desk.add(mesh(new THREE.BoxGeometry(2.45, 0.1, 7.9), oak, 0, 2.6, 0)); // light-brown under-rail
  // speakers on the desk (one each side of the monitors)
  for (const sz of [3.55, -3.35]) {
    desk.add(mesh(new THREE.BoxGeometry(0.62, 1.15, 0.62), new THREE.MeshStandardMaterial({ color: "#2c2c33", roughness: 0.55 }), -1.05, 3.37, sz));
    const cone = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 12), new THREE.MeshStandardMaterial({ color: "#55555e", roughness: 0.4, metalness: 0.4 }), -1.38, 3.55, sz);
    cone.rotation.z = Math.PI / 2;
    desk.add(cone);
    const tweeter = mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshStandardMaterial({ color: "#55555e", roughness: 0.4, metalness: 0.4 }), -1.38, 3.05, sz);
    desk.add(tweeter);
  }
  // subwoofer under the desk, next to a little plant
  desk.add(mesh(new THREE.BoxGeometry(1.15, 1.35, 1.15), new THREE.MeshStandardMaterial({ color: "#2c2c33", roughness: 0.6 }), 0.35, 0.68, -3.1));
  const subCone = mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.1, 12), new THREE.MeshStandardMaterial({ color: "#55555e", roughness: 0.45, metalness: 0.35 }), 0.35, 0.75, -3.7);
  subCone.rotation.x = Math.PI / 2;
  desk.add(subCone);
  for (const z of [-3.65, 3.65]) {
    desk.add(mesh(new THREE.BoxGeometry(0.14, 2.7, 0.14), metal, -1.15, 1.35, z));
    desk.add(mesh(new THREE.BoxGeometry(0.14, 2.7, 0.14), metal, 1.15, 1.35, z));
  }
  desk.position.set(-8.8, 0, 4.6);
  scene.add(tag(desk, "space", "the desk — where the world is met"));

  // ============ MONITOR (slot 3) — slim bezel, stand, glowing screen ============
  const computer = new THREE.Group();
  // left: portrait monitor — low, almost touching the desk (top at y 6.2)
  computer.add(mesh(new THREE.BoxGeometry(0.12, 3.15, 2.05), metal, -1.2, 4.42, 1.55));
  const portrait = mesh(
    new THREE.PlaneGeometry(1.85, 2.9),
    new THREE.MeshStandardMaterial({ color: "#cfe8ff", emissive: "#7fc4ff", emissiveIntensity: 0.75 }),
    -1.12, 4.42, 1.55
  );
  portrait.rotation.y = Math.PI / 2;
  computer.add(portrait);
  computer.add(mesh(new THREE.BoxGeometry(0.42, 0.16, 1.0), metal, -1.2, 2.9, 1.55));
  // right: landscape monitor — flush against the portrait, a little lower
  computer.add(mesh(new THREE.BoxGeometry(0.12, 2.15, 3.55), metal, -1.2, 4.85, -1.25));
  const screen = mesh(
    new THREE.PlaneGeometry(3.3, 1.92),
    new THREE.MeshStandardMaterial({ color: "#bfe3ff", emissive: "#7fc4ff", emissiveIntensity: 0.9 }),
    -1.12, 4.85, -1.25
  );
  screen.rotation.y = Math.PI / 2;
  computer.add(screen);
  computer.add(mesh(new THREE.BoxGeometry(0.42, 0.16, 1.1), metal, -1.2, 2.9, -1.25));
  computer.add(mesh(new THREE.BoxGeometry(0.14, 1.5, 0.14), metal, -1.2, 3.65, -1.25));
  // keyboard + mouse on its right (toward -Z from the sitter)
  computer.add(mesh(new THREE.BoxGeometry(0.78, 0.06, 1.9), metal, -0.35, 2.86, -0.4)); // keyboard
  computer.add(mesh(new THREE.SphereGeometry(0.17, 10, 8), metal, -0.32, 2.95, -1.75)); // mouse
  computer.position.set(-8.8, 0, 4.6);
  scene.add(tag(computer, "space", "the computer — two windows into the world"));

  // ============ GAMING CHAIR (slot 3) — bucket seat, headrest, 5-star base ============
  const leather = new THREE.MeshStandardMaterial({ color: "#f4efe8", roughness: 0.55 });
  const blackTrim = new THREE.MeshStandardMaterial({ color: "#1c1c20", roughness: 0.5, metalness: 0.25 });
  const chair = new THREE.Group();
  // rounded ergonomic shapes — wide shapely seat, curved back shell
  // wide, slightly square seat with curved edges
  const seatShell = new THREE.Mesh(new RoundedBoxGeometry(2.6, 0.44, 2.4, 4, 0.2), leather);
  seatShell.position.set(0, 2.22, 0);
  chair.add(seatShell);
  const seatCushion = new THREE.Mesh(new RoundedBoxGeometry(2.38, 0.36, 2.18, 4, 0.17), leather);
  seatCushion.position.set(0, 2.52, 0);
  chair.add(seatCushion);
  // rectangular back with curved edges (no more oval pillows)
  const backShell = new THREE.Mesh(new RoundedBoxGeometry(0.5, 3.15, 2.05, 4, 0.16), leather);
  backShell.position.set(-0.85, 4.35, 0);
  backShell.rotation.z = 0.1;
  chair.add(backShell);
  const backPad = new THREE.Mesh(new RoundedBoxGeometry(0.34, 2.4, 1.75, 4, 0.12), leather);
  backPad.position.set(-0.5, 4.3, 0);
  backPad.rotation.z = 0.1;
  chair.add(backPad);
  const lumbar = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.85, 1.5, 4, 0.1), leather);
  lumbar.position.set(-0.32, 3.75, 0);
  chair.add(lumbar);
  // headrest — rectangular, extended out on two black poles
  for (const z of [-0.55, 0.55]) {
    chair.add(mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.85, 8), blackTrim, -0.92, 6.25, z));
  }
  const headrest = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.62, 1.5, 4, 0.09), leather);
  headrest.position.set(-0.88, 6.72, 0);
  headrest.rotation.z = 0.14;
  chair.add(headrest);
  for (const z of [-1.05, 1.05]) {
    const armPad = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.95, 10), blackTrim, 0.12, 3.2, z);
    armPad.rotation.z = Math.PI / 2;
    chair.add(armPad);
    chair.add(mesh(new THREE.BoxGeometry(0.17, 0.85, 0.17), blackTrim, 0.12, 2.75, z));
  }
  chair.add(mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.88, 10), blackTrim, 0, 1.32, 0));
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const arm = mesh(new THREE.BoxGeometry(0.23, 0.13, 1.35), blackTrim, Math.sin(a) * 0.6, 0.38, Math.cos(a) * 0.6);
    arm.rotation.y = a;
    chair.add(arm);
    chair.add(mesh(new THREE.SphereGeometry(0.18, 8, 6), blackTrim, Math.sin(a) * 1.22, 0.2, Math.cos(a) * 1.22)); // wheels touch the floor
  }
  chair.position.set(-5.55, 0, 4.6);
  chair.rotation.y = Math.PI; // faces the computer (and its two monitors)
  scene.add(tag(chair, "air", "the chair — leather, tall, facing the work"));

  // ============ INDOOR PLANTS — slot 6, right of + below the projection ============
  for (const [px, pz, s] of [[-8.7, -7.5, 1.15], [-8.7, 0.35, 0.95], [-8.7, -0.85, 0.72]] as Array<[number, number, number]>) {
    const pot = new THREE.Group();
    pot.add(mesh(new THREE.CylinderGeometry(0.62 * s, 0.48 * s, 0.85 * s, 12), new THREE.MeshStandardMaterial({ color: "#b4593f", roughness: 0.85 }), 0, 0.42 * s, 0));
    for (let i = 0; i < 7; i++) {
      const leaf = mesh(new THREE.SphereGeometry(0.5 * s, 8, 6), new THREE.MeshStandardMaterial({ color: i % 2 ? "#4d7038" : "#5d7a3a", roughness: 1 }), (Math.random() - 0.5) * 1.35 * s, 1.25 * s + Math.random() * 1.5 * s, (Math.random() - 0.5) * 1.35 * s);
      leaf.scale.set(0.65, 1.45, 0.65);
      pot.add(leaf);
    }
    pot.position.set(px, 0, pz);
    scene.add(tag(pot, "earth", "indoor plant — breathing beside the screen"));
  }

  // ============ WALL SHELVES above the couch (empty for now) ============
  for (const [wy, wz] of [[5.6, 1.2], [7.0, 2.9]]) {
    const plank = mesh(new THREE.BoxGeometry(0.42, 0.12, 2.8), wood, 10.05, wy, wz);
    scene.add(tag(plank, "space", "a wall shelf — waiting"));
    for (const bz of [wz - 1.25, wz + 1.25]) {
      scene.add(mesh(new THREE.BoxGeometry(0.42, 0.35, 0.1), metal, 10.05, wy - 0.22, bz));
    }
  }

  // ============ BOOKSHELF — right wall, between the glass and the couch ============
  const shelf = new THREE.Group();
  // an IKEA-style OPEN frame: two side panels, a thin back, planks between
  shelf.add(mesh(new THREE.BoxGeometry(1.5, 6.6, 0.16), wood, 0, 3.3, -1.72)); // side
  shelf.add(mesh(new THREE.BoxGeometry(1.5, 6.6, 0.16), wood, 0, 3.3, 1.72)); // side
  shelf.add(mesh(new THREE.BoxGeometry(0.08, 6.6, 3.6), new THREE.MeshStandardMaterial({ color: "#c9b28f", roughness: 0.85 }), 0.72, 3.3, 0)); // thin back
  const shelfYs = [0.12, 1.05, 2.25, 3.75, 5.15, 6.5];
  for (const y of shelfYs) {
    // planks 2.25/3.75 are RIGHT-ONLY — the left bay opens up for the portal
    const short = y === 2.25 || y === 3.75;
    shelf.add(mesh(new THREE.BoxGeometry(1.5, 0.1, short ? 1.15 : 3.6), wood, 0, y, short ? 1.25 : 0));
  }
  shelf.add(mesh(new THREE.BoxGeometry(1.5, 5.3, 0.12), wood, 0, 3.65, 0.75)); // one divider
  // only a FEW books — the shelf is mostly sacred things
  for (const [by, bh, bz, n] of [[1.62, 1.1, -1.25, 3], [4.5, 1.25, 1.38, 2], [1.75, 1.1, 1.45, 2]] as Array<[number, number, number, number]>) {
    for (let b = 0; b < n; b++) {
      const h = bh * (0.62 + Math.random() * 0.3);
      shelf.add(mesh(
        new THREE.BoxGeometry(0.42, h, 0.15 + Math.random() * 0.1),
        new THREE.MeshStandardMaterial({ color: ["#8a4b32", "#4b6a82", "#7a6a3c", "#5c4a66", "#9c6b45"][b % 5], roughness: 0.85 }),
        0.05, by - bh / 2 + h / 2 + 0.06, bz + b * 0.27
      ));
    }
  }
  // ---- the pooja collection (consecrated objects) ----
  const brassSoft = new THREE.MeshStandardMaterial({ color: "#d9a94f", roughness: 0.45, metalness: 0.55 });
  // crystals
  for (const [cy, cz, cs, col] of [[3.98, 1.42, 0.24, "#b58ce0"], [4.02, 1.08, 0.18, "#8ce0d4"], [4.0, 1.55, 0.2, "#e0c98c"]] as Array<[number, number, number, string]>) {
    const crystal = mesh(new THREE.IcosahedronGeometry(cs, 0), new THREE.MeshStandardMaterial({ color: col, roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0.85 }), 0.35, cy, cz);
    crystal.scale.y = 1.7;
    shelf.add(crystal);
  }
  // portrait of Sadhguru — a warm-toned frame with a simple presence
  const portraitFrame = new THREE.Group();
  portraitFrame.add(mesh(new THREE.BoxGeometry(0.12, 1.35, 1.05), brassSoft, 0, 0, 0));
  portraitFrame.add(mesh(new THREE.BoxGeometry(0.06, 1.15, 0.85), new THREE.MeshStandardMaterial({ color: "#caa46a", roughness: 0.7 }), -0.05, 0, 0));
  portraitFrame.add(mesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshStandardMaterial({ color: "#7a5c42", roughness: 0.8 }), -0.1, 0.22, 0));
  portraitFrame.add(mesh(new THREE.CylinderGeometry(0.26, 0.34, 0.55, 10), new THREE.MeshStandardMaterial({ color: "#7a5c42", roughness: 0.8 }), -0.1, -0.3, 0));
  portraitFrame.position.set(-0.42, 4.48, 1.22);
  shelf.add(tag(portraitFrame, "space", "the portrait — a still presence on the shelf"));

  // Dhyanalinga Yatra photo frame
  const yatraFrame = new THREE.Group();
  yatraFrame.add(mesh(new THREE.BoxGeometry(0.1, 0.85, 1.15), brassSoft, 0, 0, 0));
  yatraFrame.add(mesh(new THREE.BoxGeometry(0.05, 0.68, 0.95), new THREE.MeshStandardMaterial({ color: "#8fa8b8", roughness: 0.6 }), -0.04, 0, 0));
  yatraFrame.add(mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.4, 8), new THREE.MeshStandardMaterial({ color: "#b8a48f", roughness: 0.8 }), -0.08, -0.12, 0));
  yatraFrame.position.set(-0.35, 2.78, 1.28);
  shelf.add(tag(yatraFrame, "space", "the yatra frame — a journey held in glass"));

  // Linga Bhairavi Gudi — a small consecrated structure
  const gudi = new THREE.Group();
  gudi.add(mesh(new THREE.BoxGeometry(0.55, 0.5, 0.55), brassSoft, 0, 0.25, 0));
  gudi.add(mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), new THREE.MeshStandardMaterial({ color: "#a8482f", roughness: 0.6 }), 0, 0.7, 0));
  const dome = mesh(new THREE.SphereGeometry(0.3, 10, 8), brassSoft, 0, 1.02, 0);
  dome.scale.y = 0.75;
  gudi.add(dome);
  gudi.add(mesh(new THREE.ConeGeometry(0.09, 0.32, 8), brassSoft, 0, 1.32, 0));
  gudi.position.set(0.05, 5.25, 1.35);
  shelf.add(tag(gudi, "space", "the gudi — consecrated, quietly alive"));

  // a small standing diya flame beside the gudi
  shelf.add(mesh(new THREE.CylinderGeometry(0.14, 0.2, 0.12, 10), brassSoft, 0.05, 5.25, 0.6));
  shelf.add(mesh(new THREE.ConeGeometry(0.07, 0.22, 6), new THREE.MeshStandardMaterial({ color: "#ffb03a", emissive: "#ff9420", emissiveIntensity: 2.2 }), 0.05, 5.45, 0.6));

  // more pooja items — a kalash, a mala, incense, more crystals, a water bowl
  const kalash = new THREE.Group();
  kalash.add(mesh(new THREE.SphereGeometry(0.24, 10, 8), brassSoft, 0, 0.22, 0));
  kalash.add(mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.16, 10), brassSoft, 0, 0.48, 0));
  kalash.add(mesh(new THREE.SphereGeometry(0.13, 8, 6), new THREE.MeshStandardMaterial({ color: "#3f7a4e", roughness: 0.7 }), 0, 0.6, 0)); // coconut
  kalash.position.set(0.42, 1.43, 1.3);
  shelf.add(tag(kalash, "space", "the kalash — abundance in brass"));
  const mala = new THREE.Group();
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    mala.add(mesh(new THREE.SphereGeometry(0.055, 6, 5), new THREE.MeshStandardMaterial({ color: "#7a3f2e", roughness: 0.8 }), Math.sin(a) * 0.26, Math.cos(a) * 0.34, 0));
  }
  mala.position.set(0.12, 5.62, -0.55);
  shelf.add(tag(mala, "space", "the mala — beads that count the breath"));
  const incense = new THREE.Group();
  incense.add(mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.1, 10), brassSoft, 0, 0.05, 0));
  for (const ix of [-0.07, 0, 0.07]) {
    incense.add(mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.75, 5), new THREE.MeshStandardMaterial({ color: "#8a5c3e", roughness: 0.9 }), ix, 0.42, ix * 0.6));
    incense.add(mesh(new THREE.SphereGeometry(0.028, 5, 4), new THREE.MeshStandardMaterial({ color: "#ffb03a", emissive: "#ff9420", emissiveIntensity: 1.8 }), ix, 0.8, ix * 0.6));
  }
  incense.position.set(0.08, 5.25, 0.35);
  shelf.add(tag(incense, "fire", "incense — the air made prayerful"));
  for (const [cy, cz, cs, col] of [[5.55, -1.35, 0.2, "#e08c8c"], [5.5, 1.05, 0.17, "#8cc4e0"], [2.5, 1.5, 0.19, "#c4e08c"], [5.42, -1.32, 0.15, "#d4a0e8"]] as Array<[number, number, number, string]>) {
    const crystal = mesh(new THREE.IcosahedronGeometry(cs, 0), new THREE.MeshStandardMaterial({ color: col, roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0.85 }), 0.05, cy, cz);
    crystal.scale.y = 1.55;
    shelf.add(crystal);
  }
  // a water bowl — still water, catching the light
  shelf.add(mesh(new THREE.CylinderGeometry(0.34, 0.26, 0.2, 14), brassSoft, -0.45, 1.22, -1.05)); // offering water at the portal's foot
  shelf.add(mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.03, 14), new THREE.MeshStandardMaterial({ color: "#79cbe8", roughness: 0.1, transparent: true, opacity: 0.85, emissive: "#2f7fa0", emissiveIntensity: 0.25 }), -0.45, 1.33, -1.05));

  // a plant on top of the bookshelf
  const topPlant = new THREE.Group();
  topPlant.add(mesh(new THREE.CylinderGeometry(0.45, 0.35, 0.62, 12), new THREE.MeshStandardMaterial({ color: "#b4593f", roughness: 0.85 }), 0, 0.31, 0));
  for (let i = 0; i < 8; i++) {
    const leaf = mesh(new THREE.SphereGeometry(0.38, 8, 6), new THREE.MeshStandardMaterial({ color: i % 2 ? "#4d7038" : "#5d7a3a", roughness: 1 }), (Math.random() - 0.5) * 1.0, 0.85 + Math.random() * 1.1, (Math.random() - 0.5) * 1.0);
    leaf.scale.set(0.6, 1.45, 0.6);
    topPlant.add(leaf);
  }
  topPlant.position.set(0, 6.62, -0.55);
  shelf.add(tag(topPlant, "earth", "the plant atop the shelf — green over the sacred"))

  shelf.position.set(9.5, 0, -5.4);
  scene.add(tag(shelf, "space", "the bookshelf — quiet company between glass and couch"));

  // ============ GHEE LAMP on the desk (fire) ============
  const gheeLamp = new THREE.Group();
  gheeLamp.add(mesh(new THREE.CylinderGeometry(0.34, 0.46, 0.22, 14), brass, 0, 0.11, 0));
  gheeLamp.add(mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.12, 12), new THREE.MeshStandardMaterial({ color: "#f2e0b8", roughness: 0.4 }), 0, 0.24, 0));
  const wickFlame = mesh(new THREE.ConeGeometry(0.1, 0.34, 7), new THREE.MeshStandardMaterial({ color: "#ffb03a", emissive: "#ff9420", emissiveIntensity: 2.6 }), 0, 0.52, 0);
  gheeLamp.add(wickFlame);
  gheeLamp.position.set(-8.1, 2.8, 1.2);
  scene.add(tag(gheeLamp, "fire", "the ghee lamp — a steady little flame"));
  const lampLight = new THREE.PointLight("#ffd489", 6, 9, 2);
  lampLight.position.set(-8.1, 3.3, 1.2);
  scene.add(lampLight);

  // ============ L-SHAPED COUCH (slots 1,2,4) — faces outside + projector ============
  const couch = new THREE.Group();
  const fluffy = new THREE.MeshStandardMaterial({ color: "#f4efe8", roughness: 0.95 });
  const seat = (x: number, z: number, w: number, d: number) => {
    couch.add(mesh(new THREE.BoxGeometry(w, 0.55, d), fluffy, x, 0.82, z));
    const along = w > d;
    const count = along ? Math.max(2, Math.round(w / 2.2)) : Math.max(2, Math.round(d / 2.2));
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count - 0.5;
      const cw = along ? w / count * 0.97 : d - 0.14;
      const cd = along ? d - 0.14 : d / count * 0.97;
      const cushion = new THREE.Mesh(new RoundedBoxGeometry(cw, 0.46, cd, 4, 0.14), fluffy);
      cushion.position.set(along ? x + t * w : x, 1.18, along ? z : z + t * d);
      cushion.castShadow = true; cushion.receiveShadow = true;
      couch.add(cushion);
    }
  };
  const back = (x: number, z: number, w: number, d: number) => {
    couch.add(mesh(new THREE.BoxGeometry(w, 1.25, d), fluffy, x, 1.62, z));
    const along = w > d;
    const count = along ? Math.max(2, Math.round(w / 2.1)) : Math.max(2, Math.round(d / 2.1));
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count - 0.5;
      const pw = along ? w / count * 0.94 : 0.42;
      const pd = along ? 0.42 : d / count * 0.94;
      const pillow = new THREE.Mesh(new RoundedBoxGeometry(pw, 1.05, pd, 4, 0.15), fluffy);
      pillow.position.set(along ? x + t * w : x, 2.0, along ? z : z + t * d);
      if (along) pillow.rotation.x = -0.14; else pillow.rotation.z = 0.14;
      pillow.castShadow = true; pillow.receiveShadow = true;
      couch.add(pillow);
    }
  };
  seat(7.35, 2.5, 1.6, 4.2);   // the 1,4 side — clear of the right wall
  back(8.35, 2.5, 0.5, 4.2);
  seat(3.75, 5.5, 7.7, 1.9);   // the 1,2 side — the extended legroom lives here
  back(3.75, 6.65, 7.7, 0.55);
  // the corner — the two backrests meet; a corner cushion fills the nook
  const cornerBackA = new THREE.Mesh(new RoundedBoxGeometry(0.5, 1.25, 1.9, 4, 0.12), fluffy);
  cornerBackA.position.set(8.35, 1.62, 5.5);
  cornerBackA.castShadow = true; cornerBackA.receiveShadow = true;
  couch.add(cornerBackA);
  const cornerBackB = new THREE.Mesh(new RoundedBoxGeometry(1.6, 1.25, 0.5, 4, 0.12), fluffy);
  cornerBackB.position.set(7.35, 1.62, 6.65);
  cornerBackB.castShadow = true; cornerBackB.receiveShadow = true;
  couch.add(cornerBackB);
  const cornerSeat = new THREE.Mesh(new RoundedBoxGeometry(1.6, 0.46, 1.9, 4, 0.14), fluffy);
  cornerSeat.position.set(7.35, 1.18, 5.5);
  cornerSeat.castShadow = true; cornerSeat.receiveShadow = true;
  couch.add(cornerSeat);
  const cornerCushion = new THREE.Mesh(new RoundedBoxGeometry(1.3, 1.1, 1.3, 4, 0.2), fluffy);
  cornerCushion.position.set(7.6, 2.0, 5.85);
  cornerCushion.rotation.y = Math.PI / 4;
  cornerCushion.rotation.x = -0.3;
  cornerCushion.castShadow = true;
  couch.add(cornerCushion);
  // the sofa stands on legs
  for (const [lx, lz] of [[6.65, 0.9], [8.05, 0.9], [6.65, 2.7], [8.05, 2.7], [6.65, 4.2], [8.05, 4.2], [0.45, 4.75], [0.45, 6.25], [2.6, 4.75], [2.6, 6.25], [4.9, 4.75], [4.9, 6.25], [7.0, 4.75], [7.0, 6.25]] as Array<[number, number]>) {
    couch.add(mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.56, 8), new THREE.MeshStandardMaterial({ color: "#5d3b20", roughness: 0.7 }), lx, 0.28, lz));
  }
  // proper armrests at the two outer ends
  couch.add(mesh(new THREE.BoxGeometry(1.65, 1.25, 0.7), fluffy, 7.35, 1.45, 0.1));
  couch.add(mesh(new THREE.BoxGeometry(0.7, 1.25, 1.95), fluffy, 0.05, 1.45, 5.5));
  // throw cushions — RELAXED on the seat, leaning into the backrest
  for (const [cx, cz, cc, side] of [[7.95, 1.1, "#c98f6b", "x"], [7.95, 3.4, "#8fa8b8", "x"], [5.2, 6.15, "#c98f6b", "z"], [2.4, 6.15, "#a8b894", "z"]] as Array<[number, number, string, string]>) {
    const throwCushion = new THREE.Mesh(new THREE.SphereGeometry(0.62, 12, 10), new THREE.MeshStandardMaterial({ color: cc, roughness: 0.95 }));
    if (side === "x") {
      throwCushion.scale.set(0.55, 1, 1); // thin against the back at +x
      throwCushion.rotation.z = -0.7;     // fallen BACK onto the seat rest
    } else {
      throwCushion.scale.set(1, 1, 0.55); // thin against the back at +z
      throwCushion.rotation.x = 0.7;      // fallen BACK onto the seat rest
    }
    throwCushion.position.set(cx, 1.58, cz);
    throwCushion.castShadow = true;
    couch.add(throwCushion);
  }
  couch.position.set(0, 0, 0);
  scene.add(tag(couch, "air", "the white couch — soft, close, and deep"));

  // ============ COFFEE TABLE (bottom-5) ============
  const coffee = new THREE.Group();
  coffee.add(mesh(new THREE.BoxGeometry(3.7, 0.12, 3.7), wood, 0, 0.92, 0));
  coffee.add(mesh(new THREE.BoxGeometry(3.3, 0.08, 3.3), wood, 0, 0.5, 0));
  for (const [x, z] of [[-1.65, -1.65], [1.65, -1.65], [-1.65, 1.65], [1.65, 1.65]]) {
    coffee.add(mesh(new THREE.BoxGeometry(0.11, 0.92, 0.11), wood, x, 0.46, z));
  }
  // the flowing-rock water feature, on the table for now
  const rockFeature = new THREE.Group();
  const brassSoft2 = new THREE.MeshStandardMaterial({ color: "#b98e4f", roughness: 0.5, metalness: 0.45 });
  // a VERTICAL rock fountain — stacked stones climbing, water threading down
  for (const [x, y, z, s] of [[0, 1.18, 0, 0.52], [-0.18, 1.85, 0.1, 0.4], [0.14, 2.45, -0.08, 0.32], [-0.05, 2.95, 0.06, 0.24]] as Array<[number, number, number, number]>) {
    const st = mesh(new THREE.DodecahedronGeometry(s, 0), stone, x, y, z);
    st.rotation.set(Math.random(), Math.random(), Math.random());
    rockFeature.add(st);
  }
  rockFeature.add(mesh(new THREE.CylinderGeometry(1.08, 1.16, 0.22, 18), brassSoft2, 0, 1.08, 0)); // the tray — collects the falling water
  const water = mesh(new THREE.CylinderGeometry(0.92, 0.92, 0.05, 18), new THREE.MeshStandardMaterial({ color: "#79cbe8", roughness: 0.15, transparent: true, opacity: 0.8, emissive: "#2f7fa0", emissiveIntensity: 0.25 }), 0, 1.18, 0);
  rockFeature.add(water);
  rockFeature.add(mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.9, 8), new THREE.MeshStandardMaterial({ color: "#aee4f5", transparent: true, opacity: 0.75, roughness: 0.1 }), 0.1, 2.0, -0.02));
  coffee.add(rockFeature);
  coffee.position.set(2.2, 0, 0.8);
  scene.add(tag(coffee, "water", "the flowing rock on the coffee table"));

  // ============ AREA RUG under the coffee table (natural) ============
  const rug = new THREE.Mesh(new RoundedBoxGeometry(7.6, 0.06, 6.3, 4, 0.35), new THREE.MeshStandardMaterial({ color: "#d9c9a8", roughness: 1 }));
  rug.position.set(2.2, 0.07, 0.8);
  rug.receiveShadow = true;
  scene.add(tag(rug, "earth", "the rug — natural, warm underfoot"));

  // ============ PROJECTOR + SCREEN — the "TV", his preference ============
  const projector = new THREE.Group();
  projector.add(mesh(new THREE.BoxGeometry(1.15, 0.42, 1.55), new THREE.MeshStandardMaterial({ color: "#2c2c33", roughness: 0.5, metalness: 0.35 }), 0, 0, 0));
  projector.add(mesh(new THREE.CylinderGeometry(0.19, 0.24, 0.3, 14), metal, -0.72, 0, 0)); // lens
  const lensGlow = mesh(new THREE.CircleGeometry(0.17, 14), new THREE.MeshStandardMaterial({ color: "#eaf4ff", emissive: "#bfe3ff", emissiveIntensity: 2.2 }), -0.88, 0, 0);
  lensGlow.rotation.y = -Math.PI / 2;
  projector.add(lensGlow);
  projector.position.set(5.5, 8.35, -4.6);
  projector.rotation.y = -Math.PI / 2;
  scene.add(tag(projector, "space", "the projector — click to turn it on or off"));
  projector.traverse((c) => (c.userData.action = "toggle-projector"));

  const screenRig = new THREE.Group();
  screenRig.add(mesh(new THREE.BoxGeometry(0.16, 0.38, 7.6), new THREE.MeshStandardMaterial({ color: "#d9d2c4", roughness: 0.6 }), -10.28, 6.95, -3.8)); // housing
  const screenCloth = mesh(
    new THREE.PlaneGeometry(7.3, 4.3),
    new THREE.MeshStandardMaterial({ color: "#e8d8bd", emissive: "#dff0ff", emissiveIntensity: 0, side: THREE.DoubleSide }),
    -10.22, 4.55, -3.8
  );
  screenCloth.rotation.y = Math.PI / 2;
  screenRig.add(screenCloth);
  scene.add(tag(screenRig, "space", "the screen — where stories land"));

  // ============ SLIDING GLASS WALL — mid-4..6 ============
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: "#cfe8f2", transparent: true, opacity: 0.22, roughness: 0.05,
    transmission: 0.75, thickness: 0.4, side: THREE.DoubleSide,
  });
  const glassPanels: THREE.Mesh[] = [];
  const glassWall = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const panel = mesh(new THREE.BoxGeometry(5.2, 10.8, 0.1), glassMat, -7.8 + i * 5.2, 5.55, 0);
    panel.userData.action = "glass-panel";
    panel.userData.panelIndex = i;
    // vertical black bars on the edges only — 4 clean panes
    for (const bx of [-2.52, 2.52]) {
      const bar = mesh(new THREE.BoxGeometry(0.11, 10.8, 0.16), new THREE.MeshStandardMaterial({ color: "#1c1c20", roughness: 0.55, metalness: 0.5 }), bx, 0, 0);
      bar.userData.action = "glass-panel";
      bar.userData.panelIndex = i;
      panel.add(bar);
    }
    glassPanels.push(panel);
    glassWall.add(panel);
    glassWall.add(mesh(new THREE.BoxGeometry(5.3, 0.16, 0.22), metal, -7.8 + i * 5.2, 11.15, 0));
    glassWall.add(mesh(new THREE.BoxGeometry(5.3, 0.16, 0.22), metal, -7.8 + i * 5.2, 0.1, 0));
  }
  glassWall.position.set(0, 0, -8.4);
  glassWall.userData = { element: "air", label: "the sliding glass — click to open to the balcony" };
  glassWall.traverse((c) => {
    c.userData = { ...c.userData, element: "air", label: "the sliding glass — click a pane to open" };
  });
  scene.add(glassWall);

  // ============ FLOOR VENTS + THERMAL WISPS (air) + FLOOR UPLIGHTS ============
  const wisps: THREE.Mesh[] = [];
  const floorLights: THREE.PointLight[] = [];
  // 2 vents left, 2 right — in the corners. Back pair = cool (blue lake air),
  // front pair = hot (red hearth air). Each: grille + wavy air + its uplight.
  const ventSpecs: Array<[number, number, boolean]> = [
    [-9.55, -6.3, false], [-9.55, 6.2, true],   // left back (cool), left front (hot)
    [9.35, -7.55, false], [9.55, 6.4, true],    // right back (cool), right front (hot)
  ];
  for (const [vx, vz, hot] of ventSpecs) {
    const airColor = hot ? "#ff6a4a" : "#6ab8ff";
    const vent = new THREE.Group();
    vent.add(mesh(new THREE.BoxGeometry(2.1, 0.12, 1.35), new THREE.MeshStandardMaterial({ color: "#3c3c42", roughness: 0.6, metalness: 0.5 }), 0, 0.06, 0));
    for (let i = 0; i < 7; i++) {
      vent.add(mesh(new THREE.BoxGeometry(0.11, 0.05, 1.15), metal, -0.9 + i * 0.3, 0.13, 0));
    }
    vent.position.set(vx, 0, vz);
    scene.add(tag(vent, "air", hot ? "the floor vent — warm air rises" : "the floor vent — cool air drifts"));

    for (let w = 0; w < 3; w++) {
      const wisp = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8, 2.4, 1, 8),
        new THREE.MeshBasicMaterial({ color: airColor, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false })
      );
      wisp.position.set(vx + (w - 1) * 0.34, 1.4, vz + (w % 2 ? 0.28 : -0.28));
      wisp.userData.phase = w * 1.7 + vz + vx;
      wisp.userData.hot = hot;
      scene.add(tag(wisp, "air", hot ? "warm waves — the room exhales" : "cool waves — the room inhales"));
      wisps.push(wisp);
    }

    const fixture = mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.09, 12), new THREE.MeshStandardMaterial({ color: "#d9c9a8", emissive: airColor, emissiveIntensity: 0.2 }), vx + (vx < 0 ? 0.95 : -0.95), 0.05, vz);
    scene.add(tag(fixture, "air", "the vent light — it wakes with the air"));
    const uplight = new THREE.PointLight(airColor, 0, 11, 2);
    uplight.position.set(vx + (vx < 0 ? 0.95 : -0.95), 0.4, vz);
    scene.add(uplight);
    floorLights.push(uplight);
  }

  // the wall switch — on the right wall near the entrance
  const lightSwitch = new THREE.Group();
  lightSwitch.add(mesh(new THREE.BoxGeometry(0.1, 0.85, 0.5), new THREE.MeshStandardMaterial({ color: "#e8dcc8", roughness: 0.6 }), 0, 0, 0));
  const lever = mesh(new THREE.BoxGeometry(0.14, 0.34, 0.16), new THREE.MeshStandardMaterial({ color: "#f2efe8", roughness: 0.5 }), -0.09, 0.06, 0);
  lever.userData.action = "toggle-vents";
  lightSwitch.add(lever);
  lightSwitch.position.set(10.28, 1.45, 6.9);
  lightSwitch.userData = { element: "air", label: "the switch — click to breathe the air on or off" };
  lightSwitch.traverse((c) => {
    c.userData = { ...c.userData, element: "air", label: "the switch — click to breathe the air on or off" };
  });
  lever.userData.action = "toggle-vents";
  scene.add(lightSwitch);

  // ============ FLOATING ROCKS — waterfall stones adrift indoors ============
  const floatRocks: THREE.Mesh[] = [];
  for (const [rx, ry, rz, rs, ph] of [[-4.5, 3.4, -4.2, 0.42, 0], [-2.2, 4.6, -1.4, 0.3, 1.6], [0.8, 3.1, -5.2, 0.36, 3.1], [3.6, 4.2, -2.6, 0.26, 4.4], [-6.2, 5.1, -0.4, 0.22, 5.5], [1.9, 5.4, -6.3, 0.3, 2.3]] as Array<[number, number, number, number, number]>) {
    const fr = mesh(new THREE.DodecahedronGeometry(rs, 0), stone, rx, ry, rz);
    fr.rotation.set(Math.random(), Math.random(), Math.random());
    fr.userData.baseY = ry;
    fr.userData.phase = ph;
    scene.add(tag(fr, "water", "a stone adrift — the waterfall's memory"));
    floatRocks.push(fr);
  }

  // ============ WATERFALL plunge pool (slot 9) ============
  const plungePool = new THREE.Mesh(
    new THREE.CylinderGeometry(2.4, 2.8, 0.25, 16),
    new THREE.MeshStandardMaterial({ color: "#79cbe8", roughness: 0.15, transparent: true, opacity: 0.85, emissive: "#2f7fa0", emissiveIntensity: 0.3 })
  );
  plungePool.position.set(-7, -8.6, -14.6);
  scene.add(tag(plungePool, "water", "the plunge pool — where the fall lands"));

  // (the stray standing water body is gone — the fountain tray holds the water now)

  const glass = new THREE.Group();
  glass.add(mesh(new THREE.CylinderGeometry(0.32, 0.26, 0.85, 14), new THREE.MeshPhysicalMaterial({ color: "#dff2f7", transparent: true, opacity: 0.35, roughness: 0.05, transmission: 0.6 }), 0, 0.43, 0));
  glass.add(mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.5, 14), new THREE.MeshStandardMaterial({ color: "#8fd2e8", transparent: true, opacity: 0.65 }), 0, 0.28, 0));
  glass.position.set(-8.1, 2.8, 6.6);
  scene.add(tag(glass, "water", "a glass of water — small and complete"));

  // ============ FIRE PIT (between 5-8) + outside chair ============
  const firePit = new THREE.Group();
  firePit.add(mesh(new THREE.CylinderGeometry(1.35, 1.55, 0.55, 14), stone, 0, 0.28, 0));
  firePit.add(mesh(new THREE.CylinderGeometry(1.0, 1.05, 0.3, 12), new THREE.MeshStandardMaterial({ color: "#241a12", roughness: 1 }), 0, 0.58, 0));
  const fireCone = mesh(new THREE.ConeGeometry(0.62, 1.15, 8), new THREE.MeshStandardMaterial({ color: "#ff8a2e", emissive: "#ff6a1f", emissiveIntensity: 2.3 }), 0, 1.05, 0);
  firePit.add(fireCone);
  firePit.add(mesh(new THREE.ConeGeometry(0.34, 0.7, 7), new THREE.MeshStandardMaterial({ color: "#ffc46b", emissive: "#ffb03a", emissiveIntensity: 2.8 }), 0.35, 0.9, -0.2));
  const pitPlatform = mesh(new THREE.CylinderGeometry(2.1, 2.35, 0.5, 20), stone, -1.6, 0.25, -11.6);
  scene.add(tag(pitPlatform, "fire", "the fire's stone platform"));
  firePit.position.set(-1.6, 0.5, -11.6);
  scene.add(tag(firePit, "fire", "the fire pit — warmth under the sky"));

  const fire = new THREE.PointLight("#ff7a2a", 22, 22, 2);
  fire.position.set(-1.6, 2.0, -11.6);
  scene.add(fire);

  // ONE semicircle bench behind the fire, facing the house
  const bench = new THREE.Group();
  const benchArc = new THREE.Mesh(new THREE.TorusGeometry(2.95, 0.5, 8, 26, Math.PI * 0.85), darkWood);
  benchArc.rotation.z = 0.23;
  benchArc.rotation.x = -Math.PI / 2;
  benchArc.position.y = 1.02;
  benchArc.castShadow = true;
  bench.add(benchArc);
  const benchPad = new THREE.Mesh(new THREE.TorusGeometry(2.95, 0.3, 8, 26, Math.PI * 0.85), new THREE.MeshStandardMaterial({ color: "#e8dcc8", roughness: 0.9 }));
  benchPad.rotation.z = 0.23;
  benchPad.rotation.x = -Math.PI / 2;
  benchPad.position.y = 1.34;
  bench.add(benchPad);
  for (const la of [0.55, 1.45, 2.35, 2.9]) {
    bench.add(mesh(new THREE.CylinderGeometry(0.14, 0.18, 1.0, 8), darkWood, Math.sin(la) * 2.95, 0.5, Math.cos(la) * 2.95));
  }
  bench.position.set(-1.6, 0, -11.6);
  scene.add(tag(bench, "fire", "the semicircle bench — sit, face the fire and the house"));

  // ============ EARTH — garden near the cliff, tree on the balcony ============
  const garden = new THREE.Group();
  garden.add(mesh(new THREE.BoxGeometry(3.6, 0.5, 2.2), new THREE.MeshStandardMaterial({ color: "#5c4326", roughness: 1 }), 0, 0.25, 0));
  for (let i = 0; i < 7; i++) {
    const bush = mesh(new THREE.SphereGeometry(0.45 + Math.random() * 0.4, 8, 6), new THREE.MeshStandardMaterial({ color: i % 2 ? "#5d7a3a" : "#49662f", roughness: 1 }), -1.4 + Math.random() * 2.8, 0.85 + Math.random() * 0.35, -0.8 + Math.random() * 1.6);
    bush.scale.y = 1.35;
    garden.add(bush);
  }
  garden.add(mesh(new THREE.DodecahedronGeometry(0.55, 0), stone, 1.9, 0.55, 1.2));
  garden.add(mesh(new THREE.DodecahedronGeometry(0.32, 0), stone, -1.9, 0.4, -1.1));
  garden.position.set(-5.4, 0, -9.8);
  scene.add(tag(garden, "earth", "earth — soil, rocks, growing things"));

  // trees near the bookshelf corner (slot 7-8 side)
  for (const [tx, tz, ts] of [[9.2, -10.1, 1.15], [7.5, -11.8, 0.95], [9.8, -13.2, 0.8]] as Array<[number, number, number]>) {
    const tree = new THREE.Group();
    tree.add(mesh(new THREE.CylinderGeometry(0.32 * ts, 0.5 * ts, 3.4 * ts, 8), darkWood, 0, 1.7 * ts, 0));
    for (let i = 0; i < 5; i++) {
      const leaf = mesh(new THREE.SphereGeometry((1.5 - i * 0.16) * ts, 9, 7), new THREE.MeshStandardMaterial({ color: "#4d7038", roughness: 1 }), (Math.random() - 0.5) * 1.6 * ts, (3.6 + i * 0.75) * ts, (Math.random() - 0.5) * 1.6 * ts);
      leaf.scale.y = 0.72;
      tree.add(leaf);
    }
    tree.position.set(tx, 0, tz);
    scene.add(tag(tree, "earth", "the tree — patient company"));
  }

  // ============ THE PORTAL — lives in the bookshelf's open bay ============
  // etheric / transparent / toroidal — a way to another reality
  const portal = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.25, 0.13, 12, 42),
    new THREE.MeshStandardMaterial({ color: "#8f6ff2", emissive: "#6a48e0", emissiveIntensity: 1.6, transparent: true, opacity: 0.85 })
  );
  portal.add(ring);
  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(1.02, 0.055, 10, 36),
    new THREE.MeshStandardMaterial({ color: "#b49cff", emissive: "#8f6ff2", emissiveIntensity: 2.1, transparent: true, opacity: 0.7 })
  );
  portal.add(ring2);
  const veil = new THREE.Mesh(
    new THREE.CircleGeometry(1.12, 32),
    new THREE.MeshStandardMaterial({ color: "#2b1e57", emissive: "#4327a8", emissiveIntensity: 1.15, transparent: true, opacity: 0.32 })
  );
  portal.add(veil);
  portal.position.set(9.55, 3.1, -5.885); // inside the shelf's open bay
  portal.rotation.y = -Math.PI / 2; // faces the room
  scene.add(tag(portal, "space", "the portal — a way to another reality"));
  ring.userData.baseY = 0; // LOCAL to the portal group (was drifting to the plant)
  ring.userData.phase = 0.7;
  ring.userData.amp = 0.07;
  floatRocks.push(ring); // drifts + turns with the floating-stone animation
  ring2.userData.baseY = 0;
  ring2.userData.phase = 2.2;
  ring2.userData.amp = 0.07;
  floatRocks.push(ring2);

  // (the balcony gudi/shrine is PARKED 2026-10-12 — Frank wants to see the
  // bookshelf pooja items first. Restore here when he says the word.)

  const yogaMat = mesh(
    new THREE.BoxGeometry(8.8, 0.07, 3.0),
    new THREE.MeshStandardMaterial({ color: "#b4593f", roughness: 0.9 }),
    0, 0.06, -6.4
  );
  scene.add(tag(yogaMat, "space", "the yoga mat — silence, sun, breath"));

  return { fire, lamp: lampLight, fireCone, water, glassPanels, floorLights, wisps, screenCloth, lensGlow, floatRocks };
}

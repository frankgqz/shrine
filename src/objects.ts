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
  portalVeils: THREE.Mesh[];
  lightRay: THREE.Mesh;
  ventFins: THREE.Mesh[];
  monScreens: THREE.Mesh[];
  steamBeams: THREE.Mesh[];
  waterWheel: THREE.Group;
  lampFlame: THREE.Mesh;
}

export function buildObjects(scene: THREE.Scene): SceneObjects {
  const monScreens: THREE.Mesh[] = [];
  // ============ DESK (slot 3) — top, drawer unit, slim legs ============
  const desk = new THREE.Group();
  desk.add(mesh(new THREE.BoxGeometry(2.7, 0.16, 8.2), wood, 0, 2.72, 0));
  desk.add(mesh(new THREE.BoxGeometry(2.45, 0.1, 7.9), oak, 0, 2.6, 0)); // light-brown under-rail
  // speakers on the desk (one each side of the monitors)
  const speakersRig = new THREE.Group();
  for (const sz of [3.55, -3.35]) {
    speakersRig.add(mesh(new THREE.BoxGeometry(0.62, 1.15, 0.62), new THREE.MeshStandardMaterial({ color: "#2c2c33", roughness: 0.55 }), -1.05, 3.37, sz));
    const cone = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 12), new THREE.MeshStandardMaterial({ color: "#55555e", roughness: 0.4, metalness: 0.4 }), -0.72, 3.22, sz); // big LOW
    cone.rotation.z = Math.PI / 2;
    speakersRig.add(cone);
    const midRing = mesh(new THREE.TorusGeometry(0.255, 0.02, 8, 22), new THREE.MeshStandardMaterial({ color: "#15151a", roughness: 0.45, metalness: 0.35 }), -0.67, 3.22, sz);
    midRing.rotation.y = Math.PI / 2;
    speakersRig.add(midRing);
    const tweeter = mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshStandardMaterial({ color: "#55555e", roughness: 0.4, metalness: 0.4 }), -0.72, 3.7, sz); // small HIGH
    speakersRig.add(tweeter);
    const twRing = mesh(new THREE.TorusGeometry(0.13, 0.016, 8, 18), new THREE.MeshStandardMaterial({ color: "#15151a", roughness: 0.45, metalness: 0.35 }), -0.67, 3.7, sz);
    twRing.rotation.y = Math.PI / 2;
    speakersRig.add(twRing);
  }
  speakersRig.traverse((c) => (c.userData.action = "toggle-music"));
  desk.add(tag(speakersRig, "space", "the speakers — click for a song"));
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
  monScreens.push(portrait);
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
  monScreens.push(screen);
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
  seatShell.position.set(0, 1.86, 0);
  chair.add(seatShell);
  const seatCushion = new THREE.Mesh(new RoundedBoxGeometry(2.38, 0.36, 2.18, 4, 0.17), leather);
  seatCushion.position.set(0, 2.16, 0);
  chair.add(seatCushion);
  // rectangular back with curved edges (no more oval pillows)
  const backShell = new THREE.Mesh(new RoundedBoxGeometry(0.5, 3.15, 2.05, 4, 0.16), leather);
  backShell.position.set(-0.85, 3.99, 0);
  backShell.rotation.z = 0.1;
  chair.add(backShell);
  const backPad = new THREE.Mesh(new RoundedBoxGeometry(0.3, 2.3, 1.6, 4, 0.12), leather);
  backPad.position.set(-0.72, 3.94, 0); // recessed behind — shape without the jut
  backPad.rotation.z = 0.1;
  chair.add(backPad);
  const lumbar = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.85, 1.5, 4, 0.1), leather);
  lumbar.position.set(-0.52, 3.39, 0);
  chair.add(lumbar);
  // headrest — rectangular, extended out on two black poles
  for (const z of [-0.55, 0.55]) {
    chair.add(mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.85, 8), blackTrim, -0.92, 5.89, z));
  }
  const headrest = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.62, 1.5, 4, 0.09), leather);
  headrest.position.set(-0.88, 6.36, 0);
  headrest.rotation.z = 0.14;
  chair.add(headrest);
  // short side brackets tie the backrest to the seat; the height lever lives
  // on the SIDE of the post (not off the back)
  for (const z of [-0.82, 0.82]) {
    const bracket = mesh(new THREE.BoxGeometry(0.62, 0.16, 0.14), blackTrim, -0.78, 2.32, z);
    bracket.rotation.z = 0.55;
    chair.add(bracket);
  }
  const heightLever = mesh(new THREE.BoxGeometry(0.55, 0.11, 0.15), blackTrim, 0.32, 1.32, 0.4);
  heightLever.rotation.z = -0.22;
  chair.add(heightLever);
  for (const z of [-1.05, 1.05]) {
    const armPad = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.95, 10), blackTrim, 0.12, 2.84, z);
    armPad.rotation.z = Math.PI / 2;
    chair.add(armPad);
    chair.add(mesh(new THREE.BoxGeometry(0.17, 0.85, 0.17), blackTrim, 0.12, 2.39, z));
  }
  chair.add(mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.5, 10), blackTrim, 0, 1.12, 0));
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const arm = mesh(new THREE.BoxGeometry(0.23, 0.13, 1.35), blackTrim, Math.sin(a) * 0.6, 0.38, Math.cos(a) * 0.6);
    arm.rotation.y = a;
    chair.add(arm);
    chair.add(mesh(new THREE.SphereGeometry(0.18, 8, 6), blackTrim, Math.sin(a) * 1.22, 0.2, Math.cos(a) * 1.22)); // wheels touch the floor
  }
  chair.scale.setScalar(0.92); // a touch lower
  chair.position.set(-5.55, 0, 4.6);
  chair.rotation.y = Math.PI; // faces the computer (and its two monitors)
  scene.add(tag(chair, "air", "the chair — leather, tall, facing the work"));

  // ============ INDOOR PLANTS — slot 6, right of + below the projection ============
  for (const [px, pz, s, prot] of [[-7.2, -0.35, 0.8, 0.6], [-8.85, -0.35, 1.0, -0.5], [-9.75, -7.4, 0.95, -1.3]] as Array<[number, number, number, number]>) {
    const pot = new THREE.Group();
    pot.add(mesh(new THREE.CylinderGeometry(0.62 * s, 0.48 * s, 0.85 * s, 12), new THREE.MeshStandardMaterial({ color: "#b4593f", roughness: 0.85 }), 0, 0.42 * s, 0));
    // soil visible at the top of the pot
    pot.add(mesh(new THREE.CylinderGeometry(0.55 * s, 0.55 * s, 0.1, 12), new THREE.MeshStandardMaterial({ color: "#4a3526", roughness: 1 }), 0, 0.86 * s, 0));
    // leaves grow in CLUSTERS — 3 clumps, each a tight family of leaves
    for (let cl = 0; cl < 3; cl++) {
      const ca = (cl / 3) * Math.PI * 2 + 0.7;
      const clx = Math.cos(ca) * 0.4 * s;
      const clz = Math.sin(ca) * 0.4 * s;
      const cly = 1.15 * s + cl * 0.5 * s;
      for (let l = 0; l < 4; l++) {
        const leaf = mesh(new THREE.SphereGeometry(0.34 * s, 8, 6), new THREE.MeshStandardMaterial({ color: (cl + l) % 2 ? "#4d7038" : "#5d7a3a", roughness: 1 }), clx + (Math.random() - 0.5) * 0.5 * s, cly + (Math.random() - 0.5) * 0.42 * s, clz + (Math.random() - 0.5) * 0.5 * s);
        leaf.scale.set(0.72, 1.35, 0.72);
        pot.add(leaf);
      }
    }
    // a few wooden bits standing in the soil
    for (let st2 = 0; st2 < 3; st2++) {
      const stick = mesh(new THREE.CylinderGeometry(0.02, 0.028, 0.9 + Math.random() * 0.55, 5), new THREE.MeshStandardMaterial({ color: "#8a6a48", roughness: 0.9 }), (Math.random() - 0.5) * 0.5 * s, 0.85 * s, (Math.random() - 0.5) * 0.5 * s);
      stick.rotation.set((Math.random() - 0.5) * 0.55, 0, (Math.random() - 0.5) * 0.55);
      pot.add(stick);
    }
    pot.position.set(px, 0, pz);
    pot.rotation.y = prot; // leaves turned off the projection
    scene.add(tag(pot, "earth", "indoor plant — breathing beside the screen"));
  }

  // ============ WALL SHELVES above the couch (empty for now) ============
  for (const [wy, wz] of [[3.95, 4.9], [5.35, 6.6]]) {
    const plank = mesh(new THREE.BoxGeometry(0.42, 0.12, 2.8), wood, 10.05, wy, wz);
    scene.add(tag(plank, "space", "a wall shelf — waiting"));
    for (const bz of [wz - 1.25, wz + 1.25]) {
      scene.add(mesh(new THREE.BoxGeometry(0.42, 0.35, 0.1), metal, 10.05, wy - 0.22, bz));
    }
  }

  // a little vase of flowers on the wall shelf
  const vase = new THREE.Group();
  vase.add(mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.3, 10), new THREE.MeshStandardMaterial({ color: "#c8d4e0", roughness: 0.3 }), 0, 0.15, 0));
  for (let f = 0; f < 5; f++) {
    const fang = (f / 5) * Math.PI * 2;
    vase.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.32, 5), new THREE.MeshStandardMaterial({ color: "#5d7a3a", roughness: 0.9 }), Math.sin(fang) * 0.05, 0.42, Math.cos(fang) * 0.05));
    vase.add(mesh(new THREE.SphereGeometry(0.055, 6, 5), new THREE.MeshStandardMaterial({ color: ["#e8a0b4", "#f2d27a", "#c98fbf", "#e88a7a", "#f0e6c8"][f], roughness: 0.85 }), Math.sin(fang) * 0.14, 0.62, Math.cos(fang) * 0.14));
  }
  vase.position.set(10.05, 4.01, 5.6);
  scene.add(tag(vase, "earth", "flowers on the shelf — a small bright hello"));

  // ============ A PAINTING on the right wall (a warm dusk) ============
  const paintCanvas = document.createElement("canvas");
  paintCanvas.width = 256;
  paintCanvas.height = 192;
  const pctx = paintCanvas.getContext("2d") as CanvasRenderingContext2D;
  const psky = pctx.createLinearGradient(0, 0, 0, 192);
  psky.addColorStop(0, "#f2c98a");
  psky.addColorStop(0.55, "#e8a06a");
  psky.addColorStop(1, "#7a4a52");
  pctx.fillStyle = psky;
  pctx.fillRect(0, 0, 256, 192);
  pctx.fillStyle = "#ffd9a0";
  pctx.beginPath();
  pctx.arc(172, 74, 26, 0, Math.PI * 2);
  pctx.fill();
  pctx.fillStyle = "#5a3a4a";
  pctx.beginPath();
  pctx.moveTo(0, 192);
  for (let x = 0; x <= 256; x += 16) {
    pctx.lineTo(x, 126 + Math.sin(x * 0.028) * 18 + (x % 64 === 0 ? 12 : 0));
  }
  pctx.lineTo(256, 192);
  pctx.closePath();
  pctx.fill();
  pctx.fillStyle = "#3a2a3a";
  pctx.fillRect(0, 160, 256, 32);
  const paintingTex = new THREE.CanvasTexture(paintCanvas);
  paintingTex.colorSpace = THREE.SRGBColorSpace;
  const painting = new THREE.Group();
  painting.add(mesh(new THREE.BoxGeometry(0.12, 2.9, 3.8), new THREE.MeshStandardMaterial({ color: "#6e4a2c", roughness: 0.7 }), 0, 0, 0));
  const canvasPlane = mesh(new THREE.PlaneGeometry(3.5, 2.6), new THREE.MeshStandardMaterial({ map: paintingTex, roughness: 0.8 }), -0.08, 0, 0);
  canvasPlane.rotation.y = -Math.PI / 2;
  painting.add(canvasPlane);
  painting.position.set(10.22, 6.15, 1.3);
  scene.add(tag(painting, "space", "the painting — a warm dusk held on cloth"));

  // ============ BOOKSHELF — right wall, between the glass and the couch ============
  const shelf = new THREE.Group();
  // an IKEA-style OPEN frame: two side panels, a thin back, planks between
  shelf.add(mesh(new THREE.BoxGeometry(1.5, 6.6, 0.16), wood, 0, 3.3, -1.82)); // side
  shelf.add(mesh(new THREE.BoxGeometry(1.5, 6.6, 0.16), wood, 0, 3.3, 1.82)); // side (extended toward the sofa)
  shelf.add(mesh(new THREE.BoxGeometry(0.08, 6.6, 3.6), new THREE.MeshStandardMaterial({ color: "#c9b28f", roughness: 0.85 }), 0.72, 3.3, 0)); // thin back
  const shelfYs = [0.12, 1.05, 2.25, 3.75, 5.15, 6.5];
  for (const y of shelfYs) {
    // planks 2.25/3.75 are RIGHT-ONLY — the left bay opens up for the portal
    const short = y === 2.25 || y === 3.75;
    shelf.add(mesh(new THREE.BoxGeometry(1.5, 0.1, short ? 1.15 : 3.6), wood, 0, y, short ? 1.25 : 0));
  }
  shelf.add(mesh(new THREE.BoxGeometry(1.5, 5.3, 0.12), wood, 0, 3.65, 0.75)); // one divider
  // only a FEW books — the shelf is mostly sacred things
  for (const [by, bh, bz, n] of [[1.62, 1.1, -1.35, 3], [1.62, 1.1, -0.78, 2], [1.75, 1.1, 1.22, 2]] as Array<[number, number, number, number]>) {
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
  for (const [cy, cz, cs, col] of [[3.98, 1.38, 0.24, "#b58ce0"], [4.02, 1.05, 0.18, "#8ce0d4"], [4.0, 1.5, 0.2, "#e0c98c"]] as Array<[number, number, number, string]>) {
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
  gudi.position.set(0.05, 5.2, 1.28);
  gudi.scale.setScalar(0.85);
  shelf.add(tag(gudi, "space", "the gudi — consecrated, quietly alive"));

  // a small standing diya flame beside the gudi
  shelf.add(mesh(new THREE.CylinderGeometry(0.14, 0.2, 0.12, 10), brassSoft, 0.05, 5.25, 0.6));
  shelf.add(mesh(new THREE.ConeGeometry(0.07, 0.22, 6), new THREE.MeshStandardMaterial({ color: "#ffb03a", emissive: "#ff9420", emissiveIntensity: 2.2 }), 0.05, 5.45, 0.6));

  // more pooja items — a kalash, a mala, incense, more crystals, a water bowl
  const kalash = new THREE.Group();
  kalash.add(mesh(new THREE.SphereGeometry(0.24, 10, 8), brassSoft, 0, 0.22, 0));
  kalash.add(mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.16, 10), brassSoft, 0, 0.48, 0));
  kalash.add(mesh(new THREE.SphereGeometry(0.13, 8, 6), new THREE.MeshStandardMaterial({ color: "#3f7a4e", roughness: 0.7 }), 0, 0.6, 0)); // coconut
  kalash.position.set(0.42, 1.43, 1.25);
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
  for (const [cy, cz, cs, col] of [[5.55, -1.35, 0.2, "#e08c8c"], [5.5, 1.02, 0.17, "#8cc4e0"], [2.5, 1.45, 0.19, "#c4e08c"], [5.42, -1.32, 0.15, "#d4a0e8"]] as Array<[number, number, number, string]>) {
    const crystal = mesh(new THREE.IcosahedronGeometry(cs, 0), new THREE.MeshStandardMaterial({ color: col, roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0.85 }), 0.05, cy, cz);
    crystal.scale.y = 1.55;
    shelf.add(crystal);
  }
  // esoteric things — orb, singing bowl, an obelisk, a candle pair
  const esotericOrb = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), new THREE.MeshStandardMaterial({ color: "#5a4a8a", emissive: "#7a5fd0", emissiveIntensity: 0.9, transparent: true, opacity: 0.85 }));
  esotericOrb.position.set(0.4, 1.32, 0.72);
  shelf.add(tag(esotericOrb, "space", "the orb — a held breath of violet"));
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), brassSoft);
  bowl.rotation.x = Math.PI;
  bowl.position.set(0.4, 1.38, 0.28);
  shelf.add(tag(bowl, "space", "the singing bowl — silence with a rim"));
  const obelisk = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.95, 4), new THREE.MeshStandardMaterial({ color: "#2e2438", roughness: 0.4, metalness: 0.2 }));
  obelisk.position.set(0.4, 1.65, -0.25);
  shelf.add(tag(obelisk, "space", "the obelisk — a dark finger pointing"));
  for (const [cx2, ch] of [[-0.45, 0.62], [-0.32, 0.42]] as Array<[number, number]>) {
    shelf.add(mesh(new THREE.CylinderGeometry(0.055, 0.055, ch, 8), new THREE.MeshStandardMaterial({ color: "#e8dcc8", roughness: 0.7 }), cx2, 1.22 + ch / 2, 0.62));
    shelf.add(mesh(new THREE.ConeGeometry(0.035, 0.12, 6), new THREE.MeshStandardMaterial({ color: "#ffb03a", emissive: "#ff9420", emissiveIntensity: 1.9 }), cx2, 1.22 + ch + 0.06, 0.62));
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

  shelf.position.set(9.5, 0, -4.5);
  scene.add(tag(shelf, "space", "the bookshelf — quiet company between glass and couch"));

  // ============ GHEE LAMP on the desk (fire) ============
  const gheeLamp = new THREE.Group();
  gheeLamp.add(mesh(new THREE.CylinderGeometry(0.34, 0.46, 0.22, 14), brass, 0, 0.11, 0));
  gheeLamp.add(mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.12, 12), new THREE.MeshStandardMaterial({ color: "#f2e0b8", roughness: 0.4 }), 0, 0.24, 0));
  const wickFlame = mesh(new THREE.ConeGeometry(0.1, 0.34, 7), new THREE.MeshStandardMaterial({ color: "#ffb03a", emissive: "#ff9420", emissiveIntensity: 1.7 }), 0, 0.52, 0);
  gheeLamp.add(wickFlame);
  gheeLamp.position.set(-8.1, 2.8, 1.2);
  scene.add(tag(gheeLamp, "fire", "the ghee lamp — a steady little flame"));
  const lampLight = new THREE.PointLight("#ffd489", 3.5, 8, 2);
  lampLight.position.set(-8.1, 3.3, 1.2);
  scene.add(lampLight);

  // ============ L-SHAPED COUCH (slots 1,2,4) — faces outside + projector ============
  const couch = new THREE.Group();
  const fluffy = new THREE.MeshStandardMaterial({ color: "#f4efe8", roughness: 0.95 });
  const seat = (x: number, z: number, w: number, d: number) => {
    couch.add(mesh(new THREE.BoxGeometry(w, 0.55, d), fluffy, x, 0.95, z));
    const along = w > d;
    const count = along ? Math.max(2, Math.round(w / 2.2)) : Math.max(2, Math.round(d / 2.2));
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count - 0.5;
      const cw = along ? w / count * 0.97 : w - 0.14;   // was d-0.14 here — slabs
      const cd = along ? d - 0.14 : d / count * 0.97;
      const cushion = new THREE.Mesh(new RoundedBoxGeometry(cw, 0.46, cd, 4, 0.14), fluffy);
      cushion.position.set(along ? x + t * w : x, 1.3, along ? z : z + t * d);
      cushion.castShadow = true; cushion.receiveShadow = true;
      couch.add(cushion);
    }
  };
  const back = (x: number, z: number, w: number, d: number) => {
    couch.add(mesh(new THREE.BoxGeometry(w, 1.25, d), fluffy, x, 1.75, z));
    const along = w > d;
    const count = along ? Math.max(2, Math.round(w / 2.1)) : Math.max(2, Math.round(d / 2.1));
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count - 0.5;
      const pw = along ? w / count * 0.94 : 0.42;
      const pd = along ? 0.42 : d / count * 0.94;
      const pillow = new THREE.Mesh(new RoundedBoxGeometry(pw, 1.05, pd, 4, 0.15), fluffy);
      pillow.position.set(along ? x + t * w : x, 2.12, along ? z : z + t * d);
      if (along) pillow.rotation.x = -0.14; else pillow.rotation.z = 0.14;
      pillow.castShadow = true; pillow.receiveShadow = true;
      couch.add(pillow);
    }
  };
  seat(7.22, 1.75, 1.95, 5.7); // 1,4 side — 3 segments toward the bookshelf,
  back(8.3, 1.75, 0.45, 5.7);  // seats a touch deeper toward the coffee table
  seat(3.75, 5.38, 7.7, 2.16); // the 1,2 side — the extended legroom lives here
  back(3.75, 6.65, 7.7, 0.55);
  // the corner — the two backrests meet; a corner cushion fills the nook
  const cornerBackA = new THREE.Mesh(new RoundedBoxGeometry(0.45, 1.25, 1.9, 4, 0.12), fluffy);
  cornerBackA.position.set(8.3, 1.75, 5.5);
  cornerBackA.castShadow = true; cornerBackA.receiveShadow = true;
  couch.add(cornerBackA);
  const cornerBackB = new THREE.Mesh(new RoundedBoxGeometry(1.6, 1.25, 0.5, 4, 0.12), fluffy);
  cornerBackB.position.set(7.35, 1.75, 6.65);
  cornerBackB.castShadow = true; cornerBackB.receiveShadow = true;
  couch.add(cornerBackB);
  const cornerSeat = new THREE.Mesh(new RoundedBoxGeometry(1.95, 0.46, 1.9, 4, 0.14), fluffy);
  cornerSeat.position.set(7.22, 1.3, 5.5);
  cornerSeat.castShadow = true; cornerSeat.receiveShadow = true;
  couch.add(cornerSeat);
  const cornerCushion = new THREE.Mesh(new THREE.SphereGeometry(0.72, 12, 10), fluffy);
  cornerCushion.scale.set(1, 0.85, 0.55);
  cornerCushion.position.set(7.95, 1.9, 5.98);
  cornerCushion.rotation.y = Math.PI / 4;
  cornerCushion.rotation.x = -0.42;
  cornerCushion.castShadow = true;
  couch.add(cornerCushion);
  // the sofa stands on legs
  for (const [lx, lz] of [[6.45, 0.9], [8.05, 0.9], [6.45, 2.7], [8.05, 2.7], [6.45, 4.2], [8.05, 4.2], [0.45, 4.75], [0.45, 6.25], [2.6, 4.75], [2.6, 6.25], [4.9, 4.75], [4.9, 6.25], [7.0, 4.75], [7.0, 6.25]] as Array<[number, number]>) {
    couch.add(mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.72, 8), new THREE.MeshStandardMaterial({ color: "#5d3b20", roughness: 0.7 }), lx, 0.36, lz));
  }
  // proper armrests at the two outer ends
  couch.add(mesh(new THREE.BoxGeometry(1.75, 1.25, 0.7), fluffy, 7.22, 1.58, -1.45)); // arm at the new far end
  couch.add(mesh(new THREE.BoxGeometry(0.7, 1.25, 1.95), fluffy, 0.05, 1.58, 5.5));
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
    throwCushion.position.set(cx, 1.7, cz);
    throwCushion.castShadow = true;
    couch.add(throwCushion);
  }
  couch.position.set(0, 0, 0);
  scene.add(tag(couch, "air", "the white couch — soft, close, and deep"));

  // ============ COFFEE TABLE (bottom-5) ============
  const coffee = new THREE.Group();
  coffee.add(mesh(new THREE.BoxGeometry(4.2, 0.12, 4.2), wood, 0, 0.92, 0));
  coffee.add(mesh(new THREE.BoxGeometry(3.8, 0.08, 3.8), wood, 0, 0.5, 0));
  for (const [x, z] of [[-1.9, -1.9], [1.9, -1.9], [-1.9, 1.9], [1.9, 1.9]]) {
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
  // a splash ring where the thread lands
  const splashRing = mesh(new THREE.TorusGeometry(0.35, 0.035, 6, 18), new THREE.MeshStandardMaterial({ color: "#dff2f7", transparent: true, opacity: 0.7, emissive: "#9fd8ef", emissiveIntensity: 0.6 }), 0.1, 1.21, -0.02);
  splashRing.rotation.x = Math.PI / 2;
  rockFeature.add(splashRing);
  // a little WATER WHEEL beside the rocks — animated, dipping into the tray
  const waterWheel = new THREE.Group();
  const wheelRim = new THREE.MeshStandardMaterial({ color: "#6e4a2c", roughness: 0.8 });
  for (const ry of [-0.11, 0.11]) {
    const rim = mesh(new THREE.TorusGeometry(0.52, 0.055, 6, 18), wheelRim, 0, 0, ry);
    waterWheel.add(rim);
  }
  const wheelHub = mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.34, 8), wheelRim, 0, 0, 0);
  wheelHub.rotation.x = Math.PI / 2;
  waterWheel.add(wheelHub);
  for (let sp = 0; sp < 6; sp++) {
    const wa = (sp / 6) * Math.PI * 2;
    const spoke = mesh(new THREE.BoxGeometry(0.07, 1.02, 0.06), wheelRim, 0, 0, 0);
    spoke.rotation.z = wa;
    waterWheel.add(spoke);
    const paddle = mesh(new THREE.BoxGeometry(0.24, 0.12, 0.34), wheelRim, Math.cos(wa + Math.PI / 2) * 0.52, Math.sin(wa + Math.PI / 2) * 0.52, 0);
    paddle.rotation.z = wa + Math.PI / 2;
    waterWheel.add(paddle);
  }
  waterWheel.position.set(-0.38, 1.55, -0.58); // hugging the rock — the water reaches it
  waterWheel.rotation.y = 0.5;
  rockFeature.add(tag(waterWheel, "water", "the water wheel — turning in the little fall"));
  coffee.add(rockFeature);
  coffee.position.set(2.2, 0, 0.8);
  scene.add(tag(coffee, "water", "the flowing rock on the coffee table"));

  // ============ AREA RUG under the coffee table (natural) ============
  const rug = new THREE.Mesh(new RoundedBoxGeometry(8.9, 0.06, 7.4, 4, 0.35), new THREE.MeshStandardMaterial({ color: "#ece8e0", roughness: 1 }));
  rug.position.set(2.2, 0.07, 0.8);
  rug.receiveShadow = true;
  scene.add(tag(rug, "earth", "the rug — natural, warm underfoot"));

  // ============ PROJECTOR + SCREEN — the "TV", his preference ============
  // ULTRA SHORT THROW — sits on the floor under the projection
  const ust = new THREE.Group();
  ust.add(mesh(new THREE.BoxGeometry(1.15, 0.48, 1.55), new THREE.MeshStandardMaterial({ color: "#f2efe8", roughness: 0.5 }), 0, 0, 0)); // white, square
  ust.add(mesh(new THREE.BoxGeometry(1.02, 0.08, 1.42), new THREE.MeshStandardMaterial({ color: "#e8e2d5", roughness: 0.4 }), 0, 0.27, 0));
  const lensGlow = mesh(new THREE.BoxGeometry(0.07, 0.04, 1.15), new THREE.MeshStandardMaterial({ color: "#eaf4ff", emissive: "#bfe3ff", emissiveIntensity: 2.2 }), 0.52, 0.3, 0);
  ust.add(lensGlow);
  ust.position.set(-9.35, 0.42, -3.8); // sits AWAY from the wall — there's a gap
  scene.add(tag(ust, "space", "the ultra short throw projector — click to turn it on or off"));
  ust.traverse((c) => (c.userData.action = "toggle-projector"));
  // a faint light ray toward the wall — clearest at night
  const lightRay = new THREE.Mesh(
    new THREE.ConeGeometry(1.75, 3.9, 4, 1, true),
    new THREE.MeshBasicMaterial({ color: "#cfe4ff", transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })
  );
  lightRay.position.set(-9.75, 2.35, -3.8);
  lightRay.rotation.set(Math.PI, 0, -0.45); // apex at the unit, top angled BEHIND the wall
  scene.add(tag(lightRay, "space", "the light ray — the projector's breath"));

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
    color: "#9db8c8", transparent: true, opacity: 0.38, roughness: 0.06,
    transmission: 0.55, thickness: 0.5, side: THREE.DoubleSide,
    clearcoat: 0.65, clearcoatRoughness: 0.12,
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
  const ventFins: THREE.Mesh[] = [];
  const steamBeams: THREE.Mesh[] = [];
  // a soft cloud puff texture — this is what makes steam look like steam
  const steamCanvas = document.createElement("canvas");
  steamCanvas.width = 64;
  steamCanvas.height = 64;
  const sctx = steamCanvas.getContext("2d") as CanvasRenderingContext2D;
  const grad = sctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.55, "rgba(255,255,255,0.5)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, 64, 64);
  const steamTex = new THREE.CanvasTexture(steamCanvas);
  // 2 vents left, 2 right — in the corners, grilles set diagonally. All four
  // share ONE mode color: red (warm) / blue (cool) / off, cycled by the switch.
  const ventSpecs: Array<[number, number]> = [
    [-9.55, -6.3], [-9.55, 6.2],
    [9.15, -7.55], [9.2, 6.4],
  ];
  for (const [vx, vz] of ventSpecs) {
    const airColor = "#ff6a4a"; // live mode color, recolored in the animation loop
    const vent = new THREE.Group();
    // a BLACK louvre grille like the photo: frame, dark cavity, full-width
    // blades that LIFT on one side when the air breathes
    vent.add(mesh(new THREE.BoxGeometry(2.1, 0.14, 1.5), new THREE.MeshStandardMaterial({ color: "#57402e", roughness: 0.55 }), 0, 0.07, 0));
    vent.add(mesh(new THREE.BoxGeometry(1.82, 0.1, 1.22), new THREE.MeshStandardMaterial({ color: "#3a2b20", roughness: 0.7 }), 0, 0.12, 0));
    for (let i = 0; i < 5; i++) {
      const fin = mesh(new THREE.BoxGeometry(1.82, 0.05, 0.19), new THREE.MeshStandardMaterial({ color: "#4a3626", roughness: 0.5, metalness: 0.5 }), 0, 0.19, -0.48 + i * 0.24);
      fin.rotation.x = 0.08; // nearly flush at rest
      ventFins.push(fin);
      vent.add(fin);
    }
    vent.position.set(vx, 0, vz);
    if (vx > 9 && vz > 6) vent.rotation.y = Math.PI / 2;      // vent 1: to the side
    if (vx < -9 && vz > 6) vent.rotation.y = -Math.PI / 2;    // low-3 vent: the other way
    scene.add(tag(vent, "air", "the vent grille — blades lift, steam rises"));

    for (let w = 0; w < 6; w++) {
      const wisp = new THREE.Mesh(
        new THREE.PlaneGeometry(1.7, 2.1),
        new THREE.MeshBasicMaterial({ map: steamTex, color: airColor, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false })
      );
      wisp.position.set(vx + (w - 2.5) * 0.32, 1.2 + (w % 3) * 0.55, vz + (w % 2 ? 0.28 : -0.28));
      wisp.userData.phase = w * 1.7 + vz + vx;
      wisp.userData.vx = vx;
      scene.add(tag(wisp, "air", "the air — steam when the vents breathe"));
      wisps.push(wisp);
    }

    // subtle BEAMS — the columns that rendered; gently pulsing, softly tinted
    for (let b = 0; b < 3; b++) {
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.45, 3.2, 8, 1, true),
        new THREE.MeshBasicMaterial({ color: airColor, transparent: true, opacity: 0.17, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
      );
      beam.position.set(vx + (b - 1) * 0.55, 1.75, vz + (b % 2 ? 0.2 : -0.2));
      beam.userData.phase = b * 1.3 + vz + vx;
      scene.add(tag(beam, "air", "the air — a soft beam of breath"));
      steamBeams.push(beam);
    }

    const fixture = mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.09, 12), new THREE.MeshStandardMaterial({ color: "#d9c9a8", emissive: airColor, emissiveIntensity: 0.2 }), vx + (vx < 0 ? 0.95 : -0.95), 0.05, vz);
    scene.add(tag(fixture, "air", "the vent light — it wakes with the air"));
    const uplight = new THREE.PointLight(airColor, 0, 11, 2);
    uplight.position.set(vx + (vx < 0 ? 0.95 : -0.95), 0.4, vz);
    uplight.userData.fixtureMat = fixture.material;
    scene.add(uplight);
    floorLights.push(uplight);
  }

  // the wall switch — on the right wall near the entrance
  const lightSwitch = new THREE.Group();
  lightSwitch.add(mesh(new THREE.BoxGeometry(0.1, 0.85, 0.5), new THREE.MeshStandardMaterial({ color: "#e8dcc8", roughness: 0.6 }), 0, 0, 0));
  const lever = mesh(new THREE.BoxGeometry(0.14, 0.34, 0.16), new THREE.MeshStandardMaterial({ color: "#f2efe8", roughness: 0.5 }), -0.09, 0.06, 0);
  lever.userData.action = "toggle-vents";
  lightSwitch.add(lever);
  lightSwitch.position.set(10.18, 2.3, 6.9);
  lightSwitch.userData = { element: "air", label: "the switch — warm air, cool air, or still" };
  lightSwitch.traverse((c) => {
    c.userData = { ...c.userData, element: "air", label: "the switch — warm air, cool air, or still", action: "toggle-vents" };
  });
  lever.userData.action = "toggle-vents";
  scene.add(lightSwitch);

  // a second switch above the first — the day/night switch (same as key L)
  const nightSwitch = new THREE.Group();
  nightSwitch.add(mesh(new THREE.BoxGeometry(0.1, 0.85, 0.5), new THREE.MeshStandardMaterial({ color: "#e8dcc8", roughness: 0.6 }), 0, 0, 0));
  const nightLever = mesh(new THREE.BoxGeometry(0.14, 0.34, 0.16), new THREE.MeshStandardMaterial({ color: "#f2efe8", roughness: 0.5 }), -0.09, 0.06, 0);
  nightSwitch.add(nightLever);
  nightSwitch.position.set(10.18, 7.15, 6.9);
  nightSwitch.traverse((c) => {
    c.userData = { ...c.userData, element: "space", label: "the day/night switch — click to turn the sky", action: "toggle-night" };
  });
  scene.add(nightSwitch);

  // ============ no rocks indoors (Frank 2026-10-12) ============
  const floatRocks: THREE.Mesh[] = [];

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
  glass.add(mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.42, 14), new THREE.MeshStandardMaterial({ color: "#8fd2e8", transparent: true, opacity: 0.65 }), 0, 0.21, 0));
  glass.position.set(-8.1, 2.8, 6.6);
  scene.add(tag(glass, "water", "a glass of water — small and complete"));

  // ============ FIRE PIT (between 5-8) + outside chair ============
  const firePit = new THREE.Group();
  firePit.add(mesh(new THREE.CylinderGeometry(1.35, 1.55, 0.55, 14), stone, 0, 0.28, 0));
  firePit.add(mesh(new THREE.CylinderGeometry(1.0, 1.05, 0.3, 12), new THREE.MeshStandardMaterial({ color: "#241a12", roughness: 1 }), 0, 0.58, 0));
  const fireCone = mesh(new THREE.ConeGeometry(0.62, 1.15, 8), new THREE.MeshStandardMaterial({ color: "#ff8a2e", emissive: "#ff6a1f", emissiveIntensity: 2.3 }), 0, 1.05, 0);
  firePit.add(fireCone);
  firePit.add(mesh(new THREE.ConeGeometry(0.34, 0.7, 7), new THREE.MeshStandardMaterial({ color: "#ffc46b", emissive: "#ffb03a", emissiveIntensity: 2.8 }), 0.35, 0.9, -0.2));
  // fire detail: logs + embers + inner flame + a soft glow shell
  for (const [lx, lz, lr] of [[-0.45, 0.15, 0.4], [0.35, -0.35, -0.7], [0.1, 0.5, 1.2], [-0.2, -0.55, 2.1]] as Array<[number, number, number]>) {
    const log = mesh(new THREE.CylinderGeometry(0.13, 0.17, 1.35, 7), new THREE.MeshStandardMaterial({ color: "#3a2a1c", roughness: 1 }), lx, 0.82, lz);
    log.rotation.set(Math.PI / 2, 0, lr);
    firePit.add(log);
    firePit.add(mesh(new THREE.SphereGeometry(0.09, 6, 5), new THREE.MeshStandardMaterial({ color: "#ff7a2a", emissive: "#ff5a12", emissiveIntensity: 2.2 }), lx + 0.1, 0.98, lz));
  }
  const innerFlame = mesh(new THREE.ConeGeometry(0.32, 0.95, 7), new THREE.MeshStandardMaterial({ color: "#ffe6a8", emissive: "#ffd46b", emissiveIntensity: 3.2 }), -0.12, 1.15, 0.12);
  firePit.add(innerFlame);
  const glowCone = mesh(new THREE.ConeGeometry(0.95, 1.7, 10, 1, true), new THREE.MeshBasicMaterial({ color: "#ff8a2e", transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }), 0, 1.25, 0);
  firePit.add(glowCone);
  for (let e = 0; e < 6; e++) {
    firePit.add(mesh(new THREE.SphereGeometry(0.05 + Math.random() * 0.04, 5, 4), new THREE.MeshStandardMaterial({ color: "#ffb03a", emissive: "#ff8a2e", emissiveIntensity: 2.4 }), (Math.random() - 0.5) * 1.1, 1.15 + Math.random() * 0.6, (Math.random() - 0.5) * 1.1));
  }
  firePit.position.set(-1.6, 0.35, -11.6); // no big base circle — the fire sits on the ground
  scene.add(tag(firePit, "fire", "the fire pit — warmth under the sky"));

  const fire = new THREE.PointLight("#ff7a2a", 22, 22, 2);
  fire.position.set(-1.6, 2.0, -11.6);
  scene.add(fire);

  // two SMALL seat arcs, hugging the far side from the rocks
  const bench = new THREE.Group();
  for (const startA of [-1.02, 0.2]) {
    const benchArc = new THREE.Mesh(new THREE.TorusGeometry(2.55, 0.42, 8, 16, 0.88), darkWood);
    benchArc.rotation.z = startA;
    benchArc.rotation.x = -Math.PI / 2;
    benchArc.position.y = 0.92;
    benchArc.castShadow = true;
    bench.add(benchArc);
    const benchPad = new THREE.Mesh(new THREE.TorusGeometry(2.55, 0.26, 8, 16, 0.88), new THREE.MeshStandardMaterial({ color: "#e8dcc8", roughness: 0.9 }));
    benchPad.rotation.z = startA;
    benchPad.rotation.x = -Math.PI / 2;
    benchPad.position.y = 1.2;
    bench.add(benchPad);
    for (const la of [startA + 0.15, startA + 0.72]) {
      bench.add(mesh(new THREE.CylinderGeometry(0.13, 0.17, 0.9, 8), darkWood, Math.cos(la) * 2.55, 0.45, -Math.sin(la) * 2.55));
    }
  }
  bench.position.set(-0.7, 0.35, -11.7);
  bench.rotation.y = 0.5; // opposite way, per Frank
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
    // branches reaching into the canopy
    for (let br = 0; br < 3; br++) {
      const ba = br * 2.1 + ts * 3;
      const branch = mesh(new THREE.CylinderGeometry(0.09 * ts, 0.17 * ts, 1.9 * ts, 6), darkWood, Math.cos(ba) * 0.6 * ts, (2.9 + br * 0.55) * ts, Math.sin(ba) * 0.6 * ts);
      branch.rotation.set(Math.cos(ba) * 0.9, 0, -Math.sin(ba) * 0.9);
      tree.add(branch);
    }
    // a little soil mound at the base
    const treeSoil = mesh(new THREE.SphereGeometry(1.15 * ts, 10, 8), new THREE.MeshStandardMaterial({ color: "#7a5c3e", roughness: 1 }), 0, 0.12, 0);
    treeSoil.scale.y = 0.22;
    tree.add(treeSoil);
    for (let i = 0; i < 5; i++) {
      const leaf = mesh(new THREE.SphereGeometry((1.5 - i * 0.16) * ts, 9, 7), new THREE.MeshStandardMaterial({ color: "#4d7038", roughness: 1 }), (Math.random() - 0.5) * 1.6 * ts, (3.6 + i * 0.75) * ts, (Math.random() - 0.5) * 1.6 * ts);
      leaf.scale.y = 0.72;
      tree.add(leaf);
    }
    tree.position.set(tx, 0, tz);
    scene.add(tag(tree, "earth", "the tree — patient company"));
  }

  // ============ THE PORTAL — lives in the bookshelf's open bay ============
  // faint, dark, almost transparent — static in place, the transparency
  // fluctuates like two veils merging and parting
  const portalVeils: THREE.Mesh[] = [];
  const portal = new THREE.Group();
  // (no big solid sphere — just faint circles now)
  const veilC = new THREE.Mesh(
    new THREE.CircleGeometry(1.02, 32),
    new THREE.MeshBasicMaterial({ color: "#120b22", transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide })
  );
  veilC.scale.set(0.85, 1.25, 1);
  portal.add(veilC);
  const veilA = new THREE.Mesh(
    new THREE.CircleGeometry(0.88, 32),
    new THREE.MeshBasicMaterial({ color: "#1a1030", transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide })
  );
  veilA.position.z = 0.06;
  veilA.scale.set(0.85, 1.25, 1);
  portal.add(veilA);
  const veilB = new THREE.Mesh(
    new THREE.CircleGeometry(0.68, 28),
    new THREE.MeshBasicMaterial({ color: "#241542", transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide })
  );
  veilB.position.z = 0.12;
  veilB.scale.set(0.85, 1.25, 1);
  portal.add(veilB);
  portal.position.set(9.55, 3.1, -5.885); // inside the shelf's open bay
  portal.rotation.y = -Math.PI / 2; // faces the room
  scene.add(tag(portal, "space", "the portal — a way to another reality"));
  const veilD = new THREE.Mesh(
    new THREE.CircleGeometry(1.22, 36),
    new THREE.MeshBasicMaterial({ color: "#0e081c", transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide })
  );
  veilD.position.z = -0.06;
  veilD.scale.set(0.85, 1.25, 1);
  portal.add(veilD);
  portalVeils.push(veilA, veilB, veilC, veilD);

  // (the balcony gudi/shrine is PARKED 2026-10-12 — Frank wants to see the
  // bookshelf pooja items first. Restore here when he says the word.)

  const yogaMat = mesh(
    new THREE.BoxGeometry(8.8, 0.07, 3.0),
    new THREE.MeshStandardMaterial({ color: "#b4593f", roughness: 0.9 }),
    0, 0.06, -6.4
  );
  scene.add(tag(yogaMat, "space", "the yoga mat — silence, sun, breath"));

  return { fire, lamp: lampLight, fireCone, water, glassPanels, floorLights, wisps, screenCloth, lensGlow, floatRocks, portalVeils, lightRay, ventFins, monScreens, steamBeams, waterWheel, lampFlame: wickFlame };
}

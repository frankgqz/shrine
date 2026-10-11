import * as THREE from "three";

// Every object is tagged with its element + sits in the placement grid
// (see slots.ts). Comments give slot homes, e.g. "shrine at bottom-1".

export type ElementName = "earth" | "water" | "fire" | "air" | "space";

function tag<T extends THREE.Object3D>(obj: T, element: ElementName, label: string): T {
  obj.userData = { element, label };
  obj.traverse((c) => (c.userData = { ...c.userData, element, label }));
  return obj as T;
}

const wood = new THREE.MeshStandardMaterial({ color: "#8a5a33", roughness: 0.75 });
const darkWood = new THREE.MeshStandardMaterial({ color: "#5d3b20", roughness: 0.8 });
const stone = new THREE.MeshStandardMaterial({ color: "#9b8b79", roughness: 0.95 });
const metal = new THREE.MeshStandardMaterial({ color: "#4a4a52", roughness: 0.45, metalness: 0.6 });

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
}

export function buildObjects(scene: THREE.Scene): SceneObjects {
  // ================= DESK · COMPUTER · CHAIR (3/6 — the left wall) =================
  // Desk runs along the LEFT wall, screen facing into the room
  const desk = new THREE.Group();
  desk.add(mesh(new THREE.BoxGeometry(2.6, 0.28, 6.4), wood, 0, 2.6, 0));
  for (const [x, z] of [[-1, -2.9], [1, -2.9], [-1, 2.9], [1, 2.9]]) {
    desk.add(mesh(new THREE.BoxGeometry(0.22, 2.6, 0.22), darkWood, x, 1.3, z));
  }
  desk.position.set(-8.9, 0, -1.2);
  scene.add(tag(desk, "space", "the desk — where the world is met"));

  const computer = new THREE.Group();
  computer.add(mesh(new THREE.BoxGeometry(0.16, 1.9, 3.1), metal, -1.15, 4.25, 0));
  const screen = mesh(
    new THREE.PlaneGeometry(2.85, 1.62),
    new THREE.MeshStandardMaterial({ color: "#bfe3ff", emissive: "#7fc4ff", emissiveIntensity: 0.9 }),
    -1.05, 4.25, 0
  );
  screen.rotation.y = Math.PI / 2;
  computer.add(screen);
  computer.add(mesh(new THREE.BoxGeometry(0.5, 0.12, 0.9), metal, -1.15, 3.32, 0));
  computer.add(mesh(new THREE.BoxGeometry(0.62, 0.06, 1.6), metal, -0.1, 2.78, 0.15));
  computer.position.set(-8.9, 0, -1.2);
  scene.add(tag(computer, "space", "the computer — a portal of its own"));

  const chair = new THREE.Group();
  chair.add(mesh(new THREE.BoxGeometry(1.5, 0.22, 1.5), darkWood, 0, 1.7, 0));
  chair.add(mesh(new THREE.BoxGeometry(0.2, 1.8, 1.5), darkWood, -0.68, 2.7, 0));
  for (const [x, z] of [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]]) {
    chair.add(mesh(new THREE.BoxGeometry(0.16, 1.6, 0.16), darkWood, x, 0.8, z));
  }
  chair.position.set(-5.8, 0, -1.2);
  scene.add(tag(chair, "air", "the chair — turn, breathe, rest"));

  // ================= THE SLIDING GLASS WALL (mid-4..6) =================
  // floor-to-ceiling glass; click to slide it open to the balcony
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: "#cfe8f2", transparent: true, opacity: 0.22, roughness: 0.05,
    transmission: 0.75, thickness: 0.4, side: THREE.DoubleSide,
  });
  const glassPanels: THREE.Mesh[] = [];
  const glassWall = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const panel = mesh(new THREE.BoxGeometry(5.35, 7.4, 0.1), glassMat, -8 + i * 5.35, 3.85, 0);
    panel.userData.action = "toggle-glass";
    glassPanels.push(panel);
    glassWall.add(panel);
    const frame = mesh(new THREE.BoxGeometry(5.45, 0.16, 0.22), metal, -8 + i * 5.35, 7.62, 0);
    glassWall.add(frame);
    const sill = mesh(new THREE.BoxGeometry(5.45, 0.16, 0.22), metal, -8 + i * 5.35, 0.1, 0);
    glassWall.add(sill);
  }
  glassWall.position.set(0, 0, -8.4);
  glassWall.userData = { element: "air", label: "the sliding glass — click to open to the balcony" };
  glassWall.traverse((c) => {
    if (!c.userData?.action) c.userData = { ...c.userData, element: "air", label: "the sliding glass — click to open to the balcony" };
  });
  scene.add(glassWall);

  // ================= EARTH (7/8/9 — the unpaved balcony) =================
  const garden = new THREE.Group();
  garden.add(mesh(new THREE.BoxGeometry(3.6, 0.5, 2.2), new THREE.MeshStandardMaterial({ color: "#5c4326", roughness: 1 }), 0, 0.25, 0));
  for (let i = 0; i < 7; i++) {
    const bush = mesh(new THREE.SphereGeometry(0.45 + Math.random() * 0.4, 8, 6), new THREE.MeshStandardMaterial({ color: i % 2 ? "#5d7a3a" : "#49662f", roughness: 1 }), -1.4 + Math.random() * 2.8, 0.85 + Math.random() * 0.35, -0.8 + Math.random() * 1.6);
    bush.scale.y = 1.35;
    garden.add(bush);
  }
  garden.add(mesh(new THREE.DodecahedronGeometry(0.55, 0), stone, 1.9, 0.55, 1.2));
  garden.add(mesh(new THREE.DodecahedronGeometry(0.32, 0), stone, -1.9, 0.4, -1.1));
  garden.position.set(-6.2, 0, -12.4);
  scene.add(tag(garden, "earth", "earth — soil, rocks, growing things"));

  const tree = new THREE.Group();
  tree.add(mesh(new THREE.CylinderGeometry(0.32, 0.5, 3.4, 8), darkWood, 0, 1.7, 0));
  for (let i = 0; i < 5; i++) {
    const leaf = mesh(new THREE.SphereGeometry(1.5 - i * 0.16, 9, 7), new THREE.MeshStandardMaterial({ color: "#4d7038", roughness: 1 }), (Math.random() - 0.5) * 1.6, 3.6 + i * 0.75, (Math.random() - 0.5) * 1.6);
    leaf.scale.y = 0.72;
    tree.add(leaf);
  }
  tree.position.set(6.4, 0, -12.6);
  scene.add(tag(tree, "earth", "the tree — patient company"));

  // ================= WATER (fountain on the balcony; glass on the desk) =================
  const fountain = new THREE.Group();
  fountain.add(mesh(new THREE.CylinderGeometry(1.7, 1.9, 0.85, 18), stone, 0, 0.43, 0));
  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.5, 0.12, 18),
    new THREE.MeshStandardMaterial({ color: "#79cbe8", roughness: 0.15, metalness: 0.25, emissive: "#2f7fa0", emissiveIntensity: 0.25 })
  );
  water.position.y = 0.82;
  fountain.add(water);
  fountain.add(mesh(new THREE.CylinderGeometry(0.16, 0.22, 1.25, 10), stone, 0, 1.35, 0));
  fountain.add(mesh(new THREE.CylinderGeometry(0.07, 0.1, 1.1, 8), new THREE.MeshStandardMaterial({ color: "#aee4f5", transparent: true, opacity: 0.75, roughness: 0.1 }), 0, 2.45, 0));
  fountain.position.set(1.2, 0, -12.8);
  scene.add(tag(fountain, "water", "water — the fountain speaks softly"));

  const glass = new THREE.Group();
  glass.add(mesh(new THREE.CylinderGeometry(0.32, 0.26, 0.85, 14), new THREE.MeshPhysicalMaterial({ color: "#dff2f7", transparent: true, opacity: 0.35, roughness: 0.05, transmission: 0.6 }), 0, 0.43, 0));
  glass.add(mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.5, 14), new THREE.MeshStandardMaterial({ color: "#8fd2e8", transparent: true, opacity: 0.65 }), 0, 0.28, 0));
  glass.position.set(-8.2, 2.74, 1.4);
  scene.add(tag(glass, "water", "a glass of water — small and complete"));

  // ================= FIRE (fireplace on the RIGHT wall; lamp by the desk) =================
  const hearth = new THREE.Group();
  hearth.add(mesh(new THREE.BoxGeometry(1.6, 3.4, 3.2), stone, 0, 1.7, 0));
  const mouth = mesh(new THREE.BoxGeometry(0.6, 1.7, 1.9), new THREE.MeshStandardMaterial({ color: "#241a12", roughness: 1 }), -0.72, 1.15, 0);
  hearth.add(mouth);
  const fireCone = mesh(new THREE.ConeGeometry(0.55, 1.25, 8), new THREE.MeshStandardMaterial({ color: "#ff8a2e", emissive: "#ff6a1f", emissiveIntensity: 2.2 }), -1.0, 1.05, 0);
  hearth.add(fireCone);
  hearth.position.set(9.4, 0, -4);
  scene.add(tag(hearth, "fire", "fire — warmth at the centre"));

  const fire = new THREE.PointLight("#ff7a2a", 22, 22, 2);
  fire.position.set(8.2, 1.6, -4);
  scene.add(fire);

  const lamp = new THREE.Group();
  lamp.add(mesh(new THREE.CylinderGeometry(0.09, 0.14, 2.6, 8), metal, 0, 1.3, 0));
  lamp.add(mesh(new THREE.CylinderGeometry(0.62, 0.78, 0.85, 12), new THREE.MeshStandardMaterial({ color: "#f7dfae", emissive: "#ffd489", emissiveIntensity: 1.1 }), 0, 2.95, 0));
  lamp.position.set(-7.4, 0, 3.2);
  scene.add(tag(lamp, "fire", "the lamp — a held little sun"));

  const lampLight = new THREE.PointLight("#ffd489", 14, 16, 2);
  lampLight.position.set(-7.4, 3.0, 3.2);
  scene.add(lampLight);

  // ================= AIR (ducted aircon on the right wall) =================
  const aircon = new THREE.Group();
  aircon.add(mesh(new THREE.BoxGeometry(0.55, 0.75, 3.1), new THREE.MeshStandardMaterial({ color: "#d9d2c4", roughness: 0.6 }), 0, 0, 0));
  for (let i = 0; i < 5; i++) {
    aircon.add(mesh(new THREE.BoxGeometry(0.1, 0.06, 2.7), metal, -0.31, -0.22 + i * 0.11, 0));
  }
  aircon.position.set(10.5, 6.9, 3.2);
  scene.add(tag(aircon, "air", "ducted air — the room breathes"));

  // ================= SPACE (portal right-mid; shrine at bottom-1) =================
  const portal = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.55, 0.16, 12, 42),
    new THREE.MeshStandardMaterial({ color: "#8f6ff2", emissive: "#6a48e0", emissiveIntensity: 1.8 })
  );
  ring.rotation.y = Math.PI / 2;
  portal.add(ring);
  const veil = new THREE.Mesh(
    new THREE.CircleGeometry(1.45, 32),
    new THREE.MeshStandardMaterial({ color: "#2b1e57", emissive: "#4327a8", emissiveIntensity: 1.15, transparent: true, opacity: 0.85 })
  );
  veil.rotation.y = Math.PI / 2;
  portal.add(veil);
  portal.position.set(6.6, 3.6, 1.4);
  scene.add(tag(portal, "space", "the portal — space itself"));

  const shrine = new THREE.Group();
  shrine.add(mesh(new THREE.BoxGeometry(1.7, 1.05, 1.25), stone, 0, 0.53, 0));
  shrine.add(mesh(new THREE.BoxGeometry(1.25, 0.85, 0.95), new THREE.MeshStandardMaterial({ color: "#c9973f", roughness: 0.55, metalness: 0.35 }), 0, 1.42, 0));
  const arch = mesh(new THREE.TorusGeometry(0.52, 0.09, 8, 20, Math.PI), new THREE.MeshStandardMaterial({ color: "#c9973f", roughness: 0.5, metalness: 0.4 }), 0, 2.35, 0);
  shrine.add(arch);
  const flame = mesh(new THREE.ConeGeometry(0.11, 0.32, 7), new THREE.MeshStandardMaterial({ color: "#ffb03a", emissive: "#ff9420", emissiveIntensity: 2.4 }), 0, 1.62, 0.62);
  shrine.add(flame);
  shrine.position.set(7, 0, 5.4);
  scene.add(tag(shrine, "space", "pooja shrine — the still point"));

  return { fire, lamp: lampLight, fireCone, water, glassPanels };
}

import * as THREE from "three";

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
}

export function buildObjects(scene: THREE.Scene): SceneObjects {
  // ============ DESK (slot 3) — top, drawer unit, slim legs ============
  const desk = new THREE.Group();
  desk.add(mesh(new THREE.BoxGeometry(2.7, 0.16, 8.2), wood, 0, 2.72, 0));
  desk.add(mesh(new THREE.BoxGeometry(2.45, 0.1, 7.9), oak, 0, 2.6, 0)); // light-brown under-rail
  desk.add(mesh(new THREE.BoxGeometry(2.2, 1.5, 1.7), oak, 0.05, 1.9, 2.7)); // drawer unit
  for (let i = 0; i < 3; i++) {
    desk.add(mesh(new THREE.BoxGeometry(2.24, 0.05, 0.06), metal, 0.05, 1.35 + i * 0.5, 1.84));
  }
  for (const z of [-3.65, 3.65]) {
    desk.add(mesh(new THREE.BoxGeometry(0.14, 2.7, 0.14), metal, -1.15, 1.35, z));
    desk.add(mesh(new THREE.BoxGeometry(0.14, 2.7, 0.14), metal, 1.15, 1.35, z));
  }
  desk.position.set(-8.8, 0, 4.6);
  scene.add(tag(desk, "space", "the desk — where the world is met"));

  // ============ MONITOR (slot 3) — slim bezel, stand, glowing screen ============
  const computer = new THREE.Group();
  // right: landscape monitor
  computer.add(mesh(new THREE.BoxGeometry(0.12, 2.15, 3.55), metal, -1.2, 4.35, -1.5));
  const screen = mesh(
    new THREE.PlaneGeometry(3.3, 1.92),
    new THREE.MeshStandardMaterial({ color: "#bfe3ff", emissive: "#7fc4ff", emissiveIntensity: 0.9 }),
    -1.12, 4.35, -1.5
  );
  screen.rotation.y = Math.PI / 2;
  computer.add(screen);
  computer.add(mesh(new THREE.BoxGeometry(0.5, 0.1, 1.1), metal, -1.2, 3.32, -1.5));
  computer.add(mesh(new THREE.BoxGeometry(0.16, 0.55, 0.16), metal, -1.2, 3.05, -1.5));
  // left: portrait monitor (tall)
  computer.add(mesh(new THREE.BoxGeometry(0.12, 3.4, 2.05), metal, -1.2, 5.0, 1.55));
  const portrait = mesh(
    new THREE.PlaneGeometry(1.85, 3.15),
    new THREE.MeshStandardMaterial({ color: "#cfe8ff", emissive: "#7fc4ff", emissiveIntensity: 0.75 }),
    -1.12, 5.0, 1.55
  );
  portrait.rotation.y = Math.PI / 2;
  computer.add(portrait);
  computer.add(mesh(new THREE.BoxGeometry(0.5, 0.1, 0.95), metal, -1.2, 3.32, 1.55));
  computer.add(mesh(new THREE.BoxGeometry(0.16, 0.55, 0.16), metal, -1.2, 3.05, 1.55));
  // keyboard + mouse on its right (toward -Z from the sitter)
  computer.add(mesh(new THREE.BoxGeometry(0.78, 0.06, 1.9), metal, -0.35, 2.86, -0.4)); // keyboard
  computer.add(mesh(new THREE.SphereGeometry(0.17, 10, 8), metal, -0.32, 2.95, -1.75)); // mouse
  computer.position.set(-8.8, 0, 4.6);
  scene.add(tag(computer, "space", "the computer — two windows into the world"));

  // ============ GAMING CHAIR (slot 3) — bucket seat, headrest, 5-star base ============
  const leather = new THREE.MeshStandardMaterial({ color: "#f4efe8", roughness: 0.55 });
  const blackTrim = new THREE.MeshStandardMaterial({ color: "#1c1c20", roughness: 0.5, metalness: 0.25 });
  const chair = new THREE.Group();
  chair.add(mesh(new THREE.BoxGeometry(1.35, 0.34, 1.35), leather, 0, 1.78, 0)); // seat
  chair.add(mesh(new THREE.BoxGeometry(1.2, 0.3, 1.2), leather, 0, 1.98, 0)); // seat cushion
  chair.add(mesh(new THREE.BoxGeometry(0.28, 2.35, 1.32), leather, -0.58, 3.15, 0)); // tall back
  chair.add(mesh(new THREE.BoxGeometry(0.22, 0.75, 1.1), leather, -0.42, 3.6, 0)); // lumbar cushion
  chair.add(mesh(new THREE.BoxGeometry(0.3, 0.55, 0.85), leather, -0.64, 4.55, 0)); // headrest
  for (const z of [-0.68, 0.68]) {
    chair.add(mesh(new THREE.BoxGeometry(0.68, 0.13, 0.22), blackTrim, 0.08, 2.42, z)); // black armrests
    chair.add(mesh(new THREE.BoxGeometry(0.13, 0.6, 0.13), blackTrim, 0.08, 2.1, z));
  }
  chair.add(mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.2, 10), blackTrim, 0, 1.18, 0));
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const arm = mesh(new THREE.BoxGeometry(0.17, 0.1, 1.0), blackTrim, Math.sin(a) * 0.45, 0.62, Math.cos(a) * 0.45);
    arm.rotation.y = a;
    chair.add(arm);
    chair.add(mesh(new THREE.SphereGeometry(0.13, 8, 6), blackTrim, Math.sin(a) * 0.9, 0.5, Math.cos(a) * 0.9));
  }
  chair.position.set(-5.7, 0, 4.6);
  chair.rotation.y = Math.PI; // faces the computer (and its two monitors)
  scene.add(tag(chair, "air", "the chair — leather, tall, facing the work"));

  // ============ INDOOR PLANTS — slot 6, right of + below the projection ============
  for (const [px, pz, s] of [[8.7, -7.1, 1.15], [7.5, -7.4, 0.9], [8.9, -5.9, 0.78]] as Array<[number, number, number]>) {
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

  // ============ BOOKSHELF — right wall, between the glass and the couch ============
  const shelf = new THREE.Group();
  shelf.add(mesh(new THREE.BoxGeometry(0.55, 6.4, 3.3), wood, 0, 3.2, 0));
  shelf.add(mesh(new THREE.BoxGeometry(0.42, 6.1, 3.0), new THREE.MeshStandardMaterial({ color: "#3c2f24", roughness: 0.9 }), 0.06, 3.2, 0));
  for (let s = 0; s < 4; s++) {
    shelf.add(mesh(new THREE.BoxGeometry(0.5, 0.09, 3.1), wood, 0.02, 1.15 + s * 1.55, 0));
    for (let b = 0; b < 7; b++) {
      const h = 0.75 + Math.random() * 0.45;
      const book = mesh(
        new THREE.BoxGeometry(0.3, h, 0.13 + Math.random() * 0.09),
        new THREE.MeshStandardMaterial({ color: ["#8a4b32", "#4b6a82", "#7a6a3c", "#5c4a66", "#9c6b45"][b % 5], roughness: 0.85 }),
        0.02, 1.28 + s * 1.55 + h / 2, -1.25 + b * 0.42 + (s % 2) * 0.18
      );
      shelf.add(book);
    }
  }
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
      const cushion = mesh(new THREE.SphereGeometry(along ? w / count / 1.7 : d / count / 1.7, 10, 8), fluffy, along ? x + t * w : x, 1.22, along ? z : z + t * d);
      cushion.scale.set(along ? 1.25 : 1.5, 0.62, along ? 1.5 : 1.25);
      couch.add(cushion);
    }
  };
  const back = (x: number, z: number, w: number, d: number) => {
    couch.add(mesh(new THREE.BoxGeometry(w, 1.25, d), fluffy, x, 1.62, z));
    const along = w > d;
    const count = along ? Math.max(2, Math.round(w / 2.1)) : Math.max(2, Math.round(d / 2.1));
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count - 0.5;
      const pillow = mesh(new THREE.SphereGeometry(along ? w / count / 1.65 : d / count / 1.65, 10, 8), fluffy, along ? x + t * w : x, 2.05, along ? z : z + t * d);
      pillow.scale.set(along ? 1.2 : 0.75, 1.15, along ? 0.75 : 1.2);
      couch.add(pillow);
    }
  };
  seat(8.15, -0.2, 1.9, 4.6);
  back(9.25, -0.2, 0.55, 4.6);
  seat(3.6, 5.5, 7.2, 1.9);
  back(3.6, 6.65, 7.2, 0.55);
  couch.add(mesh(new THREE.BoxGeometry(1.95, 1.05, 0.55), fluffy, 8.15, 1.3, -2.55));
  couch.add(mesh(new THREE.BoxGeometry(0.55, 1.05, 1.95), fluffy, 0.05, 1.3, 5.5));
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
  for (const [x, y, z, s] of [[-0.55, 1.12, 0.15, 0.34], [0.15, 1.2, -0.2, 0.42], [0.62, 1.1, 0.28, 0.3], [-0.1, 1.32, 0.32, 0.26]] as Array<[number, number, number, number]>) {
    rockFeature.add(mesh(new THREE.DodecahedronGeometry(s, 0), stone, x, y, z));
  }
  rockFeature.add(mesh(new THREE.CylinderGeometry(0.62, 0.7, 0.09, 14), new THREE.MeshStandardMaterial({ color: "#79cbe8", roughness: 0.15, transparent: true, opacity: 0.8, emissive: "#2f7fa0", emissiveIntensity: 0.25 }), 0, 1.02, 0));
  rockFeature.add(mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.55, 8), new THREE.MeshStandardMaterial({ color: "#aee4f5", transparent: true, opacity: 0.75, roughness: 0.1 }), 0.15, 1.45, -0.2));
  coffee.add(rockFeature);
  coffee.position.set(2.4, 0, 0.4);
  scene.add(tag(coffee, "water", "the flowing rock on the coffee table"));

  // ============ PROJECTOR + SCREEN — the "TV", his preference ============
  const projector = new THREE.Group();
  projector.add(mesh(new THREE.BoxGeometry(1.15, 0.42, 1.55), new THREE.MeshStandardMaterial({ color: "#2c2c33", roughness: 0.5, metalness: 0.35 }), 0, 0, 0));
  projector.add(mesh(new THREE.CylinderGeometry(0.19, 0.24, 0.3, 14), metal, -0.72, 0, 0)); // lens
  const lensGlow = mesh(new THREE.CircleGeometry(0.17, 14), new THREE.MeshStandardMaterial({ color: "#eaf4ff", emissive: "#bfe3ff", emissiveIntensity: 2.2 }), -0.88, 0, 0);
  lensGlow.rotation.y = -Math.PI / 2;
  projector.add(lensGlow);
  projector.position.set(5.5, 8.35, -4.6);
  projector.rotation.y = -Math.PI / 2 - 0.2;
  scene.add(tag(projector, "space", "the projector — click to turn it on or off"));
  projector.traverse((c) => (c.userData.action = "toggle-projector"));

  const screenRig = new THREE.Group();
  screenRig.add(mesh(new THREE.BoxGeometry(0.16, 0.38, 7.6), new THREE.MeshStandardMaterial({ color: "#d9d2c4", roughness: 0.6 }), -10.28, 8.95, -3.8)); // housing
  const screenCloth = mesh(
    new THREE.PlaneGeometry(7.3, 4.3),
    new THREE.MeshStandardMaterial({ color: "#e8d8bd", emissive: "#dff0ff", emissiveIntensity: 0, side: THREE.DoubleSide }),
    -10.22, 6.6, -3.8
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
    const panel = mesh(new THREE.BoxGeometry(5.2, 9, 0.1), glassMat, -7.8 + i * 5.2, 4.7, 0);
    panel.userData.action = "glass-panel";
    panel.userData.panelIndex = i;
    // vertical black bars on the edges only — 4 clean panes
    for (const bx of [-2.52, 2.52]) {
      const bar = mesh(new THREE.BoxGeometry(0.11, 9, 0.16), new THREE.MeshStandardMaterial({ color: "#1c1c20", roughness: 0.55, metalness: 0.5 }), bx, 0, 0);
      bar.userData.action = "glass-panel";
      bar.userData.panelIndex = i;
      panel.add(bar);
    }
    glassPanels.push(panel);
    glassWall.add(panel);
    glassWall.add(mesh(new THREE.BoxGeometry(5.3, 0.16, 0.22), metal, -7.8 + i * 5.2, 9.28, 0));
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

  // ============ WATERFALL plunge pool (slot 9) ============
  const plungePool = new THREE.Mesh(
    new THREE.CylinderGeometry(2.4, 2.8, 0.25, 16),
    new THREE.MeshStandardMaterial({ color: "#79cbe8", roughness: 0.15, transparent: true, opacity: 0.85, emissive: "#2f7fa0", emissiveIntensity: 0.3 })
  );
  plungePool.position.set(-7, -8.6, -14.6);
  scene.add(tag(plungePool, "water", "the plunge pool — where the fall lands"));

  // ============ the standing water body is retired — see the rock feature ============
  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(0.62, 0.7, 0.09, 14),
    new THREE.MeshStandardMaterial({ color: "#79cbe8", roughness: 0.15, emissive: "#2f7fa0", emissiveIntensity: 0.25 })
  );
  water.position.set(2.4, 1.02, 0.4);
  scene.add(water);

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
  firePit.position.set(0.5, 0, -10.8);
  scene.add(tag(firePit, "fire", "the fire pit — warmth under the sky"));

  const fire = new THREE.PointLight("#ff7a2a", 22, 22, 2);
  fire.position.set(0.5, 1.5, -10.8);
  scene.add(fire);

  const outsideChair = new THREE.Group();
  outsideChair.add(mesh(new THREE.BoxGeometry(1.45, 0.2, 1.35), darkWood, 0, 1.05, 0));
  outsideChair.add(mesh(new THREE.BoxGeometry(1.45, 1.35, 0.18), darkWood, 0, 1.85, -0.62));
  for (const [x, z] of [[-0.58, -0.52], [0.58, -0.52], [-0.58, 0.52], [0.58, 0.52]]) {
    outsideChair.add(mesh(new THREE.BoxGeometry(0.15, 0.95, 0.15), darkWood, x, 0.48, z));
  }
  outsideChair.position.set(-2.4, 0, -8.9);
  outsideChair.lookAt(new THREE.Vector3(0.5, 1, -10.8));
  scene.add(tag(outsideChair, "fire", "the outside chair — faces the fire pit"));

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

  const tree = new THREE.Group();
  tree.add(mesh(new THREE.CylinderGeometry(0.32, 0.5, 3.4, 8), darkWood, 0, 1.7, 0));
  for (let i = 0; i < 5; i++) {
    const leaf = mesh(new THREE.SphereGeometry(1.5 - i * 0.16, 9, 7), new THREE.MeshStandardMaterial({ color: "#4d7038", roughness: 1 }), (Math.random() - 0.5) * 1.6, 3.6 + i * 0.75, (Math.random() - 0.5) * 1.6);
    leaf.scale.y = 0.72;
    tree.add(leaf);
  }
  tree.position.set(3.6, 0, -13.6);
  scene.add(tag(tree, "earth", "the tree — patient company"));

  // ============ SPACE — portal right-mid; POOJA + YOGA at slot 7 ============
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
  portal.position.set(6.6, 3.6, -5.6);
  scene.add(tag(portal, "space", "the portal — space itself"));

  const shrine = new THREE.Group();
  shrine.add(mesh(new THREE.BoxGeometry(1.7, 1.05, 1.25), stone, 0, 0.53, 0));
  shrine.add(mesh(new THREE.BoxGeometry(1.25, 0.85, 0.95), brass, 0, 1.42, 0));
  shrine.add(mesh(new THREE.TorusGeometry(0.52, 0.09, 8, 20, Math.PI), brass, 0, 2.35, 0));
  shrine.add(mesh(new THREE.ConeGeometry(0.11, 0.32, 7), new THREE.MeshStandardMaterial({ color: "#ffb03a", emissive: "#ff9420", emissiveIntensity: 2.4 }), 0, 1.62, 0.62));
  shrine.position.set(7, 0, -11.6);
  scene.add(tag(shrine, "space", "pooja shrine — the still point"));

  const yogaMat = mesh(
    new THREE.BoxGeometry(2.1, 0.07, 3.6),
    new THREE.MeshStandardMaterial({ color: "#b4593f", roughness: 0.9 }),
    7, 0.06, -8.8
  );
  scene.add(tag(yogaMat, "space", "the yoga mat — silence, sun, breath"));

  return { fire, lamp: lampLight, fireCone, water, glassPanels, floorLights, wisps, screenCloth, lensGlow };
}

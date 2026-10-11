import * as THREE from "three";

// The stage (Frank's frame): camera behind (+Z, no wall), computer wall LEFT
// (-X), wall RIGHT (+X), sliding glass ahead (-Z) to the balcony. The balcony's
// LEFT-BACK section (slot 9) is a CLIFF with a waterfall falling through the
// ground into the lake. Walls are tall; the ground stops at the wall edges.

const SKY_HORIZON = new THREE.Color("#f6e2c2");

export function skyTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 2;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "#7db9dd");
  g.addColorStop(0.55, "#cfe6ef");
  g.addColorStop(1, "#f6e2c2");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 2, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function nightSkyTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 2;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "#0a1226");
  g.addColorStop(0.55, "#1b2c4d");
  g.addColorStop(1, "#3a4468");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 2, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function rock(size: number, color = "#8d7a66"): THREE.Mesh {
  const geo = new THREE.DodecahedronGeometry(size, 0);
  const pos = geo.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(
      i,
      pos.getX(i) * (0.85 + Math.random() * 0.3),
      pos.getY(i) * (0.85 + Math.random() * 0.3),
      pos.getZ(i) * (0.85 + Math.random() * 0.3)
    );
  }
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.95 }));
}

export function buildRoom(scene: THREE.Scene): void {
  scene.background = skyTexture();
  scene.fog = new THREE.Fog(SKY_HORIZON, 80, 220);

  const soilMat = new THREE.MeshStandardMaterial({ color: "#7a5c3e", roughness: 1 });

  // ---- Earth ground: stops at the walls. The left-back balcony section ends
  // early at z=-13 — that edge is the waterfall cliff (slot 9). ----
  const mainGround = new THREE.Mesh(new THREE.PlaneGeometry(21, 26.9), soilMat);
  mainGround.rotation.x = -Math.PI / 2;
  mainGround.position.set(0, 0, -5.15);
  mainGround.receiveShadow = true;
  scene.add(mainGround);

  const leftShelf = new THREE.Mesh(new THREE.PlaneGeometry(7.1, 21.3), soilMat);
  leftShelf.rotation.x = -Math.PI / 2;
  leftShelf.position.set(-7.05, 0, -2.35);
  leftShelf.receiveShadow = true;
  scene.add(leftShelf);

  // the cliff face under the left-back cut, and under the balcony generally
  const cliffMat = new THREE.MeshStandardMaterial({ color: "#77624e", roughness: 1 });
  const cliff = new THREE.Mesh(new THREE.BoxGeometry(24, 16, 27), cliffMat);
  cliff.position.set(0, -8.05, -5.2);
  cliff.receiveShadow = true;
  scene.add(cliff);

  // scatter stones + moss only within the ground footprint
  for (let i = 0; i < 30; i++) {
    const r = rock(0.12 + Math.random() * 0.3);
    const left = Math.random() < 0.45;
    r.position.set(
      left ? -10 + Math.random() * 6.5 : -3 + Math.random() * 13,
      0.06,
      left ? -12.4 + Math.random() * 20 : -18 + Math.random() * 25.5
    );
    r.rotation.y = Math.random() * Math.PI;
    r.castShadow = true;
    r.receiveShadow = true;
    scene.add(r);
  }
  for (let i = 0; i < 10; i++) {
    const patch = new THREE.Mesh(
      new THREE.CircleGeometry(0.6 + Math.random() * 1.2, 12),
      new THREE.MeshStandardMaterial({ color: "#5e6b3c", roughness: 1 })
    );
    patch.rotation.x = -Math.PI / 2;
    patch.position.set(-9 + Math.random() * 18, 0.015, -16 + Math.random() * 23);
    scene.add(patch);
  }

  // ---- Walls at the cube edges, ~20% taller (9.6) ----
  const plaster = new THREE.MeshStandardMaterial({ color: "#e8d8bd", roughness: 0.9 });
  const beamMat = new THREE.MeshStandardMaterial({ color: "#6e4a2c", roughness: 0.8 });

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 9.6, 17), plaster);
  leftWall.position.set(-10.5, 4.8, -0.2);
  leftWall.receiveShadow = true;
  scene.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 9.6, 17), plaster);
  rightWall.position.set(10.5, 4.8, -0.2);
  rightWall.receiveShadow = true;
  scene.add(rightWall);

  // Open windows on the LEFT wall (air) — frames, no glass
  for (const z of [-4.5, 2.5]) {
    const parts: Array<[number, number, number, number, number, number]> = [
      [0.5, 0.25, 4.6, -10.3, 8.95, z],
      [0.5, 0.25, 4.6, -10.3, 1.15, z],
      [0.5, 7.8, 0.25, -10.3, 5.05, z - 2.2],
      [0.5, 7.8, 0.25, -10.3, 5.05, z + 2.2],
      [0.5, 7.8, 0.12, -10.3, 5.05, z],
    ];
    for (const [w, h, d, x, y, zz] of parts) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), beamMat);
      m.position.set(x, y, zz);
      m.castShadow = true;
      scene.add(m);
    }
  }

  // ---- Railings: far balcony edge + right side + the cliff edge (gap for the waterfall) ----
  const railY = 3.2;
  const addRail = (from: THREE.Vector3, to: THREE.Vector3) => {
    const len = from.distanceTo(to);
    const mid = from.clone().lerp(to, 0.5);
    const top = new THREE.Mesh(new THREE.BoxGeometry(len, 0.22, 0.22), beamMat);
    top.position.copy(mid).setY(railY);
    top.castShadow = true;
    top.lookAt(to.clone().setY(railY));
    scene.add(top);
    const n = Math.max(2, Math.round(len / 1.6));
    for (let i = 0; i <= n; i++) {
      const p = from.clone().lerp(to, i / n);
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, railY, 0.18), beamMat);
      post.position.copy(p).setY(railY / 2);
      post.castShadow = true;
      scene.add(post);
    }
  };
  addRail(new THREE.Vector3(-3.4, 0, -18.6), new THREE.Vector3(10.5, 0, -18.6));
  addRail(new THREE.Vector3(10.5, 0, -18.6), new THREE.Vector3(10.5, 0, -8.4));
  addRail(new THREE.Vector3(-10.5, 0, -8.4), new THREE.Vector3(-10.5, 0, -13));
  // cliff edge rails with the waterfall gap at x -8.2..-5.8
  addRail(new THREE.Vector3(-10.5, 0, -13), new THREE.Vector3(-8.2, 0, -13));
  addRail(new THREE.Vector3(-5.8, 0, -13), new THREE.Vector3(-3.4, 0, -13));

  // ---- The waterfall (slot 9: top-9 -> bottom-9, through the ground) ----
  const fallMat = new THREE.MeshStandardMaterial({
    color: "#a5dcf0", transparent: true, opacity: 0.72, roughness: 0.12,
    emissive: "#4d9fc4", emissiveIntensity: 0.35, side: THREE.DoubleSide,
  });
  const waterfall = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 22), fallMat);
  waterfall.position.set(-7, -8.2, -13.15);
  scene.add(waterfall);

  // the spring source: a shelf of rock at top-9 where the water leaves
  const sourceShelf = rock(1.7, "#8d7a66");
  sourceShelf.position.set(-7, 5.4, -11.4);
  sourceShelf.castShadow = true;
  scene.add(sourceShelf);
  const sourcePool = new THREE.Mesh(
    new THREE.CylinderGeometry(1.15, 1.3, 0.3, 14),
    new THREE.MeshStandardMaterial({ color: "#79cbe8", roughness: 0.15, emissive: "#2f7fa0", emissiveIntensity: 0.25 })
  );
  sourcePool.position.set(-7, 6.35, -11.6);
  scene.add(sourcePool);
  // the stream down to the fall
  const stream = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.12, 4.2),
    new THREE.MeshStandardMaterial({ color: "#79cbe8", roughness: 0.15, transparent: true, opacity: 0.85 })
  );
  stream.position.set(-7, 0.12, -10.3);
  scene.add(stream);

  // ---- Into the distance: mountains, lake, clouds, stars ----
  const mountainMat = new THREE.MeshStandardMaterial({ color: "#93a7b4", roughness: 1, flatShading: true });
  for (let i = 0; i < 7; i++) {
    const h = 12 + Math.random() * 18;
    const m = new THREE.Mesh(new THREE.ConeGeometry(10 + Math.random() * 8, h, 5), mountainMat);
    m.position.set(-55 + i * 18 + Math.random() * 6, h / 2 - 7, -105 - Math.random() * 25);
    scene.add(m);
  }
  const lake = new THREE.Mesh(
    new THREE.PlaneGeometry(280, 140),
    new THREE.MeshStandardMaterial({ color: "#5b93b8", roughness: 0.25, metalness: 0.1 })
  );
  lake.rotation.x = -Math.PI / 2;
  lake.position.set(0, -8.5, -95);
  scene.add(lake);

  const cloudMat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 1, transparent: true, opacity: 0.85 });
  for (let i = 0; i < 6; i++) {
    const cloud = new THREE.Group();
    for (let j = 0; j < 3; j++) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(3 + Math.random() * 2.5, 10, 8), cloudMat);
      s.position.set(j * 3.4 - 3.4, Math.random() * 1.2, Math.random() * 1.6);
      cloud.add(s);
    }
    cloud.position.set(-60 + Math.random() * 120, 30 + Math.random() * 12, -95 - Math.random() * 30);
    scene.add(cloud);
  }

  const starGeo = new THREE.BufferGeometry();
  const starPts: number[] = [];
  for (let i = 0; i < 160; i++) {
    const r = 120 + Math.random() * 30;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.42;
    starPts.push(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
  }
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPts, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: "#fff7e0", size: 0.7, sizeAttenuation: true })));
}

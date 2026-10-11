import * as THREE from "three";

// The stage (Frank 2026-10-11 frame): camera sits BEHIND (+Z) — no wall there —
// computer wall on the LEFT (-X), a wall on the RIGHT (+X), and straight ahead
// (-Z) the sliding glass opens to the balcony. Beyond the balcony: cliff, lake,
// mountains, sun. The balcony floor is NOT paved (earth).

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
  scene.fog = new THREE.Fog(SKY_HORIZON, 70, 190);

  // ---- Earth: the floor and the balcony are NOT paved — one soil ground ----
  const soil = new THREE.Mesh(
    new THREE.PlaneGeometry(22, 28),
    new THREE.MeshStandardMaterial({ color: "#7a5c3e", roughness: 1 })
  );
  soil.rotation.x = -Math.PI / 2;
  soil.position.z = -5;
  soil.receiveShadow = true;
  scene.add(soil);

  for (let i = 0; i < 34; i++) {
    const r = rock(0.12 + Math.random() * 0.3);
    r.position.set(-10 + Math.random() * 20, 0.06, -17 + Math.random() * 25);
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

  // ---- The cliff the whole thing sits on ----
  const cliff = new THREE.Mesh(
    new THREE.BoxGeometry(26, 16, 32),
    new THREE.MeshStandardMaterial({ color: "#77624e", roughness: 1 })
  );
  cliff.position.set(0, -8.05, -5);
  cliff.receiveShadow = true;
  scene.add(cliff);

  // ---- Walls: LEFT (computer wall, open windows) + RIGHT (plain). NO wall behind. ----
  const plaster = new THREE.MeshStandardMaterial({ color: "#e8d8bd", roughness: 0.9 });
  const beamMat = new THREE.MeshStandardMaterial({ color: "#6e4a2c", roughness: 0.8 });

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8, 17), plaster);
  leftWall.position.set(-10.8, 4, -0.2);
  leftWall.receiveShadow = true;
  scene.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8, 17), plaster);
  rightWall.position.set(10.8, 4, -0.2);
  rightWall.receiveShadow = true;
  scene.add(rightWall);

  // Open windows on the LEFT wall (air) — frames, no glass
  for (const z of [-4.5, 2.5]) {
    const parts: Array<[number, number, number, number, number, number]> = [
      [0.5, 0.25, 4.6, -10.6, 7.35, z],
      [0.5, 0.25, 4.6, -10.6, 1.15, z],
      [0.5, 6.2, 0.25, -10.6, 4.25, z - 2.2],
      [0.5, 6.2, 0.25, -10.6, 4.25, z + 2.2],
      [0.5, 6.2, 0.12, -10.6, 4.25, z],
    ];
    for (const [w, h, d, x, y, zz] of parts) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), beamMat);
      m.position.set(x, y, zz);
      m.castShadow = true;
      scene.add(m);
    }
  }

  // ---- Balcony railing: the far edge + the two side returns ----
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
  addRail(new THREE.Vector3(-10.6, 0, -18.6), new THREE.Vector3(10.6, 0, -18.6));
  addRail(new THREE.Vector3(-10.6, 0, -18.6), new THREE.Vector3(-10.6, 0, -8.4));
  addRail(new THREE.Vector3(10.6, 0, -18.6), new THREE.Vector3(10.6, 0, -8.4));

  // ---- Into the distance: mountains, lake, clouds, stars ----
  const mountainMat = new THREE.MeshStandardMaterial({ color: "#93a7b4", roughness: 1, flatShading: true });
  for (let i = 0; i < 7; i++) {
    const h = 12 + Math.random() * 18;
    const m = new THREE.Mesh(new THREE.ConeGeometry(10 + Math.random() * 8, h, 5), mountainMat);
    m.position.set(-55 + i * 18 + Math.random() * 6, h / 2 - 7, -95 - Math.random() * 25);
    scene.add(m);
  }
  const lake = new THREE.Mesh(
    new THREE.PlaneGeometry(260, 130),
    new THREE.MeshStandardMaterial({ color: "#5b93b8", roughness: 0.25, metalness: 0.1 })
  );
  lake.rotation.x = -Math.PI / 2;
  lake.position.set(0, -7.5, -85);
  scene.add(lake);

  const cloudMat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 1, transparent: true, opacity: 0.85 });
  for (let i = 0; i < 6; i++) {
    const cloud = new THREE.Group();
    for (let j = 0; j < 3; j++) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(3 + Math.random() * 2.5, 10, 8), cloudMat);
      s.position.set(j * 3.4 - 3.4, Math.random() * 1.2, Math.random() * 1.6);
      cloud.add(s);
    }
    cloud.position.set(-60 + Math.random() * 120, 26 + Math.random() * 12, -85 - Math.random() * 30);
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

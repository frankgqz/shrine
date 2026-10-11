import * as THREE from "three";

// The balcony-room sits on a cliff: earth floor (unpaved), open windows,
// and the distance carries the elements — mountains, lake, sun, sky.

const SKY_TOP = new THREE.Color("#8ec9e8");
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
  scene.fog = new THREE.Fog(SKY_HORIZON, 60, 160);

  // ---- Earth: the balcony floor is NOT paved — soil, stones, moss ----
  const soil = new THREE.Mesh(
    new THREE.PlaneGeometry(22, 18),
    new THREE.MeshStandardMaterial({ color: "#7a5c3e", roughness: 1 })
  );
  soil.rotation.x = -Math.PI / 2;
  soil.receiveShadow = true;
  scene.add(soil);

  for (let i = 0; i < 26; i++) {
    const r = rock(0.12 + Math.random() * 0.3);
    r.position.set(-10 + Math.random() * 20, 0.06, -8 + Math.random() * 16);
    r.rotation.y = Math.random() * Math.PI;
    r.castShadow = true;
    r.receiveShadow = true;
    scene.add(r);
  }
  for (let i = 0; i < 8; i++) {
    const patch = new THREE.Mesh(
      new THREE.CircleGeometry(0.6 + Math.random() * 1.2, 12),
      new THREE.MeshStandardMaterial({ color: "#5e6b3c", roughness: 1 })
    );
    patch.rotation.x = -Math.PI / 2;
    patch.position.set(-9 + Math.random() * 18, 0.015, -7 + Math.random() * 14);
    scene.add(patch);
  }

  // ---- The cliff the balcony sits on ----
  const cliff = new THREE.Mesh(
    new THREE.BoxGeometry(24, 14, 20),
    new THREE.MeshStandardMaterial({ color: "#77624e", roughness: 1 })
  );
  cliff.position.set(0, -7.05, 0);
  cliff.receiveShadow = true;
  scene.add(cliff);

  // ---- Walls: back + left, warm plaster, with big OPEN WINDOWS (air) ----
  const plaster = new THREE.MeshStandardMaterial({ color: "#e8d8bd", roughness: 0.9 });
  const beamMat = new THREE.MeshStandardMaterial({ color: "#6e4a2c", roughness: 0.8 });

  const backWall = new THREE.Mesh(new THREE.BoxGeometry(22, 8, 0.4), plaster);
  backWall.position.set(0, 4, -8.8);
  backWall.receiveShadow = true;
  scene.add(backWall);

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8, 18), plaster);
  leftWall.position.set(-10.8, 4, 0);
  leftWall.receiveShadow = true;
  scene.add(leftWall);

  // Window openings on the left wall: frame + lintel, no glass — open air
  for (const z of [-4.5, 1.5]) {
    const frame = new THREE.Group();
    const parts: Array<[number, number, number, number, number, number]> = [
      [0.5, 0.25, 5, -10.6, 7.35, z], // lintel
      [0.5, 0.25, 5, -10.6, 1.15, z], // sill
      [0.5, 6.2, 0.25, -10.6, 4.25, z - 2.4],
      [0.5, 6.2, 0.25, -10.6, 4.25, z + 2.4],
      [0.5, 6.2, 0.12, -10.6, 4.25, z], // center mullion
    ];
    for (const [w, h, d, x, y, zz] of parts) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), beamMat);
      m.position.set(x, y, zz);
      m.castShadow = true;
      frame.add(m);
    }
    scene.add(frame);
  }

  // ---- Railing along the open edges (the balcony) ----
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
  addRail(new THREE.Vector3(-10.6, 0, 8.6), new THREE.Vector3(10.6, 0, 8.6));
  addRail(new THREE.Vector3(10.6, 0, 8.6), new THREE.Vector3(10.6, 0, -8.6));

  // ---- Into the distance: cliff edge already below; mountains + lake ----
  const mountainMat = new THREE.MeshStandardMaterial({ color: "#93a7b4", roughness: 1, flatShading: true });
  for (let i = 0; i < 7; i++) {
    const h = 12 + Math.random() * 18;
    const m = new THREE.Mesh(new THREE.ConeGeometry(10 + Math.random() * 8, h, 5), mountainMat);
    m.position.set(-55 + i * 18 + Math.random() * 6, h / 2 - 6, -85 - Math.random() * 25);
    scene.add(m);
  }
  const lake = new THREE.Mesh(
    new THREE.PlaneGeometry(240, 120),
    new THREE.MeshStandardMaterial({ color: "#5b93b8", roughness: 0.25, metalness: 0.1 })
  );
  lake.rotation.x = -Math.PI / 2;
  lake.position.set(0, -6.5, -70);
  scene.add(lake);

  // A few clouds — soft flat spheres
  const cloudMat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 1, transparent: true, opacity: 0.85 });
  for (let i = 0; i < 6; i++) {
    const cloud = new THREE.Group();
    for (let j = 0; j < 3; j++) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(3 + Math.random() * 2.5, 10, 8), cloudMat);
      s.position.set(j * 3.4 - 3.4, Math.random() * 1.2, Math.random() * 1.6);
      cloud.add(s);
    }
    cloud.position.set(-60 + Math.random() * 120, 26 + Math.random() * 12, -70 - Math.random() * 30);
    scene.add(cloud);
  }

  // Celestial hint (space, into the distance) — stars sprinkled high
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

  void SKY_TOP;
}

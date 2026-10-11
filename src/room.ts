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

  // ---- Very light wooden floorboards INSIDE the glass line ----
  const boardMat = new THREE.MeshStandardMaterial({ color: "#e8d5b5", roughness: 0.8 });
  const boardSeam = new THREE.MeshStandardMaterial({ color: "#d4bd97", roughness: 0.85 });
  const indoorFloor = new THREE.Mesh(new THREE.PlaneGeometry(21, 16.9), boardMat);
  indoorFloor.rotation.x = -Math.PI / 2;
  indoorFloor.position.set(0, 0.035, -0.05);
  indoorFloor.receiveShadow = true;
  scene.add(indoorFloor);
  for (let i = 0; i < 12; i++) {
    const seam = new THREE.Mesh(new THREE.BoxGeometry(21, 0.012, 0.07), boardSeam);
    seam.position.set(0, 0.045, -8.2 + i * 1.42);
    scene.add(seam);
  }

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
  // loose rocks live OUTSIDE — the balcony's 7-8 area and around the fall
  for (let i = 0; i < 26; i++) {
    const r = rock(0.12 + Math.random() * 0.3);
    const nearFall = Math.random() < 0.4;
    r.position.set(
      nearFall ? -9.5 + Math.random() * 5 : -2 + Math.random() * 12,
      0.06,
      nearFall ? -12.6 + Math.random() * 3.8 : -17.5 + Math.random() * 8.4
    );
    r.rotation.y = Math.random() * Math.PI;
    r.castShadow = true;
    r.receiveShadow = true;
    scene.add(r);
  }
  for (let i = 0; i < 12; i++) {
    const patch = new THREE.Mesh(
      new THREE.CircleGeometry(0.6 + Math.random() * 1.2, 12),
      new THREE.MeshStandardMaterial({ color: "#5e6b3c", roughness: 1 })
    );
    patch.rotation.x = -Math.PI / 2;
    // outdoors only — balcony side of the glass
    patch.position.set(-9 + Math.random() * 18, 0.015, -17.5 + Math.random() * 8.4);
    scene.add(patch);
  }

  // ---- Walls at the cube edges, ~20% taller (9.6) ----
  const plaster = new THREE.MeshStandardMaterial({ color: "#e8d8bd", roughness: 0.9 });
  const beamMat = new THREE.MeshStandardMaterial({ color: "#6e4a2c", roughness: 0.8 });
  const metalPostMat = new THREE.MeshStandardMaterial({ color: "#4a4a52", roughness: 0.45, metalness: 0.6 });
  const stoneChannelMat = new THREE.MeshStandardMaterial({ color: "#8d7a66", roughness: 0.95 });

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 9.6, 17), plaster);
  leftWall.position.set(-10.5, 4.8, -0.2);
  leftWall.receiveShadow = true;
  scene.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 9.6, 17), plaster);
  rightWall.position.set(10.5, 4.8, -0.2);
  rightWall.receiveShadow = true;
  scene.add(rightWall);



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
  // glass balustrade across slots 7-8 (thin metal handrail + glass panels)
  const glassRailMat = new THREE.MeshStandardMaterial({ color: "#cfe8f2", transparent: true, opacity: 0.22, roughness: 0.05, side: THREE.DoubleSide });
  for (let i = 0; i < 7; i++) {
    const gx = -2.8 + i * 2.25;
    const pane = new THREE.Mesh(new THREE.BoxGeometry(2.15, 2.9, 0.08), glassRailMat);
    pane.position.set(gx, 1.65, -18.6);
    scene.add(pane);
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.2, 0.1), metalPostMat);
    post.position.set(gx - 1.15, 1.6, -18.6);
    scene.add(post);
  }
  const handrail = new THREE.Mesh(new THREE.BoxGeometry(16.4, 0.16, 0.22), beamMat);
  handrail.position.set(3.1, 3.2, -18.6);
  scene.add(handrail);
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

  // Water path: ABOVE top-6 (over the projection, high on the left wall)
  // -> an elevated rock channel sloping back to top-9 -> the fall at slot 9
  // -> down below bottom-9 into the plunge pool and the lake.
  const waterMat = new THREE.MeshStandardMaterial({ color: "#79cbe8", roughness: 0.15, transparent: true, opacity: 0.85, emissive: "#2f7fa0", emissiveIntensity: 0.25 });

  // the spout high on the left wall, above the projection
  const spout = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 1.1), beamMat);
  spout.position.set(-10.1, 9.7, -4.6);
  scene.add(spout);

  // the elevated channel: two rock shelves with water riding them
  const channelA = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 5.6), stoneChannelMat);
  channelA.position.set(-8.6, 8.75, -6.6);
  channelA.rotation.x = -0.28;
  scene.add(channelA);
  const waterA = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.12, 5.3), waterMat);
  waterA.position.set(-8.6, 9.12, -6.55);
  waterA.rotation.x = -0.28;
  scene.add(waterA);

  const channelB = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 5.2), stoneChannelMat);
  channelB.position.set(-7.7, 6.15, -10.6);
  channelB.rotation.x = -0.42;
  scene.add(channelB);
  const waterB = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.12, 4.9), waterMat);
  waterB.position.set(-7.7, 6.55, -10.55);
  waterB.rotation.x = -0.42;
  scene.add(waterB);

  // the pool at top-9 where the fall begins
  const sourcePool = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.3, 0.3, 14), waterMat);
  sourcePool.position.set(-7, 6.2, -11.9);
  scene.add(sourcePool);
  const sourceShelf = rock(1.7, "#8d7a66");
  sourceShelf.position.set(-7, 5.15, -11.5);
  sourceShelf.castShadow = true;
  scene.add(sourceShelf);

  // rocks and shrubs around the water
  for (let i = 0; i < 9; i++) {
    const r = rock(0.35 + Math.random() * 0.75, i % 2 ? "#8d7a66" : "#77624e");
    r.position.set(-9.4 + Math.random() * 4.8, 0.25 + Math.random() * 4.2, -12.9 + Math.random() * 8.6);
    r.castShadow = true;
    scene.add(r);
    if (i % 2 === 0) {
      const shrub = new THREE.Mesh(new THREE.SphereGeometry(0.5 + Math.random() * 0.4, 8, 6), new THREE.MeshStandardMaterial({ color: "#57713c", roughness: 1 }));
      shrub.scale.y = 0.75;
      shrub.position.set(-9.2 + Math.random() * 4.4, 0.45 + Math.random() * 3.6, -12.6 + Math.random() * 8.2);
      scene.add(shrub);
    }
  }

  // the cliff face at zone 9: rock ledges from low to high
  for (let i = 0; i < 10; i++) {
    const crag = rock(1.1 + Math.random() * 1.6, i % 2 ? "#77624e" : "#6b5744");
    crag.position.set(-9.6 + Math.random() * 4.4, -13 + i * 2.1, -13.6 - Math.random() * 1.4);
    crag.castShadow = true;
    scene.add(crag);
  }

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

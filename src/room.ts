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

function rock(size: number, color = "#8a8279"): THREE.Mesh {
  const geo = new THREE.DodecahedronGeometry(size, 1);
  const pos = geo.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(
      i,
      pos.getX(i) * (0.92 + Math.random() * 0.16),
      pos.getY(i) * (0.88 + Math.random() * 0.18),
      pos.getZ(i) * (0.92 + Math.random() * 0.16)
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
  const boardMat = new THREE.MeshStandardMaterial({ color: "#b98a5e", roughness: 0.8 });
  const boardSeam = new THREE.MeshStandardMaterial({ color: "#a67a4f", roughness: 0.85 });
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

  // ---- Earth: a rounded cliff-top plateau, not a rectangle. Two bites are
  // missing: the waterfall cut at slot 9, and the outer band at 7-8 where a
  // glass walkway hangs over the drop. Ground is displaced + organic.
  const makeTerrain = (w: number, d: number, x: number, z: number, seed: number) => {
    const geo = new THREE.PlaneGeometry(w, d, 14, 14);
    const pos = geo.getAttribute("position");
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i), py = pos.getY(i);
      const edge = Math.min(w / 2 - Math.abs(px), d / 2 - Math.abs(py));
      const round = Math.min(1, Math.max(0, edge / 1.6));
      const n = Math.sin(px * 0.55 + seed) * 0.22 + Math.cos(py * 0.7 + seed * 2) * 0.18 + Math.sin((px + py) * 1.1 + seed) * 0.1;
      pos.setZ(i, n * round);
    }
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, soilMat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0, z);
    m.receiveShadow = true;
    return m;
  };
  scene.add(makeTerrain(21, 9.2, 0, -13.0, 1.3));         // the balcony plateau (outside the glass line)
  scene.add(makeTerrain(7.2, 8.2, -7.05, -11.4, 2.7));   // the slot-9 shelf (smaller, bites at the fall)
  scene.add(makeTerrain(14.2, 5.4, 3.6, -12.6, 4.1));    // the 7-8 shelf (ends short of the rail)

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
      nearFall ? -12.6 + Math.random() * 3.8 : -16.6 + Math.random() * 7.2
    );
    r.rotation.y = Math.random() * Math.PI;
    r.castShadow = true;
    r.receiveShadow = true;
    scene.add(r);
  }
  // thick bushy GRASS — clumped under the trees, lifted like little mounds;
  // the middle of the balcony stays bare dirt
  const grassBlade = new THREE.MeshStandardMaterial({ color: "#5d7a3a", roughness: 1 });
  const grassBlade2 = new THREE.MeshStandardMaterial({ color: "#6d8a45", roughness: 1 });
  const treeSpots: Array<[number, number]> = [[9.2, -10.1], [7.5, -11.8], [9.8, -13.2]];
  for (const [tx, tz] of treeSpots) {
    for (let g = 0; g < 4; g++) {
      const gx = tx + (Math.random() - 0.5) * 4.2;
      const gz = tz + (Math.random() - 0.5) * 4.2;
      const mound = new THREE.Mesh(new THREE.SphereGeometry(0.8 + Math.random() * 0.7, 10, 8), new THREE.MeshStandardMaterial({ color: "#5e6b3c", roughness: 1 }));
      mound.scale.y = 0.28;
      mound.position.set(gx, 0.16, gz);
      mound.receiveShadow = true;
      scene.add(mound);
      for (let b = 0; b < 7; b++) {
        const blade = new THREE.Mesh(new THREE.ConeGeometry(0.12 + Math.random() * 0.1, 0.85 + Math.random() * 0.55, 5), b % 2 ? grassBlade : grassBlade2);
        blade.position.set(gx + (Math.random() - 0.5) * 1.25, 0.55 + Math.random() * 0.3, gz + (Math.random() - 0.5) * 1.25);
        blade.rotation.set((Math.random() - 0.5) * 0.5, Math.random() * Math.PI, (Math.random() - 0.5) * 0.5);
        blade.castShadow = true;
        scene.add(blade);
      }
    }
  }

  // a small HERB GARDEN between the trees and the railing
  const herbBed = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.32, 2.3), new THREE.MeshStandardMaterial({ color: "#5c4326", roughness: 1 }));
  herbBed.position.set(5.6, 0.16, -14.9);
  herbBed.receiveShadow = true;
  scene.add(herbBed);
  for (let row = 0; row < 3; row++) {
    for (let h = 0; h < 7; h++) {
      const herb = new THREE.Mesh(new THREE.SphereGeometry(0.22 + Math.random() * 0.14, 8, 6), new THREE.MeshStandardMaterial({ color: ["#6d8a45", "#7da050", "#5d7a3a"][(row + h) % 3], roughness: 1 }));
      herb.scale.y = 1.25 + Math.random() * 0.4;
      herb.position.set(3.8 + h * 0.6 + (Math.random() - 0.5) * 0.16, 0.55, -15.65 + row * 0.72);
      herb.castShadow = true;
      scene.add(herb);
    }
  }

  // ---- Walls at the cube edges, ~20% taller (9.6) ----
  const plaster = new THREE.MeshStandardMaterial({ color: "#e8d8bd", roughness: 0.9 });
  const beamMat = new THREE.MeshStandardMaterial({ color: "#6e4a2c", roughness: 0.8 });
  const metalPostMat = new THREE.MeshStandardMaterial({ color: "#4a4a52", roughness: 0.45, metalness: 0.6 });
  const stoneChannelMat = new THREE.MeshStandardMaterial({ color: "#8d7a66", roughness: 0.95 });

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 11.5, 17), plaster);
  leftWall.position.set(-10.5, 5.75, -0.2);
  leftWall.receiveShadow = true;
  scene.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 11.5, 17), plaster);
  rightWall.position.set(10.5, 5.75, -0.2);
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
  // (the glass walkway is gone — it read as a striped carpet along the rail)

  // glass balustrade across slots 7-8, standing at the ground's edge
  const glassRailMat = new THREE.MeshStandardMaterial({ color: "#cfe8f2", transparent: true, opacity: 0.22, roughness: 0.05, side: THREE.DoubleSide });
  for (let i = 0; i < 7; i++) {
    const gx = -2.8 + i * 2.25;
    const pane = new THREE.Mesh(new THREE.BoxGeometry(2.15, 2.9, 0.08), glassRailMat);
    pane.position.set(gx, 1.65, -16.95);
    scene.add(pane);
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.2, 0.1), metalPostMat);
    post.position.set(gx - 1.15, 1.6, -16.95);
    scene.add(post);
  }
  const handrail = new THREE.Mesh(new THREE.BoxGeometry(16.4, 0.16, 0.22), beamMat);
  handrail.position.set(3.1, 3.2, -16.95);
  scene.add(handrail);
  // (the cliff edges at slot 9 carry no wooden poles — the drop is the point)

  // ---- Zone 9: granite boulders ON THE GROUND with a shallow channel
  // running between them (waterfall parked 2026-10-12 — water runs here later).
  const channelBed = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.2, 8.2), stoneChannelMat);
  channelBed.position.set(-7.4, 0.11, -12.6);
  channelBed.rotation.x = 0.045;
  channelBed.receiveShadow = true;
  scene.add(channelBed);

  // the water — a ribbon down the channel and a little fall onto the rocks
  const waterMat = new THREE.MeshStandardMaterial({ color: "#79cbe8", roughness: 0.12, transparent: true, opacity: 0.72, emissive: "#2f7fa0", emissiveIntensity: 0.22 });
  const ribbon = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.06, 8.0), waterMat);
  ribbon.position.set(-7.4, 0.23, -12.55);
  ribbon.rotation.x = 0.045;
  scene.add(ribbon);
  // the feeder slab up the slope + the fall tumbling onto the first boulders
  const feeder = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.35, 1.7), stoneChannelMat);
  feeder.position.set(-7.4, 1.95, -9.1);
  feeder.rotation.x = -0.32;
  feeder.castShadow = true;
  scene.add(feeder);
  const fall = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 2.05), waterMat);
  fall.position.set(-7.4, 1.05, -9.55);
  fall.rotation.x = -0.12;
  scene.add(fall);
  for (const [fx, fy, fz] of [[-7.75, 0.5, -9.9], [-7.1, 0.42, -10.15], [-7.45, 0.46, -10.5]]) {
    const foam = new THREE.Mesh(new THREE.SphereGeometry(0.3 + Math.random() * 0.18, 8, 6), new THREE.MeshStandardMaterial({ color: "#dff2f7", transparent: true, opacity: 0.8, roughness: 0.3 }));
    foam.position.set(fx, fy, fz);
    scene.add(foam);
  }

  // boulders in a NATURAL cluster around the channel (water pours into them)
  for (let i = 0; i < 18; i++) {
    const t = Math.random();
    const side = Math.random() < 0.5 ? -1 : 1;
    const spread = 1.1 + Math.random() * 1.9 + (Math.random() < 0.3 ? 1.4 : 0);
    const r = rock(0.7 + Math.random() * 1.15, ["#8a8279", "#948c82", "#7d7770"][i % 3]);
    r.position.set(-7.4 + side * spread, 0.35 + Math.random() * 0.35, -9.2 - t * 7.2 + (Math.random() - 0.5) * 1.6);
    r.rotation.set(Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.5);
    r.castShadow = true;
    r.receiveShadow = true;
    scene.add(r);
  }

  // rocks and shrubs around the water
  for (let i = 0; i < 9; i++) {
    const r = rock(0.35 + Math.random() * 0.75, i % 2 ? "#8a8279" : "#948c82");
    r.position.set(-9.4 + Math.random() * 4.8, 0.3 + Math.random() * 0.35, -12.9 + Math.random() * 6.6);
    r.castShadow = true;
    scene.add(r);
    if (i % 2 === 0) {
      const shrub = new THREE.Mesh(new THREE.SphereGeometry(0.5 + Math.random() * 0.4, 8, 6), new THREE.MeshStandardMaterial({ color: "#57713c", roughness: 1 }));
      shrub.scale.y = 0.75;
      shrub.position.set(-9.2 + Math.random() * 4.4, 0.5 + Math.random() * 0.3, -12.6 + Math.random() * 6.2);
      scene.add(shrub);
    }
  }

  // (the floating crag tower is gone — rocks live on the ground now)

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

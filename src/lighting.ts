import * as THREE from "three";

// Sun (fire, into the distance) + warm interior bounce.

export function buildLights(scene: THREE.Scene): { sun: THREE.DirectionalLight; hemi: THREE.HemisphereLight; bounce: THREE.AmbientLight } {
  const hemi = new THREE.HemisphereLight("#bfe0f2", "#6b5138", 0.85);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight("#ffe8c4", 2.6);
  sun.position.set(26, 34, -40);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 130;
  sun.shadow.camera.left = -32;
  sun.shadow.camera.right = 32;
  sun.shadow.camera.top = 32;
  sun.shadow.camera.bottom = -32;
  sun.shadow.bias = -0.0004;
  scene.add(sun);

  // the visible sun — a soft disc low over the lake
  const disc = new THREE.Mesh(
    new THREE.SphereGeometry(5.5, 20, 16),
    new THREE.MeshBasicMaterial({ color: "#fff2cf" })
  );
  disc.position.set(38, 16, -110);
  scene.add(disc);

  const bounce = new THREE.AmbientLight("#e8c9a2", 0.22);
  scene.add(bounce);

  return { sun, hemi, bounce };
}

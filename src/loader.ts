import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Bring-your-own-models door (Frank 2026-10-12): drop .glb files into
// public/models/ and load them here. CC0 packs with no attribution needed:
//   Kenney.nl · Quaternius · Poly Haven
// Keep bespoke pieces (shrine, portal, waterfall) procedural — models are for
// furniture, plants, clutter.

const loader = new GLTFLoader();

export function loadModel(
  scene: THREE.Scene,
  file: string,
  opts: {
    position?: [number, number, number];
    rotationY?: number;
    scale?: number;
    element?: "earth" | "water" | "fire" | "air" | "space";
    label?: string;
  } = {}
): void {
  loader.load(
    `/models/${file}`,
    (gltf) => {
      const root = gltf.scene;
      const [x, y, z] = opts.position ?? [0, 0, 0];
      root.position.set(x, y, z);
      root.rotation.y = opts.rotationY ?? 0;
      if (opts.scale) root.scale.setScalar(opts.scale);
      root.traverse((c) => {
        const m = c as THREE.Mesh;
        if (m.isMesh) {
          m.castShadow = true;
          m.receiveShadow = true;
        }
        if (opts.element && opts.label) c.userData = { element: opts.element, label: opts.label };
      });
      scene.add(root);
    },
    undefined,
    (err) => console.warn(`[shrine] could not load ${file}:`, err)
  );
}

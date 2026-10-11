import * as THREE from "three";

// The placement language (Frank 2026-10-11): the room is a 3x3x3 cube.
// Within each layer, 1-9 runs in depth-triplets: 1,2,3 = the CLOSE band
// (right, mid, left — slot 1 is the right side away from the computer; the
// run goes toward the computer at 3/6 on the left wall), 4,5,6 = the further
// band (near the sliding glass wall), 7,8,9 = outside on the balcony.
// Layers: bottom = floor level, mid = standing/eye level, top = high.
// The camera originates from behind/above top-1, looking at the balcony.

export type Layer = "bottom" | "mid" | "top";

export const LAYERS: Layer[] = ["bottom", "mid", "top"];

// frame: camera sits behind (+Z) looking toward the balcony (-Z).
// columns: right (+X), mid, left (-X = the computer wall)
const COL_X = [7, 0, -7]; // 1/4/7 = right, 2/5/8 = mid, 3/6/9 = left (computer)
const ROW_Z = [3, -4, -11.5]; // band 1-3 close, 4-6 near the glass, 7-9 balcony
const Y: Record<Layer, number> = { bottom: 1.1, mid: 3.9, top: 6.8 };

export function slotPos(slot: string): THREE.Vector3 | null {
  const m = slot.trim().toLowerCase().match(/^(bottom|mid|top)[-\s]?([1-9])$/);
  if (!m) return null;
  const layer = m[1] as Layer;
  const n = parseInt(m[2], 10) - 1;
  const col = n % 3;
  const row = Math.floor(n / 3);
  return new THREE.Vector3(COL_X[col], Y[layer], ROW_Z[row]);
}

const LABEL_CACHE = new Map<string, THREE.Texture>();
function labelTexture(text: string): THREE.Texture {
  let tex = LABEL_CACHE.get(text);
  if (tex) return tex;
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 64;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "rgba(20,14,10,0.72)";
  ctx.beginPath();
  ctx.roundRect(2, 2, 124, 60, 14);
  ctx.fill();
  ctx.fillStyle = "#f5ead9";
  ctx.font = "600 26px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 64, 33);
  tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  LABEL_CACHE.set(text, tex);
  return tex;
}

// The overlay: wireframe cells + labels for all 27 slots (toggle with key G)
export function buildSlotGrid(): THREE.Group {
  const group = new THREE.Group();
  group.visible = false;

  for (const layer of LAYERS) {
    for (let n = 1; n <= 9; n++) {
      const key = `${layer}-${n}`;
      const pos = slotPos(key)!;
      const cell = new THREE.Mesh(
        new THREE.BoxGeometry(5.6, 2.4, 5.6),
        new THREE.MeshBasicMaterial({ color: "#ffd489", wireframe: true, transparent: true, opacity: 0.22 })
      );
      cell.position.copy(pos);
      group.add(cell);

      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: labelTexture(key), transparent: true, depthTest: false })
      );
      sprite.position.copy(pos);
      sprite.scale.set(1.7, 0.85, 1);
      group.add(sprite);
    }
  }
  return group;
}

import * as THREE from "three";

// The placement language (Frank 2026-10-11): the room is a 3x3x3 cube.
// Numbers 1-9 run through each layer: 1 = the close right corner (not the
// balcony side, not the computer side) -> 3 = toward the computer; 4-6 = the
// middle band where the floor-to-ceiling roller stands; 7-9 = outside on the
// balcony. Layers: bottom = floor level, mid = standing/eye level, top = high.
// Say "mid-5" and we both know exactly where.

export type Layer = "bottom" | "mid" | "top";

export const LAYERS: Layer[] = ["bottom", "mid", "top"];

// room extents: x -10..10 (left wall .. open right), z -8..8.5 (back wall .. balcony edge)
const X = [-7, 0, 7]; // 1=right-ish when viewed from the corner? see note in AGENTS.md
const Z = [6, -1.5, -7]; // 1 = close to the open/balcony side -> 3 = deep, near the computer wall
const Y: Record<Layer, number> = { bottom: 1.1, mid: 3.9, top: 6.8 };

export function slotPos(slot: string): THREE.Vector3 | null {
  const m = slot.trim().toLowerCase().match(/^(bottom|mid|top)[-\s]?([1-9])$/);
  if (!m) return null;
  const layer = m[1] as Layer;
  const n = parseInt(m[2], 10) - 1;
  const col = n % 3; // 0,1,2 -> the 1-2-3 run
  const row = Math.floor(n / 3); // 0 = band 1-3, 1 = band 4-6, 2 = band 7-9
  // bands: row 0 = inside (close -> computer), row 1 = the roller wall, row 2 = balcony
  const bandZ = [6 - row * 6.5, -0.5 - row * 2, -7 + row * 3][row];
  return new THREE.Vector3(X[col], Y[layer], row === 2 ? 8.2 : bandZ);
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
        new THREE.BoxGeometry(5.4, 2.4, 5.4),
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

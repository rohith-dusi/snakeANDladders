import * as THREE from 'three';

/**
 * Creates 6 procedural canvas textures for the 6 faces of a standard D6 die.
 * Face assignment in Three.js BoxGeometry materials array:
 * [0: +X, 1: -X, 2: +Y, 3: -Y, 4: +Z, 5: -Z]
 *
 * Mapping:
 * Index 0 (+X) = 3
 * Index 1 (-X) = 4
 * Index 2 (+Y) = 1 (top face)
 * Index 3 (-Y) = 6 (bottom face)
 * Index 4 (+Z) = 2
 * Index 5 (-Z) = 5
 * Note: opposite sides sum to 7! (3+4=7, 1+6=7, 2+5=7)
 */

function createFaceCanvas(value: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Background - Ivory White with soft radial gradient and subtle texture
  const bgGrad = ctx.createRadialGradient(128, 128, 20, 128, 128, 160);
  bgGrad.addColorStop(0, '#ffffff');
  bgGrad.addColorStop(0.85, '#f8fafc');
  bgGrad.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 256, 256);

  // Soft rounded border
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, 246, 246);

  // Pip positions (coordinates from 0 to 256)
  const left = 68;
  const mid = 128;
  const right = 188;
  const top = 68;
  const bottom = 188;

  const pips: [number, number][] = [];
  switch (value) {
    case 1:
      pips.push([mid, mid]);
      break;
    case 2:
      pips.push([left, top], [right, bottom]);
      break;
    case 3:
      pips.push([left, top], [mid, mid], [right, bottom]);
      break;
    case 4:
      pips.push([left, top], [right, top], [left, bottom], [right, bottom]);
      break;
    case 5:
      pips.push([left, top], [right, top], [mid, mid], [left, bottom], [right, bottom]);
      break;
    case 6:
      pips.push(
        [left, top],
        [left, mid],
        [left, bottom],
        [right, top],
        [right, mid],
        [right, bottom]
      );
      break;
  }

  // Draw pips: 1 is crimson red, others are sleek dark navy/charcoal
  const isOne = value === 1;
  const pipRadius = isOne ? 28 : 20;

  pips.forEach(([px, py]) => {
    // Drop shadow
    ctx.beginPath();
    ctx.arc(px + 2, py + 3, pipRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fill();

    // Pip body
    const pipGrad = ctx.createRadialGradient(
      px - pipRadius * 0.3,
      py - pipRadius * 0.3,
      2,
      px,
      py,
      pipRadius
    );
    if (isOne) {
      pipGrad.addColorStop(0, '#ef4444');
      pipGrad.addColorStop(1, '#991b1b');
    } else {
      pipGrad.addColorStop(0, '#334155');
      pipGrad.addColorStop(1, '#0f172a');
    }
    ctx.beginPath();
    ctx.arc(px, py, pipRadius, 0, Math.PI * 2);
    ctx.fillStyle = pipGrad;
    ctx.fill();

    // Specular highlight on pip
    ctx.beginPath();
    ctx.arc(px - pipRadius * 0.3, py - pipRadius * 0.3, pipRadius * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fill();
  });

  return canvas;
}

export function createDiceMaterials(): THREE.MeshStandardMaterial[] {
  // Face values according to BoxGeometry material indices
  const faceValues = [3, 4, 1, 6, 2, 5];

  return faceValues.map((val) => {
    const canvas = createFaceCanvas(val);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.25,
      metalness: 0.1,
    });
  });
}

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { LADDERS, SNAKES, BOARD_SIZE, TILE_SIZE } from '../../utils/boardLogic';

interface BoardMeshProps {
  theme?: 'wood-emerald' | 'marble-royal' | 'midnight-neon';
}

function createBoardCanvasTexture(theme: string): THREE.CanvasTexture {
  const size = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const tileSizePx = size / BOARD_SIZE;

  // Background base
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, size, size);

  // Draw 100 tiles
  for (let tile = 1; tile <= 100; tile++) {
    const row = Math.floor((tile - 1) / BOARD_SIZE);
    const remainder = (tile - 1) % BOARD_SIZE;
    // Row 0 is at bottom of board in world (row 0 = bottom row in canvas -> row 9 in canvas Y)
    // Canvas Y = (9 - row) * tileSizePx
    const col = row % 2 === 0 ? remainder : BOARD_SIZE - 1 - remainder;
    const px = col * tileSizePx;
    const py = (BOARD_SIZE - 1 - row) * tileSizePx;

    // Tile color styling
    const isAlt = (row + col) % 2 === 0;
    const isWin = tile === 100;
    const isStart = tile === 1;
    const isLadderBase = !!LADDERS[tile];
    const isSnakeHead = !!SNAKES[tile];

    // Background tile fill
    let bgGrad = ctx.createLinearGradient(px, py, px + tileSizePx, py + tileSizePx);
    if (isWin) {
      bgGrad.addColorStop(0, '#fef08a');
      bgGrad.addColorStop(0.5, '#f59e0b');
      bgGrad.addColorStop(1, '#b45309');
    } else if (isStart) {
      bgGrad.addColorStop(0, '#bae6fd');
      bgGrad.addColorStop(1, '#0284c7');
    } else if (isLadderBase) {
      bgGrad.addColorStop(0, '#bbf7d0');
      bgGrad.addColorStop(1, '#22c55e');
    } else if (isSnakeHead) {
      bgGrad.addColorStop(0, '#fecaca');
      bgGrad.addColorStop(1, '#ef4444');
    } else if (theme === 'midnight-neon') {
      if (isAlt) {
        bgGrad.addColorStop(0, '#1e1b4b');
        bgGrad.addColorStop(1, '#312e81');
      } else {
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(1, '#1e293b');
      }
    } else {
      // Warm classic wood / parchment
      if (isAlt) {
        bgGrad.addColorStop(0, '#fffbeb');
        bgGrad.addColorStop(1, '#fef3c7');
      } else {
        bgGrad.addColorStop(0, '#fed7aa');
        bgGrad.addColorStop(1, '#fdba74');
      }
    }

    // Tile inner box with padding
    const pad = 4;
    ctx.fillStyle = bgGrad;
    ctx.fillRect(px + pad, py + pad, tileSizePx - pad * 2, tileSizePx - pad * 2);

    // Bevel highlights
    ctx.strokeStyle = isWin ? '#fbbf24' : isAlt ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 3;
    ctx.strokeRect(px + pad + 1, py + pad + 1, tileSizePx - pad * 2 - 2, tileSizePx - pad * 2 - 2);

    // Inner subtle drop shadow
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 2;
    ctx.strokeRect(px + pad + 3, py + pad + 3, tileSizePx - pad * 2 - 6, tileSizePx - pad * 2 - 6);

    // Draw Tile Number
    ctx.save();
    ctx.font = 'bold 44px "Outfit", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    if (isWin) {
      ctx.fillStyle = '#78350f';
    } else if (isStart) {
      ctx.fillStyle = '#0369a1';
    } else if (isLadderBase) {
      ctx.fillStyle = '#14532d';
    } else if (isSnakeHead) {
      ctx.fillStyle = '#7f1d1d';
    } else if (theme === 'midnight-neon') {
      ctx.fillStyle = '#e2e8f0';
    } else {
      ctx.fillStyle = isAlt ? '#78350f' : '#451a03';
    }

    ctx.fillText(`${tile}`, px + 16, py + 14);

    // Tile special badges or icons
    if (isWin) {
      ctx.textAlign = 'center';
      ctx.font = 'bold 36px "Outfit", sans-serif';
      ctx.fillStyle = '#78350f';
      ctx.fillText('🏆 WIN', px + tileSizePx / 2, py + tileSizePx - 46);
    } else if (isStart) {
      ctx.textAlign = 'center';
      ctx.font = 'bold 32px "Outfit", sans-serif';
      ctx.fillStyle = '#0369a1';
      ctx.fillText('★ START', px + tileSizePx / 2, py + tileSizePx - 42);
    } else if (isLadderBase) {
      ctx.textAlign = 'right';
      ctx.font = '600 28px "Outfit", sans-serif';
      ctx.fillStyle = '#166534';
      ctx.fillText(`▲ ${LADDERS[tile]}`, px + tileSizePx - 16, py + tileSizePx - 38);
    } else if (isSnakeHead) {
      ctx.textAlign = 'right';
      ctx.font = '600 28px "Outfit", sans-serif';
      ctx.fillStyle = '#991b1b';
      ctx.fillText(`▼ ${SNAKES[tile]}`, px + tileSizePx - 16, py + tileSizePx - 38);
    }

    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export const BoardMesh: React.FC<BoardMeshProps> = ({ theme = 'wood-emerald' }) => {
  const boardTexture = useMemo(() => createBoardCanvasTexture(theme), [theme]);
  const boardTotalWidth = BOARD_SIZE * TILE_SIZE; // 16.0

  return (
    <group position={[0, 0, 0]}>
      {/* Wooden / Slate Board Base Frame */}
      <mesh position={[0, -0.25, 0]} receiveShadow castShadow>
        <boxGeometry args={[boardTotalWidth + 1.2, 0.5, boardTotalWidth + 1.2]} />
        <meshStandardMaterial
          color="#1e1b18"
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>

      {/* Decorative Golden / Brass Outer Rim Inlay */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[boardTotalWidth + 0.3, 0.05, boardTotalWidth + 0.3]} />
        <meshStandardMaterial
          color="#d97706"
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* Top 10x10 Playing Surface with Procedural Texture */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[boardTotalWidth, boardTotalWidth]} />
        <meshStandardMaterial
          map={boardTexture}
          roughness={0.35}
          metalness={0.05}
        />
      </mesh>

      {/* Corner metallic brackets */}
      {[-1, 1].map((cx) =>
        [-1, 1].map((cz) => (
          <group
            key={`corner-${cx}-${cz}`}
            position={[
              (cx * (boardTotalWidth + 0.9)) / 2,
              0.02,
              (cz * (boardTotalWidth + 0.9)) / 2,
            ]}
          >
            <mesh>
              <cylinderGeometry args={[0.45, 0.55, 0.2, 16]} />
              <meshStandardMaterial
                color="#b45309"
                metalness={0.85}
                roughness={0.25}
              />
            </mesh>
            <mesh position={[0, 0.12, 0]}>
              <sphereGeometry args={[0.15, 12, 12]} />
              <meshStandardMaterial
                color="#fbbf24"
                metalness={0.9}
                roughness={0.2}
              />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
};

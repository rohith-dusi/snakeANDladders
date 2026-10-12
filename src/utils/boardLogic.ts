import { BoardTileInfo } from '../types/game';

export const BOARD_SIZE = 10;
export const TOTAL_TILES = 100;
export const TILE_SIZE = 1.6;
export const BOARD_ELEVATION = 0.2;

// Ladders: [start]: destination (climbs up)
export const LADDERS: Record<number, number> = {
  2: 38,
  7: 14,
  8: 31,
  15: 26,
  21: 42,
  28: 84,
  36: 44,
  51: 67,
  71: 91,
  78: 98,
  87: 94,
};

// Snakes: [head]: tail (slides down)
export const SNAKES: Record<number, number> = {
  16: 6,
  46: 25,
  49: 11,
  62: 19,
  64: 60,
  74: 53,
  89: 68,
  92: 88,
  95: 75,
  99: 80,
};

/**
 * Returns 3D coordinate and grid info for a given tile number (1-100).
 * Boustrophedon (zig-zag) order starting at bottom-left:
 * Row 0: 1 -> 10 (Left to Right)
 * Row 1: 20 <- 11 (Right to Left)
 * ...
 * Row 9: 100 <- 91 (Right to Left)
 */
export function getTileCoords(tile: number): BoardTileInfo {
  const clampedTile = Math.max(1, Math.min(100, Math.floor(tile)));
  const row = Math.floor((clampedTile - 1) / BOARD_SIZE);
  const remainder = (clampedTile - 1) % BOARD_SIZE;

  // Even rows go L -> R (0 to 9), Odd rows go R -> L (9 down to 0)
  const col = row % 2 === 0 ? remainder : BOARD_SIZE - 1 - remainder;

  // Center the 10x10 board at origin (0, 0, 0)
  // col 0..9 -> col - 4.5 -> -4.5 .. +4.5
  const x = (col - 4.5) * TILE_SIZE;
  // row 0 is bottom (+Z in world space), row 9 is top (-Z in world space)
  const z = (4.5 - row) * TILE_SIZE;
  const y = BOARD_ELEVATION;

  return {
    number: clampedTile,
    row,
    col,
    x,
    y,
    z,
    ladderTo: LADDERS[clampedTile],
    snakeTo: SNAKES[clampedTile],
  };
}

/**
 * Offsets pawns so multiple players on the same tile don't clip into each other.
 */
export function getPlayerTileOffset(playerIndex: number, totalPlayers: number): [number, number] {
  if (totalPlayers <= 1) return [0, 0];

  const spacing = 0.32;
  switch (playerIndex % 4) {
    case 0:
      return [-spacing, -spacing];
    case 1:
      return [spacing, -spacing];
    case 2:
      return [-spacing, spacing];
    case 3:
      return [spacing, spacing];
    default:
      return [0, 0];
  }
}

/**
 * Computes exact tile numbers traversed during a standard roll hop.
 * E.g., if at 10 and rolls 3 -> returns [11, 12, 13]
 */
export function getPathSteps(fromTile: number, roll: number): number[] {
  const steps: number[] = [];
  for (let i = 1; i <= roll; i++) {
    const nextTile = fromTile + i;
    if (nextTile <= 100) {
      steps.push(nextTile);
    }
  }
  return steps;
}

/**
 * Checks if a move results in an overshoot (landing beyond 100).
 */
export function isOvershoot(currentPos: number, roll: number): boolean {
  return currentPos + roll > 100;
}

/**
 * Palette colors for the 100 tiles, giving a warm board game aesthetic.
 */
export function getTileColor(tile: number): { base: string; border: string; accent: string } {
  // Tile 100 (Victory tile)
  if (tile === 100) {
    return { base: '#fbbf24', border: '#f59e0b', accent: '#78350f' }; // Rich gold
  }
  // Tile 1 (Start tile)
  if (tile === 1) {
    return { base: '#38bdf8', border: '#0284c7', accent: '#0369a1' }; // Sky blue
  }

  // Ladder base
  if (LADDERS[tile]) {
    return { base: '#86efac', border: '#22c55e', accent: '#15803d' }; // Emerald green
  }

  // Snake head
  if (SNAKES[tile]) {
    return { base: '#fca5a5', border: '#ef4444', accent: '#b91c1c' }; // Coral red
  }

  // Alternating wood/parchment checkered pattern
  const row = Math.floor((tile - 1) / 10);
  const col = (tile - 1) % 10;
  const isAlt = (row + col) % 2 === 0;

  if (isAlt) {
    return { base: '#fef3c7', border: '#fde68a', accent: '#92400e' }; // Warm cream
  } else {
    return { base: '#fed7aa', border: '#fdba74', accent: '#9a3412' }; // Soft peach
  }
}

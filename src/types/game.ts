export type PlayerType = 'human' | 'bot';

export type PawnShape = 'cylinder' | 'cone' | 'crown' | 'star' | 'diamond';

export interface Player {
  id: string;
  name: string;
  color: string;
  accentColor: string;
  shape: PawnShape;
  type: PlayerType;
  position: number; // 1 to 100 (starts at 1)
  previousPosition: number;
  stats: {
    turnsTaken: number;
    totalRolls: number;
    laddersClimbed: number;
    snakesHit: number;
    sixesRolled: number;
  };
}

export type GamePhase = 
  | 'idle'           // Waiting for current player to roll
  | 'rolling'        // 3D dice rolling animation
  | 'hopping'        // Pawn moving tile by tile
  | 'climbing'       // Climbing ladder
  | 'sliding'        // Sliding down snake
  | 'turn_transition'// Post-move delay, checking extra turns or next player
  | 'game_over';     // Someone won

export interface MoveLogEntry {
  id: string;
  timestamp: string;
  turnNumber: number;
  playerName: string;
  playerColor: string;
  roll: number;
  fromTile: number;
  toTile: number;
  eventType?: 'ladder' | 'snake' | 'extra_turn' | 'overshoot' | 'triple_six_penalty' | 'win';
  message: string;
}

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'snake' | 'ladder';
  title: string;
  description: string;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  animationSpeed: number; // 1 = normal, 1.5 = fast, 2 = ultra
  cameraAutoFollow: boolean;
  theme: 'wood-emerald' | 'marble-royal' | 'midnight-neon';
}

export interface BoardTileInfo {
  number: number;
  row: number;
  col: number;
  x: number;
  y: number;
  z: number;
  ladderTo?: number;
  snakeTo?: number;
}

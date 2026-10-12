# 3D Snakes & Ladders

A premium 3D Snakes & Ladders web game built with React, Three.js (@react-three/fiber, @react-three/drei), Vite, and Tailwind CSS.

## Features

- **Full 3D Board and Physics Dice**: Interactive 3D board with camera controls, auto-follow camera, and interactive 3D dice.
- **Accurate Board Rules**:
  - Exact roll needed to land on tile 100 to win (overshoot stays in place).
  - Maximum 3 consecutive rolls of 6 (3rd consecutive 6 forfeits turn).
  - Classic snake drops and ladder climbs with smooth 3D pawn animations.
- **Multiplayer & Solo**: Support for 2–4 players with configurable human or computer AI opponents.
- **Sound Effects & Haptics**: Procedural audio sound effects synthesized via Web Audio API.
- **Settings & Stats**: Move log history, customizable animation speed, sound toggles, and podium stats.
- **Developer Debug Panel**: Available in development or testing by appending `?debug=1` to the URL.

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

## License
MIT

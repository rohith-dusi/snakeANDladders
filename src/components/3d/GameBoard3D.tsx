import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Player, GameSettings, GamePhase } from '../../types/game';
import { BoardMesh } from './BoardMesh';
import { Ladders3D } from './Ladders3D';
import { Snakes3D } from './Snakes3D';
import { Pawn3D } from './Pawn3D';
import { Dice3D } from './Dice3D';
import { ParticleEffects, ParticleBurst } from './ParticleEffects';

interface GameBoard3DProps {
  players: Player[];
  activePlayerIndex: number;
  pawnVisualPositions: Record<string, [number, number, number]>;
  isPawnMoving: boolean;
  diceValue: number;
  isDiceRolling: boolean;
  canRollDice: boolean;
  phase?: GamePhase;
  onRollDice: () => void;
  settings: GameSettings;
  bursts: ParticleBurst[];
  resetCameraTrigger: number;
}

// Camera controller component inside Canvas
const CameraController: React.FC<{
  targetPos: [number, number, number];
  autoFollow: boolean;
  resetTrigger: number;
}> = ({ targetPos, autoFollow, resetTrigger }) => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const defaultCameraPos = useMemoVector(0, 16, 17);
  const defaultTarget = useMemoVector(0, 0, 0);

  // When resetTrigger fires, reset camera position and target
  useEffect(() => {
    if (resetTrigger > 0 && controlsRef.current) {
      camera.position.set(0, 16, 17);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [resetTrigger, camera]);

  useFrame(() => {
    if (!controlsRef.current) return;

    if (autoFollow) {
      // Gently glide the controls target towards the active pawn's X/Z location
      const desiredTarget = new THREE.Vector3(targetPos[0] * 0.45, 0, targetPos[2] * 0.45);
      controlsRef.current.target.lerp(desiredTarget, 0.04);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={10}
      maxDistance={32}
      minPolarAngle={Math.PI / 8}
      maxPolarAngle={Math.PI / 2.3} // Prevent looking below board
      maxAzimuthAngle={Math.PI / 2.2}
      minAzimuthAngle={-Math.PI / 2.2}
    />
  );
};

function useMemoVector(x: number, y: number, z: number) {
  return React.useMemo(() => new THREE.Vector3(x, y, z), [x, y, z]);
}

export const GameBoard3D: React.FC<GameBoard3DProps> = ({
  players,
  activePlayerIndex,
  pawnVisualPositions,
  isPawnMoving,
  diceValue,
  isDiceRolling,
  canRollDice,
  phase = 'idle',
  onRollDice,
  settings,
  bursts,
  resetCameraTrigger,
}) => {
  const activePlayer = players[activePlayerIndex];
  const defaultPos: [number, number, number] = [0, 0.2, 0];
  const activePos: [number, number, number] = activePlayer && pawnVisualPositions[activePlayer.id] 
    ? pawnVisualPositions[activePlayer.id] 
    : defaultPos;

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-950">
      <Canvas
        shadows
        camera={{ position: [0, 16, 17], fov: 48, near: 0.1, far: 100 }}
        dpr={[1, 2]} // Smooth retina rendering capped at 2 for performance
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
          });
        }}
      >
        {/* Sky / Scene ambient color */}
        <color attach="background" args={['#030712']} />
        <fog attach="fog" args={['#030712', 24, 45]} />

        {/* Studio 3-point lighting */}
        <ambientLight intensity={0.85} color="#e2e8f0" />

        {/* Warm key directional light with shadows */}
        <directionalLight
          position={[10, 20, 12]}
          intensity={1.6}
          color="#fef3c7"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-near={1}
          shadow-camera-far={40}
          shadow-camera-left={-12}
          shadow-camera-right={12}
          shadow-camera-top={12}
          shadow-camera-bottom={-12}
          shadow-bias={-0.0005}
        />

        {/* Cool cyan fill light from opposite angle */}
        <directionalLight
          position={[-12, 10, -10]}
          intensity={0.65}
          color="#93c5fd"
        />

        {/* Under-glow point light to soften board bottom */}
        <pointLight position={[0, 4, 0]} intensity={0.3} color="#fcd34d" distance={15} />

        {/* Camera and controls */}
        <CameraController
          targetPos={activePos}
          autoFollow={settings.cameraAutoFollow}
          resetTrigger={resetCameraTrigger}
        />

        {/* The 10x10 Board */}
        <BoardMesh theme={settings.theme} />

        {/* The 3D Ladders */}
        <Ladders3D />

        {/* The 3D Snakes */}
        <Snakes3D />

        {/* Player Pawns */}
        {players.map((player, idx) => (
          <Pawn3D
            key={player.id}
            player={player}
            worldPos={pawnVisualPositions[player.id] || defaultPos}
            isCurrentTurn={idx === activePlayerIndex}
            isMoving={isPawnMoving && idx === activePlayerIndex}
          />
        ))}

        {/* Interactive 3D Dice */}
        <Dice3D
          value={diceValue}
          isRolling={isDiceRolling}
          canRoll={canRollDice}
          isBot={activePlayer?.type === 'bot'}
          phase={phase}
          onRoll={onRollDice}
        />

        {/* Sparkle & Dust in-scene particle bursts */}
        <ParticleEffects bursts={bursts} />
      </Canvas>
    </div>
  );
};

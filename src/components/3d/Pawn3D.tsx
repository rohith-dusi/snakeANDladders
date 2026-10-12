import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Player, PawnShape } from '../../types/game';

interface Pawn3DProps {
  player: Player;
  worldPos: [number, number, number];
  isCurrentTurn: boolean;
  isMoving: boolean;
}

const PawnShapeMesh: React.FC<{ shape: PawnShape; color: string; accentColor: string }> = ({
  shape,
  color,
  accentColor,
}) => {
  const material = (
    <meshStandardMaterial
      color={color}
      roughness={0.15}
      metalness={0.4}
    />
  );

  const accentMaterial = (
    <meshStandardMaterial
      color={accentColor}
      roughness={0.2}
      metalness={0.7}
    />
  );

  switch (shape) {
    case 'cone':
      return (
        <group>
          {/* Base */}
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.35, 0.3, 20]} />
            {material}
          </mesh>
          {/* Tapered cone */}
          <mesh position={[0, 0.55, 0]} castShadow>
            <coneGeometry args={[0.26, 0.7, 20]} />
            {material}
          </mesh>
          {/* Top finial ring */}
          <mesh position={[0, 0.88, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            {accentMaterial}
          </mesh>
        </group>
      );

    case 'crown':
      return (
        <group>
          {/* Base pedestal */}
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.34, 0.4, 20]} />
            {material}
          </mesh>
          {/* Castle turret / crown ring */}
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.32, 0.26, 0.35, 8]} />
            {material}
          </mesh>
          {/* Crown points */}
          <mesh position={[0, 0.72, 0]}>
            <coneGeometry args={[0.18, 0.25, 8]} />
            {accentMaterial}
          </mesh>
        </group>
      );

    case 'star':
    case 'diamond':
      return (
        <group>
          {/* Pedestal */}
          <mesh position={[0, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.26, 0.32, 0.36, 16]} />
            {material}
          </mesh>
          {/* Faceted diamond / octahedron top */}
          <mesh position={[0, 0.6, 0]} rotation={[0.4, 0.4, 0]} castShadow>
            <octahedronGeometry args={[0.26, 0]} />
            {accentMaterial}
          </mesh>
        </group>
      );

    case 'cylinder':
    default:
      return (
        <group>
          {/* Base disc */}
          <mesh position={[0, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.35, 0.24, 24]} />
            {material}
          </mesh>
          {/* Slender neck */}
          <mesh position={[0, 0.42, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.24, 0.4, 20]} />
            {material}
          </mesh>
          {/* Collar ring */}
          <mesh position={[0, 0.62, 0]}>
            <torusGeometry args={[0.18, 0.04, 12, 24]} />
            {accentMaterial}
          </mesh>
          {/* Top Sphere head */}
          <mesh position={[0, 0.8, 0]} castShadow>
            <sphereGeometry args={[0.22, 20, 20]} />
            {material}
          </mesh>
        </group>
      );
  }
};

export const Pawn3D: React.FC<Pawn3DProps> = ({
  player,
  worldPos,
  isCurrentTurn,
  isMoving,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Smooth position interpolation to target worldPos
    const targetVec = new THREE.Vector3(...worldPos);
    groupRef.current.position.lerp(targetVec, isMoving ? 0.45 : 0.25);

    // Turn indicator animation
    if (ringRef.current && isCurrentTurn) {
      const t = state.clock.getElapsedTime();
      ringRef.current.rotation.z += delta * 1.5;
      const scale = 1 + Math.sin(t * 4) * 0.12;
      ringRef.current.scale.set(scale, scale, 1);
    }
  });

  return (
    <group ref={groupRef} position={worldPos}>
      {/* Dynamic ground shadow */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.05, 0.38, 20]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>

      {/* Active turn highlighting ring */}
      {isCurrentTurn && (
        <mesh ref={ringRef} position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.42, 0.54, 24]} />
          <meshBasicMaterial
            color={player.accentColor || '#38bdf8'}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}

      {/* 3D Pawn Body */}
      <PawnShapeMesh
        shape={player.shape}
        color={player.color}
        accentColor={player.accentColor}
      />
    </group>
  );
};

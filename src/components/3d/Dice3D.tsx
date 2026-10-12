import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { GamePhase } from '../../types/game';
import { createDiceMaterials } from './DiceTexture';

interface Dice3DProps {
  value: number; // 1 to 6
  isRolling: boolean;
  canRoll: boolean;
  isBot?: boolean;
  phase?: GamePhase;
  onRoll: () => void;
  position?: [number, number, number];
}

export const Dice3D: React.FC<Dice3DProps> = ({
  value,
  isRolling,
  canRoll,
  isBot = false,
  phase = 'idle',
  onRoll,
  position = [8.5, 0.9, 7.5],
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materials = useMemo(() => createDiceMaterials(), []);
  const isInteractive = canRoll && !isBot && phase === 'idle';

  // Roll animation internal state
  const animTime = useRef(0);
  const rollDuration = 0.9; // seconds
  const isAnimating = useRef(false);
  const rollSeed = useRef({ rx: 0, ry: 0, rz: 0 });

  // Target rotations for each face (1-6) pointing UP (+Y)
  const getTargetRotation = (val: number): THREE.Euler => {
    // Face indices:
    // +X: 3, -X: 4, +Y: 1, -Y: 6, +Z: 2, -Z: 5
    switch (val) {
      case 1:
        return new THREE.Euler(0, 0, 0);
      case 6:
        return new THREE.Euler(Math.PI, 0, 0);
      case 2:
        return new THREE.Euler(-Math.PI / 2, 0, 0);
      case 5:
        return new THREE.Euler(Math.PI / 2, 0, 0);
      case 3:
        return new THREE.Euler(0, 0, Math.PI / 2);
      case 4:
        return new THREE.Euler(0, 0, -Math.PI / 2);
      default:
        return new THREE.Euler(0, 0, 0);
    }
  };

  useEffect(() => {
    if (isRolling) {
      isAnimating.current = true;
      animTime.current = 0;
      rollSeed.current = {
        rx: (Math.random() - 0.5) * 8 + Math.PI * 6,
        ry: (Math.random() - 0.5) * 8 + Math.PI * 6,
        rz: (Math.random() - 0.5) * 8 + Math.PI * 6,
      };
    }
  }, [isRolling]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;

    if (isAnimating.current) {
      animTime.current += delta;
      const progress = Math.min(1, animTime.current / rollDuration);

      // Bounce arc: peak in the middle, then subtle secondary bounce
      const height = Math.sin(progress * Math.PI) * 2.2 + (progress > 0.7 ? Math.sin((progress - 0.7) / 0.3 * Math.PI) * 0.4 : 0);
      mesh.position.y = position[1] + height;

      // Tumbling rotation
      const targetEuler = getTargetRotation(value);
      const targetQuat = new THREE.Quaternion().setFromEuler(targetEuler);

      if (progress < 1) {
        // Active tumble
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const spinMultiplier = (1 - easeOut) * 12;

        mesh.rotation.x += rollSeed.current.rx * delta * spinMultiplier;
        mesh.rotation.y += rollSeed.current.ry * delta * spinMultiplier;
        mesh.rotation.z += rollSeed.current.rz * delta * spinMultiplier;
      } else {
        // Settle smoothly into target orientation
        mesh.quaternion.slerp(targetQuat, 0.25);
        mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, position[1], 0.2);

        if (mesh.quaternion.angleTo(targetQuat) < 0.02) {
          mesh.quaternion.copy(targetQuat);
          mesh.position.y = position[1];
          isAnimating.current = false;
        }
      }
    } else {
      // Idle state
      mesh.position.y = position[1];
      const targetEuler = getTargetRotation(value);
      mesh.quaternion.setFromEuler(targetEuler);

      // Gentle floating pulse if it's player's turn to roll
      if (isInteractive) {
        const t = state.clock.getElapsedTime();
        mesh.position.y = position[1] + Math.sin(t * 3.5) * 0.12;
      }
    }
  });

  return (
    <group position={position}>
      {/* Decorative Pedestal / Dice Tray */}
      <mesh position={[0, -0.4, 0]} receiveShadow>
        <cylinderGeometry args={[1.3, 1.5, 0.3, 32]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.4}
          metalness={0.5}
        />
      </mesh>
      {/* Pedestal glowing rim ring */}
      <mesh position={[0, -0.24, 0]}>
        <ringGeometry args={[1.15, 1.25, 32]} />
        <meshStandardMaterial
          color={isInteractive ? '#38bdf8' : '#64748b'}
          emissive={isInteractive ? '#0284c7' : '#000000'}
          emissiveIntensity={isInteractive ? 0.6 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3D Die Cube */}
      <mesh
        ref={meshRef}
        material={materials}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          if (isInteractive) onRoll();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (isInteractive) document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <boxGeometry args={[1.2, 1.2, 1.2]} />
      </mesh>
    </group>
  );
};

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export interface ParticleBurst {
  id: string;
  type: 'sparkles' | 'dust';
  position: [number, number, number];
  color: string;
  createdAt: number;
}

interface ParticleEffectsProps {
  bursts: ParticleBurst[];
}

export const ParticleEffects: React.FC<ParticleEffectsProps> = ({ bursts }) => {
  return (
    <group>
      {bursts.map((burst) => (
        <SingleBurst key={burst.id} burst={burst} />
      ))}
    </group>
  );
};

const SingleBurst: React.FC<{ burst: ParticleBurst }> = ({ burst }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = burst.type === 'sparkles' ? 36 : 24;

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = burst.position[0];
      pos[i * 3 + 1] = burst.position[1];
      pos[i * 3 + 2] = burst.position[2];

      // Random spherical explosion direction
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = burst.type === 'sparkles' ? 1.8 + Math.random() * 2.2 : 0.8 + Math.random() * 1.2;

      vel[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      // Dust stays lower, sparkles shoot upward
      vel[i * 3 + 1] = (burst.type === 'sparkles' ? 1.5 : 0.4) + Math.random() * speed;
      vel[i * 3 + 2] = Math.cos(phi) * speed;
    }

    return { positions: pos, velocities: vel };
  }, [burst, count]);

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      posArr[i * 3] += velocities[i * 3] * delta;
      posArr[i * 3 + 1] += velocities[i * 3 + 1] * delta;
      posArr[i * 3 + 2] += velocities[i * 3 + 2] * delta;

      // Gravity pull
      velocities[i * 3 + 1] -= delta * 3.5;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geom}>
      <pointsMaterial
        size={burst.type === 'sparkles' ? 0.18 : 0.28}
        color={burst.type === 'sparkles' ? '#fde047' : '#94a3b8'}
        transparent
        opacity={0.8}
        blending={burst.type === 'sparkles' ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
};

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { SNAKES, getTileCoords } from '../../utils/boardLogic';

interface SingleSnakeProps {
  headTile: number;
  tailTile: number;
  colorSchemeIndex: number;
}

const SNAKE_COLOR_PALETTES = [
  { body: '#059669', belly: '#34d399', eyes: '#facc15', stripe: '#064e3b' }, // Emerald Viper
  { body: '#dc2626', belly: '#f87171', eyes: '#fde047', stripe: '#7f1d1d' }, // Coral Snake
  { body: '#7c3aed', belly: '#a78bfa', eyes: '#4ade80', stripe: '#4c1d95' }, // Amethyst Cobra
  { body: '#d97706', belly: '#fbbf24', eyes: '#38bdf8', stripe: '#78350f' }, // Golden Python
];

const SingleSnake: React.FC<SingleSnakeProps> = ({ headTile, tailTile, colorSchemeIndex }) => {
  const headGroupRef = useRef<THREE.Group>(null);
  const palette = SNAKE_COLOR_PALETTES[colorSchemeIndex % SNAKE_COLOR_PALETTES.length];

  const { tubeGeometry, headPosition, headRotation, tailPosition } = useMemo(() => {
    const headCoord = getTileCoords(headTile);
    const tailCoord = getTileCoords(tailTile);

    const head = new THREE.Vector3(headCoord.x, 0.45, headCoord.z);
    const tail = new THREE.Vector3(tailCoord.x, 0.22, tailCoord.z);

    const distance = head.distanceTo(tail);
    const dir = new THREE.Vector3().subVectors(tail, head).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const side = new THREE.Vector3().crossVectors(dir, up).normalize();
    if (side.lengthSq() < 0.001) side.set(1, 0, 0);

    // Build S-shaped serpentine curve points
    const points: THREE.Vector3[] = [];
    const numPoints = Math.max(7, Math.floor(distance * 2.2));

    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      // Linear interpolation along head -> tail
      const pt = new THREE.Vector3().lerpVectors(head, tail, t);

      // Serpentine undulations: sinusoidal waves on side axis
      const frequency = Math.PI * 3.5;
      const wave = Math.sin(t * frequency) * (0.4 + distance * 0.06);
      pt.addScaledVector(side, wave);

      // Arch gently above the board
      const arch = Math.sin(t * Math.PI) * 0.45;
      pt.y += arch;

      points.push(pt);
    }

    const curve = new THREE.CatmullRomCurve3(points);
    // Tube geometry with 64 tubular segments and 12 radial segments
    const geom = new THREE.TubeGeometry(curve, 48, 0.18, 12, false);

    // Calculate head orientation
    // Tangent at t = 0 points from head towards body
    const tangent = curve.getTangent(0);
    const headDir = tangent.clone().negate(); // head faces outwards
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), headDir);
    const rot = new THREE.Euler().setFromQuaternion(quat);

    return {
      tubeGeometry: geom,
      headPosition: head,
      headRotation: rot,
      tailPosition: tail,
    };
  }, [headTile, tailTile]);

  // Gentle idle breathing sway
  useFrame((state) => {
    if (!headGroupRef.current) return;
    const t = state.clock.getElapsedTime() + headTile * 0.5;
    headGroupRef.current.position.y = headPosition.y + Math.sin(t * 2) * 0.04;
    headGroupRef.current.rotation.y = headRotation.y + Math.sin(t * 1.5) * 0.08;
  });

  return (
    <group>
      {/* Snake Body Tube */}
      <mesh geometry={tubeGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={palette.body}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* Snake Head Group */}
      <group
        ref={headGroupRef}
        position={[headPosition.x, headPosition.y, headPosition.z]}
        rotation={headRotation}
      >
        {/* Head Main Skull */}
        <mesh position={[0, 0, 0.2]} castShadow>
          <sphereGeometry args={[0.26, 16, 16]} />
          <meshStandardMaterial
            color={palette.body}
            roughness={0.25}
            metalness={0.15}
          />
        </mesh>

        {/* Snout */}
        <mesh position={[0, -0.04, 0.4]} castShadow>
          <boxGeometry args={[0.3, 0.16, 0.32]} />
          <meshStandardMaterial
            color={palette.body}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>

        {/* Eyes (Left & Right) */}
        {[-0.16, 0.16].map((eyeX, idx) => (
          <group key={`eye-${idx}`} position={[eyeX, 0.12, 0.28]}>
            <mesh>
              <sphereGeometry args={[0.075, 12, 12]} />
              <meshStandardMaterial
                color={palette.eyes}
                emissive={palette.eyes}
                emissiveIntensity={0.6}
                roughness={0.1}
              />
            </mesh>
            {/* Slit Pupil */}
            <mesh position={[0, 0, 0.06]}>
              <boxGeometry args={[0.02, 0.08, 0.02]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
          </group>
        ))}

        {/* Forked Tongue */}
        <group position={[0, -0.06, 0.58]}>
          <mesh>
            <boxGeometry args={[0.04, 0.015, 0.2]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          {/* Fork tips */}
          <mesh position={[-0.03, 0, 0.14]} rotation={[0, 0.4, 0]}>
            <boxGeometry args={[0.025, 0.015, 0.1]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0.03, 0, 0.14]} rotation={[0, -0.4, 0]}>
            <boxGeometry args={[0.025, 0.015, 0.1]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      </group>

      {/* Snake Tail Tip */}
      <mesh position={[tailPosition.x, tailPosition.y, tailPosition.z]}>
        <coneGeometry args={[0.12, 0.28, 12]} />
        <meshStandardMaterial
          color={palette.stripe}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
};

export const Snakes3D: React.FC = () => {
  const snakePairs = useMemo(() => {
    return Object.entries(SNAKES).map(([head, tail], idx) => ({
      head: Number(head),
      tail: Number(tail),
      paletteIdx: idx,
    }));
  }, []);

  return (
    <group>
      {snakePairs.map(({ head, tail, paletteIdx }) => (
        <SingleSnake
          key={`snake-${head}-${tail}`}
          headTile={head}
          tailTile={tail}
          colorSchemeIndex={paletteIdx}
        />
      ))}
    </group>
  );
};

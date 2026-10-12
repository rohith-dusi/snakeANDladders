import React, { useMemo } from 'react';
import * as THREE from 'three';
import { LADDERS, getTileCoords } from '../../utils/boardLogic';

interface SingleLadderProps {
  startTile: number;
  endTile: number;
}

const SingleLadder: React.FC<SingleLadderProps> = ({ startTile, endTile }) => {
  const ladderGeometry = useMemo(() => {
    const start = getTileCoords(startTile);
    const end = getTileCoords(endTile);

    // 3D start and end points
    // Base is slightly above board (y=0.15), top is slightly elevated (y=0.45) to create realistic 3D slant
    const p1 = new THREE.Vector3(start.x, 0.22, start.z);
    const p2 = new THREE.Vector3(end.x, 0.5, end.z);

    const length = p1.distanceTo(p2);
    const dir = new THREE.Vector3().subVectors(p2, p1).normalize();

    // Normal vector perpendicular to ladder direction on XZ plane
    const up = new THREE.Vector3(0, 1, 0);
    const perp = new THREE.Vector3().crossVectors(dir, up).normalize();
    if (perp.lengthSq() < 0.001) {
      perp.set(1, 0, 0);
    }

    const halfWidth = 0.38; // width between rails

    // Rail 1 and Rail 2 center vectors
    const r1Start = p1.clone().addScaledVector(perp, -halfWidth);
    const r1End = p2.clone().addScaledVector(perp, -halfWidth);

    const r2Start = p1.clone().addScaledVector(perp, halfWidth);
    const r2End = p2.clone().addScaledVector(perp, halfWidth);

    // Number of rungs based on length
    const rungCount = Math.max(3, Math.floor(length / 0.75));
    const rungs: { start: THREE.Vector3; end: THREE.Vector3; center: THREE.Vector3 }[] = [];

    for (let i = 1; i <= rungCount; i++) {
      const t = i / (rungCount + 1);
      const rungP1 = new THREE.Vector3().lerpVectors(r1Start, r1End, t);
      const rungP2 = new THREE.Vector3().lerpVectors(r2Start, r2End, t);
      const center = new THREE.Vector3().lerpVectors(rungP1, rungP2, 0.5);
      rungs.push({ start: rungP1, end: rungP2, center });
    }

    return {
      p1,
      p2,
      r1Start,
      r1End,
      r2Start,
      r2End,
      rungs,
      length,
      dir,
      perp,
      halfWidth,
    };
  }, [startTile, endTile]);

  // Cylinder connecting two points helper
  const createCylinderTransform = (ptA: THREE.Vector3, ptB: THREE.Vector3) => {
    const mid = new THREE.Vector3().addVectors(ptA, ptB).multiplyScalar(0.5);
    const len = ptA.distanceTo(ptB);
    const orientation = new THREE.Matrix4();
    const up = new THREE.Vector3(0, 1, 0);
    const direction = new THREE.Vector3().subVectors(ptB, ptA).normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(up, direction);
    orientation.makeRotationFromQuaternion(quat);
    orientation.setPosition(mid);

    const rot = new THREE.Euler().setFromQuaternion(quat);
    return { position: [mid.x, mid.y, mid.z] as [number, number, number], rotation: rot, length: len };
  };

  const rail1 = createCylinderTransform(ladderGeometry.r1Start, ladderGeometry.r1End);
  const rail2 = createCylinderTransform(ladderGeometry.r2Start, ladderGeometry.r2End);

  return (
    <group>
      {/* Rail 1 */}
      <mesh
        position={rail1.position}
        rotation={rail1.rotation}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.07, 0.07, rail1.length, 12]} />
        <meshStandardMaterial
          color="#d97706"
          roughness={0.35}
          metalness={0.65}
        />
      </mesh>

      {/* Rail 2 */}
      <mesh
        position={rail2.position}
        rotation={rail2.rotation}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.07, 0.07, rail2.length, 12]} />
        <meshStandardMaterial
          color="#d97706"
          roughness={0.35}
          metalness={0.65}
        />
      </mesh>

      {/* Rungs */}
      {ladderGeometry.rungs.map((rung, idx) => {
        const trans = createCylinderTransform(rung.start, rung.end);
        return (
          <mesh
            key={`rung-${idx}`}
            position={trans.position}
            rotation={trans.rotation}
            castShadow
          >
            <cylinderGeometry args={[0.05, 0.05, trans.length, 10]} />
            <meshStandardMaterial
              color="#fbbf24"
              roughness={0.3}
              metalness={0.8}
            />
          </mesh>
        );
      })}

      {/* Ladder base feet pads */}
      <mesh position={[ladderGeometry.r1Start.x, 0.1, ladderGeometry.r1Start.z]}>
        <cylinderGeometry args={[0.12, 0.14, 0.08, 12]} />
        <meshStandardMaterial color="#92400e" roughness={0.5} />
      </mesh>
      <mesh position={[ladderGeometry.r2Start.x, 0.1, ladderGeometry.r2Start.z]}>
        <cylinderGeometry args={[0.12, 0.14, 0.08, 12]} />
        <meshStandardMaterial color="#92400e" roughness={0.5} />
      </mesh>
    </group>
  );
};

export const Ladders3D: React.FC = () => {
  const ladderPairs = useMemo(() => {
    return Object.entries(LADDERS).map(([start, end]) => ({
      start: Number(start),
      end: Number(end),
    }));
  }, []);

  return (
    <group>
      {ladderPairs.map(({ start, end }) => (
        <SingleLadder key={`ladder-${start}-${end}`} startTile={start} endTile={end} />
      ))}
    </group>
  );
};

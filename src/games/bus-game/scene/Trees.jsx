import { useMemo } from 'react';
import * as THREE from 'three';
import { ROUTE, BOUNDS, JUNCTIONS, SIDE_ROADS } from '../data/routeData';
import { dd, nearRoad } from '../data/mathUtils';
import Buildings from './Buildings';

const trkMat = new THREE.MeshStandardMaterial({ color: 0x5c3317, roughness: 0.9, metalness: 0 });
const lfMats = [
  new THREE.MeshStandardMaterial({ color: 0x2a8a2a, roughness: 0.85, metalness: 0 }),
  new THREE.MeshStandardMaterial({ color: 0x358a35, roughness: 0.8, metalness: 0 }),
  new THREE.MeshStandardMaterial({ color: 0x1c7a1c, roughness: 0.88, metalness: 0 }),
];

export default function Trees({ obstaclesRef }) {
  const data = useMemo(() => {
    const R = ROUTE;
    const placed = Buildings._placed || [];
    const trees = [];
    const obstacles = [];

    for (let i = 0; i < 70; i++) {
      const tx = BOUNDS.minX + 30 + Math.random() * (BOUNDS.maxX - BOUNDS.minX - 60);
      const tz = BOUNDS.minZ + 30 + Math.random() * (BOUNDS.maxZ - BOUNDS.minZ - 60);
      if (nearRoad(R, tx, tz, 14)) continue;

      let treeOk = true;
      for (let ii = 0; ii < placed.length; ii++) {
        if (dd(tx, tz, placed[ii][0], placed[ii][1]) < 10) { treeOk = false; break; }
      }
      if (!treeOk) continue;

      // Exclude roundabout zones
      let inExclusion = false;
      for (const j of JUNCTIONS) {
        if (dd(tx, tz, j.x, j.z) < j.radius + 8) { inExclusion = true; break; }
      }
      if (inExclusion) continue;

      // Exclude side-road stub centerlines
      for (const s of SIDE_ROADS) {
        const endX = s.x + Math.sin(s.angle) * s.length;
        const endZ = s.z + Math.cos(s.angle) * s.length;
        const dx = endX - s.x, dz = endZ - s.z, len2 = dx * dx + dz * dz;
        const t = len2 > 0 ? Math.max(0, Math.min(1, ((tx - s.x) * dx + (tz - s.z) * dz) / len2)) : 0;
        const dist = dd(tx, tz, s.x + t * dx, s.z + t * dz);
        if (dist < 14) { inExclusion = true; break; }
      }
      if (inExclusion) continue;

      const lsz = 2 + Math.random() * 1.8;
      const leafIdx = Math.floor(Math.random() * 3);
      const canopyY = 4.8 + Math.random() * 0.5;
      const ls2 = lsz * 0.7;
      const offX = Math.random() * 1.2 - 0.6;
      const offZ = Math.random() * 1.2 - 0.6;
      const secondY = 5.5 + Math.random() * 0.5;

      trees.push({ pos: [tx, 0, tz], lsz, leafIdx, canopyY, ls2, offX, offZ, secondY });
      obstacles.push({ x: tx, z: tz, r: 2.0 });
    }

    return { trees, obstacles };
  }, []);

  if (obstaclesRef) {
    obstaclesRef.current.trees = data.obstacles;
  }

  return (
    <group>
      {data.trees.map((t, i) => (
        <group key={i} position={t.pos}>
          {/* Trunk */}
          <mesh position={[0, 2, 0]} castShadow material={trkMat}>
            <cylinderGeometry args={[0.25, 0.45, 4, 8]} />
          </mesh>
          {/* Main canopy */}
          <mesh position={[0, t.canopyY, 0]} castShadow material={lfMats[t.leafIdx]}>
            <sphereGeometry args={[t.lsz, 10, 8]} />
          </mesh>
          {/* Secondary canopy */}
          <mesh position={[t.offX, t.secondY, t.offZ]} castShadow material={lfMats[t.leafIdx]}>
            <sphereGeometry args={[t.ls2, 8, 6]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

import { useMemo } from 'react';
import * as THREE from 'three';
import { ROUTE } from '../data/routeData';
import { dd, nearRoad } from '../data/mathUtils';

const bMats = [
  new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.85, metalness: 0.02 }),
  new THREE.MeshStandardMaterial({ color: 0x6b6b6b, roughness: 0.7, metalness: 0.1 }),
  new THREE.MeshStandardMaterial({ color: 0x9a6040, roughness: 0.82, metalness: 0.03 }),
  new THREE.MeshStandardMaterial({ color: 0x708090, roughness: 0.65, metalness: 0.15 }),
  new THREE.MeshStandardMaterial({ color: 0xb08840, roughness: 0.78, metalness: 0.05 }),
  new THREE.MeshStandardMaterial({ color: 0x5a6a7a, roughness: 0.7, metalness: 0.12 }),
  new THREE.MeshStandardMaterial({ color: 0x7a5030, roughness: 0.88, metalness: 0.02 }),
  new THREE.MeshStandardMaterial({ color: 0xc4a070, roughness: 0.75, metalness: 0.04 }),
  new THREE.MeshStandardMaterial({ color: 0x556050, roughness: 0.82, metalness: 0.06 }),
];
const winMat1 = new THREE.MeshStandardMaterial({ color: 0xeeeebb, roughness: 0.2, metalness: 0.3, emissive: 0x887744, emissiveIntensity: 0.3, transparent: true, opacity: 0.75 });
const winMat2 = new THREE.MeshStandardMaterial({ color: 0xffd866, roughness: 0.15, metalness: 0.2, emissive: 0xffaa22, emissiveIntensity: 0.6, transparent: true, opacity: 0.85 });
const winDark = new THREE.MeshStandardMaterial({ color: 0x334455, roughness: 0.3, metalness: 0.4, transparent: true, opacity: 0.8 });
const ledgeMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.6 });

export default function Buildings({ obstaclesRef }) {
  const data = useMemo(() => {
    const R = ROUTE;
    const placed = [];
    const buildings = [];
    const obstacles = [];

    function canPlace(bx, bz) {
      if (nearRoad(R, bx, bz, 18)) return false;
      for (let ii = 0; ii < placed.length; ii++) if (dd(bx, bz, placed[ii][0], placed[ii][1]) < 13) return false;
      return true;
    }

    // Buildings along route
    for (let i = 0; i < R.length - 1; i++) {
      const a = R[i], b = R[i + 1];
      const dx = b[0] - a[0], dz = b[1] - a[1];
      const len = Math.sqrt(dx * dx + dz * dz);
      const ang = Math.atan2(dx, dz);
      const px = Math.cos(ang), pz = -Math.sin(ang);
      const bc = Math.floor(len / 18);

      for (let bi = 0; bi < bc; bi++) {
        for (const s of [-1, 1]) {
          if (Math.random() > 0.72) continue;
          const t = (bi + 0.5) / bc;
          const off = 20 + Math.random() * 12;
          const bx = a[0] + dx * t + px * s * off;
          const bz = a[1] + dz * t + pz * s * off;
          if (!canPlace(bx, bz)) continue;

          const bw = 6 + Math.random() * 9;
          const bd = 6 + Math.random() * 9;
          const bh = 8 + Math.random() * 25;
          const matIdx = Math.floor(Math.random() * bMats.length);

          // Windows
          const windows = [];
          const wr = Math.floor(bh / 5), wc = Math.floor(bw / 3.5);
          for (let r = 0; r < wr; r++) {
            for (let c = 0; c < wc; c++) {
              const rng = Math.random();
              if (rng > 0.75) continue;
              const wmatType = rng < 0.25 ? 2 : rng < 0.5 ? 1 : 0;
              for (const f of [-1, 1]) {
                windows.push({
                  pos: [bx - bw / 2 + 1.8 + c * 3.2, 3 + r * 5, bz + f * (bd / 2 + 0.06)],
                  rotY: f < 0 ? Math.PI : 0,
                  wmatType,
                });
              }
            }
          }

          buildings.push({ pos: [bx, bh / 2, bz], size: [bw, bh, bd], matIdx, ledgeSize: [bw + 0.6, 0.3, bd + 0.6], ledgePos: [bx, bh + 0.15, bz], windows });
          placed.push([bx, bz]);
          obstacles.push({ x: bx, z: bz, hw: bw / 2 + 1.5, hd: bd / 2 + 1.5 });
        }
      }
    }

    // Random extra buildings
    for (let i = 0; i < 45; i++) {
      const bx = -130 + Math.random() * 460;
      const bz = -190 + Math.random() * 400;
      if (!canPlace(bx, bz)) continue;
      const bh = 5 + Math.random() * 16;
      const bw = 5 + Math.random() * 7;
      const bd = 5 + Math.random() * 7;
      const matIdx = Math.floor(Math.random() * bMats.length);
      buildings.push({ pos: [bx, bh / 2, bz], size: [bw, bh, bd], matIdx, ledgeSize: null, ledgePos: null, windows: [] });
      placed.push([bx, bz]);
      obstacles.push({ x: bx, z: bz, hw: bw / 2 + 1.5, hd: bd / 2 + 1.5 });
    }

    return { buildings, obstacles, placed };
  }, []);

  // Push obstacles to shared ref
  if (obstaclesRef) {
    obstaclesRef.current.buildings = data.obstacles;
  }

  // Store placed positions for Trees to access
  Buildings._placed = data.placed;

  return (
    <group>
      {data.buildings.map((b, i) => (
        <group key={i}>
          <mesh position={b.pos} castShadow receiveShadow material={bMats[b.matIdx]}>
            <boxGeometry args={b.size} />
          </mesh>
          {b.ledgePos && (
            <mesh position={b.ledgePos} castShadow material={ledgeMat}>
              <boxGeometry args={b.ledgeSize} />
            </mesh>
          )}
          {b.windows.map((w, j) => (
            <mesh key={j} position={w.pos} rotation={[0, w.rotY, 0]}
              material={w.wmatType === 2 ? winMat2 : w.wmatType === 1 ? winMat1 : winDark}>
              <planeGeometry args={[1.2, 1.8]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

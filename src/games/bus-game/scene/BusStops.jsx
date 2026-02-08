import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ROUTE, STOPS } from '../data/routeData';
import { useBusGameStore } from '../store/busGameStore';

const pstMat = new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.4, metalness: 0.5 });
const redMat = new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.5, metalness: 0.1 });
const glassBlueMat = new THREE.MeshStandardMaterial({ color: 0x4488bb, roughness: 0.15, metalness: 0.3, transparent: true, opacity: 0.45 });
const roofStopMat = new THREE.MeshStandardMaterial({ color: 0x336699, roughness: 0.3, metalness: 0.4, transparent: true, opacity: 0.55 });
const benchMat = new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.85, metalness: 0 });
const bodyFig = new THREE.MeshStandardMaterial({ color: 0x334499, roughness: 0.8 });
const headFig = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 });
const gndMat = new THREE.MeshStandardMaterial({ color: 0x4a8a4a, roughness: 0.95, metalness: 0 });

export default function BusStops({ obstaclesRef }) {
  const stopData = useMemo(() => {
    const items = [];
    for (let si = 0; si < STOPS.length; si++) {
      const stop = STOPS[si], wp = ROUTE[stop.i];
      let nx = 0, nz = 0;
      if (stop.i < ROUTE.length - 1) {
        const nxt = ROUTE[stop.i + 1];
        const ddx = nxt[0] - wp[0], ddz = nxt[1] - wp[1];
        const ll = Math.sqrt(ddx * ddx + ddz * ddz);
        if (ll > 0.01) { nx = -ddz / ll; nz = ddx / ll; }
      }
      const sx = wp[0] + nx * 12, sz = wp[1] + nz * 12;
      items.push({ wp, sx, sz, si });
    }
    return items;
  }, []);

  // Push stop obstacles
  if (obstaclesRef) {
    obstaclesRef.current.stops = stopData.map(s => ({ x: s.sx, z: s.sz, hw: 3, hd: 2.5 }));
  }

  const ringRefs = useRef([]);
  const figGroupRefs = useRef([]); // [stopIndex][figIndex]

  useFrame(() => {
    // Pulse rings
    const pt = performance.now() * 0.003;
    for (let i = 0; i < ringRefs.current.length; i++) {
      const ring = ringRefs.current[i];
      if (!ring) continue;
      ring.material.opacity = 0.2 + Math.sin(pt + i * 0.9) * 0.15;
      ring.material.emissiveIntensity = 0.3 + Math.sin(pt + i * 0.9) * 0.2;
    }

    // Update waiting figure visibility
    const pax = useBusGameStore.getState().pax;
    for (let si = 0; si < STOPS.length; si++) {
      let wc = 0;
      for (let pi = 0; pi < pax.length; pi++) {
        if (pax[pi].origin === si && !pax[pi].on && !pax[pi].done) wc++;
      }
      const figs = figGroupRefs.current[si];
      if (!figs) continue;
      for (let fi = 0; fi < figs.length; fi++) {
        if (figs[fi]) figs[fi].visible = fi < wc;
      }
    }
  });

  return (
    <group>
      {stopData.map((stop, idx) => (
        <group key={idx}>
          {/* Shelter posts */}
          {[-1.5, 1.5].map((ox, j) => (
            <mesh key={`post-${j}`} position={[stop.sx + ox, 1.6, stop.sz]} castShadow material={pstMat}>
              <cylinderGeometry args={[0.1, 0.1, 3.2, 8]} />
            </mesh>
          ))}
          {/* Roof */}
          <mesh position={[stop.sx, 3.22, stop.sz]} castShadow material={roofStopMat}>
            <boxGeometry args={[4, 0.15, 2.3]} />
          </mesh>
          {/* Glass back */}
          <mesh position={[stop.sx, 1.7, stop.sz - 1.1]} material={glassBlueMat}>
            <boxGeometry args={[4, 3, 0.08]} />
          </mesh>
          {/* Sign post */}
          <mesh position={[stop.sx + 2.3, 1.9, stop.sz + 0.8]} material={pstMat}>
            <cylinderGeometry args={[0.07, 0.07, 3.8, 6]} />
          </mesh>
          {/* Sign */}
          <mesh position={[stop.sx + 2.3, 3.6, stop.sz + 0.8]} material={redMat}>
            <boxGeometry args={[1, 1, 0.1]} />
          </mesh>
          {/* Bench */}
          <mesh position={[stop.sx, 0.7, stop.sz - 0.4]} castShadow material={benchMat}>
            <boxGeometry args={[2.8, 0.15, 0.7]} />
          </mesh>
          {/* Bench legs */}
          {[-1, 1].map((bl, j) => (
            <mesh key={`leg-${j}`} position={[stop.sx + bl * 1.1, 0.35, stop.sz - 0.4]} material={pstMat}>
              <boxGeometry args={[0.1, 0.6, 0.1]} />
            </mesh>
          ))}
          {/* Ground ring glow */}
          <mesh
            position={[stop.wp[0], 0.12, stop.wp[1]]}
            ref={(el) => { ringRefs.current[idx] = el; }}
          >
            <cylinderGeometry args={[7, 7, 0.08, 28]} />
            <meshStandardMaterial color={0x00ff88} emissive={0x00ff66} emissiveIntensity={0.5} transparent opacity={0.35} />
          </mesh>
          <mesh position={[stop.wp[0], 0.13, stop.wp[1]]} material={gndMat}>
            <cylinderGeometry args={[5.5, 5.5, 0.1, 28]} />
          </mesh>
          {/* Waiting figures */}
          {[0, 1, 2, 3].map((fi) => (
            <group
              key={`fig-${fi}`}
              position={[stop.sx - 1.2 + fi * 0.85, 0, stop.sz + 0.5]}
              visible={false}
              ref={(el) => {
                if (!figGroupRefs.current[idx]) figGroupRefs.current[idx] = [];
                figGroupRefs.current[idx][fi] = el;
              }}
            >
              <mesh position={[0, 0.85, 0]} material={bodyFig}>
                <cylinderGeometry args={[0.2, 0.28, 1.1, 8]} />
              </mesh>
              <mesh position={[0, 1.65, 0]} material={headFig}>
                <sphereGeometry args={[0.22, 8, 6]} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

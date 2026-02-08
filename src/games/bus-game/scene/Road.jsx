import { useMemo } from 'react';
import * as THREE from 'three';
import { ROUTE } from '../data/routeData';
import { createAsphaltTexture } from './proceduralTextures';

const asphaltTex = createAsphaltTexture();
const roadMat = new THREE.MeshStandardMaterial({ map: asphaltTex, roughness: 0.85, metalness: 0.05 });
const swalkMat = new THREE.MeshStandardMaterial({ color: 0x8a8a8a, roughness: 0.75, metalness: 0.02 });
const dashMat = new THREE.MeshStandardMaterial({ color: 0xcccc44, roughness: 0.5, emissive: 0x333300, emissiveIntensity: 0.1 });
const edgeMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.6 });
const curbMat = new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.7 });
const arMat = new THREE.MeshStandardMaterial({ color: 0x00aaff, transparent: true, opacity: 0.3, emissive: 0x0066aa, emissiveIntensity: 0.3 });

export default function Road() {
  const elements = useMemo(() => {
    const items = [];
    const R = ROUTE;

    for (let i = 0; i < R.length - 1; i++) {
      const a = R[i], b = R[i + 1];
      const dx = b[0] - a[0], dz = b[1] - a[1];
      const len = Math.sqrt(dx * dx + dz * dz);
      const cx = (a[0] + b[0]) / 2, cz = (a[1] + b[1]) / 2;
      const ang = Math.atan2(dx, dz);

      // Road surface
      items.push({ type: 'road', pos: [cx, 0.07, cz], rot: ang, size: [14, 0.15, len + 2] });

      // Sidewalks + curbs
      for (const s of [-1, 1]) {
        items.push({
          type: 'swalk', pos: [cx + Math.cos(ang) * s * 8.5, 0.14, cz - Math.sin(ang) * s * 8.5],
          rot: ang, size: [2.5, 0.28, len + 2],
        });
        items.push({
          type: 'curb', pos: [cx + Math.cos(ang) * s * 7.2, 0.12, cz - Math.sin(ang) * s * 7.2],
          rot: ang, size: [0.3, 0.25, len + 2],
        });
        // Edge lines
        items.push({
          type: 'edge', pos: [cx + Math.cos(ang) * s * 6, 0.16, cz - Math.sin(ang) * s * 6],
          rot: ang, size: [0.2, 0.16, len + 1],
        });
      }

      // Center dashes
      const dc = Math.floor(len / 7);
      for (let d = 0; d < dc; d++) {
        const t = (d + 0.5) / dc;
        items.push({
          type: 'dash', pos: [a[0] + dx * t, 0.16, a[1] + dz * t],
          rot: ang, size: [0.3, 0.16, 2.2],
        });
      }

      // Route arrows
      const steps = Math.floor(len / 14);
      for (let d = 0; d < steps; d++) {
        const t = (d + 0.5) / steps;
        items.push({
          type: 'arrow', pos: [a[0] + dx * t, 0.25, a[1] + dz * t],
          rotX: Math.PI / 2, rotZ: -Math.atan2(dx, dz),
        });
      }
    }

    // Junction circles
    for (let i = 0; i < R.length; i++) {
      items.push({ type: 'junction', pos: [R[i][0], 0.07, R[i][1]] });
    }

    return items;
  }, []);

  return (
    <group>
      {elements.map((el, i) => {
        if (el.type === 'road') {
          return (
            <mesh key={i} position={el.pos} rotation={[0, el.rot, 0]} material={roadMat} receiveShadow>
              <boxGeometry args={el.size} />
            </mesh>
          );
        }
        if (el.type === 'swalk') {
          return (
            <mesh key={i} position={el.pos} rotation={[0, el.rot, 0]} material={swalkMat} receiveShadow castShadow>
              <boxGeometry args={el.size} />
            </mesh>
          );
        }
        if (el.type === 'curb') {
          return (
            <mesh key={i} position={el.pos} rotation={[0, el.rot, 0]} material={curbMat}>
              <boxGeometry args={el.size} />
            </mesh>
          );
        }
        if (el.type === 'dash') {
          return (
            <mesh key={i} position={el.pos} rotation={[0, el.rot, 0]} material={dashMat}>
              <boxGeometry args={el.size} />
            </mesh>
          );
        }
        if (el.type === 'edge') {
          return (
            <mesh key={i} position={el.pos} rotation={[0, el.rot, 0]} material={edgeMat}>
              <boxGeometry args={el.size} />
            </mesh>
          );
        }
        if (el.type === 'arrow') {
          return (
            <mesh key={i} position={el.pos} rotation={[el.rotX, 0, el.rotZ]} material={arMat}>
              <coneGeometry args={[0.5, 1.2, 4]} />
            </mesh>
          );
        }
        if (el.type === 'junction') {
          return (
            <mesh key={i} position={el.pos} material={roadMat} receiveShadow>
              <cylinderGeometry args={[7, 7, 0.15, 16]} />
            </mesh>
          );
        }
        return null;
      })}
    </group>
  );
}

import { useMemo } from 'react';
import * as THREE from 'three';
import { ROUTE } from '../data/routeData';

const poleMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.4, metalness: 0.6 });
const lightBulbMat = new THREE.MeshStandardMaterial({ color: 0xffffcc, emissive: 0xffddaa, emissiveIntensity: 0.8, roughness: 0.2 });

export default function StreetLights() {
  const lights = useMemo(() => {
    const items = [];
    const R = ROUTE;

    for (let i = 0; i < R.length - 1; i += 2) {
      const a = R[i], b = R[i + 1];
      const dx = b[0] - a[0], dz = b[1] - a[1];
      const ang = Math.atan2(dx, dz);

      for (const s of [-1, 1]) {
        const lpx = a[0] + Math.cos(ang) * s * 10;
        const lpz = a[1] - Math.sin(ang) * s * 10;
        items.push({ lpx, lpz, s, armRotZ: s * Math.PI / 2.3 });
      }
    }
    return items;
  }, []);

  return (
    <group>
      {lights.map((l, i) => (
        <group key={i}>
          {/* Pole */}
          <mesh position={[l.lpx, 2.75, l.lpz]} castShadow material={poleMat}>
            <cylinderGeometry args={[0.1, 0.12, 5.5, 6]} />
          </mesh>
          {/* Arm */}
          <mesh position={[l.lpx - l.s * 0.8, 5.2, l.lpz]} rotation={[0, 0, l.armRotZ]} material={poleMat}>
            <cylinderGeometry args={[0.06, 0.06, 2, 4]} />
          </mesh>
          {/* Bulb */}
          <mesh position={[l.lpx - l.s * 1.6, 5, l.lpz]} material={lightBulbMat}>
            <sphereGeometry args={[0.25, 6, 5]} />
          </mesh>
          {/* Point light */}
          <pointLight color={0xffddaa} intensity={0.15} distance={20} position={[l.lpx - l.s * 1.6, 4.8, l.lpz]} />
        </group>
      ))}
    </group>
  );
}

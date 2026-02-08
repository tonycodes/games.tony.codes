import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useBusGameStore } from '../store/busGameStore';

const busBodyMat = new THREE.MeshStandardMaterial({ color: 0xe8b400, roughness: 0.35, metalness: 0.15 });
const busTrimMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.3, metalness: 0.5 });
const busDarkMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.6, metalness: 0.2 });
const busGlassMat = new THREE.MeshStandardMaterial({ color: 0x8abbdd, roughness: 0.1, metalness: 0.4, transparent: true, opacity: 0.4 });
const acMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5, metalness: 0.3 });
const hlMat = new THREE.MeshStandardMaterial({ color: 0xffffee, emissive: 0xffffcc, emissiveIntensity: 0.8, roughness: 0.1, metalness: 0.3 });
const tlMat = new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: 0xff1100, emissiveIntensity: 0.6, roughness: 0.2 });
const tsMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xff8800, emissiveIntensity: 0.4, roughness: 0.2 });
const whMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.75, metalness: 0.1 });
const hubMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.3, metalness: 0.7 });
const strMat = new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.4, metalness: 0.1 });
const routeMat = new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff4400, emissiveIntensity: 0.4, roughness: 0.3 });

export default function Bus() {
  const ref = useRef();

  useFrame(() => {
    if (!ref.current) return;
    const s = useBusGameStore.getState();
    ref.current.position.x = s.posX;
    ref.current.position.z = s.posZ;
    ref.current.rotation.y = s.heading;

    // Lean and crash shake
    const leanZ = -s.steer * Math.min(Math.abs(s.speed) / 30, 1) * 0.04;
    if (s.crashTimer > 0) {
      ref.current.rotation.z = leanZ + Math.sin(s.crashTimer * 25) * s.crashTimer * 0.03;
      ref.current.rotation.x = Math.sin(s.crashTimer * 18) * s.crashTimer * 0.015;
    } else {
      ref.current.rotation.z = leanZ;
      ref.current.rotation.x = 0;
    }
  });

  return (
    <group ref={ref}>
      {/* Body */}
      <mesh position={[0, 1.9, 0]} castShadow material={busBodyMat}>
        <boxGeometry args={[3.2, 2.8, 7.5]} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 3.35, 0]} castShadow material={busTrimMat}>
        <boxGeometry args={[3.3, 0.2, 7.6]} />
      </mesh>
      {/* AC unit */}
      <mesh position={[0, 3.65, 0]} material={acMat}>
        <boxGeometry args={[1.8, 0.35, 2.5]} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 2.2, -3.76]} material={busGlassMat}>
        <planeGeometry args={[2.8, 1.8]} />
      </mesh>
      {/* Rear window */}
      <mesh position={[0, 2.2, 3.76]} rotation={[0, Math.PI, 0]} material={busGlassMat}>
        <planeGeometry args={[2.2, 1.4]} />
      </mesh>
      {/* Side windows */}
      {[-1, 1].map(s =>
        [0, 1, 2, 3].map(w => (
          <mesh key={`sw-${s}-${w}`} position={[s * 1.61, 2.3, -2.3 + w * 1.7]} rotation={[0, s * Math.PI / 2, 0]} material={busGlassMat}>
            <planeGeometry args={[1.3, 1.3]} />
          </mesh>
        ))
      )}
      {/* Bumpers */}
      <mesh position={[0, 0.55, -3.82]} material={busDarkMat}>
        <boxGeometry args={[3.4, 0.4, 0.2]} />
      </mesh>
      <mesh position={[0, 0.55, 3.82]} material={busDarkMat}>
        <boxGeometry args={[3.4, 0.4, 0.2]} />
      </mesh>
      {/* Headlights */}
      {[-1, 1].map(s => (
        <mesh key={`hl-${s}`} position={[s * 1.1, 1.1, -3.78]} material={hlMat}>
          <sphereGeometry args={[0.2, 8, 6]} />
        </mesh>
      ))}
      {/* Tail lights */}
      {[-1, 1].map(s => (
        <mesh key={`tl-${s}`} position={[s * 1.2, 1.1, 3.8]} material={tlMat}>
          <boxGeometry args={[0.4, 0.25, 0.06]} />
        </mesh>
      ))}
      {/* Turn signals */}
      {[-1, 1].map(s => (
        <mesh key={`ts-${s}`} position={[s * 1.4, 1.4, -3.8]} material={tsMat}>
          <boxGeometry args={[0.25, 0.15, 0.06]} />
        </mesh>
      ))}
      {/* Wheels */}
      {[-2.2, 2.2].map(zo =>
        [-1, 1].map(s => (
          <group key={`wh-${zo}-${s}`}>
            <mesh position={[s * 1.7, 0.55, zo]} rotation={[0, 0, Math.PI / 2]} castShadow material={whMat}>
              <cylinderGeometry args={[0.55, 0.55, 0.35, 12]} />
            </mesh>
            <mesh position={[s * 1.7, 0.55, zo]} rotation={[0, 0, Math.PI / 2]} material={hubMat}>
              <cylinderGeometry args={[0.18, 0.18, 0.38, 8]} />
            </mesh>
          </group>
        ))
      )}
      {/* Red stripe */}
      {[-1, 1].map(s => (
        <mesh key={`str-${s}`} position={[s * 1.62, 1.4, 0]} rotation={[0, s * Math.PI / 2, 0]} material={strMat}>
          <planeGeometry args={[7.55, 0.25]} />
        </mesh>
      ))}
      {/* Route display */}
      <mesh position={[0, 3.0, -3.77]} material={routeMat}>
        <planeGeometry args={[1.8, 0.65]} />
      </mesh>
      {/* Side mirrors */}
      {[-1, 1].map(s => (
        <mesh key={`mir-${s}`} position={[s * 1.8, 2.0, -3.0]} material={busDarkMat}>
          <boxGeometry args={[0.3, 0.2, 0.15]} />
        </mesh>
      ))}
    </group>
  );
}

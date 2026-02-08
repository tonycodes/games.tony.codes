import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { useBusGameStore } from '../store/busGameStore';

// Materials
const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe8b400, roughness: 0.35, metalness: 0.15 });
const trimMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.3, metalness: 0.5 });
const darkMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.6, metalness: 0.2 });
const glassMat = new THREE.MeshStandardMaterial({ color: 0x8abbdd, roughness: 0.1, metalness: 0.4, transparent: true, opacity: 0.4 });
const acMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5, metalness: 0.3 });
const hlMat = new THREE.MeshStandardMaterial({ color: 0xffffee, emissive: 0xffffcc, emissiveIntensity: 0.8, roughness: 0.1, metalness: 0.3 });
const tlMat = new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: 0xff1100, emissiveIntensity: 0.6, roughness: 0.2 });
const tsMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xff8800, emissiveIntensity: 0.4, roughness: 0.2 });
const whMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.75, metalness: 0.1 });
const hubMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.3, metalness: 0.7 });
const stripeMat = new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.4, metalness: 0.1 });
const routeMat = new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff4400, emissiveIntensity: 0.4, roughness: 0.3 });
const grilleMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7, metalness: 0.3 });

export default function Bus() {
  const ref = useRef();

  useFrame(() => {
    if (!ref.current) return;
    const s = useBusGameStore.getState();
    ref.current.position.x = s.posX;
    ref.current.position.z = s.posZ;
    ref.current.rotation.y = s.heading;

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
      {/* === MAIN BODY — RoundedBox for soft edges === */}
      <RoundedBox args={[3.2, 2.3, 7.5]} radius={0.15} smoothness={4} position={[0, 2.05, 0]} castShadow material={bodyMat} />

      {/* Lower skirt / chassis — darker, below main body */}
      <mesh position={[0, 0.65, 0]} castShadow material={darkMat}>
        <boxGeometry args={[3.2, 0.5, 7.5]} />
      </mesh>

      {/* Roof trim — slight overhang */}
      <mesh position={[0, 3.22, 0]} material={trimMat}>
        <boxGeometry args={[3.35, 0.06, 7.65]} />
      </mesh>

      {/* AC unit on roof */}
      <RoundedBox args={[1.6, 0.3, 2.2]} radius={0.08} smoothness={2} position={[0, 3.45, 0]} material={acMat} />

      {/* === FRONT FACE === */}
      {/* Windshield — large, raked back */}
      <mesh position={[0, 2.5, -3.68]} rotation={[0.12, 0, 0]} material={glassMat}>
        <planeGeometry args={[2.8, 1.6]} />
      </mesh>
      {/* Front grille / panel below windshield */}
      <mesh position={[0, 1.15, -3.76]} material={grilleMat}>
        <boxGeometry args={[2.8, 1.0, 0.06]} />
      </mesh>
      {/* Grille vents (horizontal lines) */}
      {[0, 0.2, -0.2].map((dy, i) => (
        <mesh key={`gv-${i}`} position={[0, 1.15 + dy, -3.78]} material={trimMat}>
          <boxGeometry args={[2.4, 0.03, 0.02]} />
        </mesh>
      ))}
      {/* Route display above windshield */}
      <mesh position={[0, 3.05, -3.76]} material={routeMat}>
        <boxGeometry args={[2.0, 0.5, 0.08]} />
      </mesh>

      {/* Front bumper */}
      <RoundedBox args={[3.3, 0.25, 0.3]} radius={0.06} smoothness={2} position={[0, 0.35, -3.82]} material={darkMat} />

      {/* Headlights */}
      {[-1, 1].map(s => (
        <mesh key={`hl-${s}`} position={[s * 1.3, 1.35, -3.78]} material={hlMat}>
          <cylinderGeometry args={[0.18, 0.18, 0.06, 10]} />
        </mesh>
      ))}
      {/* Turn signals */}
      {[-1, 1].map(s => (
        <mesh key={`ts-${s}`} position={[s * 1.3, 0.85, -3.78]} material={tsMat}>
          <boxGeometry args={[0.3, 0.12, 0.06]} />
        </mesh>
      ))}

      {/* === REAR FACE === */}
      {/* Rear window */}
      <mesh position={[0, 2.5, 3.76]} rotation={[0, Math.PI, 0]} material={glassMat}>
        <planeGeometry args={[2.2, 1.2]} />
      </mesh>
      {/* Rear engine grille */}
      <mesh position={[0, 1.1, 3.76]} material={grilleMat}>
        <boxGeometry args={[2.6, 0.9, 0.06]} />
      </mesh>
      {/* Rear bumper */}
      <RoundedBox args={[3.3, 0.25, 0.3]} radius={0.06} smoothness={2} position={[0, 0.35, 3.82]} material={darkMat} />
      {/* Tail lights */}
      {[-1, 1].map(s => (
        <mesh key={`tl-${s}`} position={[s * 1.35, 1.6, 3.78]} material={tlMat}>
          <boxGeometry args={[0.35, 0.6, 0.06]} />
        </mesh>
      ))}

      {/* === SIDE WINDOWS — 5 per side with pillars === */}
      {[-1, 1].map(side =>
        [-2.6, -1.3, 0, 1.3, 2.6].map((zOff, wi) => (
          <mesh key={`sw-${side}-${wi}`} position={[side * 1.61, 2.4, zOff]} rotation={[0, side * Math.PI / 2, 0]} material={glassMat}>
            <planeGeometry args={[1.05, 1.2]} />
          </mesh>
        ))
      )}
      {/* Window frame trim (top rail) */}
      {[-1, 1].map(side => (
        <mesh key={`wr-${side}`} position={[side * 1.62, 3.05, 0]} material={trimMat}>
          <boxGeometry args={[0.04, 0.06, 7.0]} />
        </mesh>
      ))}
      {/* Window frame trim (bottom rail — stripe) */}
      {[-1, 1].map(side => (
        <mesh key={`str-${side}`} position={[side * 1.62, 1.75, 0]} rotation={[0, side * Math.PI / 2, 0]} material={stripeMat}>
          <planeGeometry args={[7.2, 0.15]} />
        </mesh>
      ))}

      {/* === DOORS — front and rear (right side only) === */}
      {/* Front door cutout */}
      <mesh position={[1.62, 1.5, -2.8]} rotation={[0, Math.PI / 2, 0]} material={darkMat}>
        <planeGeometry args={[0.9, 2.2]} />
      </mesh>
      {/* Rear door cutout */}
      <mesh position={[1.62, 1.5, 1.0]} rotation={[0, Math.PI / 2, 0]} material={darkMat}>
        <planeGeometry args={[0.9, 2.2]} />
      </mesh>

      {/* === WHEELS — torus tires + hubs === */}
      {[-2.4, 2.4].map(zPos =>
        [-1, 1].map(side => (
          <group key={`wh-${zPos}-${side}`}>
            <mesh position={[side * 1.45, 0.55, zPos]} rotation={[0, 0, Math.PI / 2]} castShadow material={whMat}>
              <torusGeometry args={[0.35, 0.2, 8, 14]} />
            </mesh>
            <mesh position={[side * 1.5, 0.55, zPos]} rotation={[0, 0, Math.PI / 2]} material={hubMat}>
              <cylinderGeometry args={[0.18, 0.18, 0.25, 8]} />
            </mesh>
          </group>
        ))
      )}

      {/* === SIDE MIRRORS === */}
      {[-1, 1].map(side => (
        <group key={`mir-${side}`} position={[side * 1.8, 2.6, -3.4]}>
          <mesh material={darkMat}>
            <boxGeometry args={[0.3, 0.04, 0.04]} />
          </mesh>
          <mesh position={[side * 0.12, -0.08, 0]} material={glassMat}>
            <boxGeometry args={[0.15, 0.18, 0.1]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

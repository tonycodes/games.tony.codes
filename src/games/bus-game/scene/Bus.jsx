import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useBusGameStore } from '../store/busGameStore';

// Our bus yellow to replace the model's white body panels
const BUS_YELLOW = new THREE.Color(0xe8b400);
// Bus model faces ~46° off-axis (toward -X,+Z); rotate to align with game's -Z forward
// PCA of all vertices: forward angle α = -0.8015 rad → rotation = π - α = π + 0.8015 ≈ -2.34
const MODEL_ROTATION_Y = -2.34;

export default function Bus() {
  const ref = useRef();
  const { scene } = useGLTF('/models/bus.glb');

  const busModel = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // Clone material so we don't mutate the cached original
        if (child.material) {
          child.material = child.material.clone();
          // Recolor the white body panels to our bus yellow
          // Model body is white: rgb(1.00, 1.00, 1.00)
          if (child.material.color) {
            const c = child.material.color;
            // White body panels → bus yellow
            if (c.r > 0.95 && c.g > 0.95 && c.b > 0.95) {
              child.material.color.copy(BUS_YELLOW);
            }
            // Blue STM stripe → dark trim
            if (c.b > 0.7 && c.r < 0.1 && c.g < 0.4) {
              child.material.color.set(0x2a2a2a);
            }
          }
          child.material.roughness = Math.max(child.material.roughness, 0.3);
        }
      }
    });
    return clone;
  }, [scene]);

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
      <primitive object={busModel} scale={2.5} position={[0, 1.6, 0]} rotation={[0, MODEL_ROTATION_Y, 0.05]} />
    </group>
  );
}

useGLTF.preload('/models/bus.glb');

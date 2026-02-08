import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useBusGameStore } from '../store/busGameStore';

const _dOff = new THREE.Vector3();
const _ct = new THREE.Vector3();
const _la = new THREE.Vector3();

export default function GameCamera() {
  const { camera } = useThree();
  const camOff = useRef(new THREE.Vector3(0, 12, 20));
  const camLk = useRef(new THREE.Vector3(0, 2.5, 0));

  useFrame((_, dt) => {
    const s = useBusGameStore.getState();

    _dOff.set(
      Math.sin(s.heading) * 22,
      10 + Math.abs(s.speed) * 0.12,
      Math.cos(s.heading) * 22,
    );
    camOff.current.lerp(_dOff, dt * 2.5);

    _ct.set(
      s.posX + camOff.current.x,
      camOff.current.y,
      s.posZ + camOff.current.z,
    );

    if (s.camShake > 0) {
      const sa = s.camShake * 1.5;
      const t = performance.now();
      _ct.x += Math.sin(t * 0.05) * sa;
      _ct.y += Math.cos(t * 0.07) * sa * 0.5;
      _ct.z += Math.sin(t * 0.06) * sa;
    }

    camera.position.lerp(_ct, dt * 4);

    _la.set(
      s.posX - Math.sin(s.heading) * 8,
      2.5,
      s.posZ - Math.cos(s.heading) * 8,
    );
    camLk.current.lerp(_la, dt * 5);
    camera.lookAt(camLk.current);
  });

  return null;
}

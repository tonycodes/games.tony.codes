import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

export default function BusGameScene({ children }) {
  return (
    <Canvas
      shadows
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      camera={{ fov: 50, near: 0.5, far: 700, position: [0, 20, 100] }}
    >
      <color attach="background" args={[0x6ab4d6]} />
      <fogExp2 attach="fog" args={[0x9dc8db, 0.0018]} />
      {children}
    </Canvas>
  );
}

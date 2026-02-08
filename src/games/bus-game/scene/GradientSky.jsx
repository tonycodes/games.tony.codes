import { useMemo } from 'react';
import * as THREE from 'three';

const vertexShader = `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 uZenith;
  uniform vec3 uMid;
  uniform vec3 uHorizon;
  varying vec3 vWorldPosition;

  void main() {
    float h = normalize(vWorldPosition).y;
    // h goes from -1 (bottom) to 1 (top)
    // Remap: 0 = horizon, 1 = zenith
    float t = clamp(h, 0.0, 1.0);

    // Two-step blend: horizon -> mid -> zenith
    vec3 color;
    if (t < 0.3) {
      color = mix(uHorizon, uMid, t / 0.3);
    } else {
      color = mix(uMid, uZenith, (t - 0.3) / 0.7);
    }

    // Below horizon fades to horizon color
    if (h < 0.0) {
      color = uHorizon;
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function GradientSky() {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uZenith: { value: new THREE.Color(0x1a5276) },
        uMid: { value: new THREE.Color(0x6ab4d6) },
        uHorizon: { value: new THREE.Color(0xc8dce8) },
      },
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, []);

  return (
    <mesh material={material}>
      <sphereGeometry args={[500, 32, 16]} />
    </mesh>
  );
}

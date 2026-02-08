import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useBusGameStore } from '../store/busGameStore';

const particleVertexShader = `
  attribute float aOpacity;
  attribute float aSize;
  varying float vOpacity;

  void main() {
    vOpacity = aOpacity;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const particleFragmentShader = `
  uniform vec3 uColor;
  varying float vOpacity;

  void main() {
    // Circular soft-edge point
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float alpha = vOpacity * smoothstep(0.5, 0.15, d);
    gl_FragColor = vec4(uColor, alpha);
  }
`;

const EXHAUST_COUNT = 80;
const DUST_COUNT = 60;

function createParticleSystem(count, color) {
  const positions = new Float32Array(count * 3);
  const opacities = new Float32Array(count);
  const sizes = new Float32Array(count);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.ShaderMaterial({
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
    uniforms: { uColor: { value: new THREE.Color(color) } },
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  return { geo, mat };
}

export default function BusParticles() {
  const exhaustRef = useRef();
  const dustRef = useRef();

  // Ring-buffer indices
  const exhaustIdx = useRef(0);
  const dustIdx = useRef(0);

  // Per-particle state (velocity + lifetime) — kept in JS, no GC
  const exhaustState = useMemo(() => ({
    vx: new Float32Array(EXHAUST_COUNT),
    vy: new Float32Array(EXHAUST_COUNT),
    vz: new Float32Array(EXHAUST_COUNT),
    life: new Float32Array(EXHAUST_COUNT),
    maxLife: new Float32Array(EXHAUST_COUNT),
  }), []);

  const dustState = useMemo(() => ({
    vx: new Float32Array(DUST_COUNT),
    vy: new Float32Array(DUST_COUNT),
    vz: new Float32Array(DUST_COUNT),
    life: new Float32Array(DUST_COUNT),
    maxLife: new Float32Array(DUST_COUNT),
  }), []);

  // Accumulator for emission timing
  const emitAccum = useRef({ exhaust: 0, dust: 0 });

  const exhaust = useMemo(() => createParticleSystem(EXHAUST_COUNT, 0x555555), []);
  const dust = useMemo(() => createParticleSystem(DUST_COUNT, 0xa08060), []);

  useFrame((_, dt) => {
    if (dt > 0.1) return; // Skip large frame jumps

    const s = useBusGameStore.getState();
    if (s.phase !== 'playing' && s.phase !== 'stopped') return;

    const speed = s.speed;
    const absSpeed = Math.abs(speed);
    const heading = s.heading;
    const steer = s.steer;
    const sinH = Math.sin(heading);
    const cosH = Math.cos(heading);

    // === EXHAUST SYSTEM ===
    const exhaustPoints = exhaustRef.current;
    if (exhaustPoints) {
      const pos = exhaust.geo.attributes.position;
      const opac = exhaust.geo.attributes.aOpacity;
      const sz = exhaust.geo.attributes.aSize;

      // Emit rate proportional to speed (~40/s at max)
      const emitRate = (absSpeed / 30) * 40;
      emitAccum.current.exhaust += emitRate * dt;

      while (emitAccum.current.exhaust >= 1) {
        emitAccum.current.exhaust -= 1;
        const idx = exhaustIdx.current % EXHAUST_COUNT;
        exhaustIdx.current++;

        // Rear bumper local position [0, 0.55, 3.82] -> world
        const localX = (Math.random() - 0.5) * 0.5;
        const localZ = 3.92;
        const wx = s.posX + localX * cosH + localZ * sinH;
        const wz = s.posZ - localX * sinH + localZ * cosH;

        pos.setXYZ(idx, wx, 0.55, wz);
        opac.setX(idx, 0.6);
        sz.setX(idx, 2 + Math.random() * 2);

        // Drift upward + backward
        const backDir = speed >= 0 ? 1 : -1;
        exhaustState.vx[idx] = sinH * backDir * 2 + (Math.random() - 0.5) * 0.5;
        exhaustState.vy[idx] = 1.5 + Math.random() * 0.5;
        exhaustState.vz[idx] = cosH * backDir * 2 + (Math.random() - 0.5) * 0.5;
        exhaustState.life[idx] = 0;
        exhaustState.maxLife[idx] = 0.8 + Math.random() * 0.4;
      }

      // Update all exhaust particles
      for (let i = 0; i < EXHAUST_COUNT; i++) {
        if (exhaustState.maxLife[i] === 0) continue;
        exhaustState.life[i] += dt;

        if (exhaustState.life[i] >= exhaustState.maxLife[i]) {
          opac.setX(i, 0);
          exhaustState.maxLife[i] = 0;
          continue;
        }

        const t = exhaustState.life[i] / exhaustState.maxLife[i];
        pos.setX(i, pos.getX(i) + exhaustState.vx[i] * dt);
        pos.setY(i, pos.getY(i) + exhaustState.vy[i] * dt);
        pos.setZ(i, pos.getZ(i) + exhaustState.vz[i] * dt);

        // Expand and fade
        opac.setX(i, 0.6 * (1 - t));
        sz.setX(i, sz.getX(i) + dt * 3);
      }

      pos.needsUpdate = true;
      opac.needsUpdate = true;
      sz.needsUpdate = true;
    }

    // === DUST SYSTEM ===
    const dustPoints = dustRef.current;
    if (dustPoints) {
      const pos = dust.geo.attributes.position;
      const opac = dust.geo.attributes.aOpacity;
      const sz = dust.geo.attributes.aSize;

      // Emit only when steering hard and moving fast
      const shouldEmitDust = Math.abs(steer) > 0.3 && absSpeed > 8;

      if (shouldEmitDust) {
        const dustRate = Math.min(Math.abs(steer), 1) * (absSpeed / 20) * 30;
        emitAccum.current.dust += dustRate * dt;

        while (emitAccum.current.dust >= 1) {
          emitAccum.current.dust -= 1;
          const idx = dustIdx.current % DUST_COUNT;
          dustIdx.current++;

          // Rear wheels, offset opposite to turn direction
          const side = steer > 0 ? -1 : 1;
          const localX = side * (1.5 + Math.random() * 0.5);
          const localZ = 2.2 + (Math.random() - 0.5) * 0.5;
          const wx = s.posX + localX * cosH + localZ * sinH;
          const wz = s.posZ - localX * sinH + localZ * cosH;

          pos.setXYZ(idx, wx, 0.15, wz);
          opac.setX(idx, 0.5);
          sz.setX(idx, 4 + Math.random() * 4);

          // Kick outward and up
          dustState.vx[idx] = side * cosH * 3 + (Math.random() - 0.5) * 2;
          dustState.vy[idx] = 2 + Math.random() * 1.5;
          dustState.vz[idx] = -side * sinH * 3 + (Math.random() - 0.5) * 2;
          dustState.life[idx] = 0;
          dustState.maxLife[idx] = 0.6 + Math.random() * 0.4;
        }
      }

      // Update all dust particles
      for (let i = 0; i < DUST_COUNT; i++) {
        if (dustState.maxLife[i] === 0) continue;
        dustState.life[i] += dt;

        if (dustState.life[i] >= dustState.maxLife[i]) {
          opac.setX(i, 0);
          dustState.maxLife[i] = 0;
          continue;
        }

        const t = dustState.life[i] / dustState.maxLife[i];
        pos.setX(i, pos.getX(i) + dustState.vx[i] * dt);
        pos.setY(i, pos.getY(i) + dustState.vy[i] * dt);
        pos.setZ(i, pos.getZ(i) + dustState.vz[i] * dt);

        // Gravity
        dustState.vy[i] -= 6 * dt;

        // Fade
        opac.setX(i, 0.5 * (1 - t));
        sz.setX(i, sz.getX(i) + dt * 2);
      }

      pos.needsUpdate = true;
      opac.needsUpdate = true;
      sz.needsUpdate = true;
    }
  });

  return (
    <group>
      <points ref={exhaustRef} geometry={exhaust.geo} material={exhaust.mat} frustumCulled={false} />
      <points ref={dustRef} geometry={dust.geo} material={dust.mat} frustumCulled={false} />
    </group>
  );
}

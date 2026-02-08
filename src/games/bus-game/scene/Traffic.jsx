import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { ROUTE } from '../data/routeData';
import { dd } from '../data/mathUtils';
import { useBusGameStore } from '../store/busGameStore';

const carColors = [0xcc3333, 0x3366cc, 0x33aa55, 0xeeeeee, 0x222222, 0x888888, 0xdd8800, 0x6633aa, 0x44aaaa, 0xaa3366];
const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.75, metalness: 0.1 });
const glassMat = new THREE.MeshStandardMaterial({ color: 0x88bbdd, roughness: 0.1, metalness: 0.4, transparent: true, opacity: 0.5 });

const NUM_TRAFFIC = 12;
const MODEL_PATHS = ['/models/sedan.glb', '/models/suv.glb', '/models/hatchback.glb'];

// Scale factors to match game-world car sizes
// Kenney models are chunky low-poly; keep them smaller relative to bus
const MODEL_SCALES = [1.5, 1.6, 1.3];

function positionOnSegment(tv) {
  const R = ROUTE;
  let s = tv.seg;
  if (s < 0) s = 0; if (s >= R.length - 1) s = R.length - 2;
  const ax = R[s][0], az = R[s][1], bx = R[s + 1][0], bz = R[s + 1][1];
  const dx = bx - ax, dz = bz - az;
  let posX = ax + dx * tv.segT;
  let posZ = az + dz * tv.segT;
  const segAng = Math.atan2(dx, dz);
  const carAng = tv.dir === 1 ? segAng : segAng + Math.PI;
  const side = tv.dir;
  posX += Math.cos(segAng) * side * tv.laneOff;
  posZ += -Math.sin(segAng) * side * tv.laneOff;
  tv.wx = posX; tv.wz = posZ; tv.ang = carAng;
  return { posX, posZ, carAng };
}

function cloneWithColor(scene, bodyColor) {
  const clone = scene.clone(true);
  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.35, metalness: 0.2 });
  clone.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    const name = child.name.toLowerCase();
    if (name.includes('wheel')) {
      child.material = wheelMat;
    } else {
      // Body mesh — apply car color
      child.material = bodyMat;
    }
  });
  return clone;
}

export default function Traffic({ trafficRef }) {
  const meshRefs = useRef([]);
  const sedanGltf = useGLTF(MODEL_PATHS[0]);
  const suvGltf = useGLTF(MODEL_PATHS[1]);
  const hatchGltf = useGLTF(MODEL_PATHS[2]);
  const scenes = [sedanGltf.scene, suvGltf.scene, hatchGltf.scene];

  const initData = useMemo(() => {
    const vehicles = [];
    for (let i = 0; i < NUM_TRAFFIC; i++) {
      const carType = Math.floor(Math.random() * 3);
      const seg = Math.floor(Math.random() * (ROUTE.length - 1));
      const segT = Math.random();
      const dir = Math.random() > 0.5 ? 1 : -1;
      let baseSpd = 6 + Math.random() * 8;
      if (carType === 1) baseSpd *= 0.85;
      if (carType === 2) baseSpd *= 1.1;
      const color = carColors[Math.floor(Math.random() * carColors.length)];

      const tv = {
        seg, segT, dir, laneOff: 3.5, speed: baseSpd, baseSpeed: baseSpd,
        type: carType, waiting: 0,
        halfLen: carType === 1 ? 2.3 : carType === 0 ? 2.0 : 1.6,
        halfWid: carType === 1 ? 1.1 : carType === 0 ? 1.05 : 0.9,
        wx: 0, wz: 0, ang: 0, color,
      };
      positionOnSegment(tv);
      vehicles.push(tv);
    }
    return vehicles;
  }, []);

  // Create cloned models with per-vehicle colors
  const vehicleModels = useMemo(() => {
    return initData.map((tv) => {
      const baseScene = scenes[tv.type];
      return cloneWithColor(baseScene, tv.color);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initData, scenes[0], scenes[1], scenes[2]]);

  if (trafficRef) {
    trafficRef.current = initData;
  }

  useFrame((_, dt) => {
    const R = ROUTE;
    const traffic = trafficRef.current;
    if (!traffic) return;

    const s = useBusGameStore.getState();
    const busX = s.posX, busZ = s.posZ;

    for (let ti = 0; ti < traffic.length; ti++) {
      const tv = traffic[ti];
      let tSeg = tv.seg;
      let segLen = dd(R[tSeg][0], R[tSeg][1], R[tSeg + 1][0], R[tSeg + 1][1]);
      if (segLen < 0.1) segLen = 0.1;

      let curSpd = tv.baseSpeed;
      for (let tj = 0; tj < traffic.length; tj++) {
        if (ti === tj) continue;
        const ot = traffic[tj];
        const dToOther = dd(tv.wx, tv.wz, ot.wx, ot.wz);
        if (dToOther < 12) {
          const toOtherX = ot.wx - tv.wx, toOtherZ = ot.wz - tv.wz;
          const fwdX = -Math.sin(tv.ang), fwdZ = -Math.cos(tv.ang);
          const dot = toOtherX * fwdX + toOtherZ * fwdZ;
          if (dot > 0 && dToOther < 10) {
            curSpd = Math.min(curSpd, Math.max(dToOther * 0.8, 1));
          }
        }
      }

      const dToBus = dd(tv.wx, tv.wz, busX, busZ);
      if (dToBus < 14) {
        const toBusX = busX - tv.wx, toBusZ = busZ - tv.wz;
        const fwdX2 = -Math.sin(tv.ang), fwdZ2 = -Math.cos(tv.ang);
        const dot2 = toBusX * fwdX2 + toBusZ * fwdZ2;
        if (dot2 > 0 && dToBus < 12) {
          curSpd = Math.min(curSpd, Math.max(dToBus * 0.6, 0.5));
        }
      }

      tv.speed = tv.speed + (curSpd - tv.speed) * dt * 3;

      const advance = tv.speed * dt / segLen;
      if (tv.dir === 1) {
        tv.segT += advance;
        while (tv.segT >= 1) {
          tv.segT -= 1; tv.seg++;
          if (tv.seg >= R.length - 1) { tv.seg = 0; tv.segT = 0; }
          tSeg = tv.seg;
          segLen = dd(R[tSeg][0], R[tSeg][1], R[tSeg + 1][0], R[tSeg + 1][1]);
          if (segLen < 0.1) segLen = 0.1;
        }
      } else {
        tv.segT -= advance;
        while (tv.segT < 0) {
          tv.segT += 1; tv.seg--;
          if (tv.seg < 0) { tv.seg = R.length - 2; tv.segT = 1; }
          tSeg = tv.seg;
          segLen = dd(R[tSeg][0], R[tSeg][1], R[tSeg + 1][0], R[tSeg + 1][1]);
          if (segLen < 0.1) segLen = 0.1;
        }
      }

      const p = positionOnSegment(tv);
      const mesh = meshRefs.current[ti];
      if (mesh) {
        mesh.position.set(p.posX, 0, p.posZ);
        mesh.rotation.y = p.carAng;
      }
    }
  });

  return (
    <group>
      {initData.map((tv, i) => (
        <group key={i} ref={(el) => { meshRefs.current[i] = el; }} position={[tv.wx, 0, tv.wz]} rotation={[0, tv.ang, 0]}>
          <primitive object={vehicleModels[i]} scale={MODEL_SCALES[tv.type]} />
        </group>
      ))}
    </group>
  );
}

MODEL_PATHS.forEach(p => useGLTF.preload(p));

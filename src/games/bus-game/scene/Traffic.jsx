import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ROUTE } from '../data/routeData';
import { dd } from '../data/mathUtils';
import { useBusGameStore } from '../store/busGameStore';

const carGlassMat = new THREE.MeshStandardMaterial({ color: 0x88bbdd, roughness: 0.1, metalness: 0.4, transparent: true, opacity: 0.5 });
const carWhMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.75, metalness: 0.1 });
const carTailMat = new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: 0xff1100, emissiveIntensity: 0.4, roughness: 0.2 });
const carHeadMat = new THREE.MeshStandardMaterial({ color: 0xffffee, emissive: 0xffffaa, emissiveIntensity: 0.5, roughness: 0.1 });
const carDarkMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.6, metalness: 0.2 });
const carColors = [0xcc3333, 0x3366cc, 0x33aa55, 0xeeeeee, 0x222222, 0x888888, 0xdd8800, 0x6633aa, 0x44aaaa, 0xaa3366];

const NUM_TRAFFIC = 12;

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

export default function Traffic({ trafficRef }) {
  const meshRefs = useRef([]);

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

  // Store reference for collision checks
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

      // Slow down near other cars
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

      // Slow near bus
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

      // Advance
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
      {initData.map((tv, i) => {
        const bodyMat = new THREE.MeshStandardMaterial({ color: tv.color, roughness: 0.35, metalness: 0.2 });
        const type = tv.type;
        return (
          <group key={i} ref={(el) => { meshRefs.current[i] = el; }} position={[tv.wx, 0, tv.wz]} rotation={[0, tv.ang, 0]}>
            {type === 0 && (
              <>
                <mesh position={[0, 0.85, 0]} castShadow material={bodyMat}><boxGeometry args={[2.0, 1.1, 4.0]} /></mesh>
                <mesh position={[0, 1.7, 0.1]} castShadow material={bodyMat}><boxGeometry args={[1.8, 0.8, 2.2]} /></mesh>
                <mesh position={[0, 1.5, -0.98]} rotation={[0.15, 0, 0]} material={carGlassMat}><planeGeometry args={[1.6, 0.7]} /></mesh>
                <mesh position={[0, 1.5, 1.2]} rotation={[-0.2, Math.PI, 0]} material={carGlassMat}><planeGeometry args={[1.5, 0.6]} /></mesh>
              </>
            )}
            {type === 1 && (
              <>
                <mesh position={[0, 1.1, 0]} castShadow material={bodyMat}><boxGeometry args={[2.1, 1.5, 4.5]} /></mesh>
                <mesh position={[0, 2.15, 0.2]} castShadow material={bodyMat}><boxGeometry args={[1.9, 0.8, 3.0]} /></mesh>
                <mesh position={[0, 1.9, -1.28]} rotation={[0.1, 0, 0]} material={carGlassMat}><planeGeometry args={[1.7, 0.7]} /></mesh>
              </>
            )}
            {type === 2 && (
              <>
                <mesh position={[0, 0.8, 0]} castShadow material={bodyMat}><boxGeometry args={[1.7, 1.0, 3.2]} /></mesh>
                <mesh position={[0, 1.55, 0.15]} castShadow material={bodyMat}><boxGeometry args={[1.5, 0.7, 1.8]} /></mesh>
                <mesh position={[0, 1.3, -0.73]} rotation={[0.15, 0, 0]} material={carGlassMat}><planeGeometry args={[1.3, 0.6]} /></mesh>
              </>
            )}
            {/* Bumper */}
            <mesh position={[0, 0.4, -(type === 1 ? 2.26 : type === 0 ? 2.01 : 1.61)]} material={carDarkMat}>
              <boxGeometry args={[type === 1 ? 2.2 : type === 0 ? 2.1 : 1.8, 0.2, 0.15]} />
            </mesh>
            {/* Headlights */}
            {[-1, 1].map(hs => {
              const hlw = type === 1 ? 0.8 : type === 0 ? 0.7 : 0.6;
              return (
                <mesh key={`hl-${hs}`} position={[hs * hlw, 0.6, -(type === 1 ? 2.26 : type === 0 ? 2.01 : 1.61)]} material={carHeadMat}>
                  <sphereGeometry args={[0.12, 6, 4]} />
                </mesh>
              );
            })}
            {/* Tail lights */}
            {[-1, 1].map(ts => {
              const hlw = type === 1 ? 0.8 : type === 0 ? 0.7 : 0.6;
              return (
                <mesh key={`tl-${ts}`} position={[ts * hlw, 0.6, type === 1 ? 2.26 : type === 0 ? 2.01 : 1.61]} material={carTailMat}>
                  <boxGeometry args={[0.25, 0.15, 0.06]} />
                </mesh>
              );
            })}
            {/* Wheels */}
            {[-1, 1].map(wside =>
              [-1, 1].map(wend => {
                const wz = type === 1 ? 1.5 : type === 0 ? 1.3 : 1.0;
                const wr = type === 1 ? 0.4 : 0.35;
                const wx = type === 1 ? 1.1 : type === 0 ? 1.05 : 0.9;
                return (
                  <mesh key={`wh-${wside}-${wend}`} position={[wside * wx, wr, wend * wz]} rotation={[0, 0, Math.PI / 2]} castShadow material={carWhMat}>
                    <cylinderGeometry args={[wr, wr, 0.2, 8]} />
                  </mesh>
                );
              })
            )}
          </group>
        );
      })}
    </group>
  );
}

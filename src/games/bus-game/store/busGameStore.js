import { create } from 'zustand';
import { ROUTE, STOPS, newPax } from '../data/routeData';

const initHeading = Math.atan2(ROUTE[1][0] - ROUTE[0][0], ROUTE[1][1] - ROUTE[0][1]) + Math.PI;

function initialState() {
  return {
    phase: 'menu', // 'menu' | 'playing' | 'stopped' | 'complete'
    speed: 0,
    heading: initHeading,
    steer: 0,
    posX: ROUTE[0][0],
    posZ: ROUTE[0][1],
    prevX: ROUTE[0][0],
    prevZ: ROUTE[0][1],
    pax: newPax(),
    onBus: 0,
    delivered: 0,
    score: 0,
    nearIdx: -1,
    stoppedIdx: -1,
    time: 0,
    nextWp: 1,
    visited: {},
    crashed: false,
    crashTimer: 0,
    damage: 0,
    camShake: 0,
    nextStopName: STOPS[0].n,
    lastBoardOn: 0,
    lastBoardOff: 0,
    stopName: '',
  };
}

export const useBusGameStore = create((set, get) => ({
  ...initialState(),

  startPlaying: () => {
    const s = get();
    // Reset game state for fresh start
    const fresh = initialState();
    set({
      ...fresh,
      phase: 'playing',
    });
  },

  setPhase: (phase) => set({ phase }),

  // Called every frame from GameController
  updateFrame: (updates) => set(updates),

  openDoors: (audioRef) => {
    const s = get();
    if (s.phase === 'playing' && s.nearIdx >= 0 && Math.abs(s.speed) < 2) {
      const pax = [...s.pax];
      let bOff = 0, bOn = 0, delivered = s.delivered, score = s.score, onBus = s.onBus;
      const ssi = s.nearIdx;

      if (audioRef.current) audioRef.current.playDoor();

      // Alight passengers
      for (let i = 0; i < pax.length; i++) {
        if (pax[i].on && pax[i].dest === ssi && !pax[i].done) {
          pax[i] = { ...pax[i], done: true, on: false };
          bOff++; delivered++; score += 100;
        }
      }
      // Board passengers
      for (let i = 0; i < pax.length; i++) {
        if (pax[i].origin === ssi && !pax[i].on && !pax[i].done) {
          pax[i] = { ...pax[i], on: true };
          bOn++;
        }
      }
      onBus = pax.filter(p => p.on).length;

      if (bOn > 0 && audioRef.current) audioRef.current.playBell();

      const visited = { ...s.visited, [ssi]: true };

      if (ssi === STOPS.length - 1) {
        // Terminal - route complete
        const rem = pax.filter(p => p.on && !p.done).length;
        set({
          pax, delivered, score: score - rem * 50, onBus: 0,
          visited, speed: 0, stoppedIdx: ssi,
          lastBoardOn: bOn, lastBoardOff: bOff,
          phase: 'complete', crashed: false, damage: s.damage,
        });
        return;
      }

      set({
        pax, delivered, score, onBus, speed: 0,
        visited, stoppedIdx: ssi, nearIdx: -1,
        lastBoardOn: bOn, lastBoardOff: bOff,
        stopName: STOPS[ssi].n,
        phase: 'stopped', crashed: false,
      });
    } else if (s.phase === 'stopped') {
      if (audioRef.current) audioRef.current.playDoor();
      set({ phase: 'playing', stoppedIdx: -1, stopName: '' });
    }
  },

  reset: () => set(initialState()),
}));

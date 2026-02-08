import { useBusGameStore } from '../store/busGameStore';
import { STOPS } from '../data/routeData';

export default function StopOverlay() {
  const phase = useBusGameStore((s) => s.phase);
  const nearIdx = useBusGameStore((s) => s.nearIdx);
  const speed = useBusGameStore((s) => Math.abs(s.speed));
  const crashed = useBusGameStore((s) => s.crashed);
  const stopName = useBusGameStore((s) => s.stopName);
  const lastBoardOn = useBusGameStore((s) => s.lastBoardOn);
  const lastBoardOff = useBusGameStore((s) => s.lastBoardOff);

  // Approach prompt
  if (phase === 'playing' && nearIdx >= 0 && speed < 5 && !crashed) {
    return (
      <div style={{
        position: 'absolute', bottom: 75, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.8)', borderRadius: 11, padding: '11px 24px',
        border: '2px solid #e8b400', textAlign: 'center', backdropFilter: 'blur(6px)', zIndex: 5,
      }}>
        <div style={{ color: '#e8b400', fontSize: 13, fontWeight: 'bold' }}>{'\u{1F68F}'} {STOPS[nearIdx].n}</div>
        <div style={{ color: '#aaa', fontSize: 10, marginTop: 2 }}>Stop &amp; press SPACE to open doors</div>
      </div>
    );
  }

  // Stopped at stop
  if (phase === 'stopped') {
    return (
      <div style={{
        position: 'absolute', bottom: 75, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.85)', borderRadius: 13, padding: '16px 30px',
        border: '2px solid #2ecc71', textAlign: 'center', minWidth: 240, backdropFilter: 'blur(8px)', zIndex: 5,
      }}>
        <div style={{ color: '#2ecc71', fontSize: 15, fontWeight: 'bold', marginBottom: 7 }}>{'\u{1F68F}'} {stopName}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 8 }}>
          {lastBoardOff > 0 && (
            <div>
              <div style={{ color: '#e74c3c', fontSize: 17, fontWeight: 'bold' }}>{'\u2193'} {lastBoardOff}</div>
              <div style={{ color: '#777', fontSize: 9 }}>ALIGHTING</div>
            </div>
          )}
          {lastBoardOn > 0 && (
            <div>
              <div style={{ color: '#2ecc71', fontSize: 17, fontWeight: 'bold' }}>{'\u2191'} {lastBoardOn}</div>
              <div style={{ color: '#777', fontSize: 9 }}>BOARDING</div>
            </div>
          )}
          {lastBoardOff === 0 && lastBoardOn === 0 && (
            <div style={{ color: '#777', fontSize: 11 }}>No passengers here</div>
          )}
        </div>
        <div style={{ color: '#e8b400', fontSize: 10 }}>Press SPACE to close doors &amp; continue</div>
      </div>
    );
  }

  return null;
}

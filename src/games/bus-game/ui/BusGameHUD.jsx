import { useBusGameStore } from '../store/busGameStore';

export default function BusGameHUD() {
  const phase = useBusGameStore((s) => s.phase);
  const speed = useBusGameStore((s) => Math.abs(s.speed));
  const score = useBusGameStore((s) => s.score);
  const onBus = useBusGameStore((s) => s.onBus);
  const delivered = useBusGameStore((s) => s.delivered);
  const time = useBusGameStore((s) => s.time);
  const nextStopName = useBusGameStore((s) => s.nextStopName);
  const nextWp = useBusGameStore((s) => s.nextWp);
  const crashed = useBusGameStore((s) => s.crashed);

  if (phase !== 'playing' && phase !== 'stopped') return null;

  const prog = nextWp / (25 - 1); // ROUTE.length - 1
  const kmh = Math.round(speed * 3.6);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pointerEvents: 'none', zIndex: 5 }}>
      {/* Speed + Route */}
      <div style={{ background: 'rgba(0,0,0,0.55)', borderRadius: 10, padding: '10px 16px', minWidth: 170, backdropFilter: 'blur(4px)' }}>
        <div style={{ color: '#777', fontSize: 9, letterSpacing: 2 }}>SPEED</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>{kmh}</span>
          <span style={{ color: '#555', fontSize: 10 }}>km/h</span>
        </div>
        <div style={{ background: '#222', borderRadius: 3, height: 4, marginTop: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 3, transition: 'width 0.1s',
            width: Math.min(speed / 30 * 100, 100) + '%',
            background: crashed ? '#ff3333' : speed > 21 ? '#e74c3c' : speed > 12 ? '#f39c12' : '#2ecc71',
          }} />
        </div>
        <div style={{ marginTop: 8 }}>
          <div style={{ color: '#777', fontSize: 9, letterSpacing: 2 }}>ROUTE</div>
          <div style={{ background: '#222', borderRadius: 3, height: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 3, background: '#3498db', width: Math.round(prog * 100) + '%', transition: 'width 0.3s' }} />
          </div>
          <div style={{ color: '#444', fontSize: 9, marginTop: 1 }}>{Math.round(prog * 100)}%</div>
        </div>
      </div>

      {/* Next Stop */}
      <div style={{ background: 'rgba(0,0,0,0.55)', borderRadius: 10, padding: '7px 20px', textAlign: 'center', backdropFilter: 'blur(4px)' }}>
        <div style={{ color: '#777', fontSize: 9, letterSpacing: 2 }}>NEXT STOP</div>
        <div style={{ color: '#00ccff', fontSize: 13, fontWeight: 'bold', marginTop: 1 }}>{nextStopName}</div>
      </div>

      {/* Score */}
      <div style={{ background: 'rgba(0,0,0,0.55)', borderRadius: 10, padding: '10px 16px', textAlign: 'right', minWidth: 130, backdropFilter: 'blur(4px)' }}>
        <div style={{ color: '#e8b400', fontSize: 19, fontWeight: 'bold' }}>{score}</div>
        <div style={{ color: '#555', fontSize: 9, letterSpacing: 2 }}>SCORE</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 6 }}>
          <div>
            <div style={{ color: '#f39c12', fontSize: 14, fontWeight: 'bold' }}>{onBus}</div>
            <div style={{ color: '#555', fontSize: 8 }}>ON BUS</div>
          </div>
          <div>
            <div style={{ color: '#2ecc71', fontSize: 14, fontWeight: 'bold' }}>{delivered}</div>
            <div style={{ color: '#555', fontSize: 8 }}>DONE</div>
          </div>
        </div>
        <div style={{ color: '#333', fontSize: 9, marginTop: 5 }}>{Math.floor(time)}s</div>
      </div>
    </div>
  );
}

import { useBusGameStore } from '../store/busGameStore';

export default function BusGameComplete({ onRestart }) {
  const phase = useBusGameStore((s) => s.phase);
  const score = useBusGameStore((s) => s.score);
  const delivered = useBusGameStore((s) => s.delivered);
  const pax = useBusGameStore((s) => s.pax);
  const damage = useBusGameStore((s) => s.damage);
  const time = useBusGameStore((s) => s.time);

  if (phase !== 'complete') return null;

  const tot = pax.length;
  const miss = tot - delivered;
  const pct = tot > 0 ? delivered / tot : 0;
  const rating = pct === 1 ? '\u2B50\u2B50\u2B50 PERFECT' : pct > 0.7 ? '\u2B50\u2B50 GREAT' : pct > 0.4 ? '\u2B50 DECENT' : 'NEEDS WORK';

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', zIndex: 10 }}>
      <div style={{ textAlign: 'center', maxWidth: 440, padding: 20 }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>{'\u{1F3C1}'}</div>
        <h1 style={{ fontSize: 32, margin: '0 0 4px', color: '#e8b400', letterSpacing: 3 }}>ROUTE COMPLETE</h1>
        <p style={{ color: '#ff8c00', fontSize: 18, margin: '6px 0 22px' }}>{rating}</p>
        <div style={{
          background: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: 22, marginBottom: 28,
          lineHeight: '2.3em', fontSize: 15, border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div>Score: <span style={{ color: '#e8b400', fontWeight: 'bold' }}>{score}</span></div>
          <div>Delivered: <span style={{ color: '#2ecc71' }}>{delivered}</span> / {tot}</div>
          {miss > 0 && <div>Missed: <span style={{ color: '#e74c3c' }}>{miss}</span></div>}
          {damage > 0 && <div>Collisions: <span style={{ color: '#ff8844' }}>{damage}</span></div>}
          <div>Time: <span style={{ color: '#3498db' }}>{Math.floor(time)}s</span></div>
        </div>
        <button onClick={onRestart} style={{
          background: 'linear-gradient(135deg,#e8b400,#ff6b00)', border: 'none', color: '#111',
          fontFamily: "'Courier New',monospace", fontSize: 17, fontWeight: 'bold', padding: '14px 44px',
          borderRadius: 10, cursor: 'pointer', letterSpacing: 2,
        }}>DRIVE AGAIN &#9654;</button>
      </div>
    </div>
  );
}

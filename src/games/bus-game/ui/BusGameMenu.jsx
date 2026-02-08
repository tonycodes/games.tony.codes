import { useBusGameStore } from '../store/busGameStore';

export default function BusGameMenu({ onStart }) {
  const phase = useBusGameStore((s) => s.phase);

  if (phase !== 'menu') return null;

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', zIndex: 10 }}>
      <div style={{ textAlign: 'center', maxWidth: 520, padding: 20 }}>
        <div style={{ fontSize: 68, marginBottom: 4 }}>{'\u{1F68C}'}</div>
        <h1 style={{ fontSize: 42, margin: '0 0 2px', letterSpacing: 5, color: '#e8b400' }}>BUS ROUTE 3D</h1>
        <p style={{ color: '#556', fontSize: 11, margin: '0 0 28px', letterSpacing: 3 }}>CITY TRANSIT SIMULATOR</p>
        <div style={{
          background: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: '20px 28px', marginBottom: 28,
          textAlign: 'left', lineHeight: '2.1em', fontSize: 13, border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ color: '#e8b400', fontWeight: 'bold', marginBottom: 8, fontSize: 13, letterSpacing: 2 }}>CONTROLS</div>
          <div><span style={{ color: '#ff8c00', display: 'inline-block', width: 75 }}>W / &#8593;</span> Accelerate</div>
          <div><span style={{ color: '#ff8c00', display: 'inline-block', width: 75 }}>S / &#8595;</span> Brake</div>
          <div><span style={{ color: '#ff8c00', display: 'inline-block', width: 75 }}>A / &#8592;</span> Steer Left</div>
          <div><span style={{ color: '#ff8c00', display: 'inline-block', width: 75 }}>D / &#8594;</span> Steer Right</div>
          <div><span style={{ color: '#ff8c00', display: 'inline-block', width: 75 }}>SPACE</span> Doors at stops</div>
          <div><span style={{ color: '#ff8c00', display: 'inline-block', width: 75 }}>H</span> Horn</div>
          <div style={{ marginTop: 10, color: '#888', fontSize: 11, lineHeight: '1.6em' }}>
            Follow blue arrows. Stop at green rings to pick up passengers. 100 pts per delivery. Watch for traffic!
          </div>
          <div style={{ marginTop: 6, color: '#6a8', fontSize: 11 }}>{'\u{1F50A}'} Engine sounds, music &amp; SFX included</div>
        </div>
        <button onClick={onStart} style={{
          background: 'linear-gradient(135deg,#e8b400,#ff6b00)', border: 'none', color: '#111',
          fontFamily: "'Courier New',monospace", fontSize: 19, fontWeight: 'bold', padding: '16px 52px',
          borderRadius: 10, cursor: 'pointer', letterSpacing: 3,
        }}>START ROUTE &#9654;</button>
      </div>
    </div>
  );
}

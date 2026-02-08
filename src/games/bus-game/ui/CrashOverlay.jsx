import { useBusGameStore } from '../store/busGameStore';

export default function CrashOverlay() {
  const phase = useBusGameStore((s) => s.phase);
  const crashed = useBusGameStore((s) => s.crashed);

  if (phase !== 'playing' || !crashed) return null;

  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', zIndex: 5, pointerEvents: 'none' }}>
      <div style={{
        color: '#ff3333', fontSize: 34, fontWeight: 'bold',
        textShadow: '0 0 20px rgba(255,0,0,0.8),0 0 40px rgba(255,0,0,0.4)', letterSpacing: 6,
      }}>
        {'\u{1F4A5}'} CRASH!
      </div>
      <div style={{ color: '#ffaa00', fontSize: 13, marginTop: 8, textShadow: '0 0 10px rgba(0,0,0,0.9)' }}>
        Hold {'\u2193'}/S to reverse out!
      </div>
    </div>
  );
}

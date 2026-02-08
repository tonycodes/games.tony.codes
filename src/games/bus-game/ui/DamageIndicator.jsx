import { useBusGameStore } from '../store/busGameStore';

export default function DamageIndicator() {
  const damage = useBusGameStore((s) => s.damage);

  if (damage <= 0) return null;

  return (
    <div style={{
      position: 'absolute', top: 78, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(140,25,25,0.6)', borderRadius: 8, padding: '3px 12px',
      backdropFilter: 'blur(4px)', zIndex: 5, pointerEvents: 'none',
    }}>
      <span style={{ color: '#ff9999', fontSize: 10 }}>{'\u26A0'} {damage} collision{damage > 1 ? 's' : ''}</span>
    </div>
  );
}

function btn(color, bg) {
  return {
    background: bg,
    border: '2px solid ' + color,
    color: color,
    fontFamily: "'Courier New', monospace",
    fontSize: 13,
    fontWeight: 'bold',
    padding: '10px 16px',
    borderRadius: 8,
    cursor: 'pointer',
    userSelect: 'none',
    touchAction: 'none',
    minWidth: 48,
    textAlign: 'center',
  };
}

export default function TouchControls({ onPress, onRelease, onAction }) {
  return (
    <div style={{ position: 'absolute', bottom: 8, left: 8, right: 8, display: 'flex', justifyContent: 'space-between', pointerEvents: 'auto', zIndex: 10 }}>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <button
          onPointerDown={() => onPress('arrowleft')}
          onPointerUp={() => onRelease('arrowleft')}
          onPointerLeave={() => onRelease('arrowleft')}
          style={btn('#3498db', 'rgba(52,152,219,0.15)')}
        >&#9664;</button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button
            onPointerDown={() => { if (onAction) onAction('gas'); onPress('arrowup'); }}
            onPointerUp={() => onRelease('arrowup')}
            onPointerLeave={() => onRelease('arrowup')}
            style={btn('#2ecc71', 'rgba(46,204,113,0.15)')}
          >&#9650; GAS</button>
          <button
            onPointerDown={() => onPress('arrowdown')}
            onPointerUp={() => onRelease('arrowdown')}
            onPointerLeave={() => onRelease('arrowdown')}
            style={btn('#e74c3c', 'rgba(231,76,60,0.15)')}
          >&#9660; BRK</button>
        </div>
        <button
          onPointerDown={() => onPress('arrowright')}
          onPointerUp={() => onRelease('arrowright')}
          onPointerLeave={() => onRelease('arrowright')}
          style={btn('#3498db', 'rgba(52,152,219,0.15)')}
        >&#9654;</button>
      </div>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <button
          onClick={() => { if (onAction) onAction('horn'); }}
          style={btn('#ff6600', 'rgba(255,102,0,0.15)')}
        >{'\u{1F4EF}'}</button>
        <button
          onClick={() => { if (onAction) onAction('door'); }}
          style={btn('#e8b400', 'rgba(232,180,0,0.15)')}
        >{'\u{1F6AA}'} DOORS</button>
      </div>
    </div>
  );
}

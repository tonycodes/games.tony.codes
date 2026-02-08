import { useEffect, useRef, useCallback } from 'react';

const GAME_KEYS = new Set([
  'arrowup', 'arrowdown', 'arrowleft', 'arrowright',
  ' ', 'w', 'a', 's', 'd', 'h',
]);

export function useInput() {
  const keysRef = useRef({});

  useEffect(() => {
    function onDown(e) {
      const k = e.key.toLowerCase();
      if (GAME_KEYS.has(k)) e.preventDefault();
      keysRef.current[k] = true;
    }
    function onUp(e) {
      keysRef.current[e.key.toLowerCase()] = false;
    }
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  const press = useCallback((k) => { keysRef.current[k] = true; }, []);
  const release = useCallback((k) => { keysRef.current[k] = false; }, []);

  return { keysRef, press, release };
}

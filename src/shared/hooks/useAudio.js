import { useRef, useCallback, useEffect } from 'react';
import { useAppStore } from '../stores/appStore';

export function useAudio(createFn) {
  const audioRef = useRef(null);
  const isMuted = useAppStore((s) => s.isMuted);

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) audioRef.current = createFn();
    audioRef.current.init();
  }, [createFn]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.setMute(isMuted);
  }, [isMuted]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.dispose();
        audioRef.current = null;
      }
    };
  }, []);

  return { audioRef, ensureAudio };
}

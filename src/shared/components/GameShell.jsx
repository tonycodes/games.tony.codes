import { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/appStore';
import LoadingScreen from './LoadingScreen';

export default function GameShell({ children }) {
  const navigate = useNavigate();
  const isMuted = useAppStore((s) => s.isMuted);
  const toggleMute = useAppStore((s) => s.toggleMute);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black" style={{ fontFamily: "'Courier New', monospace" }}>
      <button
        onClick={() => navigate('/')}
        className="absolute top-3 left-3 z-50 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm transition-colors cursor-pointer"
      >
        &larr; Back
      </button>
      <button
        onClick={toggleMute}
        className="absolute top-3 right-3 z-50 bg-black/50 hover:bg-black/70 text-gray-300 border border-white/15 rounded-lg px-2.5 py-1.5 cursor-pointer text-base"
      >
        {isMuted ? '\u{1F507}' : '\u{1F50A}'}
      </button>
      <Suspense fallback={<LoadingScreen />}>
        {children}
      </Suspense>
    </div>
  );
}

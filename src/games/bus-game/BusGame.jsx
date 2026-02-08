import { useNavigate } from 'react-router-dom';
import BusGameApp from './BusGame3D';

export default function BusGame() {
  const navigate = useNavigate();

  return (
    <div className="relative w-screen h-screen">
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-50 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm transition-colors cursor-pointer"
      >
        &larr; Back to Games
      </button>
      <BusGameApp />
    </div>
  );
}

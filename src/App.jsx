import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import BusGame from './games/bus-game/BusGame';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/bus-game" element={<BusGame />} />
    </Routes>
  );
}

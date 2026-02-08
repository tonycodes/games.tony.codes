import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import { games } from './games';
import LoadingScreen from './shared/components/LoadingScreen';

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Home />} />
        {games.map((game) => {
          const GameComponent = game.component;
          return (
            <Route
              key={game.slug}
              path={`/${game.slug}`}
              element={<GameComponent />}
            />
          );
        })}
      </Routes>
    </Suspense>
  );
}

import { Link } from 'react-router-dom';
import { games } from '../games';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white">
      {/* Header */}
      <header className="pt-12 pb-8 text-center">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Tony's Games
          </span>
        </h1>
        <p className="mt-3 text-lg text-purple-200/70">Pick a game and have fun!</p>
      </header>

      {/* Game Grid */}
      <main className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Link
              key={game.slug}
              to={`/${game.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-white/25 hover:bg-white/10 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-purple-500/20"
            >
              {/* Emoji thumbnail area */}
              <div
                className={`h-44 bg-gradient-to-br ${game.color} flex items-center justify-center`}
              >
                <span className="text-8xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {game.emoji}
                </span>
              </div>

              {/* Info */}
              <div className="p-5">
                <h2 className="text-xl font-bold text-white group-hover:text-yellow-300 transition-colors">
                  {game.title}
                </h2>
                <p className="mt-1 text-sm text-purple-200/60 leading-relaxed">
                  {game.description}
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors">
                  Play Now
                  <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

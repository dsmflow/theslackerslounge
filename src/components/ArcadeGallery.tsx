import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';

interface Game {
  title: string;
  path: string;
  description: string;
}

const games: Game[] = [
  {
    title: 'Neon Snake',
    path: '/arcade/snake',
    description: 'Classic Snake game with a modern twist. Collect food and grow longer without hitting the walls or yourself!'
  },
  {
    title: 'AI Pong',
    path: '/arcade/ai-pong',
    description: 'A classic game of Pong with an AI opponent. Test your reflexes against the computer!'
  },
  {
    title: 'Tower Defense',
    path: '/arcade/tower-defense/game/build',
    description: 'A strategic tower defense game where you must protect your base from waves of enemies. Place towers wisely and survive as long as you can!'
  }
];

const ArcadeGallery: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-4 mb-4">
            <Gamepad2 size={48} className="text-gold animate-pulse" />
            <h1 className="text-6xl font-display text-gold text-shadow-gold">The Arcade</h1>
          </div>
          <p className="text-xl text-cream text-shadow-cream opacity-90">Step into our retro-futuristic gaming paradise</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game) => (
            <Link
              key={game.path}
              to={game.path}
              className="group relative block bg-dark border-2 border-accent rounded-lg p-6 hover:border-gold transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-gold/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <h2 className="text-3xl font-display text-accent group-hover:text-gold mb-4 text-shadow-accent transition-colors duration-300">{game.title}</h2>
              <p className="text-cream text-shadow-cream opacity-90">{game.description}</p>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-gold text-shadow-gold">Play Now →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArcadeGallery;

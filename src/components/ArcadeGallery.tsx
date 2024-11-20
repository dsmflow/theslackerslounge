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
    title: 'Snake',
    path: '/games/snake',
    description: 'Classic Snake game with a modern twist. Collect food and grow longer without hitting the walls or yourself!'
  },
  {
    title: 'AI Pong',
    path: '/arcade/ai-pong',
    description: 'A classic game of Pong with an AI opponent. Test your reflexes against the computer!'
  }
];

const ArcadeGallery: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-green p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8 space-x-4">
          <Gamepad2 size={32} className="text-gold" />
          <h1 className="text-4xl font-display text-gold">The Arcade</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Link
              key={game.path}
              to={game.path}
              className="block bg-light-green border-2 border-gold rounded-lg p-6 hover:bg-opacity-90 transition-all duration-300"
            >
              <h2 className="text-2xl font-display text-gold mb-2">{game.title}</h2>
              <p className="text-cream">{game.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArcadeGallery;

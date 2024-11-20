import React from 'react';
import { Link } from 'react-router-dom';
import { Home, MessageSquare, Leaf, Gamepad2 } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-light-green border-b border-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-cream hover:text-gold transition-colors duration-300" aria-label="Home">
              <Home size={24} />
            </Link>
            <span className="text-gold font-display text-xl">The Slackers Lounge</span>
          </div>
          <ul className="flex space-x-6">
            <li>
              <Link to="/assistant" className="text-cream hover:text-gold transition-colors duration-300" aria-label="AI Assistant">
                <MessageSquare size={24} />
              </Link>
            </li>
            <li>
              <Link to="/gallery" className="text-cream hover:text-gold transition-colors duration-300" aria-label="The Conservatory">
                <Leaf size={24} />
              </Link>
            </li>
            <li>
              <Link to="/arcade" className="text-cream hover:text-gold transition-colors duration-300" aria-label="The Arcade">
                <Gamepad2 size={24} />
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
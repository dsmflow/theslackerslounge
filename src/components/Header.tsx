import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Leaf } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  return (
    <header className="bg-light-green border-b border-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className={`${isActive('/') ? 'text-gold' : 'text-cream'} hover:text-gold transition-colors duration-300`} 
              aria-label="Home"
            >
              <Home size={24} />
            </Link>
            <span className="text-gold font-display text-xl">The Slackers Lounge</span>
          </div>
          <ul className="flex space-x-6">
            <li>
              <Link 
                to="/assistant" 
                className={`${isActive('/assistant') ? 'text-gold' : 'text-cream'} hover:text-gold transition-colors duration-300`} 
                aria-label="AI Assistant"
              >
                <MessageSquare size={24} />
              </Link>
            </li>
            <li>
              <Link 
                to="/gallery" 
                className={`${isActive('/gallery') ? 'text-gold' : 'text-cream'} hover:text-gold transition-colors duration-300`} 
                aria-label="The Conservatory"
              >
                <Leaf size={24} />
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
import React, { useEffect } from 'react';

const TowerDefense: React.FC = () => {
  useEffect(() => {
    // Set flag to prevent SPA routing inside the iframe
    window.__ARCADE_SECTION__ = true;
  }, []);

  return (
    <div className="w-full min-h-screen bg-dark flex flex-col items-center justify-center">
      <h1 className="text-4xl font-display text-gold text-shadow-gold mb-8">
        <span className="text-accent">&lt;</span>
        tower defense
        <span className="text-accent">/&gt;</span>
      </h1>
      <div className="w-auto h-auto relative">
        <iframe
          src="/arcade/tower-defense/game/build/td.html"
          className="w-[680px] h-[630px] border-2 border-accent rounded-lg shadow-neon"
          title="Tower Defense Game"
          allowFullScreen
        />
      </div>
      <div className="text-center text-sm text-cream/80">
        <p>
          Original game by{' '}
          <a 
            href="http://oldj.net/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-accent hover:text-gold transition-colors"
          >
            oldj.net
          </a>
          {' '}&copy; 2010-2011 |{' '}
          <a 
            href="https://github.com/oldj/html5-tower-defense" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-accent hover:text-gold transition-colors"
          >
            Source Code
          </a>
        </p>
      </div>
    </div>
  );
};

export default TowerDefense;

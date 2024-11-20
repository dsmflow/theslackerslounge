import React, { useEffect } from 'react';

const AIPong: React.FC = () => {
  useEffect(() => {
    const iframe = document.getElementById('pongFrame') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  }, []);

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-7xl mx-auto pt-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Title matching site style */}
          <h1 className="text-3xl md:text-4xl font-display mb-6">
            <span className="text-gold text-shadow-gold">&lt;</span>
            <span className="text-accent text-shadow-accent">ai pong</span>
            <span className="text-gold text-shadow-gold">/&gt;</span>
          </h1>
        </div>

        {/* Game container */}
        <div className="flex justify-center mb-8">
          <div className="bg-dark/90 rounded-lg p-1 border-2 border-gold shadow-gold">
            <iframe
              id="pongFrame"
              src="/arcade/ai-pong/index.html"
              className="w-[800px] h-[600px] bg-black rounded-lg"
              title="AI Pong Game"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-dark/90 rounded-lg p-8 border-2 border-accent shadow-accent max-w-2xl mx-auto">
          <h2 className="text-xl font-display text-accent mb-4 text-shadow-accent">Game Controls</h2>
          <div className="space-y-2">
            <p className="text-cream text-shadow-cream opacity-90">Use your mouse or touch to control the left paddle</p>
            <p className="text-cream text-shadow-cream opacity-90">Challenge the AI-powered opponent on the right</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPong;

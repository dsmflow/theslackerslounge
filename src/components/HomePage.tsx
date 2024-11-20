import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MembershipModal from './MembershipModal';
import Typed from 'typed.js';

const HomePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const typed = new Typed('#typed', {
      strings: ['Pool Queue App', 'Smol AGI', 'AI Integration', 'Retro Games'],
      typeSpeed: 50,
      backSpeed: 50,
      loop: true
    });

    return () => {
      typed.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-dark">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto pt-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="text-6xl md:text-8xl font-display mb-6">
            <span className="text-gold text-shadow-gold">&lt;</span>
            <span className="text-accent text-shadow-accent">the slackers lounge</span>
            <span className="text-gold text-shadow-gold">/&gt;</span>
          </div>
          <div className="text-2xl md:text-4xl text-cream mb-8 font-display text-shadow-cream">
            <span id="typed"></span>
          </div>
          <p className="text-xl mb-8 text-cream text-shadow-cream opacity-90">
            Your AI-powered haven for creativity, coding, and conversation.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="bg-dark/90 rounded-lg p-8 mb-8 max-w-7xl mx-auto border-2 border-gold shadow-gold">
        <h2 className="text-3xl font-display text-accent mb-4 text-shadow-accent">The Establishment</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-lg border-2 border-accent shadow-accent bg-dark/50 hover:border-cream hover:shadow-cream transition-all duration-300 flex flex-col">
            <h3 className="text-xl font-display text-accent mb-2 text-shadow-accent">The Speakeasy</h3>
            <p className="text-cream mb-4 flex-grow text-shadow-cream opacity-90">Engage in witty banter with our AI-powered assistant.</p>
            <div className="flex justify-center">
              <Link to="/assistant" className="inline-block px-4 py-2 rounded-md border-2 border-gold text-gold hover:bg-gold hover:text-dark transition-all duration-300 hover:shadow-gold text-shadow-gold">Enter</Link>
            </div>
          </div>
          <div className="p-4 rounded-lg border-2 border-accent shadow-accent bg-dark/50 hover:border-cream hover:shadow-cream transition-all duration-300 flex flex-col">
            <h3 className="text-xl font-display text-accent mb-2 text-shadow-accent">The Conservatory</h3>
            <p className="text-cream mb-4 flex-grow text-shadow-cream opacity-90">Generate and explore AI-created images in our virtual gallery.</p>
            <div className="flex justify-center">
              <Link to="/gallery" className="inline-block px-4 py-2 rounded-md border-2 border-gold text-gold hover:bg-gold hover:text-dark transition-all duration-300 hover:shadow-gold text-shadow-gold">View</Link>
            </div>
          </div>
          <div className="p-4 rounded-lg border-2 border-accent shadow-accent bg-dark/50 hover:border-cream hover:shadow-cream transition-all duration-300 flex flex-col">
            <h3 className="text-xl font-display text-accent mb-2 text-shadow-accent">The Arcade</h3>
            <p className="text-cream mb-4 flex-grow text-shadow-cream opacity-90">Challenge yourself with our collection of retro-inspired games.</p>
            <div className="flex justify-center">
              <Link to="/arcade" className="inline-block px-4 py-2 rounded-md border-2 border-gold text-gold hover:bg-gold hover:text-dark transition-all duration-300 hover:shadow-gold text-shadow-gold">Enter</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Section */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-dark/90 rounded-lg p-8 border-2 border-gold shadow-gold">
            <h2 className="text-3xl font-display text-accent mb-4 text-shadow-accent">Technical Expertise</h2>
            <div className="space-y-4">
              <div className="border-2 border-gold rounded-lg p-4 hover:shadow-gold transition-all duration-300 bg-dark/50">
                <h3 className="text-xl font-display text-gold mb-2 text-shadow-gold">DevOps Solutions</h3>
                <p className="text-cream text-shadow-cream opacity-90">Building reliable, scalable infrastructure and deployment pipelines with modern cloud technologies.</p>
              </div>
              <div className="border-2 border-gold rounded-lg p-4 hover:shadow-gold transition-all duration-300 bg-dark/50">
                <h3 className="text-xl font-display text-gold mb-2 text-shadow-gold">Pool Queue App</h3>
                <p className="text-cream text-shadow-cream opacity-90 mb-2">A sleek pool queue management system for tracking player rotations and games.</p>
                <a 
                  href="https://x1wvu394thm.v0.build/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-block px-4 py-2 rounded-md border border-gold text-gold hover:bg-gold hover:text-dark transition-all duration-300 hover:shadow-gold text-shadow-gold"
                >
                  View Project
                </a>
              </div>
              <div className="border-2 border-gold rounded-lg p-4 hover:shadow-gold transition-all duration-300 bg-dark/50">
                <h3 className="text-xl font-display text-gold mb-2 text-shadow-gold">AI Integration</h3>
                <p className="text-cream text-shadow-cream opacity-90">Implementing cutting-edge AI solutions for real-world applications and automation.</p>
              </div>
            </div>
          </div>
          <div className="bg-dark/90 rounded-lg p-8 border-2 border-gold shadow-gold">
            <h2 className="text-3xl font-display text-accent mb-4 text-shadow-accent">Projects & Experience</h2>
            <div className="space-y-4">
              <div className="border-2 border-gold rounded-lg p-4 hover:shadow-gold transition-all duration-300 bg-dark/50">
                <h3 className="text-xl font-display text-gold mb-2 text-shadow-gold">
                  <span className="text-gold">&lt;</span>
                  <span className="text-accent">smol AGI</span>
                  <span className="text-gold">/&gt;</span>
                  <span className="text-cream text-base ml-2">build the AI dashboard of your dreams</span>
                </h3>
                <p className="text-cream text-shadow-cream opacity-90 mb-2">
                  A fork of big-AGI (2023-2024) by Enrico Ros. An experimental AI project exploring artificial general intelligence concepts.
                  <span className="block mt-1 text-sm">License: MIT · Made with 💙</span>
                </p>
                <a 
                  href="https://smol-agi.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-block px-4 py-2 rounded-md border border-gold text-gold hover:bg-gold hover:text-dark transition-all duration-300 hover:shadow-gold text-shadow-gold mr-2"
                >
                  View Project
                </a>
                <a 
                  href="https://github.com/enricoros/big-agi" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-block px-4 py-2 rounded-md border border-gold text-gold hover:bg-gold hover:text-dark transition-all duration-300 hover:shadow-gold text-shadow-gold"
                >
                  Original Project
                </a>
              </div>
              <div className="border-2 border-gold rounded-lg p-4 hover:shadow-gold transition-all duration-300 bg-dark/50">
                <h3 className="text-xl font-display text-gold mb-2 text-shadow-gold">Cloud Architecture</h3>
                <p className="text-cream text-shadow-cream opacity-90">Designing and implementing scalable cloud solutions with AWS and Azure.</p>
              </div>
              <div className="border-2 border-gold rounded-lg p-4 hover:shadow-gold transition-all duration-300 bg-dark/50">
                <h3 className="text-xl font-display text-gold mb-2 text-shadow-gold">Full Stack Development</h3>
                <p className="text-cream text-shadow-cream opacity-90">Creating modern web applications with React, Node.js, and cloud infrastructure.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="text-center py-12">
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="px-8 py-4 rounded-md border-2 border-accent text-accent hover:border-cream hover:text-cream transition-all duration-300 text-shadow-accent hover:text-shadow-cream text-xl font-display hover:shadow-cream shadow-accent"
        >
          Members Only
        </button>
      </div>

      <MembershipModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default HomePage;

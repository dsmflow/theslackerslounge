import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import AIAssistant from './components/AIAssistant';
import ConservatoryGallery from './components/ConservatoryGallery';
import SnakeGame from './components/snake-game';
import ArcadeGallery from './components/ArcadeGallery';
import { initializeCache } from './utils/imageCache';
import { initializeModelLoader } from './utils/modelLoader';

// Initialize cache and model loader when app starts
initializeCache();
initializeModelLoader();

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/assistant" element={<AIAssistant />} />
            <Route path="/gallery" element={<ConservatoryGallery />} />
            <Route path="/arcade" element={<ArcadeGallery />} />
            <Route path="/games/snake" element={<SnakeGame />} />
            <Route path="/arcade/ai-pong" element={
              <div className="w-full h-full bg-dark-green">
                <iframe 
                  src="/arcade/ai-pong/index.html" 
                  className="w-full h-screen border-none"
                  title="AI Pong"
                />
              </div>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;

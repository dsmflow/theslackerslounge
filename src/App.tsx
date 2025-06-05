import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import AIAssistant from './components/AIAssistant';
import ConservatoryGallery from './components/ConservatoryGallery';
import TutorialPage from './components/TutorialPage';
import Jukebox from './components/Jukebox';
import { initializeCache } from './utils/imageCache';
import { initializeModelLoader } from './utils/modelLoader';

// Initialize cache and model loader when app starts
initializeCache();
initializeModelLoader();

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-dark text-cream">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/assistant" element={<AIAssistant />} />
            <Route path="/gallery" element={<ConservatoryGallery />} />
            <Route path="/tutorials/:tutorialId" element={<TutorialPage />} />
          </Routes>
        </main>
        <Footer />
        <Jukebox />
      </div>
    </Router>
  );
};

export default App;

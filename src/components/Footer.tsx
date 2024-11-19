import React from 'react';
import { Instagram } from 'lucide-react';

// Custom X (formerly Twitter) logo component
const XLogo: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4l7.2 7.2M20 4L4.8 19.2M10.8 19.2H20" />
  </svg>
);

// Custom YouTube logo component
const YouTubeLogo: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const Footer: React.FC = () => {
  return (
    <footer className="bg-light-green border-t border-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="text-cream">
            <p className="font-display">&copy; 2024 The Slackers Lounge. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <a 
              href="https://x.com/slackerdavid" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream hover:text-gold transition-colors duration-300" 
              aria-label="X (formerly Twitter)"
            >
              <XLogo />
            </a>
            <a 
              href="https://www.instagram.com/theslackerslounge/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream hover:text-gold transition-colors duration-300" 
              aria-label="Instagram"
            >
              <Instagram size={24} />
            </a>
            <a 
              href="https://www.youtube.com/@rybka-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream hover:text-gold transition-colors duration-300" 
              aria-label="YouTube"
            >
              <YouTubeLogo />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
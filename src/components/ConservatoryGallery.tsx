import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Loader2, X } from 'lucide-react';
import { generateImage } from '../utils/ollama';

interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

const ConservatoryGallery: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateImage(prompt);

      if (result.error) {
        throw new Error(result.error);
      }

      const newImage: GeneratedImage = {
        url: result.url,
        prompt,
        timestamp: Date.now(),
      };

      setImages(prev => [newImage, ...prev].slice(0, 9));
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during generation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-row h-screen">
      {images.length > 1 && (
        <div className="w-1/4 p-4 overflow-y-auto bg-dark/20 border-r-2 border-gold/50">
          <h2 className="text-lg font-display text-cream mb-4 text-shadow-cream">History</h2>
          <div className="grid grid-cols-2 gap-2">
            {images.slice(1).map((image) => (
              <div key={image.timestamp} className="relative group aspect-square bg-dark/50 rounded border border-[#33ff77]/50 shadow-[0_0_5px_#33ff77,inset_0_0_5px_#33ff77] overflow-hidden cursor-pointer"
                   onClick={() => setImages(prev => [image, ...prev.filter(img => img.timestamp !== image.timestamp)])}
              >
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-cream text-xs truncate">{image.prompt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto">
        <div className="max-w-5xl mx-auto w-full">
          <h1 className="text-center text-5xl md:text-6xl font-display">
            <span className="neon-text-gold">&lt;</span>
            <span className="neon-text-cream">the conservatory</span>
            <span className="neon-text-gold">/&gt;</span>
          </h1>
        </div>

        <div className="flex-1 max-w-5xl mx-auto w-full">
          <div className="bg-dark/30 rounded-xl border-2 border-gold shadow-[0_0_20px_#d4af37,inset_0_0_20px_#d4af37] p-6 h-full flex flex-col">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to create..."
                rows={3}
                className="flex-1 bg-dark/80 border-2 border-[#33ff77] text-cream text-lg px-4 py-2 rounded-lg focus:border-gold hover:border-gold transition-colors duration-300 placeholder-cream/50 focus:outline-none shadow-[inset_0_0_8px_rgba(51,255,119,0.5)] focus:shadow-[inset_0_0_8px_rgba(212,175,55,0.8)]"
                disabled={isLoading}
              />
              <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className={`px-6 py-2 rounded-lg border-2 font-display text-lg h-full flex items-center justify-center
                  ${isLoading || !prompt.trim()
                    ? 'border-cream/30 text-cream/30 cursor-not-allowed'
                    : 'border-gold text-gold hover:bg-gold/10 text-shadow-gold shadow-[0_0_10px_#d4af37,inset_0_0_10px_#d4af37]'}
                  transition-all duration-300 w-full md:w-auto mt-2 md:mt-0`}
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  'Generate'
                )}
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-300 rounded-lg text-center">
                <X className="inline-block w-4 h-4 mr-2" /> {error}
              </div>
            )}

            <div className="flex-1 bg-dark/50 rounded-lg border-2 border-[#33ff77] shadow-[0_0_10px_#33ff77,inset_0_0_10px_#33ff77] flex items-center justify-center p-4 min-h-[400px]">
              {isLoading && !images[0] ? (
                <div className="text-center">
                  <Loader2 size={48} className="animate-spin mx-auto mb-4 text-cream" />
                  <div className="text-cream text-shadow-cream">Generating your masterpiece...</div>
                </div>
              ) : images[0] ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  {isLoading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-lg">
                      <Loader2 size={36} className="animate-spin text-cream" />
                    </div>
                  )}
                  <img
                    src={images[0].url}
                    alt={images[0].prompt}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="text-center text-cream/70">
                  <ImageIcon size={64} className="mx-auto mb-4 opacity-50" />
                  <p>Your generated image will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConservatoryGallery;

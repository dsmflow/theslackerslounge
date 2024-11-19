import React, { useState } from 'react';
import { Image as ImageIcon, Plus, X, Square, RectangleHorizontal, RectangleVertical, Sparkles, Trees, Camera, Cpu, Maximize, Monitor, Settings } from 'lucide-react';
import { generateImage } from '../utils/openai';

interface GeneratedImage {
  url: string;
  prompt: string;
}

interface ImageSettings {
  size: '1024x1024' | '1792x1024' | '1024x1792';
  quality: 'standard' | 'hd';
  style: 'vivid' | 'natural';
  model: 'dall-e-2' | 'dall-e-3';
}

const AIImageGallery: React.FC = () => {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [progress, setProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<ImageSettings>({
    size: '1024x1024',
    quality: 'hd',
    style: 'vivid',
    model: 'dall-e-3'
  });

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress((prevProgress) => Math.min(prevProgress + 10, 90));
    }, 500);

    try {
      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured');
      }

      const imageUrl = await generateImage(prompt, {
        size: settings.size,
        quality: settings.quality,
        style: settings.style,
        apiKey: import.meta.env.VITE_OPENAI_API_KEY
      });

      if (imageUrl) {
        setImages([{ url: imageUrl, prompt }, ...images]);
        setPrompt('');
        setProgress(100);
      } else {
        setError('Failed to generate image. Please try again.');
      }
    } catch (error) {
      console.error('Detailed error in handleGenerate:', error);
      if (error instanceof Error) {
        setError(`Error: ${error.message}`);
      } else {
        setError('An unexpected error occurred while generating the image.');
      }
    } finally {
      setIsLoading(false);
      clearInterval(progressInterval);
    }
  };

  const truncatePrompt = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength - 3) + '...';
  };

  return (
    <div className="min-h-screen bg-dark py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-display">
            <span className="text-gold text-shadow-gold">&lt;</span>
            <span className="text-accent text-shadow-accent">the conservatory</span>
            <span className="text-gold text-shadow-gold">/&gt;</span>
          </h1>
        </div>

        <div className="bg-dark/90 rounded-lg p-8 border-2 border-gold shadow-gold">
          {/* Image Generation Form */}
          <div className="mb-8">
            <div className="flex space-x-4">
              <div className="flex-grow">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to create..."
                  className="w-full p-4 rounded-lg bg-dark/50 border-2 border-gold text-cream placeholder-cream/50 focus:outline-none focus:border-accent resize-none"
                  rows={2}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                    showSettings
                      ? 'border-accent bg-accent/20 text-accent hover:bg-accent/30'
                      : 'border-gold bg-dark/50 text-gold hover:bg-dark/70'
                  }`}
                >
                  <Settings size={24} />
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !prompt.trim()}
                  className="p-3 rounded-lg border-2 border-gold bg-dark/50 text-gold hover:bg-dark/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ImageIcon size={24} />
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="mt-4 p-4 rounded-lg border-2 border-accent bg-dark/50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-cream mb-2 text-shadow-cream">Size</label>
                    <select
                      value={settings.size}
                      onChange={(e) => setSettings({ ...settings, size: e.target.value as any })}
                      className="w-full p-2 rounded-lg bg-dark/50 border-2 border-gold text-cream focus:outline-none focus:border-accent"
                    >
                      <option value="1024x1024">Square</option>
                      <option value="1792x1024">Landscape</option>
                      <option value="1024x1792">Portrait</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-cream mb-2 text-shadow-cream">Quality</label>
                    <select
                      value={settings.quality}
                      onChange={(e) => setSettings({ ...settings, quality: e.target.value as any })}
                      className="w-full p-2 rounded-lg bg-dark/50 border-2 border-gold text-cream focus:outline-none focus:border-accent"
                    >
                      <option value="standard">Standard</option>
                      <option value="hd">HD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-cream mb-2 text-shadow-cream">Style</label>
                    <select
                      value={settings.style}
                      onChange={(e) => setSettings({ ...settings, style: e.target.value as any })}
                      className="w-full p-2 rounded-lg bg-dark/50 border-2 border-gold text-cream focus:outline-none focus:border-accent"
                    >
                      <option value="vivid">Vivid</option>
                      <option value="natural">Natural</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-cream mb-2 text-shadow-cream">Model</label>
                    <select
                      value={settings.model}
                      onChange={(e) => setSettings({ ...settings, model: e.target.value as any })}
                      className="w-full p-2 rounded-lg bg-dark/50 border-2 border-gold text-cream focus:outline-none focus:border-accent"
                    >
                      <option value="dall-e-3">DALL-E 3</option>
                      <option value="dall-e-2">DALL-E 2</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {isLoading && (
              <div className="mt-4">
                <div className="h-2 bg-dark/30 rounded-full overflow-hidden border border-gold">
                  <div
                    className="h-full bg-gold transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-cream text-center mt-2 text-shadow-cream">Generating masterpiece... {progress}%</p>
              </div>
            )}
          </div>

          {/* Image Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative group cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <div className="aspect-square overflow-hidden rounded-lg border-2 border-gold/30 hover:border-gold transition-all duration-300">
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-dark/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg p-4 flex items-center justify-center">
                  <p className="text-cream text-sm text-shadow-cream text-center">{image.prompt}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Image Modal */}
          {selectedImage && (
            <div className="fixed inset-0 bg-dark/90 flex items-center justify-center z-50 p-4">
              <div className="relative max-w-4xl w-full">
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-12 right-0 text-cream hover:text-gold transition-colors duration-300"
                >
                  <X size={24} />
                </button>
                <img
                  src={selectedImage.url}
                  alt={selectedImage.prompt}
                  className="w-full h-auto rounded-lg border-2 border-gold shadow-gold"
                />
                <p className="mt-4 text-cream text-center text-shadow-cream">{selectedImage.prompt}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 rounded-lg border-2 border-red-500 bg-red-500/20 text-red-500">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIImageGallery;

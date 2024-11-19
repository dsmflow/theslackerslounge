import React, { useState, useEffect } from 'react';
import { Settings, Image as ImageIcon, Loader2, X, Thermometer } from 'lucide-react';
import { MODEL_CONFIGS, type ModelConfig, type ModelParameter } from '../types/modelMatrix';
import { generateImage, checkModelStatus, validateParameters } from '../utils/ollama';
import ModelStatusCard from './ModelStatusCard';

interface GeneratedImage {
  url: string;
  prompt: string;
  model: string;
  parameters: Record<string, any>;
  timestamp: number;
}

const ConservatoryGallery: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>(MODEL_CONFIGS[0].id);
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [modelStatus, setModelStatus] = useState<{ loaded: boolean; error?: string }>({ loaded: false });
  const [parameters, setParameters] = useState<Record<string, any>>(() => {
    const defaultParams: Record<string, any> = {};
    Object.entries(MODEL_CONFIGS[0].parameters).forEach(([key, param]) => {
      defaultParams[key] = param.default;
    });
    return defaultParams;
  });

  // Check model status on component mount
  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkModelStatus(selectedModel);
      setModelStatus(status);
    };
    checkStatus();
  }, [selectedModel]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateImage(selectedModel, prompt, parameters);

      if (result.error) {
        throw new Error(result.error);
      }

      const newImage: GeneratedImage = {
        url: result.url,
        prompt,
        model: selectedModel,
        parameters,
        timestamp: Date.now(),
      };

      setImages(prev => [newImage, ...prev]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleParameterChange = (key: string, value: any) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-row h-screen">
      <div className="flex-1 flex flex-col gap-4 p-4">
        {/* Header */}
        <div className="max-w-7xl mx-auto">
          <h1 className="text-center text-5xl md:text-6xl font-display">
            <span className="neon-text-gold">&lt;</span>
            <span className="neon-text-cream">the conservatory</span>
            <span className="neon-text-gold">/&gt;</span>
          </h1>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-7xl mx-auto w-full">
          {/* Main Container with Gold Border */}
          <div className="bg-dark/30 rounded-xl border-2 border-gold shadow-[0_0_20px_#d4af37,inset_0_0_20px_#d4af37] p-6 h-full flex flex-col">
            {/* Grid Layout */}
            <div className="grid grid-cols-4 gap-4 flex-1">
              {/* Large Preview Panel (3 columns) */}
              <div className="col-span-3 bg-dark/50 rounded-lg border-2 border-[#33ff77] shadow-[0_0_10px_#33ff77,inset_0_0_10px_#33ff77] flex flex-col">
                <div className="flex-1 flex items-center justify-center p-4">
                  {isLoading ? (
                    <div className="text-center">
                      <Loader2 size={48} className="animate-spin mx-auto mb-4 text-cream" />
                      <div className="text-cream text-shadow-cream">Generating your masterpiece...</div>
                      {error && (
                        <div className="mt-4 text-sm text-red-400">
                          {error}
                        </div>
                      )}
                    </div>
                  ) : images[0] ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src={images[0].url}
                        alt={images[0].prompt}
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="text-center">
                      <ImageIcon size={48} className="mx-auto mb-4 text-cream/50" />
                      <div className="text-cream text-shadow-cream">Your creation will appear here</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side Controls (1 column) */}
              <div className="col-span-1 flex flex-col gap-4">
                {/* Model Selection */}
                <div className="bg-dark/50 rounded-lg border-2 border-[#33ff77] shadow-[0_0_10px_#33ff77,inset_0_0_10px_#33ff77] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-display text-gold text-shadow-gold">Model</h2>
                    <div className="flex items-center gap-2">
                      <Thermometer 
                        size={14} 
                        className={modelStatus.loaded ? 'text-green-400' : 'text-yellow-400 animate-pulse'}
                      />
                      <span className={modelStatus.loaded ? 'text-green-400' : 'text-yellow-400'}>
                        {modelStatus.loaded ? 'Ready' : 'Loading...'}
                      </span>
                    </div>
                  </div>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-dark/80 border-2 border-[#33ff77] text-cream text-sm px-2 py-1 rounded-lg focus:border-gold hover:border-gold transition-colors duration-300"
                  >
                    {MODEL_CONFIGS.map(model => (
                      <option key={model.id} value={model.id}>{model.name}</option>
                    ))}
                  </select>
                </div>

                {/* Prompt Input */}
                <div className="bg-dark/50 rounded-lg border-2 border-[#33ff77] shadow-[0_0_10px_#33ff77,inset_0_0_10px_#33ff77] p-4">
                  <h2 className="text-lg font-display text-gold text-shadow-gold mb-3">Prompt</h2>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your masterpiece..."
                    className="w-full bg-dark/80 border-2 border-[#33ff77] text-cream p-4 rounded-lg focus:border-gold hover:border-gold transition-colors duration-300 resize-none h-32"
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={isLoading || !modelStatus.loaded}
                    className={`w-full mt-4 px-6 py-2 rounded-lg border-2 font-display text-lg
                      ${isLoading || !modelStatus.loaded
                        ? 'border-cream/30 text-cream/30 cursor-not-allowed'
                        : 'border-gold text-gold hover:bg-gold/10 text-shadow-gold shadow-[0_0_10px_#d4af37,inset_0_0_10px_#d4af37]'
                      }
                      transition-all duration-300`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    ) : (
                      'Generate'
                    )}
                  </button>
                </div>

                {/* Advanced Settings */}
                <div className="flex-1 bg-dark/50 rounded-lg border-2 border-[#33ff77] shadow-[0_0_10px_#33ff77,inset_0_0_10px_#33ff77] p-4 flex flex-col">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="w-full flex items-center justify-between px-4 py-2 rounded-lg border-2 border-gold text-gold hover:bg-gold/10 text-shadow-gold shadow-[0_0_10px_#d4af37,inset_0_0_10px_#d4af37] text-lg font-display"
                  >
                    <span>Advanced Settings</span>
                    <Settings size={18} className="text-gold" />
                  </button>
                  {showSettings && (
                    <div className="mt-4 space-y-4">
                      {Object.entries(MODEL_CONFIGS[0].parameters).map(([key, param]) => (
                        <div key={key}>
                          <label className="block text-sm text-cream text-shadow-cream mb-2">
                            {param.label}
                          </label>
                          {param.type === 'number' ? (
                            <input
                              type="number"
                              value={parameters[key]}
                              onChange={(e) => handleParameterChange(key, Number(e.target.value))}
                              min={param.min}
                              max={param.max}
                              step={param.step || 1}
                              className="w-full bg-dark/80 border-2 border-[#33ff77] text-cream text-sm px-2 py-1 rounded-lg focus:border-gold hover:border-gold transition-colors duration-300"
                            />
                          ) : (
                            <input
                              type="text"
                              value={parameters[key]}
                              onChange={(e) => handleParameterChange(key, e.target.value)}
                              className="w-full bg-dark/80 border-2 border-[#33ff77] text-cream text-sm px-2 py-1 rounded-lg focus:border-gold hover:border-gold transition-colors duration-300"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Generated Images Grid */}
            {images.length > 1 && (
              <div className="mt-6 grid grid-cols-4 gap-4">
                {images.slice(1).map((image) => (
                  <div key={image.timestamp} className="bg-dark/50 rounded-lg border-2 border-[#33ff77] shadow-[0_0_10px_#33ff77,inset_0_0_10px_#33ff77] overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3">
                      <p className="text-cream text-sm truncate">{image.prompt}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConservatoryGallery;

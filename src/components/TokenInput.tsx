import React, { useState } from 'react';
import { Eye, EyeOff, Info } from 'lucide-react';

interface TokenInputProps {
  onTokenChange: (token: string) => void;
  label?: string;
  placeholder?: string;
}

const TokenInput: React.FC<TokenInputProps> = ({
  onTokenChange,
  label = "Hugging Face User Access Token",
  placeholder = "Enter your User Access Token..."
}) => {
  const [localToken, setLocalToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleTokenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newToken = event.target.value;
    setLocalToken(newToken);
  };

  const handleTokenSubmit = () => {
    if (!localToken.trim()) return;
    onTokenChange(localToken.trim());
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData('text').trim();
    if (!pastedText) return;
    setLocalToken(pastedText);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleTokenSubmit();
    }
  };

  const toggleShowToken = () => setShowToken(!showToken);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm text-cream text-shadow-cream">
          {label}
          <button
            type="button"
            className="ml-2 text-cream/70 hover:text-cream transition-colors duration-200"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <Info size={14} />
          </button>
        </label>
        <a
          href="https://huggingface.co/settings/tokens"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gold hover:text-gold/80 transition-colors"
        >
          Get your token
        </a>
      </div>
      {showTooltip && (
        <div className="absolute left-0 right-0 -top-1 -translate-y-full opacity-100 transition-opacity duration-200 z-50">
          <div className="bg-dark/90 text-xs text-cream/70 p-3 rounded-lg border border-[#33ff77] shadow-lg space-y-2">
            <p>
              You need a <span className="text-[#33ff77]">User Access Token</span> (not a fine-grained token) 
              to use the Inference API.
            </p>
            <p>
              1. Go to{' '}
              <a
                href="https://huggingface.co/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#33ff77] hover:text-[#33ff77]/80 transition-colors duration-200"
              >
                huggingface.co/settings/tokens
              </a>
            </p>
            <p>
              2. Click "New token"
            </p>
            <p>
              3. Give it a name and select "read" access
            </p>
            <p>
              4. Copy and paste the token here
            </p>
            <p className="text-cream/50 italic">
              Your token is stored securely in memory and will be cleared when you close the tab.
            </p>
          </div>
        </div>
      )}
      <div className="relative">
        <input
          type="text"
          value={localToken}
          onChange={handleTokenChange}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-2 bg-dark/50 border border-gold/50 rounded-lg focus:outline-none focus:border-gold text-gold placeholder-gold/50"
        />
      </div>
      <button
        onClick={handleTokenSubmit}
        className="w-full mt-4 px-6 py-2 bg-gold/20 hover:bg-gold/30 text-gold border border-gold rounded-lg transition-colors"
      >
        Submit Token
      </button>
    </div>
  );
};

export default TokenInput;

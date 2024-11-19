import React from 'react';
import { Loader2 } from 'lucide-react';
import type { ModelLoadStatus } from '../utils/modelLoader';
import type { ModelConfig } from '../types/modelMatrix';

interface ModelStatusCardProps {
  model: ModelConfig;
  status: ModelLoadStatus;
}

const ModelStatusCard: React.FC<ModelStatusCardProps> = ({ model, status }) => {
  const getStatusDisplay = () => {
    if (status.error) {
      return (
        <div className="text-red-500">
          {status.error}
        </div>
      );
    }

    if (status.loaded) {
      return (
        <div className="text-green-500">
          Ready
        </div>
      );
    }

    if (status.loading) {
      const timeLeft = status.estimatedTime ? Math.ceil(status.estimatedTime) : null;
      return (
        <div className="flex items-center space-x-2 text-yellow-500">
          <Loader2 className="animate-spin" size={16} />
          <span>
            {timeLeft ? `Warming up (${timeLeft}s)` : 'Loading...'}
          </span>
        </div>
      );
    }

    return (
      <div className="text-gray-500">
        Unavailable
      </div>
    );
  };

  return (
    <div className="bg-dark/80 border border-[#33ff77] rounded-lg p-4 space-y-2">
      <h3 className="text-lg font-semibold text-cream">{model.name}</h3>
      <p className="text-sm text-cream/70">{model.description}</p>
      <div className="mt-2">
        {getStatusDisplay()}
      </div>
    </div>
  );
};

export default ModelStatusCard;

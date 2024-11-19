export interface ModelParameter {
  label: string;
  type: 'select' | 'number' | 'boolean' | 'string';
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  default: any;
  description: string;
  advanced?: boolean;
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: 'ollama';
  endpoint: string;
  description: string;
  parameters: {
    [key: string]: ModelParameter;
  };
  maxBatchSize?: number;
  requiresAuth: boolean;
  maxImageSize?: number;
}

export const MODEL_CONFIGS: ModelConfig[] = [
  {
    id: 'stable-diffusion',
    name: 'Stable Diffusion',
    provider: 'ollama',
    endpoint: 'http://localhost:11434',
    description: 'Local Stable Diffusion model for high-quality image generation',
    requiresAuth: false,
    parameters: {
      negative_prompt: {
        label: 'Negative Prompt',
        type: 'string',
        default: 'blurry, bad quality, distorted',
        description: 'What to avoid in the generated image'
      },
      num_inference_steps: {
        label: 'Steps',
        type: 'number',
        default: 20,
        min: 1,
        max: 50,
        description: 'Number of denoising steps'
      },
      guidance_scale: {
        label: 'Guidance Scale',
        type: 'number',
        default: 7.5,
        min: 1,
        max: 20,
        step: 0.1,
        description: 'How closely to follow the prompt'
      }
    }
  }
];

// Helper function to get a model's configuration
export function getModelConfig(modelId: string): ModelConfig | undefined {
  return MODEL_CONFIGS.find(config => config.id === modelId);
}

// Helper function to validate parameters for a given model
export function validateModelParameters(
  modelId: string,
  params: Record<string, any>
): { isValid: boolean; errors: string[] } {
  const config = getModelConfig(modelId);
  if (!config) {
    return { isValid: false, errors: ['Invalid model ID'] };
  }

  const errors: string[] = [];

  // Validate each parameter
  Object.entries(params).forEach(([key, value]) => {
    const paramConfig = config.parameters[key];
    if (!paramConfig) {
      return; // Skip unknown parameters
    }

    if (paramConfig.type === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        errors.push(`${paramConfig.label} must be a number`);
      } else {
        if (typeof paramConfig.min === 'number' && numValue < paramConfig.min) {
          errors.push(`${paramConfig.label} must be at least ${paramConfig.min}`);
        }
        if (typeof paramConfig.max === 'number' && numValue > paramConfig.max) {
          errors.push(`${paramConfig.label} must be at most ${paramConfig.max}`);
        }
      }
    }
  });

  return { isValid: errors.length === 0, errors };
}

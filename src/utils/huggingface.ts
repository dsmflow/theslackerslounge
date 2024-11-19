import { MODEL_CONFIGS } from '../types/modelMatrix';
import { getCachedImage, cacheImage } from './imageCache';
import { requestQueue, type QueuedRequest } from './requestQueue';

const HUGGINGFACE_TOKEN = import.meta.env.VITE_HUGGINGFACE_TOKEN;
const RETRY_DELAY = 30000; // 30 seconds
const RATE_LIMIT_DELAY = 120000; // 2 minutes
const MAX_LOAD_TIME = 600000; // 10 minutes

// Load last request time from localStorage
let lastRequestTime = parseInt(localStorage.getItem('lastRequestTime') || '0');
let currentRequest: RequestStatus | null = null;

// Track model loading states with timeouts
const modelLoadingStates: Record<string, {
  initialEstimatedTime: number;
  loadStartTime: number;
  timeoutId?: NodeJS.Timeout;
}> = {};

interface GenerationResponse {
  url: string;
  error?: string;
}

export interface ModelStatus {
  loaded: boolean;
  estimatedTime?: number;
  initialEstimatedTime?: number;
  loadStartTime?: number;
  progress?: number;
}

export interface RequestStatus {
  id: string;
  timestamp: number;
  remainingCooldown: number;
  abortController: AbortController;
}

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getCurrentRequest(): RequestStatus | null {
  if (currentRequest) {
    // Update remaining cooldown
    const now = Date.now();
    const elapsed = now - currentRequest.timestamp;
    currentRequest.remainingCooldown = Math.max(0, RATE_LIMIT_DELAY - elapsed);
  }
  return currentRequest;
}

export function cancelCurrentRequest(): void {
  if (currentRequest) {
    currentRequest.abortController.abort();
    currentRequest = null;
  }
}

export function getRemainingCooldown(): number {
  if (currentRequest) {
    const now = Date.now();
    const elapsed = now - currentRequest.timestamp;
    return Math.max(0, RATE_LIMIT_DELAY - elapsed);
  }
  return 0;
}

export async function checkModelStatus(modelId: string, token: string): Promise<ModelStatus> {
  try {
    console.debug(`Checking status for model ${modelId}`);
    const response = await fetch(`https://api-inference.huggingface.co/status/${modelId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error(`Error checking model status: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to check model status: ${response.status}`);
    }

    const data = await response.json();
    console.debug(`Status response for ${modelId}:`, data);

    // If the model is loaded, clear any loading state
    if (data.loaded) {
      if (modelLoadingStates[modelId]) {
        if (modelLoadingStates[modelId].timeoutId) {
          clearTimeout(modelLoadingStates[modelId].timeoutId);
        }
        delete modelLoadingStates[modelId];
      }
      return { loaded: true };
    }

    // Handle loading state
    if (data.estimated_time) {
      if (!modelLoadingStates[modelId]) {
        // Initialize loading state
        modelLoadingStates[modelId] = {
          initialEstimatedTime: data.estimated_time,
          loadStartTime: Date.now()
        };
      }

      const elapsed = Date.now() - modelLoadingStates[modelId].loadStartTime;
      const progress = Math.min(100, (elapsed / (modelLoadingStates[modelId].initialEstimatedTime * 1000)) * 100);

      return {
        loaded: false,
        estimatedTime: data.estimated_time,
        initialEstimatedTime: modelLoadingStates[modelId].initialEstimatedTime,
        loadStartTime: modelLoadingStates[modelId].loadStartTime,
        progress: progress
      };
    }

    return { loaded: false };
  } catch (error) {
    console.error('Error checking model status:', error);
    return { loaded: false };
  }
}

export async function processQueuedRequest(request: QueuedRequest): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await generateImage(
      request.modelId,
      request.prompt,
      request.parameters,
      HUGGINGFACE_TOKEN,
      (progress) => requestQueue.updateProgress(request.id, progress)
    );
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function generateImage(
  modelId: string,
  prompt: string,
  parameters: Record<string, any>,
  token: string,
  onProgress?: (progress: number) => void
): Promise<GenerationResponse> {
  if (modelId === 'FLUX-1-schnell') {
    return await generateImageFlux1Schnell(prompt, modelId, parameters, token);
  }

  const modelConfig = MODEL_CONFIGS[modelId];
  if (!modelConfig) {
    throw new Error(`Invalid model ID: ${modelId}`);
  }

  // Prepare request payload according to API spec
  const requestPayload = {
    inputs: prompt,
    parameters: {
      // Core parameters
      guidance_scale: parameters.guidance_scale || 7.5,
      negative_prompt: parameters.negative_prompt || undefined,
      num_inference_steps: parameters.num_inference_steps || 50,
      target_size: {
        width: parameters.width || 512,
        height: parameters.height || 512
      },
      scheduler: parameters.scheduler,
      seed: parameters.seed
    }
  };

  // Remove undefined values
  Object.keys(requestPayload.parameters).forEach(key => {
    if (requestPayload.parameters[key] === undefined) {
      delete requestPayload.parameters[key];
    }
  });

  const errors = validateParameters(modelId, requestPayload.parameters);
  if (errors.length > 0) {
    throw new Error(`Invalid parameters: ${errors.join(', ')}`);
  }

  let retryWithWait = false;
  let maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      console.debug(`Generating image with model ${modelId} (attempt ${retryCount + 1})`);
      console.debug('Request payload:', requestPayload);

      const response = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-use-cache': parameters.use_cache === false ? 'false' : 'true',
          ...(retryWithWait ? { 'x-wait-for-model': 'true' } : {})
        },
        body: JSON.stringify(requestPayload)
      });

      // Handle different response statuses
      if (response.status === 503) {
        console.debug('Model is loading, will retry with wait-for-model header');
        retryWithWait = true;
        retryCount++;
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error generating image: ${response.status} ${response.statusText}`);
        console.error('Error details:', errorText);
        
        if (response.status === 401 || response.status === 403) {
          throw new Error('Invalid User Access Token');
        }
        
        throw new Error(`Failed to generate image: ${errorText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      return { url };
    } catch (error) {
      console.error('Error generating image:', error);
      if (retryCount >= maxRetries - 1) {
        return { 
          url: '', 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        };
      }
      retryCount++;
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
    }
  }

  return {
    url: '',
    error: 'Maximum retries exceeded'
  };
}

async function generateImageFlux1Schnell(
  prompt: string,
  modelId: string,
  parameters: Record<string, any>,
  token: string
): Promise<GenerationResponse> {
  if (!token) {
    throw new Error('No API token provided');
  }

  const modelConfig = MODEL_CONFIGS.find(m => m.id === modelId);
  if (!modelConfig) {
    throw new Error('Invalid model configuration');
  }

  const requestData = {
    inputs: prompt,
    parameters: parameters || {}
  };

  const response = await fetch(
    'https://fmxehosepcvk8zh5.us-east-1.aws.endpoints.huggingface.cloud',
    {
      method: 'POST',
      headers: {
        'Accept': 'image/png',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    }
  );

  if (!response.ok) {
    let errorMessage = `Failed to generate image (${response.status})`;
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (e) {
      // If we can't parse the error, use the default message
    }
    throw new Error(errorMessage);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  return { url };
}

export async function checkModelStatusFlux1Schnell(modelId: string, token: string): Promise<ModelStatus> {
  if (!token) {
    throw new Error('No API token provided');
  }

  const modelConfig = MODEL_CONFIGS.find(m => m.id === modelId);
  if (!modelConfig) {
    throw new Error('Invalid model configuration');
  }

  try {
    const response = await fetch(
      'https://fmxehosepcvk8zh5.us-east-1.aws.endpoints.huggingface.cloud',
      {
        method: 'POST',
        headers: {
          'Accept': 'image/png',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: 'test',
          parameters: {}
        })
      }
    );

    // If we get a 200, the model is ready
    if (response.ok) {
      return {
        loaded: true,
        estimatedTime: undefined,
        initialEstimatedTime: undefined,
        loadStartTime: undefined,
        progress: undefined
      };
    }

    // If we get a 503, the model is still loading
    if (response.status === 503) {
      let estimatedTime = 60;
      try {
        const data = await response.json();
        if (data.estimated_time) {
          estimatedTime = data.estimated_time;
        }
      } catch (e) {
        console.warn('Could not parse estimated time from 503 response');
      }

      return {
        loaded: false,
        estimatedTime,
        initialEstimatedTime: estimatedTime,
        loadStartTime: Date.now(),
        progress: 0
      };
    }

    // Any other response is an error
    let errorMessage = `Failed to check model status (${response.status})`;
    try {
      const data = await response.json();
      if (data.error) {
        errorMessage = data.error;
      }
    } catch (e) {
      // If we can't parse the error, use the default message
    }

    return {
      loaded: false,
      estimatedTime: undefined,
      initialEstimatedTime: undefined,
      loadStartTime: undefined,
      progress: undefined,
      error: errorMessage
    };
  } catch (error) {
    return {
      loaded: false,
      estimatedTime: undefined,
      initialEstimatedTime: undefined,
      loadStartTime: undefined,
      progress: undefined,
      error: error instanceof Error ? error.message : 'Failed to check model status'
    };
  }
}

// Helper function to parse dimensions string (e.g., "1024x1024" -> { width: 1024, height: 1024 })
function parseDimensions(dimensions: string): { width: number; height: number } {
  const [width, height] = dimensions.split('x').map(Number);
  return { width, height };
}

// Helper function to validate parameters
export function validateParameters(modelId: string, parameters: Record<string, any>): string[] {
  const errors: string[] = [];
  const modelConfig = MODEL_CONFIGS[modelId];

  if (!modelConfig) {
    errors.push(`Invalid model ID: ${modelId}`);
    return errors;
  }

  // Validate dimensions
  if (parameters.target_size) {
    if (parameters.target_size.width < 128 || parameters.target_size.width > 1024) {
      errors.push('Width must be between 128 and 1024 pixels');
    }
    if (parameters.target_size.height < 128 || parameters.target_size.height > 1024) {
      errors.push('Height must be between 128 and 1024 pixels');
    }
  }

  // Validate inference steps
  if (parameters.num_inference_steps && (parameters.num_inference_steps < 1 || parameters.num_inference_steps > 100)) {
    errors.push('Number of inference steps must be between 1 and 100');
  }

  // Validate guidance scale
  if (parameters.guidance_scale && (parameters.guidance_scale < 1 || parameters.guidance_scale > 20)) {
    errors.push('Guidance scale must be between 1 and 20');
  }

  // Validate seed
  if (parameters.seed && !Number.isInteger(parameters.seed)) {
    errors.push('Seed must be an integer');
  }

  // Validate scheduler
  const validSchedulers = ['DDIM', 'DPMSolverMultistep', 'HeunDiscrete', 'KarrasDPM', 'K_EULER_ANCESTRAL', 'K_EULER', 'PNDM'];
  if (parameters.scheduler && !validSchedulers.includes(parameters.scheduler)) {
    errors.push(`Invalid scheduler. Must be one of: ${validSchedulers.join(', ')}`);
  }

  // Validate boolean parameters
  ['use_cache'].forEach(param => {
    if (param in parameters && typeof parameters[param] !== 'boolean') {
      errors.push(`${param} must be a boolean value`);
    }
  });

  return errors;
}

// Helper function to clean up object URLs when they're no longer needed
export function releaseImageUrl(url: string) {
  URL.revokeObjectURL(url);
}

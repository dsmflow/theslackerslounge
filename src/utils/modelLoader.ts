import { MODEL_CONFIGS } from '../types/modelMatrix';

const HUGGINGFACE_TOKEN = import.meta.env.VITE_HUGGINGFACE_TOKEN;
const MODEL_STATUS_KEY = 'model-load-status';
const MODEL_WARMUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

export interface ModelLoadStatus {
  loaded: boolean;
  loading: boolean;
  lastCheck: number;
  estimatedTime?: number;
  loadStartTime?: number;
  error?: string;
}

interface ModelStatusMap {
  [modelId: string]: ModelLoadStatus;
}

// In-memory cache of model status
let modelStatusCache: ModelStatusMap = {};

// Load status from localStorage
const loadStoredStatus = (): void => {
  try {
    const stored = localStorage.getItem(MODEL_STATUS_KEY);
    if (stored) {
      modelStatusCache = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load model status:', error);
  }
};

// Save status to localStorage
const saveStatus = (): void => {
  try {
    localStorage.setItem(MODEL_STATUS_KEY, JSON.stringify(modelStatusCache));
  } catch (error) {
    console.error('Failed to save model status:', error);
  }
};

// Check if a model needs status update
const needsUpdate = (status: ModelLoadStatus | undefined): boolean => {
  if (!status) return true;
  const now = Date.now();
  return now - (status.lastCheck || 0) > MODEL_WARMUP_INTERVAL;
};

// Check status of a specific model
export async function checkModelStatus(modelId: string, token: string): Promise<ModelLoadStatus> {
  try {
    if (!token) {
      return {
        loaded: false,
        loading: false,
        error: 'No User Access Token provided',
        lastCheck: Date.now()
      };
    }

    const modelConfig = MODEL_CONFIGS.find(m => m.id === modelId);
    if (!modelConfig) {
      return {
        loaded: false,
        loading: false,
        error: 'Model configuration not found',
        lastCheck: Date.now()
      };
    }

    // Use the official Inference API status endpoint
    const response = await fetch(`https://api-inference.huggingface.co/status/${modelConfig.endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401 || response.status === 403) {
      return {
        loaded: false,
        loading: false,
        error: 'Invalid User Access Token',
        lastCheck: Date.now()
      };
    }

    const data = await response.json();

    // According to API docs:
    // - 200: model is ready
    // - 503: model is loading with estimated_time
    if (response.status === 503) {
      return {
        loaded: false,
        loading: true,
        error: null,
        estimatedTime: data.estimated_time,
        lastCheck: Date.now()
      };
    }

    if (!response.ok) {
      console.error(`Error checking model status: ${response.status}`, data);
      return {
        loaded: false,
        loading: false,
        error: data.error || `Model unavailable (${response.status})`,
        lastCheck: Date.now()
      };
    }

    // If we get a 200, the model is loaded and ready
    return {
      loaded: true,
      loading: false,
      error: null,
      lastCheck: Date.now()
    };

  } catch (error) {
    console.error('Error checking model status:', error);
    return {
      loaded: false,
      loading: false,
      error: 'Failed to check model status',
      lastCheck: Date.now()
    };
  }
}

// Initialize the model by sending a minimal request
export async function warmupModel(modelId: string, token: string): Promise<ModelLoadStatus> {
  if (!token) {
    return {
      loaded: false,
      loading: false,
      lastCheck: Date.now(),
      error: 'No token provided'
    };
  }

  const modelConfig = MODEL_CONFIGS.find(m => m.id === modelId);
  if (!modelConfig) {
    return {
      loaded: false,
      loading: false,
      lastCheck: Date.now(),
      error: 'Invalid model configuration'
    };
  }

  try {
    // Set initial loading state
    const initialStatus = {
      loaded: false,
      loading: true,
      lastCheck: Date.now(),
      loadStartTime: Date.now(),
      estimatedTime: 60,
      error: null
    };
    modelStatusCache[modelId] = initialStatus;
    saveStatus();

    const response = await fetch(`https://api-inference.huggingface.co/models/${modelConfig.endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        inputs: "test",
        options: { 
          wait_for_model: false,
          use_cache: false
        }
      })
    });

    // If we get a 503, the model is still loading
    if (response.status === 503) {
      let estimatedTime = 60; // default to 60 seconds if we can't parse
      try {
        const data = await response.json();
        if (data.estimated_time) {
          estimatedTime = data.estimated_time;
        }
      } catch (e) {
        console.warn('Could not parse estimated time from 503 response');
      }

      const loadingStatus = {
        loaded: false,
        loading: true,
        lastCheck: Date.now(),
        loadStartTime: Date.now(),
        estimatedTime,
        error: null
      };
      modelStatusCache[modelId] = loadingStatus;
      saveStatus();
      return loadingStatus;
    }

    // If we get a 200 with binary data, the model is ready!
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('image/') || contentType?.includes('application/octet-stream')) {
        const readyStatus = {
          loaded: true,
          loading: false,
          lastCheck: Date.now(),
          error: null
        };
        modelStatusCache[modelId] = readyStatus;
        saveStatus();
        return readyStatus;
      }
    }

    // Any other response is an error
    let errorMessage = `Failed to warm up model (${response.status})`;
    try {
      const data = await response.json();
      if (data.error) {
        errorMessage = data.error;
      }
    } catch (e) {
      // If we can't parse the error, just use the default message
    }

    const errorStatus = {
      loaded: false,
      loading: false,
      lastCheck: Date.now(),
      error: errorMessage
    };
    modelStatusCache[modelId] = errorStatus;
    saveStatus();
    return errorStatus;

  } catch (error) {
    console.error('Error warming up model:', error);
    const errorStatus = {
      loaded: false,
      loading: false,
      lastCheck: Date.now(),
      error: error instanceof Error ? error.message : 'Failed to warm up model'
    };
    modelStatusCache[modelId] = errorStatus;
    saveStatus();
    return errorStatus;
  }
}

// Get cached status for a model
export const getCachedStatus = (modelId: string): ModelLoadStatus | undefined => {
  return modelStatusCache[modelId];
};

// Initialize model loading system
export const initializeModelLoader = async (): Promise<void> => {
  loadStoredStatus();

  // Check and warm up all models
  for (const model of MODEL_CONFIGS) {
    const status = getCachedStatus(model.id);
    if (needsUpdate(status)) {
      const currentStatus = await checkModelStatus(model.id, HUGGINGFACE_TOKEN);
      if (!currentStatus.loaded) {
        await warmupModel(model.id, HUGGINGFACE_TOKEN);
      }
    }
  }

  // Set up periodic checks
  setInterval(() => {
    MODEL_CONFIGS.forEach(model => {
      const status = getCachedStatus(model.id);
      if (needsUpdate(status)) {
        checkModelStatus(model.id, HUGGINGFACE_TOKEN);
      }
    });
  }, MODEL_WARMUP_INTERVAL);
};

// Get loading progress for a model
export const getLoadingProgress = (status: ModelLoadStatus): number => {
  if (status.loaded) return 100;
  if (!status.loadStartTime || !status.estimatedTime) return 0;

  const elapsed = Date.now() - status.loadStartTime;
  const progress = (elapsed / (status.estimatedTime * 1000)) * 100;
  return Math.min(Math.max(progress, 0), 99); // Cap between 0 and 99
};

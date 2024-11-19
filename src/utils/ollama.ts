import { getCachedImage, cacheImage } from './imageCache';

const OLLAMA_HOST = 'http://localhost:11434'; // Default Ollama port

export interface GenerationResponse {
  url: string;
  error?: string;
}

export interface ModelStatus {
  loaded: boolean;
  error?: string;
}

export async function generateImage(
  modelId: string,
  prompt: string,
  parameters: Record<string, any>,
  onProgress?: (progress: number) => void
): Promise<GenerationResponse> {
  try {
    // Check cache first
    const cacheKey = `${modelId}:${prompt}:${JSON.stringify(parameters)}`;
    const cachedImage = await getCachedImage(cacheKey);
    if (cachedImage) {
      return { url: cachedImage };
    }

    // Call Ollama API
    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelId,
        prompt: prompt,
        stream: false,
        options: {
          num_predict: parameters.num_inference_steps || 50,
          temperature: parameters.guidance_scale || 7.5,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Convert base64 image to blob URL
    const imageBlob = await fetch(`data:image/png;base64,${data.image}`).then(r => r.blob());
    const url = URL.createObjectURL(imageBlob);

    // Cache the result
    await cacheImage(cacheKey, url);

    return { url };
  } catch (error) {
    console.error('Error generating image:', error);
    return { url: '', error: error.message };
  }
}

export async function checkModelStatus(modelId: string): Promise<ModelStatus> {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/show`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: modelId,
      }),
    });

    if (!response.ok) {
      return { loaded: false, error: `Failed to check model status: ${response.statusText}` };
    }

    const data = await response.json();
    return { loaded: true };
  } catch (error) {
    return { loaded: false, error: error.message };
  }
}

export function validateParameters(modelId: string, parameters: Record<string, any>): string[] {
  const errors: string[] = [];
  
  if (parameters.num_inference_steps && (parameters.num_inference_steps < 1 || parameters.num_inference_steps > 100)) {
    errors.push('Number of inference steps must be between 1 and 100');
  }
  
  if (parameters.guidance_scale && (parameters.guidance_scale < 1 || parameters.guidance_scale > 20)) {
    errors.push('Guidance scale must be between 1 and 20');
  }
  
  return errors;
}

// Helper function to clean up object URLs when they're no longer needed
export function releaseImageUrl(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

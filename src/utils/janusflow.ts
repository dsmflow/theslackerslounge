interface GenerateImageResult {
  image: string;
  caption?: string;
}

export class JanusFlowClient {
  private async makeRequest<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error making request:', error);
      throw error;
    }
  }

  async generate_image(
    prompt: string,
    seed: number = 12345,
    guidance: number = 2.0,
    num_inference_steps: number = 30
  ): Promise<GenerateImageResult[]> {
    return this.makeRequest<GenerateImageResult[]>('/generate_image', {
      prompt,
      seed,
      guidance,
      num_inference_steps,
    });
  }

  async multimodal_understanding(
    image: string,
    question: string,
    seed: number = 42,
    top_p: number = 0.95,
    temperature: number = 0.1
  ): Promise<string> {
    return this.makeRequest<string>('/multimodal_understanding', {
      image,
      question,
      seed,
      top_p,
      temperature,
    });
  }
}

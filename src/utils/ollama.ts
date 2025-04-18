import OpenAI from 'openai';

// Ensure the API key is available
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  console.error('VITE_OPENAI_API_KEY is not set in the environment variables.');
  // You might want to throw an error or handle this case appropriately
}

const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // !! IMPORTANT !! Only use this for testing/local dev
});

export interface GenerationResponse {
  url: string;
  error?: string;
}

export async function generateImage(
  prompt: string,
): Promise<GenerationResponse> {
  if (!apiKey) {
    return { url: '', error: 'OpenAI API Key not configured.' };
  }
  if (!prompt.trim()) {
    return { url: '', error: 'Prompt cannot be empty.' };
  }

  try {
    console.log("Calling OpenAI with prompt:", prompt);
    const response = await openai.images.generate({
      model: "dall-e-3", // Or dall-e-2 if preferred/needed
      prompt: prompt,
      n: 1, // Generate one image
      size: "1024x1024", // Or other supported sizes like "1024x1792", "1792x1024"
      response_format: "url", // Get a temporary URL directly
    });

    console.log("OpenAI response:", response);

    const imageUrl = response.data[0]?.url;

    if (!imageUrl) {
      throw new Error('No image URL received from OpenAI.');
    }

    return { url: imageUrl };

  } catch (error: any) {
    console.error('Error generating image with OpenAI:', error);
    const errorMessage = error.response?.data?.error?.message || error.message || 'An unknown error occurred';
    return { url: '', error: `OpenAI API Error: ${errorMessage}` };
  }
}

import OpenAI from 'openai';

// Add this interface definition and export it
export interface AgentSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  behavior: string;
  tools?: any[]; // Add this if you need tools functionality
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AssistantContext {
  persona: {
    role: string;
    theme: string;
    basePrompt: string;
    traits: string[];
    vocabulary: {
      useThematicWords: boolean;
      thematicTerms: string[];
    };
    voice: {
      enabled: boolean;
      provider: 'browser' | 'openai';
      openaiVoice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
      speed: number;
    };
  };
  preferences: {
    responseStyle: 'concise' | 'detailed' | 'casual' | 'formal';
    useEmoji: boolean;
    codeStyle: 'minimal' | 'documented' | 'verbose';
    interactionStyle: 'proactive' | 'reactive';
  };
  memory: {
    retainConversationHistory: boolean;
    maxHistoryLength: number;
    rememberUserPreferences: boolean;
  };
}

export async function generateAIResponse(
  input: string, 
  settings: AgentSettings, 
  apiKey: string,
  chatHistory: ChatMessage[] = [],
  context?: AssistantContext
): Promise<string> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  try {
    const systemMessage = context ? 
      `You are a witty AI assistant in The Slackers Lounge, a sophisticated virtual speakeasy.
       Role: ${context.persona.role}
       Theme: ${context.persona.theme}
       Style: ${context.preferences.responseStyle}
       ${context.preferences.useEmoji ? 'Feel free to use emojis.' : 'Avoid using emojis.'}
       Maintain a ${settings.behavior} demeanor and respond in a way that fits the speakeasy atmosphere.
       Keep responses under ${settings.maxTokens} tokens.` :
      `You are a witty AI assistant in The Slackers Lounge, a sophisticated virtual speakeasy. 
       Maintain a ${settings.behavior} demeanor and respond in a way that fits the speakeasy atmosphere. 
       Keep responses under ${settings.maxTokens} tokens.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemMessage },
      ...chatHistory,
      { role: 'user', content: input }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: settings.model,
        messages: messages,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        presence_penalty: 0.6,
        frequency_penalty: 0.5
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to get response from AI');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error in generateAIResponse:', error);
    throw error;
  }
}

// Replace both generateImage functions with this single implementation
export async function generateImage(
  prompt: string,
  options: {
    size?: '1024x1024' | '1792x1024' | '1024x1792';  // DALL-E 3 supported sizes
    quality?: 'standard' | 'hd';
    style?: 'vivid' | 'natural';
    apiKey?: string;
  } = {}
): Promise<string> {
  try {
    console.log('Starting image generation...');
    
    if (!options.apiKey && !import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error('No API key provided');
    }

    const openai = new OpenAI({ 
      apiKey: options.apiKey || import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });

    console.log('OpenAI client created, attempting to generate image...');
    const response = await openai.images.generate({
      model: "dall-e-3",  // Changed to DALL-E 3
      prompt,
      n: 1,
      size: options.size || '1024x1024',  // Default to 1024x1024
      quality: options.quality || 'hd',    // Default to HD
      style: options.style || 'vivid',     // Keep vivid as default
    });

    console.log('Response received:', response);

    if (response.data && response.data[0] && response.data[0].url) {
      return response.data[0].url;
    } else {
      console.error('Unexpected response structure:', response);
      return "";
    }
  } catch (error) {
    console.error('Detailed error in generateImage:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}

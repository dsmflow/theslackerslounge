import Anthropic from '@anthropic-ai/sdk';

export interface ClaudeSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  behavior?: string;
}

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export async function generateClaudeResponse(
  prompt: string,
  settings: ClaudeSettings,
  apiKey: string,
  chatHistory: ChatMessage[] = []
): Promise<string> {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  // Add system message if behavior is specified
  const systemMessage = settings.behavior 
    ? { role: 'system' as const, content: `Maintain a ${settings.behavior} demeanor in your responses.` }
    : null;

  const messages = [
    ...(systemMessage ? [systemMessage] : []),
    ...chatHistory,
    { role: 'user' as const, content: prompt }
  ];

  try {
    const response = await anthropic.messages.create({
      model: settings.model,
      messages: messages,
      max_tokens: settings.maxTokens,
      temperature: settings.temperature,
    });

    if (!response.content?.[0]?.text) {
      throw new Error('Invalid response format from Claude API');
    }

    return response.content[0].text;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    if (error instanceof Error) {
      throw new Error(`Claude API error: ${error.message}`);
    }
    throw new Error('Unknown error occurred while calling Claude API');
  }
}

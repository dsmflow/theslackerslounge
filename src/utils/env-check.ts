// Create this new file to check environment variables
export function checkEnvironmentVariables() {
  const requiredVars = [
    'VITE_DEEPGRAM_API_KEY',
    'VITE_OPENAI_API_KEY',
    'VITE_ANTHROPIC_API_KEY'  // Add Anthropic API key check
  ];

  const missing = requiredVars.filter(varName => !import.meta.env[varName]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Log only in development
  if (import.meta.env.DEV) {
    console.log('Environment variables loaded successfully');
  }
}

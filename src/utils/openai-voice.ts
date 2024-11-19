import OpenAI from 'openai';

interface VoiceSettings {
  model?: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed?: number;
}

export async function textToSpeech(
  text: string,
  apiKey: string,
  options: {
    voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    speed?: number;
  } = {}
): Promise<Blob> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: options.voice || 'nova',
      speed: options.speed || 1.0
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to generate speech');
  }

  return response.blob();
}

export async function speechToText(
  audioBlob: Blob,
  apiKey: string
): Promise<string> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const formData = new FormData();
  formData.append('file', audioBlob);
  formData.append('model', 'whisper-1');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to transcribe audio');
  }

  const data = await response.json();
  return data.text;
}

export async function streamAudioToText(
  mediaRecorder: MediaRecorder,
  onTranscript: (text: string) => void,
  apiKey: string
): Promise<void> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  mediaRecorder.ondataavailable = async (event) => {
    if (event.data.size > 0) {
      const formData = new FormData();
      formData.append('file', event.data, 'audio.webm');
      formData.append('model', 'whisper-1');

      try {
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error('Failed to transcribe audio');
        }

        const data = await response.json();
        onTranscript(data.text);
      } catch (error) {
        console.error('Error transcribing audio:', error);
        throw error;
      }
    }
  };
}

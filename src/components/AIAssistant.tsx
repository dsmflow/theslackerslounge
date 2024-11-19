import React, { useState, useEffect, useRef } from 'react';
import { Mic, StopCircle, Send, Settings, X, Image as ImageIcon } from 'lucide-react';
import { generateAIResponse } from '../utils/openai';
import { textToSpeech, speechToText, streamAudioToText } from '../utils/openai-voice';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AssistantContext {
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

const defaultContext: AssistantContext = {
  persona: {
    role: "AI Assistant",
    theme: "Speakeasy",
    basePrompt: "You are a helpful AI assistant.",
    traits: [
      "helpful",
      "concise",
      "clear",
      "professional"
    ],
    vocabulary: {
      useThematicWords: true,
      thematicTerms: [
        "speakeasy",
        "cocktail",
        "spirits",
        "prohibition",
        "mixology"
      ]
    },
    voice: {
      enabled: true,
      provider: 'openai',
      openaiVoice: 'nova',
      speed: 1.0
    }
  },
  preferences: {
    responseStyle: 'concise',
    useEmoji: false,
    codeStyle: 'documented',
    interactionStyle: 'reactive'
  },
  memory: {
    retainConversationHistory: true,
    maxHistoryLength: 50,
    rememberUserPreferences: true
  }
};

const AIAssistant: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  const [agentSettings, setAgentSettings] = useState({
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 150,
    behavior: 'friendly',
  });

  const [assistantContext, setAssistantContext] = useState<AssistantContext>(defaultContext);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      console.log('Starting recording...'); // Debug log
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      await streamAudioToText(
        mediaRecorderRef.current,
        (text) => {
          setTranscript(prev => prev ? `${prev} ${text}` : text);
        },
        apiKey
      );

      setIsListening(true);
      setTranscript('Listening...');
    } catch (error) {
      console.error('Error in startRecording:', error);
      setIsListening(false);
      setTranscript(`Error: Could not access microphone. ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSend = async (input: string) => {
    if (!input.trim()) return;
    if (!apiKey) {
      setShowApiKeyInput(true);
      return;
    }

    setIsLoading(true);
    const newMessage: ChatMessage = { role: 'user', content: input };
    setChatHistory(prev => [...prev, newMessage]);

    try {
      if (!apiKey.trim().startsWith('sk-')) {
        throw new Error('Please enter a valid OpenAI API key starting with "sk-"');
      }

      const response = await generateAIResponse(
        input,
        agentSettings,
        apiKey,
        assistantContext.memory.retainConversationHistory ? chatHistory : [],
        assistantContext
      );

      // Add AI response to chat history
      const assistantMessage: ChatMessage = { role: 'assistant', content: response };
      setChatHistory(prev => [...prev, assistantMessage]);
      
      // Text-to-speech for AI response
      await speakResponse(response);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: ChatMessage = { 
        role: 'assistant', 
        content: error instanceof Error ? 
          `Error: ${error.message}` : 
          'My apologies, it seems the spirits are not cooperating at the moment. Care to try again?' 
      };
      setChatHistory(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
    setTranscript('');
    setTextInput('');
  };

  const handleSettingChange = (setting: keyof typeof agentSettings, value: any) => {
    setAgentSettings(prev => ({ ...prev, [setting]: value }));
  };

  const updateContext = (updates: Partial<AssistantContext>) => {
    setAssistantContext(prev => ({
      ...prev,
      ...updates,
      preferences: {
        ...prev.preferences,
        ...(updates.preferences || {})
      },
      memory: {
        ...prev.memory,
        ...(updates.memory || {})
      },
      persona: {
        ...prev.persona,
        ...(updates.persona || {})
      }
    }));
  };

  const speakResponse = async (text: string) => {
    if (!assistantContext.persona.voice.enabled) return;

    try {
      if (assistantContext.persona.voice.provider === 'openai') {
        const audioBlob = await textToSpeech(
          text,
          apiKey,
          {
            voice: assistantContext.persona.voice.openaiVoice,
            speed: assistantContext.persona.voice.speed
          }
        );
        
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        await audio.play();
      } else {
        // Fallback to browser TTS
        if (!synthRef.current) return;
        const utterance = new SpeechSynthesisUtterance(text);
        synthRef.current.speak(utterance);
      }
    } catch (error) {
      console.error('Error generating speech:', error);
    }
  };

  const renderContextSettings = () => (
    <div className="space-y-6">
      {/* Persona Settings */}
      <div className="space-y-4">
        <h4 className="text-gold text-sm font-medium border-b border-gold/30 pb-2">Persona Configuration</h4>
        
        <div className="flex flex-col gap-2">
          <label className="text-gold text-sm font-medium">Theme</label>
          <select
            value={assistantContext.persona.theme}
            onChange={(e) => updateContext({
              persona: { ...assistantContext.persona, theme: e.target.value }
            })}
            className="bg-dark/50 border-2 border-gold rounded-lg px-3 py-2 text-cream"
          >
            <option value="Speakeasy">Speakeasy</option>
            <option value="Modern">Modern Professional</option>
            <option value="Cyberpunk">Cyberpunk</option>
            <option value="Academic">Academic Scholar</option>
            <option value="Custom">Custom</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-gold text-sm font-medium">Base Prompt</label>
          <textarea
            value={assistantContext.persona.basePrompt}
            onChange={(e) => updateContext({
              persona: { ...assistantContext.persona, basePrompt: e.target.value }
            })}
            className="bg-dark/50 border-2 border-gold rounded-lg px-3 py-2 text-cream min-h-[100px] resize-none"
            placeholder="Define the core personality and behavior of the assistant..."
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={assistantContext.persona.vocabulary.useThematicWords}
            onChange={(e) => updateContext({
              persona: {
                ...assistantContext.persona,
                vocabulary: {
                  ...assistantContext.persona.vocabulary,
                  useThematicWords: e.target.checked
                }
              }
            })}
            className="form-checkbox h-4 w-4 text-gold border-gold rounded focus:ring-gold"
          />
          <label className="text-cream text-sm">Use Thematic Vocabulary</label>
        </div>
      </div>

      {/* Existing Preference Settings */}
      <div className="space-y-4">
        <h4 className="text-gold text-sm font-medium border-b border-gold/30 pb-2">Response Preferences</h4>
        
        <div className="flex flex-col gap-2">
          <label className="text-gold text-sm font-medium">Response Style</label>
          <select
            value={assistantContext.preferences.responseStyle}
            onChange={(e) => updateContext({
              preferences: { ...assistantContext.preferences, responseStyle: e.target.value as any }
            })}
            className="bg-dark/50 border-2 border-gold rounded-lg px-3 py-2 text-cream"
          >
            <option value="casual">Casual</option>
            <option value="formal">Formal</option>
            <option value="concise">Concise</option>
            <option value="detailed">Detailed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={assistantContext.preferences.useEmoji}
            onChange={(e) => updateContext({
              preferences: { ...assistantContext.preferences, useEmoji: e.target.checked }
            })}
            className="form-checkbox h-4 w-4 text-gold border-gold rounded focus:ring-gold"
          />
          <label className="text-cream text-sm">Use Emoji in Responses</label>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-gold text-sm font-medium">Code Style</label>
          <select
            value={assistantContext.preferences.codeStyle}
            onChange={(e) => updateContext({
              preferences: { ...assistantContext.preferences, codeStyle: e.target.value as any }
            })}
            className="bg-dark/50 border-2 border-gold rounded-lg px-3 py-2 text-cream"
          >
            <option value="minimal">Minimal</option>
            <option value="documented">Documented</option>
            <option value="verbose">Verbose</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-gold text-sm font-medium">Interaction Style</label>
          <select
            value={assistantContext.preferences.interactionStyle}
            onChange={(e) => updateContext({
              preferences: { ...assistantContext.preferences, interactionStyle: e.target.value as any }
            })}
            className="bg-dark/50 border-2 border-gold rounded-lg px-3 py-2 text-cream"
          >
            <option value="proactive">Proactive</option>
            <option value="reactive">Reactive</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={assistantContext.memory.retainConversationHistory}
            onChange={(e) => updateContext({
              memory: { ...assistantContext.memory, retainConversationHistory: e.target.checked }
            })}
            className="form-checkbox h-4 w-4 text-gold border-gold rounded focus:ring-gold"
          />
          <label className="text-cream text-sm">Retain Conversation History</label>
        </div>
      </div>
    </div>
  );

  const renderVoiceSettings = () => (
    <div className="space-y-4">
      <h4 className="text-gold text-sm font-medium border-b border-gold/30 pb-2">Voice Settings</h4>
      
      <div className="flex items-center justify-between">
        <label className="text-cream text-sm">Enable Voice Response</label>
        <div className="relative inline-block w-12 h-6 transition-colors duration-200 ease-in-out rounded-full cursor-pointer">
          <input
            type="checkbox"
            checked={assistantContext.persona.voice.enabled}
            onChange={(e) => updateContext({
              persona: {
                ...assistantContext.persona,
                voice: {
                  ...assistantContext.persona.voice,
                  enabled: e.target.checked
                }
              }
            })}
            className="sr-only"
          />
          <div
            className={`absolute inset-0 rounded-full transition-colors duration-200 ease-in-out ${
              assistantContext.persona.voice.enabled ? 'bg-gold' : 'bg-dark/50'
            }`}
          >
            <div
              className={`absolute left-0.5 top-0.5 w-5 h-5 bg-cream rounded-full transform transition-transform duration-200 ease-in-out ${
                assistantContext.persona.voice.enabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </div>
        </div>
      </div>

      {assistantContext.persona.voice.enabled && (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-gold text-sm font-medium">Voice Provider</label>
            <select
              value={assistantContext.persona.voice.provider}
              onChange={(e) => updateContext({
                persona: {
                  ...assistantContext.persona,
                  voice: {
                    ...assistantContext.persona.voice,
                    provider: e.target.value as 'browser' | 'openai'
                  }
                }
              })}
              className="bg-dark/50 border-2 border-gold rounded-lg px-3 py-2 text-cream"
            >
              <option value="openai">OpenAI (Natural)</option>
              <option value="browser">Browser (Basic)</option>
            </select>
          </div>

          {assistantContext.persona.voice.provider === 'openai' && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-gold text-sm font-medium">Voice Style</label>
                <select
                  value={assistantContext.persona.voice.openaiVoice}
                  onChange={(e) => updateContext({
                    persona: {
                      ...assistantContext.persona,
                      voice: {
                        ...assistantContext.persona.voice,
                        openaiVoice: e.target.value as any
                      }
                    }
                  })}
                  className="bg-dark/50 border-2 border-gold rounded-lg px-3 py-2 text-cream"
                >
                  <option value="nova">Nova (Warm)</option>
                  <option value="alloy">Alloy (Neutral)</option>
                  <option value="echo">Echo (Deep)</option>
                  <option value="fable">Fable (Expressive)</option>
                  <option value="onyx">Onyx (Authoritative)</option>
                  <option value="shimmer">Shimmer (Bright)</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-gold text-sm font-medium">Speech Speed</label>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={assistantContext.persona.voice.speed}
                  onChange={(e) => updateContext({
                    persona: {
                      ...assistantContext.persona,
                      voice: {
                        ...assistantContext.persona.voice,
                        speed: parseFloat(e.target.value)
                      }
                    }
                  })}
                  className="w-full accent-gold"
                />
                <div className="flex justify-between text-xs text-cream">
                  <span>Slower</span>
                  <span>{assistantContext.persona.voice.speed}x</span>
                  <span>Faster</span>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-dark py-20">
      {showApiKeyInput && (
        <div className="mb-4 p-4 rounded-lg border-2 border-gold/30 bg-dark/30">
          <h3 className="text-gold text-sm font-medium mb-2">OpenAI API Key Required</h3>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Enter your OpenAI API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-grow bg-dark/50 border-2 border-gold rounded-lg px-3 py-2 text-cream"
            />
            <button
              onClick={() => {
                if (apiKey.trim().startsWith('sk-')) {
                  setShowApiKeyInput(false);
                } else {
                  alert('Please enter a valid OpenAI API key starting with "sk-"');
                }
              }}
              className="px-4 py-2 bg-gold/20 hover:bg-gold/30 text-gold rounded-lg border-2 border-gold"
            >
              Save
            </button>
          </div>
          <p className="text-cream/60 text-xs mt-2">
            Your API key is stored securely in memory and never saved to disk.
            Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">OpenAI's dashboard</a>.
          </p>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-display">
            <span className="text-gold text-shadow-gold">&lt;</span>
            <span className="text-accent text-shadow-accent">the speakeasy</span>
            <span className="text-gold text-shadow-gold">/&gt;</span>
          </h1>
          <p className="mt-4 text-xl text-cream text-shadow-cream opacity-90">Your AI companion for witty banter and intellectual discourse</p>
        </div>

        <div className="bg-dark/90 rounded-lg p-8 border-2 border-gold shadow-gold">
          {/* Chat Container with Wireframe */}
          <div className="relative flex flex-col h-[60vh] mb-6 border-2 border-gold/30 rounded-lg p-4 bg-dark/30">
            {/* Chat History */}
            <div className="flex-grow overflow-auto scrollbar-thin scrollbar-thumb-gold scrollbar-track-dark space-y-4 pr-4">
              {chatHistory.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-lg border-2 ${
                    message.role === 'user'
                      ? 'bg-dark/50 text-gold border-gold shadow-gold' 
                      : 'bg-dark/30 text-cream border-accent shadow-accent'
                  }`}>
                    <pre className="whitespace-pre-wrap font-display text-sm leading-relaxed">{message.content}</pre>
                  </div>
                </div>
              ))}
            </div>

            {/* Loading Indicator */}
            {isLoading && (
              <div className="absolute bottom-0 left-0 right-0 flex justify-center mb-4">
                <p className="text-cream font-display italic text-shadow-cream bg-dark/30 px-6 py-3 rounded-lg border-2 border-cream/20">
                  Crafting a response<span className="animate-pulse">...</span>
                </p>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="relative">
            <div className="flex items-end gap-2">
              {/* Left Button Group */}
              <div className="flex gap-2">
                <button
                  onClick={toggleListening}
                  className={`p-3 rounded-lg border-2 transition-all duration-300 hover:shadow-lg ${
                    isListening
                      ? 'border-accent bg-accent/20 text-accent hover:bg-accent/30 shadow-accent'
                      : 'border-gold bg-dark/50 text-gold hover:bg-dark/70 hover:shadow-gold'
                  }`}
                  title={isListening ? 'Stop Recording' : 'Start Recording'}
                >
                  {isListening ? <StopCircle size={24} /> : <Mic size={24} />}
                </button>

                {/* File Upload Buttons */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setTextInput(e.target.value)}
                  className="hidden"
                  id="image-input"
                />
                <label
                  htmlFor="image-input"
                  className={`cursor-pointer p-3 rounded-lg border-2 transition-all duration-300 ${
                    textInput 
                      ? 'border-accent bg-accent/20 text-accent hover:bg-accent/30' 
                      : 'border-gold bg-dark/50 text-gold hover:bg-dark/70'
                  }`}
                  title="Upload Image"
                >
                  {textInput ? <ImageIcon size={24} /> : <ImageIcon size={24} />}
                </label>
              </div>

              {/* Text Input */}
              <div className="flex-grow">
                <textarea
                  value={isListening ? transcript : textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={isListening ? 'Listening...' : 'Type your message...'}
                  className="w-full h-[44px] px-4 py-2 rounded-lg bg-dark/50 border-2 border-gold text-cream placeholder-cream/50 focus:outline-none focus:border-accent focus:shadow-accent transition-all duration-300 resize-none text-sm overflow-hidden"
                  style={{ 
                    lineHeight: '28px',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = '44px';
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                  readOnly={isListening}
                />
              </div>

              {/* Right Button Group */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleSend(isListening ? transcript : textInput);
                    setTextInput('');
                  }}
                  disabled={isLoading || (!textInput.trim() && !transcript.trim())}
                  className="p-3 rounded-lg border-2 border-gold bg-dark/50 text-gold hover:bg-dark/70 hover:shadow-gold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={24} />
                </button>

                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className={`p-3 rounded-lg border-2 transition-all duration-300 hover:shadow-lg ${
                    isSettingsOpen
                      ? 'border-accent bg-accent/20 text-accent hover:bg-accent/30 shadow-accent'
                      : 'border-gold bg-dark/50 text-gold hover:bg-dark/70 hover:shadow-gold'
                  }`}
                >
                  <Settings size={24} />
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            {isSettingsOpen && (
              <div className="mt-4 p-6 rounded-lg border-2 border-accent bg-dark/50 shadow-accent">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-display text-gold mb-4">Model Settings</h3>
                    {/* Existing model settings */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-display text-gold text-shadow-gold mb-4">Model Selection</h3>
                        <div className="space-y-3 pl-4">
                          <label className="flex items-center space-x-3 p-2 rounded-lg hover:bg-dark/30 transition-colors duration-300">
                            <input
                              type="radio"
                              checked={!agentSettings.useJanusFlow && !agentSettings.useOllama}
                              onChange={() => setAgentSettings(prev => ({ 
                                ...prev, 
                                useJanusFlow: false,
                                useOllama: false 
                              }))}
                              className="form-radio text-accent"
                            />
                            <span className="text-cream text-shadow-cream">OpenAI GPT</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    {renderContextSettings()}
                    {renderVoiceSettings()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;

interface Window {
  webkitSpeechRecognition: typeof SpeechRecognition;
}

declare var SpeechRecognition: {
  new (): SpeechRecognition;
};

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

// Add these lines at the end of the file
interface Window {
  webkitSpeechRecognition: typeof SpeechRecognition;
}

declare var webkitSpeechRecognition: {
  new (): SpeechRecognition;
};

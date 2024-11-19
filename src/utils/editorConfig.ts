import * as monaco from 'monaco-editor';

export const editorDefaultOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  lineHeight: 1.5,
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  fontLigatures: true,
  letterSpacing: 0.5,
  scrollBeyondLastLine: false,
  roundedSelection: true,
  padding: { top: 16, bottom: 16 },
  quickSuggestions: {
    other: true,
    comments: true,
    strings: true
  },
  suggestOnTriggerCharacters: true,
  parameterHints: {
    enabled: true,
    cycle: true
  },
  autoClosingBrackets: 'always',
  formatOnType: true,
  formatOnPaste: true,
  tabSize: 2,
  automaticLayout: true
};

export const supportedLanguages = ['javascript', 'typescript', 'html', 'css', 'json'];

import { editor } from 'monaco-editor';

export const registerCustomTheme = () => {
  editor.defineTheme('customTheme', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955' },
      { token: 'keyword', foreground: 'C586C0' },
      { token: 'string', foreground: 'CE9178' },
    ],
    colors: {
      'editor.background': '#1a2f23',
      'editor.foreground': '#f5e6d3',
      'editorCursor.foreground': '#d4af37',
      'editor.lineHighlightBackground': '#2c4c3b',
      'editorLineNumber.foreground': '#d4af37',
      'editor.selectionBackground': '#d4af3733',
      'editor.inactiveSelectionBackground': '#d4af3722',
    },
  });
};
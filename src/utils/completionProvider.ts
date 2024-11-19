import * as monaco from 'monaco-editor';

export function registerCompletionProvider() {
  monaco.languages.registerCompletionItemProvider('javascript', {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      };

      const suggestions = [
        {
          label: 'console.log',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'console.log($0)',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range
        },
        {
          label: 'async function',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'async function ${1:name}(${2:params}) {\n\t$0\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range
        }
      ];

      return { suggestions };
    }
  });
}

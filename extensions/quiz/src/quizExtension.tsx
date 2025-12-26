import type { Extension, ExtensionAPI } from '@allin/extension-api';

export const quizExtension: Extension = {
  id: 'quiz',
  name: 'Quiz Extension',
  version: '0.1.0',
  description: 'An extension that creates a quiz when you select text',
  activate(api: ExtensionAPI) {
    api.selectionPopover.add('quiz', ({ close, selectedText }) => {
      return (
        <button
          onClick={() => {
            close();
            console.log(selectedText);
          }}
          type='button'
        >
          Create Quiz
        </button>
      );
    });
  },
};

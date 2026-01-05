import type { Extension } from '@allin/extension';

export const quizExtension: Extension = context => {
  const sub1 = context.event['extension.activate'].subscribe(({ id, name }) => {
    console.log('==> extension activated', id, name);
  });
  const sub2 = context.event['extension.open'].subscribe(({ id, name }) => {
    console.log('==> extension opened', id, name);
  });

  return {
    id: 'quiz',
    name: 'quiz',
    description: 'create multiple choice quiz',
    version: '0.1.0',
    cleanup: () => {
      sub1.unsubscribe();
      sub2.unsubscribe();
    },
  };
};

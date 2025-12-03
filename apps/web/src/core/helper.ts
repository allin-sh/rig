import type { UIMessage } from 'ai';
import type { Brand } from 'ts-brand';
import { v4 as uuidv4 } from 'uuid';

/**
 * [
 *   [
 *     {
 *       role: 'user',
 *       content: 'Hello, how are you?'
 *     },
 *     {
 *       role: 'assistant',
 *       content: 'I am good, thank you!'
 *     }
 *   ],
 *   [
 *     {
 *       role: 'user',
 *       content: 'What is the capital of France?'
 *     },
 *     {
 *       role: 'assistant',
 *       content: 'The capital of France is Paris.'
 *     }
 *   ]
 * ]
 */
export type Thread = Brand<UserOrAssistantMessage[], 'thread'>;

export type UserOrAssistantMessage = UIMessage & {
  role: 'user' | 'assistant';
};

/**
 * Possible thread formats:
 * [user message] // when an assistant message was not generated due to an error
 * [user message, assistant message]
 * Any other forms indicate an unexpected error or a serious bug.
 */
export const messagesToThreads = (messages: UIMessage[]): Thread[] => {
  const threads = messages.reduce(
    (acc, message) => {
      if (message.role === 'user') {
        acc.push([message] as Thread);
      }
      if (message.role === 'assistant') {
        const recentThread = acc[acc.length - 1];
        if (recentThread.length < 2) {
          recentThread.push(message as UserOrAssistantMessage);
        }
      }

      return acc;
    },
    [] as unknown as Thread[],
  );

  return threads;
};

export const threadsToMessages = (threads: Thread[]): UIMessage[] => {
  return threads.flatMap(t => t);
};

export const generateUIMessage = <
  UI_MESSAGE extends UIMessage,
  Role extends UI_MESSAGE['role'],
>(
  role: Role,
  content: string,
  id: string = uuidv4(),
) => {
  return {
    role,
    id,
    parts: [
      {
        type: 'text',
        text: content,
      },
    ],
  } as UI_MESSAGE & { role: Role };
};

export const getTextUIMessage = (message: UIMessage) => {
  const texts: string[] = [];
  message.parts.forEach(part => {
    if (part.type === 'text') {
      texts.push(part.text);
    }
  });

  return texts.join('\n');
};

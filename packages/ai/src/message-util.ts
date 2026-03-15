import type { UIMessageMetadata } from '@allin/message-metadata-schema';
import type { UIMessage } from 'ai';
import { assert } from 'es-toolkit/util';
import { v4 } from 'uuid';

export type UserMessage = UIMessage<UIMessageMetadata> & {
  role: 'user';
};

export type AssistantMessage = UIMessage<UIMessageMetadata> & {
  role: 'assistant';
};

export type SystemMessage = UIMessage<UIMessageMetadata> & {
  role: 'system';
};

export const isUserMessage = (
  message: UIMessage<UIMessageMetadata>,
): message is UserMessage => {
  return message.role === 'user';
};

export const isAssistantMessage = (
  message: UIMessage<UIMessageMetadata>,
): message is AssistantMessage => {
  return message.role === 'assistant';
};

export const isSystemMessage = (
  message: UIMessage<UIMessageMetadata>,
): message is SystemMessage => {
  return message.role === 'system';
};

export const getSystemMessageText = (
  message: UIMessage<UIMessageMetadata>,
): string => {
  assert(
    message.role === 'system',
    `getSystemMessageText: message is not a system message. role: ${message.role}`,
  );

  return message.parts.reduce((acc, part) => {
    if (part.type === 'text') {
      return acc + part.text;
    }
    return acc;
  }, '');
};
export const getAssistantMessageText = (
  message: UIMessage<UIMessageMetadata>,
): string => {
  assert(
    message.role === 'assistant',
    `getAssistantMessageText: message is not a assistant message. role: ${message.role}`,
  );

  return message.parts.reduce((acc, part) => {
    if (part.type === 'text') {
      return acc + part.text;
    }
    return acc;
  }, '');
};

export const getUserMessageText = (
  message: UIMessage<UIMessageMetadata>,
): string => {
  assert(
    message.role === 'user',
    `getUserMessageText: message is not a user message. role: ${message.role}`,
  );

  return message.parts.reduce((acc, part) => {
    if (part.type === 'text') {
      return acc + part.text;
    }
    return acc;
  }, '');
};

export const getMessageText = (
  message: UIMessage<UIMessageMetadata>,
): string => {
  if (isSystemMessage(message)) {
    return getSystemMessageText(message);
  }
  if (isAssistantMessage(message)) {
    return getAssistantMessageText(message);
  }
  if (isUserMessage(message)) {
    return getUserMessageText(message);
  }
  throw new Error(`getMessageText: unknown message role: ${message.role}`);
};

export const generateUIMessage = <
  UI_MESSAGE extends UIMessage<UIMessageMetadata>,
  Role extends UI_MESSAGE['role'],
>(
  role: Role,
  content: string,
  id: string = v4(),
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

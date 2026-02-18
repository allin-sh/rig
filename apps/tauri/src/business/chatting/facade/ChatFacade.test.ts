import {
  generateUIMessage,
  getAssistantMessageText,
  getSystemMessageText,
  getUserMessageText,
  type ProviderId,
} from '@allin/ai';
import { delay } from 'es-toolkit';
import { describe, expect, it, vi } from 'vitest';
import type { ChatUiMessage } from '@/lib/gateway/message/messageMapper';
import { createMockTauriChatTransport } from '../test/mocks/createMockTauriChatTransport';
import { ChatFacade } from './ChatFacade';

const setupChatFacade = ({
  textDeltaChunks,
  providerName,
  modelId,
  initialMessages,
}: {
  providerName?: ProviderId;
  modelId?: string;
  textDeltaChunks?: string[];
  initialMessages: ChatUiMessage[];
}) => {
  const transport = createMockTauriChatTransport({
    providerName: providerName ?? 'anthropic',
    modelId: modelId ?? 'opus-4.6',
    textDeltaChunks: textDeltaChunks ?? ['Hello', ' I am assistant.'],
  });

  return new ChatFacade({
    id: 'chatFacadeTest',
    transport,
    messages: initialMessages,
  });
};

describe('ChatFacade', () => {
  describe('constructor', () => {
    it('should initialize uiMessageStore with the provided messages', () => {
      const initialMessages = [
        generateUIMessage('user', 'Hello, how are you?'),
      ];
      const chatFacade = setupChatFacade({
        initialMessages,
      });

      expect(chatFacade.getUiMessages()).toEqual(initialMessages);
    });

    it('should set initial status to ready', () => {
      const chatFacde = setupChatFacade({
        initialMessages: [],
      });

      expect(chatFacde.getStatus()).toBe('ready');
    });
    it('should set providerId and modelId from transport', () => {
      const chatFacde = setupChatFacade({
        providerName: 'anthropic',
        modelId: 'opus-4.7',
        initialMessages: [],
      });

      expect(chatFacde.providerId).toBe('anthropic');
      expect(chatFacde.modelId).toBe('opus-4.7');
    });
  });

  describe('sendMessage', () => {
    it('should emit onBeforeSend$ before calling sendMessage', () => {
      const chatFacade = setupChatFacade({
        initialMessages: [],
      });

      chatFacade.beforeMessageSend$().subscribe(message => {
        expect(getUserMessageText(message)).toBe('Hello, how are you?');
      });

      chatFacade.sendMessage(generateUIMessage('user', 'Hello, how are you?'));
    });

    it('should reject when called after dispose', () => {
      const chatFacade = setupChatFacade({
        initialMessages: [],
      });

      chatFacade.dispose();

      expect(() =>
        chatFacade.sendMessage(
          generateUIMessage('user', 'Hello, how are you?'),
        ),
      ).rejects.toThrow();
    });
  });

  describe('Chat → UIMessageStore sync', () => {
    it('should add user message to uiMessageStore when chat pushes it', async () => {
      const chatFacade = setupChatFacade({
        initialMessages: [],
        textDeltaChunks: ['Hello', ' I am fine. And you?'],
      });

      chatFacade.sendMessage(generateUIMessage('user', 'Hello, how are you?'));
      expect(chatFacade.getUiMessages()[0].role).toBe('user');
      expect(getUserMessageText(chatFacade.getUiMessages()[0])).toBe(
        'Hello, how are you?',
      );
      // internally, throttle time is 50ms, so we need to wait
      await delay(60);
      expect(chatFacade.getUiMessages().length).toBe(2);
      expect(chatFacade.getUiMessages()[1].role).toBe('assistant');
      expect(getAssistantMessageText(chatFacade.getUiMessages()[1])).toBe(
        'Hello I am fine. And you?',
      );
    });
  });

  describe('Chat → status$ sync', () => {
    it('should reflect chat status changes through status$', async () => {
      const chatFacade = setupChatFacade({
        initialMessages: [],
        textDeltaChunks: ['Hello', ' I am fine. And you?'],
      });

      expect(chatFacade.getStatus()).toBe('ready');
      chatFacade.sendMessage(generateUIMessage('user', 'Hello, how are you?'));
      expect(chatFacade.getStatus()).toBe('submitted');
    });
  });

  describe('addSystemMessage', () => {
    it('should append to chat.messages without affecting uiMessageStore', () => {
      const chatFacade = setupChatFacade({
        initialMessages: [],
      });

      chatFacade.getUiMessages$().subscribe(messages => {
        console.log(messages);
      });

      chatFacade.addSystemMessage(
        generateUIMessage('system', 'You are a helpful assistant.'),
      );

      expect(chatFacade.getUiMessages().length).toBe(1);
      expect(chatFacade.getUiMessages()[0].role).toBe('system');
      expect(getSystemMessageText(chatFacade.getUiMessages()[0])).toBe(
        'You are a helpful assistant.',
      );
    });
  });

  describe('updateTransport', () => {
    it('should preserve existing messages after transport update', async () => {
      const initialMessages = [
        generateUIMessage('user', 'Hello, how are you?'),
        generateUIMessage('assistant', 'I am fine. And you?'),
      ];
      const chatFacade = setupChatFacade({
        initialMessages,
      });

      expect(chatFacade.getUiMessages()).toEqual(initialMessages);
      expect(chatFacade.modelId).toBe('opus-4.6');
      expect(chatFacade.providerId).toBe('anthropic');

      const newTransport = createMockTauriChatTransport({
        providerName: 'openai',
        modelId: 'gpt-4.6',
        textDeltaChunks: ["Hello. I'm GPT."],
      });

      chatFacade.updateTransport(newTransport);

      expect(chatFacade.getUiMessages()).toEqual(initialMessages);
      expect(chatFacade.modelId).toBe('gpt-4.6');
      expect(chatFacade.providerId).toBe('openai');

      chatFacade.sendMessage(generateUIMessage('user', 'Who are you?'));
      // internally, throttle time is 50ms, so we need to wait
      await delay(60);

      expect(chatFacade.getUiMessages()[3].role).toBe('assistant');
      expect(getAssistantMessageText(chatFacade.getUiMessages()[3])).toBe(
        "Hello. I'm GPT.",
      );
    });
  });
});

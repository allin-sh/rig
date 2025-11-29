import type { ChatInit, UIMessage } from 'ai';
import { isEqual, noop } from 'es-toolkit';
import { useCallback, useRef, useSyncExternalStore } from 'react';
import type { LLMProvider } from '../provider/LLMProvider';
import { type ChatFacade, createChatFacade } from './ChatFacade';
import { ChatFacadeManager } from './ChatFacadeManager';

/**
 * It must be declared as a constant to avoid infinite re-rendering.
 */
const EMPTY_MESSAGES: UIMessage[] = [];

type UseChatOptions = {
  id: string;
  provider: LLMProvider;
  modelId: string;
  messages: UIMessage[];
  onFinish?: ChatInit<UIMessage>['onFinish'];
  onError?: ChatInit<UIMessage>['onError'];
  onData?: ChatInit<UIMessage>['onData'];
};

/**
 * if chatFacade is changed, the uiMessages and status will be updated.
 */
export const useChat = <UI_MESSAGE extends UIMessage>({
  id,
  provider,
  modelId,
  messages,
  ...options
}: UseChatOptions) => {
  const chatFacadeRef = useRef<ChatFacade>(
    ChatFacadeManager.getChatFacade(id) ??
      createChatFacade({
        id,
        messages,
        provider,
        modelId,
        onData: options.onData ?? noop,
        onFinish: options.onFinish ?? noop,
        onError: options.onError ?? noop,
      }),
  );

  const shouldUpdateProvider =
    id !== chatFacadeRef.current.getId() ||
    !isEqual(
      {
        provider: provider.name,
        modelId,
      },
      {
        provider: chatFacadeRef.current.getProviderName(),
        modelId: chatFacadeRef.current.getModelId(),
      },
    );

  if (shouldUpdateProvider) {
    chatFacadeRef.current.setProvider(provider);
    chatFacadeRef.current.setModelId(modelId);
    chatFacadeRef.current.updateTransport();
  }

  const subscribeToMessages = useCallback((onChange: () => void) => {
    const subscription = chatFacadeRef.current
      .getUiMessages$()
      .subscribe(onChange);
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const uiMessages = useSyncExternalStore(
    subscribeToMessages,
    () => chatFacadeRef.current.getUiMessages() ?? EMPTY_MESSAGES,
    () => chatFacadeRef.current.getUiMessages() ?? EMPTY_MESSAGES,
  );

  const subscribeToStatus = useCallback((onChange: () => void) => {
    const subscription = chatFacadeRef.current.getStatus$().subscribe(onChange);
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const status = useSyncExternalStore(
    subscribeToStatus,
    () => chatFacadeRef.current.getStatus() ?? 'error',
    () => chatFacadeRef.current.getStatus() ?? 'error',
  );

  const stop = () => {
    chatFacadeRef.current.stop();
  };

  const sendMessage = (message: UI_MESSAGE & { role: 'user' }) => {
    return chatFacadeRef.current.sendMessage(message);
  };

  return {
    uiMessages,
    status,
    stop,
    sendMessage,
  };
};

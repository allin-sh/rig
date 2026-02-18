'use client';

import { generateUIMessage } from '@allin/ai';
import type { UIMessageMetadata } from '@allin/message-metadata-schema';
import type { ChatStatus, UIMessage } from 'ai';
import { useCallback, useSyncExternalStore } from 'react';
import type { ChatFacade } from './facade';

const EMPTY_MESSAGES: UIMessage<UIMessageMetadata>[] = [];

export function useChat(chatFacade: ChatFacade | null) {
  const subscribeToMessages = useCallback(
    (onChange: () => void) => {
      if (!chatFacade) return () => {};
      const subscription = chatFacade.getUiMessages$().subscribe(onChange);
      return () => {
        subscription.unsubscribe();
      };
    },
    [chatFacade],
  );

  const uiMessages = useSyncExternalStore(
    subscribeToMessages,
    () => chatFacade?.getUiMessages() ?? EMPTY_MESSAGES,
    () => chatFacade?.getUiMessages() ?? EMPTY_MESSAGES,
  );

  const subscribeToStatus = useCallback(
    (onChange: () => void) => {
      if (!chatFacade) return () => {};
      const subscription = chatFacade.getStatus$().subscribe(onChange);
      return () => {
        subscription.unsubscribe();
      };
    },
    [chatFacade],
  );

  const status: ChatStatus = useSyncExternalStore(
    subscribeToStatus,
    () => chatFacade?.getStatus() ?? 'ready',
    () => chatFacade?.getStatus() ?? 'ready',
  );

  const stop = useCallback(() => {
    if (!chatFacade) return;
    chatFacade.stop().catch(err => {
      console.error('stop failed:', err);
    });
  }, [chatFacade]);

  const sendText = useCallback(
    (text: string) => {
      if (!chatFacade) {
        throw new Error('ChatFacade is not ready');
      }

      const msg = generateUIMessage(
        'user',
        text,
      ) as UIMessage<UIMessageMetadata> & {
        role: 'user';
      };
      return chatFacade.sendMessage(msg);
    },
    [chatFacade],
  );

  return {
    uiMessages,
    status,
    stop,
    sendText,
  };
}

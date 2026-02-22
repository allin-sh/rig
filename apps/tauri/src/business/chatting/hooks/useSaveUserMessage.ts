import { useEffect } from 'react';
import { messageGateway } from '@/lib/gateway/message/messageGateway';
import type { ChatFacade } from '../facade';

export const useSaveUserMessage = (chatFacade: ChatFacade | null) => {
  useEffect(() => {
    if (!chatFacade) return;

    const subscription = chatFacade.beforeMessageSend$().subscribe(uMessage => {
      messageGateway.upsert(chatFacade.getId(), uMessage);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [chatFacade]);

  useEffect(() => {
    if (!chatFacade) return;

    const subscription = chatFacade.finish$.subscribe(({ message }) => {
      messageGateway.upsert(chatFacade.getId(), message);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [chatFacade]);
};

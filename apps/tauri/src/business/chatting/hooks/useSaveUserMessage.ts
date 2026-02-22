import { useEffect } from 'react';
import { useService } from '@/business/ServiceContext';
import { messageGateway } from '@/lib/gateway/message/messageGateway';
import type { ChatFacade } from '../facade';

export const useSaveUserMessage = (chatFacade: ChatFacade | null) => {
  const { channelManager } = useService();

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
      channelManager.touchChannel(chatFacade.getId());
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [chatFacade, channelManager]);
};

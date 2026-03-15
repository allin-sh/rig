import { isUserMessage } from '@allin/ai';
import { useEffect } from 'react';
import { PendingMessage } from '../channel/PendingMessage';
import type { ChatFacade } from '../facade/ChatFacade';

export const usePendingMessageProcess = (chatFacade: ChatFacade | null) => {
  useEffect(() => {
    if (!chatFacade) return;

    const pendingMessage = PendingMessage.get(chatFacade.getId());
    if (pendingMessage && isUserMessage(pendingMessage)) {
      chatFacade.sendMessage(pendingMessage);
      PendingMessage.clear(chatFacade.getId());
    }
  }, [chatFacade]);
};

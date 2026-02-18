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

    const subscription = chatFacade.finish$.subscribe(
      ({ message, isAbort, isDisconnect, isError }) => {
        const metadata = {
          ...(message.metadata ?? {}),
          provider: chatFacade.providerId,
          modelId: chatFacade.modelId,
          isAborted: isAbort || undefined,
          isDisconnected: isDisconnect || undefined,
          isError: isError || undefined,
          errorMessage: isError ? chatFacade.getError()?.message : undefined,
        };

        messageGateway.upsert(chatFacade.getId(), {
          ...message,
          metadata,
        });
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [chatFacade]);
};

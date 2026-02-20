import { Kbd, toast } from '@allin/ui';
import { useCallback, useMemo } from 'react';
import { match } from 'ts-pattern';
import { useAgent } from '@/business/agent/useAgent';
import type { StorageChannel } from '@/lib/gateway/channel/types';
import { EnergyBar } from '../EnergyBar';
import { useChatFacadeCreation } from '../facade/useChatFacade';
import { usePendingMessageProcess } from '../hooks/usePendingMessageProcess';
import { useSaveUserMessage } from '../hooks/useSaveUserMessage';
import { useSyncTransport } from '../hooks/useSyncTransport';
import { ChatInputView } from '../input/ChatInputView';
import { AssistantMessage } from '../message-ui/AssistantMessage';
import { UserMessage } from '../message-ui/UserMessage';
import { useChat } from '../useChat';

export const ChannelChatView = ({ channel }: { channel: StorageChannel }) => {
  const { chatFacade } = useChatFacadeCreation(channel);

  usePendingMessageProcess(chatFacade);
  useSyncTransport(chatFacade);
  useSaveUserMessage(chatFacade);

  const { uiMessages, status, sendText, stop } = useChat(chatFacade);
  const isStreaming = status === 'streaming' || status === 'submitted';

  const visibleMessages = useMemo(
    () => uiMessages.filter(m => m.role !== 'system'),
    [uiMessages],
  );

  // TODO: implement regenerate in useChat
  const regenerate = useCallback((_messageId: string) => {}, []);

  return (
    <div className='h-dvh w-full flex flex-col bg-background'>
      <input type='text' />
      <div className='flex-1 overflow-y-auto px-4 py-6'>
        <div className='mx-auto max-w-3xl'>
          {visibleMessages.map((msg, index) =>
            match(msg.role)
              .with('user', () => <UserMessage key={msg.id} message={msg} />)
              .with('assistant', () => (
                <AssistantMessage
                  key={msg.id}
                  message={msg}
                  isLast={index === visibleMessages.length - 1}
                  status={status}
                  regenerate={regenerate}
                />
              ))
              .otherwise(() => null),
          )}
        </div>
      </div>

      <div className='border-t bg-background/80 backdrop-blur px-4 py-3'>
        <div className='mx-auto max-w-3xl flex flex-col gap-2'>
          <div className='flex items-center gap-2'>
            <div className='w-36'>{isStreaming && <EnergyBar />}</div>
            {isStreaming && (
              <span className='flex items-center gap-1 text-xs'>
                <Kbd>esc</Kbd>
                <span className='text-muted-foreground/40'>stop</span>
              </span>
            )}
          </div>
          <ChatInputView
            disabled={isStreaming}
            isStreaming={isStreaming}
            onStop={() => {
              stop();
              toast.warning('Message cancelled', {
                closeButton: true,
                position: 'top-right',
              });
            }}
            onSubmitText={async text => {
              await sendText(text);
            }}
          />
        </div>
      </div>
    </div>
  );
};

import { generateUIMessage } from '@allin/ai';
import { useState } from 'react';
import { PendingMessage } from '../channel/PendingMessage';
import { useChannel } from '../channel/useChannel';
import { ChatInputView } from '../input/ChatInputView';

export const NewChatView = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { createNewChannel, selectChannel, fetchChannels } = useChannel();

  const onSubmit = async (text: string) => {
    setIsCreating(true);

    const channel = await createNewChannel();
    await fetchChannels();
    await selectChannel(channel.id);
    PendingMessage.set(channel.id, generateUIMessage('user', text));
  };

  return (
    <div className='h-dvh w-full flex flex-col bg-background'>
      <div className='flex-1 flex items-center justify-center'>
        <div className='text-center text-muted-foreground'>
          <p className='text-lg font-medium'>New Chat</p>
          <p className='text-sm'>Send a message to start a conversation</p>
        </div>
      </div>

      <div className='border-t bg-background/80 backdrop-blur px-4 py-3'>
        <div className='mx-auto max-w-3xl'>
          <ChatInputView
            disabled={isCreating}
            isStreaming={false}
            onStop={() => {}}
            onSubmitText={onSubmit}
          />
        </div>
      </div>
    </div>
  );
};

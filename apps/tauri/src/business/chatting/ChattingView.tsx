'use client';

import { useChannel } from './channel/useChannel';
import { useChannelInit } from './hooks/useChannelInit';
import { ChannelChatView } from './view/ChannelChatView';
import { NewChatView } from './view/NewChatView';

export function ChattingView() {
  const { isLoading, error: channelError } = useChannelInit();
  const { selectedChannel } = useChannel();

  if (isLoading) {
    return <div className='p-4 text-muted-foreground'>Loading...</div>;
  }

  if (channelError) {
    return (
      <div className='p-4 text-red-600'>Error: {channelError.message}</div>
    );
  }

  if (!selectedChannel) {
    return <NewChatView />;
  }

  return <ChannelChatView channel={selectedChannel} />;
}

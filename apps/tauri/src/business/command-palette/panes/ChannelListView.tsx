'use client';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@allin/ui';
import { MessageSquare, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useCommandPalette } from '@/business/command-palette/useCommandPalette';
import { useService } from '@/business/ServiceContext';

export const ChannelListView = () => {
  const { channelManager } = useService();
  const { close } = useCommandPalette();
  const [value, setValue] = useState('');
  const selectedChannelId = channelManager.selectedChannelId;
  const allChannels = useMemo(() => {
    return channelManager.channels;
  }, [channelManager]);

  const sortSelectedFirst = useCallback(
    (channels: typeof allChannels) => {
      if (!selectedChannelId) return channels;
      return [...channels].sort((a, b) => {
        if (a.id === selectedChannelId) return -1;
        if (b.id === selectedChannelId) return 1;
        return 0;
      });
    },
    [selectedChannelId],
  );

  const channels_pinned = useMemo(
    () => sortSelectedFirst(allChannels.filter(c => c.pin)),
    [allChannels, sortSelectedFirst],
  );
  const channels_normal = useMemo(
    () => sortSelectedFirst(allChannels.filter(c => !c.pin)),
    [allChannels, sortSelectedFirst],
  );

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      close();
      setValue('');
    }
  };

  const handleSelectChannel = (channelId: string) => {
    channelManager.selectChannel(channelId);
    close();
  };

  const handleNewChat = () => {
    channelManager.clearSelectedChannel();
    close();
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <CommandDialog
      open
      onOpenChange={handleOpenChange}
      value={value}
      onValueChange={setValue}
    >
      <CommandInput placeholder='Search channels...' />
      <CommandEmpty>No channels found.</CommandEmpty>
      <CommandList className='max-h-[min(600px,80dvh)]'>
        {channels_pinned.length > 0 && (
          <CommandGroup
            heading={
              <span className='text-amber-500 font-semibold'>Pinned</span>
            }
          >
            {channels_pinned.map(channel => (
              <CommandItem
                key={channel.id}
                value={channel.id}
                onSelect={() => handleSelectChannel(channel.id)}
              >
                <MessageSquare className='size-4' />
                <div className='flex flex-1 items-center justify-between min-w-0'>
                  <span className='truncate'>
                    {channel.title || 'Untitled'}
                  </span>
                  <div className='flex items-center gap-2 ml-2 shrink-0'>
                    {channel.id === selectedChannelId && (
                      <span className='rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-medium text-white'>
                        Current
                      </span>
                    )}
                    <span className='text-xs text-muted-foreground'>
                      {formatDate(channel.updatedAt)}
                    </span>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {channels_normal.length > 0 && (
          <CommandGroup
            heading={
              <span className='text-blue-500 font-semibold'>Recent</span>
            }
          >
            {channels_normal.map(channel => (
              <CommandItem
                key={channel.id}
                value={channel.id}
                onSelect={() => handleSelectChannel(channel.id)}
              >
                <MessageSquare className='size-4' />
                <div className='flex flex-1 items-center justify-between min-w-0'>
                  <span className='truncate'>
                    {channel.title || 'Untitled'}
                  </span>
                  <div className='flex items-center gap-2 ml-2 shrink-0'>
                    {channel.id === selectedChannelId && (
                      <span className='rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-medium text-white'>
                        Current
                      </span>
                    )}
                    <span className='text-xs text-muted-foreground'>
                      {formatDate(channel.updatedAt)}
                    </span>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
};

import { sortBy } from 'es-toolkit';
import { useSetAtom } from 'jotai';
import type z from 'zod';
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useSwrAtomValue } from '@/hooks/use-swr-atom-value';
import type { ChannelSchema } from '@/idb/db';
import { dbAtoms } from '@/idb/db-store';
import { assert } from '@/utils/assert';

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const ChannelList = () => {
  const allChannels = useSwrAtomValue(dbAtoms.allChannelsAtom);
  const selectedChannel = useSwrAtomValue(dbAtoms.selectedChannelAtom);
  const setSelectedChannelId = useSetAtom(dbAtoms.selectedChannelIdAtom);

  assert(allChannels, 'ChannelList: allChannels is not found.');
  assert(selectedChannel, 'ChannelList: selectedChannel is not found.');

  const onClick = (channelId: string) => {
    if (selectedChannel.id === channelId) return;

    setSelectedChannelId(channelId);
  };

  const isGhostChannel = (channel: z.infer<typeof ChannelSchema>) => {
    return (
      channel.isEmpty && !channel.title && channel.id !== selectedChannel.id
    );
  };

  return (
    <>
      <SidebarHeader>
        <div className='w-full h-[24px]'></div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>My Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            {sortBy(
              allChannels.filter(channel => !isGhostChannel(channel)),
              [channel => -channel.updatedAt],
            ).map(channel => {
              return (
                <SidebarMenuItem key={channel.id}>
                  <SidebarMenuButton
                    isActive={selectedChannel.id === channel.id}
                    onClick={() => onClick(channel.id)}
                  >
                    <span className='truncate'>
                      {channel.title ??
                        `Untitled ${formatDate(channel.createdAt)}`}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
};

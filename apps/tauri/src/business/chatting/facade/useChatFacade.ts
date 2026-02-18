import { useQuery } from '@tanstack/react-query';
import type { StorageChannel } from '@/lib/gateway/channel/types';
import { ChatFacadeManager } from './ChatFacadeManager';

export const useChatFacadeCreation = (channel: StorageChannel) => {
  const { data: chatFacade, error } = useQuery({
    queryKey: ['chatFacade', channel.id],
    queryFn: () => ChatFacadeManager.getInstance().getOrCreate(channel),
    staleTime: 60 * 1000 * 60 * 10, // 10 hour
  });

  return { chatFacade: chatFacade ?? null, error: error ?? null };
};

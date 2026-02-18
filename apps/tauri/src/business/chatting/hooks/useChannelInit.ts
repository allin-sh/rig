import { useEffect, useState } from 'react';
import { ChannelManager } from '../channel/ChannelManager';

export const useChannelInit = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    ChannelManager.getInstance()
      .fetchChannels()
      .catch(e => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setIsLoading(false));
  }, []);

  return { isLoading, error };
};

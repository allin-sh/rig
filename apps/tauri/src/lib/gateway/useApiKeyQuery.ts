import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProviderId } from '@/business/command-palette/panes/ProviderConfigCommandView';
import { apiKeyGateway } from './apiKeyGateway';

const PROVIDERS: readonly ProviderId[] = [
  'openai',
  'google',
  'anthropic',
] as const;

const apiKeyKeys = {
  all: ['apiKey'] as const,
  has: (id: ProviderId) => ['apiKey', 'has', id] as const,
};

export const useHasApiKeys = () =>
  useQuery({
    queryKey: apiKeyKeys.all,
    queryFn: async () => {
      const entries = await Promise.all(
        PROVIDERS.map(async id => [id, await apiKeyGateway.has(id)] as const),
      );
      return Object.fromEntries(entries) as Record<ProviderId, boolean>;
    },
  });

export const useSaveApiKey = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      providerName,
      apiKey,
    }: {
      providerName: ProviderId;
      apiKey: string;
    }) => apiKeyGateway.save(providerName, apiKey),
    onSuccess: () => qc.invalidateQueries({ queryKey: apiKeyKeys.all }),
  });
};

export const useDeleteApiKey = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (providerName: ProviderId) =>
      apiKeyGateway.delete(providerName),
    onSuccess: () => qc.invalidateQueries({ queryKey: apiKeyKeys.all }),
  });
};

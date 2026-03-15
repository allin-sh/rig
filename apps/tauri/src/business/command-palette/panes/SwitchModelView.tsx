'use client';

import {
  type AllModelIds,
  MODEL_IDS_PER_PROVIDER,
  type ProviderId,
  ProviderIdSchema,
} from '@allin/ai';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  CommandDialog,
  CommandInput,
  CommandList,
  toast,
} from '@allin/ui';
import { useMemo, useState } from 'react';
import { useAgent } from '@/business/agent/useAgent';
import { useCommandPalette } from '@/business/command-palette/useCommandPalette';
import { getProviderIcon } from '@/business/logo/ProviderIconMap';
import { useApiKey } from '@/lib/gateway/api-key/useApiKeyQuery';
import { useCodexAuth } from '@/lib/gateway/codex-auth/useCodexAuth';

const PROVIDERS = ProviderIdSchema.options;

export const SwitchModelView = () => {
  const { close, navigate } = useCommandPalette();
  const [value, setValue] = useState('');
  const [search, setSearch] = useState('');
  const { selectedAgent, updateAgent } = useAgent();
  const [expandedItems, setExpandedItems] = useState<string[]>(() =>
    selectedAgent?.providerName ? [selectedAgent.providerName] : [],
  );
  const { apiKeyStatus } = useApiKey();
  const { isConnected: codexConnected } = useCodexAuth();

  const isProviderConnected = (providerId: ProviderId): boolean =>
    providerId === 'codex' ? !!codexConnected : !!apiKeyStatus?.[providerId];

  const sortedProviders = useMemo(() => {
    return [...PROVIDERS].sort((a, b) => {
      const aConnected = (a === 'codex' ? codexConnected : apiKeyStatus?.[a])
        ? 1
        : 0;
      const bConnected = (b === 'codex' ? codexConnected : apiKeyStatus?.[b])
        ? 1
        : 0;
      return bConnected - aConnected;
    });
  }, [apiKeyStatus, codexConnected]);

  const getFilteredModels = (providerId: ProviderId): AllModelIds[] => {
    const models = MODEL_IDS_PER_PROVIDER[providerId];
    if (!search) return [...models];
    const lowerSearch = search.toLowerCase();
    return models.filter(
      modelId =>
        modelId.toLowerCase().includes(lowerSearch) ||
        providerId.toLowerCase().includes(lowerSearch),
    );
  };

  const visibleProviders = sortedProviders.filter(
    providerId => getFilteredModels(providerId).length > 0,
  );

  const accordionValue = search ? visibleProviders : expandedItems;

  const handleAccordionChange = (newValue: string[]) => {
    if (!search) {
      setExpandedItems(newValue);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      close();
      setValue('');
      setSearch('');
    }
  };

  const changeModel = (providerId: ProviderId, modelId: AllModelIds) => {
    if (!isProviderConnected(providerId)) {
      toast.error(`Connect ${providerId} provider first to use this model`, {
        position: 'top-center',
        action: {
          label: 'Connect Provider',
          onClick: () => navigate('providers'),
        },
      });
      return;
    }

    if (selectedAgent?.id) {
      updateAgent(selectedAgent.id, {
        model: modelId,
        providerName: providerId,
      });
      toast.success(`Switched to ${modelId}`, { position: 'top-center' });
    }
    close();
  };

  return (
    <CommandDialog
      open
      onOpenChange={handleOpenChange}
      value={value}
      onValueChange={setValue}
    >
      <CommandInput placeholder='Search models...' onValueChange={setSearch} />
      <CommandList className='max-h-[min(600px,80dvh)] min-h-[500px]'>
        {visibleProviders.length === 0 ? (
          <div className='py-6 text-center text-sm'>No models found.</div>
        ) : (
          <Accordion
            type='multiple'
            value={accordionValue}
            onValueChange={handleAccordionChange}
          >
            {visibleProviders.map(providerId => (
              <AccordionItem
                key={providerId}
                value={providerId}
                className='px-2'
              >
                <AccordionTrigger className='py-2'>
                  <div className='flex items-center gap-1.5 text-md'>
                    {getProviderIcon(providerId, 'size-4')}
                    <span className=' capitalize hover:no-underline'>
                      {providerId}
                    </span>
                    {isProviderConnected(providerId) && (
                      <span className='text-green-500 text-xs'>Connected</span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className='pb-2'>
                  <div className='flex flex-col gap-0.5'>
                    {getFilteredModels(providerId).map(modelId => {
                      const isCurrentModel =
                        selectedAgent?.providerName === providerId &&
                        selectedAgent?.model === modelId;
                      return (
                        <button
                          key={modelId}
                          type='button'
                          onClick={() => changeModel(providerId, modelId)}
                          className='w-full flex items-center justify-between py-1.5 px-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-default select-none'
                        >
                          <span>{modelId}</span>
                          {isCurrentModel && (
                            <span className='rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-medium text-white'>
                              Current
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CommandList>
    </CommandDialog>
  );
};

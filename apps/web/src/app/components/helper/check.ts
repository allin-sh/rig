import { match } from 'ts-pattern';
import type z from 'zod';
import type { LLMProviderName } from '@/core/provider/all-models';
import type { ConfigSchema } from '@/idb/db';

/**
 * @example
 * canUseProvider('openai', config) => true // when openai api key is set
 * canUseProvider('google', config) => false // when google api key is not set
 */
export const canUseProvider = (
  providerName: LLMProviderName,
  config: z.infer<typeof ConfigSchema>,
) => {
  return match(providerName)
    .with('google', () => !!config.apiKeys.google)
    .with('openai', () => !!config.apiKeys.openai)
    .exhaustive();
};

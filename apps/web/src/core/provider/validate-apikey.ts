import { match } from 'ts-pattern';
import type { LLMProviderName } from './all-models';
import { GoogleLLMProvider } from './google/GoogleProvider';
import { OpenAiProvider } from './openai/OpenAiProvider';

export interface ValidateApiKeyParams {
  apiKey: string;
  providerName: LLMProviderName;
}

export const validateApiKey = async ({
  apiKey,
  providerName,
}: ValidateApiKeyParams): Promise<boolean> => {
  if (!apiKey) return false;

  return match(providerName)
    .with('openai', () => OpenAiProvider.validateConnection(apiKey))
    .with('google', () => GoogleLLMProvider.validateConnection(apiKey))
    .exhaustive();
};

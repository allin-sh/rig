import { match } from 'ts-pattern';
import type { LLMProviderName } from './all-models';
import { GoogleLLMProvider } from './google/GoogleLLMProvider';
import { OpenAILLMProvider } from './openai/OpenAILLMProvider';

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
    .with('openai', () => OpenAILLMProvider.validateConnection(apiKey))
    .with('google', () => GoogleLLMProvider.validateConnection(apiKey))
    .exhaustive();
};

import { v4 } from 'uuid';
import type { StorageAgent } from '../types';

export const createMockAgent = ({
  id = v4(),
  name,
  providerId,
  modelId,
  prompt,
}: {
  id?: string;
  name: string;
  providerId: string;
  modelId: string;
  prompt?: string;
}): StorageAgent => {
  return {
    id,
    name,
    providerName: providerId,
    model: modelId,
    prompt: prompt ?? null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

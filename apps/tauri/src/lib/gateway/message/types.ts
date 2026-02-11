import type { UIMessageMetadata } from '@allin/message-metadata-schema';

export type StorageMessage = {
  id: string;
  role: string;
  parts: unknown[];
  metadata?: UIMessageMetadata;
  createdAt: number;
  isSummary?: boolean;
  compactedAt?: number;
};

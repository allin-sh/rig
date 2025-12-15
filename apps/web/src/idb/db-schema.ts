import type { UIMessage } from 'ai';
import type { DBSchema } from 'idb';
import z from 'zod';

// ** Channel Schema ** //
export const ReasoningEffortSchema = z
  .enum(['none', 'low', 'medium', 'high'])
  .describe('Reasoning effort')
  .default('low');
export const ReasoningSummarySchema = z
  .boolean()
  .describe('Whether to include reasoning summary')
  .default(false);
export const ChannelSchema = z.object({
  id: z.string(),
  /**
   * @description model id.
   * @example 'gpt-5.1'
   */
  model: z.string().describe('selected AI model'),
  providerName: z.string().describe('selected AI provider'),
  reasoningEffort: ReasoningEffortSchema,
  reasoningSummary: ReasoningSummarySchema,
  createdAt: z.number().min(0).describe('Timestamp of creation'),
  updatedAt: z.number().min(0).describe('Timestamp of last update'),
  title: z.string().optional().describe('Channel title'),
  description: z.string().optional().describe('Channel description'),
  prompt: z.string().optional().describe('AI system prompt'),
  isEmpty: z
    .boolean()
    .default(true)
    .describe(
      'Whether the channel is empty. If true, it means the channel has no messages.',
    ),
  pin: z
    .object({
      order: z.number().min(0).describe('Pin order of the channel'),
      createdAt: z.number().min(0).describe('Timestamp of pinning'),
    })
    .optional()
    .describe('Pinned status of the channel'),
});

// ** Config Schema ** //
export const ConfigSchema = z.object({
  lastSelectedChannelId: z.string().optional(),
  apiKeys: z.record(z.string(), z.string()),
});
export const DB_CONFIG_KEY = 'userConfig';

// ** Message Schema ** //
export type DB_MESSAGE = UIMessage & { channelId: string };

// ** DB Schema ** //
export const DB_NAME = 'ALLIN';
export enum DB_STORE {
  CHANNELS = 'channels',
  MESSAGES = 'messages',
  CONFIG = 'config',
}

export interface ALLIN_DB extends DBSchema {
  [DB_STORE.CHANNELS]: {
    key: string;
    value: z.infer<typeof ChannelSchema>;
  };
  [DB_STORE.MESSAGES]: {
    key: string;
    value: DB_MESSAGE;
    indexes: { channelId: string };
  };
  [DB_STORE.CONFIG]: {
    key: typeof DB_CONFIG_KEY;
    value: z.infer<typeof ConfigSchema>;
  };
}

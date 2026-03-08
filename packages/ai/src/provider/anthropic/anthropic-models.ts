import { z } from 'zod/v3';

// https://github.com/vercel/ai/blob/main/packages/anthropic/src/anthropic-messages-options.ts#L17
export const AnthropicModelIdSchema = z.enum([
  'claude-opus-4-5',
  'claude-sonnet-4-5',
  'claude-sonnet-4-6',
  'claude-opus-4-6',
]);

export type AnthropicModelId = z.infer<typeof AnthropicModelIdSchema>;
export const ANTHROPIC_MODELS = AnthropicModelIdSchema.options;

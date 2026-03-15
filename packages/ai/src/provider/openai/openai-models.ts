import { z } from 'zod/v3';

// https://github.com/vercel/ai/blob/a921fbb381cf2d19ef75ae27906f8d1cb0b8325b/packages/openai/src/chat/openai-chat-options.ts#L54
export const OpenAiModelIdSchema = z.enum([
  'gpt-5-mini',
  'gpt-5-nano',
  'gpt-5.1',
  'gpt-5.2',
  'gpt-5.2-pro',
  'gpt-5.4',
  'gpt-5.4-pro',
]);

export type OpenAiModelId = z.infer<typeof OpenAiModelIdSchema>;

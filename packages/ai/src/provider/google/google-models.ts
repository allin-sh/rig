import { z } from 'zod/v3';

// https://github.com/vercel/ai/blob/a921fbb381cf2d19ef75ae27906f8d1cb0b8325b/packages/google/src/google-generative-ai-options.ts#L33
export const GoogleAiModelIdSchema = z.enum([
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-3-pro-preview',
  'gemini-3-flash-preview',
  'gemini-3.1-pro-preview',
]);

export type GoogleAiModelId = z.infer<typeof GoogleAiModelIdSchema>;

import { z } from 'zod/v3';

// https://github.com/anomalyco/opencode/blob/dev/packages/opencode/src/plugin/codex.ts#L361
export const CodexModelIdSchema = z.enum([
  'gpt-5.1-codex-max',
  'gpt-5.1-codex-mini',
  'gpt-5.2',
  'gpt-5.4',
  'gpt-5.2-codex',
  'gpt-5.3-codex',
  'gpt-5.1-codex',
]);

export type CodexModelId = z.infer<typeof CodexModelIdSchema>;

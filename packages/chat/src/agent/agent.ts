import type { LanguageModelV3 } from '@ai-sdk/provider';
import {
  convertToModelMessages,
  generateText,
  type ModelMessage,
  Output,
  type UIMessage,
} from 'ai';
import type { z } from 'zod/v3';

export namespace Agent {
  export async function generate<T>({
    system,
    description,
    model,
    messages,
    schema,
  }: {
    system?: string[];
    description: string;
    messages?: UIMessage[];
    model: LanguageModelV3;
    schema?: z.ZodSchema<T>;
  }) {
    const outputSchema = schema ? Output.object({ schema }) : undefined;

    const { output } = await generateText({
      temperature: 0.3,
      model: model,
      messages: [
        ...(system ?? []).map(
          (item): ModelMessage => ({
            role: 'system',
            content: item,
          }),
        ),
        ...(messages ? await convertToModelMessages(messages) : []),
        {
          role: 'user',
          content: `${description}. ${outputSchema ? 'Return ONLY the JSON object, no other text, do not wrap in backticks' : ''}`,
        },
      ],
      output: outputSchema,
    });

    return output;
  }
}

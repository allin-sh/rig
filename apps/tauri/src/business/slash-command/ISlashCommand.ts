import { z } from 'zod';

export const commandNameSchema = z
  .string()
  .min(1, 'Must not be empty')
  .refine(s => s === s.toLowerCase(), 'Must be lowercase')
  .refine(s => !s.includes(' '), 'Must not contain spaces')
  .refine(
    s => !s.startsWith('-') && !s.endsWith('-'),
    'Must not start/end with hyphen',
  );

interface BaseCommand {
  id: string;
  commandName: string;
  description: string;
}

export type SlashCommandContext = {
  currentInput: string;
  setInput: (value: string) => void;
  close: () => void;
} & {
  openNewChat(): void;
};

export abstract class ActionCommand implements BaseCommand {
  public readonly mode = 'action';

  public abstract id: string;
  public abstract commandName: string;
  public abstract description: string;
  public abstract execute(ctx: SlashCommandContext): void | Promise<void>;
}

export abstract class TemplateCommand implements BaseCommand {
  public readonly mode = 'template';

  public abstract id: string;
  public abstract commandName: string;
  public abstract description: string;
  public abstract template: string;
  public abstract hints?: string[];

  public toPrompt(args: string, hintSelection?: string): string {
    let resolved = this.template;

    if (hintSelection) {
      resolved = resolved.replace('$HINT', hintSelection);
    }

    return resolved.replace('$INPUT', args);
  }
}

export type SlashCommand = ActionCommand | TemplateCommand;

import { afterEach, describe, expect, it } from 'vitest';
import { TemplateCommand } from './ISlashCommand';
import { SlashCommandManager } from './SlashCommandManager';

class TestCommand extends TemplateCommand {
  public id: string;
  public commandName: string;
  public description: string;
  public template: string;
  public hints?: string[];

  constructor(props: {
    id: string;
    commandName: string;
    description: string;
    template: string;
  }) {
    super();
    this.id = props.id;
    this.commandName = props.commandName;
    this.description = props.description;
    this.template = props.template;
  }
}

const setup = () => {
  const manager = SlashCommandManager.getInstance();
  for (const cmd of manager.getCommands()) {
    manager.unregisterCommand(cmd.id);
  }
  return manager;
};

describe('SlashCommandManager', () => {
  afterEach(() => {
    const manager = SlashCommandManager.getInstance();
    for (const cmd of manager.getCommands()) {
      manager.unregisterCommand(cmd.id);
    }
  });

  describe('findCommandByName', () => {
    it('returns command with exact name match', () => {
      const manager = setup();
      const command = new TestCommand({
        id: 'cmd-1',
        commandName: 'translate',
        description: 'Translate text',
        template: '$INPUT',
      });
      manager.registerCommand(command);

      const result = manager.findCommandByName('translate');

      expect(result).toBe(command);
    });

    it('returns command with case-insensitive search', () => {
      const manager = setup();
      const command = new TestCommand({
        id: 'cmd-2',
        commandName: 'translate',
        description: 'Translate text',
        template: '$INPUT',
      });
      manager.registerCommand(command);

      const result = manager.findCommandByName('TRANSLATE');

      expect(result).toBe(command);
    });

    it('returns undefined for nonexistent command', () => {
      const manager = setup();
      const command = new TestCommand({
        id: 'cmd-3',
        commandName: 'translate',
        description: 'Translate text',
        template: '$INPUT',
      });
      manager.registerCommand(command);

      const result = manager.findCommandByName('nonexistent');

      expect(result).toBeUndefined();
    });

    it('returns first matching command when multiple exist', () => {
      const manager = setup();
      const command1 = new TestCommand({
        id: 'cmd-4',
        commandName: 'translate',
        description: 'First translate',
        template: '$INPUT',
      });
      const command2 = new TestCommand({
        id: 'cmd-5',
        commandName: 'summary',
        description: 'Summary text',
        template: '$INPUT',
      });
      manager.registerCommand(command1);
      manager.registerCommand(command2);

      const result = manager.findCommandByName('translate');

      expect(result).toBe(command1);
    });

    it('returns undefined when no commands registered', () => {
      const manager = setup();

      const result = manager.findCommandByName('translate');

      expect(result).toBeUndefined();
    });
  });
});

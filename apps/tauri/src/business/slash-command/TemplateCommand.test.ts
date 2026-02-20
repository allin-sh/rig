import { describe, expect, it } from 'vitest';
import { TemplateCommand } from './ISlashCommand';

class TestCommand extends TemplateCommand {
  public id: string;
  public commandName: string;
  public description: string;
  public template: string;
  public hints?: string[];

  constructor(template: string) {
    super();
    this.id = 'test';
    this.commandName = 'Test';
    this.description = 'Test command';
    this.template = template;
  }
}

describe('TemplateCommand.toPrompt', () => {
  it('replaces $INPUT with provided args', () => {
    const command = new TestCommand('Do: $INPUT');

    expect(command.toPrompt('hello')).toBe('Do: hello');
  });

  it('replaces both $INPUT and $HINT when hintSelection is provided', () => {
    const command = new TestCommand('To $HINT:\n\n$INPUT');

    expect(command.toPrompt('hello world', 'Korean')).toBe(
      'To Korean:\n\nhello world',
    );
  });

  it('leaves $HINT unreplaced when hintSelection is not provided', () => {
    const command = new TestCommand('To $HINT:\n\n$INPUT');

    expect(command.toPrompt('hello world')).toBe('To $HINT:\n\nhello world');
  });

  it('replaces only first $INPUT placeholder', () => {
    const command = new TestCommand('$INPUT and $INPUT');

    expect(command.toPrompt('test')).toBe('test and $INPUT');
  });

  it('handles empty args', () => {
    const command = new TestCommand('Result: $INPUT');

    expect(command.toPrompt('')).toBe('Result: ');
  });

  it('handles template with no placeholders', () => {
    const command = new TestCommand('Static text');

    expect(command.toPrompt('ignored')).toBe('Static text');
  });
});

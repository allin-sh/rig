import { describe, expect, it } from 'vitest';
import { renderHookWithServices } from '@/test-utils/renderWithServices';
import { SlashCommandManager } from '../SlashCommandManager';
import { useSlashCommandSearch } from './useSlashCommandSearch';

const setup = () => {
  const manager = SlashCommandManager.getInstance();
  for (const cmd of manager.getCommands()) {
    manager.unregisterCommand(cmd.id);
  }

  manager.registerCommands([
    {
      id: '1',
      commandName: 'alpha',
      description: 'Alpha cmd',
      mode: 'action',
      execute: () => {},
    },
    {
      id: '2',
      commandName: 'ummpha',
      description: 'Ummpha cmd',
      mode: 'action',
      execute: () => {},
    },
    {
      id: '3',
      commandName: 'beta',
      description: 'Beta cmd',
      mode: 'template',
      template: '$INPUT',
      toPrompt: () => '',
    },
  ]);

  return manager;
};

describe('useSlashCommandSearch', () => {
  it('returns all commands when query is empty', () => {
    const manager = setup();
    const { result } = renderHookWithServices(() => useSlashCommandSearch(''), {
      slashCommandManager: manager,
    });

    expect(result.current).toEqual(manager.getCommands());
  });

  it('filters commands by fuzzy match on name', () => {
    const manager = setup();
    const { result } = renderHookWithServices(
      () => useSlashCommandSearch('al'),
      { slashCommandManager: manager },
    );

    expect(result.current.map(c => c.commandName)).toEqual(['alpha']);
  });

  it('returns multiple matches when query matches several names', () => {
    const manager = setup();
    const { result } = renderHookWithServices(
      () => useSlashCommandSearch('pha'),
      { slashCommandManager: manager },
    );

    const names = result.current.map(c => c.commandName);
    expect(names).toContain('alpha');
    expect(names).toContain('ummpha');
    expect(names).not.toContain('beta');
  });

  it('returns empty array when no command matches', () => {
    setup();
    const { result } = renderHookWithServices(() =>
      useSlashCommandSearch('zzz'),
    );

    expect(result.current).toEqual([]);
  });
});

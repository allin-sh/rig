'use client';

import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList,
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@allin/ui';
import { Fzf } from 'fzf';
import { useEffect, useMemo, useState } from 'react';
import type { Subject } from 'rxjs';
import { useService } from '@/business/ServiceContext';
import { useSlashCommandSearch } from '../hooks/useSlashCommandSearch';
import type { SlashCommand } from '../ISlashCommand';

type SlashCommandPopoverProps = {
  query: string;
  modifierKeyEvent$: Subject<'ArrowUp' | 'ArrowDown' | 'Enter'>;
  onSelect: (command: SlashCommand) => void;
  anchorRef: React.RefObject<HTMLTextAreaElement | null>;
};

export function SlashCommandPopover({
  query,
  onSelect,
  anchorRef,
  modifierKeyEvent$,
}: SlashCommandPopoverProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const filteredCommands = useSlashCommandSearch(query);

  useEffect(() => {
    const subscription = modifierKeyEvent$.subscribe(key => {
      if (key === 'ArrowUp') {
        setSelectedIndex(prev =>
          prev <= 0 ? filteredCommands.length - 1 : prev - 1,
        );
      }
      if (key === 'ArrowDown') {
        setSelectedIndex(prev =>
          prev >= filteredCommands.length - 1 ? 0 : prev + 1,
        );
      }
      if (key === 'Enter') {
        const selected = filteredCommands[selectedIndex];
        if (selected) {
          onSelect(selected);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [modifierKeyEvent$, filteredCommands, selectedIndex, onSelect]);

  return (
    <Popover open>
      <PopoverAnchor virtualRef={anchorRef as React.RefObject<HTMLElement>} />
      <PopoverContent
        className='w-[calc(680px)] p-0'
        align='start'
        side='top'
        sideOffset={8}
        onOpenAutoFocus={e => e.preventDefault()}
      >
        <Command
          shouldFilter={false}
          value={filteredCommands[selectedIndex]?.commandName}
          onValueChange={() => {}}
        >
          <CommandList>
            <CommandEmpty>No matches found.</CommandEmpty>
            {filteredCommands.map(command => (
              <CommandItem
                key={command.id}
                value={command.commandName}
                onSelect={() => onSelect(command)}
              >
                <span className='text-sm font-medium w-[160px]'>
                  {command.commandName}
                </span>
                <span className='text-xs text-muted-foreground'>
                  {command.description}
                </span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Selection Popover Renderer
 * Renders all registered popover items
 */

'use client';

import { Button, ButtonGroup } from '@allin/ui';
import { useAtomValue } from 'jotai';
import { popoverItemsAtom } from '../store/extension-store';

interface SelectionPopoverRendererProps {
  selectedText: string;
  onClose?: () => void;
}

export function SelectionPopoverRenderer({
  selectedText,
  onClose,
}: SelectionPopoverRendererProps) {
  const popoverItems = useAtomValue(popoverItemsAtom);

  if (popoverItems.size === 0) {
    return null;
  }

  return (
    <ButtonGroup>
      {Array.from(popoverItems.entries()).map(([id, Component]) => (
        <Button key={id} variant='outline' size='sm'>
          <Component
            close={onClose ?? (() => {})}
            selectedText={selectedText}
          />
        </Button>
      ))}
    </ButtonGroup>
  );
}

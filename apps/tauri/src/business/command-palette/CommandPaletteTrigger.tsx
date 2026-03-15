'use client';

import { Button, Kbd, KbdGroup } from '@allin/ui';
import { useAnimate } from 'motion/react';
import { useEffect } from 'react';
import { useHotKey } from '@/business/hotkey/useHotKey';
import { useService } from '@/business/ServiceContext';

export const CommandPaletteTrigger = () => {
  const { commandPaletteManager } = useService();
  const [scope, animate] = useAnimate<HTMLButtonElement>();
  const modK$ = useHotKey('mod+k');

  useEffect(() => {
    const sub = modK$.subscribe(() => {
      animate(scope.current, { scale: [0.68, 1] }, { type: 'spring' });
    });
    return () => sub.unsubscribe();
  }, [modK$, scope, animate]);

  return (
    <Button
      ref={scope}
      variant='ghost'
      size='sm'
      className='text-xs text-muted-foreground gap-1'
      onClick={() => commandPaletteManager.open('home')}
    >
      <KbdGroup>
        <Kbd>⌘ K</Kbd>
      </KbdGroup>
    </Button>
  );
};

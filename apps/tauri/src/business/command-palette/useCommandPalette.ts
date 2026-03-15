import { useCallback, useSyncExternalStore } from 'react';
import { useService } from '@/business/ServiceContext';
import type { CommandPaneId, CommandPanePropsMap } from './types';
export const useCommandPalette = () => {
  const { commandPaletteManager } = useService();

  const navigate = useCallback(
    <T extends CommandPaneId>(id: T, props?: CommandPanePropsMap[T]) => {
      commandPaletteManager.open(id, props);
    },
    [commandPaletteManager],
  );

  const close = useCallback(() => {
    commandPaletteManager.close();
  }, [commandPaletteManager]);

  const currentPane = useSyncExternalStore(
    (onChange: () => void) => {
      const subscription =
        commandPaletteManager.currentPane$.subscribe(onChange);
      return () => subscription.unsubscribe();
    },
    () => commandPaletteManager.getCurrentViewState(),
    () => commandPaletteManager.getCurrentViewState(),
  );

  return { currentPane, navigate, close };
};

/**
 * Extension Manager Hook
 * React hook to manage extensions in the app
 */

'use client';

import type { ExtensionAPI } from '@allin/extension-api';
import { ExtensionLoader } from '@allin/extension-api';
import { useSetAtom } from 'jotai';
import { useMemo } from 'react';
import {
  modalsActionsAtom,
  popoverItemsActionsAtom,
  sidebarPanelsActionsAtom,
} from '../store/extension-store';
import { createExtensionAPI } from './create-extension-api';

/**
 * Hook to create and manage extensions
 */
export function useExtensionManager() {
  const setPopoverItems = useSetAtom(popoverItemsActionsAtom);
  const setModals = useSetAtom(modalsActionsAtom);
  const setSidebarPanels = useSetAtom(sidebarPanelsActionsAtom);

  const extensionAPI = useMemo<ExtensionAPI>(
    () => createExtensionAPI(setPopoverItems, setModals, setSidebarPanels),
    [setPopoverItems, setModals, setSidebarPanels],
  );

  const loader = useMemo(
    () => new ExtensionLoader(extensionAPI),
    [extensionAPI],
  );

  return {
    extensionAPI,
    loader,
  };
}

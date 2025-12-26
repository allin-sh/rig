/**
 * Extension Store
 * Manages extension state using Jotai atoms
 */

import type {
  ModalContent,
  ModalOptions,
  PopoverItemComponent,
  SidebarPanel,
} from '@allin/extension-api';
import { atom } from 'jotai';

// Selection Popover Items
export const popoverItemsAtom = atom<Map<string, PopoverItemComponent>>(
  new Map(),
);

// Modal State
export interface ModalState {
  id: string;
  content: ModalContent;
  options?: ModalOptions;
}

export const modalsAtom = atom<ModalState[]>([]);

// Sidebar Panels
export interface SidebarPanelState {
  id: string;
  panel: SidebarPanel;
  isOpen: boolean;
}

export const sidebarPanelsAtom = atom<Map<string, SidebarPanelState>>(
  new Map(),
);

// Helper atoms with actions
export const popoverItemsActionsAtom = atom(
  get => get(popoverItemsAtom),
  (
    get,
    set,
    action: {
      type: 'add' | 'remove';
      id: string;
      component?: PopoverItemComponent;
    },
  ) => {
    const items = new Map(get(popoverItemsAtom));

    if (action.type === 'add' && action.component) {
      items.set(action.id, action.component);
    } else if (action.type === 'remove') {
      items.delete(action.id);
    }

    set(popoverItemsAtom, items);
  },
);

export const modalsActionsAtom = atom(
  get => get(modalsAtom),
  (
    get,
    set,
    action: {
      type: 'open' | 'close' | 'closeAll';
      modal?: ModalState;
      id?: string;
    },
  ) => {
    const modals = [...get(modalsAtom)];

    if (action.type === 'open' && action.modal) {
      modals.push(action.modal);
    } else if (action.type === 'close') {
      if (action.id) {
        const index = modals.findIndex(m => m.id === action.id);
        if (index !== -1) modals.splice(index, 1);
      } else {
        modals.pop();
      }
    } else if (action.type === 'closeAll') {
      modals.length = 0;
    }

    set(modalsAtom, modals);
  },
);

export const sidebarPanelsActionsAtom = atom(
  get => get(sidebarPanelsAtom),
  (
    get,
    set,
    action: {
      type: 'add' | 'remove' | 'open' | 'close' | 'toggle';
      id: string;
      panel?: SidebarPanel;
    },
  ) => {
    const panels = new Map(get(sidebarPanelsAtom));

    if (action.type === 'add' && action.panel) {
      panels.set(action.id, {
        id: action.id,
        panel: action.panel,
        isOpen: action.panel.options?.defaultOpen ?? false,
      });
    } else if (action.type === 'remove') {
      panels.delete(action.id);
    } else if (action.type === 'open') {
      const panel = panels.get(action.id);
      if (panel) {
        panels.set(action.id, { ...panel, isOpen: true });
      }
    } else if (action.type === 'close') {
      const panel = panels.get(action.id);
      if (panel) {
        panels.set(action.id, { ...panel, isOpen: false });
      }
    } else if (action.type === 'toggle') {
      const panel = panels.get(action.id);
      if (panel) {
        panels.set(action.id, { ...panel, isOpen: !panel.isOpen });
      }
    }

    set(sidebarPanelsAtom, panels);
  },
);

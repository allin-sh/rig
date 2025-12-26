/**
 * Extension System Exports
 */

// Components
export {
  ExtensionProvider,
  useExtensionAPI,
  useExtensionLoader,
} from './components/ExtensionProvider';
export { ModalRenderer } from './components/ModalRenderer';
export { SelectionPopoverRenderer } from './components/SelectionPopoverRenderer';
export { SidebarPanelRenderer } from './components/SidebarPanelRenderer';
// Types
export type { ModalState, SidebarPanelState } from './store/extension-store';
// Store
export {
  modalsAtom,
  popoverItemsAtom,
  sidebarPanelsAtom,
} from './store/extension-store';

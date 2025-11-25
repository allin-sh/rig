import { useAtom } from 'jotai';
import { AnimatePresence } from 'motion/react';
import { useHotkeys } from 'react-hotkeys-hook';
import { HotKeyList } from '../hotkey/hotkey-list';
import { Sidebar } from './Sidebar';
import { sideBarAtoms } from './sideBarStore';

export const SidebarRenderer = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useAtom(
    sideBarAtoms.isSidebarOpenAtom,
  );

  useHotkeys(HotKeyList.toggleSidebar.hotkey, () => {
    setIsSidebarOpen(prev => !prev);
  });

  return <AnimatePresence>{isSidebarOpen && <Sidebar />}</AnimatePresence>;
};

import { atom, useAtom } from 'jotai';

export type PaneType = 'content' | 'create-entry';

const paneTypeAtom = atom<PaneType>('content');

export const usePaneType = () => {
  const [paneType, setPaneType] = useAtom(paneTypeAtom);

  return { paneType, setPaneType };
};

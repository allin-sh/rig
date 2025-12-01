'use client';

import { Provider } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import type { ReactNode } from 'react';
import { leftPanelAtoms } from './left-panel/left-panel-store';

interface HydrateAtomProviderProps {
  children: ReactNode;
  leftPanelOpen?: boolean;
}

const HydrateAtoms = ({
  leftPanelOpen,
  children,
}: {
  leftPanelOpen?: boolean;
  children: ReactNode;
}) => {
  useHydrateAtoms([[leftPanelAtoms.isOpen, leftPanelOpen ?? false]]);
  return <>{children}</>;
};

export const HydrateAtomProvider = ({
  children,
  leftPanelOpen,
}: HydrateAtomProviderProps) => {
  return (
    <Provider>
      <HydrateAtoms leftPanelOpen={leftPanelOpen}>{children}</HydrateAtoms>
    </Provider>
  );
};

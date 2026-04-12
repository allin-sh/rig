import { createContext, useMemo, useState } from 'react';
import type { StorageConfigFile } from '@/lib/gateway/config-file/types';

export const SelectionContext = createContext<{
  selectedFile: StorageConfigFile | null;
  setSelectedFile: (file: StorageConfigFile | null) => void;
}>({
  selectedFile: null,
  setSelectedFile: () => {},
});

export const SelectionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedFile, setSelectedFile] = useState<StorageConfigFile | null>(
    null,
  );
  const value = useMemo(
    () => ({
      selectedFile,
      setSelectedFile,
    }),
    [selectedFile],
  );

  return <SelectionContext value={value}>{children}</SelectionContext>;
};

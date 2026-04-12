import type {
  ConfigDirectoryEntry,
  StorageConfigFile,
} from '@/lib/gateway/config-file/types';
import { FileItemView } from './FileItemView';

type Props = {
  rootEntry: StorageConfigFile;
  entry: StorageConfigFile | ConfigDirectoryEntry;
  depth: number;
};

export const EntryItemView = ({ rootEntry, entry, depth }: Props) => {
  if (!entry.isDirectory && 'id' in entry) {
    return <FileItemView file={entry} />;
  }

  return null;
};

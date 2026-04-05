import { use } from 'react';
import type {
  ConfigDirectoryEntry,
  StorageConfigFile,
} from '@/lib/gateway/config-file/types';
import { ConfigFileWorkbenchContext } from '../ConfigFileWorkbenchProvider';
import { getIconUrl } from '../configFileWorkbenchUtils';
import { DirectoryItemView } from './DirectoryItemView';
import { FileItemView } from './FileItemView';

type Props = {
  rootEntry: StorageConfigFile;
  entry: StorageConfigFile | ConfigDirectoryEntry;
  depth: number;
};

const isRootEntry = (
  entry: StorageConfigFile | ConfigDirectoryEntry,
): entry is StorageConfigFile => {
  return 'id' in entry;
};

export const EntryItemView = ({ rootEntry, entry, depth }: Props) => {
  const context = use(ConfigFileWorkbenchContext);

  if (!context) {
    throw new Error(
      'ConfigFileRootEntryItemView must be used within ConfigFileWorkbenchProvider',
    );
  }

  const {
    selectedConfigFileId,
    selectedBrowserItemPath,
    isDarkMode,
    expandedFolderPaths,
    loadingFolderPaths,
    directoryEntriesByPath,
    selectConfigFileEntry,
    selectDirectoryEntry,
    toggleDirectory,
  } = context;

  const isSelected = isRootEntry(entry)
    ? selectedConfigFileId === entry.id
    : selectedBrowserItemPath === entry.path;
  const iconUrl = isRootEntry(entry)
    ? getIconUrl(entry.iconType, entry.iconValue, isDarkMode)
    : null;

  if (!entry.isDirectory) {
    return (
      <FileItemView
        name={entry.name}
        path={entry.path}
        isSelected={isSelected}
        iconUrl={iconUrl}
        isDirectory={entry.isDirectory}
        onSelect={() => {
          if (isRootEntry(entry)) {
            void selectConfigFileEntry(entry);
            return;
          }

          void selectDirectoryEntry(rootEntry, entry);
        }}
      />
    );
  }

  const isExpanded = expandedFolderPaths[entry.path] ?? false;
  const isLoading = loadingFolderPaths[entry.path] ?? false;
  const children = directoryEntriesByPath[entry.path] ?? [];

  return (
    <DirectoryItemView
      rootEntry={rootEntry}
      entry={entry}
      isSelected={isSelected}
      iconUrl={iconUrl}
      depth={depth}
      isExpanded={isExpanded}
      isLoading={isLoading}
      directoryEntries={children}
      onToggle={event => {
        event.stopPropagation();
        void toggleDirectory(entry.path);
      }}
      onSelect={() => {
        if (isRootEntry(entry)) {
          void selectConfigFileEntry(entry);
          return;
        }

        void selectDirectoryEntry(rootEntry, entry);
      }}
    />
  );
};

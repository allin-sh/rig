import { match } from 'ts-pattern';
import type { StorageConfigFile } from '@/lib/gateway/config-file/types';
import type { ConfigBrowserItem } from './configFileWorkbenchTypes';

export const getFileTypeFromPath = (path: string) => {
  const lowerCasePath = path.toLowerCase();

  return match(lowerCasePath)
    .when(
      path => path.endsWith('.jsonc'),
      () => 'json',
    )
    .when(
      path => path.endsWith('.json'),
      () => 'json',
    )
    .when(
      path => path.endsWith('.yaml') || path.endsWith('.yml'),
      () => 'yaml',
    )
    .when(
      path => path.endsWith('.toml'),
      () => 'toml',
    )
    .when(
      path => path.endsWith('.zshrc') || path.endsWith('.sh'),
      () => 'shell',
    )
    .when(
      path => path.endsWith('.md'),
      () => 'markdown',
    )
    .otherwise(() => 'plaintext');
};

export const getNameFromPath = (path: string) => {
  const normalizedPath = path.replace(/\/+$|\/+$/g, '');
  return normalizedPath.split('/').at(-1) ?? path;
};

export const toBrowserItem = (
  configFile: StorageConfigFile,
): ConfigBrowserItem => ({
  rootId: configFile.id,
  name: configFile.name,
  path: configFile.path,
  isDirectory: configFile.isDirectory,
});

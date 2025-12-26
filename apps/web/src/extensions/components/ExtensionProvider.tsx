/**
 * Extension Provider
 * Provides extension system to the entire app
 */

'use client';

import type { ExtensionAPI, ExtensionLoader } from '@allin/extension-api';
import { createContext, type ReactNode, useContext, useEffect } from 'react';
import { useExtensionManager } from '../api/use-extension-manager';

interface ExtensionContextValue {
  api: ExtensionAPI;
  loader: ExtensionLoader;
}

const ExtensionContext = createContext<ExtensionContextValue | null>(null);

interface ExtensionProviderProps {
  children: ReactNode;
  /** Extension packages to auto-load on mount */
  autoLoadExtensions?: string[];
}

export function ExtensionProvider({
  children,
  autoLoadExtensions = [],
}: ExtensionProviderProps) {
  const { extensionAPI, loader } = useExtensionManager();

  // Auto-load extensions on mount
  useEffect(() => {
    const loadExtensions = async () => {
      for (const extensionName of autoLoadExtensions) {
        try {
          await loader.loadAndActivate(extensionName);
          console.log(`✅ Loaded extension: ${extensionName}`);
        } catch (error) {
          console.error(`❌ Failed to load extension ${extensionName}:`, error);
        }
      }
    };

    loadExtensions();
  }, [loader, autoLoadExtensions]);

  return (
    <ExtensionContext.Provider value={{ api: extensionAPI, loader }}>
      {children}
    </ExtensionContext.Provider>
  );
}

/**
 * Hook to access extension API
 */
export function useExtensionAPI(): ExtensionAPI {
  const context = useContext(ExtensionContext);
  if (!context) {
    throw new Error('useExtensionAPI must be used within ExtensionProvider');
  }
  return context.api;
}

/**
 * Hook to access extension loader
 */
export function useExtensionLoader(): ExtensionLoader {
  const context = useContext(ExtensionContext);
  if (!context) {
    throw new Error('useExtensionLoader must be used within ExtensionProvider');
  }
  return context.loader;
}

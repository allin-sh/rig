/**
 * Extension loader utility
 * Dynamically load and manage extensions
 */

import type { Extension, ExtensionAPI } from './types';

export interface ExtensionModule {
  /** Extension export name can be anything */
  [key: string]: Extension | unknown;
}

export interface LoadedExtension {
  extension: Extension;
  isActive: boolean;
}

export class ExtensionLoader {
  private loadedExtensions = new Map<string, LoadedExtension>();
  private api: ExtensionAPI;

  constructor(api: ExtensionAPI) {
    this.api = api;
  }

  /**
   * Dynamically load an extension
   * @param extensionName - Extension package name (e.g. '@allin/extension-quiz')
   */
  async load(extensionName: string): Promise<void> {
    try {
      // Skip if already loaded
      if (this.loadedExtensions.has(extensionName)) {
        console.log(`Extension ${extensionName} is already loaded`);
        return;
      }

      // Load extension via dynamic import
      const module = (await import(
        /* @vite-ignore */ extensionName
      )) as ExtensionModule;

      // Find Extension object
      const extension = this.findExtension(module);

      if (!extension) {
        throw new Error(`No valid Extension found in module ${extensionName}`);
      }

      // Store extension
      this.loadedExtensions.set(extensionName, {
        extension,
        isActive: false,
      });

      console.log(`Extension ${extensionName} loaded successfully`);
    } catch (error) {
      console.error(`Failed to load extension ${extensionName}:`, error);
      throw error;
    }
  }

  /**
   * Activate an extension
   */
  async activate(extensionName: string): Promise<void> {
    const loaded = this.loadedExtensions.get(extensionName);

    if (!loaded) {
      throw new Error(`Extension ${extensionName} is not loaded`);
    }

    if (loaded.isActive) {
      console.log(`Extension ${extensionName} is already active`);
      return;
    }

    try {
      await loaded.extension.activate(this.api);
      loaded.isActive = true;
      console.log(`Extension ${extensionName} activated`);
    } catch (error) {
      console.error(`Failed to activate extension ${extensionName}:`, error);
      throw error;
    }
  }

  /**
   * Deactivate an extension
   */
  async deactivate(extensionName: string): Promise<void> {
    const loaded = this.loadedExtensions.get(extensionName);

    if (!loaded) {
      throw new Error(`Extension ${extensionName} is not loaded`);
    }

    if (!loaded.isActive) {
      console.log(`Extension ${extensionName} is already inactive`);
      return;
    }

    try {
      if (loaded.extension.deactivate) {
        await loaded.extension.deactivate();
      }
      loaded.isActive = false;
      console.log(`Extension ${extensionName} deactivated`);
    } catch (error) {
      console.error(`Failed to deactivate extension ${extensionName}:`, error);
      throw error;
    }
  }

  /**
   * Load + activate an extension (convenience method)
   */
  async loadAndActivate(extensionName: string): Promise<void> {
    await this.load(extensionName);
    await this.activate(extensionName);
  }

  /**
   * List all loaded extensions
   */
  list(): Array<{
    name: string;
    id: string;
    version: string;
    isActive: boolean;
  }> {
    return Array.from(this.loadedExtensions.entries()).map(
      ([name, { extension, isActive }]) => ({
        name,
        id: extension.id,
        version: extension.version,
        isActive,
      }),
    );
  }

  /**
   * Filter active extensions only
   */
  listActive(): string[] {
    return Array.from(this.loadedExtensions.entries())
      .filter(([, { isActive }]) => isActive)
      .map(([name]) => name);
  }

  /**
   * Unload an extension
   */
  async unload(extensionName: string): Promise<void> {
    const loaded = this.loadedExtensions.get(extensionName);

    if (!loaded) {
      return;
    }

    // Deactivate first if active
    if (loaded.isActive) {
      await this.deactivate(extensionName);
    }

    this.loadedExtensions.delete(extensionName);
    console.log(`Extension ${extensionName} unloaded`);
  }

  /**
   * Find Extension object in module
   */
  private findExtension(module: ExtensionModule): Extension | null {
    // Check default export
    if (this.isExtension(module.default)) {
      return module.default;
    }

    // Check named exports
    for (const key of Object.keys(module)) {
      if (this.isExtension(module[key])) {
        return module[key] as Extension;
      }
    }

    return null;
  }

  /**
   * Extension type guard
   */
  private isExtension(obj: unknown): obj is Extension {
    if (!obj || typeof obj !== 'object') return false;

    const ext = obj as Partial<Extension>;
    return (
      typeof ext.id === 'string' &&
      typeof ext.name === 'string' &&
      typeof ext.version === 'string' &&
      typeof ext.activate === 'function'
    );
  }
}

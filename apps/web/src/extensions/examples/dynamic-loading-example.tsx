/**
 * Example: Dynamic Extension Loading
 */

'use client';

import { Button } from '@allin/ui';
import { useState } from 'react';
import { useExtensionLoader } from '@/extensions';

export function DynamicExtensionLoadingExample() {
  const loader = useExtensionLoader();
  const [extensions, setExtensions] = useState(loader.list());
  const [loading, setLoading] = useState(false);

  const handleLoadExtension = async (extensionName: string) => {
    setLoading(true);
    try {
      await loader.loadAndActivate(extensionName);
      setExtensions(loader.list());
      console.log('✅ Extension loaded:', extensionName);
    } catch (error) {
      console.error('❌ Failed to load extension:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnloadExtension = async (extensionName: string) => {
    setLoading(true);
    try {
      await loader.unload(extensionName);
      setExtensions(loader.list());
      console.log('✅ Extension unloaded:', extensionName);
    } catch (error) {
      console.error('❌ Failed to unload extension:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExtension = async (
    extensionName: string,
    isActive: boolean,
  ) => {
    setLoading(true);
    try {
      if (isActive) {
        await loader.deactivate(extensionName);
      } else {
        await loader.activate(extensionName);
      }
      setExtensions(loader.list());
    } catch (error) {
      console.error('❌ Failed to toggle extension:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-8'>
      <h1 className='text-2xl font-bold mb-4'>Extension Manager</h1>

      <div className='mb-6'>
        <h2 className='text-lg font-semibold mb-2'>Available Extensions</h2>
        <div className='flex gap-2'>
          <Button
            onClick={() => handleLoadExtension('@allin/extension-quiz')}
            disabled={loading}
          >
            Load Quiz Extension
          </Button>
          <Button
            onClick={() => handleLoadExtension('@allin/extension-history')}
            disabled={loading}
          >
            Load History Extension
          </Button>
        </div>
      </div>

      <div>
        <h2 className='text-lg font-semibold mb-2'>Loaded Extensions</h2>
        {extensions.length === 0 ? (
          <p className='text-gray-500'>No extensions loaded</p>
        ) : (
          <div className='space-y-2'>
            {extensions.map(ext => (
              <div
                key={ext.name}
                className='flex items-center justify-between p-4 border rounded'
              >
                <div>
                  <p className='font-medium'>{ext.id}</p>
                  <p className='text-sm text-gray-500'>
                    v{ext.version} •{' '}
                    {ext.isActive ? '🟢 Active' : '🔴 Inactive'}
                  </p>
                </div>
                <div className='flex gap-2'>
                  <Button
                    size='sm'
                    variant={ext.isActive ? 'outline' : 'default'}
                    onClick={() =>
                      handleToggleExtension(ext.name, ext.isActive)
                    }
                    disabled={loading}
                  >
                    {ext.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    size='sm'
                    variant='destructive'
                    onClick={() => handleUnloadExtension(ext.name)}
                    disabled={loading}
                  >
                    Unload
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

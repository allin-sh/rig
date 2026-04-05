import { toast } from '@allin/ui';
import { useEffect, useState } from 'react';
import { useConfigFile } from '../useConfigFile';
import { EntryItemView } from './EntryItemView';

export const EntryListView = () => {
  const { configFiles, fetchConfigFiles } = useConfigFile();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchConfigFiles()
      .catch(error => {
        toast.error(`Failed to load config file list: ${String(error)}`, {
          position: 'top-center',
          duration: 10000,
          closeButton: true,
        });
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [fetchConfigFiles]);

  if (isLoading) {
    return (
      <div className='flex-1 overflow-y-auto p-2'>
        <p className='px-2 py-1 text-sm text-muted-foreground'>Loading...</p>
      </div>
    );
  }

  if (configFiles.length === 0) {
    return (
      <div className='flex-1 overflow-y-auto p-2'>
        <p className='px-2 py-1 text-sm text-muted-foreground'>
          Add your first file or folder.
        </p>
      </div>
    );
  }

  return (
    <div className='flex-1 overflow-y-auto p-2'>
      <div className='flex flex-col gap-1'>
        {configFiles.map(configFile => (
          <EntryItemView
            key={configFile.id}
            rootEntry={configFile}
            entry={configFile}
            depth={0}
          />
        ))}
      </div>
    </div>
  );
};

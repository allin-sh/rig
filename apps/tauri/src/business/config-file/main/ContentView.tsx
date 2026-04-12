import type { StorageConfigFile } from '@/lib/gateway/config-file/types';
import { getFileTypeFromPath } from '../configFileWorkbenchUtils';
import { EditorView } from './EditorView';
import { PreviewActionsView } from './PreviewActionsView';
import { useUserFile } from './useUserFile';

export const ContentView = ({
  selectedFile,
}: {
  selectedFile: StorageConfigFile;
}) => {
  const { data } = useUserFile();

  return (
    <div className='flex h-full min-h-0'>
      <div className='min-w-0 flex-1'>
        <EditorView
          language={getFileTypeFromPath(selectedFile.path)}
          value={''}
          onChange={() => {}}
        />
      </div>
      <PreviewActionsView />
    </div>
  );
};

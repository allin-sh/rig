import { useUserFile } from '../main/useUserFile';
import { EntryItemView } from './EntryItemView';

export const UserFileListView = () => {
  const { data: files } = useUserFile();

  if (files.length === 0) {
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
        {files.map(file => (
          <EntryItemView
            key={file.id}
            rootEntry={file}
            entry={file}
            depth={0}
          />
        ))}
      </div>
    </div>
  );
};

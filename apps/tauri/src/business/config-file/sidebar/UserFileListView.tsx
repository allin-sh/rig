import { useUserFile } from '../main/useUserFile';
import { useGroup } from '../useGroup';
import { EntryItemView } from './EntryItemView';

export const UserFileListView = () => {
  const { data: files } = useUserFile();
  const { groups } = useGroup();

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

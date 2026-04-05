import { Button } from '@allin/ui';

type Props = {
  isDirectory: boolean;
  onSelectFile: () => void;
  onSelectFolder: () => void;
};

export const CreateFormTypeSectionView = ({
  isDirectory,
  onSelectFile,
  onSelectFolder,
}: Props) => {
  return (
    <div className='flex flex-col gap-2'>
      <span className='text-sm font-medium'>Type</span>
      <div className='flex gap-2'>
        <Button
          type='button'
          variant={!isDirectory ? 'default' : 'outline'}
          onClick={onSelectFile}
        >
          File
        </Button>
        <Button
          type='button'
          variant={isDirectory ? 'default' : 'outline'}
          onClick={onSelectFolder}
        >
          Folder
        </Button>
      </div>
    </div>
  );
};

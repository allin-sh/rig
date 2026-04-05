import { Button, Input } from '@allin/ui';

type Props = {
  isDirectory: boolean;
  path: string;
  isPickingPath: boolean;
  onChangePath: (path: string) => void;
  onBrowsePath: () => void;
};

export const CreateFormPathSectionView = ({
  isDirectory,
  path,
  isPickingPath,
  onChangePath,
  onBrowsePath,
}: Props) => {
  return (
    <div className='flex flex-col gap-2'>
      <label className='text-sm font-medium' htmlFor='config-file-path'>
        Path
      </label>
      <div className='flex items-center gap-2'>
        <Input
          id='config-file-path'
          placeholder={
            isDirectory
              ? 'e.g. ~/.config/nvim'
              : 'e.g. ~/.config/zed/settings.json'
          }
          value={path}
          onChange={event => onChangePath(event.target.value)}
        />
        <Button
          type='button'
          variant='outline'
          onClick={onBrowsePath}
          disabled={isPickingPath}
        >
          {isPickingPath ? 'Opening...' : 'Browse'}
        </Button>
      </div>
      <p className='text-xs text-muted-foreground'>
        {isDirectory
          ? 'Folder entries expand into a tree so you can browse child files.'
          : 'File entries open directly in the editor.'}
      </p>
    </div>
  );
};

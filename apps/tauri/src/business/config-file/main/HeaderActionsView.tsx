import { Button } from '@allin/ui';
import { Save, Trash2 } from 'lucide-react';
import { FINDER_ICON_PATH } from '../configFileWorkbenchUtils';

type Props = {
  pane: 'content' | 'create-entry';
  isDirty: boolean;
  finderTargetPath: string | null;
  hasSelectedConfigFile: boolean;
  canSave: boolean;
  onOpenInFinder: () => void;
  onRemoveSelectedEntry: () => void;
  onSaveActiveFile: () => void;
};

export const HeaderActionsView = ({
  pane,
  isDirty,
  finderTargetPath,
  hasSelectedConfigFile,
  canSave,
  onOpenInFinder,
  onRemoveSelectedEntry,
  onSaveActiveFile,
}: Props) => {
  const isCreateEntryPane = pane === 'create-entry';

  return (
    <div className='flex items-center gap-2'>
      {pane === 'content' && isDirty ? (
        <span className='text-xs text-amber-600 font-medium'>Unsaved</span>
      ) : null}
      <Button
        onClick={onOpenInFinder}
        size='sm'
        variant='outline'
        className='h-9 gap-2 rounded-full border-sky-200 bg-gradient-to-b from-white to-sky-50 px-3 text-slate-700 shadow-sm hover:border-sky-300 hover:from-sky-50 hover:to-sky-100 hover:text-slate-900'
        disabled={!finderTargetPath || isCreateEntryPane}
      >
        <span className='inline-flex size-5 items-center justify-center overflow-hidden rounded-md bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08)]'>
          <img
            src={FINDER_ICON_PATH}
            alt='Finder'
            className='size-4 object-cover'
          />
        </span>
        Show in Finder
      </Button>
      <Button
        onClick={onRemoveSelectedEntry}
        size='sm'
        variant='outline'
        disabled={!hasSelectedConfigFile || isCreateEntryPane}
      >
        <Trash2 className='size-4' />
        Remove
      </Button>
      <Button onClick={onSaveActiveFile} size='sm' disabled={!canSave}>
        <Save className='size-4' />
        Save
      </Button>
    </div>
  );
};

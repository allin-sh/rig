import { Button } from '@allin/ui';
import { Plus } from 'lucide-react';
import { usePaneType } from '../usePaneType';
import { EntryListView } from './EntryListView';

export const SidebarView = () => {
  const { setPaneType } = usePaneType();

  return (
    <aside className='border-r bg-muted/10 flex flex-col'>
      <div className='p-3 border-b flex items-center justify-between gap-2'>
        <h1 className='text-sm font-semibold tracking-wide'>Settings Files</h1>
        <Button
          onClick={() => setPaneType('create-entry')}
          size='sm'
          variant='outline'
        >
          <Plus className='size-4' />
          Add
        </Button>
      </div>
      <EntryListView />
    </aside>
  );
};

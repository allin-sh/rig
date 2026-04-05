import { Button } from '@allin/ui';
import { Plus } from 'lucide-react';
import { use } from 'react';
import { ConfigFileWorkbenchContext } from '../ConfigFileWorkbenchProvider';
import { EntryListView } from './EntryListView';

export const SidebarView = () => {
  const context = use(ConfigFileWorkbenchContext);

  if (!context) {
    throw new Error(
      'ConfigFileSidebarView must be used within ConfigFileWorkbenchProvider',
    );
  }

  const { setPane } = context;

  return (
    <aside className='border-r bg-muted/10 flex flex-col'>
      <div className='p-3 border-b flex items-center justify-between gap-2'>
        <h1 className='text-sm font-semibold tracking-wide'>Settings Files</h1>
        <Button
          onClick={() => setPane('create-entry')}
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

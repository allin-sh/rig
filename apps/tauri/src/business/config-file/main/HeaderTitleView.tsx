import { EntryIconView } from '../EntryIconView';

type Props = {
  pane: 'content' | 'create-entry';
  activeDisplayName: string | null;
  activeDisplayPath: string | null;
  activeIsDirectory: boolean;
  isRootItemActive: boolean;
  selectedRootIconUrl: string | null;
};

export const HeaderTitleView = ({
  pane,
  activeDisplayName,
  activeDisplayPath,
  activeIsDirectory,
  isRootItemActive,
  selectedRootIconUrl,
}: Props) => {
  if (pane === 'create-entry') {
    return (
      <div className='text-sm text-muted-foreground'>
        Add a settings file or folder
      </div>
    );
  }

  if (activeDisplayName && activeDisplayPath) {
    return (
      <div className='min-w-0 flex items-center gap-2'>
        <span className='size-6 inline-flex items-center justify-center text-base rounded-sm overflow-hidden'>
          <EntryIconView
            isDirectory={activeIsDirectory}
            iconUrl={isRootItemActive ? selectedRootIconUrl : undefined}
            imageClassName='size-5 rounded-sm object-cover border'
          />
        </span>
        <div className='min-w-0'>
          <p className='text-sm font-medium truncate'>{activeDisplayName}</p>
          <p className='text-xs text-muted-foreground truncate'>
            {activeDisplayPath}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='text-sm text-muted-foreground'>
      Select a file from the sidebar
    </div>
  );
};

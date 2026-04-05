import { use } from 'react';
import { ConfigFileWorkbenchContext } from '../ConfigFileWorkbenchProvider';
import { HeaderActionsView } from './HeaderActionsView';
import { HeaderTitleView } from './HeaderTitleView';

export const HeaderView = () => {
  const context = use(ConfigFileWorkbenchContext);

  if (!context) {
    throw new Error(
      'HeaderView must be used within ConfigFileWorkbenchProvider',
    );
  }

  return (
    <div className='h-12 border-b px-4 flex items-center justify-between gap-2'>
      <HeaderTitleView
        pane={context.pane}
        activeDisplayName={context.activeDisplayName}
        activeDisplayPath={context.activeDisplayPath}
        activeIsDirectory={context.activeIsDirectory}
        isRootItemActive={context.isRootItemActive}
        selectedRootIconUrl={context.selectedRootIconUrl}
      />
      <HeaderActionsView
        pane={context.pane}
        isDirty={context.isDirty}
        finderTargetPath={context.finderTargetPath}
        hasSelectedConfigFile={Boolean(context.selectedConfigFile)}
        canSave={context.canSave}
        onOpenInFinder={() => {
          void context.openInFinder();
        }}
        onRemoveSelectedEntry={() => {
          void context.removeSelectedEntry();
        }}
        onSaveActiveFile={() => {
          void context.saveActiveFile();
        }}
      />
    </div>
  );
};

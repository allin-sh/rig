import { use } from 'react';
import { SelectionContext } from '../SelectionContext';
import { usePaneType } from '../usePaneType';
import { HeaderActionsView } from './HeaderActionsView';
import { HeaderTitleView } from './HeaderTitleView';

export const HeaderView = () => {
  const { paneType } = usePaneType();
  const { selectedFile } = use(SelectionContext);
  return (
    <div className='h-12 border-b px-4 flex items-center justify-between gap-2'>
      <HeaderTitleView paneType={paneType} selectedFile={selectedFile} />
      <HeaderActionsView paneType={paneType} selectedFile={selectedFile} />
    </div>
  );
};

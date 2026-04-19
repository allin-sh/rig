'use client';

import { HeaderView } from './main/HeaderView';
import { MainView } from './main/MainView';
import { SelectionProvider } from './SelectionContext';
import { SidebarView } from './sidebar/SidebarView';

export const WorkbenchView = () => {
  return (
    <SelectionProvider>
      <div className='w-full h-1 border-b'></div>
      <div className='h-dvh w-full grid grid-cols-[360px_1fr] bg-background'>
        <SidebarView />
        <section className='flex flex-col min-w-0'>
          <HeaderView />
          <div className='flex-1 min-h-0'>
            <MainView />
          </div>
        </section>
      </div>
    </SelectionProvider>
  );
};

'use client';

import { use } from 'react';
import {
  ConfigFileWorkbenchContext,
  ConfigFileWorkbenchProvider,
} from './ConfigFileWorkbenchProvider';
import { HeaderView } from './main/HeaderView';
import { MainView } from './main/MainView';
import { SidebarView } from './sidebar/SidebarView';

const ConfigFileWorkbenchMainView = () => {
  const context = use(ConfigFileWorkbenchContext);

  if (!context) {
    throw new Error(
      'ConfigFileWorkbenchMainView must be used within ConfigFileWorkbenchProvider',
    );
  }

  return <MainView />;
};

export const ConfigFileWorkbenchView = () => {
  return (
    <ConfigFileWorkbenchProvider>
      <div className='h-dvh w-full grid grid-cols-[320px_1fr] bg-background'>
        <SidebarView />
        <section className='flex flex-col min-w-0'>
          <HeaderView />
          <div className='flex-1 min-h-0'>
            <ConfigFileWorkbenchMainView />
          </div>
        </section>
      </div>
    </ConfigFileWorkbenchProvider>
  );
};

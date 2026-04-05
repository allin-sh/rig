'use client';

import { use } from 'react';
import { ConfigFileWorkbenchContext } from '../ConfigFileWorkbenchProvider';
import { ContentView } from './ContentView';
import { CreateFormView } from './CreateFormView';

export const MainView = () => {
  const context = use(ConfigFileWorkbenchContext);

  if (!context) {
    throw new Error('MainView must be used within ConfigFileWorkbenchProvider');
  }

  return context.pane === 'create-entry' ? <CreateFormView /> : <ContentView />;
};

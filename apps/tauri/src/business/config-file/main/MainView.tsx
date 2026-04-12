'use client';

import { match } from 'ts-pattern';
import { usePaneType } from '../usePaneType';
import { ContentView } from './ContentView';
import { CreateFormView } from './CreateFormView';

export const MainView = () => {
  const { paneType } = usePaneType();

  return match(paneType)
    .with('content', () => <ContentView />)
    .with('create-entry', () => <CreateFormView />)
    .exhaustive();
};

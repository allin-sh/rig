'use client';

import { ChannelsCommandView } from '../command-k/views/ChannelsCommandView';
import { HomeCommandView } from '../command-k/views/HomeCommandView';
import { ModelSelectView } from '../command-k/views/ModelSelectView';
import { ProviderConfigCommandView } from '../command-k/views/ProviderConfigCommandView';
import { ProvidersCommandView } from '../command-k/views/ProvidersCommandView';

export const CommandPalette = () => {
  return (
    <>
      <HomeCommandView />
      <ChannelsCommandView />
      <ProvidersCommandView />
      <ProviderConfigCommandView />
      <ModelSelectView />
    </>
  );
};

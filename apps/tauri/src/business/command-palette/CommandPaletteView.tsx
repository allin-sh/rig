'use client';

import { useEffect, useMemo, useState } from 'react';
import { match } from 'ts-pattern';
import { ChannelsCommandView } from './panes/ChannelsCommandView';
import { HomeCommandView } from './panes/HomeCommandView';
import { ModelSelectView } from './panes/ModelSelectView';
import {
  ProviderConfigCommandView,
  type ProviderId,
} from './panes/ProviderConfigCommandView';
import { ProvidersCommandView } from './panes/ProvidersCommandView';
import { useCommandPalette } from './useCommandPalette';

export const CommandPalette = () => {
  const { currentPane } = useCommandPalette();

  return (
    <>
      {match(currentPane.paneId)
        .with('home', () => <HomeCommandView {...currentPane.paneProps} />)
        .with('channels', () => (
          <ChannelsCommandView {...currentPane.paneProps} />
        ))
        .with('providers', () => (
          <ProvidersCommandView {...currentPane.paneProps} />
        ))
        .with('provider-config', () => (
          <ProviderConfigCommandView
            providerId={currentPane.paneProps?.providerId as ProviderId}
          />
        ))
        .with('model-select', () => (
          <ModelSelectView {...currentPane.paneProps} />
        ))
        .with(null, () => null)
        .exhaustive()}
    </>
  );
};

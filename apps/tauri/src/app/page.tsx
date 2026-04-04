'use client';

import { Toaster } from '@allin/ui';
import { CommandPalette } from '@/business/command-palette/CommandPaletteView';
import { ConfigFileWorkbenchView } from '@/business/config-file/ConfigFileWorkbenchView';
import { ServiceProvider } from '@/business/ServiceContext';
import { QueryProvider } from '@/lib/QueryProvider';

const Home = () => {
  return (
    <ServiceProvider>
      <QueryProvider>
        <Toaster richColors duration={3000} theme='light' />
        <CommandPalette />
        <ConfigFileWorkbenchView />
      </QueryProvider>
    </ServiceProvider>
  );
};

export default Home;

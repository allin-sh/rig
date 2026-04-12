'use client';

import { Toaster } from '@allin/ui';
import { CommandPalette } from '@/business/command-palette/CommandPaletteView';
import { WorkbenchView } from '@/business/config-file/WorkbenchView';
import { ServiceProvider } from '@/business/ServiceContext';
import { QueryProvider } from '@/lib/QueryProvider';

const Home = () => {
  return (
    <ServiceProvider>
      <QueryProvider>
        <Toaster richColors duration={3000} theme='light' />
        <CommandPalette />
        <WorkbenchView />
      </QueryProvider>
    </ServiceProvider>
  );
};

export default Home;

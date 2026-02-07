'use client';

import { Toaster } from '@allin/ui';
import { useEffect } from 'react';
import { AgentManager } from '@/business/agent/AgentManager';
import { ChattingView } from '@/business/chatting/ChattingView';
import { CommandPalette } from '@/business/command-palette/CommandPaletteView';
import { QueryProvider } from '@/lib/QueryProvider';

export default function Home() {
  useEffect(() => {
    AgentManager.getInstance().initialize().catch(console.error);
  }, []);

  return (
    <QueryProvider>
      <Toaster richColors duration={3000} theme='light' />
      <CommandPalette />
      <ChattingView />
    </QueryProvider>
  );
}

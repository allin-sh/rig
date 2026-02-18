'use client';

import { Toaster } from '@allin/ui';
import { ChattingView } from '@/business/chatting/ChattingView';
import { useAgentInit } from '@/business/chatting/hooks/useAgentInit';
import { CommandPalette } from '@/business/command-palette/CommandPaletteView';
import { QueryProvider } from '@/lib/QueryProvider';

export default function Home() {
  useAgentInit();

  return (
    <QueryProvider>
      <Toaster richColors duration={3000} theme='light' />
      <CommandPalette />
      <ChattingView />
    </QueryProvider>
  );
}

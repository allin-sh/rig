'use client';

import { Toaster } from '@allin/ui';
import { ChattingView } from '@/business/chatting/ChattingView';
import { CommandPalette } from '@/business/command-palette/CommandPaletteView';
import { QueryProvider } from '@/lib/QueryProvider';

export default function Home() {
  return (
    <QueryProvider>
      <Toaster richColors duration={3000} theme='light' />
      <CommandPalette />
      <ChattingView />
    </QueryProvider>
  );
}

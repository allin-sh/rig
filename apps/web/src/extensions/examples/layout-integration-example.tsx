/**
 * Example: How to integrate Extension System into your app
 *
 * This file shows how to use the extension system in your Next.js app
 */

'use client';

import {
  ExtensionProvider,
  ModalRenderer,
  SidebarPanelRenderer,
} from '@/extensions';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>
        <ExtensionProvider
          autoLoadExtensions={[
            '@allin/extension-quiz',
            // Add more extensions here
          ]}
        >
          <div className='flex h-screen'>
            {/* Left Sidebar with Extension Panels */}
            <SidebarPanelRenderer position='left' />

            {/* Main Content */}
            <main className='flex-1'>{children}</main>

            {/* Right Sidebar with Extension Panels */}
            <SidebarPanelRenderer position='right' />
          </div>

          {/* Global Modal Renderer */}
          <ModalRenderer />
        </ExtensionProvider>
      </body>
    </html>
  );
}

/**
 * Sidebar Panel Renderer
 * Renders all registered sidebar panels
 */

'use client';

import { ScrollArea } from '@allin/ui';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  sidebarPanelsActionsAtom,
  sidebarPanelsAtom,
} from '../store/extension-store';

interface SidebarPanelRendererProps {
  position: 'left' | 'right';
}

export function SidebarPanelRenderer({ position }: SidebarPanelRendererProps) {
  const panels = useAtomValue(sidebarPanelsAtom);
  const setPanels = useSetAtom(sidebarPanelsActionsAtom);

  const filteredPanels = Array.from(panels.values()).filter(
    p => (p.panel.options?.position ?? 'left') === position,
  );

  if (filteredPanels.length === 0) {
    return null;
  }

  return (
    <div className='flex flex-col h-full border-r'>
      {/* Panel Icons/Tabs */}
      <div className='flex flex-col gap-2 p-2 border-b'>
        {filteredPanels.map(panelState => {
          const { id, panel, isOpen } = panelState;
          const icon = typeof panel.icon === 'string' ? panel.icon : null;

          return (
            <button
              key={id}
              onClick={() => setPanels({ type: 'toggle', id })}
              className={`relative p-2 rounded hover:bg-gray-100 transition-colors ${
                isOpen ? 'bg-gray-200' : ''
              }`}
              title={panel.title}
            >
              {icon ? <span className='text-xl'>{icon}</span> : panel.icon}
              {panel.options?.badge && (
                <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                  {panel.options.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Panel Content */}
      {filteredPanels.map(panelState => {
        const { id, panel, isOpen } = panelState;

        if (!isOpen) return null;

        const Content = panel.content;
        const close = () => setPanels({ type: 'close', id });
        const width = panel.options?.width ?? 300;

        return (
          <div
            key={id}
            className={`flex-1 overflow-hidden ${panel.options?.className || ''}`}
            style={{ width: typeof width === 'number' ? `${width}px` : width }}
          >
            <div className='flex items-center justify-between p-3 border-b'>
              <h3 className='font-semibold'>{panel.title}</h3>
              <button
                onClick={close}
                className='text-gray-500 hover:text-gray-700'
              >
                ✕
              </button>
            </div>
            <ScrollArea className='h-[calc(100%-3rem)]'>
              <Content panelId={id} close={close} isOpen={isOpen} />
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
}

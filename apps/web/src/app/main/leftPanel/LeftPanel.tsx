'use client';

import { useAtomValue } from 'jotai';
import { ActivitySquare, FlaskConical, ToyBrick } from 'lucide-react';
import { type RefObject, useEffect, useRef, useState } from 'react';
import { useResizeObserver } from 'usehooks-ts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TypographyH3 } from '@/components/ui/typographyH3';
import { useRxValue } from '@/lib/rxjs/useRx';
import { cn } from '@/lib/utils';
import { DevelopmentPanel } from './development/DevelopmentPanel';
import { isLeftPanelOpenAtom } from './leftPanelStore';
import { MonitorPanel } from './monitor/MonitorPanel';
import { PluginPanel } from './PluginPanel';

const _PropertyList = [
  {
    Icon: FlaskConical,
    title: 'Development',
    Component: DevelopmentPanel,
    disabled: process.env.NODE_ENV === 'production',
  },
  {
    Icon: ActivitySquare,
    title: 'Monitor',
    Component: MonitorPanel,
    disabled: false,
  },
  {
    Icon: ToyBrick,
    title: 'Plugins',
    Component: PluginPanel,
    disabled: false,
  },
] as const;

export const LeftPanel = () => {
  const PropertyList = _PropertyList.filter(value => !value.disabled);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const open = useAtomValue(isLeftPanelOpenAtom);
  const { width: leftPanelWidth = 360 } = useResizeObserver({
    ref: wrapperRef as RefObject<HTMLDivElement>,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (open) {
      wrapperRef.current?.focus();
    }
  }, [open]);

  const SelectedIcon = PropertyList[selectedIndex].Icon;
  const SelectedTitle = PropertyList[selectedIndex].title;
  const SelectedComponent = PropertyList[selectedIndex].Component;

  return (
    <div
      ref={wrapperRef}
      className={cn(
        'w-[480px] h-full rounded-md border flex flex-col gap-4 overflow-y-auto',
        !open && 'hidden',
      )}
      tabIndex={-1}
    >
      <DropdownMenu>
        <DropdownMenuTrigger className='cursor-pointer'>
          <div className='w-full h-[60px] flex flex-row px-2  border-b border-gray-200 items-center shrink-0'>
            {
              <div className='px-2 flex flex-row gap-2 items-center'>
                {SelectedIcon && <SelectedIcon className='w-5 h-5' />}
                <TypographyH3>{SelectedTitle}</TypographyH3>
              </div>
            }
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          style={{
            width: `${leftPanelWidth}px`,
          }}
          align='start'
        >
          {PropertyList.map(({ Icon, title }, index) => (
            <DropdownMenuItem
              key={title}
              onClick={() => setSelectedIndex(index)}
            >
              <Icon className='w-5 h-5' />
              <span>{title}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {SelectedComponent && <SelectedComponent />}
    </div>
  );
};

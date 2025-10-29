import { useAtom, useAtomValue } from 'jotai';
import { Settings } from 'lucide-react';
import { isDataBaseInitializedAtom } from '@/app/idb/idbStore';
import { Toggle } from '@/components/ui/toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { isLeftPanelOpenAtom } from '../leftPanel/leftPanelStore';
import { ChannelSelector } from './ChannelSelector';

export const Header = () => {
  const [open, setOpen] = useAtom(isLeftPanelOpenAtom);
  const isDBInitialized = useAtomValue(isDataBaseInitializedAtom);

  return (
    <div className='w-full flex flex-row items-center justify-between'>
      <Tooltip delayDuration={200}>
        <TooltipTrigger>
          <Toggle
            pressed={open}
            onPressedChange={setOpen}
            aria-label='Toggle side bar'
            className='cursor-pointer'
            asChild
          >
            <Settings className={cn(!open && 'text-gray-500 stroke-2')} />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent>
          <p className='text-xs'>설정</p>
        </TooltipContent>
      </Tooltip>
      {isDBInitialized && <ChannelSelector />}
    </div>
  );
};

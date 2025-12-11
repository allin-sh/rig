import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup } from '@/components/ui/radio-group';
import { PromptTextArea } from './PromptTextArea';

export const ModelSettingView = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={'outline'} size='icon' className='size-8'>
          <Settings2 />
        </Button>
      </PopoverTrigger>
      <PopoverContent align='start' alignOffset={-92} className='w-80'>
        <div className='grid gap-4'>
          <div className='flex flex-col gap-4'>
            <Label>Reasoning</Label>
            <RadioGroup
              targets={['none', 'low', 'medium', 'high']}
              defaultValue={'medium'}
              onChange={v => {
                console.log(v);
              }}
            />
          </div>
          <PromptTextArea />
        </div>
      </PopoverContent>
    </Popover>
  );
};

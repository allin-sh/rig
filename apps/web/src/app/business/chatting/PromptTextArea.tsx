import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const PromptTextArea = () => {
  return (
    <div className='flex flex-col gap-4'>
      <Label htmlFor='prompt'>Prompt</Label>
      <Textarea
        id='prompt'
        placeholder='Enter your prompt here...'
        className='w-full h-full rounded-sm !text-sm max-h-72 p-2 min-h-32'
      />
    </div>
  );
};

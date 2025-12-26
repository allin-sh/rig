/**
 * Example: Text Selection with Extension Popover
 */

'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@allin/ui';
import { useState } from 'react';
import { SelectionPopoverRenderer } from '@/extensions';

export function TextSelectionExample() {
  const [selectedText, setSelectedText] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleTextSelect = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text) {
      setSelectedText(text);
      setPopoverOpen(true);
    } else {
      setPopoverOpen(false);
    }
  };

  return (
    <div className='p-8'>
      <h1 className='text-2xl font-bold mb-4'>Select Text Example</h1>

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <div className='p-4 border rounded' onMouseUp={handleTextSelect}>
            <p>
              This is a sample text. Try selecting any part of this text to see
              extension popover items appear!
            </p>
            <p className='mt-2'>
              Extensions can add custom actions to the selection popover, like
              generating quizzes, summarizing text, or translating.
            </p>
          </div>
        </PopoverTrigger>

        <PopoverContent>
          <SelectionPopoverRenderer
            selectedText={selectedText}
            onClose={() => setPopoverOpen(false)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

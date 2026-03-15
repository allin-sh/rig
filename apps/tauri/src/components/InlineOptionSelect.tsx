'use client';

import { cn } from '@allin/ui';
import { useEffect, useRef, useState } from 'react';

export type InlineOptionItem = {
  label: string;
  value: string;
};

type InlineOptionSelectProps = {
  options: InlineOptionItem[];
  onSelect: (value: string) => void;
  onCancel: () => void;
  header?: string;
  cancelLabel?: string;
  className?: string;
};

export const InlineOptionSelect = ({
  options,
  onSelect,
  onCancel,
  header,
  cancelLabel = 'Cancel',
  className,
}: InlineOptionSelectProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigableCount = options.length + 1;

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev <= 0 ? navigableCount - 1 : prev - 1));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev >= navigableCount - 1 ? 0 : prev + 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex === options.length) {
        onCancel();
      } else {
        onSelect(options[selectedIndex].value);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    } else {
      const numKey = Number(e.key);
      if (numKey >= 1 && numKey <= options.length) {
        e.preventDefault();
        onSelect(options[numKey - 1].value);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      role="listbox"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={cn('flex flex-col outline-none rounded-md', className)}
    >
      {header && (
        <div className='text-xs text-muted-foreground px-3 py-1.5'>
          {header}
        </div>
      )}
      {options.map((option, index) => (
        <div
          key={option.value}
          role="option"
          aria-selected={selectedIndex === index}
          className={cn(
            'px-3 py-2 text-sm cursor-pointer rounded-sm transition-colors',
            selectedIndex === index
              ? 'bg-accent text-accent-foreground'
              : 'text-foreground hover:bg-accent/50',
          )}
          onClick={() => onSelect(option.value)}
          onKeyDown={handleKeyDown}
        >
          <span className='text-muted-foreground mr-2'>{index + 1}.</span>
          {option.label}
        </div>
      ))}
      <div
        role="option"
        aria-selected={selectedIndex === options.length}
        className={cn(
          'px-3 py-2 text-sm cursor-pointer rounded-sm transition-colors text-muted-foreground',
          selectedIndex === options.length &&
            'bg-accent text-accent-foreground',
        )}
        onClick={onCancel}
        onKeyDown={handleKeyDown}
      >
        {cancelLabel} <span className='text-muted-foreground ml-2 text-xs'>esc</span>
      </div>
    </div>
  );
};

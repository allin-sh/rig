/**
 * useTextSelection Hook
 * Handles text selection within a container and manages popover state
 */

import { useEffect, useRef, useState } from 'react';
import { fromEvent } from 'rxjs';
import { filter, map, sample, throttleTime } from 'rxjs/operators';

interface UseTextSelectionReturn {
  selectedText: string;
  isTextSelected: boolean;
  selectionBoundingRect: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Hook to manage text selection and popover state
 *
 * @returns Object containing selection state and handlers
 */
export function useTextSelection(): UseTextSelectionReturn {
  const [selectedText, setSelectedText] = useState('');
  const [isTextSelected, setIsTextSelected] = useState(false);
  const [selectionBoundingRect, setSelectionBoundingRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  }>({ left: 0, top: 0, width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Create observables for selection and pointer events
    const selectionChange$ = fromEvent(document, 'selectionchange').pipe(
      throttleTime(100), // Throttle rapid selection changes
      map(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim();

        if (container && selection && selection.rangeCount > 0 && text) {
          const range = selection.getRangeAt(0);

          // Check if the selection is within the container
          if (container.contains(range.commonAncestorContainer)) {
            const rect = range.getBoundingClientRect();
            return {
              text,
              rect: {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
              },
              isValid: true,
            };
          }
        }

        return { text: '', rect: null, isValid: false };
      }),
    );

    // Pointer up event to confirm selection
    const pointerUp$ = fromEvent<PointerEvent>(document, 'pointerup');

    // Valid selections: only emit when pointer is released
    const validSelection$ = selectionChange$.pipe(
      sample(pointerUp$),
      filter(selection => selection.isValid && !!selection.text),
    );

    // Deselections: emit immediately (no need to wait for pointerup)
    const deselection$ = selectionChange$.pipe(
      filter(selection => !selection.isValid || !selection.text),
    );

    // Subscribe to valid selections
    const validSelectionSubscription = validSelection$.subscribe(selection => {
      if (selection.rect) {
        setSelectedText(selection.text);
        setSelectionBoundingRect(selection.rect);
        setIsTextSelected(true);
      }
    });

    // Subscribe to deselections
    const deselectionSubscription = deselection$.subscribe(() => {
      setIsTextSelected(false);
      setSelectedText('');
    });

    // Handle clicks outside to close
    const clickOutside$ = fromEvent<PointerEvent>(document, 'pointerdown').pipe(
      filter(event => {
        const target = event.target as Node;
        return !container.contains(target);
      }),
    );

    const clickOutsideSubscription = clickOutside$.subscribe(() => {
      setIsTextSelected(false);
      setSelectedText('');
    });

    return () => {
      validSelectionSubscription.unsubscribe();
      deselectionSubscription.unsubscribe();
      clickOutsideSubscription.unsubscribe();
    };
  }, []);

  return {
    selectedText,
    isTextSelected,
    selectionBoundingRect,
    containerRef,
  };
}

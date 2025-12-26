/**
 * Extension API Implementation
 * Provides the actual implementation of ExtensionAPI interface
 */

'use client';

import type {
  AIAskOptions,
  AIResponse,
  AIStreamChunk,
  ExtensionAPI,
  ModalContent,
  ModalOptions,
  PopoverItemComponent,
  SidebarPanel,
  UnregisterFn,
} from '@allin/extension-api';
import type { useSetAtom } from 'jotai';
import type {
  modalsActionsAtom,
  popoverItemsActionsAtom,
  sidebarPanelsActionsAtom,
} from '../store/extension-store';

let modalIdCounter = 0;

/**
 * Create ExtensionAPI implementation
 */
export function createExtensionAPI(
  setPopoverItems: ReturnType<
    typeof useSetAtom<typeof popoverItemsActionsAtom>
  >,
  setModals: ReturnType<typeof useSetAtom<typeof modalsActionsAtom>>,
  setSidebarPanels: ReturnType<
    typeof useSetAtom<typeof sidebarPanelsActionsAtom>
  >,
): ExtensionAPI {
  return {
    selectionPopover: {
      add(id: string, component: PopoverItemComponent): UnregisterFn {
        setPopoverItems({ type: 'add', id, component });

        return () => {
          setPopoverItems({ type: 'remove', id });
        };
      },

      remove(id: string): void {
        setPopoverItems({ type: 'remove', id });
      },

      list(): string[] {
        // TODO: Implement with useAtomValue in the component
        return [];
      },

      has(_id: string): boolean {
        // TODO: Implement with useAtomValue in the component
        return false;
      },
    },

    modal: {
      open(content: ModalContent, options?: ModalOptions): string {
        const id = `modal-${modalIdCounter++}`;
        setModals({ type: 'open', modal: { id, content, options } });
        return id;
      },

      close(id?: string): void {
        setModals({ type: 'close', id });
      },

      closeAll(): void {
        setModals({ type: 'closeAll' });
      },

      list(): string[] {
        // TODO: Implement with useAtomValue in the component
        return [];
      },
    },

    sidebar: {
      add(id: string, panel: SidebarPanel): UnregisterFn {
        setSidebarPanels({ type: 'add', id, panel });

        return () => {
          setSidebarPanels({ type: 'remove', id });
        };
      },

      remove(id: string): void {
        setSidebarPanels({ type: 'remove', id });
      },

      list(): string[] {
        // TODO: Implement with useAtomValue in the component
        return [];
      },

      has(_id: string): boolean {
        // TODO: Implement with useAtomValue in the component
        return false;
      },

      open(id: string): void {
        setSidebarPanels({ type: 'open', id });
      },

      close(id: string): void {
        setSidebarPanels({ type: 'close', id });
      },

      toggle(id: string): void {
        setSidebarPanels({ type: 'toggle', id });
      },
    },

    ai: {
      async ask(prompt: string, options?: AIAskOptions): Promise<AIResponse> {
        // TODO: Integrate with @allin/chat
        // For PoC, use a simple fetch
        try {
          const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt,
              model: options?.model,
              systemPrompt: options?.systemPrompt,
              temperature: options?.temperature,
              maxTokens: options?.maxTokens,
              context: options?.context,
            }),
          });

          if (!response.ok) {
            throw new Error(`AI request failed: ${response.statusText}`);
          }

          const data = await response.json();

          return {
            content: data.content,
            model: data.model || 'unknown',
            usage: data.usage,
          };
        } catch (error) {
          throw new Error(`AI request failed: ${error}`);
        }
      },

      async *stream(
        prompt: string,
        options?: AIAskOptions,
      ): AsyncIterable<AIStreamChunk> {
        // TODO: Integrate with @allin/chat streaming
        // For PoC, simple implementation
        const response = await fetch('/api/ai/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            model: options?.model,
            systemPrompt: options?.systemPrompt,
            temperature: options?.temperature,
            maxTokens: options?.maxTokens,
            context: options?.context,
          }),
        });

        if (!response.body) {
          throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let content = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            yield { content, delta: '', done: true };
            break;
          }

          const chunk = decoder.decode(value);
          content += chunk;

          yield {
            content,
            delta: chunk,
            done: false,
          };
        }
      },
    },
  };
}

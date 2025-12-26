/**
 * Modal Renderer
 * Renders all open modals
 */

'use client';

import { Dialog, DialogContent } from '@allin/ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { modalsActionsAtom, modalsAtom } from '../store/extension-store';

export function ModalRenderer() {
  const modals = useAtomValue(modalsAtom);
  const setModals = useSetAtom(modalsActionsAtom);

  if (modals.length === 0) {
    return null;
  }

  return (
    <>
      {modals.map(modal => {
        const Content = modal.content;
        const closeModal = () => setModals({ type: 'close', id: modal.id });

        return (
          <Dialog
            key={modal.id}
            open={true}
            onOpenChange={open => {
              if (!open) closeModal();
            }}
          >
            <DialogContent
              className={modal.options?.className}
              onEscapeKeyDown={
                modal.options?.closeOnEscape !== false
                  ? undefined
                  : e => e.preventDefault()
              }
              onPointerDownOutside={
                modal.options?.closeOnBackdropClick !== false
                  ? undefined
                  : e => e.preventDefault()
              }
            >
              <Content close={closeModal} modalId={modal.id} />
            </DialogContent>
          </Dialog>
        );
      })}
    </>
  );
}

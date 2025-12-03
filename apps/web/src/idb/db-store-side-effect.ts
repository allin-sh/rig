import { observe } from 'jotai-effect';
import { dbAtoms } from './db-store';

type ObserveStore = Parameters<typeof observe>[1];

export const observeAddMessage = (store: ObserveStore) => {
  return observe((get, set) => {
    const messagesPromise = get(dbAtoms.allMessagesAtom);
    messagesPromise.then(messages => {
      const lastMessageChannelId = messages.at(-1)?.channelId;

      if (lastMessageChannelId) {
        set(dbAtoms.updateChannelAtom, lastMessageChannelId, {
          isEmpty: false,
          updatedAt: Date.now(),
        });
      }
    });
  }, store);
};

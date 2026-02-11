import type { ChatUIMessage } from '@allin/message-metadata-schema';
import { invoke } from '@tauri-apps/api/core';
import {
  storageMessageToUiMessage,
  uiMessageToStorageMessage,
} from './messageMapper';
import type { StorageMessage } from './types';

export const messageGateway = {
  getAll: async (channelId: string) => {
    const storageMessages = await invoke<StorageMessage[]>('get_messages', {
      channelId,
    });
    return storageMessages.map(storageMessageToUiMessage);
  },

  append: async (channelId: string, message: ChatUIMessage) => {
    const storageMessage = uiMessageToStorageMessage(message);
    return await invoke<void>('append_message', {
      channelId,
      message: storageMessage,
    });
  },

  upsert: async (channelId: string, message: ChatUIMessage) => {
    const storageMessage = uiMessageToStorageMessage(message);
    return await invoke<void>('upsert_message', {
      channelId,
      message: storageMessage,
    });
  },
};

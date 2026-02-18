import type { ChatUIMessage } from '@allin/message-metadata-schema';

export namespace PendingMessage {
  type ChannelId = string;
  const map = new Map<ChannelId, ChatUIMessage>();

  export function clear(channelId: ChannelId) {
    map.delete(channelId);
  }

  export function set(channelId: ChannelId, message: ChatUIMessage) {
    map.set(channelId, message);
  }

  export function get(channelId: ChannelId): ChatUIMessage | undefined {
    return map.get(channelId);
  }
}

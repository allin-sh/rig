import type { UIMessage } from 'ai';
import { noop } from 'es-toolkit';
import { getDefaultStore } from 'jotai';
import { useEffect, useMemo, useState } from 'react';
import { getProviderFromModel } from '@/core/chat/ai-model';
import { type ChatFacade, createChatFacade } from '@/core/chat/ChatFacade';
import { ChatFacadeManager } from '@/core/chat/ChatFacadeManager';
import { useChat } from '@/core/chat/useChat';
import { messagesToThreads } from '@/core/helper';
import { dbAtoms } from '@/idb/dbStore';
import { assertDefined } from '@/utils/assertDefined';
import { useSwrAtomValue } from '@/utils/useSwrAtomValue';
import { ChatInput } from './ChatInput';
import { ChatList } from './ChatList';

export const Chatting = () => {
  const selectedChannel = useSwrAtomValue(dbAtoms.selectedChannelAtom);
  const config = useSwrAtomValue(dbAtoms.configAtom);
  const [chatFacade, setChatFacade] = useState<ChatFacade<UIMessage> | null>(
    null,
  );
  const { sendMessage, uiMessages, status } = useChat(chatFacade);
  const threads = useMemo(() => messagesToThreads(uiMessages), [uiMessages]);

  assertDefined(selectedChannel, 'RootView: selectedChannel is not found.');

  useEffect(() => {
    const loadChatFacade = async () => {
      const { id, model } = selectedChannel;
      const { googleApiKey, openaiApiKey } = config;

      const provider = getProviderFromModel(model);
      if (ChatFacadeManager.getChatFacade(id)) {
        const chatFacade = ChatFacadeManager.getChatFacade(id);
        chatFacade!.setLLMModel(
          provider,
          model,
          provider === 'google' ? googleApiKey! : openaiApiKey!,
        );
        setChatFacade(chatFacade!);
        return;
      }

      const selectedChannelMessages = await getDefaultStore().get(
        dbAtoms.selectedChannelMessagesAtom,
      );
      const chatFacade = createChatFacade(
        provider === 'google' ? googleApiKey! : openaiApiKey!,
        provider,
        model,
        {
          id,
          messages: selectedChannelMessages,
          onData: noop,
          onFinish: noop,
          onError: noop,
        },
      );
      ChatFacadeManager.setChatFacade(id, chatFacade);
      setChatFacade(chatFacade);
    };

    loadChatFacade();
  }, [selectedChannel, config]);

  return (
    <>
      <ChatList threads={threads} status={status} />
      <ChatInput sendMessage={sendMessage as (message: UIMessage) => void} />
    </>
  );
};

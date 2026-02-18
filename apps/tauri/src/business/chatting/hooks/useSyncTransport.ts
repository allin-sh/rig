import type { ProviderId } from '@allin/ai';
import { useEffect } from 'react';
import { firstValueFrom, skip } from 'rxjs';
import { AgentManager } from '@/business/agent/AgentManager';
import type { ChatFacade } from '../facade/ChatFacade';
import { TauriChatTransport } from '../tauri-chat-transport';

export const useSyncTransport = (chatFacade: ChatFacade | null) => {
  useEffect(() => {
    if (!chatFacade) return;

    const agentManager = AgentManager.getInstance();
    const subscription = agentManager.selectedAgentId$
      // skip initial BehaviorSubject emission — facade is already created with the correct transport
      .pipe(skip(1))
      .subscribe(async agentId => {
        if (!agentId) return;
        const agent = agentManager.agents.find(a => a.id === agentId);
        if (!agent) return;

        const status = chatFacade.getStatus();
        if (status === 'streaming' || status === 'submitted') {
          await firstValueFrom(chatFacade.finish$);
        }

        const transport = new TauriChatTransport({
          providerName: agent.providerName as ProviderId,
          modelId: agent.model,
        });
        chatFacade.updateTransport(transport);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [chatFacade]);
};

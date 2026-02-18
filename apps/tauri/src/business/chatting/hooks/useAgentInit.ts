import { useEffect } from 'react';
import { AgentManager } from '../../agent/AgentManager';

export const useAgentInit = () => {
  useEffect(() => {
    const init = async () => {
      const agentManager = AgentManager.getInstance();
      const agents = await agentManager.loadAgents();
      agentManager.setSelectedAgent(agents[0].id);
    };

    init();
  }, []);
};

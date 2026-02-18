import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
import { AgentManager } from './AgentManager';

export const useAgent = () => {
  const agentManagerRef = useRef(AgentManager.getInstance());

  const subscribeToAgents = useCallback((onChange: () => void) => {
    const subscription = agentManagerRef.current.agents$.subscribe(onChange);
    return () => subscription.unsubscribe();
  }, []);
  const getAgentsSnapshot = useCallback(
    () => agentManagerRef.current.agents,
    [],
  );
  const agents = useSyncExternalStore(
    subscribeToAgents,
    getAgentsSnapshot,
    getAgentsSnapshot,
  );

  const subscribeToSelectedAgentId = useCallback((onChange: () => void) => {
    const subscription =
      agentManagerRef.current.selectedAgentId$.subscribe(onChange);
    return () => subscription.unsubscribe();
  }, []);

  const getSelectedAgentIdSnapshot = useCallback(
    () => agentManagerRef.current.selectedAgentId,
    [],
  );

  const selectedAgentId = useSyncExternalStore(
    subscribeToSelectedAgentId,
    getSelectedAgentIdSnapshot,
    getSelectedAgentIdSnapshot,
  );

  const selectedAgent = useMemo(() => {
    return agents.find(a => a.id === selectedAgentId) ?? null;
  }, [agents, selectedAgentId]);

  const setSelectedAgentId = useCallback((agentId: string) => {
    agentManagerRef.current.setSelectedAgent(agentId);
  }, []);

  const cycleSelectedAgent = useCallback(() => {
    agentManagerRef.current.cycleSelectedAgent();
  }, []);

  return {
    agents,
    selectedAgent,
    selectedAgentId,
    setSelectedAgentId,
    cycleSelectedAgent,
  };
};

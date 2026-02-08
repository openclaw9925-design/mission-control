'use client';

import { Agent } from '@/types';
import AgentCard from './AgentCard';

interface AgentListProps {
  agents: Agent[];
  onAgentClick?: (agent: Agent) => void;
}

export default function AgentList({ agents, onAgentClick }: AgentListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.length === 0 ? (
        <div className="col-span-full text-center py-12 text-gray-400">
          No agents configured yet
        </div>
      ) : (
        agents.map((agent) => (
          <AgentCard 
            key={agent.id} 
            agent={agent} 
            onClick={() => onAgentClick?.(agent)}
          />
        ))
      )}
    </div>
  );
}

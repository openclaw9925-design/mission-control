'use client';

import { Agent, AgentStatus } from '@/types';
import Badge from '@/components/ui/Badge';

interface AgentCardProps {
  agent: Agent;
  onClick?: () => void;
}

const statusColors: Record<AgentStatus, string> = {
  idle: 'bg-gray-400',
  active: 'bg-green-500 animate-pulse',
  blocked: 'bg-red-500',
};

const statusLabels: Record<AgentStatus, string> = {
  idle: 'Idle',
  active: 'Active',
  blocked: 'Blocked',
};

const agentEmojis: Record<string, string> = {
  clawdbot: '🤖',
  friday: '⚙️',
  pixel: '🎨',
};

export default function AgentCard({ agent, onClick }: AgentCardProps) {
  const emoji = agentEmojis[agent.name] || '🤖';

  return (
    <div 
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="text-4xl">{emoji}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{agent.displayName}</h3>
          <p className="text-sm text-gray-500">{agent.role}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusColors[agent.status]}`}></div>
          <Badge 
            variant={agent.status === 'active' ? 'success' : agent.status === 'blocked' ? 'danger' : 'default'}
          >
            {statusLabels[agent.status]}
          </Badge>
        </div>
      </div>

      {/* Current Task */}
      {agent.currentTaskId ? (
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-1">
            Current Task
          </div>
          <div className="text-sm text-gray-700">
            Working on task...
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <span className="text-sm text-gray-400">No current task</span>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
        <div className="flex justify-between">
          <span>Session: {agent.sessionKey}</span>
          {agent.lastHeartbeat && (
            <span>Last active: {new Date(agent.lastHeartbeat).toLocaleTimeString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

interface Agent {
  id: string;
  name: string;
  displayName: string;
  role: string;
  status: string;
  currentTaskId: string | null;
  lastHeartbeat: string | null;
}

interface Props {
  agent: Agent;
  onClick?: () => void;
}

const statusColors: Record<string, string> = {
  idle: 'bg-gray-100 text-gray-600',
  active: 'bg-green-100 text-green-700',
  blocked: 'bg-red-100 text-red-700',
};

const agentEmojis: Record<string, string> = {
  clawdbot: '🤖',
  friday: '⚙️',
  pixel: '🎨',
};

export default function AgentCard({ agent, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {agentEmojis[agent.name] || '🤖'}
          </span>
          <div>
            <div className="font-medium text-gray-800">
              {agent.displayName}
            </div>
            <div className="text-sm text-gray-500">
              {agent.role}
            </div>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[agent.status]}`}>
          {agent.status}
        </span>
      </div>
    </div>
  );
}

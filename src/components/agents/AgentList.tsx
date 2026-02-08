'use client';

import { useState, useEffect } from 'react';

interface Agent {
  id: string;
  name: string;
  displayName: string;
  role: string;
  sessionKey: string;
  status: string;
  currentTaskId: string | null;
  lastHeartbeat: string | null;
  createdAt: string;
  currentTask?: {
    id: string;
    title: string;
    status: string;
  } | null;
  _count?: {
    assignments: number;
    messages: number;
  };
}

const statusColors: Record<string, string> = {
  idle: 'bg-gray-100 text-gray-600',
  active: 'bg-green-100 text-green-700',
  blocked: 'bg-red-100 text-red-700',
};

const statusIcons: Record<string, string> = {
  idle: '💤',
  active: '✅',
  blocked: '🚫',
};

const agentEmojis: Record<string, string> = {
  clawdbot: '🤖',
  friday: '⚙️',
  pixel: '🎨',
};

export default function AgentList() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAgents, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      if (data.success) {
        setAgents(data.data);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLastActive = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading agents...</div>
      </div>
    );
  }

  const activeCount = agents.filter(a => a.status === 'active').length;
  const idleCount = agents.filter(a => a.status === 'idle').length;
  const blockedCount = agents.filter(a => a.status === 'blocked').length;

  return (
    <div>
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{activeCount}</div>
          <div className="text-sm text-green-700">Active</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-gray-600">{idleCount}</div>
          <div className="text-sm text-gray-700">Idle</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-red-600">{blockedCount}</div>
          <div className="text-sm text-red-700">Blocked</div>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">
                  {agentEmojis[agent.name] || '🤖'}
                </span>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {agent.displayName}
                  </h3>
                  <p className="text-sm text-gray-500">{agent.role}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[agent.status]}`}>
                {statusIcons[agent.status]} {agent.status}
              </span>
            </div>

            {/* Current Task */}
            {agent.currentTask ? (
              <div className="bg-blue-50 rounded p-3 mb-4">
                <div className="text-xs text-blue-600 font-medium mb-1">Current Task</div>
                <a
                  href={`/tasks?highlight=${agent.currentTask.id}`}
                  className="text-sm text-blue-800 hover:underline line-clamp-2"
                >
                  {agent.currentTask.title}
                </a>
              </div>
            ) : (
              <div className="bg-gray-50 rounded p-3 mb-4 text-center text-gray-400 text-sm">
                No current task
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                📋 {agent._count?.assignments || 0} tasks
              </span>
              <span>
                💬 {agent._count?.messages || 0} messages
              </span>
            </div>

            {/* Last Active */}
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
              Last active: {formatLastActive(agent.lastHeartbeat)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

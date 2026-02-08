'use client';

import { useState, useEffect } from 'react';

interface Standup {
  generatedAt: string;
  date: string;
  summary: {
    totalTasks: number;
    completed: number;
    inProgress: number;
    inReview: number;
    blocked: number;
  };
  agents: Array<{
    name: string;
    role: string;
    status: string;
    currentTask: string | null;
    recentActivity: number;
    tasks: Array<{ title: string; status: string }>;
  }>;
  completedTasks: Array<{
    id: string;
    title: string;
    completedBy: string;
  }>;
  inProgressTasks: Array<{
    id: string;
    title: string;
    assignees: string[];
  }>;
  reviewTasks: Array<{
    id: string;
    title: string;
    assignees: string[];
  }>;
  blockedTasks: Array<{
    id: string;
    title: string;
    description: string | null;
  }>;
  recentActivities: Array<{
    type: string;
    message: string;
    agent: string;
    task: string | null;
    time: string;
  }>;
}

const agentEmojis: Record<string, string> = {
  clawdbot: '🤖',
  friday: '⚙️',
  pixel: '🎨',
};

const activityIcons: Record<string, string> = {
  task_created: '📋',
  task_assigned: '👤',
  status_changed: '🔄',
  message_sent: '💬',
  agent_active: '🤖',
  document_created: '📄',
};

export default function StandupReport() {
  const [standup, setStandup] = useState<Standup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStandup();
  }, []);

  const fetchStandup = async () => {
    try {
      const response = await fetch('/api/standup');
      const data = await response.json();
      if (data.success) {
        setStandup(data.data);
      }
    } catch (error) {
      console.error('Error fetching standup:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Generating standup report...</div>
      </div>
    );
  }

  if (!standup) {
    return (
      <div className="text-center py-12 text-gray-500">
        Failed to generate standup report
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6">
        <h2 className="text-2xl font-bold">📊 Daily Standup</h2>
        <p className="text-blue-100 mt-1">{standup.date}</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-gray-800">{standup.summary.totalTasks}</div>
          <div className="text-sm text-gray-500">Total Tasks</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{standup.summary.completed}</div>
          <div className="text-sm text-green-700">✅ Completed</div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-yellow-600">{standup.summary.inProgress}</div>
          <div className="text-sm text-yellow-700">🔄 In Progress</div>
        </div>
        <div className="bg-purple-50 rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-purple-600">{standup.summary.inReview}</div>
          <div className="text-sm text-purple-700">👀 Review</div>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-red-600">{standup.summary.blocked}</div>
          <div className="text-sm text-red-700">🚫 Blocked</div>
        </div>
      </div>

      {/* Agent Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🤖 Agent Status</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {standup.agents.map((agent, idx) => (
            <div key={idx} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{agentEmojis[agent.name.toLowerCase()] || '🤖'}</span>
                  <div>
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-sm text-gray-500">{agent.role}</div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  agent.status === 'active' ? 'bg-green-100 text-green-700' :
                  agent.status === 'blocked' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {agent.status}
                </span>
              </div>
              {agent.currentTask && (
                <div className="text-sm text-gray-600 mt-2">
                  <span className="text-gray-400">Current:</span> {agent.currentTask}
                </div>
              )}
              {agent.tasks.length > 0 && (
                <div className="text-sm text-gray-500 mt-2">
                  {agent.tasks.length} assigned task(s)
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Completed Tasks */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">✅ Completed Today</h3>
          {standup.completedTasks.length === 0 ? (
            <p className="text-gray-400 text-sm">No tasks completed today</p>
          ) : (
            <ul className="space-y-2">
              {standup.completedTasks.map(task => (
                <li key={task.id} className="flex items-start gap-2 text-sm">
                  <span className="text-green-500">✓</span>
                  <div>
                    <span className="text-gray-700">{task.title}</span>
                    {task.completedBy && (
                      <span className="text-gray-400 ml-2">({task.completedBy})</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🔄 In Progress</h3>
          {standup.inProgressTasks.length === 0 ? (
            <p className="text-gray-400 text-sm">No tasks in progress</p>
          ) : (
            <ul className="space-y-2">
              {standup.inProgressTasks.map(task => (
                <li key={task.id} className="flex items-start gap-2 text-sm">
                  <span className="text-yellow-500">◐</span>
                  <div>
                    <span className="text-gray-700">{task.title}</span>
                    {task.assignees.length > 0 && (
                      <span className="text-gray-400 ml-2">({task.assignees.join(', ')})</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Needs Review */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">👀 Needs Review</h3>
          {standup.reviewTasks.length === 0 ? (
            <p className="text-gray-400 text-sm">No tasks need review</p>
          ) : (
            <ul className="space-y-2">
              {standup.reviewTasks.map(task => (
                <li key={task.id} className="flex items-start gap-2 text-sm">
                  <span className="text-purple-500">◉</span>
                  <div>
                    <span className="text-gray-700">{task.title}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Blocked */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🚫 Blocked</h3>
          {standup.blockedTasks.length === 0 ? (
            <p className="text-gray-400 text-sm">No blocked tasks 🎉</p>
          ) : (
            <ul className="space-y-2">
              {standup.blockedTasks.map(task => (
                <li key={task.id} className="p-2 bg-red-50 rounded text-sm">
                  <div className="font-medium text-red-800">{task.title}</div>
                  {task.description && (
                    <div className="text-red-600 text-xs mt-1">{task.description}</div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Recent Activity (24h)</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {standup.recentActivities.map((activity, idx) => (
            <div key={idx} className="flex items-center gap-3 text-sm py-2 border-b border-gray-100 last:border-0">
              <span className="text-lg">{activityIcons[activity.type] || '📌'}</span>
              <span className="text-gray-400 w-16">{formatTime(activity.time)}</span>
              <span className="font-medium text-gray-700">{activity.agent}</span>
              <span className="text-gray-600">{activity.message}</span>
              {activity.task && (
                <span className="text-blue-600">({activity.task})</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchStandup}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Refresh Report
        </button>
      </div>
    </div>
  );
}

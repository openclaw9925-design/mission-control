'use client';

import { useState, useEffect } from 'react';

interface Activity {
  id: string;
  type: string;
  message: string;
  metadata: string | null;
  createdAt: string;
  agent: {
    id: string;
    name: string;
    displayName: string;
    role: string;
  };
  task: {
    id: string;
    title: string;
    status: string;
  } | null;
}

const activityIcons: Record<string, string> = {
  task_created: '📋',
  task_assigned: '👤',
  status_changed: '🔄',
  message_sent: '💬',
  agent_active: '🤖',
  document_created: '📄',
  agent_created: '✨',
};

const activityColors: Record<string, string> = {
  task_created: 'bg-blue-50 border-blue-200',
  task_assigned: 'bg-purple-50 border-purple-200',
  status_changed: 'bg-yellow-50 border-yellow-200',
  message_sent: 'bg-green-50 border-green-200',
  agent_active: 'bg-indigo-50 border-indigo-200',
  document_created: 'bg-orange-50 border-orange-200',
  agent_created: 'bg-pink-50 border-pink-200',
};

const agentEmojis: Record<string, string> = {
  clawdbot: '🤖',
  friday: '⚙️',
  pixel: '🎨',
};

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();

    // Subscribe to SSE for real-time updates
    const eventSource = new EventSource('/api/events');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'activity_created') {
        setActivities(prev => [data.data, ...prev].slice(0, 50));
      } else if (data.type === 'task_created' || data.type === 'task_updated') {
        fetchActivities();
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities?limit=30');
      const data = await response.json();
      if (data.success) {
        setActivities(data.data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading activities...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-2">📭</div>
          <p>No activities yet</p>
          <p className="text-sm">Activities will appear here as agents work on tasks</p>
        </div>
      ) : (
        activities.map((activity) => (
          <div
            key={activity.id}
            className={`p-4 rounded-lg border ${activityColors[activity.type] || 'bg-gray-50 border-gray-200'}`}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <span className="text-2xl">
                {activityIcons[activity.type] || '📌'}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">
                    {agentEmojis[activity.agent.name] || '👤'}
                  </span>
                  <span className="font-medium text-gray-800">
                    {activity.agent.displayName}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-500">
                    {formatTime(activity.createdAt)}
                  </span>
                </div>
                <p className="text-gray-700">{activity.message}</p>
                {activity.task && (
                  <a
                    href={`/tasks?highlight=${activity.task.id}`}
                    className="inline-block mt-2 text-sm text-blue-600 hover:underline"
                  >
                    📋 {activity.task.title}
                  </a>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

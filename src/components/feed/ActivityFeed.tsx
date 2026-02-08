'use client';

import { Activity, ActivityType } from '@/types';

interface ActivityFeedProps {
  activities: Activity[];
  limit?: number;
}

const activityIcons: Record<ActivityType, string> = {
  task_created: '📋',
  task_assigned: '👤',
  status_changed: '🔄',
  message_sent: '💬',
  agent_active: '🤖',
  document_created: '📄',
};

const activityColors: Record<ActivityType, string> = {
  task_created: 'bg-blue-100 text-blue-800',
  task_assigned: 'bg-purple-100 text-purple-800',
  status_changed: 'bg-yellow-100 text-yellow-800',
  message_sent: 'bg-green-100 text-green-800',
  agent_active: 'bg-indigo-100 text-indigo-800',
  document_created: 'bg-orange-100 text-orange-800',
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function ActivityFeed({ activities, limit = 20 }: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, limit);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <span>📈</span> Activity Feed
        </h3>
      </div>
      
      <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {displayedActivities.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No recent activity
          </div>
        ) : (
          displayedActivities.map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${activityColors[activity.type]}`}>
                  {activityIcons[activity.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">
                    {activity.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span>{formatRelativeTime(activity.createdAt)}</span>
                    {activity.agentId && (
                      <>
                        <span>•</span>
                        <span>Agent: {activity.agentId}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

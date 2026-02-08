'use client';

import { useState, useEffect } from 'react';
import { Activity } from '@/types';
import Header from '@/components/layout/Header';
import ActivityFeed from '@/components/feed/ActivityFeed';

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/activities?limit=100');
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

    fetchActivities();

    // Subscribe to SSE for real-time updates
    const eventSource = new EventSource('/api/events');
    eventSource.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === 'activity_created') {
        fetchActivities();
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading activities...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">Activity Feed</h2>
          <p className="text-sm text-gray-500">Recent agent and task activities</p>
        </div>
        <div className="max-w-2xl">
          <ActivityFeed activities={activities} limit={100} />
        </div>
      </div>
    </div>
  );
}

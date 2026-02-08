'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task, TaskStatus } from '@/types';
import Header from '@/components/layout/Header';
import TaskBoard from '@/components/tasks/TaskBoard';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      if (data.success) {
        setTasks(data.data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();

    // Subscribe to SSE for real-time updates
    const eventSource = new EventSource('/api/events');
    eventSource.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === 'task_created' || payload.type === 'task_updated' || payload.type === 'task_deleted') {
        fetchTasks();
      }
    };

    return () => {
      eventSource.close();
    };
  }, [fetchTasks]);

  const handleTaskStatusChange = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  }, [fetchTasks]);

  const handleCreateTask = useCallback(async (taskData: { title: string; description: string; priority: string }) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      
      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  }, [fetchTasks]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 p-6 overflow-auto">
        <TaskBoard
          tasks={tasks}
          onTaskClick={(task) => setSelectedTask(task)}
          onTaskStatusChange={handleTaskStatusChange}
          onCreateTask={handleCreateTask}
        />
      </div>

      {/* Task Detail Modal */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title={selectedTask?.title || 'Task Details'}
        size="lg"
      >
        {selectedTask && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <p className="text-gray-600">{selectedTask.description || 'No description'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <p className="text-gray-600 capitalize">{selectedTask.status.replace('_', ' ')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <p className="text-gray-600 capitalize">{selectedTask.priority}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setSelectedTask(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

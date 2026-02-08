'use client';

import { useState, useEffect, useCallback } from 'react';
import TaskColumn from './TaskColumn';
import TaskModal from './TaskModal';
import TaskDetail from './TaskDetail';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    displayName: string;
    role: string;
  };
  assignments: Array<{
    agent: {
      id: string;
      name: string;
      displayName: string;
      role: string;
    };
  }>;
  currentAgent?: {
    id: string;
    name: string;
    displayName: string;
  } | null;
  _count?: {
    messages: number;
    documents: number;
  };
}

export interface Agent {
  id: string;
  name: string;
  displayName: string;
  role: string;
  status: string;
}

const columns = [
  { id: 'inbox', title: '📥 Inbox', color: 'bg-gray-500' },
  { id: 'assigned', title: '👤 Assigned', color: 'bg-blue-500' },
  { id: 'in_progress', title: '🔄 In Progress', color: 'bg-yellow-500' },
  { id: 'review', title: '👀 Review', color: 'bg-purple-500' },
  { id: 'done', title: '✅ Done', color: 'bg-green-500' },
  { id: 'blocked', title: '🚫 Blocked', color: 'bg-red-500' },
];

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);

  // Fetch tasks and agents
  const fetchData = useCallback(async () => {
    try {
      const [tasksRes, agentsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/agents'),
      ]);
      
      const tasksData = await tasksRes.json();
      const agentsData = await agentsRes.json();
      
      if (tasksData.success) {
        setTasks(tasksData.data);
      }
      if (agentsData.success) {
        setAgents(agentsData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up SSE for real-time updates
  useEffect(() => {
    const eventSource = new EventSource('/api/events');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'task_created' || data.type === 'task_updated' || data.type === 'message_sent') {
        fetchData();
      } else if (data.type === 'task_deleted') {
        setTasks(prev => prev.filter(t => t.id !== data.data.id));
        if (detailTaskId === data.data.id) {
          setDetailTaskId(null);
        }
      }
    };

    return () => {
      eventSource.close();
    };
  }, [fetchData, detailTaskId]);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    
    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null);
      return;
    }

    // Optimistic update
    setTasks(prev =>
      prev.map(t =>
        t.id === draggedTask.id ? { ...t, status: newStatus } : t
      )
    );

    // Update on server
    try {
      await fetch(`/api/tasks/${draggedTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      console.error('Error updating task:', error);
      fetchData(); // Revert on error
    }

    setDraggedTask(null);
  };

  // Task actions
  const handleTaskClick = (task: Task) => {
    setDetailTaskId(task.id);
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setShowModal(true);
  };

  const handleEditTask = (task: Task) => {
    setDetailTaskId(null);
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleTaskSaved = () => {
    setShowModal(false);
    setSelectedTask(null);
    fetchData();
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      setShowModal(false);
      setSelectedTask(null);
      setDetailTaskId(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Group tasks by status
  const tasksByStatus = columns.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.status === col.id);
    return acc;
  }, {} as Record<string, Task[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Main Board */}
      <div className={`flex-1 flex flex-col transition-all ${detailTaskId ? 'pr-0' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Task Board</h1>
            <p className="text-gray-500">{tasks.length} tasks total</p>
          </div>
          <button
            onClick={handleCreateTask}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>+</span>
            New Task
          </button>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1" style={{ minWidth: '100%' }}>
          {columns.map(column => (
            <TaskColumn
              key={column.id}
              column={column}
              tasks={tasksByStatus[column.id] || []}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
              onDragStart={handleDragStart}
              onTaskClick={handleTaskClick}
              selectedTaskId={detailTaskId}
            />
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      {detailTaskId && (
        <div className="w-96 border-l border-gray-200 bg-white p-4 overflow-y-auto shadow-lg">
          <TaskDetail
            taskId={detailTaskId}
            agents={agents}
            onClose={() => setDetailTaskId(null)}
            onTaskUpdated={fetchData}
          />
        </div>
      )}

      {/* Task Modal (for create/edit) */}
      {showModal && (
        <TaskModal
          task={selectedTask}
          agents={agents}
          onClose={() => setShowModal(false)}
          onSave={handleTaskSaved}
          onDelete={selectedTask ? () => handleDeleteTask(selectedTask.id) : undefined}
        />
      )}
    </div>
  );
}

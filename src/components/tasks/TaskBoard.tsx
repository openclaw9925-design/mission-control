'use client';

import { useState, useCallback } from 'react';
import { Task, TaskStatus } from '@/types';
import TaskColumn from './TaskColumn';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface TaskBoardProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  onCreateTask?: (task: { title: string; description: string; priority: string }) => void;
}

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'inbox', title: 'Inbox', color: 'bg-gray-400' },
  { id: 'assigned', title: 'Assigned', color: 'bg-blue-400' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-yellow-400' },
  { id: 'review', title: 'Review', color: 'bg-purple-400' },
  { id: 'done', title: 'Done', color: 'bg-green-400' },
  { id: 'blocked', title: 'Blocked', color: 'bg-red-400' },
];

export default function TaskBoard({ 
  tasks, 
  onTaskClick, 
  onTaskStatusChange,
  onCreateTask 
}: TaskBoardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('taskId', task.id);
    setDraggedTask(task);
  }, []);

  const handleTaskDrop = useCallback((taskId: string, newStatus: TaskStatus) => {
    if (onTaskStatusChange) {
      onTaskStatusChange(taskId, newStatus);
    }
    setDraggedTask(null);
  }, [onTaskStatusChange]);

  const handleCreateTask = () => {
    if (newTask.title.trim() && onCreateTask) {
      onCreateTask(newTask);
      setNewTask({ title: '', description: '', priority: 'medium' });
      setIsModalOpen(false);
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Task Board</h2>
          <p className="text-sm text-gray-500">{tasks.length} total tasks</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          + New Task
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
        {columns.map((column) => (
          <TaskColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            tasks={getTasksByStatus(column.id)}
            onTaskClick={onTaskClick}
            onTaskDrop={handleTaskDrop}
            onDragStart={handleDragStart}
          />
        ))}
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Task"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Task title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
              placeholder="Task description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask} disabled={!newTask.title.trim()}>
              Create Task
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

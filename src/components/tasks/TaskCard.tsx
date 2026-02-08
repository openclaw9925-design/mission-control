'use client';

import { Task, TaskPriority, TaskStatus } from '@/types';
import Badge from '@/components/ui/Badge';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
}

const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600',
};

const priorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export default function TaskCard({ task, onClick, onDragStart }: TaskCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, task)}
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
          {task.title}
        </h4>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
          {priorityLabels[task.priority]}
        </span>
      </div>

      {/* Description preview */}
      {task.description && (
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>ID: {task.id.slice(-6)}</span>
        <span>{new Date(task.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

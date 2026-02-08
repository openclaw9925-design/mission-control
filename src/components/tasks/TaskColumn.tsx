'use client';

import { Task, TaskStatus } from '@/types';
import TaskCard from './TaskCard';

interface TaskColumnProps {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskDrop?: (taskId: string, newStatus: TaskStatus) => void;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
}

export default function TaskColumn({ 
  id, 
  title, 
  color, 
  tasks, 
  onTaskClick,
  onTaskDrop,
  onDragStart 
}: TaskColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId && onTaskDrop) {
      onTaskDrop(taskId, id);
    }
  };

  return (
    <div 
      className="flex-1 min-w-[280px] max-w-[320px] bg-gray-50 rounded-xl p-4"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`}></div>
          <h3 className="font-semibold text-gray-700">{title}</h3>
        </div>
        <span className="bg-gray-200 text-gray-600 text-sm px-2 py-0.5 rounded-full font-medium">
          {tasks.length}
        </span>
      </div>

      {/* Tasks */}
      <div className="space-y-3 min-h-[200px]">
        {tasks.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8 border-2 border-dashed border-gray-200 rounded-lg">
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick?.(task)}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </div>
  );
}

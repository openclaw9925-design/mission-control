'use client';

import { Task } from './TaskBoard';
import TaskCard from './TaskCard';

interface Column {
  id: string;
  title: string;
  color: string;
}

interface Props {
  column: Column;
  tasks: Task[];
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onTaskClick: (task: Task) => void;
}

export default function TaskColumn({
  column,
  tasks,
  onDragOver,
  onDrop,
  onDragStart,
  onTaskClick,
}: Props) {
  return (
    <div
      className="flex-shrink-0 w-72 bg-gray-100 rounded-lg"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e)}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-700">{column.title}</h3>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
            tasks.length > 0 ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-400'
          }`}>
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks */}
      <div className="p-2 space-y-2 min-h-[200px]">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            Drop tasks here
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onDragStart={onDragStart}
              onClick={() => onTaskClick(task)}
            />
          ))
        )}
      </div>
    </div>
  );
}

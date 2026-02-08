'use client';

import { Task } from './TaskBoard';

interface Props {
  task: Task;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onClick: () => void;
}

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600',
};

const agentEmojis: Record<string, string> = {
  clawdbot: '🤖',
  friday: '⚙️',
  pixel: '🎨',
};

export default function TaskCard({ task, onDragStart, onClick }: Props) {
  const agentEmoji = task.currentAgent
    ? agentEmojis[task.currentAgent.name] || '👤'
    : task.assignments[0]
    ? agentEmojis[task.assignments[0].agent.name] || '👤'
    : null;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={onClick}
      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group"
    >
      {/* Priority Badge */}
      <div className="flex items-center justify-between mb-2">
        <span className={`px-2 py-0.5 text-xs font-medium rounded ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        {agentEmoji && (
          <span className="text-lg" title={task.currentAgent?.displayName || task.assignments[0]?.agent.displayName}>
            {agentEmoji}
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="font-medium text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600">
        {task.title}
      </h4>

      {/* Description Preview */}
      {task.description && (
        <p className="text-sm text-gray-500 line-clamp-2 mb-2">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1">
          {task._count?.messages ? (
            <>
              💬 {task._count.messages}
            </>
          ) : null}
        </span>
        <span>
          {new Date(task.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

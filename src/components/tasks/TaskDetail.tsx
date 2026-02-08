'use client';

import { useState, useEffect, useRef } from 'react';

interface Task {
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
  currentAgent: {
    id: string;
    name: string;
    displayName: string;
  } | null;
  messages: Array<{
    id: string;
    content: string;
    mentions: string | null;
    createdAt: string;
    agent: {
      id: string;
      name: string;
      displayName: string;
      role: string;
    };
  }>;
  documents: Array<{
    id: string;
    title: string;
    type: string;
    createdAt: string;
    agent: {
      id: string;
      name: string;
      displayName: string;
    };
  }>;
  activities: Array<{
    id: string;
    type: string;
    message: string;
    createdAt: string;
    agent: {
      id: string;
      name: string;
      displayName: string;
    };
  }>;
}

interface Agent {
  id: string;
  name: string;
  displayName: string;
  role: string;
}

interface Props {
  taskId: string;
  agents: Agent[];
  onClose: () => void;
  onTaskUpdated: () => void;
}

const statusOptions = [
  { value: 'inbox', label: '📥 Inbox' },
  { value: 'assigned', label: '👤 Assigned' },
  { value: 'in_progress', label: '🔄 In Progress' },
  { value: 'review', label: '👀 Review' },
  { value: 'done', label: '✅ Done' },
  { value: 'blocked', label: '🚫 Blocked' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const agentEmojis: Record<string, string> = {
  clawdbot: '🤖',
  friday: '⚙️',
  pixel: '🎨',
};

export default function TaskDetail({ taskId, agents, onClose, onTaskUpdated }: Props) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'activity' | 'docs'>('comments');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [task?.messages]);

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`);
      const data = await response.json();
      if (data.success) {
        setTask(data.data);
      }
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!task) return;
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTask();
      onTaskUpdated();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      // Parse @mentions from comment
      const mentionRegex = /@(\w+)/g;
      const mentions: string[] = [];
      let match: RegExpExecArray | null;
      while ((match = mentionRegex.exec(newComment)) !== null) {
        const agent = agents.find(a => a.name.toLowerCase() === match![1].toLowerCase());
        if (agent && !mentions.includes(agent.id)) {
          mentions.push(agent.id);
        }
      }

      const clawdbot = agents.find(a => a.name === 'clawdbot');
      
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          agentId: clawdbot?.id || agents[0]?.id,
          content: newComment,
          mentions,
        }),
      });

      setNewComment('');
      fetchTask();
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderContentWithMentions = (content: string) => {
    const mentionRegex = /@(\w+)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = mentionRegex.exec(content)) !== null) {
      if (match!.index > lastIndex) {
        parts.push(content.substring(lastIndex, match!.index));
      }
      const agent = agents.find(a => a.name.toLowerCase() === match![1].toLowerCase());
      parts.push(
        <span
          key={match!.index}
          className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded"
        >
          @{agent?.displayName || match![1]}
        </span>
      );
      lastIndex = match!.index + match![0].length;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading task...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12 text-gray-500">
        Task not found
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-800">{task.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>Created by {task.createdBy.displayName}</span>
          <span>•</span>
          <span>{formatTime(task.createdAt)}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Status</label>
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Priority</label>
          <select
            value={task.priority}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            disabled
          >
            {priorityOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
        </div>
      )}

      {/* Assignees */}
      {task.assignments.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Assignees</h3>
          <div className="flex gap-2">
            {task.assignments.map(a => (
              <span
                key={a.agent.id}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
              >
                {agentEmojis[a.agent.name] || '👤'} {a.agent.displayName}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('comments')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'comments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            💬 Comments ({task.messages.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'activity'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📈 Activity
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'docs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📄 Documents ({task.documents.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'comments' && (
          <div className="space-y-4">
            {task.messages.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              task.messages.map(msg => (
                <div key={msg.id} className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">
                    {agentEmojis[msg.agent.name] || '👤'}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800">
                        {msg.agent.displayName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                    <div className="text-gray-700">
                      {renderContentWithMentions(msg.content)}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-2">
            {task.activities.map(act => (
              <div key={act.id} className="flex items-center gap-3 text-sm py-2 border-b border-gray-100">
                <span className="text-gray-400">{formatTime(act.createdAt)}</span>
                <span>{agentEmojis[act.agent.name] || '👤'}</span>
                <span className="text-gray-700">{act.message}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="space-y-2">
            {task.documents.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No documents attached
              </div>
            ) : (
              task.documents.map(doc => (
                <div
                  key={doc.id}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <div className="font-medium text-gray-800">{doc.title}</div>
                  <div className="text-sm text-gray-500">
                    by {doc.agent.displayName} • {formatTime(doc.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Comment Input */}
      {activeTab === 'comments' && (
        <form onSubmit={handleSubmitComment} className="mt-4 border-t border-gray-200 pt-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment... (@mention agents)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Tip: Use @agent_name to mention agents
          </p>
        </form>
      )}
    </div>
  );
}

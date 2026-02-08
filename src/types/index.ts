// =============================================================================
// Types for Mission Control
// =============================================================================

// Agent Types
export type AgentStatus = 'idle' | 'active' | 'blocked';

export interface Agent {
  id: string;
  name: string;
  displayName: string;
  role: string;
  sessionKey: string;
  status: AgentStatus;
  currentTaskId: string | null;
  lastHeartbeat: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Task Types
export type TaskStatus = 'inbox' | 'assigned' | 'in_progress' | 'review' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

// Message Types
export interface Message {
  id: string;
  taskId: string;
  agentId: string;
  content: string;
  mentions: string | null;
  createdAt: Date;
}

// Activity Types
export type ActivityType = 
  | 'task_created'
  | 'task_assigned'
  | 'status_changed'
  | 'message_sent'
  | 'agent_active'
  | 'document_created';

export interface Activity {
  id: string;
  type: ActivityType;
  agentId: string;
  taskId: string | null;
  message: string;
  metadata: string | null;
  createdAt: Date;
}

// Document Types
export type DocumentType = 'deliverable' | 'research' | 'protocol' | 'note';

export interface Document {
  id: string;
  title: string;
  content: string;
  type: DocumentType;
  taskId: string | null;
  agentId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Notification Types
export interface Notification {
  id: string;
  agentId: string;
  messageId: string | null;
  content: string;
  delivered: boolean;
  deliveredAt: Date | null;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// SSE Event Types
export type EventType = 
  | 'task_created'
  | 'task_updated'
  | 'task_deleted'
  | 'task_assigned'
  | 'message_sent'
  | 'activity_created'
  | 'agent_updated'
  | 'document_created';

export interface EventPayload {
  type: EventType;
  data: unknown;
  timestamp: string;
}

// Kanban Column
export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
}

// Dashboard Stats
export interface DashboardStats {
  totalTasks: number;
  tasksByStatus: Record<TaskStatus, number>;
  activeAgents: number;
  recentActivities: number;
}

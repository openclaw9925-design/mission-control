/**
 * OpenClaw Integration Client
 * 
 * This module provides functions to interact with the running OpenClaw instance
 * via its API endpoints.
 */

const OPENCLAW_URL = process.env.OPENCLAW_URL || 'http://127.0.0.1:3765';
const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN || '';

interface OpenClawResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface SessionInfo {
  sessionKey: string;
  kind: string;
  label?: string;
  lastMessage?: string;
  lastMessageAt?: string;
}

interface AgentSession {
  sessionKey: string;
  agentId?: string;
}

/**
 * Send a message to a specific OpenClaw session
 */
export async function sendToSession(
  sessionKey: string,
  message: string
): Promise<OpenClawResponse<void>> {
  try {
    const response = await fetch(`${OPENCLAW_URL}/api/sessions/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENCLAW_TOKEN}`,
      },
      body: JSON.stringify({
        sessionKey,
        message,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * List all active sessions
 */
export async function listSessions(): Promise<OpenClawResponse<SessionInfo[]>> {
  try {
    const response = await fetch(`${OPENCLAW_URL}/api/sessions/list`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENCLAW_TOKEN}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Notify an agent about a task assignment or mention
 */
export async function notifyAgent(
  sessionKey: string,
  type: 'task_assigned' | 'mention' | 'status_update',
  payload: {
    taskId?: string;
    taskTitle?: string;
    fromAgent?: string;
    message?: string;
  }
): Promise<OpenClawResponse<void>> {
  let message = '';
  
  switch (type) {
    case 'task_assigned':
      message = `📋 New task assigned: "${payload.taskTitle}" (ID: ${payload.taskId})`;
      break;
    case 'mention':
      message = `💬 ${payload.fromAgent} mentioned you: "${payload.message}"`;
      break;
    case 'status_update':
      message = `🔄 Task "${payload.taskTitle}" status updated`;
      break;
  }

  return sendToSession(sessionKey, message);
}

/**
 * Get the OpenClaw gateway status
 */
export async function getGatewayStatus(): Promise<OpenClawResponse<{
  running: boolean;
  version?: string;
}>> {
  try {
    const response = await fetch(`${OPENCLAW_URL}/api/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENCLAW_TOKEN}`,
      },
    });

    if (!response.ok) {
      return { success: false, error: 'Gateway not reachable' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export default {
  sendToSession,
  listSessions,
  notifyAgent,
  getGatewayStatus,
};

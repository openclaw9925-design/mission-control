/**
 * Server-Sent Events (SSE) for real-time updates
 * 
 * This module provides a simple event emitter for broadcasting
 * updates to connected clients.
 */

import { EventEmitter } from 'events';

// Global event emitter for SSE
const eventEmitter = new EventEmitter();

// Increase max listeners for many connected clients
eventEmitter.setMaxListeners(100);

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

/**
 * Emit an event to all connected clients
 */
export function emitEvent(type: EventType, data: unknown): void {
  const payload: EventPayload = {
    type,
    data,
    timestamp: new Date().toISOString(),
  };
  eventEmitter.emit('mission-control-event', payload);
}

/**
 * Subscribe to events (returns cleanup function)
 */
export function subscribeToEvents(
  callback: (payload: EventPayload) => void
): () => void {
  eventEmitter.on('mission-control-event', callback);
  return () => {
    eventEmitter.off('mission-control-event', callback);
  };
}

/**
 * Get the event emitter instance
 */
export function getEventEmitter(): EventEmitter {
  return eventEmitter;
}

export default {
  emitEvent,
  subscribeToEvents,
  getEventEmitter,
};

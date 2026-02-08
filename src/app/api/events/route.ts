import { NextRequest } from 'next/server';
import { subscribeToEvents, EventPayload } from '@/lib/events';

export const dynamic = 'force-dynamic';

// GET /api/events - SSE endpoint for real-time updates
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const connectMessage = `data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`;
      controller.enqueue(encoder.encode(connectMessage));

      // Subscribe to events
      const unsubscribe = subscribeToEvents((payload: EventPayload) => {
        try {
          const message = `data: ${JSON.stringify(payload)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          console.error('Error sending SSE message:', error);
        }
      });

      // Keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        try {
          const ping = `data: ${JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() })}\n\n`;
          controller.enqueue(encoder.encode(ping));
        } catch (error) {
          clearInterval(keepAlive);
        }
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        unsubscribe();
        try {
          controller.close();
        } catch (error) {
          // Stream already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

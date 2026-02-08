import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/messages - List messages for a task
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'taskId is required' },
        { status: 400 }
      );
    }

    const messages = await prisma.message.findMany({
      where: { taskId },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            displayName: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST /api/messages - Create a message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, agentId, content, mentions } = body;

    if (!taskId || !agentId || !content) {
      return NextResponse.json(
        { success: false, error: 'taskId, agentId, and content are required' },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        taskId,
        agentId,
        content,
        mentions: mentions ? JSON.stringify(mentions) : null,
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            displayName: true,
            role: true,
          },
        },
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        type: 'message_sent',
        agentId,
        taskId,
        message: `Commented on task`,
      },
    });

    // Subscribe author to thread
    await prisma.threadSubscription.upsert({
      where: {
        taskId_agentId: {
          taskId,
          agentId,
        },
      },
      update: {},
      create: {
        taskId,
        agentId,
      },
    });

    // Create notifications for mentions
    if (mentions && Array.isArray(mentions)) {
      for (const mentionedAgentId of mentions) {
        if (mentionedAgentId !== agentId) {
          await prisma.notification.create({
            data: {
              agentId: mentionedAgentId,
              messageId: message.id,
              content: `You were mentioned in a comment`,
              delivered: false,
            },
          });

          // Subscribe mentioned agent to thread
          await prisma.threadSubscription.upsert({
            where: {
              taskId_agentId: {
                taskId,
                agentId: mentionedAgentId,
              },
            },
            update: {},
            create: {
              taskId,
              agentId: mentionedAgentId,
            },
          });
        }
      }
    }

    // Emit event for real-time updates
    const { emitEvent } = await import('@/lib/events');
    emitEvent('message_sent', message);

    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create message' },
      { status: 500 }
    );
  }
}

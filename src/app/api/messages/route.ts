import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { emitEvent } from '@/lib/events';

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
        agent: true,
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

// POST /api/messages - Create a new message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, agentId, content, mentions } = body;

    if (!taskId || !agentId || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
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
        agent: true,
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        type: 'message_sent',
        agentId,
        taskId,
        message: `New message on task`,
      },
    });

    // Create notifications for mentions
    if (mentions && Array.isArray(mentions)) {
      for (const mentionedAgentId of mentions) {
        await prisma.notification.create({
          data: {
            agentId: mentionedAgentId,
            messageId: message.id,
            content: `You were mentioned in a comment`,
          },
        });
      }
    }

    // Subscribe agent to thread
    await prisma.threadSubscription.upsert({
      where: {
        taskId_agentId: {
          taskId,
          agentId,
        },
      },
      create: {
        taskId,
        agentId,
      },
      update: {},
    });

    // Emit event for real-time updates
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

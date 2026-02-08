import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/activities - List activities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const agentId = searchParams.get('agentId');
    const taskId = searchParams.get('taskId');
    const type = searchParams.get('type');

    const where: Record<string, unknown> = {};
    
    if (agentId) {
      where.agentId = agentId;
    }
    
    if (taskId) {
      where.taskId = taskId;
    }
    
    if (type) {
      where.type = type;
    }

    const activities = await prisma.activity.findMany({
      where,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            displayName: true,
            role: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({ success: true, data: activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

// POST /api/activities - Create an activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, agentId, taskId, message, metadata } = body;

    if (!type || !agentId || !message) {
      return NextResponse.json(
        { success: false, error: 'Type, agentId, and message are required' },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.create({
      data: {
        type,
        agentId,
        taskId,
        message,
        metadata: metadata ? JSON.stringify(metadata) : null,
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
        task: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    // Emit event for real-time updates
    const { emitEvent } = await import('@/lib/events');
    emitEvent('activity_created', activity);

    return NextResponse.json({ success: true, data: activity });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}

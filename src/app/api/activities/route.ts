import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/activities - List activities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const taskId = searchParams.get('taskId');
    const agentId = searchParams.get('agentId');
    const type = searchParams.get('type');

    const activities = await prisma.activity.findMany({
      where: {
        ...(taskId && { taskId }),
        ...(agentId && { agentId }),
        ...(type && { type }),
      },
      include: {
        agent: true,
        task: true,
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

// POST /api/activities - Create a new activity (for external integrations)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, agentId, taskId, message, metadata } = body;

    if (!type || !agentId || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
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
        agent: true,
        task: true,
      },
    });

    return NextResponse.json({ success: true, data: activity });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}

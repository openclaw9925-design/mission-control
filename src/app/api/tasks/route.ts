import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { emitEvent } from '@/lib/events';

// GET /api/tasks - List all tasks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    const tasks = await prisma.task.findMany({
      where: {
        ...(status && { status }),
        ...(priority && { priority }),
      },
      include: {
        createdBy: true,
        assignments: {
          include: {
            agent: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, priority, createdById, assigneeIds } = body;

    // Get coordinator agent if no creator specified
    let creatorId = createdById;
    if (!creatorId) {
      const coordinator = await prisma.agent.findFirst({
        where: { name: 'clawdbot' },
      });
      creatorId = coordinator?.id;
    }

    if (!creatorId) {
      return NextResponse.json(
        { success: false, error: 'No creator specified and no coordinator found' },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        priority: priority || 'medium',
        status: 'inbox',
        createdById: creatorId,
        ...(assigneeIds && assigneeIds.length > 0 && {
          assignments: {
            create: assigneeIds.map((agentId: string) => ({
              agentId,
            })),
          },
        }),
      },
      include: {
        createdBy: true,
        assignments: {
          include: {
            agent: true,
          },
        },
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        type: 'task_created',
        agentId: creatorId,
        taskId: task.id,
        message: `Task "${title}" created`,
      },
    });

    // Emit event for real-time updates
    emitEvent('task_created', task);

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

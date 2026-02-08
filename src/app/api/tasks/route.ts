import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/tasks - List all tasks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const assignee = searchParams.get('assignee');

    const where: Record<string, unknown> = {};
    
    if (status) {
      where.status = status;
    }
    
    if (assignee) {
      where.assignments = {
        some: {
          agentId: assignee,
        },
      };
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        createdBy: true,
        assignments: {
          include: {
            agent: true,
          },
        },
        currentAgent: true,
        _count: {
          select: {
            messages: true,
            documents: true,
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

    if (!title || !createdById) {
      return NextResponse.json(
        { success: false, error: 'Title and createdById are required' },
        { status: 400 }
      );
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'medium',
        status: 'inbox',
        createdById,
        ...(assigneeIds && assigneeIds.length > 0
          ? {
              assignments: {
                create: assigneeIds.map((agentId: string) => ({
                  agentId,
                })),
              },
            }
          : {}),
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
        agentId: createdById,
        taskId: task.id,
        message: `Created task: ${title}`,
      },
    });

    // Emit event for real-time updates
    const { emitEvent } = await import('@/lib/events');
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

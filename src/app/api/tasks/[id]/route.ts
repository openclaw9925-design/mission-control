import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/tasks/[id] - Get a single task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        createdBy: true,
        assignments: {
          include: {
            agent: true,
          },
        },
        currentAgent: true,
        messages: {
          include: {
            agent: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        documents: {
          include: {
            agent: true,
          },
        },
        activities: {
          include: {
            agent: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 20,
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/[id] - Update a task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, status, priority, assigneeIds, currentAgentId } = body;

    // Get current task for comparison
    const currentTask = await prisma.task.findUnique({
      where: { id },
      include: { assignments: true },
    });

    if (!currentTask) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    // Update task
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(currentAgentId !== undefined && { currentTaskId: currentAgentId }),
      },
      include: {
        createdBy: true,
        assignments: {
          include: {
            agent: true,
          },
        },
        currentAgent: true,
      },
    });

    // Handle assignee updates
    if (assigneeIds !== undefined) {
      // Delete existing assignments
      await prisma.taskAssignment.deleteMany({
        where: { taskId: id },
      });

      // Create new assignments
      if (assigneeIds.length > 0) {
        await prisma.taskAssignment.createMany({
          data: assigneeIds.map((agentId: string) => ({
            taskId: id,
            agentId,
          })),
        });
      }

      // Create activities for new assignees
      for (const agentId of assigneeIds) {
        await prisma.activity.create({
          data: {
            type: 'task_assigned',
            agentId,
            taskId: id,
            message: `Assigned to task: ${task.title}`,
          },
        });
      }
    }

    // Create activity for status change
    if (status && status !== currentTask.status) {
      await prisma.activity.create({
        data: {
          type: 'status_changed',
          agentId: currentTask.createdById,
          taskId: id,
          message: `Status changed from ${currentTask.status} to ${status}`,
          metadata: JSON.stringify({ from: currentTask.status, to: status }),
        },
      });
    }

    // Emit event for real-time updates
    const { emitEvent } = await import('@/lib/events');
    emitEvent('task_updated', task);

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const task = await prisma.task.delete({
      where: { id },
    });

    // Emit event for real-time updates
    const { emitEvent } = await import('@/lib/events');
    emitEvent('task_deleted', task);

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}

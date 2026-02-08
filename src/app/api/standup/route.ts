import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/standup - Generate daily standup report
export async function GET() {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get all tasks
    const tasks = await prisma.task.findMany({
      include: {
        createdBy: true,
        assignments: {
          include: {
            agent: true,
          },
        },
        currentAgent: true,
        activities: {
          where: {
            createdAt: {
              gte: twentyFourHoursAgo,
            },
          },
        },
      },
    });

    // Get all agents
    const agents = await prisma.agent.findMany({
      include: {
        currentTask: true,
        assignments: {
          where: {
            task: {
              status: {
                in: ['in_progress', 'review'],
              },
            },
          },
          include: {
            task: true,
          },
        },
        activities: {
          where: {
            createdAt: {
              gte: twentyFourHoursAgo,
            },
          },
        },
      },
    });

    // Categorize tasks
    const completedTasks = tasks.filter(
      t => t.status === 'done' && t.activities.some(a => a.type === 'status_changed')
    );
    
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    
    const reviewTasks = tasks.filter(t => t.status === 'review');
    
    const blockedTasks = tasks.filter(t => t.status === 'blocked');

    // Get recent activities
    const recentActivities = await prisma.activity.findMany({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    // Build standup report
    const standup = {
      generatedAt: now.toISOString(),
      date: now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      summary: {
        totalTasks: tasks.length,
        completed: completedTasks.length,
        inProgress: inProgressTasks.length,
        inReview: reviewTasks.length,
        blocked: blockedTasks.length,
      },
      agents: agents.map(agent => ({
        name: agent.displayName,
        role: agent.role,
        status: agent.status,
        currentTask: agent.currentTask?.title || null,
        recentActivity: agent.activities.length,
        tasks: agent.assignments.map(a => ({
          title: a.task.title,
          status: a.task.status,
        })),
      })),
      completedTasks: completedTasks.map(t => ({
        id: t.id,
        title: t.title,
        completedBy: t.assignments.map(a => a.agent.displayName).join(', '),
      })),
      inProgressTasks: inProgressTasks.map(t => ({
        id: t.id,
        title: t.title,
        assignees: t.assignments.map(a => a.agent.displayName),
      })),
      reviewTasks: reviewTasks.map(t => ({
        id: t.id,
        title: t.title,
        assignees: t.assignments.map(a => a.agent.displayName),
      })),
      blockedTasks: blockedTasks.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
      })),
      recentActivities: recentActivities.map(a => ({
        type: a.type,
        message: a.message,
        agent: a.agent.displayName,
        task: a.task?.title,
        time: a.createdAt,
      })),
    };

    return NextResponse.json({ success: true, data: standup });
  } catch (error) {
    console.error('Error generating standup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate standup' },
      { status: 500 }
    );
  }
}

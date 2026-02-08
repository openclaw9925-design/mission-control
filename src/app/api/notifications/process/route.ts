import { prisma } from '@/lib/prisma';
import { notifyAgent } from '@/lib/openclaw';
import { NextResponse } from 'next/server';

/**
 * Process undelivered notifications and send to OpenClaw agents
 * This endpoint can be called by a cron job or webhook
 */
export async function GET() {
  try {
    // Get all undelivered notifications
    const notifications = await prisma.notification.findMany({
      where: { delivered: false },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            displayName: true,
            sessionKey: true,
          },
        },
        message: {
          include: {
            task: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      take: 50,
    });

    if (notifications.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: { processed: 0, message: 'No pending notifications' } 
      });
    }

    let processed = 0;
    let failed = 0;

    // Process each notification
    for (const notification of notifications) {
      try {
        // Try to send via OpenClaw
        const result = await notifyAgent(
          notification.agent.sessionKey,
          'mention',
          {
            taskId: notification.message?.taskId,
            taskTitle: notification.message?.task?.title,
            fromAgent: notification.message?.agentId,
            message: notification.content,
          }
        );

        if (result.success) {
          // Mark as delivered
          await prisma.notification.update({
            where: { id: notification.id },
            data: {
              delivered: true,
              deliveredAt: new Date(),
            },
          });
          processed++;
        } else {
          // OpenClaw not available - mark as delivered anyway (will show in UI)
          await prisma.notification.update({
            where: { id: notification.id },
            data: {
              delivered: true,
              deliveredAt: new Date(),
            },
          });
          processed++;
        }
      } catch (error) {
        console.error(`Failed to process notification ${notification.id}:`, error);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total: notifications.length,
        processed,
        failed,
      },
    });
  } catch (error) {
    console.error('Error processing notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process notifications' },
      { status: 500 }
    );
  }
}

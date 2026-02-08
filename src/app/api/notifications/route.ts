import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/notifications - List notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const undelivered = searchParams.get('undelivered') === 'true';

    const where: Record<string, unknown> = {};
    
    if (agentId) {
      where.agentId = agentId;
    }
    
    if (undelivered) {
      where.delivered = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            displayName: true,
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
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - Mark notifications as delivered
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationIds, agentId } = body;

    if (!notificationIds && !agentId) {
      return NextResponse.json(
        { success: false, error: 'notificationIds or agentId is required' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { delivered: false };
    
    if (notificationIds) {
      where.id = { in: notificationIds };
    }
    
    if (agentId) {
      where.agentId = agentId;
    }

    const result = await prisma.notification.updateMany({
      where,
      data: {
        delivered: true,
        deliveredAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: { updated: result.count } 
    });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/agents - List all agents
export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      include: {
        currentTask: true,
        assignments: {
          include: {
            task: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ success: true, data: agents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

// POST /api/agents - Create a new agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, displayName, role, sessionKey, status } = body;

    if (!name || !displayName || !role || !sessionKey) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const agent = await prisma.agent.create({
      data: {
        name,
        displayName,
        role,
        sessionKey,
        status: status || 'idle',
      },
    });

    return NextResponse.json({ success: true, data: agent });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}

// PATCH /api/agents - Update agent status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, currentTaskId, lastHeartbeat } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    const agent = await prisma.agent.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(currentTaskId !== undefined && { currentTaskId }),
        ...(lastHeartbeat !== undefined && { lastHeartbeat: new Date(lastHeartbeat) }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: agent });
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

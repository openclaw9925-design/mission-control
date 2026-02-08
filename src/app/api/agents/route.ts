import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/agents - List all agents
export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      include: {
        currentTask: true,
        _count: {
          select: {
            assignments: true,
            messages: true,
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
    const { name, displayName, role, sessionKey } = body;

    if (!name || !displayName || !role || !sessionKey) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    const agent = await prisma.agent.create({
      data: {
        name,
        displayName,
        role,
        sessionKey,
        status: 'idle',
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        type: 'agent_created',
        agentId: agent.id,
        message: `Agent ${displayName} created`,
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

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/documents - List documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const agentId = searchParams.get('agentId');
    const type = searchParams.get('type');

    const where: Record<string, unknown> = {};
    
    if (taskId) {
      where.taskId = taskId;
    }
    
    if (agentId) {
      where.agentId = agentId;
    }
    
    if (type) {
      where.type = type;
    }

    const documents = await prisma.document.findMany({
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
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST /api/documents - Create a document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, type, taskId, agentId } = body;

    if (!title || !content || !type || !agentId) {
      return NextResponse.json(
        { success: false, error: 'Title, content, type, and agentId are required' },
        { status: 400 }
      );
    }

    const document = await prisma.document.create({
      data: {
        title,
        content,
        type,
        taskId,
        agentId,
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
    });

    // Create activity
    await prisma.activity.create({
      data: {
        type: 'document_created',
        agentId,
        taskId,
        message: `Created document: ${title}`,
      },
    });

    // Emit event for real-time updates
    const { emitEvent } = await import('@/lib/events');
    emitEvent('document_created', document);

    return NextResponse.json({ success: true, data: document });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create document' },
      { status: 500 }
    );
  }
}

// PATCH /api/documents - Update a document
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, content, type } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Document id is required' },
        { status: 400 }
      );
    }

    const document = await prisma.document.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(type !== undefined && { type }),
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
    });

    return NextResponse.json({ success: true, data: document });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

// DELETE /api/documents - Delete a document
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Document id is required' },
        { status: 400 }
      );
    }

    const document = await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, data: document });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}

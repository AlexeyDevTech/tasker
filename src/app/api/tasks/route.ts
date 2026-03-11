import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/tasks - Get tasks
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    if (!userId) {
      let user = await db.user.findFirst();
      if (!user) {
        user = await db.user.create({
          data: {
            email: 'demo@taskflow.app',
            name: 'Demo User',
          },
        });
      }
      userId = user.id;
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assigneeId = searchParams.get('assigneeId');

    const tasks = await db.task.findMany({
      where: {
        ...(projectId ? { projectId } : {}),
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...(assigneeId ? { assigneeId } : {}),
        parentId: null, // Only top-level tasks by default
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, image: true },
        },
        subtasks: {
          include: {
            assignee: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        dependenciesFrom: true,
        dependenciesTo: true,
      },
      orderBy: [
        { position: 'asc' },
        { createdAt: 'desc' },
      ],
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

// POST /api/tasks - Create task
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    if (!userId) {
      let user = await db.user.findFirst();
      if (!user) {
        user = await db.user.create({
          data: {
            email: 'demo@taskflow.app',
            name: 'Demo User',
          },
        });
      }
      userId = user.id;
    }

    const body = await request.json();
    const {
      title,
      description,
      projectId,
      parentId,
      assigneeId,
      status,
      priority,
      startDate,
      dueDate,
      estimatedHours,
    } = body;

    // Get max position in project
    const maxPosition = await db.task.aggregate({
      where: { projectId, parentId: parentId || null },
      _max: { position: true },
    });

    const task = await db.task.create({
      data: {
        title,
        description,
        projectId,
        parentId: parentId || null,
        assigneeId: assigneeId || null,
        status: status || 'todo',
        priority: priority || 'medium',
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedHours,
        position: (maxPosition._max.position || 0) + 1,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    // Log activity
    await db.activity.create({
      data: {
        type: 'task_created',
        description: `Создана задача "${title}"`,
        projectId,
        userId,
      },
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks - Update task
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const task = await db.task.update({
      where: { id },
      data: {
        ...updates,
        ...(updates.startDate && { startDate: new Date(updates.startDate) }),
        ...(updates.dueDate && { dueDate: new Date(updates.dueDate) }),
        ...(updates.completedAt && { completedAt: new Date(updates.completedAt) }),
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks - Delete task
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      );
    }

    await db.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}

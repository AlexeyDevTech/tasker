import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  getUserId,
  unauthorized,
  forbidden,
  canAccessProject,
  canAccessTask,
  parseBody,
} from '@/lib/api-auth';
import { createTaskSchema, updateTaskSchema } from '@/lib/validations';
import { nextTaskNumber } from '@/lib/task-number';

// GET /api/tasks - Get tasks the current user can access
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return unauthorized();

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assigneeId = searchParams.get('assigneeId');
    const sprintId = searchParams.get('sprintId');
    // sprint=backlog → задачи без спринта
    const sprint = searchParams.get('sprint');

    // Scope tasks to projects the user owns or is a member of.
    if (projectId) {
      if (!(await canAccessProject(projectId, userId))) return forbidden();
    }

    const accessibleProject = {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
    };

    const tasks = await db.task.findMany({
      where: {
        ...(projectId ? { projectId } : { project: accessibleProject }),
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...(assigneeId ? { assigneeId } : {}),
        ...(sprint === 'backlog' ? { sprintId: null } : sprintId ? { sprintId } : {}),
        parentId: null, // Only top-level tasks by default
      },
      include: {
        project: {
          select: { id: true, key: true },
        },
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
    const userId = await getUserId();
    if (!userId) return unauthorized();

    const parsed = await parseBody(request, createTaskSchema);
    if (parsed.response) return parsed.response;
    const {
      title,
      description,
      projectId,
      parentId,
      assigneeId,
      status,
      priority,
      type,
      storyPoints,
      severity,
      startDate,
      dueDate,
      estimatedHours,
    } = parsed.data;

    if (!(await canAccessProject(projectId, userId))) return forbidden();

    // Assign position and a project-scoped number in one transaction so the
    // counter increment and the task insert commit together.
    const task = await db.$transaction(async (tx) => {
      const maxPosition = await tx.task.aggregate({
        where: { projectId, parentId: parentId || null },
        _max: { position: true },
      });
      const number = await nextTaskNumber(tx, projectId);

      return tx.task.create({
        data: {
          title,
          description,
          projectId,
          parentId: parentId || null,
          assigneeId: assigneeId || null,
          status: status || 'todo',
          priority: priority || 'medium',
          type: type || 'feature',
          storyPoints: storyPoints ?? null,
          severity: severity ?? null,
          startDate,
          dueDate,
          estimatedHours,
          number,
          position: (maxPosition._max.position || 0) + 1,
        },
        include: {
          assignee: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      });
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
    const userId = await getUserId();
    if (!userId) return unauthorized();

    const parsed = await parseBody(request, updateTaskSchema);
    if (parsed.response) return parsed.response;
    const { id, ...data } = parsed.data;

    if (!(await canAccessTask(id, userId))) return forbidden();

    const task = await db.task.update({
      where: { id },
      data,
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
    const userId = await getUserId();
    if (!userId) return unauthorized();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      );
    }
    if (!(await canAccessTask(id, userId))) return forbidden();

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

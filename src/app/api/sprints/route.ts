import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  getUserId,
  unauthorized,
  forbidden,
  badRequest,
  canAccessProject,
  parseBody,
} from '@/lib/api-auth';
import { createSprintSchema } from '@/lib/validations';

// GET /api/sprints?projectId=... - Sprints of a project (with task counts)
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return unauthorized();

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    if (!projectId) return badRequest('projectId is required');
    if (!(await canAccessProject(projectId, userId))) return forbidden();

    const sprints = await db.sprint.findMany({
      where: { projectId },
      include: {
        _count: { select: { tasks: true } },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ success: true, data: sprints });
  } catch (error) {
    console.error('Error fetching sprints:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sprints' },
      { status: 500 }
    );
  }
}

// POST /api/sprints - Create a sprint
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return unauthorized();

    const parsed = await parseBody(request, createSprintSchema);
    if (parsed.response) return parsed.response;
    const { name, goal, projectId, startDate, endDate, status } = parsed.data;

    if (!(await canAccessProject(projectId, userId))) return forbidden();

    const sprint = await db.sprint.create({
      data: {
        name,
        goal: goal ?? null,
        projectId,
        startDate,
        endDate,
        status: status || 'planned',
      },
    });

    await db.activity.create({
      data: {
        type: 'sprint_created',
        description: `Создан спринт "${name}"`,
        projectId,
        userId,
      },
    });

    return NextResponse.json({ success: true, data: sprint });
  } catch (error) {
    console.error('Error creating sprint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create sprint' },
      { status: 500 }
    );
  }
}

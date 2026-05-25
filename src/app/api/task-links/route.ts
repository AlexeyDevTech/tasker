import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  getUserId,
  unauthorized,
  forbidden,
  badRequest,
  canAccessTask,
  parseBody,
} from '@/lib/api-auth';
import { createTaskLinkSchema } from '@/lib/validations';
import { parseGitUrl } from '@/lib/git';

// POST /api/task-links - Attach a Git link (PR/commit/issue/branch) to a task.
// Provider/kind/title are auto-detected from the URL unless provided.
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return unauthorized();

    const parsed = await parseBody(request, createTaskLinkSchema);
    if (parsed.response) return parsed.response;
    const { taskId, url, kind, provider, title, externalId, state } = parsed.data;

    if (!(await canAccessTask(taskId, userId))) return forbidden();

    const detected = parseGitUrl(url);

    const link = await db.taskLink.create({
      data: {
        taskId,
        url,
        provider: provider ?? detected.provider,
        kind: kind ?? detected.kind,
        title: title ?? detected.title,
        externalId: externalId ?? detected.externalId,
        state: state ?? null,
      },
    });

    return NextResponse.json({ success: true, data: link });
  } catch (error) {
    console.error('Error creating task link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create task link' },
      { status: 500 }
    );
  }
}

// DELETE /api/task-links?id=... - Remove a Git link.
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return unauthorized();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return badRequest('Link ID is required');

    const link = await db.taskLink.findUnique({ where: { id }, select: { taskId: true } });
    if (!link) return NextResponse.json({ success: true }); // already gone
    if (!(await canAccessTask(link.taskId, userId))) return forbidden();

    await db.taskLink.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete task link' },
      { status: 500 }
    );
  }
}

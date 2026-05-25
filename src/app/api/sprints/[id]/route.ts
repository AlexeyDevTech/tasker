import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  getUserId,
  unauthorized,
  forbidden,
  canAccessSprint,
  parseBody,
} from '@/lib/api-auth';
import { updateSprintSchema } from '@/lib/validations';

// PATCH /api/sprints/[id] - Update a sprint
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) return unauthorized();

    const { id } = await params;
    if (!(await canAccessSprint(id, userId))) return forbidden();

    const parsed = await parseBody(request, updateSprintSchema);
    if (parsed.response) return parsed.response;

    const sprint = await db.sprint.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, data: sprint });
  } catch (error) {
    console.error('Error updating sprint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update sprint' },
      { status: 500 }
    );
  }
}

// DELETE /api/sprints/[id] - Delete a sprint (tasks fall back to backlog)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) return unauthorized();

    const { id } = await params;
    if (!(await canAccessSprint(id, userId))) return forbidden();

    // onDelete: SetNull on Task.sprint returns tasks to the backlog.
    await db.sprint.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sprint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete sprint' },
      { status: 500 }
    );
  }
}

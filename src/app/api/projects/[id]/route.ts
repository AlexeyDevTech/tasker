import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  getUserId,
  unauthorized,
  forbidden,
  canAccessProject,
  parseBody,
} from '@/lib/api-auth';
import { updateProjectSchema } from '@/lib/validations';

// GET /api/projects/[id] - Get single project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) return unauthorized();

    const { id } = await params;

    if (!(await canAccessProject(id, userId))) return forbidden();

    const project = await db.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true, image: true },
        },
        children: true,
        parent: true,
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
        tasks: {
          where: { parentId: null },
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
              include: { tag: true },
            },
          },
          orderBy: { position: 'asc' },
        },
        milestones: {
          orderBy: { date: 'asc' },
        },
        _count: {
          select: { tasks: true, children: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id] - Update project
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) return unauthorized();

    const { id } = await params;

    if (!(await canAccessProject(id, userId))) return forbidden();

    const parsed = await parseBody(request, updateProjectSchema);
    if (parsed.response) return parsed.response;

    const project = await db.project.update({
      where: { id },
      data: parsed.data,
      include: {
        owner: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) return unauthorized();

    const { id } = await params;

    // Only the owner may delete a project.
    const project = await db.project.findFirst({
      where: { id, ownerId: userId },
      select: { id: true },
    });
    if (!project) return forbidden();

    await db.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}

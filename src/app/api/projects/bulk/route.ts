import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import type { ParsedProject, ParsedTask } from '@/lib/bulk-parser';
import type { PrismaClient } from '@prisma/client';

async function createTasksRecursive(
  prisma: PrismaClient,
  tasks: ParsedTask[],
  projectId: string,
  ownerId: string,
  parentId?: string
): Promise<number> {
  let count = 0;
  for (const task of tasks) {
    count++;
    const createdTask = await prisma.task.create({
      data: {
        title: task.title,
        projectId: projectId,
        assigneeId: ownerId, // Assign to project owner by default
        parentId: parentId,
      },
    });

    if (task.children && task.children.length > 0) {
      const childrenCount = await createTasksRecursive(prisma, task.children, projectId, ownerId, createdTask.id);
      count += childrenCount;
    }
  }
  return count;
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const projectsToCreate: ParsedProject[] = await req.json();

    if (!Array.isArray(projectsToCreate) || projectsToCreate.length === 0) {
      return new NextResponse('Invalid input: Expected an array of projects.', { status: 400 });
    }

    let createdProjectsCount = 0;
    let createdTasksCount = 0;

    await db.$transaction(async (prisma) => {
      for (const project of projectsToCreate) {
        createdProjectsCount++;
        const createdProject = await prisma.project.create({
          data: {
            name: project.name,
            ownerId: userId,
          },
        });

        if (project.tasks && project.tasks.length > 0) {
          createdTasksCount += await createTasksRecursive(prisma as unknown as PrismaClient, project.tasks, createdProject.id, userId);
        }
      }
    });

    return NextResponse.json({
      message: `Successfully created ${createdProjectsCount} projects and ${createdTasksCount} tasks.`,
    });

  } catch (error) {
    console.error('[BULK_IMPORT_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

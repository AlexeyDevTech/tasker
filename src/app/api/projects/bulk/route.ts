import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import type { ParsedProject, ParsedTask } from '@/lib/md-analyzer';
import type { Prisma, PrismaClient } from '@prisma/client';

type Tx = Prisma.TransactionClient;

interface UserLite {
  id: string;
  name: string | null;
  email: string;
}

// Сопоставляет @-хэндл из markdown с пользователем (по имени/почте).
function resolveAssignee(handle: string | undefined, users: UserLite[]): string | null {
  if (!handle) return null;
  const h = handle.toLowerCase();
  const match = users.find((u) => {
    const name = (u.name ?? '').toLowerCase();
    const emailLocal = u.email.toLowerCase().split('@')[0];
    return name === h || name.replace(/\s+/g, '') === h || emailLocal === h || name.startsWith(h);
  });
  return match?.id ?? null;
}

interface CreateStats {
  tasks: number;
  unresolvedAssignees: Set<string>;
}

// Кэш тегов на пользователя в рамках одного импорта (имя → id).
async function ensureTag(tx: Tx, userId: string, name: string, cache: Map<string, string>): Promise<string> {
  const key = name.toLowerCase();
  const cached = cache.get(key);
  if (cached) return cached;
  const tag = await tx.tag.upsert({
    where: { userId_name: { userId, name } },
    create: { name, userId },
    update: {},
  });
  cache.set(key, tag.id);
  return tag.id;
}

async function createTasksRecursive(
  tx: Tx,
  tasks: ParsedTask[],
  projectId: string,
  ownerId: string,
  users: UserLite[],
  tagCache: Map<string, string>,
  stats: CreateStats,
  parentId: string | undefined,
): Promise<void> {
  let position = 0;
  for (const task of tasks) {
    const assigneeId = resolveAssignee(task.assignee, users);
    if (task.assignee && !assigneeId) stats.unresolvedAssignees.add(task.assignee);

    const created = await tx.task.create({
      data: {
        title: task.title,
        description: task.description || null,
        projectId,
        parentId: parentId ?? null,
        assigneeId,
        status: task.status ?? undefined,
        priority: task.priority ?? undefined,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        estimatedHours: task.estimatedHours ?? null,
        position: position++,
      },
    });
    stats.tasks++;

    // Теги задачи (создаём недостающие, привязываем).
    if (task.tags && task.tags.length > 0) {
      for (const tagName of task.tags) {
        const tagId = await ensureTag(tx, ownerId, tagName, tagCache);
        await tx.taskTag.create({ data: { taskId: created.id, tagId } });
      }
    }

    if (task.children && task.children.length > 0) {
      await createTasksRecursive(tx, task.children, projectId, ownerId, users, tagCache, stats, created.id);
    }
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const projectsToCreate: ParsedProject[] = await req.json();
    if (!Array.isArray(projectsToCreate) || projectsToCreate.length === 0) {
      return new NextResponse('Invalid input: Expected an array of projects.', { status: 400 });
    }

    // Кандидаты для резолвинга исполнителей (SQLite не поддерживает insensitive-фильтр,
    // поэтому сопоставляем в JS).
    const users: UserLite[] = await db.user.findMany({ select: { id: true, name: true, email: true } });

    let createdProjects = 0;
    let updatedProjects = 0;
    const stats: CreateStats = { tasks: 0, unresolvedAssignees: new Set() };
    const tagCache = new Map<string, string>();

    await db.$transaction(async (tx) => {
      for (const project of projectsToCreate) {
        let existing = await tx.project.findFirst({ where: { name: project.name, ownerId: userId } });

        if (existing) {
          updatedProjects++;
        } else {
          createdProjects++;
          existing = await tx.project.create({
            data: {
              name: project.name,
              description: project.description || null,
              ownerId: userId,
            },
          });
        }

        if (project.tasks?.length) {
          await createTasksRecursive(tx, project.tasks, existing.id, userId, users, tagCache, stats, undefined);
        }
      }
    });

    let message = `Создано проектов: ${createdProjects}, дополнено: ${updatedProjects}, задач: ${stats.tasks}.`;
    if (stats.unresolvedAssignees.size > 0) {
      message += ` Не найдены исполнители: ${Array.from(stats.unresolvedAssignees).map((a) => `@${a}`).join(', ')}.`;
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error('[BULK_IMPORT_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

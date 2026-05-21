import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { z } from 'zod';
import { authOptions } from './auth';
import { db } from './db';

/**
 * Returns the authenticated user's id, or null if there is no session.
 * Replaces the previous `db.user.findFirst()` fallback, which let any
 * unauthenticated request act as the first user in the database.
 */
export async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

/** Standard 401 response for unauthenticated API requests. */
export function unauthorized() {
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 401 }
  );
}

/** Standard 403 response when a user lacks access to a resource. */
export function forbidden() {
  return NextResponse.json(
    { success: false, error: 'Forbidden' },
    { status: 403 }
  );
}

/** Standard 400 response for invalid input. */
export function badRequest(error = 'Invalid request') {
  return NextResponse.json({ success: false, error }, { status: 400 });
}

/**
 * Parses and validates a request body against a Zod schema.
 * Returns `{ data }` on success or `{ response }` (a 400) on failure.
 */
export async function parseBody<T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): Promise<
  | { data: z.infer<T>; response?: undefined }
  | { data?: undefined; response: NextResponse }
> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return { response: badRequest('Invalid JSON body') };
  }
  const result = schema.safeParse(json);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? 'Invalid request';
    return { response: badRequest(message) };
  }
  return { data: result.data };
}

/** True if the user owns the project or is a member of it. */
export async function canAccessProject(
  projectId: string,
  userId: string
): Promise<boolean> {
  const project = await db.project.findFirst({
    where: {
      id: projectId,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    select: { id: true },
  });
  return project !== null;
}

/** True if the user owns the project the task belongs to, or is a member. */
export async function canAccessTask(
  taskId: string,
  userId: string
): Promise<boolean> {
  const task = await db.task.findUnique({
    where: { id: taskId },
    select: {
      project: {
        select: {
          ownerId: true,
          members: { where: { userId }, select: { id: true } },
        },
      },
    },
  });
  if (!task) return false;
  return task.project.ownerId === userId || task.project.members.length > 0;
}

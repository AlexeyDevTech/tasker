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
import { importIssuesSchema } from '@/lib/validations';
import { githubIssueToTask, type GithubIssueLite } from '@/lib/github';
import { nextTaskNumber } from '@/lib/task-number';

export const runtime = 'nodejs';

// POST /api/integrations/github/import-issues
// Импортирует открытые issues репозитория в проект как задачи + связи.
// Токен (PAT) используется только для этого запроса и нигде не сохраняется.
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return unauthorized();

    const parsed = await parseBody(request, importIssuesSchema);
    if (parsed.response) return parsed.response;
    const { projectId, repo, token, limit = 50 } = parsed.data;

    if (!(await canAccessProject(projectId, userId))) return forbidden();

    const res = await fetch(
      `https://api.github.com/repos/${repo}/issues?state=open&per_page=${limit}`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'tasker-app',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    if (!res.ok) {
      const detail = res.status === 404 ? 'репозиторий не найден или нет доступа' : `GitHub API ${res.status}`;
      return badRequest(`Не удалось загрузить issues: ${detail}`);
    }

    const raw = (await res.json()) as GithubIssueLite[];
    // Отсеиваем pull requests (общий эндпоинт issues возвращает и их).
    const issues = raw.filter((i) => !i.pull_request);

    let created = 0;
    for (const issue of issues) {
      // Пропускаем уже импортированные (по url связи).
      const exists = await db.taskLink.findFirst({
        where: { url: issue.html_url, task: { projectId } },
        select: { id: true },
      });
      if (exists) continue;

      const mapped = githubIssueToTask(issue);
      await db.$transaction(async (tx) => {
        const number = await nextTaskNumber(tx, projectId);
        const task = await tx.task.create({
          data: {
            title: mapped.title,
            description: mapped.description,
            type: mapped.type,
            projectId,
            number,
          },
        });
        await tx.taskLink.create({
          data: {
            taskId: task.id,
            url: issue.html_url,
            provider: 'github',
            kind: 'issue',
            title: `Issue #${issue.number}`,
            externalId: String(issue.number),
            state: 'open',
          },
        });
      });
      created++;
    }

    await db.activity.create({
      data: {
        type: 'issues_imported',
        description: `Импортировано issues из ${repo}: ${created}`,
        projectId,
        userId,
      },
    });

    return NextResponse.json({
      success: true,
      data: { created, skipped: issues.length - created, totalOpen: issues.length },
    });
  } catch (error) {
    console.error('Error importing issues:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import issues' },
      { status: 500 }
    );
  }
}

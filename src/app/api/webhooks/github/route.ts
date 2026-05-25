import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  extractTaskKeys,
  verifyGithubSignature,
  mapPullRequestEvent,
  type TaskKeyRef,
} from '@/lib/github';
import type { LinkState } from '@/types';

// Этот эндпоинт вызывается GitHub'ом, а не пользователем — аутентификация
// по подписи (X-Hub-Signature-256), не по сессии. Запускается в Node-рантайме
// (нужен crypto и сырое тело запроса).
export const runtime = 'nodejs';

// Находит задачу по ключу PROJ-123 (prefix → project.key, number → task.number).
async function findTaskByKey(ref: TaskKeyRef) {
  return db.task.findFirst({
    where: { number: ref.number, project: { key: ref.prefix } },
    select: { id: true, status: true },
  });
}

// Создаёт связь или обновляет её состояние (идемпотентно по taskId+url).
async function upsertLink(opts: {
  taskId: string;
  url: string;
  kind: string;
  title: string;
  externalId: string | null;
  state: LinkState;
}) {
  const existing = await db.taskLink.findFirst({
    where: { taskId: opts.taskId, url: opts.url },
    select: { id: true },
  });
  if (existing) {
    await db.taskLink.update({ where: { id: existing.id }, data: { state: opts.state } });
  } else {
    await db.taskLink.create({
      data: {
        taskId: opts.taskId,
        url: opts.url,
        provider: 'github',
        kind: opts.kind,
        title: opts.title,
        externalId: opts.externalId,
        state: opts.state,
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.text();
    const secret = process.env.GITHUB_WEBHOOK_SECRET;

    // Если секрет задан — подпись обязательна и должна сойтись.
    if (secret) {
      const sig = request.headers.get('x-hub-signature-256');
      if (!verifyGithubSignature(secret, raw, sig)) {
        return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });
      }
    } else {
      console.warn('[github-webhook] GITHUB_WEBHOOK_SECRET не задан — подпись не проверяется (только для разработки).');
    }

    const event = request.headers.get('x-github-event');
    const payload = JSON.parse(raw);
    let updated = 0;

    if (event === 'pull_request') {
      const pr = payload.pull_request;
      const effect = mapPullRequestEvent(payload.action, !!pr?.merged);
      if (!effect) return NextResponse.json({ success: true, updated: 0, skipped: payload.action });

      const refs = extractTaskKeys(`${pr?.title ?? ''} ${pr?.head?.ref ?? ''}`);
      for (const ref of refs) {
        const task = await findTaskByKey(ref);
        if (!task) continue;
        await upsertLink({
          taskId: task.id,
          url: pr.html_url,
          kind: 'pr',
          title: `PR #${pr.number}`,
          externalId: String(pr.number),
          state: effect.state,
        });
        if (effect.taskStatus && task.status !== effect.taskStatus) {
          await db.task.update({
            where: { id: task.id },
            data: {
              status: effect.taskStatus,
              completedAt: effect.taskStatus === 'done' ? new Date() : undefined,
            },
          });
        }
        updated++;
      }
    } else if (event === 'issues') {
      const issue = payload.issue;
      const state: LinkState = payload.action === 'closed' ? 'closed' : 'open';
      const refs = extractTaskKeys(`${issue?.title ?? ''} ${issue?.body ?? ''}`);
      for (const ref of refs) {
        const task = await findTaskByKey(ref);
        if (!task) continue;
        await upsertLink({
          taskId: task.id,
          url: issue.html_url,
          kind: 'issue',
          title: `Issue #${issue.number}`,
          externalId: String(issue.number),
          state,
        });
        updated++;
      }
    } else {
      return NextResponse.json({ success: true, ignored: event });
    }

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error('[github-webhook] error:', error);
    return NextResponse.json({ success: false, error: 'Webhook processing failed' }, { status: 500 });
  }
}

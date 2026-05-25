// Хелперы синхронизации с GitHub: разбор событий вебхуков и REST-issue,
// извлечение ключей задач, проверка подписи. Чистые функции (crypto — из node).
import { createHmac, timingSafeEqual } from 'crypto';
import type { LinkState } from '@/types';

export interface TaskKeyRef {
  key: string; // PROJ-123
  prefix: string; // PROJ
  number: number; // 123
}

// Находит ссылки на задачи (PROJ-123) в произвольном тексте: заголовке PR,
// имени ветки, теле коммита. Префикс — заглавные буквы/цифры (как ключ проекта).
export function extractTaskKeys(text: string | null | undefined): TaskKeyRef[] {
  if (!text) return [];
  const re = /\b([A-Z][A-Z0-9]{1,9})-(\d+)\b/g;
  const seen = new Set<string>();
  const refs: TaskKeyRef[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const key = `${m[1]}-${m[2]}`;
    if (seen.has(key)) continue;
    seen.add(key);
    refs.push({ key, prefix: m[1], number: parseInt(m[2], 10) });
  }
  return refs;
}

// Проверка подписи вебхука GitHub (X-Hub-Signature-256: "sha256=...").
export function verifyGithubSignature(
  secret: string,
  rawBody: string,
  signatureHeader: string | null | undefined
): boolean {
  if (!signatureHeader) return false;
  const expected = 'sha256=' + createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  // timingSafeEqual бросает при разной длине — сравниваем длину заранее.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export interface PrEffect {
  state: LinkState;
  // Целевой статус задачи (если нужно перевести), иначе undefined — не трогаем.
  taskStatus?: 'review' | 'done';
}

// Отображает событие pull_request на состояние связи и (опционально) статус задачи.
// opened/reopened → review; merged → done; closed без merge → closed (статус не трогаем).
export function mapPullRequestEvent(action: string, merged: boolean): PrEffect | null {
  switch (action) {
    case 'opened':
    case 'reopened':
    case 'ready_for_review':
      return { state: 'open', taskStatus: 'review' };
    case 'closed':
      return merged ? { state: 'merged', taskStatus: 'done' } : { state: 'closed' };
    default:
      return null; // synchronize/edited/labeled и т.п. — игнорируем
  }
}

export interface GithubIssueLite {
  title: string;
  body?: string | null;
  labels?: Array<{ name: string } | string>;
  html_url: string;
  number: number;
  pull_request?: unknown; // у GitHub issues и PR общий эндпоинт — PR помечены этим полем
}

// Маппинг GitHub-issue в данные задачи. Тип берём из меток (bug/...), иначе feature.
export function githubIssueToTask(issue: GithubIssueLite): {
  title: string;
  description: string | null;
  type: string;
} {
  const labels = (issue.labels ?? []).map((l) => (typeof l === 'string' ? l : l.name).toLowerCase());
  const known = ['bug', 'chore', 'refactor', 'docs', 'spike'];
  const type = known.find((k) => labels.includes(k)) ?? (labels.includes('enhancement') ? 'feature' : 'feature');
  return {
    title: issue.title,
    description: issue.body?.trim() || null,
    type,
  };
}

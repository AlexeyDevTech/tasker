// Git-хелперы: имя ветки из ключа задачи и разбор ссылок на GitHub/GitLab.
// Чистые функции, без зависимостей от сети/Prisma.
import { transliterate } from './project-key';
import type { LinkProvider, LinkKind } from '@/types';

// Префикс ветки по типу задачи (conventional-ветки).
const BRANCH_PREFIX: Record<string, string> = {
  bug: 'fix',
  feature: 'feature',
  chore: 'chore',
  refactor: 'refactor',
  docs: 'docs',
  spike: 'spike',
};

function slugify(input: string, maxLen = 40): string {
  const slug = transliterate(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug.slice(0, maxLen).replace(/-+$/g, '');
}

// feature/PROJ-123-add-rate-limiting (ключ сохраняем, слаг — латиница нижним регистром).
export function branchName(
  projectKey: string | null | undefined,
  number: number | null | undefined,
  title: string,
  type?: string | null
): string {
  const prefix = BRANCH_PREFIX[type ?? 'feature'] ?? 'feature';
  const id = projectKey && number != null ? `${projectKey}-${number}` : '';
  const slug = slugify(title);
  return [prefix, [id, slug].filter(Boolean).join('-')].join('/');
}

export interface ParsedGitUrl {
  provider: LinkProvider;
  kind: LinkKind;
  externalId: string | null;
  title: string;
}

// Разбирает ссылку на PR/issue/commit GitHub/GitLab и предлагает заголовок.
export function parseGitUrl(raw: string): ParsedGitUrl {
  let url: URL | null = null;
  try {
    url = new URL(raw.trim());
  } catch {
    return { provider: 'other', kind: 'branch', externalId: null, title: raw.trim().slice(0, 80) };
  }

  const host = url.hostname.toLowerCase();
  const provider: LinkProvider = host.includes('github')
    ? 'github'
    : host.includes('gitlab')
      ? 'gitlab'
      : 'other';

  const segments = url.pathname.split('/').filter(Boolean);

  // Ищем маркер типа в пути (работает и для github, и для gitlab c '/-/').
  const findAfter = (marker: string): string | null => {
    const i = segments.lastIndexOf(marker);
    return i >= 0 && segments[i + 1] ? segments[i + 1] : null;
  };

  const pr = findAfter('pull') ?? findAfter('merge_requests');
  if (pr) return { provider, kind: 'pr', externalId: pr, title: `PR #${pr}` };

  const issue = findAfter('issues');
  if (issue) return { provider, kind: 'issue', externalId: issue, title: `Issue #${issue}` };

  const commit = findAfter('commit') ?? findAfter('commits');
  if (commit) return { provider, kind: 'commit', externalId: commit.slice(0, 7), title: `commit ${commit.slice(0, 7)}` };

  // Фолбэк — трактуем как ветку/ссылку, заголовок из последнего сегмента.
  const last = segments[segments.length - 1] || host;
  return { provider, kind: 'branch', externalId: null, title: last };
}

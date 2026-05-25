// Генерация короткого ключа проекта (PROJ) для читаемых идентификаторов
// задач вида PROJ-123. Ключ уникален в рамках одного владельца.

import type { Prisma, PrismaClient } from '@prisma/client';

type Client = PrismaClient | Prisma.TransactionClient;

// Базовая транслитерация кириллицы → латиница, чтобы из русских названий
// получались осмысленные латинские ключи ("Бэкенд" → "BEK").
const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh',
  з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
  п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts',
  ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu',
  я: 'ya',
};

export function transliterate(input: string): string {
  return input
    .toLowerCase()
    .split('')
    .map((ch) => (ch in TRANSLIT ? TRANSLIT[ch] : ch))
    .join('');
}

// Строит ключ-кандидат из названия:
//   несколько слов → инициалы (до 4), одно слово → первые 4 буквы.
// Если латинских букв нет вовсе — запасной вариант "PRJ".
function candidateFromName(name: string): string {
  const latin = transliterate(name).replace(/[^a-z0-9\s]/g, ' ').trim();
  const words = latin.split(/\s+/).filter(Boolean);

  let base = '';
  if (words.length >= 2) {
    base = words.slice(0, 4).map((w) => w[0]).join('');
  } else if (words.length === 1) {
    base = words[0].slice(0, 4);
  }

  base = base.replace(/[^a-z0-9]/g, '').toUpperCase();
  if (base.length < 2) base = 'PRJ';
  return base;
}

// Возвращает ключ, уникальный среди проектов данного владельца.
// При коллизии добавляет числовой суффикс: MCA, MCA2, MCA3, …
export async function generateProjectKey(
  client: Client,
  ownerId: string,
  name: string
): Promise<string> {
  const base = candidateFromName(name);

  const existing = await client.project.findMany({
    where: { ownerId, key: { not: null } },
    select: { key: true },
  });
  const taken = new Set(existing.map((p) => p.key));

  if (!taken.has(base)) return base;
  for (let i = 2; ; i++) {
    const candidate = `${base}${i}`;
    if (!taken.has(candidate)) return candidate;
  }
}

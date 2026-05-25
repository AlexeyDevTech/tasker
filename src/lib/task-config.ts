// Единый источник правды для статусов и приоритетов задач.
// Цвета, подписи и порядок сортировки — только здесь. Все компоненты
// (список, канбан, детали, входящие) импортируют отсюда, чтобы цветовая
// кодировка оставалась единой.

import type { TaskStatus, TaskPriority, TaskType, TaskSeverity } from '@/types';

export interface StatusMeta {
  /** Машинный ключ статуса. */
  value: TaskStatus;
  /** Человекочитаемая подпись. */
  label: string;
  /** Фон бейджа (вкл. dark-вариант). */
  badgeBg: string;
  /** Цвет текста бейджа (вкл. dark-вариант). */
  badgeText: string;
  /** Цвет точки-индикатора. */
  dot: string;
}

export interface PriorityMeta {
  value: TaskPriority;
  label: string;
  badgeBg: string;
  badgeText: string;
  dot: string;
  /** Порядок для сортировки (0 — самый высокий приоритет). */
  order: number;
}

// Статусы: To Do — серый, In Progress — синий, Review — янтарный,
// Done — зелёный, Cancelled — приглушённый красный.
export const STATUS_META: Record<TaskStatus, StatusMeta> = {
  'todo': {
    value: 'todo',
    label: 'К выполнению',
    badgeBg: 'bg-slate-100 dark:bg-slate-800/50',
    badgeText: 'text-slate-700 dark:text-slate-300',
    dot: 'bg-slate-400',
  },
  'in-progress': {
    value: 'in-progress',
    label: 'В работе',
    badgeBg: 'bg-blue-100 dark:bg-blue-900/30',
    badgeText: 'text-blue-700 dark:text-blue-300',
    dot: 'bg-blue-500',
  },
  'review': {
    value: 'review',
    label: 'На проверке',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/30',
    badgeText: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  'done': {
    value: 'done',
    label: 'Готово',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  'cancelled': {
    value: 'cancelled',
    label: 'Отменено',
    badgeBg: 'bg-rose-100 dark:bg-rose-900/30',
    badgeText: 'text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-500',
  },
};

// Приоритеты: High — красный, Medium — жёлтый, Low — серый (по ТЗ),
// плюс Urgent как более насыщенный (тёмный) красный над High.
export const PRIORITY_META: Record<TaskPriority, PriorityMeta> = {
  urgent: {
    value: 'urgent',
    label: 'Срочно',
    badgeBg: 'bg-rose-100 dark:bg-rose-900/30',
    badgeText: 'text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-600',
    order: 0,
  },
  high: {
    value: 'high',
    label: 'Высокий',
    badgeBg: 'bg-red-100 dark:bg-red-900/30',
    badgeText: 'text-red-700 dark:text-red-300',
    dot: 'bg-red-500',
    order: 1,
  },
  medium: {
    value: 'medium',
    label: 'Средний',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/30',
    badgeText: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
    order: 2,
  },
  low: {
    value: 'low',
    label: 'Низкий',
    badgeBg: 'bg-slate-100 dark:bg-slate-800/50',
    badgeText: 'text-slate-600 dark:text-slate-400',
    dot: 'bg-slate-400',
    order: 3,
  },
};

export interface TypeMeta {
  value: TaskType;
  label: string;
  /** Имя иконки lucide-react (резолвится в компонентах). */
  icon: string;
  badgeBg: string;
  badgeText: string;
  /** Цвет иконки. */
  iconColor: string;
}

export interface SeverityMeta {
  value: TaskSeverity;
  label: string;
  badgeBg: string;
  badgeText: string;
  dot: string;
  /** Порядок: 0 — самый критичный. */
  order: number;
}

// Типы задач разработки: feature — зелёный, bug — красный, chore — серый,
// refactor — фиолетовый, docs — синий, spike — янтарный.
export const TYPE_META: Record<TaskType, TypeMeta> = {
  feature: {
    value: 'feature',
    label: 'Фича',
    icon: 'Sparkles',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    iconColor: 'text-emerald-500',
  },
  bug: {
    value: 'bug',
    label: 'Баг',
    icon: 'Bug',
    badgeBg: 'bg-rose-100 dark:bg-rose-900/30',
    badgeText: 'text-rose-700 dark:text-rose-300',
    iconColor: 'text-rose-500',
  },
  chore: {
    value: 'chore',
    label: 'Рутина',
    icon: 'Wrench',
    badgeBg: 'bg-slate-100 dark:bg-slate-800/50',
    badgeText: 'text-slate-700 dark:text-slate-300',
    iconColor: 'text-slate-500',
  },
  refactor: {
    value: 'refactor',
    label: 'Рефакторинг',
    icon: 'Recycle',
    badgeBg: 'bg-violet-100 dark:bg-violet-900/30',
    badgeText: 'text-violet-700 dark:text-violet-300',
    iconColor: 'text-violet-500',
  },
  docs: {
    value: 'docs',
    label: 'Документация',
    icon: 'FileText',
    badgeBg: 'bg-blue-100 dark:bg-blue-900/30',
    badgeText: 'text-blue-700 dark:text-blue-300',
    iconColor: 'text-blue-500',
  },
  spike: {
    value: 'spike',
    label: 'Исследование',
    icon: 'FlaskConical',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/30',
    badgeText: 'text-amber-700 dark:text-amber-300',
    iconColor: 'text-amber-500',
  },
};

// Severity бага: от критичного к тривиальному.
export const SEVERITY_META: Record<TaskSeverity, SeverityMeta> = {
  critical: {
    value: 'critical',
    label: 'Критичный',
    badgeBg: 'bg-rose-100 dark:bg-rose-900/30',
    badgeText: 'text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-600',
    order: 0,
  },
  major: {
    value: 'major',
    label: 'Серьёзный',
    badgeBg: 'bg-orange-100 dark:bg-orange-900/30',
    badgeText: 'text-orange-700 dark:text-orange-300',
    dot: 'bg-orange-500',
    order: 1,
  },
  minor: {
    value: 'minor',
    label: 'Незначительный',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/30',
    badgeText: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
    order: 2,
  },
  trivial: {
    value: 'trivial',
    label: 'Тривиальный',
    badgeBg: 'bg-slate-100 dark:bg-slate-800/50',
    badgeText: 'text-slate-600 dark:text-slate-400',
    dot: 'bg-slate-400',
    order: 3,
  },
};

/** Статусы в порядке рабочего процесса — для фильтров и колонок канбана. */
export const STATUS_ORDER: TaskStatus[] = ['todo', 'in-progress', 'review', 'done', 'cancelled'];

/** Приоритеты от высокого к низкому — для фильтров и сортировки. */
export const PRIORITY_ORDER: TaskPriority[] = ['urgent', 'high', 'medium', 'low'];

/** Типы задач — для селекторов и фильтров. */
export const TYPE_ORDER: TaskType[] = ['feature', 'bug', 'chore', 'refactor', 'docs', 'spike'];

/** Severity от критичного к тривиальному. */
export const SEVERITY_ORDER: TaskSeverity[] = ['critical', 'major', 'minor', 'trivial'];

/** Безопасно получить метаданные статуса (фолбэк — todo). */
export function getStatusMeta(status: string): StatusMeta {
  return STATUS_META[status as TaskStatus] ?? STATUS_META.todo;
}

/** Безопасно получить метаданные приоритета (фолбэк — medium). */
export function getPriorityMeta(priority: string): PriorityMeta {
  return PRIORITY_META[priority as TaskPriority] ?? PRIORITY_META.medium;
}

/** Безопасно получить метаданные типа (фолбэк — feature). */
export function getTypeMeta(type: string | null | undefined): TypeMeta {
  return TYPE_META[type as TaskType] ?? TYPE_META.feature;
}

/** Метаданные severity или null, если не задан/некорректен. */
export function getSeverityMeta(severity: string | null | undefined): SeverityMeta | null {
  if (!severity) return null;
  return SEVERITY_META[severity as TaskSeverity] ?? null;
}

/**
 * Читаемый ключ задачи вида "PROJ-123".
 * Возвращает null, если ключ проекта или номер ещё не присвоены
 * (например, у данных, созданных до введения нумерации).
 */
export function formatTaskKey(
  projectKey: string | null | undefined,
  number: number | null | undefined
): string | null {
  if (!projectKey || number == null) return null;
  return `${projectKey}-${number}`;
}

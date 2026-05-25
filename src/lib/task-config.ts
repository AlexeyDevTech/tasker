// Единый источник правды для статусов и приоритетов задач.
// Цвета, подписи и порядок сортировки — только здесь. Все компоненты
// (список, канбан, детали, входящие) импортируют отсюда, чтобы цветовая
// кодировка оставалась единой.

import type { TaskStatus, TaskPriority } from '@/types';

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

/** Статусы в порядке рабочего процесса — для фильтров и колонок канбана. */
export const STATUS_ORDER: TaskStatus[] = ['todo', 'in-progress', 'review', 'done', 'cancelled'];

/** Приоритеты от высокого к низкому — для фильтров и сортировки. */
export const PRIORITY_ORDER: TaskPriority[] = ['urgent', 'high', 'medium', 'low'];

/** Безопасно получить метаданные статуса (фолбэк — todo). */
export function getStatusMeta(status: string): StatusMeta {
  return STATUS_META[status as TaskStatus] ?? STATUS_META.todo;
}

/** Безопасно получить метаданные приоритета (фолбэк — medium). */
export function getPriorityMeta(priority: string): PriorityMeta {
  return PRIORITY_META[priority as TaskPriority] ?? PRIORITY_META.medium;
}

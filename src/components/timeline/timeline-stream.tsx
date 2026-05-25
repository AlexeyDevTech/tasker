'use client';

import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getStatusMeta, getPriorityMeta } from '@/lib/task-config';
import {
  format,
  isToday,
  isYesterday,
  isTomorrow,
  isPast,
  startOfDay,
  compareAsc,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarOff } from 'lucide-react';

interface TimelineStreamProps {
  tasks: any[];
  /** Открыть задачу в правой шторке. */
  onSelectTask?: (taskId: string) => void;
}

// Якорная дата задачи для хронологии: срок → начало → дата создания.
function anchorDate(task: any): Date | null {
  const raw = task.dueDate ?? task.startDate ?? null;
  return raw ? new Date(raw) : null;
}

// Человекочитаемый заголовок дня.
function dayLabel(date: Date): string {
  if (isToday(date)) return 'Сегодня';
  if (isTomorrow(date)) return 'Завтра';
  if (isYesterday(date)) return 'Вчера';
  const s = format(date, 'EEEE, d MMMM', { locale: ru });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

interface DayGroup {
  key: string;
  date: Date;
  tasks: any[];
}

export function TimelineStream({ tasks, onSelectTask }: TimelineStreamProps) {
  const { groups, undated } = useMemo(() => {
    const dated = tasks.filter((t) => anchorDate(t) !== null);
    const undated = tasks.filter((t) => anchorDate(t) === null);

    dated.sort((a, b) => compareAsc(anchorDate(a)!, anchorDate(b)!));

    const map = new Map<string, DayGroup>();
    for (const task of dated) {
      const d = startOfDay(anchorDate(task)!);
      const key = format(d, 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, { key, date: d, tasks: [] });
      map.get(key)!.tasks.push(task);
    }
    return { groups: Array.from(map.values()), undated };
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <CalendarOff className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">Нет задач для ленты</p>
        <p className="text-xs text-muted-foreground">Добавьте задачи с датами, чтобы увидеть хронологию</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Непрерывная вертикальная линия времени */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" aria-hidden />

      <div className="space-y-6">
        {groups.map((group) => {
          const overdueDay = isPast(group.date) && !isToday(group.date);
          return (
            <section key={group.key}>
              {/* Заголовок дня */}
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={cn(
                    'relative z-10 h-3.5 w-3.5 rounded-full border-2 border-background flex-shrink-0',
                    isToday(group.date) ? 'bg-primary ring-2 ring-primary/30' : overdueDay ? 'bg-rose-500' : 'bg-muted-foreground/40'
                  )}
                />
                <h3
                  className={cn(
                    'text-sm font-semibold',
                    isToday(group.date) && 'text-primary'
                  )}
                >
                  {dayLabel(group.date)}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {group.tasks.length} {group.tasks.length === 1 ? 'задача' : group.tasks.length < 5 ? 'задачи' : 'задач'}
                </span>
              </div>

              {/* Карточки задач дня */}
              <div className="ml-[26px] space-y-2">
                {group.tasks.map((task) => (
                  <TaskRow key={task.id} task={task} onSelectTask={onSelectTask} dayOverdue={overdueDay} />
                ))}
              </div>
            </section>
          );
        })}

        {/* Задачи без даты */}
        {undated.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-2">
              <span className="relative z-10 h-3.5 w-3.5 rounded-full border-2 border-background bg-muted-foreground/30 flex-shrink-0" />
              <h3 className="text-sm font-semibold text-muted-foreground">Без даты</h3>
              <span className="text-xs text-muted-foreground">{undated.length}</span>
            </div>
            <div className="ml-[26px] space-y-2">
              {undated.map((task) => (
                <TaskRow key={task.id} task={task} onSelectTask={onSelectTask} dayOverdue={false} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function TaskRow({ task, onSelectTask, dayOverdue }: { task: any; onSelectTask?: (id: string) => void; dayOverdue: boolean }) {
  const status = getStatusMeta(task.status);
  const priority = getPriorityMeta(task.priority);
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const done = task.status === 'done' || task.status === 'cancelled';
  const overdue = !!due && isPast(due) && !isToday(due) && !done;

  return (
    <button
      type="button"
      onClick={() => onSelectTask?.(task.id)}
      className={cn(
        'group flex w-full items-center gap-3 rounded-lg border border-border/50 bg-card px-3 py-2 text-left transition-colors',
        'hover:border-foreground/15 hover:bg-muted/40'
      )}
    >
      {/* Цветовой индикатор приоритета */}
      <span className={cn('h-2 w-2 rounded-full flex-shrink-0', priority.dot)} title={priority.label} />

      <div className="min-w-0 flex-1">
        <p className={cn('text-sm font-medium truncate group-hover:text-primary transition-colors', done && 'line-through text-muted-foreground')}>
          {task.title}
        </p>
        {due && (
          <p className={cn('text-xs', overdue ? 'text-rose-500' : 'text-muted-foreground')}>
            {format(due, 'd MMM, HH:mm', { locale: ru })}
            {overdue && ' · просрочено'}
          </p>
        )}
      </div>

      <Badge className={cn('font-medium border-0 flex-shrink-0', status.badgeBg, status.badgeText)}>
        {status.label}
      </Badge>

      {task.assignee && (
        <Avatar className="h-6 w-6 flex-shrink-0">
          <AvatarImage src={task.assignee.image || undefined} />
          <AvatarFallback className="text-[10px] bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            {task.assignee.name?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
    </button>
  );
}

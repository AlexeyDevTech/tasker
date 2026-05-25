'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Target, CheckCircle2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPriorityMeta } from '@/lib/task-config';
import { format, isPast, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';

interface FocusTodayProps {
  /** Все задачи пользователя (по всем проектам). */
  tasks: any[];
  /** Проекты — для названий/цветов в строках. */
  projects: any[];
}

/**
 * «В фокусе» — что требует внимания сегодня: просроченные и сегодняшние
 * задачи со всех проектов, отсортированные по приоритету, затем по сроку.
 * Заменяет малополезный виджет «Недавние проекты».
 */
export function FocusToday({ tasks, projects }: FocusTodayProps) {
  const projectMap = projects.reduce((acc: Record<string, any>, p) => {
    acc[p.id] = p;
    return acc;
  }, {});

  const focusTasks = tasks
    .filter((t) => {
      if (t.status === 'done' || t.status === 'cancelled') return false;
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      return isToday(due) || isPast(due);
    })
    .sort((a, b) => {
      const byPriority = getPriorityMeta(a.priority).order - getPriorityMeta(b.priority).order;
      if (byPriority !== 0) return byPriority;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/30">
        <h3 className="font-semibold flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          В фокусе
        </h3>
        <Badge variant="secondary" className="text-xs">{focusTasks.length}</Badge>
      </div>

      {focusTasks.length === 0 ? (
        <div className="p-8 text-center">
          <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-emerald-500" />
          <p className="text-sm font-medium">На сегодня всё под контролем</p>
          <p className="text-xs text-muted-foreground">Нет просроченных или сегодняшних задач</p>
        </div>
      ) : (
        <ScrollArea className="max-h-[360px]">
          <ul className="divide-y divide-border/50">
            {focusTasks.map((task) => {
              const project = projectMap[task.projectId];
              const due = new Date(task.dueDate);
              const overdue = isPast(due) && !isToday(due);
              const priority = getPriorityMeta(task.priority);
              return (
                <li key={task.id}>
                  <Link
                    href={`/projects/${task.projectId}`}
                    className="group flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors"
                  >
                    <span className={cn('h-2 w-2 rounded-full flex-shrink-0', priority.dot)} title={priority.label} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {task.title}
                      </p>
                      {project && (
                        <p className="text-xs text-muted-foreground truncate">{project.name}</p>
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-xs font-medium whitespace-nowrap',
                        overdue ? 'text-rose-500' : 'text-amber-500'
                      )}
                    >
                      {overdue ? `Просрочено · ${format(due, 'd MMM', { locale: ru })}` : 'Сегодня'}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      )}
    </div>
  );
}

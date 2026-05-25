'use client';

import { Briefcase, Timer, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardStatsProps {
  activeProjectsCount: number;
  inProgressTasksCount: number;
  doneTasksCount: number;
  overdueTasksCount: number;
}

interface StatTileProps {
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  value: number;
  label: string;
  valueClass?: string;
}

function StatTile({ icon: Icon, iconClass, value, label, valueClass }: StatTileProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/15">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('flex h-7 w-7 items-center justify-center rounded-md', iconClass)}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      </div>
      <p className={cn('text-4xl font-bold tracking-tight tabular-nums', valueClass)}>{value}</p>
    </div>
  );
}

export function DashboardStats({
  activeProjectsCount,
  inProgressTasksCount,
  doneTasksCount,
  overdueTasksCount,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatTile
        icon={Briefcase}
        iconClass="bg-primary/10 text-primary"
        value={activeProjectsCount}
        label="Активных проектов"
      />
      <StatTile
        icon={Timer}
        iconClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        value={inProgressTasksCount}
        label="В процессе"
      />
      <StatTile
        icon={CheckCircle2}
        iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        value={doneTasksCount}
        label="Выполнено"
      />
      <StatTile
        icon={Clock}
        iconClass="bg-rose-500/10 text-rose-600 dark:text-rose-400"
        value={overdueTasksCount}
        label="Просрочено"
        valueClass={overdueTasksCount > 0 ? 'text-rose-600 dark:text-rose-400' : undefined}
      />
    </div>
  );
}

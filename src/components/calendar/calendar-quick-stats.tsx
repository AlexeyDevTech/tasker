'use client';

import { Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarQuickStatsProps {
  todayTasksCount: number;
  overdueTasksCount: number;
  totalTasksCount: number;
}

interface StatProps {
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  label: string;
  value: number;
}

function Stat({ icon: Icon, iconClass, label, value }: StatProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-md', iconClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold tracking-tight tabular-nums">{value}</p>
      </div>
    </div>
  );
}

export function CalendarQuickStats({
  todayTasksCount,
  overdueTasksCount,
  totalTasksCount,
}: CalendarQuickStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
      <Stat icon={CalendarIcon} iconClass="bg-primary/10 text-primary" label="Сегодня" value={todayTasksCount} />
      <Stat icon={Clock} iconClass="bg-rose-500/10 text-rose-600 dark:text-rose-400" label="Просрочено" value={overdueTasksCount} />
      <Stat icon={CheckCircle2} iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" label="Всего задач" value={totalTasksCount} />
    </div>
  );
}

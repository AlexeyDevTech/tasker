'use client';

import { CheckCircle2, Clock, FileText, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProjectStatsProps {
  progress: number;
  completedTasks: number;
  totalTasks: number;
  daysRemaining: number | null;
  membersCount: number;
}

export function ProjectStats({
  progress,
  completedTasks,
  totalTasks,
  daysRemaining,
  membersCount,
}: ProjectStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div className="p-4 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm">Прогресс</span>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-semibold tracking-tight">{progress}%</span>
          <span className="text-sm text-muted-foreground">({completedTasks}/{totalTasks})</span>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </div>

      <div className="p-4 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Clock className="h-4 w-4" />
          <span className="text-sm">Дней осталось</span>
        </div>
        <span className={cn(
          "text-2xl font-semibold tracking-tight",
          daysRemaining !== null && daysRemaining < 7 && "text-destructive"
        )}>
          {daysRemaining !== null ? daysRemaining : '—'}
        </span>
      </div>

      <div className="p-4 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <FileText className="h-4 w-4" />
          <span className="text-sm">Задач</span>
        </div>
        <span className="text-2xl font-semibold tracking-tight">{totalTasks}</span>
      </div>

      <div className="p-4 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Users className="h-4 w-4" />
          <span className="text-sm">Участников</span>
        </div>
        <span className="text-2xl font-semibold tracking-tight">{membersCount}</span>
      </div>
    </div>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import { CheckSquare, Plus } from 'lucide-react';

interface WelcomeDashboardProps {
  userName: string;
  todoTasksCount: number;
  overdueTasksCount: number;
  onNewTaskClick: () => void;
  onNewProjectClick: () => void;
  getGreeting: () => string;
}

export function WelcomeDashboard({
  userName,
  todoTasksCount,
  overdueTasksCount,
  onNewTaskClick,
  onNewProjectClick,
  getGreeting,
}: WelcomeDashboardProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight mb-1">
          {getGreeting()}, {userName}
        </h1>
        <p className="text-sm text-muted-foreground">
          {todoTasksCount > 0
            ? `${todoTasksCount} задач на сегодня`
            : 'На сегодня задач нет'}
          {overdueTasksCount > 0 && (
            <span className="text-destructive font-medium"> · {overdueTasksCount} просрочено</span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5"
          onClick={onNewTaskClick}
        >
          <CheckSquare className="h-4 w-4" />
          Новая задача
        </Button>
        <Button
          size="sm"
          className="h-8 gap-1.5"
          onClick={onNewProjectClick}
        >
          <Plus className="h-4 w-4" />
          Новый проект
        </Button>
      </div>
    </div>
  );
}

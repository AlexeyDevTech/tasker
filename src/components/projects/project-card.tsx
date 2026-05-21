'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MoreHorizontal, 
  Calendar, 
  CheckCircle2,
  Clock,
  Users,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    color: string;
    icon: string | null;
    status: string;
    progress: number;
    startDate: Date | null;
    endDate: Date | null;
    owner: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
    _count?: {
      tasks: number;
      children: number;
    };
    tasks?: Array<{ status: string }>;
  };
  onEdit?: () => void;
  onDelete?: () => void;
}

const statusLabels: Record<string, string> = {
  active: 'Активен',
  completed: 'Завершён',
  archived: 'Архив',
  'on-hold': 'На паузе',
};

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  active: { 
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', 
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500' 
  },
  completed: { 
    bg: 'bg-blue-500/10 dark:bg-blue-500/20', 
    text: 'text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500' 
  },
  archived: { 
    bg: 'bg-slate-500/10 dark:bg-slate-500/20', 
    text: 'text-slate-700 dark:text-slate-400',
    dot: 'bg-slate-500' 
  },
  'on-hold': { 
    bg: 'bg-amber-500/10 dark:bg-amber-500/20', 
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500' 
  },
};

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const completedTasks = project.tasks?.filter((t) => t.status === 'done').length || 0;
  const totalTasks = project.tasks?.length || project._count?.tasks || 0;
  const statusStyle = statusConfig[project.status] || statusConfig.active;

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="group relative overflow-hidden cursor-pointer border-border hover:border-foreground/15 hover:shadow-sm transition-colors">
        {/* Color accent bar */}
        <div
          className="absolute left-0 top-0 h-full w-1"
          style={{ backgroundColor: project.color }}
        />

        <CardHeader className="pb-3 pl-5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-md text-lg flex-shrink-0"
                style={{ backgroundColor: `${project.color}1a` }}
              >
                {project.icon || '📁'}
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-[15px] line-clamp-1 group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
                <span className={cn(
                  'inline-flex items-center gap-1.5 mt-0.5 text-xs font-medium',
                  statusStyle.text
                )}>
                  <span className={cn('h-1.5 w-1.5 rounded-full', statusStyle.dot)} />
                  {statusLabels[project.status] || project.status}
                </span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent flex-shrink-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={(e) => { e.preventDefault(); onEdit?.(); }}>
                  Редактировать
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => { e.preventDefault(); onDelete?.(); }}
                  className="text-destructive focus:text-destructive"
                >
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pb-4 pl-5">
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
              {project.description}
            </p>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Прогресс</span>
              <span className="font-medium tabular-nums">{project.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${project.progress}%`, backgroundColor: project.color }}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-3 pl-5 border-t border-border">
          <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="tabular-nums">{completedTasks}/{totalTasks}</span>
              </div>
              {(project._count?.children || 0) > 0 && (
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  <span>{project._count?.children}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {project.endDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{format(new Date(project.endDate), 'd MMM', { locale: ru })}</span>
                </div>
              )}
              <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all" />
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

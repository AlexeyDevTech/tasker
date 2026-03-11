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
      <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer border-border/50 hover:border-primary/30 bg-gradient-to-br from-card to-card/80">
        {/* Animated gradient border on hover */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Color accent bar */}
        <div 
          className="absolute left-0 top-0 h-full w-1.5 rounded-l-xl transition-all duration-300 group-hover:w-2"
          style={{ background: `linear-gradient(to bottom, ${project.color}, ${project.color}dd)` }}
        />
        
        {/* Decorative background pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5 dark:opacity-[0.03]">
          <div 
            className="w-full h-full rounded-full blur-2xl"
            style={{ backgroundColor: project.color }}
          />
        </div>
        
        <CardHeader className="pb-3 relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Icon with gradient background */}
              <div 
                className="relative flex h-12 w-12 items-center justify-center rounded-xl text-2xl shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                style={{ 
                  background: `linear-gradient(135deg, ${project.color}20, ${project.color}40)`,
                  boxShadow: `0 4px 12px ${project.color}20`
                }}
              >
                <span className="drop-shadow-sm">{project.icon || '📁'}</span>
                {project.progress === 100 && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
                    statusStyle.bg,
                    statusStyle.text
                  )}>
                    <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", statusStyle.dot)} />
                    {statusLabels[project.status] || project.status}
                  </span>
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary/10"
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

        <CardContent className="pb-4 relative">
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
              {project.description}
            </p>
          )}

          {/* Enhanced Progress */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">Прогресс</span>
              <span className="font-bold text-primary">{project.progress}%</span>
            </div>
            <div className="relative h-2.5 rounded-full bg-muted overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${project.progress}%`,
                  background: `linear-gradient(90deg, ${project.color}, ${project.color}cc)`
                }}
              />
              {/* Shimmer effect */}
              {project.progress > 0 && project.progress < 100 && (
                <div 
                  className="absolute inset-y-0 left-0 rounded-full animate-shimmer"
                  style={{ 
                    width: `${project.progress}%`,
                    background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
                  }}
                />
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-3 border-t border-border/50 relative">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {/* Tasks count */}
              <div className="flex items-center gap-1.5 transition-colors group-hover:text-foreground">
                <div className="p-1 rounded-md bg-primary/10">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="font-medium">{completedTasks}/{totalTasks}</span>
              </div>

              {/* Subprojects count */}
              {(project._count?.children || 0) > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded-md bg-muted">
                    <Users className="h-3.5 w-3.5" />
                  </div>
                  <span>{project._count?.children}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Date */}
              {project.endDate && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{format(new Date(project.endDate), 'd MMM', { locale: ru })}</span>
                </div>
              )}
              
              {/* Arrow indicator */}
              <ArrowRight className="h-4 w-4 text-muted-foreground/0 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

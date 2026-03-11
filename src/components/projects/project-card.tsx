'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MoreHorizontal, 
  Calendar, 
  CheckCircle2,
  Clock,
  Users,
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
import type { Project } from '@/types';

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

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-600 border-green-500/20',
  completed: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  archived: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  'on-hold': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
};

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const completedTasks = project.tasks?.filter((t) => t.status === 'done').length || 0;
  const totalTasks = project.tasks?.length || project._count?.tasks || 0;

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/20 cursor-pointer">
        {/* Color accent */}
        <div 
          className="absolute left-0 top-0 h-full w-1 transition-all group-hover:w-2"
          style={{ backgroundColor: project.color }}
        />
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
                style={{ backgroundColor: `${project.color}20` }}
              >
                {project.icon || '📁'}
              </div>
              <div>
                <h3 className="font-semibold text-lg line-clamp-1">{project.name}</h3>
                <Badge 
                  variant="outline" 
                  className={statusColors[project.status] || statusColors.active}
                >
                  {statusLabels[project.status] || project.status}
                </Badge>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.preventDefault(); onEdit?.(); }}>
                  Редактировать
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => { e.preventDefault(); onDelete?.(); }}
                  className="text-destructive"
                >
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {project.description}
            </p>
          )}

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Прогресс</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
        </CardContent>

        <CardFooter className="pt-3 border-t">
          <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {/* Tasks count */}
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>{completedTasks}/{totalTasks}</span>
              </div>

              {/* Subprojects count */}
              {(project._count?.children || 0) > 0 && (
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span>{project._count?.children} подпроектов</span>
                </div>
              )}
            </div>

            {/* Date */}
            {project.endDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(project.endDate), 'd MMM', { locale: ru })}</span>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

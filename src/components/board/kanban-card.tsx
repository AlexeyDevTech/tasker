'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, CheckCircle2, Clock, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface KanbanCardProps {
  task: {
    id: string;
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    startDate?: Date | null;
    dueDate?: Date | null;
    progress?: number;
    assignee?: {
      id: string;
      name?: string | null;
      email: string;
      image?: string | null;
    } | null;
    subtasks?: any[];
    _count?: {
      comments?: number;
    };
  };
  isDragging?: boolean;
}

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-500/10 text-red-600 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  low: 'bg-green-500/10 text-green-600 border-green-500/20',
};

const priorityLabels: Record<string, string> = {
  urgent: 'Срочно',
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
};

export function KanbanCard({ task, isDragging }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const completedSubtasks = task.subtasks?.filter((s) => s.status === 'done').length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'cursor-grab active:cursor-grabbing transition-all hover:shadow-md',
        (isDragging || isSortableDragging) && 'opacity-50 shadow-lg rotate-2'
      )}
    >
      <CardContent className="p-3">
        {/* Priority badge */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge
            variant="outline"
            className={cn('text-xs', priorityColors[task.priority])}
          >
            {priorityLabels[task.priority] || task.priority}
          </Badge>
        </div>

        {/* Title */}
        <h4 className="font-medium text-sm line-clamp-2 mb-2">{task.title}</h4>

        {/* Description preview */}
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {task.description}
          </p>
        )}

        {/* Subtasks progress */}
        {totalSubtasks > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <CheckCircle2 className="h-3 w-3" />
            <span>{completedSubtasks}/{totalSubtasks} подзадач</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            {/* Due date */}
            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(task.dueDate), 'd MMM', { locale: ru })}</span>
              </div>
            )}

            {/* Comments count */}
            {(task._count?.comments || 0) > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span>{task._count?.comments}</span>
              </div>
            )}
          </div>

          {/* Assignee */}
          {task.assignee && (
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assignee.image || undefined} />
              <AvatarFallback className="text-xs">
                {task.assignee.name?.[0]?.toUpperCase() || task.assignee.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

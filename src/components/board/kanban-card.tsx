
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  MoreHorizontal,
  Calendar,
  CheckCircle2,
  MessageSquare,
  GripVertical,
  Clock,
  Hash,
  Sparkles,
  Bug,
  Wrench,
  Recycle,
  FileText,
  FlaskConical,
  type LucideIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getPriorityMeta, getTypeMeta, formatTaskKey } from '@/lib/task-config';

const TYPE_ICONS: Record<string, LucideIcon> = {
  Sparkles, Bug, Wrench, Recycle, FileText, FlaskConical,
};
import { format, isPast, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';

interface KanbanCardProps {
  task: {
    id: string;
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    type?: string | null;
    storyPoints?: number | null;
    number?: number | null;
    project?: { key?: string | null } | null;
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
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function KanbanCard({ task, isDragging, onView, onEdit, onDelete }: KanbanCardProps) {
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
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
  const priority = getPriorityMeta(task.priority);
  const taskType = getTypeMeta(task.type);
  const TypeIcon = TYPE_ICONS[taskType.icon] ?? Sparkles;
  const taskKey = formatTaskKey(task.project?.key, task.number);

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && task.status !== 'done';
  const isDueToday = dueDate && isToday(dueDate);

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      e.stopPropagation();
      return;
    }
    onView?.();
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative bg-card border-border rounded-lg transition-colors',
        'hover:border-foreground/15 hover:shadow-sm',
        'cursor-pointer active:cursor-grabbing',
        (isDragging || isSortableDragging) && 'opacity-70 shadow-md z-50'
      )}
      onClick={handleCardClick}
    >
      {/* Drag handle area */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="p-3">
        {/* Header: Priority & Menu */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <TypeIcon className={cn('h-4 w-4 shrink-0', taskType.iconColor)} aria-label={taskType.label} />
            <Badge
              variant="secondary"
              className={cn(
                'font-medium text-[11px] px-2 py-0.5 rounded-full border-0',
                priority.badgeBg,
                priority.badgeText
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', priority.dot)} />
              {priority.label}
            </Badge>
            {taskKey && (
              <span className="font-mono text-[11px] text-muted-foreground truncate">
                {taskKey}
              </span>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
              >
                Редактировать
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="text-destructive focus:text-destructive"
              >
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title */}
        <h4 className="font-medium text-sm line-clamp-2 mb-2 leading-snug group-hover:text-primary transition-colors">
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Subtasks progress */}
        {totalSubtasks > 0 && (
          <div className="mb-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Подзадачи
              </span>
              <span className="font-medium">{completedSubtasks}/{totalSubtasks}</span>
            </div>
            <Progress value={subtaskProgress} className="h-1.5" />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-3">
            {/* Due date */}
            {dueDate && (
              <div className={cn(
                'flex items-center gap-1.5 text-xs font-medium',
                isOverdue ? 'text-rose-500' : 
                isDueToday ? 'text-amber-500' : 
                'text-muted-foreground'
              )}>
                {isOverdue ? (
                  <Clock className="h-3.5 w-3.5" />
                ) : (
                  <Calendar className="h-3.5 w-3.5" />
                )}
                <span>{format(dueDate, 'd MMM', { locale: ru })}</span>
              </div>
            )}

            {/* Comments count */}
            {(task._count?.comments || 0) > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{task._count?.comments}</span>
              </div>
            )}

            {/* Story points */}
            {task.storyPoints != null && (
              <div className="flex items-center gap-0.5 text-xs font-medium text-muted-foreground" title="Story points">
                <Hash className="h-3.5 w-3.5" />
                <span>{task.storyPoints}</span>
              </div>
            )}
          </div>

          {/* Assignee */}
          {task.assignee && (
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assignee.image || undefined} />
              <AvatarFallback className="text-[10px] font-medium bg-primary/10 text-primary">
                {task.assignee.name?.[0]?.toUpperCase() || task.assignee.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </Card>
  );
}

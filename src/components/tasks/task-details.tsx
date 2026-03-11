'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Trash2,
  User,
  Tag,
  CalendarDays,
  ListChecks,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isPast, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  'todo': { label: 'К выполнению', bg: 'bg-slate-100 dark:bg-slate-800/50', text: 'text-slate-700 dark:text-slate-300' },
  'in-progress': { label: 'В работе', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  'review': { label: 'На проверке', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
  'done': { label: 'Готово', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
};

const priorityConfig: Record<string, { label: string; dot: string }> = {
  'low': { label: 'Низкий', dot: 'bg-slate-400' },
  'medium': { label: 'Средний', dot: 'bg-blue-500' },
  'high': { label: 'Высокий', dot: 'bg-amber-500' },
  'urgent': { label: 'Срочно', dot: 'bg-rose-500' },
};

interface TaskDetailsProps {
  task: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (data: any) => void;
  onDelete?: () => void;
}

export function TaskDetails({ task, open, onOpenChange, onUpdate, onDelete }: TaskDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task?.title || '');
  const [editedDescription, setEditedDescription] = useState(task?.description || '');
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  if (!task) return null;

  const status = statusConfig[task.status] || statusConfig['todo'];
  const priority = priorityConfig[task.priority] || priorityConfig['medium'];
  
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && task.status !== 'done';
  const isDueToday = dueDate && isToday(dueDate);

  const completedSubtasks = task.subtasks?.filter((s: any) => s.status === 'done').length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const handleSave = () => {
    onUpdate?.({
      id: task.id,
      title: editedTitle,
      description: editedDescription,
    });
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus: string) => {
    onUpdate?.({ id: task.id, status: newStatus });
  };

  const handlePriorityChange = (newPriority: string) => {
    onUpdate?.({ id: task.id, priority: newPriority });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    // Here you would call a comment API
    setNewComment('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 bg-card/95 backdrop-blur-xl border-border/50">
        {/* Header */}
        <div className="p-6 pb-0">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              {isEditing ? (
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-xl font-semibold border-0 p-0 h-auto focus-visible:ring-0"
                />
              ) : (
                <DialogTitle className="text-xl leading-tight">{task.title}</DialogTitle>
              )}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* Quick actions */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Select value={task.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-8 w-auto">
                <Badge className={cn('font-medium', status.bg, status.text, 'border-0')}>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {status.label}
                </Badge>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusConfig).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={task.priority} onValueChange={handlePriorityChange}>
              <SelectTrigger className="h-8 w-auto">
                <Badge variant="outline" className="font-medium">
                  <span className={cn('w-2 h-2 rounded-full mr-1.5', priority.dot)} />
                  {priority.label}
                </Badge>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(priorityConfig).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span className={cn('w-2 h-2 rounded-full', value.dot)} />
                      {value.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Tabs */}
        <div className="px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-9 p-0.5 bg-muted/50">
              <TabsTrigger value="details" className="h-8 px-3 text-xs gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                Детали
              </TabsTrigger>
              <TabsTrigger value="subtasks" className="h-8 px-3 text-xs gap-1.5">
                <ListChecks className="h-3.5 w-3.5" />
                Подзадачи {totalSubtasks > 0 && `(${completedSubtasks}/${totalSubtasks})`}
              </TabsTrigger>
              <TabsTrigger value="comments" className="h-8 px-3 text-xs gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                Комментарии {task._count?.comments ? `(${task._count.comments})` : ''}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 px-6 py-4 max-h-[400px]">
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="details" className="mt-0 space-y-5">
              {/* Description */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Описание</Label>
                {isEditing ? (
                  <Textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    placeholder="Добавьте описание..."
                    rows={4}
                    className="resize-none"
                  />
                ) : (
                  <p className="text-sm leading-relaxed">
                    {task.description ||<span className="text-muted-foreground italic">Нет описания</span>}
                  </p>
                )}
              </div>

              {/* Subtasks progress */}
              {totalSubtasks > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Прогресс подзадач</span>
                    <span className="font-medium">{completedSubtasks}/{totalSubtasks}</span>
                  </div>
                  <Progress value={subtaskProgress} className="h-2" />
                </div>
              )}

              {/* Meta info */}
              <div className="grid grid-cols-2 gap-4">
                {/* Due date */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="h-9 w-9 rounded-lg bg-background flex items-center justify-center">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Срок выполнения</p>
                    <p className={cn(
                      "text-sm font-medium",
                      isOverdue && "text-rose-500",
                      isDueToday && "text-amber-500"
                    )}>
                      {dueDate ? format(dueDate, 'd MMMM yyyy', { locale: ru }) : 'Не указан'}
                    </p>
                  </div>
                </div>

                {/* Assignee */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={task.assignee?.image || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs font-medium">
                      {task.assignee?.name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs text-muted-foreground">Исполнитель</p>
                    <p className="text-sm font-medium">{task.assignee?.name || 'Не назначен'}</p>
                  </div>
                </div>
              </div>

              {/* Created info */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                <span>Создано: {format(new Date(task.createdAt), 'd MMM yyyy, HH:mm', { locale: ru })}</span>
                {task.updatedAt && task.updatedAt !== task.createdAt && (
                  <span>Обновлено: {format(new Date(task.updatedAt), 'd MMM yyyy, HH:mm', { locale: ru })}</span>
                )}
              </div>
            </TabsContent>

            <TabsContent value="subtasks" className="mt-0 space-y-2">
              {totalSubtasks === 0 ? (
                <div className="text-center py-8">
                  <div className="h-12 w-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                    <ListChecks className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">Нет подзадач</p>
                </div>
              ) : (
                task.subtasks?.map((subtask: any) => (
                  <div
                    key={subtask.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <CheckCircle2 className={cn(
                      "h-4 w-4",
                      subtask.status === 'done' ? "text-emerald-500" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-sm",
                      subtask.status === 'done' && "line-through text-muted-foreground"
                    )}>
                      {subtask.title}
                    </span>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="comments" className="mt-0 space-y-4">
              {/* Add comment */}
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                    U
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Написать комментарий..."
                    className="flex-1"
                  />
                  <Button size="icon" onClick={handleAddComment} disabled={!newComment.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Comments list placeholder */}
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Комментариев пока нет</p>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        {/* Footer */}
        {isEditing && (
          <div className="p-4 border-t border-border/50 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Отмена</Button>
            <Button onClick={handleSave}>Сохранить</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

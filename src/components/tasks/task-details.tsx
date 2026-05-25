'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
  Hash,
  Sparkles,
  Bug,
  Wrench,
  Recycle,
  FileText,
  FlaskConical,
  GitBranch,
  GitPullRequest,
  GitCommit,
  CircleDot,
  Copy,
  Check,
  Plus,
  ExternalLink,
  Trash,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Markdown } from '@/components/common/markdown';
import { branchName } from '@/lib/git';
import {
  STATUS_META,
  PRIORITY_META,
  TYPE_META,
  SEVERITY_META,
  STATUS_ORDER,
  getStatusMeta,
  getPriorityMeta,
  getTypeMeta,
  getSeverityMeta,
  formatTaskKey,
} from '@/lib/task-config';

// Карта строковых имён иконок (из TYPE_META) в компоненты lucide.
const TYPE_ICONS: Record<string, LucideIcon> = {
  Sparkles,
  Bug,
  Wrench,
  Recycle,
  FileText,
  FlaskConical,
};
import { format, isPast, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';

// Иконки/подписи видов Git-связей.
const LINK_KIND_META: Record<string, { icon: LucideIcon; label: string }> = {
  pr: { icon: GitPullRequest, label: 'PR' },
  commit: { icon: GitCommit, label: 'Commit' },
  issue: { icon: CircleDot, label: 'Issue' },
  branch: { icon: GitBranch, label: 'Ветка' },
};

const LINK_STATE_META: Record<string, { label: string; badgeBg: string; badgeText: string }> = {
  open: { label: 'open', badgeBg: 'bg-emerald-100 dark:bg-emerald-900/30', badgeText: 'text-emerald-700 dark:text-emerald-300' },
  merged: { label: 'merged', badgeBg: 'bg-violet-100 dark:bg-violet-900/30', badgeText: 'text-violet-700 dark:text-violet-300' },
  closed: { label: 'closed', badgeBg: 'bg-rose-100 dark:bg-rose-900/30', badgeText: 'text-rose-700 dark:text-rose-300' },
};

interface TaskDetailsProps {
  task: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (data: any) => void;
  onDelete?: () => void;
  onAddLink?: (taskId: string, url: string) => void;
  onRemoveLink?: (linkId: string) => void;
}

export function TaskDetails({ task, open, onOpenChange, onUpdate, onDelete, onAddLink, onRemoveLink }: TaskDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task?.title || '');
  const [editedDescription, setEditedDescription] = useState(task?.description || '');
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [copiedBranch, setCopiedBranch] = useState(false);

  // Контекстные горячие клавиши, пока шторка открыта:
  //   E    — режим редактирования
  //   1–5  — статус по порядку (К выполнению … Отменено)
  useEffect(() => {
    if (!open || !task) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsEditing((v) => !v);
        return;
      }
      const idx = parseInt(e.key, 10);
      if (!Number.isNaN(idx) && idx >= 1 && idx <= STATUS_ORDER.length) {
        e.preventDefault();
        onUpdate?.({ id: task.id, status: STATUS_ORDER[idx - 1] });
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, task, onUpdate]);

  if (!task) return null;

  const status = getStatusMeta(task.status);
  const priority = getPriorityMeta(task.priority);
  const taskType = getTypeMeta(task.type);
  const severity = getSeverityMeta(task.severity);
  const TypeIcon = TYPE_ICONS[taskType.icon] ?? Sparkles;
  const taskKey = formatTaskKey(task.project?.key, task.number);
  const links: any[] = task.links ?? [];
  const branch = branchName(task.project?.key, task.number, task.title || '', task.type);

  const copyBranch = async () => {
    try {
      await navigator.clipboard.writeText(branch);
      setCopiedBranch(true);
      setTimeout(() => setCopiedBranch(false), 1500);
    } catch {
      /* clipboard может быть недоступен (нет https) — молча игнорируем */
    }
  };

  const handleAddLink = () => {
    const url = newLinkUrl.trim();
    if (!url) return;
    onAddLink?.(task.id, url);
    setNewLinkUrl('');
  };
  
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

  const handleTypeChange = (newType: string) => {
    // При смене типа с бага severity больше не имеет смысла — сбрасываем.
    onUpdate?.({ id: task.id, type: newType, ...(newType !== 'bug' ? { severity: null } : {}) });
  };

  const handleSeverityChange = (newSeverity: string) => {
    onUpdate?.({ id: task.id, severity: newSeverity });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    // Here you would call a comment API
    setNewComment('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 sm:max-w-xl bg-card border-border/50"
      >
        {/* Header */}
        <div className="p-6 pb-0 pr-12">
          {taskKey && (
            <span className="font-mono text-xs text-muted-foreground">{taskKey}</span>
          )}
          <SheetHeader className="p-0">
            <div className="flex items-start justify-between gap-4">
              {isEditing ? (
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-xl font-semibold border-0 p-0 h-auto focus-visible:ring-0"
                />
              ) : (
                <SheetTitle className="text-xl leading-tight">{task.title}</SheetTitle>
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
          </SheetHeader>

          {/* Quick actions */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Select value={task.type || 'feature'} onValueChange={handleTypeChange}>
              <SelectTrigger className="h-8 w-auto">
                <Badge className={cn('font-medium', taskType.badgeBg, taskType.badgeText, 'border-0')}>
                  <TypeIcon className="h-3 w-3 mr-1" />
                  {taskType.label}
                </Badge>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_META).map(([key, value]) => {
                  const Icon = TYPE_ICONS[value.icon] ?? Sparkles;
                  return (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <Icon className={cn('h-3.5 w-3.5', value.iconColor)} />
                        {value.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <Select value={task.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-8 w-auto">
                <Badge className={cn('font-medium', status.badgeBg, status.badgeText, 'border-0')}>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {status.label}
                </Badge>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_META).map(([key, value]) => (
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
                {Object.entries(PRIORITY_META).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span className={cn('w-2 h-2 rounded-full', value.dot)} />
                      {value.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Severity — только для багов */}
            {task.type === 'bug' && (
              <Select value={task.severity || ''} onValueChange={handleSeverityChange}>
                <SelectTrigger className="h-8 w-auto">
                  <Badge
                    className={cn(
                      'font-medium border-0',
                      severity ? severity.badgeBg : 'bg-muted',
                      severity ? severity.badgeText : 'text-muted-foreground'
                    )}
                  >
                    <Bug className="h-3 w-3 mr-1" />
                    {severity ? severity.label : 'Severity'}
                  </Badge>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SEVERITY_META).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <span className={cn('w-2 h-2 rounded-full', value.dot)} />
                        {value.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
              <TabsTrigger value="git" className="h-8 px-3 text-xs gap-1.5">
                <GitBranch className="h-3.5 w-3.5" />
                Git {links.length > 0 && `(${links.length})`}
              </TabsTrigger>
              <TabsTrigger value="comments" className="h-8 px-3 text-xs gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                Комментарии {task._count?.comments ? `(${task._count.comments})` : ''}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 px-6 py-4">
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="details" className="mt-0 space-y-5">
              {/* Description */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Описание</Label>
                {isEditing ? (
                  <>
                    <Textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      placeholder="Добавьте описание... Поддерживается Markdown и блоки кода ```"
                      rows={6}
                      className="resize-none font-mono text-xs"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Markdown: **жирный**, списки, `код`, ```блоки кода```
                    </p>
                  </>
                ) : task.description ? (
                  <Markdown content={task.description} />
                ) : (
                  <p className="text-sm leading-relaxed text-muted-foreground italic">Нет описания</p>
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

                {/* Story points */}
                {task.storyPoints != null && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="h-9 w-9 rounded-lg bg-background flex items-center justify-center">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Story points</p>
                      <p className="text-sm font-medium">{task.storyPoints}</p>
                    </div>
                  </div>
                )}

                {/* Estimated hours */}
                {task.estimatedHours != null && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="h-9 w-9 rounded-lg bg-background flex items-center justify-center">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Оценка</p>
                      <p className="text-sm font-medium">{task.estimatedHours} ч</p>
                    </div>
                  </div>
                )}
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

            <TabsContent value="git" className="mt-0 space-y-5">
              {/* Branch name */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Имя ветки</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded-md bg-muted px-3 py-2 text-xs font-mono">{branch}</code>
                  <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={copyBranch} title="Скопировать">
                    {copiedBranch ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Links */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Связи</Label>

                {onAddLink && (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                      placeholder="Ссылка на PR / commit / issue"
                      className="flex-1 h-9"
                    />
                    <Button size="icon" className="h-9 w-9 shrink-0" onClick={handleAddLink} disabled={!newLinkUrl.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {links.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic py-2">Связей пока нет</p>
                ) : (
                  <div className="space-y-1.5">
                    {links.map((link) => {
                      const meta = LINK_KIND_META[link.kind] ?? LINK_KIND_META.branch;
                      const Icon = meta.icon;
                      const stateMeta = link.state ? LINK_STATE_META[link.state] : null;
                      return (
                        <div key={link.id} className="group flex items-center gap-2.5 p-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-w-0 flex items-center gap-1.5 text-sm hover:text-primary"
                          >
                            <span className="truncate">{link.title || link.url}</span>
                            <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
                          </a>
                          {stateMeta && (
                            <Badge className={cn('font-medium border-0 text-[10px]', stateMeta.badgeBg, stateMeta.badgeText)}>
                              {stateMeta.label}
                            </Badge>
                          )}
                          {onRemoveLink && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                              onClick={() => onRemoveLink(link.id)}
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
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
      </SheetContent>
    </Sheet>
  );
}

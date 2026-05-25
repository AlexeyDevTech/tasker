'use client';

// Backlog-вид: планирование спринтов. Показывает спринты (активные →
// запланированные → завершённые) и общий бэклог (задачи без спринта).
// Позволяет создавать/запускать/завершать/удалять спринты и переносить
// задачи между бэклогом и спринтами.
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Hash,
  Play,
  CheckCircle2,
  Trash2,
  LayoutGrid,
  MoveRight,
  Layers,
  Target,
  MoreHorizontal,
  Sparkles,
  Bug,
  Wrench,
  Recycle,
  FileText,
  FlaskConical,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTypeMeta, formatTaskKey, getStatusMeta } from '@/lib/task-config';
import type { SprintStatus } from '@/types';

const TYPE_ICONS: Record<string, LucideIcon> = {
  Sparkles, Bug, Wrench, Recycle, FileText, FlaskConical,
};

const SPRINT_STATUS_META: Record<SprintStatus, { label: string; badgeBg: string; badgeText: string }> = {
  active: { label: 'Активен', badgeBg: 'bg-blue-100 dark:bg-blue-900/30', badgeText: 'text-blue-700 dark:text-blue-300' },
  planned: { label: 'Запланирован', badgeBg: 'bg-slate-100 dark:bg-slate-800/50', badgeText: 'text-slate-700 dark:text-slate-300' },
  completed: { label: 'Завершён', badgeBg: 'bg-emerald-100 dark:bg-emerald-900/30', badgeText: 'text-emerald-700 dark:text-emerald-300' },
};

// Порядок групп: активные → запланированные → завершённые.
const STATUS_RANK: Record<string, number> = { active: 0, planned: 1, completed: 2 };

interface BacklogViewProps {
  tasks: any[];
  sprints: any[];
  isLoading?: boolean;
  onCreateSprint: (data: { name: string; goal?: string }) => void;
  onUpdateSprint: (id: string, data: any) => void;
  onDeleteSprint: (id: string) => void;
  onMoveTask: (taskId: string, sprintId: string | null) => void;
  onSelectTask: (taskId: string) => void;
  onOpenSprintBoard: (sprintId: string) => void;
}

function sumPoints(tasks: any[]): number {
  return tasks.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
}

export function BacklogView({
  tasks,
  sprints,
  isLoading,
  onCreateSprint,
  onUpdateSprint,
  onDeleteSprint,
  onMoveTask,
  onSelectTask,
  onOpenSprintBoard,
}: BacklogViewProps) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');

  const sortedSprints = [...sprints].sort(
    (a, b) => (STATUS_RANK[a.status] ?? 9) - (STATUS_RANK[b.status] ?? 9)
  );
  const backlogTasks = tasks.filter((t) => !t.sprintId);

  const submitCreate = () => {
    if (!name.trim()) return;
    onCreateSprint({ name: name.trim(), goal: goal.trim() || undefined });
    setName('');
    setGoal('');
    setCreating(false);
  };

  // Строка задачи с меню переноса между спринтами/бэклогом.
  const TaskRow = ({ task }: { task: any }) => {
    const typeMeta = getTypeMeta(task.type);
    const TypeIcon = TYPE_ICONS[typeMeta.icon] ?? Sparkles;
    const status = getStatusMeta(task.status);
    const key = formatTaskKey(task.project?.key, task.number);
    return (
      <div
        className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
        onClick={() => onSelectTask(task.id)}
      >
        <TypeIcon className={cn('h-4 w-4 shrink-0', typeMeta.iconColor)} aria-label={typeMeta.label} />
        {key && <span className="font-mono text-xs text-muted-foreground shrink-0">{key}</span>}
        <span className={cn('text-sm truncate flex-1', task.status === 'done' && 'line-through text-muted-foreground')}>
          {task.title}
        </span>
        <Badge className={cn('font-medium border-0 text-[10px] hidden sm:inline-flex', status.badgeBg, status.badgeText)}>
          {status.label}
        </Badge>
        {task.storyPoints != null && (
          <span className="flex items-center gap-0.5 text-xs font-medium text-muted-foreground shrink-0">
            <Hash className="h-3.5 w-3.5" />
            {task.storyPoints}
          </span>
        )}
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoveRight className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Переместить в</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {task.sprintId && (
                <DropdownMenuItem onClick={() => onMoveTask(task.id, null)}>
                  <Layers className="mr-2 h-4 w-4" />
                  Бэклог
                </DropdownMenuItem>
              )}
              {sprints
                .filter((s) => s.id !== task.sprintId && s.status !== 'completed')
                .map((s) => (
                  <DropdownMenuItem key={s.id} onClick={() => onMoveTask(task.id, s.id)}>
                    <Target className="mr-2 h-4 w-4" />
                    {s.name}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Спринты и бэклог</h2>
        {!creating && (
          <Button size="sm" onClick={() => setCreating(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Новый спринт
          </Button>
        )}
      </div>

      {/* Inline create form */}
      {creating && (
        <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
          <Input
            placeholder="Название спринта (напр. Спринт 1)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitCreate();
              if (e.key === 'Escape') setCreating(false);
            }}
          />
          <Textarea
            placeholder="Цель спринта (необязательно)"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            rows={2}
            className="resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setCreating(false)}>Отмена</Button>
            <Button size="sm" onClick={submitCreate} disabled={!name.trim()}>Создать</Button>
          </div>
        </div>
      )}

      {/* Sprints */}
      {sortedSprints.map((sprint) => {
        const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id);
        const meta = SPRINT_STATUS_META[sprint.status as SprintStatus] ?? SPRINT_STATUS_META.planned;
        const done = sprintTasks.filter((t) => t.status === 'done').length;
        return (
          <div key={sprint.id} className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <div className="flex items-start justify-between gap-3 p-4 border-b border-border/50 bg-muted/30">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold truncate">{sprint.name}</h3>
                  <Badge className={cn('font-medium border-0', meta.badgeBg, meta.badgeText)}>{meta.label}</Badge>
                </div>
                {sprint.goal && <p className="text-sm text-muted-foreground mt-1">{sprint.goal}</p>}
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>{done}/{sprintTasks.length} задач</span>
                  <span className="flex items-center gap-0.5">
                    <Hash className="h-3.5 w-3.5" />
                    {sumPoints(sprintTasks)} SP
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {sprint.status !== 'completed' && (
                  <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => onOpenSprintBoard(sprint.id)}>
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Доска</span>
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    {sprint.status === 'planned' && (
                      <DropdownMenuItem onClick={() => onUpdateSprint(sprint.id, { status: 'active' })}>
                        <Play className="mr-2 h-4 w-4" />
                        Начать спринт
                      </DropdownMenuItem>
                    )}
                    {sprint.status === 'active' && (
                      <DropdownMenuItem onClick={() => onUpdateSprint(sprint.id, { status: 'completed' })}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Завершить спринт
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDeleteSprint(sprint.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Удалить
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="p-2">
              {sprintTasks.length === 0 ? (
                <p className="px-3 py-4 text-sm text-muted-foreground text-center">
                  Перетащите сюда задачи из бэклога через меню «Переместить»
                </p>
              ) : (
                sprintTasks.map((task) => <TaskRow key={task.id} task={task} />)
              )}
            </div>
          </div>
        );
      })}

      {/* Backlog */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/30">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Бэклог</h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{backlogTasks.length} задач</span>
            <span className="flex items-center gap-0.5">
              <Hash className="h-3.5 w-3.5" />
              {sumPoints(backlogTasks)} SP
            </span>
          </div>
        </div>
        <div className="p-2">
          {backlogTasks.length === 0 ? (
            <p className="px-3 py-6 text-sm text-muted-foreground text-center">Бэклог пуст</p>
          ) : (
            backlogTasks.map((task) => <TaskRow key={task.id} task={task} />)
          )}
        </div>
      </div>
    </div>
  );
}

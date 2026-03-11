'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TaskDetails } from './task-details';
import { 
  Search, 
  MoreHorizontal, 
  Calendar, 
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Filter,
  GripVertical,
  Eye,
  Pencil,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isPast, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { TaskStatus, TaskPriority } from '@/types';

interface TaskListViewProps {
  tasks: any[];
  isLoading?: boolean;
  onStatusChange?: (taskId: string, status: string) => void;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
}

const statusConfig: Record<TaskStatus, { label: string; bg: string; text: string }> = {
  'todo': { label: 'К выполнению', bg: 'bg-slate-100 dark:bg-slate-800/50', text: 'text-slate-700 dark:text-slate-300' },
  'in-progress': { label: 'В работе', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  'review': { label: 'На проверке', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
  'done': { label: 'Готово', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
  'cancelled': { label: 'Отменено', bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300' },
};

const priorityConfig: Record<TaskPriority, { label: string; dot: string }> = {
  urgent: { label: 'Срочно', dot: 'bg-rose-500' },
  high: { label: 'Высокий', dot: 'bg-amber-500' },
  medium: { label: 'Средний', dot: 'bg-blue-500' },
  low: { label: 'Низкий', dot: 'bg-slate-400' },
};

export function TaskListView({ tasks, isLoading, onStatusChange, onEdit, onDelete }: TaskListViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [sortField, setSortField] = useState<'title' | 'dueDate' | 'priority'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter((task) => {
      if (search && !task.title.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false;
      }
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === 'dueDate') {
        const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        comparison = aDate - bDate;
      } else if (sortField === 'priority') {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        comparison = priorityOrder[a.priority as TaskPriority] - priorityOrder[b.priority as TaskPriority];
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const paginatedTasks = filteredTasks.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredTasks.length / pageSize);

  const toggleSort = (field: 'title' | 'dueDate' | 'priority') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(filteredTasks.map(t => t.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const handleSelectTask = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
  };

  const handleCheckboxChange = (task: any, checked: boolean) => {
    onStatusChange?.(task.id, checked ? 'done' : 'todo');
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск задач..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 h-10 bg-muted/30 border-border/50 focus:border-primary/50"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as TaskStatus | 'all'); setPage(1); }}>
          <SelectTrigger className="w-[160px] h-10 bg-muted/30 border-border/50">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            {Object.entries(statusConfig).map(([key, value]) => (
              <SelectItem key={key} value={key}>{value.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v as TaskPriority | 'all'); setPage(1); }}>
          <SelectTrigger className="w-[160px] h-10 bg-muted/30 border-border/50">
            <SelectValue placeholder="Приоритет" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все приоритеты</SelectItem>
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

        {selectedTasks.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">
              Выбрано: {selectedTasks.length}
            </span>
            <Button variant="outline" size="sm" className="h-8">
              Массовые действия
            </Button>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Найдено: {filteredTasks.length} {filteredTasks.length === 1 ? 'задача' : filteredTasks.length < 5 ? 'задачи' : 'задач'}
        </p>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/50 overflow-hidden bg-card/50">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="w-10">
                <Checkbox 
                  checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-6" />
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 hover:bg-muted"
                  onClick={() => toggleSort('title')}
                >
                  Задача
                  <ArrowUpDown className={cn("ml-2 h-3 w-3", sortField === 'title' ? "text-primary" : "text-muted-foreground")} />
                </Button>
              </TableHead>
              <TableHead className="w-32">Статус</TableHead>
              <TableHead className="w-32">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 hover:bg-muted"
                  onClick={() => toggleSort('priority')}
                >
                  Приоритет
                  <ArrowUpDown className={cn("ml-2 h-3 w-3", sortField === 'priority' ? "text-primary" : "text-muted-foreground")} />
                </Button>
              </TableHead>
              <TableHead className="w-40">Исполнитель</TableHead>
              <TableHead className="w-32">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 hover:bg-muted"
                  onClick={() => toggleSort('dueDate')}
                >
                  Срок
                  <ArrowUpDown className={cn("ml-2 h-3 w-3", sortField === 'dueDate' ? "text-primary" : "text-muted-foreground")} />
                </Button>
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <Search className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">Нет задач</p>
                    <p className="text-xs text-muted-foreground">Попробуйте изменить фильтры</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTasks.map((task) => {
                const status = statusConfig[task.status as TaskStatus] || statusConfig['todo'];
                const priority = priorityConfig[task.priority as TaskPriority] || priorityConfig['medium'];
                const dueDate = task.dueDate ? new Date(task.dueDate) : null;
                const isOverdue = dueDate && isPast(dueDate) && task.status !== 'done';
                const isDueTodayFlag = dueDate && isToday(dueDate);
                const completedSubtasks = task.subtasks?.filter((s: any) => s.status === 'done').length || 0;
                const totalSubtasks = task.subtasks?.length || 0;

                return (
                  <TableRow 
                    key={task.id} 
                    className={cn(
                      "group cursor-pointer transition-colors border-border/50",
                      "hover:bg-muted/50",
                      selectedTasks.includes(task.id) && "bg-primary/5"
                    )}
                    onClick={() => handleTaskClick(task)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={selectedTasks.includes(task.id)}
                        onCheckedChange={(checked) => handleSelectTask(task.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className={cn("w-2 h-2 rounded-full", priority.dot)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={task.status === 'done'}
                          onCheckedChange={(checked) => {
                            handleCheckboxChange(task, checked as boolean);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="border-border/60"
                        />
                        <div className="flex flex-col gap-0.5">
                          <span className={cn(
                            "text-sm font-medium leading-tight",
                            task.status === 'done' && "line-through text-muted-foreground"
                          )}>
                            {task.title}
                          </span>
                          {totalSubtasks > 0 && (
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={(completedSubtasks / totalSubtasks) * 100} 
                                className="h-1 w-16" 
                              />
                              <span className="text-[10px] text-muted-foreground">
                                {completedSubtasks}/{totalSubtasks}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Select value={task.status} onValueChange={(v) => onStatusChange?.(task.id, v)}>
                        <SelectTrigger className="h-7 w-auto border-0 bg-transparent p-0 hover:bg-transparent">
                          <Badge className={cn('font-medium border-0', status.bg, status.text)}>
                            {status.label}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([key, value]) => (
                            <SelectItem key={key} value={key}>{value.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium border-border/50">
                        <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", priority.dot)} />
                        {priority.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 ring-1 ring-background">
                            <AvatarImage src={task.assignee.image || undefined} />
                            <AvatarFallback className="text-[10px] bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                              {task.assignee.name?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm truncate max-w-[100px]">{task.assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Не назначен</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {dueDate ? (
                        <div className={cn(
                          "flex items-center gap-1.5 text-sm",
                          isOverdue ? "text-rose-500" : isDueTodayFlag ? "text-amber-500" : "text-muted-foreground"
                        )}>
                          {isOverdue ? (
                            <Clock className="h-3.5 w-3.5" />
                          ) : (
                            <Calendar className="h-3.5 w-3.5" />
                          )}
                          <span className="font-medium">{format(dueDate, 'd MMM', { locale: ru })}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleTaskClick(task)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Открыть
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit?.(task.id)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Дублировать
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onDelete?.(task.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Страница {page} из {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Task Details Dialog */}
      <TaskDetails 
        task={selectedTask} 
        open={!!selectedTask} 
        onOpenChange={(open) => !open && setSelectedTask(null)}
        onDelete={selectedTask ? () => {
          onDelete?.(selectedTask.id);
          setSelectedTask(null);
        } : undefined}
      />
    </div>
  );
}

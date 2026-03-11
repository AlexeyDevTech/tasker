'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  MoreHorizontal, 
  Calendar, 
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { TaskStatus, TaskPriority } from '@/types';

interface TaskListViewProps {
  tasks: any[];
  isLoading?: boolean;
}

const statusLabels: Record<TaskStatus, string> = {
  'todo': 'К выполнению',
  'in-progress': 'В работе',
  'review': 'На проверке',
  'done': 'Готово',
  'cancelled': 'Отменено',
};

const statusColors: Record<TaskStatus, string> = {
  'todo': 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  'in-progress': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'review': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  'done': 'bg-green-500/10 text-green-600 border-green-500/20',
  'cancelled': 'bg-red-500/10 text-red-600 border-red-500/20',
};

const priorityLabels: Record<TaskPriority, string> = {
  urgent: '🔴 Срочно',
  high: '🟠 Высокий',
  medium: '🟡 Средний',
  low: '🟢 Низкий',
};

export function TaskListView({ tasks, isLoading }: TaskListViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [sortField, setSortField] = useState<'title' | 'dueDate' | 'priority'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

  const toggleSort = (field: 'title' | 'dueDate' | 'priority') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск задач..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | 'all')}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="todo">К выполнению</SelectItem>
            <SelectItem value="in-progress">В работе</SelectItem>
            <SelectItem value="review">На проверке</SelectItem>
            <SelectItem value="done">Готово</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TaskPriority | 'all')}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Приоритет" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все приоритеты</SelectItem>
            <SelectItem value="urgent">Срочно</SelectItem>
            <SelectItem value="high">Высокий</SelectItem>
            <SelectItem value="medium">Средний</SelectItem>
            <SelectItem value="low">Низкий</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead className="w-8" />
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3"
                  onClick={() => toggleSort('title')}
                >
                  Задача
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3"
                  onClick={() => toggleSort('priority')}
                >
                  Приоритет
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Исполнитель</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3"
                  onClick={() => toggleSort('dueDate')}
                >
                  Срок
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  Нет задач по заданным фильтрам
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow key={task.id} className="group">
                  <TableCell>
                    <Checkbox 
                      checked={task.status === 'done'}
                      onCheckedChange={() => {}}
                    />
                  </TableCell>
                  <TableCell>
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: task.priority === 'urgent' ? '#ef4444' : task.priority === 'high' ? '#f97316' : task.priority === 'medium' ? '#eab308' : '#22c55e' }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={cn(task.status === 'done' && 'line-through text-muted-foreground')}>
                        {task.title}
                      </span>
                      {task.subtasks?.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({task.subtasks.filter((s: any) => s.status === 'done').length}/{task.subtasks.length})
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[task.status as TaskStatus]}>
                      {statusLabels[task.status as TaskStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{priorityLabels[task.priority as TaskPriority]}</span>
                  </TableCell>
                  <TableCell>
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={task.assignee.image || undefined} />
                          <AvatarFallback className="text-xs">
                            {task.assignee.name?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{task.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Не назначен</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.dueDate ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {format(new Date(task.dueDate), 'd MMM', { locale: ru })}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Редактировать</DropdownMenuItem>
                        <DropdownMenuItem>Дублировать</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

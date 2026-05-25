'use client';

import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
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
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Pencil,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bug,
  Wrench,
  Recycle,
  FileText,
  FlaskConical,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { STATUS_META, PRIORITY_META, getStatusMeta, getPriorityMeta, getTypeMeta, formatTaskKey } from '@/lib/task-config';

const TYPE_ICONS: Record<string, LucideIcon> = {
  Sparkles, Bug, Wrench, Recycle, FileText, FlaskConical,
};
import { DENSITY_METRICS, DENSITY_ORDER, getDensityMetrics } from '@/lib/density';
import { useUIStore } from '@/stores/ui-store';
import { format, isPast, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { TaskStatus, TaskPriority } from '@/types';

interface TaskListViewProps {
  tasks: any[];
  isLoading?: boolean;
  onStatusChange?: (taskId: string, status: string) => void;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  /** Открыть задачу в общей правой шторке. Если задан — внутренняя шторка не рендерится. */
  onSelectTask?: (taskId: string) => void;
}

const PAGE_SIZE = 20;

export function TaskListView({ tasks, isLoading, onStatusChange, onEdit, onDelete, onSelectTask }: TaskListViewProps) {
  const { density, setDensity } = useUIStore();
  const metrics = getDensityMetrics(density);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'dueDate', desc: false }]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  // Предварительная фильтрация (поиск + статус + приоритет). Сортировку,
  // пагинацию и модель строк обслуживает TanStack Table.
  const data = useMemo(() => {
    return tasks.filter((task) => {
      if (search && !task.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      return true;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  const openTask = (task: any) => {
    if (onSelectTask) {
      onSelectTask(task.id);
      return;
    }
    setSelectedTask(task);
  };

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      id: 'select',
      enableSorting: false,
      size: 40,
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected() || (table.getIsSomeRowsSelected() && 'indeterminate')}
          onCheckedChange={(v) => table.toggleAllRowsSelected(!!v)}
          aria-label="Выбрать все"
        />
      ),
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label="Выбрать задачу"
          />
        </div>
      ),
    },
    {
      id: 'priorityDot',
      enableSorting: false,
      size: 24,
      header: () => null,
      cell: ({ row }) => (
        <div className={cn('h-2 w-2 rounded-full', getPriorityMeta(row.original.priority).dot)} />
      ),
    },
    {
      accessorKey: 'title',
      header: ({ column }) => <SortHeader column={column} label="Задача" />,
      cell: ({ row }) => {
        const task = row.original;
        const completed = task.subtasks?.filter((s: any) => s.status === 'done').length || 0;
        const total = task.subtasks?.length || 0;
        const typeMeta = getTypeMeta(task.type);
        const TypeIcon = TYPE_ICONS[typeMeta.icon] ?? Sparkles;
        const k = formatTaskKey(task.project?.key, task.number);
        return (
          <div className="flex items-center gap-3">
            <Checkbox
              checked={task.status === 'done'}
              onCheckedChange={(checked) => onStatusChange?.(task.id, checked ? 'done' : 'todo')}
              onClick={(e) => e.stopPropagation()}
              className="border-border/60"
            />
            <TypeIcon className={cn('h-4 w-4 shrink-0', typeMeta.iconColor)} aria-label={typeMeta.label} />
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className={cn('font-medium leading-tight truncate', task.status === 'done' && 'line-through text-muted-foreground')}>
                {k ? <span className="font-mono text-muted-foreground mr-1.5">{k}</span> : null}
                {task.title}
              </span>
              {total > 0 && (
                <div className="flex items-center gap-2">
                  <Progress value={(completed / total) * 100} className="h-1 w-16" />
                  <span className="text-[10px] text-muted-foreground">{completed}/{total}</span>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      enableSorting: false,
      size: 128,
      header: () => 'Статус',
      cell: ({ row }) => {
        const task = row.original;
        const status = getStatusMeta(task.status);
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Select value={task.status} onValueChange={(v) => onStatusChange?.(task.id, v)}>
              <SelectTrigger className="h-7 w-auto border-0 bg-transparent p-0 hover:bg-transparent">
                <Badge className={cn('font-medium border-0', status.badgeBg, status.badgeText)}>{status.label}</Badge>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_META).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      },
    },
    {
      accessorKey: 'priority',
      size: 128,
      header: ({ column }) => <SortHeader column={column} label="Приоритет" />,
      sortingFn: (a, b) => getPriorityMeta(a.original.priority).order - getPriorityMeta(b.original.priority).order,
      cell: ({ row }) => {
        const priority = getPriorityMeta(row.original.priority);
        return (
          <Badge variant="outline" className="font-medium border-border/50">
            <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', priority.dot)} />
            {priority.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'assignee',
      enableSorting: false,
      size: 160,
      header: () => 'Исполнитель',
      cell: ({ row }) => {
        const assignee = row.original.assignee;
        if (!assignee) return <span className="text-muted-foreground">Не назначен</span>;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 ring-1 ring-background">
              <AvatarImage src={assignee.image || undefined} />
              <AvatarFallback className="text-[10px] bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                {assignee.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="truncate max-w-[100px]">{assignee.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'dueDate',
      size: 128,
      header: ({ column }) => <SortHeader column={column} label="Срок" />,
      sortingFn: (a, b) => {
        const av = a.original.dueDate ? new Date(a.original.dueDate).getTime() : Infinity;
        const bv = b.original.dueDate ? new Date(b.original.dueDate).getTime() : Infinity;
        return av - bv;
      },
      cell: ({ row }) => {
        const task = row.original;
        const due = task.dueDate ? new Date(task.dueDate) : null;
        if (!due) return <span className="text-muted-foreground">—</span>;
        const overdue = isPast(due) && task.status !== 'done';
        const dueToday = isToday(due);
        return (
          <div className={cn('flex items-center gap-1.5', overdue ? 'text-rose-500' : dueToday ? 'text-amber-500' : 'text-muted-foreground')}>
            {overdue ? <Clock className="h-3.5 w-3.5" /> : <Calendar className="h-3.5 w-3.5" />}
            <span className="font-medium">{format(due, 'd MMM', { locale: ru })}</span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      enableSorting: false,
      size: 40,
      header: () => null,
      cell: ({ row }) => {
        const task = row.original;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => openTask(task)}>
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
                <DropdownMenuItem onClick={() => onDelete?.(task.id)} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ], [onStatusChange, onEdit, onDelete, onSelectTask]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection },
    getRowId: (row) => row.id,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: PAGE_SIZE } },
  });

  const selectedCount = Object.keys(rowSelection).filter((k) => rowSelection[k]).length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 rounded-xl bg-muted/50 animate-pulse" />
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
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-muted/40 border border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/30"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | 'all')}>
          <SelectTrigger className="w-[160px] h-10 bg-muted/30 border-border/50">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            {Object.entries(STATUS_META).map(([key, value]) => (
              <SelectItem key={key} value={key}>{value.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TaskPriority | 'all')}>
          <SelectTrigger className="w-[160px] h-10 bg-muted/30 border-border/50">
            <SelectValue placeholder="Приоритет" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все приоритеты</SelectItem>
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

        {/* Density switch */}
        <div className="flex items-center gap-1 p-1 rounded-lg border border-border/50 bg-muted/30">
          {DENSITY_ORDER.map((d) => (
            <button
              key={d}
              onClick={() => setDensity(d)}
              title={DENSITY_METRICS[d].label}
              className={cn(
                'px-2 py-1 rounded text-xs font-medium transition-colors',
                density === d ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {DENSITY_METRICS[d].label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Найдено: {data.length}{selectedCount > 0 && ` · Выбрано: ${selectedCount}`}
      </p>

      {/* Table */}
      <div className="rounded-xl border border-border/50 overflow-hidden bg-card/50">
        <Table
          className={cn(
            metrics.fontSize,
            density === 'comfortable' && '[&_td]:py-2.5',
            density === 'compact' && '[&_td]:py-1.5',
            density === 'super-compact' && '[&_td]:py-1',
          )}
        >
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent border-border/50">
                {hg.headers.map((header) => (
                  <TableHead key={header.id} style={{ width: header.getSize() }}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    'group cursor-pointer transition-colors border-border/50 hover:bg-muted/50',
                    row.getIsSelected() && 'bg-primary/5'
                  )}
                  onClick={() => openTask(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Страница {pageIndex + 1} из {pageCount}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Task Details — внутренняя шторка как фолбэк, если открытие не делегировано наружу */}
      {!onSelectTask && (
        <TaskDetails
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          onDelete={selectedTask ? () => {
            onDelete?.(selectedTask.id);
            setSelectedTask(null);
          } : undefined}
        />
      )}
    </div>
  );
}

// Заголовок-кнопка сортировки колонки.
function SortHeader({ column, label }: { column: any; label: string }) {
  const sorted = column.getIsSorted();
  return (
    <Button variant="ghost" size="sm" className="-ml-3 h-8 hover:bg-muted" onClick={() => column.toggleSorting(sorted === 'asc')}>
      {label}
      {sorted === 'asc' ? (
        <ArrowUp className="ml-2 h-3 w-3 text-primary" />
      ) : sorted === 'desc' ? (
        <ArrowDown className="ml-2 h-3 w-3 text-primary" />
      ) : (
        <ArrowUpDown className="ml-2 h-3 w-3 text-muted-foreground" />
      )}
    </Button>
  );
}

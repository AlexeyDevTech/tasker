'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { TaskDetails } from '@/components/tasks/task-details';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskStatus, TaskPriority } from '@/types';

interface KanbanBoardProps {
  tasks: any[];
  onStatusChange: (taskId: string, status: string) => void;
  onCreateTask: (data: any) => void;
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  isLoading?: boolean;
}

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'К выполнению', color: '#64748b' },
  { id: 'in-progress', title: 'В работе', color: '#3b82f6' },
  { id: 'review', title: 'На проверке', color: '#f59e0b' },
  { id: 'done', title: 'Готово', color: '#22c55e' },
];

export function KanbanBoard({ tasks, onStatusChange, onCreateTask, onEditTask, onDeleteTask, isLoading }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [viewingTask, setViewingTask] = useState<any | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('todo');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const overColumn = columns.find((col) => col.id === overId);
    if (overColumn) {
      const task = tasks.find((t) => t.id === activeId);
      if (task && task.status !== overColumn.id) {
        onStatusChange(activeId, overColumn.id);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const overColumn = columns.find((col) => col.id === overId);
    if (overColumn) {
      const task = tasks.find((t) => t.id === activeId);
      if (task && task.status !== overColumn.id) {
        onStatusChange(activeId, overColumn.id);
      }
    }
  };

  const handleOpenCreateDialog = (status: TaskStatus) => {
    setNewTaskStatus(status);
    setCreateDialogOpen(true);
  };

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return;

    onCreateTask({
      title: newTaskTitle,
      description: newTaskDescription,
      status: newTaskStatus,
      priority: newTaskPriority,
    });

    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskPriority('medium');
    setCreateDialogOpen(false);
  };

  const handleViewTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    setViewingTask(task);
  }

  const tasksByStatus = columns.reduce((acc, col) => {
    acc[col.id] = tasks.filter((t) => t.status === col.id);
    return acc;
  }, {} as Record<TaskStatus, any[]>);

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-6 h-full">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              tasks={tasksByStatus[column.id] || []}
              onCreateTask={() => handleOpenCreateDialog(column.id)}
            >
              <SortableContext
                items={tasksByStatus[column.id]?.map((t) => t.id) || []}
                strategy={verticalListSortingStrategy}
              >
                {tasksByStatus[column.id]?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                      <Plus className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Нет задач</p>
                    <p className="text-xs text-muted-foreground/70">Перетащите сюда или создайте новую</p>
                  </div>
                ) : (
                  tasksByStatus[column.id]?.map((task) => (
                    <KanbanCard 
                      key={task.id} 
                      task={task} 
                      onView={() => handleViewTask(task.id)}
                      onEdit={() => onEditTask(task.id)}
                      onDelete={() => onDeleteTask(task.id)}
                    />
                  ))
                )}
              </SortableContext>
            </KanbanColumn>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-1">
              <KanbanCard task={activeTask} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Create Task Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">Новая задача</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">Название</Label>
              <Input
                id="title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Введите название задачи..."
                className="h-9 border-border focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Описание</Label>
              <Textarea
                id="description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Добавьте описание задачи..."
                rows={3}
                className=" focus:border-primary/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Приоритет</Label>
                <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as TaskPriority)}>
                  <SelectTrigger className="h-9 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent" className="gap-2">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-rose-500" />
                        Срочно
                      </span>
                    </SelectItem>
                    <SelectItem value="high">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        Высокий
                      </span>
                    </SelectItem>
                    <SelectItem value="medium">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        Средний
                      </span>
                    </SelectItem>
                    <SelectItem value="low">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-slate-400" />
                        Низкий
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Статус</Label>
                <Select value={newTaskStatus} onValueChange={(v) => setNewTaskStatus(v as TaskStatus)}>
                  <SelectTrigger className="h-9 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">К выполнению</SelectItem>
                    <SelectItem value="in-progress">В работе</SelectItem>
                    <SelectItem value="review">На проверке</SelectItem>
                    <SelectItem value="done">Готово</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="">
              Отмена
            </Button>
            <Button 
              onClick={handleCreateTask} 
              disabled={!newTaskTitle.trim()}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              <Plus className="h-4 w-4" />
              Создать задачу
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <TaskDetails task={viewingTask} open={!!viewingTask} onOpenChange={() => setViewingTask(null)} />
    </>
  );
}

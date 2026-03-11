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
import { Plus } from 'lucide-react';
import type { TaskStatus, TaskPriority } from '@/types';

interface KanbanBoardProps {
  tasks: any[];
  onStatusChange: (taskId: string, status: string) => void;
  onCreateTask: (data: any) => void;
  isLoading?: boolean;
}

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'К выполнению', color: '#94a3b8' },
  { id: 'in-progress', title: 'В работе', color: '#3b82f6' },
  { id: 'review', title: 'На проверке', color: '#f59e0b' },
  { id: 'done', title: 'Готово', color: '#22c55e' },
];

export function KanbanBoard({ tasks, onStatusChange, onCreateTask, isLoading }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<any | null>(null);
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

    // Check if dragging over a column
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

    // Check if dropped on a column
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
        <div className="flex gap-4 overflow-x-auto pb-4">
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
                <div className="space-y-2 min-h-[200px]">
                  {tasksByStatus[column.id]?.map((task) => (
                    <KanbanCard key={task.id} task={task} />
                  ))}
                </div>
              </SortableContext>
            </KanbanColumn>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <KanbanCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      {/* Create Task Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новая задача</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название</Label>
              <Input
                id="title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Название задачи"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Описание задачи..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Приоритет</Label>
                <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as TaskPriority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">🔴 Срочно</SelectItem>
                    <SelectItem value="high">🟠 Высокий</SelectItem>
                    <SelectItem value="medium">🟡 Средний</SelectItem>
                    <SelectItem value="low">🟢 Низкий</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Статус</Label>
                <Select value={newTaskStatus} onValueChange={(v) => setNewTaskStatus(v as TaskStatus)}>
                  <SelectTrigger>
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreateTask} disabled={!newTaskTitle.trim()}>
              Создать задачу
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

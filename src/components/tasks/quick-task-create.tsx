'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  CheckSquare,
  CalendarIcon,
  Flag,
  Loader2,
  Sparkles,
  Clock,
  Target,
  Briefcase,
} from 'lucide-react';

interface QuickTaskCreateProps {
  onTaskCreate?: (task: {
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    dueDate?: Date;
  }) => void | Promise<void>;
  projects?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  defaultProjectId?: string;
}

const priorityOptions = [
  { value: 'low', label: 'Низкий', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { value: 'medium', label: 'Средний', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { value: 'high', label: 'Высокий', color: 'text-rose-500', bg: 'bg-rose-500/10' },
] as const;

const quickDates = [
  { label: 'Сегодня', days: 0 },
  { label: 'Завтра', days: 1 },
  { label: 'Через 3 дня', days: 3 },
  { label: 'Через неделю', days: 7 },
];

export function QuickTaskCreate({ 
  onTaskCreate,
  projects = [],
  defaultProjectId,
}: QuickTaskCreateProps) {
  const { createTaskModalOpen, setCreateTaskModalOpen } = useUIStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [projectId, setProjectId] = useState<string>(defaultProjectId || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (defaultProjectId) {
      setProjectId(defaultProjectId);
    }
  }, [defaultProjectId]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!title.trim()) return;
    
    setIsLoading(true);
    try {
      await onTaskCreate?.({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate,
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate(undefined);
      setCreateTaskModalOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCreateTaskModalOpen(false);
    // Don't reset form on close - user might want to continue
  };

  const handleQuickDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(23, 59, 59, 999);
    setDueDate(date);
  };

  // Handle keyboard shortcut for quick create
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N to open quick create
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setCreateTaskModalOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setCreateTaskModalOpen]);

  return (
    <Dialog open={createTaskModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 bg-card/95 backdrop-blur-xl border-border/50">
        {/* Header */}
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Быстрое создание задачи</DialogTitle>
              <DialogDescription className="mt-1">
                Заполните основные поля для создания новой задачи
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="task-title" className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                Название задачи *
              </Label>
              <Input
                id="task-title"
                placeholder="Что нужно сделать?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 border-border/60 focus:border-primary/50"
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="task-description" className="text-sm font-medium">
                Описание
              </Label>
              <Textarea
                id="task-description"
                placeholder="Добавьте детали задачи..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="resize-none border-border/60 focus:border-primary/50"
              />
            </div>

            {/* Project and Priority row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Project selector */}
              {projects.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    Проект
                  </Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger className="h-11 border-border/60">
                      <SelectValue placeholder="Выберите проект" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-2.5 w-2.5 rounded-full" 
                              style={{ backgroundColor: project.color }}
                            />
                            {project.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Priority selector */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Flag className="h-4 w-4 text-muted-foreground" />
                  Приоритет
                </Label>
                <Select value={priority} onValueChange={(v: 'low' | 'medium' | 'high') => setPriority(v)}>
                  <SelectTrigger className="h-11 border-border/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className={cn('h-2.5 w-2.5 rounded-full', option.bg, option.color)} />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Due date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Срок выполнения
              </Label>
              
              {/* Quick date buttons */}
              <div className="flex flex-wrap gap-2 mb-2">
                {quickDates.map((qd) => (
                  <Button
                    key={qd.days}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => handleQuickDate(qd.days)}
                  >
                    {qd.label}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground"
                  onClick={() => setDueDate(undefined)}
                >
                  Без срока
                </Button>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      'w-full h-11 justify-start text-left font-normal border-border/60',
                      !dueDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'd MMMM yyyy', { locale: ru }) : 'Выбрать дату'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter className="p-6 pt-0 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Ctrl+N</kbd>
              <span>быстрое создание</span>
            </div>
            <div className="flex-1" />
            <Button type="button" variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button 
              type="submit"
              disabled={!title.trim() || isLoading}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Создание...
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4" />
                  Создать задачу
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

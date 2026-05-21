'use client';

import { useDroppable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { TaskStatus } from '@/types';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: any[];
  onCreateTask: () => void;
  children: React.ReactNode;
}

export function KanbanColumn({ 
  id, 
  title, 
  color, 
  tasks, 
  onCreateTask, 
  children 
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const completedTasks = tasks.filter(t => t.status === 'done').length;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col min-w-[288px] max-w-[320px] h-full bg-muted/40 rounded-lg border border-transparent transition-colors',
        isOver && 'border-primary/40 bg-primary/5'
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <h3 className="font-medium text-sm truncate">{title}</h3>
          <span className="text-xs text-muted-foreground tabular-nums">{tasks.length}</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-accent"
          onClick={onCreateTask}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Column Content */}
      <div className="flex-1 px-2 pb-2 overflow-hidden">
        <ScrollArea className="h-full pr-1">
          <div className="space-y-2 pb-2">
            {children}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

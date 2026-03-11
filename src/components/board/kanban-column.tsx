'use client';

import { useDroppable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreHorizontal } from 'lucide-react';
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
    <Card
      ref={setNodeRef}
      className={cn(
        'flex flex-col min-w-[300px] max-w-[340px] h-full bg-muted/30 dark:bg-muted/10 border-border/50 rounded-2xl transition-all duration-200',
        isOver && 'border-primary/50 bg-primary/5 ring-2 ring-primary/20'
      )}
    >
      {/* Column Header */}
      <CardHeader className="pb-4 pt-5 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Status indicator */}
            <div className="relative">
              <div 
                className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: `${color}20` }}
              >
                <div 
                  className="h-5 w-5 rounded-lg"
                  style={{ backgroundColor: color }}
                />
              </div>
              {tasks.length > 0 && (
                <div className="absolute -bottom-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-background border border-border flex items-center justify-center">
                  <span className="text-[10px] font-bold">{tasks.length}</span>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold text-base">{title}</h3>
              {tasks.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {tasks.length} {tasks.length === 1 ? 'задача' : tasks.length < 5 ? 'задачи' : 'задач'}
                </p>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={onCreateTask}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Column Content */}
      <CardContent className="flex-1 px-3 pb-3 pt-0 overflow-hidden">
        <ScrollArea className="h-full pr-1">
          <div className="space-y-2.5 pb-2">
            {children}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

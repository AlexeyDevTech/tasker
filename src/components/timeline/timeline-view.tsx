'use client';

import { useState, useMemo } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut,
  Calendar,
  Flag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, differenceInDays, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { TaskStatus, TaskPriority } from '@/types';

interface TimelineViewProps {
  tasks: any[];
  project?: any;
}

const statusColors: Record<TaskStatus, string> = {
  'todo': '#94a3b8',
  'in-progress': '#3b82f6',
  'review': '#f59e0b',
  'done': '#22c55e',
  'cancelled': '#ef4444',
};

const priorityColors: Record<TaskPriority, string> = {
  urgent: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

export function TimelineView({ tasks, project }: TimelineViewProps) {
  const [zoom, setZoom] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Calculate date range
  const dateRange = useMemo(() => {
    const today = new Date();
    const projectStart = project?.startDate ? new Date(project.startDate) : today;
    const projectEnd = project?.endDate ? new Date(project.endDate) : addDays(today, 60);

    // Extend range a bit
    const start = addDays(projectStart, -7);
    const end = addDays(projectEnd, 14);

    return { start, end };
  }, [project]);

  const days = useMemo(() => {
    return eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
  }, [dateRange]);

  const months = useMemo(() => {
    return eachMonthOfInterval({ start: dateRange.start, end: dateRange.end });
  }, [dateRange]);

  // Task positioning
  const taskPositions = useMemo(() => {
    const positions: Record<string, { row: number; col: number; width: number }> = {};
    let currentRow = 0;
    const rowEnds: number[] = [];

    tasks.forEach((task) => {
      const taskStart = task.startDate ? new Date(task.startDate) : dateRange.start;
      const taskEnd = task.dueDate ? new Date(task.dueDate) : addDays(taskStart, 1);

      const startOffset = Math.max(0, differenceInDays(taskStart, dateRange.start));
      const duration = Math.max(1, differenceInDays(taskEnd, taskStart) + 1);

      // Find available row
      let row = 0;
      while (rowEnds[row] && rowEnds[row] >= startOffset) {
        row++;
      }

      positions[task.id] = {
        row,
        col: startOffset,
        width: duration,
      };

      rowEnds[row] = startOffset + duration - 1;
      currentRow = Math.max(currentRow, row + 1);
    });

    return { positions, totalRows: currentRow };
  }, [tasks, dateRange]);

  const dayWidth = 40 * zoom;
  const rowHeight = 48;
  const totalWidth = days.length * dayWidth;

  const scrollToToday = () => {
    const todayOffset = differenceInDays(new Date(), dateRange.start) * dayWidth;
    setScrollPosition(todayOffset);
  };

  const todayOffset = differenceInDays(new Date(), dateRange.start);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={scrollToToday}>
            <Calendar className="mr-2 h-4 w-4" />
            Сегодня
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 w-48">
            <ZoomOut className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[zoom]}
              onValueChange={([v]) => setZoom(v)}
              min={0.5}
              max={2}
              step={0.1}
            />
            <ZoomIn className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="border rounded-xl overflow-hidden">
        <ScrollArea className="w-full">
          <div className="relative" style={{ minWidth: totalWidth + 200 }}>
            {/* Month headers */}
            <div className="sticky top-0 z-20 bg-background border-b flex">
              <div className="w-64 flex-shrink-0 border-r p-2 font-medium">
                Задачи
              </div>
              <div className="flex-1 flex">
                {months.map((month) => {
                  const monthStart = startOfMonth(month);
                  const monthEnd = endOfMonth(month);
                  const visibleStart = monthStart < dateRange.start ? dateRange.start : monthStart;
                  const visibleEnd = monthEnd > dateRange.end ? dateRange.end : monthEnd;
                  const width = (differenceInDays(visibleEnd, visibleStart) + 1) * dayWidth;

                  return (
                    <div
                      key={month.toISOString()}
                      className="border-r text-center p-2 font-medium text-sm bg-muted/50"
                      style={{ width }}
                    >
                      {format(month, 'LLLL yyyy', { locale: ru })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Day headers */}
            <div className="sticky top-10 z-10 bg-background border-b flex">
              <div className="w-64 flex-shrink-0 border-r" />
              <div className="flex-1 flex">
                {days.map((day, i) => {
                  const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                  const isWeekend = [0, 6].includes(day.getDay());

                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        'border-r text-center py-1 text-xs',
                        isToday && 'bg-primary/10 text-primary font-medium',
                        isWeekend && 'bg-muted/30'
                      )}
                      style={{ width: dayWidth }}
                    >
                      <div className="text-muted-foreground">
                        {format(day, 'EEE', { locale: ru })}
                      </div>
                      <div>{format(day, 'd')}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grid and tasks */}
            <div className="relative" style={{ height: Math.max(300, taskPositions.totalRows * rowHeight + 50) }}>
              {/* Grid lines */}
              <div className="absolute inset-0 flex">
                <div className="w-64 flex-shrink-0 border-r" />
                <div className="flex-1 flex">
                  {days.map((day, i) => {
                    const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                    const isWeekend = [0, 6].includes(day.getDay());

                    return (
                      <div
                        key={day.toISOString()}
                        className={cn(
                          'border-r h-full',
                          isToday && 'bg-primary/5',
                          isWeekend && 'bg-muted/10'
                        )}
                        style={{ width: dayWidth }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Today line */}
              {todayOffset >= 0 && todayOffset < days.length && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
                  style={{ left: 256 + todayOffset * dayWidth + dayWidth / 2 }}
                />
              )}

              {/* Tasks */}
              {tasks.map((task) => {
                const pos = taskPositions.positions[task.id];
                if (!pos) return null;

                return (
                  <TooltipProvider key={task.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="absolute flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer hover:shadow-md transition-shadow border"
                          style={{
                            left: 256 + pos.col * dayWidth + 4,
                            top: pos.row * rowHeight + 8,
                            width: pos.width * dayWidth - 8,
                            height: rowHeight - 16,
                            backgroundColor: statusColors[task.status as TaskStatus] + '20',
                            borderColor: statusColors[task.status as TaskStatus],
                            borderLeftWidth: 3,
                          }}
                        >
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: priorityColors[task.priority as TaskPriority] }}
                          />
                          <span className="text-sm truncate">{task.title}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="w-64">
                        <div className="space-y-2">
                          <p className="font-medium">{task.title}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {task.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {task.priority}
                            </Badge>
                          </div>
                          {task.assignee && (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={task.assignee.image || undefined} />
                                <AvatarFallback className="text-xs">
                                  {task.assignee.name?.[0]?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs">{task.assignee.name}</span>
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}

              {/* Milestones */}
              {project?.milestones?.map((milestone: any) => {
                const milestoneDate = new Date(milestone.date);
                const offset = differenceInDays(milestoneDate, dateRange.start);

                if (offset < 0 || offset >= days.length) return null;

                return (
                  <div
                    key={milestone.id}
                    className="absolute top-0 z-10"
                    style={{ left: 256 + offset * dayWidth + dayWidth / 2 - 8 }}
                  >
                    <Flag
                      className="h-6 w-6"
                      style={{ color: milestone.color }}
                      fill={milestone.color}
                    />
                    <div className="text-xs text-center whitespace-nowrap mt-1">
                      {milestone.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import type { TaskStatus } from '@/types';

interface CalendarViewProps {
  tasks: any[];
}

const statusColors: Record<TaskStatus, string> = {
  'todo': '#94a3b8',
  'in-progress': '#3b82f6',
  'review': '#f59e0b',
  'done': '#22c55e',
  'cancelled': '#ef4444',
};

export function CalendarView({ tasks }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = useMemo(() => {
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [calendarStart, calendarEnd]);

  const weeks = useMemo(() => {
    const result = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [days]);

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const map = new Map<string, any[]>();
    
    tasks.forEach((task) => {
      if (task.dueDate) {
        const dateKey = format(new Date(task.dueDate), 'yyyy-MM-dd');
        const existing = map.get(dateKey) || [];
        map.set(dateKey, [...existing, task]);
      }
    });
    
    return map;
  }, [tasks]);

  const goToToday = () => setCurrentDate(new Date());
  const goToPrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            {format(currentDate, 'LLLL yyyy', { locale: ru })}
          </h2>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Сегодня
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={goToPrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="rounded-lg border overflow-hidden">
        {/* Week days header */}
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {weeks.map((week, weekIndex) => (
            week.map((day, dayIndex) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayTasks = tasksByDate.get(dateKey) || [];
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'min-h-[120px] border-r border-b p-2 transition-colors',
                    !isCurrentMonth && 'bg-muted/30',
                    isCurrentDay && 'bg-primary/5'
                  )}
                >
                  <div
                    className={cn(
                      'text-sm font-medium mb-2',
                      !isCurrentMonth && 'text-muted-foreground',
                      isCurrentDay && 'text-primary'
                    )}
                  >
                    {format(day, 'd')}
                  </div>

                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-1 p-1 rounded text-xs truncate cursor-pointer hover:bg-muted"
                        style={{
                          borderLeft: `2px solid ${statusColors[task.status as TaskStatus]}`,
                        }}
                      >
                        <span className="truncate">{task.title}</span>
                      </div>
                    ))}
                    
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-muted-foreground pl-1">
                        +{dayTasks.length - 3} ещё
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
            <span className="capitalize">
              {status === 'todo' ? 'К выполнению' :
               status === 'in-progress' ? 'В работе' :
               status === 'review' ? 'На проверке' :
               status === 'done' ? 'Готово' : 'Отменено'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

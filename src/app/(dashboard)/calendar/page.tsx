'use client';

import { useState, useMemo } from 'react';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { CommandPalette } from '@/components/layout/command-palette';
import { useProjectStore } from '@/stores/project-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
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
  isPast,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import type { TaskStatus } from '@/types';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// Fetch all tasks
async function fetchAllTasks() {
  const res = await fetch('/api/tasks');
  const data = await res.json();
  return data.data || [];
}

// Fetch projects
async function fetchProjects() {
  const res = await fetch('/api/projects');
  const data = await res.json();
  return data.data || [];
}

const statusColors: Record<TaskStatus, string> = {
  'todo': '#94a3b8',
  'in-progress': '#3b82f6',
  'review': '#f59e0b',
  'done': '#22c55e',
  'cancelled': '#ef4444',
};

const statusLabels: Record<TaskStatus, string> = {
  'todo': 'К выполнению',
  'in-progress': 'В работе',
  'review': 'На проверке',
  'done': 'Готово',
  'cancelled': 'Отменено',
};

function CalendarContent() {
  const { sidebarOpen } = useProjectStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: tasks = [] } = useQuery({
    queryKey: ['all-tasks'],
    queryFn: fetchAllTasks,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  // Create project lookup
  const projectMap = projects.reduce((acc: Record<string, any>, p: any) => {
    acc[p.id] = p;
    return acc;
  }, {});

  // Calendar calculations
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = useMemo(() => {
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [calendarStart, calendarEnd]);

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const map = new Map<string, any[]>();
    
    tasks.forEach((task: any) => {
      if (task.dueDate) {
        const dateKey = format(new Date(task.dueDate), 'yyyy-MM-dd');
        const existing = map.get(dateKey) || [];
        map.set(dateKey, [...existing, task]);
      }
    });
    
    return map;
  }, [tasks]);

  // Selected date tasks
  const selectedDateTasks = selectedDate 
    ? tasksByDate.get(format(selectedDate, 'yyyy-MM-dd')) || []
    : [];

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };
  const goToPrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Stats
  const todayTasks = tasksByDate.get(format(new Date(), 'yyyy-MM-dd')) || [];
  const overdueTasks = tasks.filter((t: any) => {
    if (!t.dueDate || t.status === 'done') return false;
    return isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate));
  });

  const { data: session } = useSession();
  const user = session?.user;

  if (!user) {
    // Or a loading spinner
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar projects={projects} />
      
      <div className={cn(
        'transition-all duration-300',
        sidebarOpen ? 'ml-64' : 'ml-0'
      )}>
        <Header user={user} />
        
        <main className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Календарь</h1>
                <p className="text-muted-foreground text-sm">
                  Обзор всех задач по датам
                </p>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <CalendarIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Сегодня</p>
                    <p className="text-2xl font-bold">{todayTasks.length} задач</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Просрочено</p>
                    <p className="text-2xl font-bold">{overdueTasks.length} задач</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Всего задач</p>
                    <p className="text-2xl font-bold">{tasks.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-4">
                  {/* Calendar header */}
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">
                      {format(currentDate, 'LLLL yyyy', { locale: ru })}
                    </h2>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={goToToday}>
                        Сегодня
                      </Button>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" onClick={goToPrevMonth}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={goToNextMonth}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Week days */}
                  <div className="grid grid-cols-7 mb-2">
                    {weekDays.map((day) => (
                      <div
                        key={day}
                        className="p-2 text-center text-sm font-medium text-muted-foreground"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Days grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day) => {
                      const dateKey = format(day, 'yyyy-MM-dd');
                      const dayTasks = tasksByDate.get(dateKey) || [];
                      const isCurrentMonth = isSameMonth(day, currentDate);
                      const isCurrentDay = isToday(day);
                      const isSelected = selectedDate && isSameDay(day, selectedDate);

                      return (
                        <div
                          key={day.toISOString()}
                          onClick={() => setSelectedDate(day)}
                          className={cn(
                            'min-h-[100px] p-2 rounded-lg border transition-all cursor-pointer',
                            !isCurrentMonth && 'bg-muted/30 opacity-50',
                            isCurrentDay && 'border-primary bg-primary/5',
                            isSelected && 'border-primary ring-2 ring-primary/20',
                            !isSelected && !isCurrentDay && 'border-transparent hover:border-border'
                          )}
                        >
                          <div
                            className={cn(
                              'text-sm font-medium mb-1',
                              !isCurrentMonth && 'text-muted-foreground',
                              isCurrentDay && 'text-primary'
                            )}
                          >
                            {format(day, 'd')}
                          </div>

                          <div className="space-y-0.5">
                            {dayTasks.slice(0, 3).map((task: any) => (
                              <div
                                key={task.id}
                                className="text-xs p-1 rounded truncate"
                                style={{
                                  backgroundColor: `${statusColors[task.status as TaskStatus]}20`,
                                  borderLeft: `2px solid ${statusColors[task.status as TaskStatus]}`,
                                }}
                              >
                                {task.title}
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
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Selected date details */}
            <div>
              <Card className="h-full">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4">
                    {selectedDate 
                      ? format(selectedDate, 'd MMMM, EEEE', { locale: ru })
                      : 'Выберите дату'}
                  </h3>

                  {selectedDateTasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {selectedDate ? 'Нет задач на эту дату' : 'Выберите дату для просмотра задач'}
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {selectedDateTasks.map((task: any) => {
                          const project = projectMap[task.projectId];
                          
                          return (
                            <div
                              key={task.id}
                              className="p-3 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                                  style={{ backgroundColor: statusColors[task.status as TaskStatus] }}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{task.title}</p>
                                  {project && (
                                    <p className="text-xs text-muted-foreground">
                                      {project.icon} {project.name}
                                    </p>
                                  )}
                                  <Badge 
                                    variant="outline" 
                                    className="mt-2 text-xs"
                                    style={{ 
                                      borderColor: statusColors[task.status as TaskStatus],
                                      color: statusColors[task.status as TaskStatus]
                                    }}
                                  >
                                    {statusLabels[task.status as TaskStatus]}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-muted-foreground">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                <span>{statusLabels[status as TaskStatus]}</span>
              </div>
            ))}
          </div>
        </main>
      </div>

      <CommandPalette projects={projects} />
    </div>
  );
}

export default function CalendarPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <CalendarContent />
    </QueryClientProvider>
  );
}

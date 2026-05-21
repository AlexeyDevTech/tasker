'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PageHeader } from '@/components/common/page-header';
import { InboxFilters } from '@/components/inbox/inbox-filters';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { CommandPalette } from '@/components/layout/command-palette';
import { useProjectStore } from '@/stores/project-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from 'next-auth/react';
import { 
  Inbox as InboxIcon, 
  Search, 
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isToday, isTomorrow, isPast, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { TaskPriority, TaskStatus } from '@/types';

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

const priorityColors: Record<TaskPriority, string> = {
  urgent: 'bg-red-500/10 text-red-600 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  low: 'bg-green-500/10 text-green-600 border-green-500/20',
};

const priorityLabels: Record<TaskPriority, string> = {
  urgent: 'Срочно',
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
};

const statusIcons: Record<TaskStatus, React.ReactNode> = {
  'todo': <Clock className="h-4 w-4 text-slate-500" />,
  'in-progress': <Clock className="h-4 w-4 text-blue-500" />,
  'review': <AlertCircle className="h-4 w-4 text-amber-500" />,
  'done': <CheckCircle2 className="h-4 w-4 text-green-500" />,
  'cancelled': <AlertCircle className="h-4 w-4 text-red-500" />,
};

function InboxContent() {
  const { sidebarOpen } = useProjectStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'today' | 'overdue' | 'upcoming'>('all');

  const { data: tasks = [], isLoading } = useQuery({
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

  // Filter tasks
  const filteredTasks = tasks.filter((task: any) => {
    if (search && !task.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    if (!task.dueDate) return filter === 'all';

    const dueDate = new Date(task.dueDate);
    
    switch (filter) {
      case 'today':
        return isToday(dueDate);
      case 'overdue':
        return isPast(dueDate) && !isToday(dueDate) && task.status !== 'done';
      case 'upcoming':
        return !isPast(dueDate) || isToday(dueDate);
      default:
        return true;
    }
  }).filter((t: any) => t.status !== 'done'); // Exclude completed

  // Group tasks by date
  const groupedTasks = filteredTasks.reduce((acc: Record<string, any[]>, task: any) => {
    let key = 'no-date';
    if (task.dueDate) {
      const date = new Date(task.dueDate);
      if (isToday(date)) key = 'today';
      else if (isTomorrow(date)) key = 'tomorrow';
      else if (isPast(date)) key = 'overdue';
      else key = format(date, 'yyyy-MM-dd');
    }
    
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {});

  const groupLabels: Record<string, string> = {
    'overdue': '🔴 Просрочено',
    'today': '🟢 Сегодня',
    'tomorrow': '🔵 Завтра',
    'no-date': '📅 Без срока',
  };

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
        sidebarOpen ? 'ml-60' : 'ml-0'
      )}>
        <Header user={user} />

        <main className="p-6">
          <PageHeader
            icon={<InboxIcon className="h-4 w-4" />}
            title="Входящие"
            description={`${filteredTasks.length} задач требуют внимания`}
          />

          <InboxFilters
            search={search}
            setSearch={setSearch}
            filter={filter}
            setFilter={setFilter}
          />

          {/* Tasks */}
          {isLoading ? (
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
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <InboxIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">Всё чисто!</h3>
              <p className="text-muted-foreground">
                Нет задач, требующих внимания
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-320px)]">
              <div className="space-y-6">
                {Object.entries(groupedTasks)
                  .sort(([a], [b]) => {
                    const order = ['overdue', 'today', 'tomorrow'];
                    const aIdx = order.indexOf(a);
                    const bIdx = order.indexOf(b);
                    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                    if (aIdx !== -1) return -1;
                    if (bIdx !== -1) return 1;
                    if (a === 'no-date') return 1;
                    if (b === 'no-date') return -1;
                    return a.localeCompare(b);
                  })
                  .map(([group, groupTasks]) => (
                  <div key={group}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      {groupLabels[group] || format(new Date(group), 'd MMMM, EEEE', { locale: ru })}
                    </h3>
                    <div className="space-y-2">
                      {groupTasks.map((task: any) => {
                        const project = projectMap[task.projectId];
                        
                        return (
                          <Card key={task.id} className="group hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-4">
                                <Checkbox 
                                  checked={task.status === 'done'}
                                  onCheckedChange={() => {}}
                                />
                                
                                {statusIcons[task.status as TaskStatus]}
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium truncate">{task.title}</span>
                                    <Badge 
                                      variant="outline" 
                                      className={cn('text-xs', priorityColors[task.priority as TaskPriority])}
                                    >
                                      {priorityLabels[task.priority as TaskPriority]}
                                    </Badge>
                                  </div>
                                  {project && (
                                    <p className="text-sm text-muted-foreground truncate">
                                      {project.icon} {project.name}
                                    </p>
                                  )}
                                </div>

                                {task.dueDate && (
                                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(task.dueDate), 'd MMM', { locale: ru })}
                                  </div>
                                )}

                                {task.assignee && (
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={task.assignee.image || undefined} />
                                    <AvatarFallback className="text-xs">
                                      {task.assignee.name?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                )}

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </main>
      </div>

      <CommandPalette projects={projects} />
    </div>
  );
}

export default function InboxPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <InboxContent />
    </QueryClientProvider>
  );
}

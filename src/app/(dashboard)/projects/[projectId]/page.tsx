'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { CommandPalette } from '@/components/layout/command-palette';
import { KanbanBoard } from '@/components/board/kanban-board';
import { TimelineView } from '@/components/timeline/timeline-view';
import { TaskListView } from '@/components/tasks/task-list-view';
import { CalendarView } from '@/components/calendar/calendar-view';
import { QuickTaskCreate } from '@/components/tasks/quick-task-create';
import { useProjectStore } from '@/stores/project-store';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  FileText,
  Settings,
  MoreHorizontal,
  Sparkles,
  GanttChart,
  LayoutGrid,
  List,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { format, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { ViewMode } from '@/types';

// Fetch single project
async function fetchProject(id: string) {
  const res = await fetch(`/api/projects/${id}`);
  const data = await res.json();
  return data.data;
}

// Fetch project tasks
async function fetchTasks(projectId: string) {
  const res = await fetch(`/api/tasks?projectId=${projectId}`);
  const data = await res.json();
  return data.data || [];
}

// Update task
async function updateTask(data: { id: string; [key: string]: any }) {
  const res = await fetch('/api/tasks', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

// Create task
async function createTask(data: any) {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

// Delete task
async function deleteTask(id: string) {
  const res = await fetch(`/api/tasks?id=${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectId = params.projectId as string;
  
  const { sidebarOpen, viewSettings, setViewMode } = useProjectStore();
  const { commandPaletteOpen, setCommandPaletteOpen, createTaskModalOpen, setCreateTaskModalOpen } = useUIStore();

  // Queries
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchProject(projectId),
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => fetchTasks(projectId),
  });

  const { data: allProjects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      const data = await res.json();
      return data.data || [];
    },
  });

  // Mutations
  const updateTaskMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      toast.success('Задача создана');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      toast.success('Задача удалена');
    },
    onError: () => {
      toast.error('Ошибка при удалении задачи');
    },
  });

  // Handle task status change
  const handleTaskStatusChange = (taskId: string, newStatus: string) => {
    updateTaskMutation.mutate({ id: taskId, status: newStatus });
  };

  // Handle create task
  const handleCreateTask = (taskData: any) => {
    createTaskMutation.mutate({
      ...taskData,
      projectId,
    });
  };

  // Handle edit task
  const handleEditTask = (taskId: string) => {
    // TODO: Open edit modal or navigate to task
    toast.info('Редактирование задачи в разработке');
  };

  // Handle delete task
  const handleDeleteTask = (taskId: string) => {
    if (confirm('Удалить задачу?')) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  // Calculate progress
  const completedTasks = tasks.filter((t: any) => t.status === 'done').length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Days remaining
  const daysRemaining = project?.endDate 
    ? differenceInDays(new Date(project.endDate), new Date())
    : null;

  const isLoading = projectLoading || tasksLoading;

  const { data: session, status: sessionStatus } = useSession();
  const user = session?.user;

  if ((projectLoading && !project) || sessionStatus === 'loading') {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar projects={allProjects} />
        <div className={cn('transition-all duration-300', sidebarOpen ? 'ml-64' : 'ml-0')}>
          <Header user={user} projectId={projectId} />
          <main className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar projects={allProjects} />
      
      <div className={cn(
        'transition-all duration-300',
        sidebarOpen ? 'ml-64' : 'ml-0'
      )}>
        <Header user={user} projectId={projectId} />
        
        <main className="p-6">
          {/* Back button and project header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div 
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: `${project?.color || '#6366f1'}20` }}
                  >
                    {project?.icon || '📁'}
                  </div>
                  <h1 className="text-2xl font-bold">{project?.name || 'Проект'}</h1>
                  <Badge variant="outline">
                    {project?.status === 'active' ? 'Активен' : project?.status}
                  </Badge>
                </div>
                {project?.description && (
                  <p className="text-muted-foreground">{project.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">Прогресс</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">{progress}%</span>
                <span className="text-sm text-muted-foreground">({completedTasks}/{totalTasks})</span>
              </div>
              <Progress value={progress} className="h-2 mt-2" />
            </div>

            <div className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Дней осталось</span>
              </div>
              <span className={cn(
                "text-2xl font-bold",
                daysRemaining !== null && daysRemaining < 7 && "text-destructive"
              )}>
                {daysRemaining !== null ? daysRemaining : '—'}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm">Задач</span>
              </div>
              <span className="text-2xl font-bold">{totalTasks}</span>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">Участников</span>
              </div>
              <span className="text-2xl font-bold">{project?.members?.length || 1}</span>
            </div>
          </div>

          {/* View Content */}
          <div className="mt-4">
            {viewSettings.viewMode === 'board' && (
              <KanbanBoard 
                tasks={tasks} 
                onStatusChange={handleTaskStatusChange}
                onCreateTask={handleCreateTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                isLoading={isLoading}
              />
            )}
            {viewSettings.viewMode === 'timeline' && (
              <TimelineView tasks={tasks} project={project} />
            )}
            {viewSettings.viewMode === 'list' && (
              <TaskListView tasks={tasks} isLoading={isLoading} />
            )}
            {viewSettings.viewMode === 'calendar' && (
              <CalendarView tasks={tasks} />
            )}
          </div>
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette projects={allProjects} />
      
      {/* Quick Task Create */}
      <QuickTaskCreate 
        onTaskCreate={handleCreateTask}
        projects={allProjects}
        defaultProjectId={projectId}
      />
    </div>
  );
}

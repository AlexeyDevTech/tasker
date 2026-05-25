'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { CommandPalette } from '@/components/layout/command-palette';
import { ProjectHeader } from '@/components/projects/project-header';
import { ProjectStats } from '@/components/projects/project-stats';
import { KanbanBoard } from '@/components/board/kanban-board';
import { TimelineView } from '@/components/timeline/timeline-view';
import { TimelineStream } from '@/components/timeline/timeline-stream';
import { TaskListView } from '@/components/tasks/task-list-view';
import { CalendarView } from '@/components/calendar/calendar-view';
import { QuickTaskCreate } from '@/components/tasks/quick-task-create';
import { TaskDetails } from '@/components/tasks/task-details';
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
  const { commandPaletteOpen, setCommandPaletteOpen, createTaskModalOpen, setCreateTaskModalOpen, activeTaskId, setActiveTaskId } = useUIStore();

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

  // Handle task update from the detail drawer (title/description/status/priority)
  const handleUpdateTask = (data: { id: string; [key: string]: any }) => {
    updateTaskMutation.mutate(data);
  };

  // Task currently shown in the right contextual drawer
  const activeTask = activeTaskId ? tasks.find((t: any) => t.id === activeTaskId) ?? null : null;

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
        <div className={cn('transition-all duration-300', sidebarOpen ? 'ml-60' : 'ml-0')}>
          <Header user={user} projectId={projectId} />
          <main className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="grid grid-cols-4 gap-4">
                {[1 , 2, 3, 4].map((i) => (
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
        sidebarOpen ? 'ml-60' : 'ml-0'
      )}>
        <Header user={user} projectId={projectId} />
        
        <main className="p-6">
          <ProjectHeader project={project} />

          <ProjectStats
            progress={progress}
            completedTasks={completedTasks}
            totalTasks={totalTasks}
            daysRemaining={daysRemaining}
            membersCount={project?.members?.length || 1}
          />

          {/* View Content */}
          <div className="mt-4">
            {viewSettings.viewMode === 'board' && (
              <KanbanBoard
                tasks={tasks}
                onStatusChange={handleTaskStatusChange}
                onCreateTask={handleCreateTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onViewTask={setActiveTaskId}
                isLoading={isLoading}
              />
            )}
            {viewSettings.viewMode === 'timeline' && (
              <TimelineView tasks={tasks} project={project} />
            )}
            {viewSettings.viewMode === 'stream' && (
              <TimelineStream tasks={tasks} onSelectTask={setActiveTaskId} />
            )}
            {viewSettings.viewMode === 'list' && (
              <TaskListView
                tasks={tasks}
                isLoading={isLoading}
                onStatusChange={handleTaskStatusChange}
                onDelete={handleDeleteTask}
                onSelectTask={setActiveTaskId}
              />
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

      {/* Right contextual task drawer — shared across all views */}
      <TaskDetails
        task={activeTask}
        open={!!activeTask}
        onOpenChange={(open) => !open && setActiveTaskId(null)}
        onUpdate={handleUpdateTask}
        onDelete={activeTask ? () => {
          handleDeleteTask(activeTask.id);
          setActiveTaskId(null);
        } : undefined}
      />
    </div>
  );
}

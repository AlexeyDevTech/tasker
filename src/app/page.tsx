'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { CommandPalette } from '@/components/layout/command-palette';
import { WelcomeDashboard } from '@/components/dashboard/welcome-dashboard';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { ProjectCard } from '@/components/projects/project-card';
import { TemplateSelector } from '@/components/projects/template-selector';
import { BulkImportForm } from '@/components/projects/bulk-import-form';
import { QuickTaskCreate } from '@/components/tasks/quick-task-create';
import { type ParsedProject } from '@/lib/bulk-parser';
import { useProjectStore } from '@/stores/project-store';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  FolderOpen,
  Sparkles,
  ArrowRight,
  Upload,
  CheckCircle2,
  Clock,
  TrendingUp,
  Calendar,
  MoreHorizontal,
  Target,
  Zap,
  Briefcase,
  ChevronRight,
  Star,
  Play,
  Pause,
  CheckSquare,
  Timer,
  Activity,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format, isToday, isTomorrow, isPast, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import Link from 'next/link';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// Fetch projects
async function fetchProjects() {
  const res = await fetch('/api/projects');
  if (!res.ok) throw new Error('Failed to fetch projects');
  const data = await res.json();
  return data.data || [];
}

// Fetch all tasks
async function fetchTasks() {
  const res = await fetch('/api/tasks');
  if (!res.ok) throw new Error('Failed to fetch tasks');
  const data = await res.json();
  return data.data || [];
}

// Fetch templates
async function fetchTemplates() {
  const res = await fetch('/api/templates');
  if (!res.ok) throw new Error('Failed to fetch templates');
  const data = await res.json();
  return data.data || [];
}

// Create project
async function createProject(data: {
  name: string;
  description?: string;
  templateId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
}

// Create task
async function createTask(data: {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  projectId?: string;
}) {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

// Bulk create projects
async function bulkCreateProjects(data: ParsedProject[]) {
  const res = await fetch('/api/projects/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Failed to bulk create projects' }));
    throw new Error(errorData.message);
  }
  return res.json();
}

// Delete project
async function deleteProject(id: string) {
  const res = await fetch(`/api/projects/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Failed to delete project');
  }
  return res.json();
}

function DashboardContent() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });

  const queryClient = useQueryClient();
  const { sidebarOpen } = useProjectStore();
  const { createProjectModalOpen, setCreateProjectModalOpen, createTaskModalOpen, setCreateTaskModalOpen } = useUIStore();
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

  // Queries
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    enabled: status === 'authenticated',
  });

  const { data: allTasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['all-tasks'],
    queryFn: fetchTasks,
    enabled: status === 'authenticated',
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
    enabled: status === 'authenticated',
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Проект успешно создан!');
      setCreateProjectModalOpen(false);
    },
    onError: (error) => {
      toast.error(`Ошибка при создании проекта: ${error.message}`);
    },
  });
  
  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
      toast.success('Задача успешно создана!');
      setCreateTaskModalOpen(false);
    },
    onError: (error) => {
      toast.error(`Ошибка при создании задачи: ${error.message}`);
    },
  });

  const bulkCreateMutation = useMutation({
    mutationFn: bulkCreateProjects,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(data.message);
      setIsBulkImportOpen(false);
    },
    onError: (error) => {
      toast.error(`Ошибка при импорте: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Проект успешно удален!');
    },
    onError: (error) => {
      toast.error(`Ошибка при удалении проекта: ${error.message}`);
    },
  });

  // Calculate stats
  const activeProjects = projects.filter((p: any) => p.status === 'active');
  const completedProjects = projects.filter((p: any) => p.status === 'completed');
  const archivedProjects = projects.filter((p: any) => p.status === 'archived');

  // Task stats
  const todoTasks = allTasks.filter((t: any) => t.status === 'todo');
  const inProgressTasks = allTasks.filter((t: any) => t.status === 'in-progress');
  const doneTasks = allTasks.filter((t: any) => t.status === 'done');
  const overdueTasks = allTasks.filter((t: any) => 
    t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'done'
  );
  const todayTasks = allTasks.filter((t: any) => 
    t.dueDate && isToday(new Date(t.dueDate))
  );
  const upcomingTasks = allTasks.filter((t: any) => 
    t.dueDate && (isTomorrow(new Date(t.dueDate)) || 
    (new Date(t.dueDate) > new Date() && new Date(t.dueDate) <= addDays(new Date(), 7)))
  );

  // Recent projects (last 5)
  const recentProjects = [...activeProjects]
    .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Filter projects
  const filteredProjects = projects.filter((p: any) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredActive = filteredProjects.filter((p: any) => p.status === 'active');
  const filteredCompleted = filteredProjects.filter((p: any) => p.status === 'completed');
  const filteredArchived = filteredProjects.filter((p: any) => p.status === 'archived');

  const handleCreateProject = (data: any) => {
    createMutation.mutate(data);
  };

  const handleCreateTask = (data: any) => {
    createTaskMutation.mutate(data);
  };

  const handleBulkImport = (data: ParsedProject[]) => {
    bulkCreateMutation.mutate(data);
  };

  const handleDeleteProject = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleEditProject = (id: string) => {
    toast.info('Функция редактирования в разработке.');
  };

  // Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
  };

  if (status === 'loading' || !session?.user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6 lg:p-8 space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar projects={projects} />
      
      <div className={cn(
        'transition-all duration-300',
        sidebarOpen ? 'ml-60' : 'ml-0'
      )}>
        <Header user={user} />
        
        <main className="p-6 lg:p-8 space-y-8">
          <WelcomeDashboard
            userName={user.name?.split(' ')[0] || 'Пользователь'}
            todoTasksCount={todoTasks.length}
            overdueTasksCount={overdueTasks.length}
            onNewTaskClick={() => setCreateTaskModalOpen(true)}
            onNewProjectClick={() => setCreateProjectModalOpen(true)}
            getGreeting={getGreeting}
          />

          <DashboardStats
            activeProjectsCount={activeProjects.length}
            inProgressTasksCount={inProgressTasks.length}
            doneTasksCount={doneTasks.length}
            overdueTasksCount={overdueTasks.length}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Projects List */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setCreateProjectModalOpen(true)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 bg-card hover:bg-accent hover:border-primary/30 transition-all duration-200 group"
                >
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">Новый проект</p>
                    <p className="text-xs text-muted-foreground">С шаблоном или с нуля</p>
                  </div>
                </button>

                <button
                  onClick={() => setIsBulkImportOpen(true)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 bg-card hover:bg-accent hover:border-sky-500/30 transition-all duration-200 group"
                >
                  <div className="h-9 w-9 rounded-lg bg-sky-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="h-4 w-4 text-sky-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">Импорт</p>
                    <p className="text-xs text-muted-foreground">Из текста</p>
                  </div>
                </button>

                <button
                  onClick={() => setCreateTaskModalOpen(true)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 bg-card hover:bg-accent hover:border-emerald-500/30 transition-all duration-200 group"
                >
                  <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckSquare className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">Быстрая задача</p>
                    <p className="text-xs text-muted-foreground">Создать за секунду</p>
                  </div>
                </button>
              </div>

              {/* Search and View Toggle */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск проектов..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 bg-muted/30"
                  />
                </div>
                <div className="flex items-center gap-1 p-1 rounded-lg border border-border/50 bg-muted/30">
                  <Button
                    variant={viewType === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewType('grid')}
                    className="h-8"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewType === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewType('list')}
                    className="h-8"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Projects Tabs */}
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="bg-muted/30 p-1 rounded-xl h-auto">
                  <TabsTrigger value="active" className="rounded-lg gap-2">
                    <Play className="h-3.5 w-3.5" />
                    Активные
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {filteredActive.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="rounded-lg gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Завершённые
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {filteredCompleted.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="archived" className="rounded-lg gap-2">
                    <Pause className="h-3.5 w-3.5" />
                    Архив
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {filteredArchived.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-4">
                  {isLoadingProjects ? (
                    <div className={cn(
                      "grid gap-4",
                      viewType === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                    )}>
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-40 rounded-xl" />
                      ))}
                    </div>
                  ) : filteredActive.length === 0 ? (
                    <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-border/50">
                      <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                        <FolderOpen className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold mb-1">Нет активных проектов</h3>
                      <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                        Создайте первый проект, чтобы начать работу
                      </p>
                      <Button onClick={() => setCreateProjectModalOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Создать проект
                      </Button>
                    </div>
                  ) : (
                    <div className={cn(
                      "grid gap-4",
                      viewType === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                    )}>
                      {filteredActive.map((project: any) => (
                        <ProjectCard 
                          key={project.id} 
                          project={project} 
                          onEdit={() => handleEditProject(project.id)} 
                          onDelete={() => handleDeleteProject(project.id)} 
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="completed" className="mt-4">
                  {filteredCompleted.length === 0 ? (
                    <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-border/50">
                      <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                      </div>
                      <h3 className="font-semibold mb-1">Нет завершённых проектов</h3>
                      <p className="text-sm text-muted-foreground">
                        Завершённые проекты появятся здесь
                      </p>
                    </div>
                  ) : (
                    <div className={cn(
                      "grid gap-4",
                      viewType === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                    )}>
                      {filteredCompleted.map((project: any) => (
                        <ProjectCard 
                          key={project.id} 
                          project={project} 
                          onEdit={() => handleEditProject(project.id)} 
                          onDelete={() => handleDeleteProject(project.id)} 
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="archived" className="mt-4">
                  {filteredArchived.length === 0 ? (
                    <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-border/50">
                      <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                        <Pause className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold mb-1">Нет архивных проектов</h3>
                      <p className="text-sm text-muted-foreground">
                        Архивные проекты появятся здесь
                      </p>
                    </div>
                  ) : (
                    <div className={cn(
                      "grid gap-4",
                      viewType === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                    )}>
                      {filteredArchived.map((project: any) => (
                        <ProjectCard 
                          key={project.id} 
                          project={project} 
                          onEdit={() => handleEditProject(project.id)} 
                          onDelete={() => handleDeleteProject(project.id)} 
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Upcoming Tasks */}
              <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                <div className="p-4 border-b border-border/50 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Ближайшие задачи
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {todayTasks.length + upcomingTasks.length}
                    </Badge>
                  </div>
                </div>
                <ScrollArea className="h-72">
                  {todayTasks.length === 0 && upcomingTasks.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                      <p>Нет предстоящих задач</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {todayTasks.slice(0, 3).map((task: any) => (
                        <Link
                          key={task.id}
                          href={`/projects/${task.projectId}`}
                          className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <div className="h-6 w-6 rounded-full bg-amber-500/10 flex items-center justify-center mt-0.5">
                            <span className="text-xs">☀️</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                              {task.title}
                            </p>
                            <p className="text-xs text-muted-foreground">Сегодня</p>
                          </div>
                        </Link>
                      ))}
                      {upcomingTasks.slice(0, 5).map((task: any) => (
                        <Link
                          key={task.id}
                          href={`/projects/${task.projectId}`}
                          className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                            <Clock className="h-3 w-3 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                              {task.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(task.dueDate), 'd MMM', { locale: ru })}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Recent Projects */}
              <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                <div className="p-4 border-b border-border/50 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      Недавние проекты
                    </h3>
                  </div>
                </div>
                <div className="p-2">
                  {recentProjects.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      <FolderOpen className="h-8 w-8 mx-auto mb-2" />
                      <p>Нет недавних проектов</p>
                    </div>
                  ) : (
                    recentProjects.map((project: any) => (
                      <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                      >
                        <div 
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-sm"
                          style={{ backgroundColor: `${project.color || '#6366f1'}20` }}
                        >
                          {project.icon || '📁'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                            {project.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {project._count?.tasks || 0} задач
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Прогресс</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Выполнено задач</span>
                      <span className="font-medium">{allTasks.length > 0 ? Math.round((doneTasks.length / allTasks.length) * 100) : 0}%</span>
                    </div>
                    <Progress value={allTasks.length > 0 ? (doneTasks.length / allTasks.length) * 100 : 0} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Всего задач</span>
                    <span className="font-medium">{allTasks.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Проектов</span>
                    <span className="font-medium">{projects.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <CommandPalette projects={projects} />
      <TemplateSelector open={createProjectModalOpen} onOpenChange={setCreateProjectModalOpen} templates={templates} onSelect={handleCreateProject} />
      <BulkImportForm open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen} onImport={handleBulkImport} />
      <QuickTaskCreate 
        onTaskCreate={handleCreateTask}
        projects={projects}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
}

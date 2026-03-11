'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { CommandPalette } from '@/components/layout/command-palette';
import { ProjectCard } from '@/components/projects/project-card';
import { TemplateSelector } from '@/components/projects/template-selector';
import { BulkImportForm } from '@/components/projects/bulk-import-form';
import { type ParsedProject } from '@/lib/bulk-parser';
import { useProjectStore } from '@/stores/project-store';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  FolderOpen,
  Sparkles,
  ArrowRight,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
  const { createProjectModalOpen, setCreateProjectModalOpen } = useUIStore();
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

  // Queries
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    enabled: status === 'authenticated', // Only fetch if authenticated
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


  // Filter projects
  const filteredProjects = projects.filter((p: any) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeProjects = filteredProjects.filter((p: any) => p.status === 'active');
  const completedProjects = filteredProjects.filter((p: any) => p.status === 'completed');
  const archivedProjects = filteredProjects.filter((p: any) => p.status === 'archived');

  const handleCreateProject = (data: any) => {
    createMutation.mutate(data);
  };

  const handleBulkImport = (data: ParsedProject[]) => {
    bulkCreateMutation.mutate(data);
  };

  if (status === 'loading' || !session?.user) {
    return (
      <div className="p-6">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-10 w-full mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
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
        sidebarOpen ? 'ml-64' : 'ml-0'
      )}>
        <Header user={user} />
        
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Добро пожаловать, {user.name}! 👋
            </h1>
            <p className="text-muted-foreground">
              Управляйте проектами, задачами и командой в одном месте.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => setCreateProjectModalOpen(true)}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-gradient-to-r from-violet-500/10 to-purple-500/10 hover:from-violet-500/20 hover:to-purple-500/20 transition-all group"
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white">
                <Plus className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Новый проект</p>
                <p className="text-sm text-muted-foreground">Создать с шаблоном или с нуля</p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setIsBulkImportOpen(true)}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-gradient-to-r from-sky-500/10 to-blue-500/10 hover:from-sky-500/20 hover:to-blue-500/20 transition-all group"
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white">
                <Upload className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Импорт из текста</p>
                <p className="text-sm text-muted-foreground">Массовое создание задач</p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>

            <button className="flex items-center gap-4 p-4 rounded-xl border border-border bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                <FolderOpen className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Шаблоны</p>
                <p className="text-sm text-muted-foreground">Готовые структуры проектов</p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск проектов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewType === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewType('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewType === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewType('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="active">Активные ({activeProjects.length})</TabsTrigger>
              <TabsTrigger value="completed">Завершённые ({completedProjects.length})</TabsTrigger>
              <TabsTrigger value="archived">Архив ({archivedProjects.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {isLoadingProjects ? (
                <div className={cn("grid gap-4", viewType === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border border-border p-4"><Skeleton className="h-6 w-1/2 mb-2" /><Skeleton className="h-4 w-3/4 mb-4" /><Skeleton className="h-2 w-full" /></div>
                  ))}
                </div>
              ) : activeProjects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center"><FolderOpen className="h-8 w-8 text-muted-foreground" /></div>
                  <h3 className="text-lg font-medium mb-1">Нет активных проектов</h3>
                  <p className="text-muted-foreground mb-4">Создайте первый проект, чтобы начать работу</p>
                  <Button onClick={() => setCreateProjectModalOpen(true)}><Plus className="mr-2 h-4 w-4" />Создать проект</Button>
                </div>
              ) : (
                <div className={cn("grid gap-4", viewType === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
                  {activeProjects.map((project: any) => (<ProjectCard key={project.id} project={project} />))}
                </div>
              )}
            </TabsContent>
            
            {/* Other Tabs Content... */}

          </Tabs>
        </main>
      </div>

      <CommandPalette projects={projects} />
      <TemplateSelector open={createProjectModalOpen} onOpenChange={setCreateProjectModalOpen} templates={templates} onSelect={handleCreateProject} />
      <BulkImportForm open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen} onImport={handleBulkImport} />
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

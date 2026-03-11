'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/stores/project-store';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Plus,
  LayoutDashboard,
  Calendar,
  Inbox,
  Settings,
  Search,
  HelpCircle,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  projects: Array<{
    id: string;
    name: string;
    color: string;
    icon: string | null;
    parentId: string | null;
    children?: any[];
  }>;
}

export function Sidebar({ projects }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarOpen, selectedProjectId, setSelectedProjectId } = useProjectStore();
  const { setCommandPaletteOpen, setCreateProjectModalOpen } = useUIStore();

  // Filter to get only root projects
  const rootProjects = projects.filter((p) => !p.parentId);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-border/50 bg-gradient-to-b from-sidebar to-sidebar/95 backdrop-blur-xl transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo with enhanced design */}
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary to-primary/80 text-white shadow-lg shadow-primary/25 transition-transform duration-300 group-hover:scale-110">
              <Sparkles className="h-4.5 w-4.5" />
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent font-bold text-lg leading-tight">
                TaskFlow
              </span>
              <span className="text-[10px] text-muted-foreground font-medium -mt-0.5">Project Manager</span>
            </div>
          </Link>
        </div>

        {/* Enhanced Search */}
        <div className="p-3">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="group flex w-full items-center gap-3 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/50 hover:border-primary/30 px-3.5 py-2.5 text-sm transition-all duration-200"
          >
            <Search className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-muted-foreground">Поиск...</span>
            <kbd className="ml-auto rounded-md bg-background/80 px-2 py-0.5 text-[10px] font-mono text-muted-foreground border border-border/50 shadow-sm">
              ⌘K
            </kbd>
          </button>
        </div>

        <Separator className="mx-3" />

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-3">
          <nav className="space-y-1">
            <NavItem
              href="/"
              icon={LayoutDashboard}
              label="Дашборд"
              active={pathname === '/'}
            />
            <NavItem
              href="/inbox"
              icon={Inbox}
              label="Входящие"
              active={pathname === '/inbox'}
              badge={3}
            />
            <NavItem
              href="/calendar"
              icon={Calendar}
              label="Календарь"
              active={pathname === '/calendar'}
            />
          </nav>

          <Separator className="my-4" />

          {/* Projects Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                Проекты
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => setCreateProjectModalOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="space-y-0.5">
              {rootProjects.map((project) => (
                <ProjectItem
                  key={project.id}
                  project={project}
                  allProjects={projects}
                  selectedId={selectedProjectId}
                  onSelect={setSelectedProjectId}
                  level={0}
                />
              ))}
            </div>

            {rootProjects.length === 0 && (
              <div className="px-2 py-4 text-center">
                <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
                  <Folder className="h-5 w-5 text-muted-foreground/60" />
                </div>
                <p className="text-xs text-muted-foreground">Нет проектов</p>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="h-auto p-0 mt-1 text-primary"
                  onClick={() => setCreateProjectModalOpen(true)}
                >
                  Создать первый
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator className="mx-3" />

        {/* Footer with enhanced styling */}
        <div className="p-3 space-y-1">
          <NavItem
            href="/settings"
            icon={Settings}
            label="Настройки"
            active={pathname === '/settings'}
          />
          <NavItem
            href="/help"
            icon={HelpCircle}
            label="Справка"
            active={pathname === '/help'}
          />
          
          {/* Pro banner */}
          <div className="mt-3 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold">Pro версия</span>
            </div>
            <p className="text-[10px] text-muted-foreground mb-2">
              AI-ассистент и расширенные функции
            </p>
            <Button size="sm" className="w-full h-7 text-xs bg-primary/90 hover:bg-primary">
              Подробнее
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  badge?: number;
}

function NavItem({ href, icon: Icon, label, active, badge }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
        active
          ? 'bg-primary/10 text-primary shadow-sm'
          : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
      )}
    >
      <div className={cn(
        "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
        active 
          ? "bg-primary/15 text-primary" 
          : "bg-muted/50 text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
          {badge}
        </span>
      )}
    </Link>
  );
}

interface ProjectItemProps {
  project: {
    id: string;
    name: string;
    color: string;
    icon: string | null;
    parentId: string | null;
  };
  allProjects: any[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  level: number;
}

function ProjectItem({ project, allProjects, selectedId, onSelect, level }: ProjectItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const children = allProjects.filter((p) => p.parentId === project.id);
  const hasChildren = children.length > 0;

  const isActive = pathname.startsWith(`/projects/${project.id}`);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center">
        <Link
          href={`/projects/${project.id}`}
          className={cn(
            'group flex flex-1 items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-all duration-200',
            isActive
              ? 'bg-primary/10 text-primary font-medium shadow-sm'
              : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
            level > 0 && 'ml-3'
          )}
        >
          <div
            className="h-3.5 w-3.5 rounded-md flex-shrink-0 shadow-sm transition-transform group-hover:scale-110"
            style={{ backgroundColor: project.color }}
          />
          <span className="truncate flex-1">{project.icon || ''} {project.name}</span>
          {hasChildren && (
            <CollapsibleTrigger asChild onClick={(e) => e.preventDefault()}>
              <button 
                className="flex h-5 w-5 items-center justify-center rounded hover:bg-muted transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(!isOpen);
                }}
              >
                {isOpen ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
            </CollapsibleTrigger>
          )}
        </Link>
      </div>

      {hasChildren && (
        <CollapsibleContent>
          <div className="space-y-0.5 mt-0.5">
            {children.map((child) => (
              <ProjectItem
                key={child.id}
                project={child}
                allProjects={allProjects}
                selectedId={selectedId}
                onSelect={onSelect}
                level={level + 1}
              />
            ))}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

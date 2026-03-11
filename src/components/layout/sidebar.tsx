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
        'fixed left-0 top-0 z-40 h-screen border-r border-border bg-background transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent font-bold">
              TaskFlow
            </span>
          </Link>
        </div>

        {/* Search */}
        <div className="p-3">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>Поиск...</span>
            <kbd className="ml-auto rounded bg-muted px-1.5 py-0.5 text-xs font-mono">⌘K</kbd>
          </button>
        </div>

        <Separator />

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-2">
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
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Проекты
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setCreateProjectModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
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
          </div>
        </ScrollArea>

        <Separator />

        {/* Footer */}
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
}

function NavItem({ href, icon: Icon, label, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
        active
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
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
        {hasChildren && (
          <CollapsibleTrigger asChild>
            <button className="flex h-7 w-6 items-center justify-center text-muted-foreground hover:text-foreground">
              {isOpen ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          </CollapsibleTrigger>
        )}
        
        <Link
          href={`/projects/${project.id}`}
          className={cn(
            'flex flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors',
            isActive
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            level > 0 && 'ml-2'
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
        >
          <div
            className="h-3 w-3 rounded-sm flex-shrink-0"
            style={{ backgroundColor: project.color }}
          />
          <span className="truncate">{project.icon || ''} {project.name}</span>
        </Link>
      </div>

      {hasChildren && (
        <CollapsibleContent>
          <div className="space-y-0.5">
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

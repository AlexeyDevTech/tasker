'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/stores/project-store';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronRight,
  Folder,
  Plus,
  Home,
  Calendar,
  Inbox,
  Settings,
  Search,
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
        'fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-[width] duration-200',
        sidebarOpen ? 'w-60' : 'w-0 overflow-hidden'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-14 items-center px-3">
          <Link href="/" className="flex items-center gap-2.5 rounded-md px-2 py-1.5 -mx-2 hover:bg-sidebar-accent transition-colors">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
              T
            </div>
            <span className="font-semibold text-[15px] text-sidebar-foreground">TaskFlow</span>
          </Link>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-sidebar-accent transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>Поиск</span>
            <kbd className="ml-auto rounded bg-background/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground border border-sidebar-border">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3">
          <nav className="space-y-0.5">
            <NavItem href="/" icon={Home} label="Главная" active={pathname === '/'} />
            <NavItem href="/inbox" icon={Inbox} label="Входящие" active={pathname === '/inbox'} />
            <NavItem href="/calendar" icon={Calendar} label="Календарь" active={pathname === '/calendar'} />
          </nav>

          {/* Projects Section */}
          <div className="mt-6 space-y-1">
            <div className="flex items-center justify-between px-2 group">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                Проекты
              </span>
              <button
                className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-sidebar-accent transition-all"
                onClick={() => setCreateProjectModalOpen(true)}
                aria-label="Новый проект"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
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
              <button
                onClick={() => setCreateProjectModalOpen(true)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-sidebar-accent transition-colors"
              >
                <Plus className="h-4 w-4" />
                Создать проект
              </button>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3">
          <NavItem href="/settings" icon={Settings} label="Настройки" active={pathname === '/settings'} />
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
        'group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors',
        active
          ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
          : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1 truncate">{label}</span>
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

function ProjectItem({ project, allProjects, level }: ProjectItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const children = allProjects.filter((p) => p.parentId === project.id);
  const hasChildren = children.length > 0;

  const isActive = pathname.startsWith(`/projects/${project.id}`);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={cn(
          'group flex items-center rounded-md transition-colors',
          isActive ? 'bg-sidebar-accent' : 'hover:bg-sidebar-accent'
        )}
        style={{ paddingLeft: level > 0 ? `${level * 12}px` : undefined }}
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsOpen(!isOpen);
          }}
          className={cn(
            'flex h-5 w-5 ml-1 items-center justify-center rounded text-muted-foreground hover:text-foreground flex-shrink-0',
            !hasChildren && 'invisible'
          )}
          aria-label="Развернуть"
        >
          {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
        <Link
          href={`/projects/${project.id}`}
          className={cn(
            'flex flex-1 items-center gap-2 py-1.5 pr-2 text-sm min-w-0',
            isActive ? 'text-sidebar-foreground font-medium' : 'text-muted-foreground'
          )}
        >
          {project.icon ? (
            <span className="text-sm leading-none flex-shrink-0">{project.icon}</span>
          ) : (
            <span
              className="h-2.5 w-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: project.color }}
            />
          )}
          <span className="truncate">{project.name}</span>
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
                selectedId={null}
                onSelect={() => {}}
                level={level + 1}
              />
            ))}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

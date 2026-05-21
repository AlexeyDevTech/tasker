'use client';

import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/stores/ui-store';
import { useProjectStore } from '@/stores/project-store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Bell,
  Menu,
  Moon,
  Sun,
  Monitor,
  Search,
  Plus,
  ChevronDown,
  LayoutGrid,
  List,
  Calendar,
  GanttChart,
  LogOut,
  Settings,
  User,
  Sparkles,
  FolderPlus,
  FileText,
  CheckSquare,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { ViewMode } from '@/types';

interface HeaderProps {
  // Matches the next-auth session user shape (fields may be absent/null).
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  projectId?: string;
}

const viewModes: { value: ViewMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'board', label: 'Доска', icon: LayoutGrid },
  { value: 'list', label: 'Список', icon: List },
  { value: 'timeline', label: 'Таймлайн', icon: GanttChart },
  { value: 'calendar', label: 'Календарь', icon: Calendar },
];

export function Header({ user, projectId }: HeaderProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { 
    toggleSidebar, 
    viewSettings, 
    setViewMode,
  } = useProjectStore();
  const { 
    setCommandPaletteOpen, 
    setNotificationsPanelOpen, 
    setCreateProjectModalOpen,
    setCreateTaskModalOpen,
  } = useUIStore();
  
  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:px-6">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 md:hidden hover:bg-accent"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {projectId && (
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-md bg-muted p-0.5">
              {viewModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.value}
                    onClick={() => setViewMode(mode.value)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-[5px] px-2.5 py-1 text-sm font-medium transition-colors',
                      viewSettings.viewMode === mode.value
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Quick Add - Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className="hidden sm:flex h-8 gap-1.5 bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              <span>Создать</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              Быстрое создание
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="gap-3 cursor-pointer"
              onClick={() => setCreateTaskModalOpen(true)}
            >
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckSquare className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="font-medium">Новая задача</p>
                <p className="text-xs text-muted-foreground">Быстрое создание задачи</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="gap-3 cursor-pointer"
              onClick={() => setCreateProjectModalOpen(true)}
            >
              <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <FolderPlus className="h-4 w-4 text-violet-500" />
              </div>
              <div>
                <p className="font-medium">Новый проект</p>
                <p className="text-xs text-muted-foreground">Создать проект с шаблоном</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mobile Quick Add */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:hidden hover:bg-accent"
          onClick={() => setCreateTaskModalOpen(true)}
        >
          <Plus className="h-4.5 w-4.5" />
        </Button>

        {/* Search */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-accent transition-colors"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <Search className="h-4.5 w-4.5" />
        </Button>

        {/* Notifications - Enhanced */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 relative hover:bg-accent transition-colors"
            >
              <Bell className="h-4.5 w-4.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium leading-none">Уведомления</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="py-8 text-center">
              <Bell className="mx-auto mb-2 h-6 w-6 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Нет новых уведомлений</p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent transition-colors">
              <Sun className="h-4.5 w-4.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4.5 w-4.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Переключить тему</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme('light')} className="gap-2">
              <Sun className="h-4 w-4" />
              Светлая
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')} className="gap-2">
              <Moon className="h-4 w-4" />
              Тёмная
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')} className="gap-2">
              <Monitor className="h-4 w-4" />
              Системная
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu - Enhanced */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 gap-2 px-1.5 hover:bg-accent transition-colors">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.image || undefined} alt={user.name || ''} />
                  <AvatarFallback className="text-[11px] bg-primary/10 text-primary font-medium">
                    {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium">
                  {user.name || user.email?.split('@')[0] || 'Пользователь'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2 p-1">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.image || undefined} alt={user.name || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name || 'Пользователь'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                <Link href="/settings" className="flex items-center">
                  <User className="h-4 w-4" />
                  Профиль
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                <Link href="/settings" className="flex items-center">
                  <Settings className="h-4 w-4" />
                  Настройки
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-destructive focus:text-destructive gap-2 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild size="sm" className="h-8 bg-primary hover:bg-primary/90">
            <Link href="/login">Войти</Link>
          </Button>
        )}
      </div>
    </header>
  );
}

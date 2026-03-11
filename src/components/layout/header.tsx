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
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 lg:px-6">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 md:hidden hover:bg-primary/10"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {projectId && (
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl border border-border/60 bg-muted/30 p-1">
              {viewModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.value}
                    onClick={() => setViewMode(mode.value)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200',
                      viewSettings.viewMode === mode.value
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
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
              className="hidden sm:flex gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5"
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
          className="h-9 w-9 sm:hidden hover:bg-primary/10"
          onClick={() => setCreateTaskModalOpen(true)}
        >
          <Plus className="h-4.5 w-4.5" />
        </Button>

        {/* Search */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-colors"
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
              className="h-9 w-9 relative hover:bg-primary/10 transition-colors"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-[9px] font-bold text-white shadow-lg shadow-rose-500/30">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Уведомления</p>
                <p className="text-xs text-muted-foreground">
                  У вас 3 непрочитанных уведомления
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-64 overflow-y-auto">
              {[1, 2, 3].map((i) => (
                <DropdownMenuItem key={i} className="flex items-start gap-3 p-3 cursor-pointer">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-tight">Новое уведомление</p>
                    <p className="text-xs text-muted-foreground">Описание уведомления...</p>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/10 transition-colors">
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
              <Button variant="ghost" className="h-9 gap-2 px-2 hover:bg-primary/10 transition-colors">
                <Avatar className="h-7 w-7 ring-2 ring-primary/20">
                  <AvatarImage src={user.image || undefined} alt={user.name || ''} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-medium">
                    {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium">
                  {user.name || user.email.split('@')[0]}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2 p-1">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                      <AvatarImage src={user.image || undefined} alt={user.name || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-medium">
                        {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
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
          <Button asChild size="sm" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Link href="/login">Войти</Link>
          </Button>
        )}
      </div>
    </header>
  );
}

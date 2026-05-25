'use client';

import { useUIStore } from '@/stores/ui-store';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { useRouter } from 'next/navigation';
import { 
  Folder, 
  FileText, 
  Search, 
  Settings, 
  Calendar,
  Inbox,
  LayoutDashboard,
  Sparkles,
  Plus,
  Moon,
  Sun,
  LogOut,
  User,
  HelpCircle,
  Keyboard,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useGlobalHotkeys } from '@/hooks/use-global-hotkeys';

interface CommandPaletteProps {
  projects?: Array<{
    id: string;
    name: string;
    color: string;
    icon: string | null;
  }>;
}

export function CommandPalette({ projects = [] }: CommandPaletteProps) {
  const { commandPaletteOpen, setCommandPaletteOpen, setCreateProjectModalOpen } = useUIStore();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [search, setSearch] = useState('');

  // Глобальные горячие клавиши приложения (C, ⌘N, G→H)
  useGlobalHotkeys();

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const handleSelect = (action: () => void) => {
    action();
    setCommandPaletteOpen(false);
    setSearch('');
  };

  const handleCreateProject = () => {
    setCommandPaletteOpen(false);
    setCreateProjectModalOpen(true);
  };

  return (
    <Dialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl max-w-lg border-border/50 bg-card/95 backdrop-blur-xl">
        <Command className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <CommandInput 
            placeholder="Поиск проектов, задач, команд..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-[400px]">
            <CommandEmpty className="py-6 text-center text-sm">
              <div className="flex flex-col items-center gap-2">
                <Search className="h-8 w-8 text-muted-foreground/50" />
                <p>Ничего не найдено</p>
              </div>
            </CommandEmpty>

            {/* Quick Actions */}
            <CommandGroup heading="Быстрые действия">
              <CommandItem 
                onSelect={() => handleSelect(handleCreateProject)}
                className="gap-3 cursor-pointer rounded-lg hover:bg-primary/10 aria-selected:bg-primary/10"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Создать проект</p>
                  <p className="text-xs text-muted-foreground">Новый проект с шаблоном или без</p>
                </div>
                <CommandShortcut className="bg-muted/50 px-1.5 py-0.5 rounded text-[10px]">⌘N</CommandShortcut>
              </CommandItem>
              
              <CommandItem 
                onSelect={() => handleSelect(() => router.push('/inbox'))}
                className="gap-3 cursor-pointer rounded-lg hover:bg-muted/50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10">
                  <Inbox className="h-4 w-4 text-sky-500" />
                </div>
                <span className="flex-1">Входящие задачи</span>
              </CommandItem>
              
              <CommandItem 
                onSelect={() => handleSelect(() => router.push('/calendar'))}
                className="gap-3 cursor-pointer rounded-lg hover:bg-muted/50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                </div>
                <span className="flex-1">Календарь</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            {/* Projects */}
            {projects.length > 0 && (
              <>
                <CommandGroup heading="Проекты">
                  {projects.slice(0, 5).map((project, index) => (
                    <CommandItem
                      key={project.id}
                      onSelect={() => handleSelect(() => router.push(`/projects/${project.id}`))}
                      className="gap-3 cursor-pointer rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg text-lg" style={{ backgroundColor: `${project.color}20` }}>
                        {project.icon || '📁'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{project.name}</p>
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                        {index + 1}
                      </span>
                    </CommandItem>
                  ))}
                  {projects.length > 5 && (
                    <CommandItem
                      onSelect={() => handleSelect(() => router.push('/'))}
                      className="gap-3 cursor-pointer rounded-lg hover:bg-muted/50 justify-center"
                    >
                      <span className="text-sm text-muted-foreground">
                        Показать все {projects.length} проектов
                      </span>
                    </CommandItem>
                  )}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Settings & Actions */}
            <CommandGroup heading="Действия">
              <CommandItem 
                onSelect={() => handleSelect(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
                className="gap-3 cursor-pointer rounded-lg hover:bg-muted/50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4 text-amber-500" />
                  ) : (
                    <Moon className="h-4 w-4 text-amber-500" />
                  )}
                </div>
                <span className="flex-1">{theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}</span>
              </CommandItem>

              <CommandItem 
                onSelect={() => handleSelect(() => router.push('/settings'))}
                className="gap-3 cursor-pointer rounded-lg hover:bg-muted/50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="flex-1">Настройки</span>
              </CommandItem>

              <CommandItem 
                onSelect={() => handleSelect(() => router.push('/help'))}
                className="gap-3 cursor-pointer rounded-lg hover:bg-muted/50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="flex-1">Справка</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            {/* Navigation */}
            <CommandGroup heading="Навигация">
              <CommandItem 
                onSelect={() => handleSelect(() => router.push('/'))}
                className="gap-3 cursor-pointer rounded-lg hover:bg-muted/50"
              >
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1">Дашборд</span>
                <CommandShortcut className="bg-muted/50 px-1.5 py-0.5 rounded text-[10px]">G H</CommandShortcut>
              </CommandItem>
              
              <CommandItem 
                onSelect={() => handleSelect(() => router.push('/settings'))}
                className="gap-3 cursor-pointer rounded-lg hover:bg-muted/50"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1">Профиль</span>
              </CommandItem>
            </CommandGroup>

            {/* Keyboard shortcuts hint */}
            <div className="p-3 border-t border-border/50">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Keyboard className="h-3 w-3" />
                  <span>Навигация: ↑↓</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Выбрать: ↵</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Закрыть: Esc</span>
                </div>
              </div>
            </div>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

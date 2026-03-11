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
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface CommandPaletteProps {
  projects?: Array<{
    id: string;
    name: string;
    color: string;
    icon: string | null;
  }>;
}

export function CommandPalette({ projects = [] }: CommandPaletteProps) {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const router = useRouter();
  const [search, setSearch] = useState('');

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

  return (
    <Dialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-lg max-w-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <CommandInput 
            placeholder="Поиск проектов, задач, команд..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>Ничего не найдено.</CommandEmpty>

            {/* Quick Actions */}
            <CommandGroup heading="Быстрые действия">
              <CommandItem onSelect={() => handleSelect(() => router.push('/projects/new'))}>
                <Plus className="mr-2 h-4 w-4" />
                Создать проект
                <CommandShortcut>⌘N</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect(() => router.push('/inbox'))}>
                <Inbox className="mr-2 h-4 w-4" />
                Входящие задачи
              </CommandItem>
              <CommandItem onSelect={() => handleSelect(() => router.push('/calendar'))}>
                <Calendar className="mr-2 h-4 w-4" />
                Календарь
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            {/* Projects */}
            {projects.length > 0 && (
              <CommandGroup heading="Проекты">
                {projects.slice(0, 5).map((project) => (
                  <CommandItem
                    key={project.id}
                    onSelect={() => handleSelect(() => router.push(`/projects/${project.id}`))}
                  >
                    <div
                      className="mr-2 h-3 w-3 rounded-sm"
                      style={{ backgroundColor: project.color }}
                    />
                    {project.icon || ''} {project.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandSeparator />

            {/* Navigation */}
            <CommandGroup heading="Навигация">
              <CommandItem onSelect={() => handleSelect(() => router.push('/'))}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Дашборд
              </CommandItem>
              <CommandItem onSelect={() => handleSelect(() => router.push('/settings'))}>
                <Settings className="mr-2 h-4 w-4" />
                Настройки
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

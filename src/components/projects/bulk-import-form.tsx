'use client';

import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  analyzeMarkdown,
  countTasks,
  type ParsedProject,
  type ParsedTask,
} from '@/lib/md-analyzer';
import { getStatusMeta, getPriorityMeta } from '@/lib/task-config';
import {
  Loader2,
  Upload,
  FileText,
  AlertTriangle,
  Copy,
  Trash2,
  Info,
  Calendar,
  Clock,
  User,
  Tag as TagIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BulkImportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: ParsedProject[]) => void;
}

const exampleText = `# Запуск лендинга
> Маркетинговый сайт к Q3

- [ ] Дизайн !high @anna due:2026-06-10 ~8h +design
  - [x] Главный экран
  - [~] Блок цен
- [ ] Разработка !medium
  Сверстать на Next.js
  - [ ] Вёрстка ~16h
  - [ ] Интеграция API @ivan

# Мобильное приложение
- [ ] Прототип !urgent due:tomorrow
- [ ] Дизайн UI +mobile`;

export function BulkImportForm({ open, onOpenChange, onImport }: BulkImportFormProps) {
  const [inputText, setInputText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const result = useMemo(() => (inputText.trim() ? analyzeMarkdown(inputText) : null), [inputText]);
  const projects = result?.projects ?? [];
  const warnings = result?.warnings ?? [];
  const projectCount = projects.length;
  const taskCount = projects.reduce((acc, p) => acc + countTasks(p.tasks), 0);
  const canImport = projectCount > 0;

  const handleImportClick = () => {
    if (!canImport) return;
    setIsImporting(true);
    try {
      onImport(projects);
      handleClose();
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 bg-card border-border/50">
        {/* Header */}
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">MD-анализатор</DialogTitle>
              <DialogDescription className="mt-1">
                Опишите проекты в Markdown — задачи, подзадачи и метаданные создадутся автоматически
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 grid grid-cols-2 gap-6">
          {/* Левая часть — ввод */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Markdown</Label>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5" onClick={() => setInputText(exampleText)}>
                  <Copy className="h-3 w-3" />
                  Пример
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1.5 text-destructive hover:text-destructive"
                  onClick={() => setInputText('')}
                  disabled={!inputText}
                >
                  <Trash2 className="h-3 w-3" />
                  Очистить
                </Button>
              </div>
            </div>

            <Textarea
              placeholder={`# Название проекта\n- [ ] Задача !high due:2026-06-01\n  - [ ] Подзадача`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="h-80 font-mono text-sm resize-none border-border/60 focus:border-primary/50 bg-muted/30"
            />

            {/* Справка по синтаксису */}
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="text-xs font-normal border-border/50"><span className="text-primary mr-1">#</span> проект</Badge>
              <Badge variant="outline" className="text-xs font-normal border-border/50"><span className="text-primary mr-1">-</span> задача</Badge>
              <Badge variant="outline" className="text-xs font-normal border-border/50"><span className="text-primary mr-1">[ ] [x] [~]</span> статус</Badge>
              <Badge variant="outline" className="text-xs font-normal border-border/50"><span className="text-primary mr-1">!high</span> приоритет</Badge>
              <Badge variant="outline" className="text-xs font-normal border-border/50"><span className="text-primary mr-1">@имя</span> исполнитель</Badge>
              <Badge variant="outline" className="text-xs font-normal border-border/50"><span className="text-primary mr-1">due:дата</span> срок</Badge>
              <Badge variant="outline" className="text-xs font-normal border-border/50"><span className="text-primary mr-1">~4h</span> оценка</Badge>
              <Badge variant="outline" className="text-xs font-normal border-border/50"><span className="text-primary mr-1">+тег</span> тег</Badge>
            </div>

            {warnings.length > 0 && (
              <div className="space-y-1.5">
                {warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Правая часть — превью */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Предпросмотр</Label>
              {projectCount > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-medium text-xs">{projectCount} проект(ов)</Badge>
                  <Badge variant="secondary" className="font-medium text-xs">{taskCount} задач(и)</Badge>
                </div>
              )}
            </div>

            <div className="h-80 rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
              {projectCount > 0 ? (
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    {projects.map((project) => (
                      <div key={project.id} className="rounded-lg border border-border/50 bg-card/50 p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-semibold text-sm">{project.name}</span>
                          <Badge variant="outline" className="ml-auto text-xs">{countTasks(project.tasks)}</Badge>
                        </div>
                        {project.description && (
                          <p className="text-xs text-muted-foreground mb-2 ml-1">{project.description}</p>
                        )}
                        <div className="space-y-0.5">
                          {project.tasks.map((task) => (
                            <TaskNode key={task.id} task={task} depth={0} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4">
                  <Info className="h-10 w-10 mb-3 opacity-50" />
                  <p className="text-sm text-center">Введите Markdown слева — справа появится структура</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 border-t border-border/50">
          <Button variant="outline" onClick={handleClose}>Отмена</Button>
          <Button
            onClick={handleImportClick}
            disabled={isImporting || !canImport}
            className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Импорт...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Создать
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Рекурсивная строка задачи в превью с бейджами метаданных.
function TaskNode({ task, depth }: { task: ParsedTask; depth: number }) {
  const status = task.status ? getStatusMeta(task.status) : null;
  const priority = task.priority ? getPriorityMeta(task.priority) : null;

  return (
    <div>
      <div className="flex items-center gap-2 py-1 text-sm" style={{ paddingLeft: depth * 16 }}>
        <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', priority ? priority.dot : 'bg-muted-foreground/40')} />
        <span className={cn('truncate', task.status === 'done' && 'line-through text-muted-foreground')}>{task.title}</span>

        <div className="flex items-center gap-1 flex-shrink-0">
          {status && (
            <Badge className={cn('h-4 px-1.5 text-[10px] border-0', status.badgeBg, status.badgeText)}>{status.label}</Badge>
          )}
          {task.dueDate && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Calendar className="h-3 w-3" />{task.dueDate.slice(5)}
            </span>
          )}
          {task.estimatedHours != null && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />{task.estimatedHours}ч
            </span>
          )}
          {task.assignee && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <User className="h-3 w-3" />{task.assignee}
            </span>
          )}
          {task.tags?.map((t) => (
            <span key={t} className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <TagIcon className="h-3 w-3" />{t}
            </span>
          ))}
        </div>
      </div>
      {task.children.map((child) => (
        <TaskNode key={child.id} task={child} depth={depth + 1} />
      ))}
    </div>
  );
}

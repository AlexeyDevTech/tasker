'use client';

import { useState } from 'react';
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
import { Card, CardContent } from '@/components/ui/card';
import { parseBulkText, ParsedProject } from '@/lib/bulk-parser';
import { 
  Loader2, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Copy,
  Trash2,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BulkImportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: ParsedProject[]) => void;
}

const exampleText = `# Веб-сайт компании
- Дизайн макета
  - Главная страница
  - Страница контактов
- Разработка
  - Верстка
  - Интеграция с API
- Тестирование

# Мобильное приложение
- Прототип
- Дизайн UI
- Разработка`;

export function BulkImportForm({ open, onOpenChange, onImport }: BulkImportFormProps) {
  const [inputText, setInputText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ParsedProject[] | null>(null);

  const handleParsePreview = () => {
    if (!inputText.trim()) {
      setPreview(null);
      return;
    }
    
    try {
      const parsed = parseBulkText(inputText);
      setPreview(parsed);
      setError(null);
    } catch (e: any) {
      setError(e.message);
      setPreview(null);
    }
  };
  
  const handleImportClick = () => {
    setIsParsing(true);
    setError(null);
    try {
      const parsedData = parseBulkText(inputText);
      onImport(parsedData);
      handleClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleInsertExample = () => {
    setInputText(exampleText);
    setTimeout(handleParsePreview, 100);
  };

  const handleClear = () => {
    setInputText('');
    setPreview(null);
    setError(null);
  };
  
  const handleClose = () => {
    onOpenChange(false);
  };

  // Count stats
  const projectCount = preview?.length || 0;
  const taskCount = preview?.reduce((acc, p) => acc + p.tasks.length, 0) || 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 bg-card/95 backdrop-blur-xl border-border/50">
        {/* Header */}
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Массовое создание из текста</DialogTitle>
              <DialogDescription className="mt-1">
                Вставьте структуру проекта в текстовом формате для быстрого импорта
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 grid grid-cols-2 gap-6">
          {/* Left side - Input */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Структура проекта</Label>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs gap-1.5"
                  onClick={handleInsertExample}
                >
                  <Copy className="h-3 w-3" />
                  Пример
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs gap-1.5 text-destructive hover:text-destructive"
                  onClick={handleClear}
                  disabled={!inputText}
                >
                  <Trash2 className="h-3 w-3" />
                  Очистить
                </Button>
              </div>
            </div>
            
            <Textarea
              placeholder={`# Название проекта
- Задача 1
  - Подзадача
- Задача 2`}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setError(null);
              }}
              onBlur={handleParsePreview}
              className="h-80 font-mono text-sm resize-none border-border/60 focus:border-primary/50 bg-muted/30"
            />

            {/* Format help */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs font-normal border-border/50">
                <span className="text-primary mr-1">#</span> Проект
              </Badge>
              <Badge variant="outline" className="text-xs font-normal border-border/50">
                <span className="text-primary mr-1">-</span> Задача
              </Badge>
              <Badge variant="outline" className="text-xs font-normal border-border/50">
                <span className="text-muted-foreground mr-1">  </span> Отступ = вложенность
              </Badge>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Right side - Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Предпросмотр</Label>
              {preview && preview.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="font-medium">
                    {projectCount} {projectCount === 1 ? 'проект' : projectCount < 5 ? 'проекта' : 'проектов'}
                  </Badge>
                  <Badge variant="secondary" className="font-medium">
                    {taskCount} {taskCount === 1 ? 'задача' : taskCount < 5 ? 'задачи' : 'задач'}
                  </Badge>
                </div>
              )}
            </div>

            <div className="h-80 rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
              {preview && preview.length > 0 ? (
                <div className="h-full overflow-y-auto p-4 space-y-4">
                  {preview.map((project, index) => (
                    <Card key={index} className="border-border/50 bg-card/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-semibold">{project.name}</span>
                          <Badge variant="outline" className="ml-auto text-xs">
                            {project.tasks.length} задач
                          </Badge>
                        </div>
                        
                        {project.tasks.length > 0 && (
                          <div className="space-y-1 ml-4">
                            {project.tasks.slice(0, 5).map((task, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                                <span className={cn(task.level === 1 && "ml-3")}>
                                  {task.title}
                                </span>
                              </div>
                            ))}
                            {project.tasks.length > 5 && (
                              <span className="text-xs text-muted-foreground ml-3">
                                + ещё {project.tasks.length - 5} задач
                              </span>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4">
                  <Info className="h-10 w-10 mb-3 opacity-50" />
                  <p className="text-sm text-center">
                    Введите текст слева, чтобы увидеть предпросмотр
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 border-t border-border/50">
          <Button variant="outline" onClick={handleClose}>Отмена</Button>
          <Button 
            onClick={handleImportClick} 
            disabled={isParsing || !inputText.trim() || !!error}
            className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
          >
            {isParsing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Импорт...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Импортировать
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

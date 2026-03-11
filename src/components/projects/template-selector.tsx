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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { templateCategories } from '@/lib/templates';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  CalendarIcon, 
  Check, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ListTodo,
  Milestone,
  Clock,
  Zap,
  Layout,
  FileText,
} from 'lucide-react';
import type { ProjectTemplate } from '@/lib/templates';

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: ProjectTemplate[];
  onSelect: (data: {
    name: string;
    description?: string;
    templateId?: string;
    startDate?: Date;
    endDate?: Date;
  }) => void;
}

export function TemplateSelector({ open, onOpenChange, templates, onSelect }: TemplateSelectorProps) {
  const [step, setStep] = useState<'template' | 'details'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  const filteredTemplates = selectedCategory 
    ? templates.filter((t) => t.category === selectedCategory)
    : templates;

  const handleNext = () => {
    if (step === 'template') {
      setStep('details');
    } else {
      onSelect({
        name,
        description,
        templateId: selectedTemplate?.id,
        startDate,
        endDate,
      });
      resetForm();
    }
  };

  const handleBack = () => {
    setStep('template');
  };

  const resetForm = () => {
    setStep('template');
    setSelectedTemplate(null);
    setSelectedCategory(null);
    setName('');
    setDescription('');
    setStartDate(undefined);
    setEndDate(undefined);
    onOpenChange(false);
  };

  const handleSkipTemplate = () => {
    setSelectedTemplate(null);
    setStep('details');
  };

  const handleSelectTemplate = (template: ProjectTemplate | null) => {
    setSelectedTemplate(template);
    if (template) {
      setName(template.name);
      setDescription(template.description || '');
    }
  };

  return (
    <Dialog open={open} onOpenChange={resetForm}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 gap-0 bg-card/95 backdrop-blur-xl border-border/50">
        {/* Header */}
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Создать новый проект</DialogTitle>
              <DialogDescription className="mt-1">
                {step === 'template' 
                  ? 'Выберите шаблон для быстрого старта или создайте пустой проект'
                  : 'Укажите название и настройки проекта'}
              </DialogDescription>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mt-4">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              step === 'template' 
                ? "bg-primary/10 text-primary" 
                : "bg-muted text-muted-foreground"
            )}>
              {step === 'template' ? (
                <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
              ) : (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              )}
              Шаблон
            </div>
            <div className={cn(
              "h-px w-8",
              step === 'details' ? "bg-primary" : "bg-border"
            )} />
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              step === 'details' 
                ? "bg-primary/10 text-primary" 
                : "bg-muted text-muted-foreground"
            )}>
              <span className={cn(
                "h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold",
                step === 'details' 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted-foreground/20 text-muted-foreground"
              )}>2</span>
              Настройки
            </div>
          </div>
        </DialogHeader>

        {step === 'template' ? (
          <div className="p-6">
            {/* Category filters */}
            <div className="flex flex-wrap gap-2 mb-5">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="rounded-full"
              >
                <Layout className="h-4 w-4 mr-1.5" />
                Все
              </Button>
              {templateCategories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="rounded-full"
                >
                  {cat.icon} {cat.name}
                </Button>
              ))}
            </div>

            {/* Templates grid */}
            <ScrollArea className="h-[380px] pr-4">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Blank project option */}
                <Card 
                  className={cn(
                    "cursor-pointer transition-all duration-200 border-2 hover:shadow-lg group",
                    !selectedTemplate 
                      ? "border-primary bg-primary/5 shadow-md" 
                      : "border-border/50 hover:border-primary/50"
                  )}
                  onClick={handleSkipTemplate}
                  onMouseEnter={() => setHoveredTemplate('blank')}
                  onMouseLeave={() => setHoveredTemplate(null)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        ➕
                      </div>
                      {!selectedTemplate && (
                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <h4 className="font-semibold mb-1">Пустой проект</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      Создать проект с нуля без шаблона
                    </p>
                  </CardContent>
                </Card>

                {/* Template options */}
                {filteredTemplates.map((template) => (
                  <Card 
                    key={template.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 border-2 hover:shadow-lg group",
                      selectedTemplate?.id === template.id 
                        ? "border-primary bg-primary/5 shadow-md" 
                        : "border-border/50 hover:border-primary/50"
                    )}
                    onClick={() => handleSelectTemplate(template)}
                    onMouseEnter={() => setHoveredTemplate(template.id)}
                    onMouseLeave={() => setHoveredTemplate(null)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div 
                          className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
                          style={{ backgroundColor: `${template.color}20` }}
                        >
                          {template.icon}
                        </div>
                        {selectedTemplate?.id === template.id && (
                          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <h4 className="font-semibold mb-1 line-clamp-1">{template.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] font-medium gap-1">
                          <ListTodo className="h-3 w-3" />
                          {template.structure.tasks.length} задач
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] font-medium gap-1">
                          <Milestone className="h-3 w-3" />
                          {template.structure.milestones.length} этапов
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Selected template preview */}
            {selectedTemplate && (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                <div 
                  className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${selectedTemplate.color}20` }}
                >
                  {selectedTemplate.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{selectedTemplate.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedTemplate.structure.tasks.length} задач будет создано автоматически
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleBack}>
                  Изменить
                </Button>
              </div>
            )}

            <div className="grid gap-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Название проекта *</Label>
                <Input
                  id="name"
                  placeholder="Введите название проекта..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 border-border/60 focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Описание</Label>
                <Textarea
                  id="description"
                  placeholder="Краткое описание проекта..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="resize-none border-border/60 focus:border-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Дата начала</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-11 justify-start text-left font-normal border-border/60">
                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        {startDate ? format(startDate, 'd MMMM yyyy', { locale: ru }) : <span className="text-muted-foreground">Выберите дату</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Дата окончания</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-11 justify-start text-left font-normal border-border/60">
                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        {endDate ? format(endDate, 'd MMMM yyyy', { locale: ru }) : <span className="text-muted-foreground">Выберите дату</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Quick date options */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Быстрый выбор:</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={() => {
                    setStartDate(new Date());
                    setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
                  }}
                >
                  1 неделя
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={() => {
                    setStartDate(new Date());
                    setEndDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
                  }}
                >
                  2 недели
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={() => {
                    setStartDate(new Date());
                    setEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
                  }}
                >
                  1 месяц
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="p-6 pt-4 border-t border-border/50">
          {step === 'details' && (
            <Button variant="outline" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" onClick={resetForm}>
            Отмена
          </Button>
          <Button 
            onClick={handleNext}
            disabled={step === 'details' && !name.trim()}
            className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
          >
            {step === 'template' ? (
              <>
                Далее
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Создать проект
                <Check className="h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

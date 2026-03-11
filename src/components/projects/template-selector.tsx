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

  return (
    <Dialog open={open} onOpenChange={resetForm}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            Создать новый проект
          </DialogTitle>
          <DialogDescription>
            {step === 'template' 
              ? 'Выберите шаблон для быстрого старта или создайте пустой проект'
              : 'Укажите название и настройки проекта'}
          </DialogDescription>
        </DialogHeader>

        {step === 'template' ? (
          <div className="p-6">
            {/* Category filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Все
              </Button>
              {templateCategories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.icon} {cat.name}
                </Button>
              ))}
            </div>

            {/* Templates grid */}
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Blank project option */}
                <Card 
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md border-2",
                    !selectedTemplate ? "border-primary" : "border-transparent"
                  )}
                  onClick={handleSkipTemplate}
                >
                  <CardContent className="p-4 text-center">
                    <div className="h-12 w-12 mx-auto mb-3 rounded-xl bg-muted flex items-center justify-center text-2xl">
                      ➕
                    </div>
                    <h4 className="font-medium mb-1">Пустой проект</h4>
                    <p className="text-xs text-muted-foreground">
                      Создать проект без шаблона
                    </p>
                  </CardContent>
                </Card>

                {/* Template options */}
                {filteredTemplates.map((template) => (
                  <Card 
                    key={template.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md border-2",
                      selectedTemplate?.id === template.id ? "border-primary" : "border-transparent"
                    )}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardContent className="p-4">
                      <div 
                        className="h-12 w-12 mb-3 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${template.color}20` }}
                      >
                        {template.icon}
                      </div>
                      <h4 className="font-medium mb-1 line-clamp-1">{template.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {template.description}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {template.structure.tasks.length} задач
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
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
          <div className="p-6 space-y-4">
            {/* Selected template preview */}
            {selectedTemplate && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-4">
                <div 
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${selectedTemplate.color}20` }}
                >
                  {selectedTemplate.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{selectedTemplate.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedTemplate.structure.tasks.length} задач будет создано
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleBack}>
                  Изменить
                </Button>
              </div>
            )}

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название проекта *</Label>
                <Input
                  id="name"
                  placeholder="Мой новый проект"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  placeholder="Краткое описание проекта..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Дата начала</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'd MMMM yyyy', { locale: ru }) : 'Выберите дату'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
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
                  <Label>Дата окончания</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'd MMMM yyyy', { locale: ru }) : 'Выберите дату'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
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
            </div>
          </div>
        )}

        <DialogFooter className="p-6 pt-0 border-t">
          {step === 'details' && (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад
            </Button>
          )}
          <Button 
            onClick={handleNext}
            disabled={step === 'details' && !name.trim()}
          >
            {step === 'template' ? (
              <>
                Далее
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Создать проект
                <Check className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

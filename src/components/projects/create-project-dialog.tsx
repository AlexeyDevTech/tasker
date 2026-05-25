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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarIcon, Check, FolderPlus } from 'lucide-react';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (data: {
    name: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
  }) => void;
}

const DAY = 24 * 60 * 60 * 1000;

export function CreateProjectDialog({ open, onOpenChange, onSelect }: CreateProjectDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const reset = () => {
    setName('');
    setDescription('');
    setStartDate(undefined);
    setEndDate(undefined);
    onOpenChange(false);
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    onSelect({ name, description, startDate, endDate });
    reset();
  };

  const applyRange = (days: number) => {
    setStartDate(new Date());
    setEndDate(new Date(Date.now() + days * DAY));
  };

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogContent className="max-w-lg p-0 gap-0 bg-card border-border/50">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/30">
              <FolderPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Новый проект</DialogTitle>
              <DialogDescription className="mt-1">Название, описание и сроки</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Название проекта *</Label>
            <Input
              id="name"
              placeholder="Введите название проекта..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
              autoFocus
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
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
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
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Быстрый выбор:</span>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => applyRange(7)}>1 неделя</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => applyRange(14)}>2 недели</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => applyRange(30)}>1 месяц</Button>
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 border-t border-border/50">
          <Button variant="outline" onClick={reset}>Отмена</Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
          >
            Создать проект
            <Check className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

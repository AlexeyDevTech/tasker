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
import { parseBulkText, ParsedProject } from '@/lib/bulk-parser';
import { Loader2, Upload } from 'lucide-react';

interface BulkImportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: ParsedProject[]) => void;
}

export function BulkImportForm({ open, onOpenChange, onImport }: BulkImportFormProps) {
  const [inputText, setInputText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImportClick = () => {
    setIsParsing(true);
    setError(null);
    try {
      const parsedData = parseBulkText(inputText);
      onImport(parsedData);
      handleClose(); // Close on success
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsParsing(false);
    }
  };
  
  const handleClose = () => {
    // Don't clear text on close, user might want to fix it
    // setInputText('');
    // setError(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Массовое создание из текста</DialogTitle>
          <DialogDescription>
            Вставьте или напишите структуру вашего проекта. Используйте `#` для проектов и `-` для задач. Отступы создают вложенность.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid w-full gap-2">
            <Label htmlFor="project-structure">Структура проекта</Label>
            <Textarea
              id="project-structure"
              placeholder={`# Мой новый проект
- Первая задача
  - Подзадача
- Вторая задача`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="h-64 font-mono"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Отмена</Button>
          <Button onClick={handleImportClick} disabled={isParsing || !inputText.trim()}>
            {isParsing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Импортировать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

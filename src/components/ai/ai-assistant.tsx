'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  Lightbulb, 
  Calendar, 
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIAssistantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: any;
  tasks?: any[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
}

const quickActions = [
  { icon: Lightbulb, label: 'Помоги спланировать спринт', action: 'plan_sprint' },
  { icon: Calendar, label: 'Оптимизируй сроки', action: 'optimize_timeline' },
  { icon: AlertTriangle, label: 'Найди риски', action: 'find_risks' },
  { icon: CheckCircle2, label: 'Предложи декомпозицию задач', action: 'decompose_tasks' },
];

export function AIAssistant({ open, onOpenChange, project, tasks = [] }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Привет! 👋 Я AI-ассистент TaskFlow. Могу помочь с планированием проекта "${project?.name || 'проект'}".\n\nВыберите быстрое действие или задайте вопрос.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        'plan_sprint': generatePlanSprintResponse(),
        'optimize_timeline': generateOptimizeResponse(),
        'find_risks': generateRisksResponse(),
        'decompose_tasks': generateDecomposeResponse(),
      };

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[input] || generateDefaultResponse(input, tasks),
        suggestions: ['Создать подзадачи', 'Обновить сроки', 'Назначить ответственных'],
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
    handleSend();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            AI Ассистент
          </SheetTitle>
          <SheetDescription>
            Умный помощник для планирования проектов
          </SheetDescription>
        </SheetHeader>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2 py-4">
          {quickActions.map((action) => (
            <Button
              key={action.action}
              variant="outline"
              className="justify-start h-auto py-2 px-3"
              onClick={() => handleQuickAction(action.action)}
            >
              <action.icon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-xs text-left">{action.label}</span>
            </Button>
          ))}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' && 'justify-end'
                )}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                      <Sparkles className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'rounded-lg px-3 py-2 max-w-[85%]',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {message.suggestions && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
                      {message.suggestions.map((suggestion, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="cursor-pointer hover:bg-secondary/80"
                        >
                          {suggestion}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                    <Sparkles className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2 pt-4 border-t">
          <Input
            placeholder="Задайте вопрос..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Response generators
function generatePlanSprintResponse(): string {
  return `Анализ проекта завершён! 📊

**Рекомендации по спринту:**

1. **Приоритетные задачи:**
   - Завершить задачу "Backend разработка" (высокий приоритет)
   - Начать тестирование модуля авторизации

2. **Риски:**
   - Задача "UI дизайн" может задержать старт frontend-разработки
   - Рекомендую добавить буфер 2-3 дня

3. **Предложения:**
   - Распределить задачи между 2 разработчиками
   - Запланировать daily-митинги

Хотите, чтобы я создал детальный план на неделю?`;
}

function generateOptimizeResponse(): string {
  return `Проанализировал зависимости между задачами! 📅

**Оптимизация сроков:**

✅ Можно параллелить:
- Frontend и Backend разработку
- Написание тестов параллельно с разработкой

⚠️ Критический путь:
1. Проектирование → 2. Backend → 3. Интеграция → 4. Тестирование

💡 Предложение:
Сократить общие сроки на 15% за счёт параллельной работы команд.

Хотите применить оптимизацию?`;
}

function generateRisksResponse(): string {
  return `Обнаружены потенциальные риски! ⚠️

**Высокий риск:**
- Дедлайн проекта через 14 дней
- 3 задачи с высоким приоритетом не начаты
- Нет ответственного за задачу "Тестирование"

**Средний риск:**
- 2 задачи зависят от одной (узкое место)
- Оценка времени для "Frontend" может быть занижена

**Рекомендации:**
1. Назначить ответственного на все задачи
2. Пересмотреть оценки для сложных задач
3. Добавить буферное время перед релизом`;
}

function generateDecomposeResponse(): string {
  return `Предлагаю декомпозицию для крупных задач! 📝

**"Backend разработка" можно разбить на:**
├── Настройка API endpoints (4ч)
├── Работа с базой данных (8ч)
├── Авторизация и аутентификация (6ч)
├── Интеграция с внешними сервисами (4ч)
└── Написание документации API (2ч)

**"Тестирование" можно разбить на:**
├── Unit тесты (4ч)
├── Integration тесты (3ч)
├── E2E тесты (4ч)
└── Исправление найденных багов (бюджет: 3ч)

Хотите создать эти подзадачи?`;
}

function generateDefaultResponse(input: string, tasks: any[]): string {
  return `Понял ваш запрос! 🤔

Проанализировал проект:
- ${tasks.length} задач в проекте
- ${tasks.filter(t => t.status === 'done').length} выполнено
- ${tasks.filter(t => t.status === 'in-progress').length} в работе

Могу помочь с:
- Планированием сроков
- Распределением нагрузки
- Поиском узких мест
- Декомпозицией задач

Уточните, что именно нужно сделать?`;
}

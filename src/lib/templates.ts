// Project Templates
import type { TemplateStructure, TaskPriority } from '@/types';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  structure: TemplateStructure;
}

// Default templates
export const defaultTemplates: ProjectTemplate[] = [
  {
    id: 'software-development',
    name: 'Разработка ПО',
    description: 'Полный цикл разработки программного обеспечения',
    category: 'software',
    icon: '💻',
    color: '#3b82f6',
    structure: {
      tasks: [
        {
          title: 'Планирование и анализ требований',
          description: 'Сбор и анализ требований, создание спецификаций',
          priority: 'high' as TaskPriority,
          estimatedHours: 20,
          subtasks: [
            { title: 'Сбор требований от стейкхолдеров', estimatedHours: 8 },
            { title: 'Анализ конкурентов', estimatedHours: 4 },
            { title: 'Создание документации требований', estimatedHours: 8 },
          ],
        },
        {
          title: 'Проектирование архитектуры',
          description: 'Проектирование технической архитектуры решения',
          priority: 'high' as TaskPriority,
          estimatedHours: 16,
          subtasks: [
            { title: 'Выбор технологий и стека', estimatedHours: 4 },
            { title: 'Создание схем архитектуры', estimatedHours: 8 },
            { title: 'Code review процесса', estimatedHours: 4 },
          ],
        },
        {
          title: 'Разработка UI/UX дизайна',
          priority: 'medium' as TaskPriority,
          estimatedHours: 24,
          subtasks: [
            { title: 'Создание wireframes', estimatedHours: 8 },
            { title: 'Дизайн интерфейса', estimatedHours: 12 },
            { title: 'Прототипирование', estimatedHours: 4 },
          ],
        },
        {
          title: 'Backend разработка',
          priority: 'high' as TaskPriority,
          estimatedHours: 80,
          subtasks: [
            { title: 'Настройка инфраструктуры', estimatedHours: 8 },
            { title: 'Разработка API', estimatedHours: 32 },
            { title: 'Работа с базой данных', estimatedHours: 16 },
            { title: 'Интеграция сервисов', estimatedHours: 24 },
          ],
        },
        {
          title: 'Frontend разработка',
          priority: 'high' as TaskPriority,
          estimatedHours: 60,
          subtasks: [
            { title: 'Настройка проекта', estimatedHours: 4 },
            { title: 'Разработка компонентов', estimatedHours: 32 },
            { title: 'Интеграция с API', estimatedHours: 16 },
            { title: 'Оптимизация производительности', estimatedHours: 8 },
          ],
        },
        {
          title: 'Тестирование',
          priority: 'high' as TaskPriority,
          estimatedHours: 32,
          subtasks: [
            { title: 'Unit тесты', estimatedHours: 12 },
            { title: 'Integration тесты', estimatedHours: 8 },
            { title: 'E2E тесты', estimatedHours: 8 },
            { title: 'Исправление багов', estimatedHours: 4 },
          ],
        },
        {
          title: 'Деплой и релиз',
          priority: 'high' as TaskPriority,
          estimatedHours: 8,
          subtasks: [
            { title: 'Подготовка окружения', estimatedHours: 2 },
            { title: 'CI/CD настройка', estimatedHours: 4 },
            { title: 'Мониторинг', estimatedHours: 2 },
          ],
        },
      ],
      milestones: [
        { title: 'Требования утверждены', date: 7, color: '#22c55e' },
        { title: 'Дизайн готов', date: 21, color: '#f59e0b' },
        { title: 'MVP готов', date: 45, color: '#3b82f6' },
        { title: 'Релиз', date: 60, color: '#ef4444' },
      ],
      dependencies: [
        { taskIndex: 1, dependsOnIndex: 0, type: 'finish-to-start' },
        { taskIndex: 2, dependsOnIndex: 0, type: 'finish-to-start' },
        { taskIndex: 3, dependsOnIndex: 1, type: 'finish-to-start' },
        { taskIndex: 4, dependsOnIndex: 2, type: 'finish-to-start' },
        { taskIndex: 5, dependsOnIndex: 3, type: 'finish-to-start' },
        { taskIndex: 5, dependsOnIndex: 4, type: 'finish-to-start' },
        { taskIndex: 6, dependsOnIndex: 5, type: 'finish-to-start' },
      ],
    },
  },
  {
    id: 'marketing-campaign',
    name: 'Маркетинговая кампания',
    description: 'Запуск и управление маркетинговой кампанией',
    category: 'marketing',
    icon: '📢',
    color: '#f59e0b',
    structure: {
      tasks: [
        {
          title: 'Исследование рынка',
          priority: 'high' as TaskPriority,
          estimatedHours: 16,
          subtasks: [
            { title: 'Анализ целевой аудитории' },
            { title: 'Конкурентный анализ' },
            { title: 'SWOT анализ' },
          ],
        },
        {
          title: 'Разработка стратегии',
          priority: 'high' as TaskPriority,
          estimatedHours: 12,
          subtasks: [
            { title: 'Определение KPI' },
            { title: 'Выбор каналов продвижения' },
            { title: 'Бюджетирование' },
          ],
        },
        {
          title: 'Создание контента',
          priority: 'medium' as TaskPriority,
          estimatedHours: 40,
          subtasks: [
            { title: 'Копирайтинг' },
            { title: 'Дизайн материалов' },
            { title: 'Видео продакшн' },
          ],
        },
        {
          title: 'Настройка рекламных кампаний',
          priority: 'high' as TaskPriority,
          estimatedHours: 16,
        },
        {
          title: 'Запуск и мониторинг',
          priority: 'high' as TaskPriority,
          estimatedHours: 24,
        },
        {
          title: 'Анализ результатов',
          priority: 'medium' as TaskPriority,
          estimatedHours: 8,
        },
      ],
      milestones: [
        { title: 'Стратегия утверждена', date: 7, color: '#22c55e' },
        { title: 'Контент готов', date: 21, color: '#f59e0b' },
        { title: 'Запуск кампании', date: 28, color: '#3b82f6' },
        { title: 'Финальный отчёт', date: 60, color: '#ef4444' },
      ],
      dependencies: [
        { taskIndex: 1, dependsOnIndex: 0, type: 'finish-to-start' },
        { taskIndex: 2, dependsOnIndex: 1, type: 'finish-to-start' },
        { taskIndex: 3, dependsOnIndex: 2, type: 'finish-to-start' },
        { taskIndex: 4, dependsOnIndex: 3, type: 'finish-to-start' },
        { taskIndex: 5, dependsOnIndex: 4, type: 'finish-to-start' },
      ],
    },
  },
  {
    id: 'product-launch',
    name: 'Запуск продукта',
    description: 'Подготовка и запуск нового продукта на рынок',
    category: 'product',
    icon: '🚀',
    color: '#ef4444',
    structure: {
      tasks: [
        {
          title: 'Валидация продукта',
          priority: 'high' as TaskPriority,
          estimatedHours: 20,
        },
        {
          title: 'Подготовка landing page',
          priority: 'high' as TaskPriority,
          estimatedHours: 24,
        },
        {
          title: 'Создание контента для запуска',
          priority: 'medium' as TaskPriority,
          estimatedHours: 32,
        },
        {
          title: 'Настройка аналитики',
          priority: 'medium' as TaskPriority,
          estimatedHours: 8,
        },
        {
          title: 'Email кампания',
          priority: 'high' as TaskPriority,
          estimatedHours: 12,
        },
        {
          title: 'PR и media outreach',
          priority: 'medium' as TaskPriority,
          estimatedHours: 16,
        },
        {
          title: 'Launch day координация',
          priority: 'urgent' as TaskPriority,
          estimatedHours: 8,
        },
        {
          title: 'Пост-релиз анализ',
          priority: 'medium' as TaskPriority,
          estimatedHours: 8,
        },
      ],
      milestones: [
        { title: 'Продукт готов', date: 14, color: '#22c55e' },
        { title: 'Материалы готовы', date: 21, color: '#f59e0b' },
        { title: 'Launch Day', date: 30, color: '#ef4444' },
        { title: 'Анализ первых результатов', date: 37, color: '#3b82f6' },
      ],
      dependencies: [
        { taskIndex: 1, dependsOnIndex: 0, type: 'finish-to-start' },
        { taskIndex: 2, dependsOnIndex: 0, type: 'finish-to-start' },
        { taskIndex: 3, dependsOnIndex: 2, type: 'finish-to-start' },
        { taskIndex: 4, dependsOnIndex: 3, type: 'finish-to-start' },
        { taskIndex: 5, dependsOnIndex: 3, type: 'finish-to-start' },
        { taskIndex: 6, dependsOnIndex: 4, type: 'finish-to-start' },
        { taskIndex: 6, dependsOnIndex: 5, type: 'finish-to-start' },
        { taskIndex: 7, dependsOnIndex: 6, type: 'finish-to-start' },
      ],
    },
  },
  {
    id: 'video-production',
    name: 'Съёмка видео',
    description: 'Полный цикл производства видеоролика',
    category: 'content',
    icon: '🎬',
    color: '#8b5cf6',
    structure: {
      tasks: [
        {
          title: 'Разработка концепции',
          priority: 'high' as TaskPriority,
          estimatedHours: 8,
        },
        {
          title: 'Написание сценария',
          priority: 'high' as TaskPriority,
          estimatedHours: 16,
        },
        {
          title: 'Подготовка к съёмке',
          priority: 'high' as TaskPriority,
          estimatedHours: 24,
          subtasks: [
            { title: 'Кастинг актёров' },
            { title: 'Подбор локации' },
            { title: 'Подготовка оборудования' },
          ],
        },
        {
          title: 'Съёмка',
          priority: 'urgent' as TaskPriority,
          estimatedHours: 16,
        },
        {
          title: 'Монтаж',
          priority: 'high' as TaskPriority,
          estimatedHours: 32,
        },
        {
          title: 'Звуковой дизайн',
          priority: 'medium' as TaskPriority,
          estimatedHours: 12,
        },
        {
          title: 'Цветокоррекция',
          priority: 'medium' as TaskPriority,
          estimatedHours: 8,
        },
        {
          title: 'Финальный рендер и экспорт',
          priority: 'medium' as TaskPriority,
          estimatedHours: 4,
        },
      ],
      milestones: [
        { title: 'Сценарий утверждён', date: 7, color: '#22c55e' },
        { title: 'Съёмка завершена', date: 21, color: '#f59e0b' },
        { title: 'Черновой монтаж готов', date: 28, color: '#8b5cf6' },
        { title: 'Финальная версия', date: 35, color: '#ef4444' },
      ],
      dependencies: [
        { taskIndex: 1, dependsOnIndex: 0, type: 'finish-to-start' },
        { taskIndex: 2, dependsOnIndex: 1, type: 'finish-to-start' },
        { taskIndex: 3, dependsOnIndex: 2, type: 'finish-to-start' },
        { taskIndex: 4, dependsOnIndex: 3, type: 'finish-to-start' },
        { taskIndex: 5, dependsOnIndex: 4, type: 'finish-to-start' },
        { taskIndex: 6, dependsOnIndex: 4, type: 'finish-to-start' },
        { taskIndex: 7, dependsOnIndex: 5, type: 'finish-to-start' },
        { taskIndex: 7, dependsOnIndex: 6, type: 'finish-to-start' },
      ],
    },
  },
  {
    id: 'design-project',
    name: 'Дизайн-проект',
    description: 'Разработка дизайн-проекта (брендинг, UI/UX)',
    category: 'design',
    icon: '🎨',
    color: '#ec4899',
    structure: {
      tasks: [
        {
          title: 'Бриф и исследование',
          priority: 'high' as TaskPriority,
          estimatedHours: 12,
        },
        {
          title: 'Создание мудборда',
          priority: 'medium' as TaskPriority,
          estimatedHours: 6,
        },
        {
          title: 'Разработка концепций',
          priority: 'high' as TaskPriority,
          estimatedHours: 20,
        },
        {
          title: 'Дизайн логотипа',
          priority: 'high' as TaskPriority,
          estimatedHours: 16,
        },
        {
          title: 'Дизайн UI компонентов',
          priority: 'high' as TaskPriority,
          estimatedHours: 32,
        },
        {
          title: 'Создание гайдлайна',
          priority: 'medium' as TaskPriority,
          estimatedHours: 12,
        },
        {
          title: 'Подготовка файлов',
          priority: 'low' as TaskPriority,
          estimatedHours: 4,
        },
      ],
      milestones: [
        { title: 'Концепции представлены', date: 10, color: '#f59e0b' },
        { title: 'Логотип утверждён', date: 18, color: '#22c55e' },
        { title: 'UI готов', date: 30, color: '#ec4899' },
        { title: 'Файлы переданы', date: 35, color: '#3b82f6' },
      ],
      dependencies: [
        { taskIndex: 1, dependsOnIndex: 0, type: 'finish-to-start' },
        { taskIndex: 2, dependsOnIndex: 1, type: 'finish-to-start' },
        { taskIndex: 3, dependsOnIndex: 2, type: 'finish-to-start' },
        { taskIndex: 4, dependsOnIndex: 2, type: 'finish-to-start' },
        { taskIndex: 5, dependsOnIndex: 3, type: 'finish-to-start' },
        { taskIndex: 5, dependsOnIndex: 4, type: 'finish-to-start' },
        { taskIndex: 6, dependsOnIndex: 5, type: 'finish-to-start' },
      ],
    },
  },
  {
    id: 'content-plan',
    name: 'Контент-план',
    description: 'Создание контент-плана на месяц',
    category: 'content',
    icon: '📝',
    color: '#22c55e',
    structure: {
      tasks: [
        {
          title: 'Анализ текущего контента',
          priority: 'medium' as TaskPriority,
          estimatedHours: 8,
        },
        {
          title: 'Определение контент-стратегии',
          priority: 'high' as TaskPriority,
          estimatedHours: 12,
        },
        {
          title: 'Создание контент-календаря',
          priority: 'high' as TaskPriority,
          estimatedHours: 8,
        },
        {
          title: 'Написание постов',
          priority: 'high' as TaskPriority,
          estimatedHours: 40,
        },
        {
          title: 'Создание визуалов',
          priority: 'medium' as TaskPriority,
          estimatedHours: 24,
        },
        {
          title: 'Настройка автопостинга',
          priority: 'low' as TaskPriority,
          estimatedHours: 4,
        },
      ],
      milestones: [
        { title: 'Стратегия определена', date: 5, color: '#22c55e' },
        { title: 'Календарь готов', date: 10, color: '#f59e0b' },
        { title: 'Контент написан', date: 25, color: '#3b82f6' },
        { title: 'Всё готово к публикации', date: 30, color: '#ef4444' },
      ],
      dependencies: [
        { taskIndex: 1, dependsOnIndex: 0, type: 'finish-to-start' },
        { taskIndex: 2, dependsOnIndex: 1, type: 'finish-to-start' },
        { taskIndex: 3, dependsOnIndex: 2, type: 'finish-to-start' },
        { taskIndex: 4, dependsOnIndex: 2, type: 'finish-to-start' },
        { taskIndex: 5, dependsOnIndex: 3, type: 'finish-to-start' },
        { taskIndex: 5, dependsOnIndex: 4, type: 'finish-to-start' },
      ],
    },
  },
  {
    id: 'personal-rebrand',
    name: 'Личный ребрендинг',
    description: 'Обновление личного бренда и позиционирования',
    category: 'personal',
    icon: '✨',
    color: '#06b6d4',
    structure: {
      tasks: [
        {
          title: 'Анализ текущего бренда',
          priority: 'high' as TaskPriority,
          estimatedHours: 8,
        },
        {
          title: 'Определение нового позиционирования',
          priority: 'high' as TaskPriority,
          estimatedHours: 12,
        },
        {
          title: 'Обновление визуальной идентичности',
          priority: 'medium' as TaskPriority,
          estimatedHours: 16,
        },
        {
          title: 'Обновление соцсетей',
          priority: 'medium' as TaskPriority,
          estimatedHours: 8,
        },
        {
          title: 'Обновление портфолио',
          priority: 'high' as TaskPriority,
          estimatedHours: 20,
        },
        {
          title: 'Анонс изменений',
          priority: 'medium' as TaskPriority,
          estimatedHours: 4,
        },
      ],
      milestones: [
        { title: 'Позиционирование определено', date: 7, color: '#22c55e' },
        { title: 'Визуал обновлён', date: 14, color: '#06b6d4' },
        { title: 'Портфолио готово', date: 28, color: '#f59e0b' },
        { title: 'Ребрендинг завершён', date: 30, color: '#ef4444' },
      ],
      dependencies: [
        { taskIndex: 1, dependsOnIndex: 0, type: 'finish-to-start' },
        { taskIndex: 2, dependsOnIndex: 1, type: 'finish-to-start' },
        { taskIndex: 3, dependsOnIndex: 1, type: 'finish-to-start' },
        { taskIndex: 4, dependsOnIndex: 2, type: 'finish-to-start' },
        { taskIndex: 4, dependsOnIndex: 3, type: 'finish-to-start' },
        { taskIndex: 5, dependsOnIndex: 4, type: 'finish-to-start' },
      ],
    },
  },
];

export const templateCategories = [
  { id: 'software', name: 'Разработка', icon: '💻' },
  { id: 'marketing', name: 'Маркетинг', icon: '📢' },
  { id: 'product', name: 'Продукт', icon: '🚀' },
  { id: 'design', name: 'Дизайн', icon: '🎨' },
  { id: 'content', name: 'Контент', icon: '📝' },
  { id: 'personal', name: 'Личное', icon: '✨' },
];

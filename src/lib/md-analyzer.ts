// MD-анализатор: разбирает Markdown в дерево проектов → задач → подзадач
// с метаданными. Единый источник для формы импорта и API.
//
// Диалект:
//   # Проект                      H1 — граница проекта
//   > Описание проекта            строка(и) после H1 до первой задачи
//   ## Раздел                     H2–H6 — задача-секция (вложенность = уровень−2)
//   - [ ] Задача !high @ivan due:2026-06-01 ~4h +backend
//         ^ список/чекбокс — задача; отступ = вложенность
//     Описание задачи             строка-продолжение под задачей
//
// Токены в строке задачи:
//   [ ] [x] [~] [>] [-]  → статус todo / done / in-progress / review / cancelled
//   !urgent !high !medium(!med) !low → приоритет
//   @имя                 → исполнитель (резолвится на сервере)
//   due:ГГГГ-ММ-ДД | due:today | due:tomorrow → срок
//   ~Nh | ~Nd (ч/д)      → оценка в часах (д = ×8)
//   +тег                 → тег

export type ParsedPriority = 'urgent' | 'high' | 'medium' | 'low';
export type ParsedStatus = 'todo' | 'in-progress' | 'review' | 'done' | 'cancelled';

export interface ParsedTask {
  id: string;
  title: string;
  description?: string;
  status?: ParsedStatus;
  priority?: ParsedPriority;
  dueDate?: string; // ISO yyyy-mm-dd
  estimatedHours?: number;
  assignee?: string; // сырой @-хэндл, резолвится на сервере
  tags?: string[];
  children: ParsedTask[];
}

export interface ParsedProject {
  id: string;
  name: string;
  description?: string;
  tasks: ParsedTask[];
}

export interface ParseResult {
  projects: ParsedProject[];
  warnings: string[];
}

// ---- извлечение токенов из строки задачи -------------------------------

const CHECKBOX_RE = /^\[([ xX~>\-])\]\s+/;
const PRIORITY_RE = /(?:^|\s)!(urgent|high|medium|med|low)\b/i;
const DUE_RE = /(?:^|\s)due:(\d{4}-\d{2}-\d{2}|today|tomorrow)\b/i;
const ESTIMATE_RE = /(?:^|\s)~(\d+(?:\.\d+)?)\s*(h|ч|d|д)\b/i;
const ASSIGNEE_RE = /(?:^|\s)@([\p{L}\p{N}._-]+)/u;
const TAG_RE = /(?:^|\s)\+([\p{L}\p{N}._-]+)/gu;

const STATUS_BY_CHECKBOX: Record<string, ParsedStatus> = {
  ' ': 'todo',
  x: 'done',
  X: 'done',
  '~': 'in-progress',
  '>': 'review',
  '-': 'cancelled',
};

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function resolveDue(token: string): string {
  const t = token.toLowerCase();
  if (t === 'today') return isoDate(new Date());
  if (t === 'tomorrow') {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return isoDate(d);
  }
  return token;
}

interface ExtractedMeta {
  title: string;
  status?: ParsedStatus;
  priority?: ParsedPriority;
  dueDate?: string;
  estimatedHours?: number;
  assignee?: string;
  tags?: string[];
}

// Разбирает текст задачи (без маркера списка/решёток) на заголовок и метаданные.
function extractMeta(raw: string): ExtractedMeta {
  let text = raw;
  const meta: ExtractedMeta = { title: '' };

  // Чекбокс статуса — только в начале.
  const cb = text.match(CHECKBOX_RE);
  if (cb) {
    meta.status = STATUS_BY_CHECKBOX[cb[1]];
    text = text.slice(cb[0].length);
  }

  const pr = text.match(PRIORITY_RE);
  if (pr) {
    const p = pr[1].toLowerCase();
    meta.priority = (p === 'med' ? 'medium' : p) as ParsedPriority;
    text = text.replace(pr[0], ' ');
  }

  const due = text.match(DUE_RE);
  if (due) {
    meta.dueDate = resolveDue(due[1]);
    text = text.replace(due[0], ' ');
  }

  const est = text.match(ESTIMATE_RE);
  if (est) {
    const value = parseFloat(est[1]);
    const unit = est[2].toLowerCase();
    meta.estimatedHours = unit === 'd' || unit === 'д' ? value * 8 : value;
    text = text.replace(est[0], ' ');
  }

  const asg = text.match(ASSIGNEE_RE);
  if (asg) {
    meta.assignee = asg[1];
    text = text.replace(asg[0], ' ');
  }

  const tags: string[] = [];
  let tagMatch: RegExpExecArray | null;
  TAG_RE.lastIndex = 0;
  while ((tagMatch = TAG_RE.exec(text)) !== null) {
    tags.push(tagMatch[1]);
  }
  if (tags.length > 0) {
    meta.tags = tags;
    text = text.replace(TAG_RE, ' ');
  }

  meta.title = text.replace(/\s+/g, ' ').trim();
  return meta;
}

// ---- парсер --------------------------------------------------------------

const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const LIST_RE = /^(\s*)(?:[-*+]|\d+\.)\s+(.*)$/;

let uid = 0;
function nextId(prefix: string): string {
  uid += 1;
  return `${prefix}_${uid}`;
}

export function analyzeMarkdown(input: string): ParseResult {
  uid = 0;
  const warnings: string[] = [];
  const projects: ParsedProject[] = [];

  let project: ParsedProject | null = null;
  let lastTask: ParsedTask | null = null;
  let headingBase = -1; // глубина последней секции-заголовка (для базы списков)

  // стек узлов с абсолютной глубиной для привязки родителей
  const stack: { depth: number; node: ParsedTask }[] = [];

  const attach = (node: ParsedTask, depth: number) => {
    while (stack.length > 0 && stack[stack.length - 1].depth >= depth) {
      stack.pop();
    }
    const parent = stack.length > 0 ? stack[stack.length - 1].node : null;
    if (parent) parent.children.push(node);
    else project!.tasks.push(node);
    stack.push({ depth, node });
    lastTask = node;
  };

  const makeTask = (rawText: string): ParsedTask => {
    const meta = extractMeta(rawText);
    return {
      id: nextId('task'),
      title: meta.title || 'Без названия',
      description: undefined,
      status: meta.status,
      priority: meta.priority,
      dueDate: meta.dueDate,
      estimatedHours: meta.estimatedHours,
      assignee: meta.assignee,
      tags: meta.tags,
      children: [],
    };
  };

  const rawLines = input.replace(/\t/g, '  ').split('\n');

  rawLines.forEach((line, i) => {
    if (line.trim() === '') return;

    const heading = line.match(HEADING_RE);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2].trim();

      if (level === 1) {
        // Новый проект
        const meta = extractMeta(text);
        project = { id: nextId('project'), name: meta.title || 'Без названия', tasks: [] };
        projects.push(project);
        stack.length = 0;
        headingBase = -1;
        lastTask = null;
        return;
      }

      // H2–H6 — задача-секция
      if (!project) {
        warnings.push(`Строка ${i + 1}: заголовок «${text}» вне проекта (нет строки с #).`);
        return;
      }
      const depth = level - 2;
      headingBase = depth;
      attach(makeTask(text), depth);
      return;
    }

    const list = line.match(LIST_RE);
    if (list) {
      if (!project) {
        warnings.push(`Строка ${i + 1}: задача вне проекта (нет строки с #).`);
        return;
      }
      const indent = list[1].length;
      const indentLevel = Math.floor(indent / 2);
      const depth = headingBase + 1 + indentLevel;
      attach(makeTask(list[2].trim()), depth);
      return;
    }

    // Прочее — строка-описание: к последней задаче, иначе к проекту.
    let text = line.trim();
    if (text.startsWith('>')) text = text.replace(/^>\s?/, '').trim();
    if (text === '') return;

    if (lastTask) {
      lastTask.description = lastTask.description ? `${lastTask.description}\n${text}` : text;
    } else if (project) {
      project.description = project.description ? `${project.description}\n${text}` : text;
    } else {
      warnings.push(`Строка ${i + 1}: текст «${text}» вне проекта — пропущен.`);
    }
  });

  if (projects.length === 0) {
    warnings.push('Не найдено ни одного проекта. Начните строку с «# Название проекта».');
  }

  return { projects, warnings };
}

// ---- утилиты для UI ------------------------------------------------------

export function countTasks(tasks: ParsedTask[]): number {
  return tasks.reduce((acc, t) => acc + 1 + countTasks(t.children), 0);
}

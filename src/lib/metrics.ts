// Чистые функции дев-метрик: burndown спринта, velocity, lead time, throughput.
// Без зависимостей от React/Prisma — легко тестируются и переиспользуются.
import {
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  differenceInCalendarDays,
} from 'date-fns';

// Минимальные формы входных данных (берём только нужные поля).
export interface MetricTask {
  status: string;
  storyPoints?: number | null;
  sprintId?: string | null;
  createdAt: string | Date;
  completedAt?: string | Date | null;
  updatedAt?: string | Date | null;
}

export interface MetricSprint {
  id: string;
  name: string;
  status: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  createdAt?: string | Date | null;
}

export interface BurndownPoint {
  date: string; // ISO yyyy-mm-dd
  ideal: number;
  actual: number | null; // null для будущих дней
}

export interface VelocityPoint {
  sprint: string;
  committed: number; // суммарные SP задач спринта
  completed: number; // SP завершённых задач
}

const points = (t: MetricTask) => t.storyPoints || 0;

// Момент завершения задачи: completedAt, иначе (для надёжности на старых
// данных) updatedAt у задач в статусе done.
function doneAt(t: MetricTask): Date | null {
  if (t.status !== 'done') return null;
  const raw = t.completedAt ?? t.updatedAt ?? null;
  return raw ? new Date(raw) : null;
}

// Burndown: остаток SP по дням спринта. Идеальная линия — равномерное
// списание от total до 0; фактическая — total минус накопленно завершённые
// SP к концу дня. Будущие дни — null (линия обрывается на сегодня).
export function computeBurndown(sprint: MetricSprint, allTasks: MetricTask[]): BurndownPoint[] {
  if (!sprint.startDate || !sprint.endDate) return [];
  const start = startOfDay(new Date(sprint.startDate));
  const end = startOfDay(new Date(sprint.endDate));
  if (end < start) return [];

  const tasks = allTasks.filter((t) => t.sprintId === sprint.id);
  const total = tasks.reduce((acc, t) => acc + points(t), 0);

  const days = eachDayOfInterval({ start, end });
  const lastIdx = days.length - 1;
  const today = startOfDay(new Date());

  return days.map((day, i) => {
    const ideal = lastIdx === 0 ? 0 : total - (total * i) / lastIdx;

    let actual: number | null = null;
    if (day <= today) {
      const dayEnd = endOfDay(day);
      const completed = tasks.reduce((acc, t) => {
        const dAt = doneAt(t);
        return dAt && dAt <= dayEnd ? acc + points(t) : acc;
      }, 0);
      actual = total - completed;
    }

    return {
      date: day.toISOString().slice(0, 10),
      ideal: Math.round(ideal * 10) / 10,
      actual,
    };
  });
}

// Velocity: для завершённых спринтов — закоммиченные vs завершённые SP.
export function computeVelocity(sprints: MetricSprint[], allTasks: MetricTask[]): VelocityPoint[] {
  return sprints
    .filter((s) => s.status === 'completed')
    .sort((a, b) => {
      const av = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bv = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return av - bv;
    })
    .map((s) => {
      const tasks = allTasks.filter((t) => t.sprintId === s.id);
      return {
        sprint: s.name,
        committed: tasks.reduce((acc, t) => acc + points(t), 0),
        completed: tasks.filter((t) => t.status === 'done').reduce((acc, t) => acc + points(t), 0),
      };
    });
}

// Lead time: среднее число дней от создания до завершения (по done-задачам).
export function computeLeadTime(allTasks: MetricTask[]): { avgDays: number; count: number } {
  const durations: number[] = [];
  for (const t of allTasks) {
    const dAt = doneAt(t);
    if (dAt) {
      durations.push(Math.max(0, differenceInCalendarDays(dAt, new Date(t.createdAt))));
    }
  }
  if (durations.length === 0) return { avgDays: 0, count: 0 };
  const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
  return { avgDays: Math.round(avg * 10) / 10, count: durations.length };
}

// Throughput: сколько задач завершено за последние `days` дней.
export function computeThroughput(allTasks: MetricTask[], days = 14): number {
  const since = startOfDay(new Date());
  since.setDate(since.getDate() - days + 1);
  return allTasks.reduce((acc, t) => {
    const dAt = doneAt(t);
    return dAt && dAt >= since ? acc + 1 : acc;
  }, 0);
}

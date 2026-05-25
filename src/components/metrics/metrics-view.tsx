'use client';

// Дев-метрики проекта: velocity по завершённым спринтам, burndown выбранного
// спринта и сводные показатели (lead time, throughput, прогресс по SP).
import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Gauge, Clock, Hash, TrendingUp } from 'lucide-react';
import {
  computeBurndown,
  computeVelocity,
  computeLeadTime,
  computeThroughput,
} from '@/lib/metrics';

interface MetricsViewProps {
  tasks: any[];
  sprints: any[];
  isLoading?: boolean;
}

const CHART_GRID = 'hsl(var(--border))';
const C1 = 'hsl(var(--chart-1))';
const C2 = 'hsl(var(--chart-2))';

function SummaryCard({ icon: Icon, label, value, hint }: { icon: any; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

function ChartCard({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <div className="flex items-start justify-between gap-3 p-4 border-b border-border/50">
        <div>
          <h3 className="font-semibold">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground text-center px-4">
      {text}
    </div>
  );
}

export function MetricsView({ tasks, sprints, isLoading }: MetricsViewProps) {
  const velocity = useMemo(() => computeVelocity(sprints, tasks), [sprints, tasks]);
  const leadTime = useMemo(() => computeLeadTime(tasks), [tasks]);
  const throughput = useMemo(() => computeThroughput(tasks, 14), [tasks]);

  const totalPoints = tasks.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
  const donePoints = tasks
    .filter((t) => t.status === 'done')
    .reduce((acc, t) => acc + (t.storyPoints || 0), 0);
  const avgVelocity = velocity.length
    ? Math.round((velocity.reduce((a, v) => a + v.completed, 0) / velocity.length) * 10) / 10
    : 0;

  // Спринты с датами — кандидаты для burndown (активный по умолчанию).
  const datedSprints = useMemo(
    () => sprints.filter((s) => s.startDate && s.endDate),
    [sprints]
  );
  const defaultSprintId = useMemo(() => {
    const active = datedSprints.find((s) => s.status === 'active');
    return active?.id ?? datedSprints[0]?.id ?? '';
  }, [datedSprints]);
  const [sprintId, setSprintId] = useState<string>('');
  const selectedSprintId = sprintId || defaultSprintId;
  const selectedSprint = datedSprints.find((s) => s.id === selectedSprintId);
  const burndown = useMemo(
    () => (selectedSprint ? computeBurndown(selectedSprint, tasks) : []),
    [selectedSprint, tasks]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 rounded-xl bg-muted/50 animate-pulse" />)}
        </div>
        <div className="h-80 rounded-xl bg-muted/50 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          icon={Gauge}
          label="Средняя velocity"
          value={`${avgVelocity} SP`}
          hint={velocity.length ? `по ${velocity.length} спринт.` : 'нет завершённых спринтов'}
        />
        <SummaryCard
          icon={Clock}
          label="Lead time (среднее)"
          value={`${leadTime.avgDays} дн`}
          hint={leadTime.count ? `по ${leadTime.count} задач.` : 'нет завершённых задач'}
        />
        <SummaryCard
          icon={Hash}
          label="Прогресс по SP"
          value={`${donePoints}/${totalPoints}`}
          hint={totalPoints ? `${Math.round((donePoints / totalPoints) * 100)}% готово` : '—'}
        />
        <SummaryCard
          icon={TrendingUp}
          label="Throughput (14 дн)"
          value={`${throughput}`}
          hint="задач завершено"
        />
      </div>

      {/* Velocity */}
      <ChartCard title="Velocity" subtitle="Закоммичено vs завершено (story points) по завершённым спринтам">
        {velocity.length === 0 ? (
          <EmptyChart text="Завершите хотя бы один спринт, чтобы увидеть velocity." />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={velocity} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="sprint" tick={{ fontSize: 12 }} stroke={CHART_GRID} />
              <YAxis tick={{ fontSize: 12 }} stroke={CHART_GRID} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="committed" name="Закоммичено" fill={C2} radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" name="Завершено" fill={C1} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Burndown */}
      <ChartCard
        title="Burndown"
        subtitle={selectedSprint ? selectedSprint.name : undefined}
        action={
          datedSprints.length > 0 ? (
            <Select value={selectedSprintId} onValueChange={setSprintId}>
              <SelectTrigger className="h-8 w-[180px]">
                <SelectValue placeholder="Выберите спринт" />
              </SelectTrigger>
              <SelectContent>
                {datedSprints.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : undefined
        }
      >
        {burndown.length === 0 ? (
          <EmptyChart text="Задайте спринту даты начала и окончания, чтобы построить burndown." />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={burndown} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke={CHART_GRID} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 12 }} stroke={CHART_GRID} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="ideal" name="Идеал" stroke={CHART_GRID} strokeDasharray="5 5" dot={false} />
              <Line type="monotone" dataKey="actual" name="Факт" stroke={C1} strokeWidth={2} connectNulls dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}

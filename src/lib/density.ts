// Метрики плотности для списков/таблиц. Один источник правды, чтобы
// строки, паддинги и размер шрифта согласованно менялись при переключении
// режима Comfortable / Compact / Super Compact.

import type { Density } from '@/stores/ui-store';

export interface DensityMetrics {
  /** Класс высоты строки таблицы. */
  rowHeight: string;
  /** Горизонтальный/вертикальный паддинг ячейки. */
  cellPadding: string;
  /** Размер шрифта строки. */
  fontSize: string;
  /** Подпись для переключателя. */
  label: string;
}

export const DENSITY_METRICS: Record<Density, DensityMetrics> = {
  'comfortable': {
    rowHeight: 'h-12',
    cellPadding: 'px-3 py-2.5',
    fontSize: 'text-sm',
    label: 'Просторно',
  },
  'compact': {
    rowHeight: 'h-9',
    cellPadding: 'px-3 py-1.5',
    fontSize: 'text-sm',
    label: 'Компактно',
  },
  'super-compact': {
    rowHeight: 'h-7',
    cellPadding: 'px-2 py-1',
    fontSize: 'text-xs',
    label: 'Очень компактно',
  },
};

export const DENSITY_ORDER: Density[] = ['comfortable', 'compact', 'super-compact'];

export function getDensityMetrics(density: Density): DensityMetrics {
  return DENSITY_METRICS[density] ?? DENSITY_METRICS.comfortable;
}

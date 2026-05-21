'use client';

import { Calendar as CalendarIcon } from 'lucide-react';

interface CalendarPageHeaderProps {
  title: string;
  description: string;
}

export function CalendarPageHeader({ title, description }: CalendarPageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <CalendarIcon className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-sm">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

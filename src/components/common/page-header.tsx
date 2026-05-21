'use client';

import { ReactNode } from 'react';

interface PageHeaderProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function PageHeader({ icon, title, description }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
          {icon}
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

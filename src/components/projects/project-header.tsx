'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Settings } from 'lucide-react';

interface ProjectHeaderProps {
  project: any; // TODO: Define a proper type for project
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-md text-lg"
              style={{ backgroundColor: `${project?.color || '#6366f1'}1a` }}
            >
              {project?.icon || '📁'}
            </div>
            <h1 className="text-xl font-semibold tracking-tight">{project?.name || 'Проект'}</h1>
            <Badge variant="secondary" className="font-normal">
              {project?.status === 'active' ? 'Активен' : project?.status}
            </Badge>
          </div>
          {project?.description && (
            <p className="text-sm text-muted-foreground">{project.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

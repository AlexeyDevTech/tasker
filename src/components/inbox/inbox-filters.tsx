'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface InboxFiltersProps {
  search: string;
  setSearch: (search: string) => void;
  filter: 'all' | 'today' | 'overdue' | 'upcoming';
  setFilter: (filter: 'all' | 'today' | 'overdue' | 'upcoming') => void;
}

export function InboxFilters({ search, setSearch, filter, setFilter }: InboxFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск задач..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Все
        </Button>
        <Button
          variant={filter === 'today' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('today')}
        >
          Сегодня
        </Button>
        <Button
          variant={filter === 'overdue' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('overdue')}
          className="text-destructive"
        >
          Просрочено
        </Button>
      </div>
    </div>
  );
}

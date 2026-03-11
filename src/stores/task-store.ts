import { create } from 'zustand';
import type { Task, TaskStatus, TaskPriority } from '@/types';

interface TaskState {
  // Tasks
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  
  // Selected task
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  
  // Quick add
  quickAddOpen: boolean;
  setQuickAddOpen: (open: boolean) => void;
  
  // Filters
  filters: TaskFilters;
  setFilters: (filters: Partial<TaskFilters>) => void;
  resetFilters: () => void;
  
  // Drag state
  draggingTaskId: string | null;
  setDraggingTaskId: (id: string | null) => void;
}

interface TaskFilters {
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  assigneeId: string | 'all' | null;
  search: string;
  tags: string[];
}

export const useTaskStore = create<TaskState>()((set) => ({
  // Tasks
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
  })),
  removeTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id),
    selectedTaskId: state.selectedTaskId === id ? null : state.selectedTaskId,
  })),
  
  // Selected task
  selectedTaskId: null,
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  
  // Quick add
  quickAddOpen: false,
  setQuickAddOpen: (open) => set({ quickAddOpen: open }),
  
  // Filters
  filters: {
    status: 'all',
    priority: 'all',
    assigneeId: null,
    search: '',
    tags: [],
  },
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
  })),
  resetFilters: () => set({
    filters: {
      status: 'all',
      priority: 'all',
      assigneeId: null,
      search: '',
      tags: [],
    },
  }),
  
  // Drag state
  draggingTaskId: null,
  setDraggingTaskId: (id) => set({ draggingTaskId: id }),
}));

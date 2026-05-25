import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Density = 'comfortable' | 'compact' | 'super-compact';

interface UIState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Density (плотность списков/таблиц)
  density: Density;
  setDensity: (density: Density) => void;

  // Command palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  
  // Notifications panel
  notificationsPanelOpen: boolean;
  setNotificationsPanelOpen: (open: boolean) => void;
  
  // Mobile menu
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  
  // Modals
  createProjectModalOpen: boolean;
  setCreateProjectModalOpen: (open: boolean) => void;
  
  createTaskModalOpen: boolean;
  setCreateTaskModalOpen: (open: boolean) => void;

  // Массовый импорт проектов из текста
  bulkImportOpen: boolean;
  setBulkImportOpen: (open: boolean) => void;

  // Активная задача в правой контекстной шторке (null = закрыта)
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;

  // Toast queue
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  
  // Timeline zoom
  timelineZoom: number; // 0.5 = week view, 1 = default, 2 = day view
  setTimelineZoom: (zoom: number) => void;
  
  // Timeline scroll position
  timelineScrollX: number;
  setTimelineScrollX: (x: number) => void;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Theme
      theme: 'system',
      setTheme: (theme) => set({ theme }),

      // Density
      density: 'comfortable',
      setDensity: (density) => set({ density }),

      // Command palette
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      
      // Notifications panel
      notificationsPanelOpen: false,
      setNotificationsPanelOpen: (open) => set({ notificationsPanelOpen: open }),
      
      // Mobile menu
      mobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
      
      // Modals
      createProjectModalOpen: false,
      setCreateProjectModalOpen: (open) => set({ createProjectModalOpen: open }),
      
      createTaskModalOpen: false,
      setCreateTaskModalOpen: (open) => set({ createTaskModalOpen: open }),

      // Bulk import
      bulkImportOpen: false,
      setBulkImportOpen: (open) => set({ bulkImportOpen: open }),

      // Active task drawer
      activeTaskId: null,
      setActiveTaskId: (id) => set({ activeTaskId: id }),

      // Toast queue
      toasts: [],
      addToast: (toast) => set((state) => ({
        toasts: [...state.toasts, { ...toast, id: Date.now().toString() }],
      })),
      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      })),
      
      // Timeline zoom
      timelineZoom: 1,
      setTimelineZoom: (zoom) => set({ timelineZoom: Math.max(0.25, Math.min(4, zoom)) }),
      
      // Timeline scroll position
      timelineScrollX: 0,
      setTimelineScrollX: (x) => set({ timelineScrollX: x }),
    }),
    {
      name: 'taskflow-ui-store',
      partialize: (state) => ({
        theme: state.theme,
        density: state.density,
        timelineZoom: state.timelineZoom,
      }),
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
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
        timelineZoom: state.timelineZoom,
      }),
    }
  )
);

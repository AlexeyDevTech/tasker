import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, ProjectViewSettings, ViewMode } from '@/types';

interface ProjectState {
  // Current project
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  
  // Projects list
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  
  // View settings
  viewSettings: ProjectViewSettings;
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (sortBy: ProjectViewSettings['sortBy']) => void;
  setSortOrder: (order: ProjectViewSettings['sortOrder']) => void;
  setGroupBy: (groupBy: ProjectViewSettings['groupBy']) => void;
  toggleShowCompleted: () => void;
  toggleShowSubtasks: () => void;
  
  // Sidebar state
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Selected items
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      // Current project
      currentProject: null,
      setCurrentProject: (project) => set({ currentProject: project }),
      
      // Projects list
      projects: [],
      setProjects: (projects) => set({ projects }),
      addProject: (project) => set((state) => ({ 
        projects: [...state.projects, project] 
      })),
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map((p) => 
          p.id === id ? { ...p, ...updates } : p
        ),
        currentProject: state.currentProject?.id === id 
          ? { ...state.currentProject, ...updates }
          : state.currentProject,
      })),
      removeProject: (id) => set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
      })),
      
      // View settings
      viewSettings: {
        viewMode: 'board',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        groupBy: 'status',
        showCompleted: true,
        showSubtasks: true,
      },
      setViewMode: (mode) => set((state) => ({
        viewSettings: { ...state.viewSettings, viewMode: mode },
      })),
      setSortBy: (sortBy) => set((state) => ({
        viewSettings: { ...state.viewSettings, sortBy },
      })),
      setSortOrder: (sortOrder) => set((state) => ({
        viewSettings: { ...state.viewSettings, sortOrder },
      })),
      setGroupBy: (groupBy) => set((state) => ({
        viewSettings: { ...state.viewSettings, groupBy },
      })),
      toggleShowCompleted: () => set((state) => ({
        viewSettings: { 
          ...state.viewSettings, 
          showCompleted: !state.viewSettings.showCompleted 
        },
      })),
      toggleShowSubtasks: () => set((state) => ({
        viewSettings: { 
          ...state.viewSettings, 
          showSubtasks: !state.viewSettings.showSubtasks 
        },
      })),
      
      // Sidebar state
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      // Selected items
      selectedProjectId: null,
      setSelectedProjectId: (id) => set({ selectedProjectId: id }),
    }),
    {
      name: 'taskflow-project-store',
      partialize: (state) => ({
        viewSettings: state.viewSettings,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

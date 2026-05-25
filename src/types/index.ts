// TaskFlow Types

// ============================================
// Enums
// ============================================

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done' | 'cancelled';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type ProjectStatus = 'active' | 'completed' | 'archived' | 'on-hold';
export type MemberRole = 'owner' | 'editor' | 'commenter' | 'viewer';
export type DependencyType = 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
export type WorkTime = 'morning' | 'afternoon' | 'evening';
export type NotificationType = 'task-assigned' | 'comment' | 'mention' | 'deadline' | 'project-invite';

// ============================================
// User
// ============================================

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  preferredTheme: string;
  preferredWorkTime: WorkTime;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Project
// ============================================

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  parentId: string | null;
  parent: Project | null;
  children: Project[];
  startDate: Date | null;
  endDate: Date | null;
  status: ProjectStatus;
  progress: number;
  templateId: string | null;
  isTemplate: boolean;
  templateCategory: string | null;
  ownerId: string;
  owner: User;
  settings: string | null;
  createdAt: Date;
  updatedAt: Date;
  tasks: Task[];
  members: ProjectMember[];
  milestones: Milestone[];
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: MemberRole;
  joinedAt: Date;
  user: User;
}

// ============================================
// Task
// ============================================

export interface Task {
  id: string;
  title: string;
  description: string | null;
  projectId: string;
  project: Project;
  parentId: string | null;
  parent: Task | null;
  subtasks: Task[];
  assigneeId: string | null;
  assignee: User | null;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: Date | null;
  dueDate: Date | null;
  completedAt: Date | null;
  estimatedHours: number | null;
  actualHours: number | null;
  position: number;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  dependenciesFrom: Dependency[];
  dependenciesTo: Dependency[];
  comments: Comment[];
  tags: TaskTag[];
  attachments: Attachment[];
  checklist: ChecklistItem[];
  milestone: Milestone | null;
  milestoneId: string | null;
}

// ============================================
// Dependency
// ============================================

export interface Dependency {
  id: string;
  taskId: string;
  dependsOnId: string;
  task: Task;
  dependsOn: Task;
  type: DependencyType;
  lagDays: number;
  createdAt: Date;
}

// ============================================
// Milestone
// ============================================

export interface Milestone {
  id: string;
  title: string;
  description: string | null;
  projectId: string;
  date: Date;
  color: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  tasks: Task[];
}

// ============================================
// Comment
// ============================================

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  task: Task;
  authorId: string;
  author: User;
  parentId: string | null;
  parent: Comment | null;
  replies: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Tags
// ============================================

export interface Tag {
  id: string;
  name: string;
  color: string;
  userId: string;
  tasks: TaskTag[];
}

export interface TaskTag {
  taskId: string;
  tagId: string;
  task: Task;
  tag: Tag;
}

// ============================================
// Attachment
// ============================================

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number | null;
  taskId: string;
  uploadedBy: string | null;
  createdAt: Date;
}

// ============================================
// Checklist Item
// ============================================

export interface ChecklistItem {
  id: string;
  title: string;
  isDone: boolean;
  position: number;
  taskId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Notification
// ============================================

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: string | null;
  userId: string;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
}

// ============================================
// Template
// ============================================

export interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string;
  icon: string | null;
  color: string;
  structure: string; // JSON string
  isPublic: boolean;
  usageCount: number;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateStructure {
  tasks: TemplateTask[];
  milestones: TemplateMilestone[];
  dependencies: TemplateDependency[];
}

export interface TemplateTask {
  title: string;
  description?: string;
  priority?: TaskPriority;
  estimatedHours?: number;
  subtasks?: TemplateTask[];
}

export interface TemplateMilestone {
  title: string;
  date: number; // Days from project start
  color?: string;
}

export interface TemplateDependency {
  taskIndex: number;
  dependsOnIndex: number;
  type: DependencyType;
}

// ============================================
// Activity
// ============================================

export interface Activity {
  id: string;
  type: string;
  description: string;
  data: string | null;
  projectId: string;
  userId: string;
  user: User;
  createdAt: Date;
}

// ============================================
// Timeline Types
// ============================================

export interface TimelineTask {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  assignee: User | null;
  dependencies: string[];
  row: number;
  col: number;
  width: number;
}

export interface TimelineMilestone {
  id: string;
  title: string;
  date: Date;
  color: string;
  isCompleted: boolean;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// UI State Types
// ============================================

export type ViewMode = 'timeline' | 'stream' | 'board' | 'list' | 'calendar';

export interface ProjectViewSettings {
  viewMode: ViewMode;
  sortBy: 'name' | 'dueDate' | 'priority' | 'status' | 'createdAt';
  sortOrder: 'asc' | 'desc';
  groupBy: 'status' | 'priority' | 'assignee' | 'none';
  showCompleted: boolean;
  showSubtasks: boolean;
}

// ============================================
// Chart/Analytics Types
// ============================================

export interface BurndownDataPoint {
  date: Date;
  ideal: number;
  actual: number;
}

export interface ProductivityData {
  date: Date;
  tasksCompleted: number;
  hoursLogged: number;
}

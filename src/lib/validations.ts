import { z } from 'zod';

// Shared enums kept in sync with prisma/schema.prisma and src/types/index.ts.
export const taskStatusSchema = z.enum([
  'todo',
  'in-progress',
  'review',
  'done',
  'cancelled',
]);
export const taskPrioritySchema = z.enum(['urgent', 'high', 'medium', 'low']);
export const taskTypeSchema = z.enum([
  'feature',
  'bug',
  'chore',
  'refactor',
  'docs',
  'spike',
]);
export const taskSeveritySchema = z.enum(['critical', 'major', 'minor', 'trivial']);
export const projectStatusSchema = z.enum([
  'active',
  'completed',
  'archived',
  'on-hold',
]);
export const sprintStatusSchema = z.enum(['planned', 'active', 'completed']);

// Accepts an ISO date string (or Date) and is optional/nullable.
const optionalDate = z
  .union([z.string(), z.date()])
  .nullish()
  .transform((v) => (v ? new Date(v) : null));

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required').max(200),
  description: z.string().max(5000).nullish(),
  color: z.string().max(20).optional(),
  icon: z.string().max(20).nullish(),
  parentId: z.string().nullish(),
  templateId: z.string().nullish(),
  startDate: optionalDate,
  endDate: optionalDate,
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(5000).nullish(),
  color: z.string().max(20).optional(),
  icon: z.string().max(20).nullish(),
  status: projectStatusSchema.optional(),
  progress: z.number().int().min(0).max(100).optional(),
  startDate: optionalDate,
  endDate: optionalDate,
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Task title is required').max(300),
  description: z.string().max(10000).nullish(),
  projectId: z.string().min(1, 'projectId is required'),
  parentId: z.string().nullish(),
  assigneeId: z.string().nullish(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  type: taskTypeSchema.optional(),
  storyPoints: z.number().int().nonnegative().nullish(),
  severity: taskSeveritySchema.nullish(),
  startDate: optionalDate,
  dueDate: optionalDate,
  estimatedHours: z.number().nonnegative().nullish(),
});

export const updateTaskSchema = z.object({
  id: z.string().min(1, 'Task id is required'),
  title: z.string().trim().min(1).max(300).optional(),
  description: z.string().max(10000).nullish(),
  assigneeId: z.string().nullish(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  type: taskTypeSchema.optional(),
  storyPoints: z.number().int().nonnegative().nullish(),
  severity: taskSeveritySchema.nullish(),
  sprintId: z.string().nullish(),
  progress: z.number().int().min(0).max(100).optional(),
  startDate: optionalDate,
  dueDate: optionalDate,
  completedAt: optionalDate,
  estimatedHours: z.number().nonnegative().nullish(),
  actualHours: z.number().nonnegative().nullish(),
});

export const createSprintSchema = z.object({
  name: z.string().trim().min(1, 'Sprint name is required').max(200),
  goal: z.string().max(2000).nullish(),
  projectId: z.string().min(1, 'projectId is required'),
  startDate: optionalDate,
  endDate: optionalDate,
  status: sprintStatusSchema.optional(),
});

export const updateSprintSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  goal: z.string().max(2000).nullish(),
  startDate: optionalDate,
  endDate: optionalDate,
  status: sprintStatusSchema.optional(),
});

export const linkKindSchema = z.enum(['pr', 'commit', 'issue', 'branch']);
export const linkProviderSchema = z.enum(['github', 'gitlab', 'other']);
export const linkStateSchema = z.enum(['open', 'merged', 'closed']);

export const createTaskLinkSchema = z.object({
  taskId: z.string().min(1, 'taskId is required'),
  url: z.string().url('Invalid URL').max(2000),
  kind: linkKindSchema.optional(),
  provider: linkProviderSchema.optional(),
  title: z.string().max(300).nullish(),
  externalId: z.string().max(200).nullish(),
  state: linkStateSchema.nullish(),
});

export const importIssuesSchema = z.object({
  projectId: z.string().min(1, 'projectId is required'),
  repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/, 'Ожидается формат owner/repo'),
  token: z.string().max(300).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
});

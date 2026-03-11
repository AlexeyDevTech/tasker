// src/lib/bulk-parser.ts

export interface ParsedTask {
  id: string;
  title: string;
  children: ParsedTask[];
  // TODO: Add other properties like assignee, dueDate, etc.
}

export interface ParsedProject {
  id: string;
  name: string;
  tasks: ParsedTask[];
}

export function parseBulkText(text: string): ParsedProject[] {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const projects: ParsedProject[] = [];
  let currentProject: ParsedProject | null = null;
  const taskStack: (ParsedTask | ParsedProject)[] = [];

  lines.forEach((line, index) => {
    const indentation = line.match(/^\s*/)?.[0].length || 0;
    const level = Math.floor(indentation / 2); // Assuming 2 spaces per level

    const content = line.trim();

    if (content.startsWith('#')) {
      // It's a project
      const projectName = content.substring(1).trim();
      const newProject: ParsedProject = {
        id: `project_${index}`,
        name: projectName,
        tasks: [],
      };
      projects.push(newProject);
      currentProject = newProject;
      taskStack.length = 0; // Reset stack for new project
      taskStack.push(currentProject);
    } else if (content.startsWith('-')) {
      // It's a task
      if (!currentProject) {
        throw new Error(`Line ${index + 1}: Task found before any project was defined. Please define a project first with '# Project Name'.`);
      }

      const taskTitle = content.substring(1).trim();
      const newTask: ParsedTask = {
        id: `task_${index}`,
        title: taskTitle,
        children: [],
      };

      while (taskStack.length > level + 1) {
        taskStack.pop();
      }

      const parent = taskStack[taskStack.length - 1];
      if (parent) {
        if ('tasks' in parent) { // Parent is a Project
          parent.tasks.push(newTask);
        } else { // Parent is a Task
          parent.children.push(newTask);
        }
      }
      
      taskStack.push(newTask);
    } else {
      throw new Error(`Line ${index + 1}: Invalid syntax. Lines must start with '#' for projects or '-' for tasks.`);
    }
  });

  return projects;
}

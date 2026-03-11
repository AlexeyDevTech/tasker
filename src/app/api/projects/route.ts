import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/projects - Get all projects for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // For demo, create a default user if not authenticated
    let userId = session?.user?.id;
    
    if (!userId) {
      // Find or create demo user
      let user = await db.user.findFirst();
      if (!user) {
        user = await db.user.create({
          data: {
            email: 'demo@taskflow.app',
            name: 'Demo User',
          },
        });
      }
      userId = user.id;
    }

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    const includeTasks = searchParams.get('includeTasks') === 'true';

    // Get projects where user is owner or member
    const projects = await db.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
        ...(parentId === 'null' ? { parentId: null } : parentId ? { parentId } : {}),
        isTemplate: false,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, image: true },
        },
        children: true,
        ...(includeTasks ? {
          tasks: {
            include: {
              assignee: {
                select: { id: true, name: true, email: true, image: true },
              },
            },
          },
        } : {}),
        _count: {
          select: { tasks: true, children: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    if (!userId) {
      let user = await db.user.findFirst();
      if (!user) {
        user = await db.user.create({
          data: {
            email: 'demo@taskflow.app',
            name: 'Demo User',
          },
        });
      }
      userId = user.id;
    }

    const body = await request.json();
    const { 
      name, 
      description, 
      color, 
      icon, 
      parentId,
      templateId,
      startDate,
      endDate,
    } = body;

    // Create project
    const project = await db.project.create({
      data: {
        name,
        description,
        color: color || '#6366f1',
        icon,
        parentId: parentId || null,
        ownerId: userId,
        templateId: templateId || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    // Add owner as project member
    await db.projectMember.create({
      data: {
        projectId: project.id,
        userId,
        role: 'owner',
      },
    });

    // If template is specified, create tasks from template
    if (templateId) {
      const template = await db.template.findUnique({
        where: { id: templateId },
      });

      if (template) {
        const structure = JSON.parse(template.structure);
        const taskMap: Record<number, string> = {};

        // Create tasks
        for (let i = 0; i < structure.tasks.length; i++) {
          const taskData = structure.tasks[i];
          const task = await db.task.create({
            data: {
              title: taskData.title,
              description: taskData.description,
              priority: taskData.priority || 'medium',
              estimatedHours: taskData.estimatedHours,
              projectId: project.id,
              position: i,
              startDate: project.startDate,
              dueDate: project.endDate,
            },
          });
          taskMap[i] = task.id;

          // Create subtasks
          if (taskData.subtasks) {
            for (let j = 0; j < taskData.subtasks.length; j++) {
              await db.task.create({
                data: {
                  title: taskData.subtasks[j].title,
                  parentId: task.id,
                  projectId: project.id,
                  position: j,
                  estimatedHours: taskData.subtasks[j].estimatedHours,
                },
              });
            }
          }
        }

        // Create dependencies
        if (structure.dependencies) {
          for (const dep of structure.dependencies) {
            if (taskMap[dep.taskIndex] && taskMap[dep.dependsOnIndex]) {
              await db.dependency.create({
                data: {
                  taskId: taskMap[dep.taskIndex],
                  dependsOnId: taskMap[dep.dependsOnIndex],
                  type: dep.type || 'finish-to-start',
                },
              });
            }
          }
        }

        // Create milestones
        if (structure.milestones && project.startDate) {
          for (const milestone of structure.milestones) {
            const milestoneDate = new Date(project.startDate);
            milestoneDate.setDate(milestoneDate.getDate() + milestone.date);
            
            await db.milestone.create({
              data: {
                title: milestone.title,
                date: milestoneDate,
                color: milestone.color || '#f59e0b',
                projectId: project.id,
              },
            });
          }
        }

        // Increment template usage
        await db.template.update({
          where: { id: templateId },
          data: { usageCount: { increment: 1 } },
        });
      }
    }

    // Log activity
    await db.activity.create({
      data: {
        type: 'project_created',
        description: `Создан проект "${name}"`,
        projectId: project.id,
        userId,
      },
    });

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

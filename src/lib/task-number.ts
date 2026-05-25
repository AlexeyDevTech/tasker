// Выдаёт следующий порядковый номер задачи внутри проекта.
//
// Инкремент Project.taskCounter атомарен на уровне строки, поэтому при
// параллельном создании задач номера не дублируются. Вызывать ВНУТРИ
// транзакции вместе с созданием задачи, чтобы счётчик и задача
// фиксировались/откатывались согласованно.

import type { Prisma, PrismaClient } from '@prisma/client';

type Client = PrismaClient | Prisma.TransactionClient;

export async function nextTaskNumber(client: Client, projectId: string): Promise<number> {
  const project = await client.project.update({
    where: { id: projectId },
    data: { taskCounter: { increment: 1 } },
    select: { taskCounter: true },
  });
  return project.taskCounter;
}

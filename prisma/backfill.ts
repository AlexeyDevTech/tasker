// Разовый бэкафилл идентичности задач для данных, созданных до введения
// ключей проектов и номеров задач (Фаза 0).
//
// Идемпотентен: трогает только проекты без key и задачи без number.
// Запуск: bun prisma/backfill.ts
import { PrismaClient } from '@prisma/client';
import { generateProjectKey } from '../src/lib/project-key';

const db = new PrismaClient();

async function main() {
  const projects = await db.project.findMany({
    select: { id: true, name: true, key: true, ownerId: true },
  });

  let keyed = 0;
  let numbered = 0;

  for (const project of projects) {
    // 1) Ключ проекта.
    let key = project.key;
    if (!key) {
      key = await generateProjectKey(db, project.ownerId, project.name);
      await db.project.update({ where: { id: project.id }, data: { key } });
      keyed++;
    }

    // 2) Номера задач — последовательно по дате создания, продолжая
    //    от текущего максимума.
    const tasks = await db.task.findMany({
      where: { projectId: project.id },
      select: { id: true, number: true },
      orderBy: { createdAt: 'asc' },
    });

    let max = tasks.reduce((m, t) => (t.number != null && t.number > m ? t.number : m), 0);

    for (const task of tasks) {
      if (task.number == null) {
        max++;
        await db.task.update({ where: { id: task.id }, data: { number: max } });
        numbered++;
      }
    }

    // 3) Счётчик проекта = присвоенный максимум.
    await db.project.update({ where: { id: project.id }, data: { taskCounter: max } });
  }

  console.log(`Backfill done: ${keyed} project key(s), ${numbered} task number(s) across ${projects.length} project(s).`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });

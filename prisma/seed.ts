import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const db = new PrismaClient();

// Seed a default admin/login account. Idempotent: re-running updates the
// password instead of creating duplicates. Override via env if desired.
const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@tasker.local';
const password = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';
const name = process.env.SEED_ADMIN_NAME ?? 'Admin';

async function main() {
  const hashed = await bcrypt.hash(password, 12);
  const user = await db.user.upsert({
    where: { email },
    update: { password: hashed, name },
    create: { email, name, password: hashed },
  });
  console.log(`Seeded user: ${user.email} (${user.id})`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });

/**
 * Da de alta (o actualiza la password de) un usuario para login.
 *
 * Uso:
 *   npm run seed-user -- "usuario" "password"
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const [username, password] = process.argv.slice(2);

  if (!username || !password) {
    console.error('Uso: npm run seed-user -- "usuario" "password"');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });

  console.log(`Usuario listo: ${user.username} (id ${user.id})`);
}

void main().finally(() => prisma.$disconnect());

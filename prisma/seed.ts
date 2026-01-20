import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('[PRISMA] Starting database seeding...');

  const adminPermission = await prisma.permission.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description:
        'Acesso total ao sistema - pode gerenciar usuários e artigos',
    },
  });

  const editorPermission = await prisma.permission.upsert({
    where: { name: 'EDITOR' },
    update: {},
    create: {
      name: 'EDITOR',
      description: 'Pode criar, editar e deletar artigos',
    },
  });

  const readerPermission = await prisma.permission.upsert({
    where: { name: 'READER' },
    update: {},
    create: {
      name: 'READER',
      description: 'Pode apenas visualizar artigos',
    },
  });

  console.log('[PRISMA] Permissions created');

  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Administrator',
      email: 'admin@example.com',
      password: hashedPassword,
    },
  });

  await prisma.userPermission.upsert({
    where: {
      userId_permissionId: {
        userId: adminUser.id,
        permissionId: adminPermission.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      permissionId: adminPermission.id,
    },
  });

  console.log('[PRISMA] Root admin user created');
  console.log('   Email: admin@example.com');
  console.log('   Password: Admin@123');

  console.log('[PRISMA] Database seeding completed!');
}

main()
  .catch((error) => {
    console.error('[PRISMA] Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

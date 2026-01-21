/**
 * Script para promover um usuário a SUPERADMIN
 * 
 * Uso:
 *   npx ts-node prisma/promote-superadmin.ts <email>
 * 
 * Exemplo:
 *   npx ts-node prisma/promote-superadmin.ts admin@fazumclube.com
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Uso: npx ts-node prisma/promote-superadmin.ts <email>');
    console.error('   Exemplo: npx ts-node prisma/promote-superadmin.ts admin@fazumclube.com');
    process.exit(1);
  }

  // Buscar usuário
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    console.error(`❌ Usuário não encontrado: ${email}`);
    process.exit(1);
  }

  if (user.role === 'SUPERADMIN') {
    console.log(`ℹ️  Usuário ${user.email} já é SUPERADMIN`);
    process.exit(0);
  }

  // Promover a SUPERADMIN
  await prisma.user.update({
    where: { id: user.id },
    data: { role: 'SUPERADMIN' },
  });

  console.log(`✅ Usuário promovido a SUPERADMIN:`);
  console.log(`   Nome: ${user.name}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Role anterior: ${user.role}`);
  console.log(`   Role atual: SUPERADMIN`);
  console.log('');
  console.log(`🔗 Acesse: /superadmin`);
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

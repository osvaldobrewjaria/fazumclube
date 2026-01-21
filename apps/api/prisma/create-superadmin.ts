/// <reference types="node" />
/**
 * Script para criar um usuário SUPERADMIN
 * 
 * Uso:
 *   npx ts-node prisma/create-superadmin.ts <email> <senha> <nome>
 * 
 * Exemplo:
 *   npx ts-node prisma/create-superadmin.ts admin@fazumclube.com senha123 "Osvaldo Admin"
 */

import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || 'Superadmin';

  if (!email || !password) {
    console.error('❌ Uso: npx ts-node prisma/create-superadmin.ts <email> <senha> [nome]');
    console.error('   Exemplo: npx ts-node prisma/create-superadmin.ts admin@fazumclube.com senha123 "Osvaldo Admin"');
    process.exit(1);
  }

  // Verificar se já existe
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log(`ℹ️  Usuário ${email} já existe. Promovendo a SUPERADMIN...`);
    await prisma.user.update({
      where: { id: existing.id },
      data: { role: 'SUPERADMIN' },
    });
    console.log(`✅ Usuário promovido a SUPERADMIN`);
    process.exit(0);
  }

  // Precisamos de um tenant para criar o usuário
  // Vamos buscar o primeiro tenant ou criar um "sistema"
  let tenant = await prisma.tenant.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  if (!tenant) {
    // Criar tenant sistema para o superadmin
    tenant = await prisma.tenant.create({
      data: {
        name: 'Sistema FazUmClube',
        slug: 'sistema',
        status: 'ACTIVE',
        businessType: 'OTHER',
      },
    });
    console.log(`ℹ️  Tenant "sistema" criado para o superadmin`);
  }

  // Hash da senha
  const hashedPassword = await bcrypt.hash(password, 10);

  // Criar usuário SUPERADMIN
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'SUPERADMIN',
      tenantId: tenant.id,
      profile: {
        create: {},
      },
    },
  });

  console.log(`✅ Usuário SUPERADMIN criado:`);
  console.log(`   ID: ${user.id}`);
  console.log(`   Nome: ${user.name}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Role: SUPERADMIN`);
  console.log('');
  console.log(`🔗 Faça login em /app/login e acesse /superadmin`);
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

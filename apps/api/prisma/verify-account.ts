/**
 * Script de verificação de conta específica
 * Executa: npx ts-node prisma/verify-account.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TARGET_EMAIL = 'osvaldo@valuehost.com.br';

async function main() {
  console.log('🔍 Verificação de conta:', TARGET_EMAIL);
  console.log('='.repeat(60));

  // 1️⃣ Verificar se o usuário existe
  console.log('\n1️⃣ Verificando se o usuário existe...');
  const user = await prisma.user.findFirst({
    where: { email: TARGET_EMAIL },
    include: {
      tenant: { select: { id: true, slug: true, name: true } },
    },
  });

  if (user) {
    console.log('   ✅ Usuário encontrado:');
    console.log(`      ID: ${user.id}`);
    console.log(`      Email: ${user.email}`);
    console.log(`      Criado em: ${user.createdAt}`);
    console.log(`      TenantId: ${user.tenantId}`);
    if (user.tenant) {
      console.log(`      Tenant Slug: ${user.tenant.slug}`);
      console.log(`      Tenant Nome: ${user.tenant.name}`);
      
      if (user.tenant.slug === 'brewjaria') {
        console.log('   ✅ TENANT CORRETO: brewjaria');
      } else {
        console.log(`   ⚠️  TENANT INCORRETO: ${user.tenant.slug} (esperado: brewjaria)`);
      }
    } else {
      console.log('   ❌ TENANT NULL - Usuário órfão!');
    }
  } else {
    console.log('   ❌ Usuário NÃO encontrado neste banco');
  }

  // 2️⃣ Verificar todos os tenants
  console.log('\n2️⃣ Verificando todos os tenants...');
  const tenants = await prisma.tenant.findMany({
    orderBy: { slug: 'asc' },
    select: { id: true, slug: true, name: true },
  });

  console.log('   Tenants existentes:');
  tenants.forEach((t) => {
    const marker = t.slug === 'brewjaria' ? '✅' : '  ';
    console.log(`   ${marker} ${t.slug} (${t.name})`);
  });

  const hasBrew = tenants.some((t) => t.slug === 'brew');
  const hasBrewjaria = tenants.some((t) => t.slug === 'brewjaria');

  if (hasBrew) {
    console.log('   ⚠️  ALERTA: Slug antigo "brew" ainda existe!');
  }
  if (!hasBrewjaria) {
    console.log('   ❌ ERRO: Tenant "brewjaria" não existe!');
  }

  // 3️⃣ Verificar usuários órfãos
  console.log('\n3️⃣ Verificando usuários órfãos...');
  const orphanUsers = await prisma.$queryRaw<Array<{ id: string; email: string; tenantId: string }>>`
    SELECT u.id, u.email, u."tenantId"
    FROM "User" u
    LEFT JOIN "Tenant" t ON t.id = u."tenantId"
    WHERE t.id IS NULL
  `;

  if (orphanUsers.length === 0) {
    console.log('   ✅ Nenhum usuário órfão encontrado');
  } else {
    console.log(`   ⚠️  ${orphanUsers.length} usuário(s) órfão(s):`);
    orphanUsers.forEach((u) => {
      console.log(`      - ${u.email} (tenantId: ${u.tenantId})`);
    });
  }

  // 4️⃣ Distribuição de usuários por tenant
  console.log('\n4️⃣ Distribuição de usuários por tenant...');
  const distribution = await prisma.$queryRaw<Array<{ slug: string; total_users: bigint }>>`
    SELECT t.slug, COUNT(u.id) AS total_users
    FROM "Tenant" t
    LEFT JOIN "User" u ON u."tenantId" = t.id
    GROUP BY t.slug
    ORDER BY t.slug
  `;

  distribution.forEach((d) => {
    console.log(`   - ${d.slug}: ${d.total_users} usuário(s)`);
  });

  // 5️⃣ Verificar duplicidade de e-mail
  console.log('\n5️⃣ Verificando duplicidade de e-mail...');
  const duplicates = await prisma.user.count({
    where: { email: TARGET_EMAIL },
  });

  if (duplicates === 1) {
    console.log('   ✅ Nenhuma duplicidade (1 registro)');
  } else if (duplicates === 0) {
    console.log('   ⚠️  Usuário não existe');
  } else {
    console.log(`   ❌ DUPLICIDADE: ${duplicates} registros com mesmo e-mail!`);
  }

  // 6️⃣ Diagnóstico final
  console.log('\n' + '='.repeat(60));
  console.log('📊 DIAGNÓSTICO FINAL');
  console.log('='.repeat(60));

  if (!user) {
    console.log('❌ Usuário não existe neste ambiente');
    console.log('   Possíveis causas:');
    console.log('   - Ambiente diferente (dev vs prod)');
    console.log('   - Usuário nunca foi criado');
    console.log('   - Banco foi resetado');
  } else if (!user.tenant) {
    console.log('🔧 Usuário ÓRFÃO - tenant perdido');
    console.log('   Correção necessária: reassociar ao tenant brewjaria');
  } else if (user.tenant.slug !== 'brewjaria') {
    console.log(`🔧 Usuário no tenant ERRADO: ${user.tenant.slug}`);
    console.log('   Correção necessária: reassociar ao tenant brewjaria');
  } else {
    console.log('✅ TUDO OK - Usuário existe e está no tenant correto');
  }

  console.log('');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

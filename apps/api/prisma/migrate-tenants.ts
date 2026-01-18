/**
 * Script de migração de tenants para Go Live
 * 
 * AÇÕES:
 * 1. Renomear tenant "brew" para "brewjaria" (se existir)
 * 2. Criar tenants faltantes (demo tenants)
 * 
 * Executa: npx ts-node prisma/migrate-tenants.ts
 * 
 * SEGURO: Não deleta dados, apenas atualiza/cria
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Tenants a criar/verificar
const TENANTS_TO_CREATE = [
  { slug: 'brewjaria', name: 'Brewjaria' },
  { slug: 'template-light', name: 'Template Light' },
  { slug: 'wine-club', name: 'Wine Club' },
  { slug: 'coffee-club', name: 'Coffee Club' },
  { slug: 'pet-box', name: 'Pet Box' },
];

async function main() {
  console.log('🚀 Iniciando migração de tenants...\n');

  // 1. Verificar se "brew" existe e "brewjaria" não
  const brewTenant = await prisma.tenant.findUnique({
    where: { slug: 'brew' },
  });

  const brewjariaTenant = await prisma.tenant.findUnique({
    where: { slug: 'brewjaria' },
  });

  // 2. Migrar "brew" → "brewjaria" se necessário
  if (brewTenant && !brewjariaTenant) {
    console.log('🔄 Migrando tenant "brew" → "brewjaria"...');
    
    await prisma.tenant.update({
      where: { id: brewTenant.id },
      data: { slug: 'brewjaria' },
    });
    
    console.log('✅ Tenant renomeado: brew → brewjaria');
    console.log(`   ID mantido: ${brewTenant.id}`);
    console.log('   Todos os usuários e assinaturas permanecem vinculados.\n');
  } else if (brewjariaTenant) {
    console.log('✅ Tenant "brewjaria" já existe. Nenhuma migração necessária.\n');
  }

  // 3. Criar tenants faltantes
  console.log('📦 Criando tenants faltantes...\n');

  for (const tenantData of TENANTS_TO_CREATE) {
    const existing = await prisma.tenant.findUnique({
      where: { slug: tenantData.slug },
    });

    if (existing) {
      console.log(`   ⏭️  ${tenantData.slug} - já existe`);
    } else {
      const created = await prisma.tenant.create({
        data: {
          name: tenantData.name,
          slug: tenantData.slug,
        },
      });
      console.log(`   ✅ ${tenantData.slug} - criado (id: ${created.id})`);
    }
  }

  // 4. Listar resultado final
  console.log('\n📋 Tenants no banco após migração:');
  const allTenants = await prisma.tenant.findMany({
    select: { id: true, slug: true, name: true },
    orderBy: { slug: 'asc' },
  });

  allTenants.forEach((t) => {
    console.log(`   - ${t.slug} (${t.name})`);
  });

  // 5. Verificar planos do brewjaria
  console.log('\n📦 Verificando planos do tenant brewjaria...');
  const brewjariaWithPlans = await prisma.tenant.findUnique({
    where: { slug: 'brewjaria' },
    include: {
      plans: {
        include: {
          prices: true,
        },
      },
    },
  });

  if (brewjariaWithPlans?.plans.length) {
    console.log(`   ✅ ${brewjariaWithPlans.plans.length} plano(s) encontrado(s):`);
    brewjariaWithPlans.plans.forEach((plan) => {
      console.log(`      - ${plan.slug} (${plan.name})`);
      plan.prices.forEach((price) => {
        console.log(`        • ${price.interval}: R$ ${price.amountCents / 100}`);
      });
    });
  } else {
    console.log('   ⚠️  Nenhum plano encontrado para brewjaria');
    console.log('   Execute: npx prisma db seed');
  }

  console.log('\n🎉 Migração concluída!');
}

main()
  .catch((e) => {
    console.error('❌ Erro na migração:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

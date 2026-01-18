/**
 * Script de verificação e criação de tenants
 * Executa: npx ts-node prisma/check-tenants.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Tenants esperados (do frontend)
const EXPECTED_TENANTS = [
  { slug: 'brewjaria', name: 'Brewjaria' },
  { slug: 'template-light', name: 'Template Light' },
  { slug: 'wine-club', name: 'Wine Club' },
  { slug: 'coffee-club', name: 'Coffee Club' },
  { slug: 'pet-box', name: 'Pet Box' },
];

async function main() {
  console.log('🔍 Verificando tenants no banco de dados...\n');

  // 1. Listar tenants existentes
  const existingTenants = await prisma.tenant.findMany({
    select: { id: true, slug: true, name: true },
    orderBy: { slug: 'asc' },
  });

  console.log('📋 Tenants existentes no banco:');
  if (existingTenants.length === 0) {
    console.log('   (nenhum)');
  } else {
    existingTenants.forEach((t) => {
      console.log(`   - ${t.slug} (${t.name}) [id: ${t.id}]`);
    });
  }
  console.log('');

  // 2. Comparar com esperados
  const existingSlugs = existingTenants.map((t) => t.slug);
  const missingSlugs = EXPECTED_TENANTS.filter(
    (t) => !existingSlugs.includes(t.slug)
  );
  const extraSlugs = existingSlugs.filter(
    (slug) => !EXPECTED_TENANTS.find((t) => t.slug === slug)
  );

  console.log('📋 Tenants esperados (frontend):');
  EXPECTED_TENANTS.forEach((t) => {
    const status = existingSlugs.includes(t.slug) ? '✅' : '❌';
    console.log(`   ${status} ${t.slug}`);
  });
  console.log('');

  // 3. Alertar sobre slugs extras (possível inconsistência)
  if (extraSlugs.length > 0) {
    console.log('⚠️  Tenants no banco que NÃO existem no frontend:');
    extraSlugs.forEach((slug) => {
      console.log(`   - ${slug}`);
    });
    console.log('   (Pode ser o slug antigo "brew" - verificar migração)');
    console.log('');
  }

  // 4. Resumo
  console.log('📊 Resumo:');
  console.log(`   - Tenants no banco: ${existingTenants.length}`);
  console.log(`   - Tenants esperados: ${EXPECTED_TENANTS.length}`);
  console.log(`   - Faltando criar: ${missingSlugs.length}`);
  console.log('');

  if (missingSlugs.length > 0) {
    console.log('🔧 Tenants a criar:');
    missingSlugs.forEach((t) => {
      console.log(`   - ${t.slug} (${t.name})`);
    });
    console.log('');
  }

  // 5. Verificar se "brew" existe e "brewjaria" não
  const brewExists = existingSlugs.includes('brew');
  const brewjariaExists = existingSlugs.includes('brewjaria');

  if (brewExists && !brewjariaExists) {
    console.log('⚠️  ATENÇÃO: Slug "brew" existe mas "brewjaria" não!');
    console.log('   O frontend usa "brewjaria", mas o banco tem "brew".');
    console.log('   Opções:');
    console.log('   1. Renomear "brew" para "brewjaria" no banco');
    console.log('   2. Alterar o frontend para usar "brew"');
    console.log('');
  }

  return { existingTenants, missingSlugs, extraSlugs };
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

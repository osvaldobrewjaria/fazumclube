import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando usuários de teste...\n');

  const users = await prisma.user.findMany({
    where: {
      email: { contains: 'golive' }
    },
    select: {
      email: true,
      name: true,
      tenant: { select: { slug: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log('📋 Usuários criados nos testes:');
  if (users.length === 0) {
    console.log('   (nenhum usuário de teste encontrado)');
  } else {
    users.forEach((u) => {
      console.log(`   ✅ ${u.email} → tenant: ${u.tenant.slug}`);
    });
  }

  // Verificar isolamento
  console.log('\n📊 Contagem por tenant:');
  const counts = await prisma.user.groupBy({
    by: ['tenantId'],
    _count: true,
  });

  for (const c of counts) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: c.tenantId },
      select: { slug: true }
    });
    console.log(`   - ${tenant?.slug || 'unknown'}: ${c._count} usuário(s)`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

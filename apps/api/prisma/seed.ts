import { PrismaClient, BusinessType, TenantStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Settings padrão para novos tenants
const defaultSettings = {
  currency: 'BRL',
  country: 'BR',
  timezone: 'America/Sao_Paulo',
  theme: {
    primaryColor: '#4f46e5',
    secondaryColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
  },
  content: {
    heroTitle: 'Assine e receba todo mês',
    heroSubtitle: 'Os melhores produtos selecionados para você',
    ctaText: 'Quero Assinar',
  },
  layout: {
    showTestimonials: true,
    showFAQ: true,
    showFeatures: true,
  },
};

async function main() {
  console.log('🌱 Seeding ClubSaaS database...');

  // ============================================
  // TENANT 1: Brewjaria (cliente real)
  // ============================================
  const brewjariaSettings = {
    currency: 'BRL',
    country: 'BR',
    timezone: 'America/Sao_Paulo',
    theme: {
      primaryColor: '#D4AF37',
      secondaryColor: '#1A1A1A',
      backgroundColor: '#0D0D0D',
      textColor: '#FFFFFF',
    },
    content: {
      heroTitle: 'Você nunca bebeu cerveja assim.',
      heroSubtitle: 'Cervejas artesanais ultra frescas, produzidas em pequenos lotes e entregues no auge do sabor.',
      ctaText: 'Começar Agora',
    },
    images: {
      logoUrl: '/logo.png',
      heroImageUrl: '',
    },
    sections: {
      featuresTitle: 'Por que escolher a Brewjaria?',
      featuresSubtitle: 'Descubra os benefícios de fazer parte do nosso clube',
      features: [
        { icon: 'Beer', title: 'Cervejas Exclusivas', description: 'Seleção mensal de cervejas artesanais de cervejarias premiadas.' },
        { icon: 'Truck', title: 'Entrega Grátis', description: 'Frete grátis para São Paulo Capital e região metropolitana.' },
        { icon: 'Star', title: 'Guia de Degustação', description: 'Aprenda sobre cada cerveja com nosso guia exclusivo.' },
        { icon: 'Gift', title: 'Brindes Especiais', description: 'Receba brindes surpresa em datas comemorativas.' },
      ],
    },
    testimonials: [
      { name: 'Carlos Silva', role: 'Assinante há 1 ano', content: 'As melhores cervejas que já experimentei! Cada mês é uma surpresa incrível.', avatar: '' },
      { name: 'Ana Paula', role: 'Assinante há 6 meses', content: 'O guia de degustação é sensacional. Aprendi muito sobre cervejas artesanais.', avatar: '' },
      { name: 'Roberto Mendes', role: 'Assinante há 2 anos', content: 'Presente perfeito para quem ama cerveja. Recomendo demais!', avatar: '' },
    ],
    faq: [
      { question: 'Como funciona a entrega?', answer: 'Enviamos sua caixa todo dia 15 do mês. O frete é grátis para São Paulo Capital.' },
      { question: 'Posso cancelar a qualquer momento?', answer: 'Sim! Você pode cancelar ou pausar sua assinatura quando quiser, sem multa.' },
      { question: 'Quais cervejas vou receber?', answer: 'Selecionamos cervejas artesanais de cervejarias premiadas. Cada mês é uma surpresa!' },
      { question: 'Posso dar de presente?', answer: 'Claro! Temos opção de assinatura presente com cartão personalizado.' },
    ],
    layout: {
      showTestimonials: true,
      showFAQ: true,
      showFeatures: true,
    },
  };

  const brewjaria = await prisma.tenant.upsert({
    where: { slug: 'brewjaria' },
    update: {
      // Atualizar settings se o tenant já existir (preservar personalizações)
      settings: brewjariaSettings,
    },
    create: {
      name: 'Brewjaria',
      slug: 'brewjaria',
      tagline: 'Cervejas artesanais selecionadas para você',
      description: 'A melhor experiência em cervejas artesanais premium do Brasil.',
      businessType: BusinessType.BEER,
      status: TenantStatus.ACTIVE,
      settings: brewjariaSettings,
    },
  });
  console.log('✅ Tenant created:', brewjaria.slug);

  // Plano Brewjaria
  const planBrewjaria = await prisma.plan.upsert({
    where: { slug: 'clube-brewjaria' },
    update: {},
    create: {
      tenantId: brewjaria.id,
      name: 'Clube Brewjaria',
      slug: 'clube-brewjaria',
      description: '4 cervejas artesanais premium por mês',
      price: 115.00,
      interval: 'MONTHLY',
      features: ['4 cervejas artesanais', 'Guia de degustação', 'Frete grátis'],
      highlighted: true,
      active: true,
    },
  });
  console.log('✅ Plan created:', planBrewjaria.slug);

  // ============================================
  // TENANT 2: Pilot (tenant de teste/sandbox)
  // ============================================
  const pilot = await prisma.tenant.upsert({
    where: { slug: 'pilot' },
    update: {},
    create: {
      name: 'Clube Pilot',
      slug: 'pilot',
      tagline: 'Tenant de teste da plataforma',
      description: 'Usado para validar novas funcionalidades antes de ir para produção.',
      businessType: BusinessType.OTHER,
      status: TenantStatus.TRIAL,
      settings: defaultSettings,
    },
  });
  console.log('✅ Tenant created:', pilot.slug);

  // Plano Pilot
  const planPilot = await prisma.plan.upsert({
    where: { slug: 'plano-pilot-basico' },
    update: {},
    create: {
      tenantId: pilot.id,
      name: 'Plano Básico',
      slug: 'plano-pilot-basico',
      description: 'Plano de teste',
      price: 49.90,
      interval: 'MONTHLY',
      features: ['Benefício 1', 'Benefício 2', 'Frete grátis'],
      highlighted: false,
      active: true,
    },
  });
  console.log('✅ Plan created:', planPilot.slug);

  const planPilotPremium = await prisma.plan.upsert({
    where: { slug: 'plano-pilot-premium' },
    update: {},
    create: {
      tenantId: pilot.id,
      name: 'Plano Premium',
      slug: 'plano-pilot-premium',
      description: 'Plano premium de teste',
      price: 99.90,
      interval: 'MONTHLY',
      features: ['Tudo do Básico', 'Benefício extra', 'Acesso VIP'],
      highlighted: true,
      active: true,
    },
  });
  console.log('✅ Plan created:', planPilotPremium.slug);

  console.log('🎉 Seed completed! Tenants: brewjaria, pilot');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

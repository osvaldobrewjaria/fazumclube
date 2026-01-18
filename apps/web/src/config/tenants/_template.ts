/**
 * TENANT TEMPLATE
 * 
 * Use este arquivo como base para criar novos tenants.
 * 
 * Passos:
 * 1. Copie este arquivo para: tenants/meu-tenant.ts
 * 2. Substitua todos os valores marcados com [SUBSTITUIR]
 * 3. Importe e registre em tenants/index.ts
 * 4. Crie o tema em themes.ts (ou use um existente)
 * 5. Adicione assets em public/tenants/[slug]/
 * 
 * Campos obrigatórios estão marcados com // OBRIGATÓRIO
 * Campos opcionais estão marcados com // OPCIONAL
 */

import type { TenantConfig } from '@/config/tenants'

export const templateTenant: TenantConfig = {
  // ============================================
  // IDENTIFICAÇÃO (OBRIGATÓRIO)
  // ============================================
  id: '[SUBSTITUIR]',           // Ex: 'meu-clube'
  slug: '[SUBSTITUIR]',         // Ex: 'meu-clube' (usado na URL /t/meu-clube)
  name: '[SUBSTITUIR]',         // Ex: 'Meu Clube'
  
  // Domínios que resolvem para este tenant (OPCIONAL)
  // Em produção, configure DNS para apontar para o servidor
  domains: [
    // 'meuclube.com.br',
    // 'www.meuclube.com.br',
  ],
  
  // ============================================
  // BRANDING (OBRIGATÓRIO)
  // ============================================
  logo: '/tenants/[SLUG]/logo.png',    // Criar em public/tenants/[slug]/
  favicon: '/tenants/[SLUG]/favicon.svg',  // OPCIONAL: favicon customizado
  brandText: {
    line1: '[LINHA1]',    // Ex: 'MEU'
    line2: '[LINHA2].',   // Ex: 'CLUBE.'
  },
  tagline: '[SUBSTITUIR]',      // Ex: 'Sua tagline aqui'
  description: '[SUBSTITUIR]',  // Descrição para SEO
  
  // ============================================
  // TEMA (OBRIGATÓRIO)
  // ============================================
  // Slugs disponíveis: 'light-blue', 'coffee', 'nature', 'wine', 'brewjaria-dark'
  // Ou crie um novo em src/config/themes.ts
  themeSlug: 'light-blue',
  
  // ============================================
  // FEATURE FLAGS (OPCIONAL)
  // ============================================
  featureFlags: {
    showCarousel: false,        // Carrossel de imagens no hero
    showHowItWorks: true,       // Seção "Como Funciona"
    showFeatures: true,         // Seção "Por que escolher"
    enableSubscription: true,   // Habilita fluxo de assinatura
    enableLogin: true,          // Habilita login
  },
  
  // ============================================
  // HERO (OBRIGATÓRIO)
  // ============================================
  hero: {
    title: '[SUBSTITUIR]',      // Título principal
    subtitle: '[SUBSTITUIR]',   // Subtítulo explicativo
    cta: 'Começar Agora',       // Texto do botão
    // images: ['/tenants/[SLUG]/hero-1.jpg'],  // OPCIONAL: imagens do carrossel
  },
  
  // ============================================
  // PLANOS (OBRIGATÓRIO - mínimo 1)
  // ============================================
  plans: [
    {
      id: 'basico',
      name: 'Básico',
      price: 49.90,
      // originalPrice: 59.90,  // OPCIONAL: preço riscado
      features: [
        'Benefício 1',
        'Benefício 2',
        'Benefício 3',
      ],
      // highlighted: false,    // OPCIONAL: destaca o card
      // badge: 'Mais Popular', // OPCIONAL: badge no topo
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 99.90,
      highlighted: true,
      badge: 'Mais Popular',
      features: [
        'Tudo do Básico',
        'Benefício extra 1',
        'Benefício extra 2',
        'Benefício extra 3',
      ],
    },
  ],
  
  // ============================================
  // SEÇÕES DE CONTEÚDO (OBRIGATÓRIO)
  // ============================================
  sections: {
    features: {
      title: 'Por que nos escolher?',
      subtitle: 'Nossos diferenciais',
      items: [
        {
          icon: 'Star',         // Ícone do lucide-react
          title: 'Qualidade',
          description: 'Descrição do benefício',
        },
        {
          icon: 'Truck',
          title: 'Entrega Rápida',
          description: 'Descrição do benefício',
        },
        {
          icon: 'Shield',
          title: 'Segurança',
          description: 'Descrição do benefício',
        },
        {
          icon: 'Heart',
          title: 'Satisfação',
          description: 'Descrição do benefício',
        },
      ],
    },
    howItWorks: {
      title: 'Como Funciona',
      steps: [
        {
          number: '01',
          title: 'Escolha seu plano',
          description: 'Selecione o plano ideal para você',
        },
        {
          number: '02',
          title: 'Receba em casa',
          description: 'Entregamos no conforto da sua casa',
        },
        {
          number: '03',
          title: 'Aproveite',
          description: 'Desfrute dos produtos selecionados',
        },
      ],
    },
  },
  
  // ============================================
  // CONTATO (OBRIGATÓRIO)
  // ============================================
  contact: {
    email: '[SUBSTITUIR]@email.com',
    // phone: '(11) 0000-0000',      // OPCIONAL
    // whatsapp: '5511900000000',    // OPCIONAL
  },
  
  // ============================================
  // DADOS LEGAIS (OBRIGATÓRIO)
  // ============================================
  legal: {
    companyName: '[RAZÃO SOCIAL]',
    cnpj: '00.000.000/0001-00',
    address: '[ENDEREÇO COMPLETO]',
  },
  
  // ============================================
  // SEO (OBRIGATÓRIO)
  // ============================================
  seo: {
    title: '[NOME] | [DESCRIÇÃO CURTA]',
    description: '[META DESCRIPTION PARA GOOGLE]',
    keywords: ['palavra-chave-1', 'palavra-chave-2'],
  },
  
  // ============================================
  // ASSINATURA (OBRIGATÓRIO para checkout)
  // ============================================
  subscription: {
    checkoutMode: 'link',       // 'link' = redireciona | 'embedded' = steps internos
    checkoutUrl: '#pricing',    // URL padrão (ou link Stripe)
    ctaLabel: 'Assinar Agora',
    // URLs específicas por plano (OPCIONAL)
    planCheckoutUrls: {
      // 'basico': 'https://checkout.stripe.com/...',
      // 'premium': 'https://checkout.stripe.com/...',
    },
  },
  
  // ============================================
  // NAVEGAÇÃO CUSTOMIZADA (OPCIONAL)
  // ============================================
  // navigation: [
  //   { label: 'Home', href: '#' },
  //   { label: 'Planos', href: '#pricing' },
  // ],
  
  // ============================================
  // LINKS DO FOOTER (OPCIONAL)
  // ============================================
  // footerLinks: [
  //   { label: 'FAQ', href: '/faq' },
  //   { label: 'Blog', href: '/blog' },
  // ],
}

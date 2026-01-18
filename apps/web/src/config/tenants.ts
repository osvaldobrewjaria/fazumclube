// Configuração Multi-Tenant
// Cada tenant (empresa/marca) tem suas próprias configurações
// Nenhuma marca é "principal" - todas são tenants iguais
import { testClubTenant } from './tenants/test-club'

// Importar tenants externos (criados via pnpm tenant:new)
// [Tenants de teste removidos para recriação - 22/12/2025]

export interface PlanConfig {
  id: string
  name: string
  price: number
  originalPrice?: number
  features: string[]
  highlighted?: boolean
  badge?: string
}

export interface FeatureItem {
  icon: string
  title: string
  description: string
}

export interface HowItWorksStep {
  number: string
  title: string
  description: string
}

export interface TenantConfig {
  // Identificação
  id: string
  name: string
  slug: string
  
  // Domínios que resolvem para este tenant
  domains?: string[]
  
  // Branding
  logo: string
  logoAlt?: string
  favicon?: string  // Favicon do tenant (ex: '/tenants/brewjaria/favicon.svg')
  brandText: {
    line1: string
    line2: string
  }
  tagline: string
  description: string
  
  // Referência ao tema (não embute ThemeConfig)
  themeSlug: string
  
  // Cores personalizadas (sobrescrevem o tema)
  customColors?: {
    primary?: string
    secondary?: string
    background?: string
    foreground?: string
  }
  
  // Feature flags por marca (controle de funcionalidades)
  featureFlags?: Record<string, boolean>
  
  // Conteúdo da Hero
  hero: {
    title: string
    subtitle: string
    cta: string
    image?: string
    images?: string[]
  }
  
  // Planos de assinatura
  plans: PlanConfig[]
  
  // Seções de conteúdo
  sections: {
    features: {
      title: string
      subtitle: string
      items: FeatureItem[]
    }
    howItWorks: {
    title: string
    steps: HowItWorksStep[]
    }
  }
  
  // Contato
  contact: {
    email: string
    phone?: string
    whatsapp?: string
    instagram?: string
    address?: string
  }
  
  // Dados Legais
  legal: {
    companyName: string
    cnpj: string
    address: string
  }
  
  // SEO
  seo: {
    title: string
    description: string
    keywords: string[]
  }
  
  // Depoimentos personalizados (opcional)
  testimonials?: {
    name: string
    role: string
    content: string
    rating: number
  }[]
  
  // FAQ personalizado (opcional)
  faq?: {
    question: string
    answer: string
  }[]
  
  // Links de navegação customizados (opcional)
  navigation?: {
    label: string
    href: string
  }[]
  
  // Footer links (opcional)
  footerLinks?: {
    label: string
    href: string
  }[]
  
  // Configuração de assinatura (opcional)
  subscription?: {
    checkoutMode: 'link' | 'embedded'
    checkoutUrl?: string // URL genérica de checkout
    planCheckoutUrls?: Record<string, string> // URLs por plano
    ctaLabel?: string
  }
}

// ============================================
// BREWJARIA - Tenant de Cervejas Artesanais
// ============================================
const brewjaria: TenantConfig = {
  id: 'brewjaria',
  name: 'Brewjaria',
  slug: 'brewjaria',
  
  // Domínios que resolvem para este tenant
  domains: [
    'brewjaria.com.br',
    'www.brewjaria.com.br',
    'brewjaria.netlify.app',
  ],
  
  logo: '/logo.png',
  favicon: '/favicon.svg',  // Favicon global (brewjaria é o tenant principal)
  brandText: {
    line1: 'BREW',
    line2: 'JARIA.',
  },
  tagline: 'Cervejas artesanais selecionadas para você',
  description: 'A melhor experiência em cervejas artesanais premium do Brasil.',
  
  // Referência ao tema (não embute o objeto)
  themeSlug: 'brewjaria-dark',
  
  // Feature flags (controle de funcionalidades)
  featureFlags: {
    showCarousel: true,
    showHowItWorks: true,
    showFeatures: true,
    enableSubscription: true,
    enableLogin: true,
  },
  
  hero: {
    title: 'Você nunca bebeu cerveja assim.',
    subtitle: 'Cervejas artesanais ultra frescas, produzidas em pequenos lotes e entregues no auge do sabor.',
    cta: 'Começar Agora',
    images: ['/hero/beer1.jpg', '/hero/beer2.jpg', '/hero/beer3.jpg'],
  },
  
  plans: [
    {
      id: 'explorer',
      name: 'Explorer',
      price: 89.90,
      originalPrice: 119.90,
      features: [
        '4 cervejas artesanais',
        'Guia de degustação',
        'Frete grátis',
        'Acesso à comunidade',
      ],
      badge: 'Mais Popular',
      highlighted: true,
    },
    {
      id: 'connoisseur',
      name: 'Connoisseur',
      price: 149.90,
      originalPrice: 189.90,
      features: [
        '6 cervejas premium',
        'Guia de degustação',
        'Frete grátis',
        'Acesso à comunidade',
        'Brindes exclusivos',
        'Acesso antecipado',
      ],
    },
  ],
  
  sections: {
    features: {
      title: 'Por que escolher Brewjaria?',
      subtitle: 'Tudo que você precisa para uma experiência premium',
      items: [
        {
          icon: 'Beer',
          title: 'Seleção Premium',
          description: 'Cervejas artesanais selecionadas por especialistas',
        },
        {
          icon: 'Globe',
          title: 'Diversidade',
          description: 'Cervejas de diferentes regiões e estilos',
        },
        {
          icon: 'BookOpen',
          title: 'Educação',
          description: 'Notas de degustação e história de cada cerveja',
        },
        {
          icon: 'Gift',
          title: 'Surpresas',
          description: 'Novidades e edições limitadas todo mês',
        },
        {
          icon: 'Truck',
          title: 'Entrega Rápida',
          description: 'Frete grátis para todo o Brasil',
        },
        {
          icon: 'MessageCircle',
          title: 'Comunidade',
          description: 'Acesso a grupo exclusivo de membros',
        },
      ],
    },
    howItWorks: {
      title: 'Como Funciona',
      steps: [
        {
          number: '01',
          title: 'Escolha seu plano',
          description: 'Selecione o plano que melhor se adapta ao seu paladar',
        },
        {
          number: '02',
          title: 'Receba em casa',
          description: 'Todo mês, uma seleção exclusiva na sua porta',
        },
        {
          number: '03',
          title: 'Deguste e aprenda',
          description: 'Explore novos sabores com nosso guia de degustação',
        },
      ],
    },
  },
  
  navigation: [
    { label: 'Home', href: '#' },
    { label: 'Planos', href: '#pricing' },
  ],
  
  footerLinks: [
    { label: 'Contato', href: 'https://www.instagram.com/brewjaria/' },
    { label: 'Privacidade', href: '/privacidade' },
    { label: 'Termos de Serviço', href: '/termos' },
  ],
  
  contact: {
    email: 'contato@brewjaria.com.br',
    whatsapp: '5511999999999',
    instagram: 'https://www.instagram.com/brewjaria/',
  },
  
  legal: {
    companyName: '[RAZÃO SOCIAL DA EMPRESA]',
    cnpj: '[CNPJ]',
    address: '[ENDEREÇO COMPLETO]',
  },
  
  seo: {
    title: 'Brewjaria | Clube de Assinatura de Cervejas Artesanais',
    description: 'Receba cervejas artesanais selecionadas todo mês. Frete grátis para todo Brasil.',
    keywords: ['cerveja artesanal', 'clube de assinatura', 'beer club', 'cervejas premium'],
  },
}

// ============================================
// TEMPLATE - Exemplo para novas marcas (Light)
// ============================================
const templateLight: TenantConfig = {
  id: 'template-light',
  name: 'Template Light',
  slug: 'template-light',
  
  domains: [],
  
  logo: '/logo.png',
  brandText: {
    line1: 'MINHA',
    line2: 'MARCA.',
  },
  tagline: 'Sua tagline aqui',
  description: 'Descrição da sua marca.',
  
  themeSlug: 'light-blue',
  
  featureFlags: {
    showCarousel: true,
    showHowItWorks: true,
    showFeatures: true,
    enableSubscription: true,
    enableLogin: true,
  },
  
  hero: {
    title: 'Título principal do seu negócio',
    subtitle: 'Subtítulo explicando o valor do seu serviço.',
    cta: 'Começar Agora',
  },
  
  plans: [
    {
      id: 'basico',
      name: 'Básico',
      price: 49.90,
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 99.90,
      features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4', 'Feature 5'],
      highlighted: true,
      badge: 'Mais Popular',
    },
  ],
  
  sections: {
    features: {
      title: 'Por que nos escolher?',
      subtitle: 'Nossos diferenciais',
      items: [
        { icon: 'Star', title: 'Qualidade', description: 'Descrição do benefício' },
        { icon: 'Shield', title: 'Segurança', description: 'Descrição do benefício' },
        { icon: 'Zap', title: 'Rapidez', description: 'Descrição do benefício' },
      ],
    },
    howItWorks: {
      title: 'Como Funciona',
      steps: [
        { number: '01', title: 'Passo 1', description: 'Descrição do passo' },
        { number: '02', title: 'Passo 2', description: 'Descrição do passo' },
        { number: '03', title: 'Passo 3', description: 'Descrição do passo' },
      ],
    },
  },
  
  navigation: [
    { label: 'Home', href: '#' },
    { label: 'Planos', href: '#pricing' },
  ],
  
  footerLinks: [
    { label: 'Contato', href: 'mailto:contato@suamarca.com.br' },
    { label: 'Privacidade', href: '/privacidade' },
    { label: 'Termos', href: '/termos' },
  ],
  
  contact: {
    email: 'contato@suamarca.com.br',
  },
  
  legal: {
    companyName: '[RAZÃO SOCIAL]',
    cnpj: '[CNPJ]',
    address: '[ENDEREÇO]',
  },
  
  seo: {
    title: 'Minha Marca | Descrição',
    description: 'Meta description para SEO',
    keywords: ['keyword1', 'keyword2'],
  },
}

// ============================================
// REGISTRO DE TENANTS
// Chave = slug (não confundir com id do banco)
// ============================================
export const TENANTS: Record<string, TenantConfig> = {
  brewjaria,
  'template-light': templateLight,
  'test-club': testClubTenant,
  // Tenants de teste removidos para recriação - 22/12/2025
  // Para adicionar novos tenants, use: pnpm tenant:new
}

// Slug do tenant padrão (apenas para dev/localhost)
// NOTA: Isso é o SLUG, não o ID do banco (cuid)
export const DEFAULT_TENANT_SLUG = 'brewjaria'

// Alias para compatibilidade (deprecated)
export const DEFAULT_TENANT_ID = DEFAULT_TENANT_SLUG

/**
 * Busca tenant por slug (chave do objeto TENANTS)
 * NOTA: O parâmetro é o SLUG, não o ID do banco
 * @deprecated Use getTenantBySlug para maior clareza
 */
export function getTenantById(slug: string): TenantConfig | undefined {
  return TENANTS[slug]
}

/**
 * Busca tenant por slug
 */
export function getTenantBySlug(slug: string): TenantConfig | undefined {
  return Object.values(TENANTS).find(t => t.slug === slug)
}

/**
 * Busca tenant por domínio
 */
export function getTenantByDomain(domain: string): TenantConfig | undefined {
  const normalizedDomain = domain.toLowerCase().replace(/^www\./, '')
  return Object.values(TENANTS).find(t => 
    t.domains?.some(d => d.toLowerCase().replace(/^www\./, '') === normalizedDomain)
  )
}

/**
 * Lista todos os tenants
 */
export function getAllTenants(): TenantConfig[] {
  return Object.values(TENANTS)
}

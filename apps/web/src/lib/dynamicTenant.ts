/**
 * Dynamic Tenant Resolution
 * 
 * Busca tenants da API quando não encontrados na configuração estática.
 * Isso permite que novos tenants criados via onboarding funcionem automaticamente.
 */

import { TenantConfig, getTenantBySlug as getStaticTenant } from '@/config/tenants'
import { getTheme, ThemeConfig, DEFAULT_THEME_SLUG } from '@/config/themes'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Cache de tenants dinâmicos (em memória)
const dynamicTenantCache = new Map<string, TenantConfig | null>()

interface ApiTenantSettings {
  theme?: {
    primaryColor?: string
    secondaryColor?: string
    backgroundColor?: string
    textColor?: string
  }
  content?: {
    heroTitle?: string
    heroSubtitle?: string
    ctaText?: string
  }
  images?: {
    logoUrl?: string
    heroImageUrl?: string
  }
  sections?: {
    featuresTitle?: string
    featuresSubtitle?: string
    features?: Array<{
      icon: string
      title: string
      description: string
    }>
  }
  testimonials?: Array<{
    name: string
    role: string
    content: string
    rating: number
  }>
  faq?: Array<{
    question: string
    answer: string
  }>
  layout?: {
    showTestimonials?: boolean
    showFAQ?: boolean
    showFeatures?: boolean
  }
  contact?: {
    email?: string
    phone?: string
  }
}

interface ApiTenant {
  id: string
  name: string
  slug: string
  businessType: string
  tagline?: string
  description?: string
  logoUrl?: string
  settings?: ApiTenantSettings
}

interface ApiPlan {
  id: string
  name: string
  description?: string
  price: number
  interval: string
  features?: string[]
  highlighted?: boolean
}

/**
 * Cria uma configuração de tenant a partir dos dados da API
 * Usa os settings personalizados se disponíveis
 */
function createDynamicTenantConfig(apiTenant: ApiTenant, apiPlans: ApiPlan[] = []): TenantConfig {
  const settings = apiTenant.settings || {}
  const theme = settings.theme || {}
  const content = settings.content || {}
  const images = settings.images || {}
  const sections = settings.sections || {}
  const layout = settings.layout || {}
  const contact = settings.contact || {}

  return {
    id: apiTenant.id,
    name: apiTenant.name,
    slug: apiTenant.slug,
    logo: images.logoUrl || apiTenant.logoUrl || '/logo-placeholder.svg',
    brandText: {
      line1: apiTenant.name,
      line2: 'Club',
    },
    tagline: apiTenant.tagline || `Bem-vindo ao ${apiTenant.name}`,
    description: apiTenant.description || `${apiTenant.name} - Seu clube de assinaturas`,
    themeSlug: 'default',
    // Cores personalizadas
    customColors: {
      primary: theme.primaryColor,
      secondary: theme.secondaryColor,
      background: theme.backgroundColor,
      foreground: theme.textColor,
    },
    hero: {
      title: content.heroTitle || `Bem-vindo ao ${apiTenant.name}`,
      subtitle: content.heroSubtitle || 'Seu clube de assinaturas exclusivo',
      cta: content.ctaText || 'Assinar Agora',
      image: images.heroImageUrl,
    },
    plans: apiPlans.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      features: p.features || [],
      highlighted: p.highlighted || false,
    })),
    sections: {
      features: {
        title: sections.featuresTitle || 'Por que escolher a gente?',
        subtitle: sections.featuresSubtitle || 'Benefícios exclusivos para assinantes',
        items: sections.features || [],
      },
      howItWorks: {
        title: 'Como funciona',
        steps: [],
      },
    },
    featureFlags: {
      showTestimonials: layout.showTestimonials ?? true,
      showFAQ: layout.showFAQ ?? true,
      showFeatures: layout.showFeatures ?? true,
    },
    // Dados personalizados
    testimonials: settings.testimonials || [],
    faq: settings.faq || [],
    contact: {
      email: contact.email || 'contato@exemplo.com',
      phone: contact.phone,
    },
    legal: {
      companyName: apiTenant.name,
      cnpj: '00.000.000/0000-00',
      address: 'Endereço não configurado',
    },
    seo: {
      title: apiTenant.name,
      description: apiTenant.description || `${apiTenant.name} - Clube de assinaturas`,
      keywords: [apiTenant.slug],
    },
  }
}

/**
 * Resultado da busca de tenant - pode incluir status de suspensão
 */
export interface TenantFetchResult {
  tenant: TenantConfig | null
  suspended?: boolean
  message?: string
}

/**
 * Busca tenant da API por slug
 */
async function fetchTenantFromAPI(slug: string): Promise<TenantFetchResult> {
  try {
    const response = await fetch(`${API_URL}/tenants/${slug}`, {
      cache: 'no-store', // Sempre buscar fresco
    })
    
    if (!response.ok) {
      return { tenant: null }
    }
    
    const data = await response.json()
    
    // Verificar se tenant está suspenso
    if (data.suspended) {
      return { 
        tenant: null, 
        suspended: true, 
        message: data.message || 'Este clube está temporariamente suspenso.' 
      }
    }
    
    if (!data.found || !data.tenant) {
      return { tenant: null }
    }
    
    return { tenant: createDynamicTenantConfig(data.tenant, data.plans || []) }
  } catch (error) {
    console.error(`[DynamicTenant] Erro ao buscar tenant ${slug}:`, error)
    return { tenant: null }
  }
}

/**
 * Busca tenant por slug - primeiro tenta estático, depois API
 * Não usa cache para garantir dados sempre atualizados
 * Retorna TenantFetchResult com informação de suspensão
 */
export async function getDynamicTenantBySlug(slug: string): Promise<TenantFetchResult> {
  // 1. Tentar configuração estática primeiro
  const staticTenant = getStaticTenant(slug)
  if (staticTenant) {
    return { tenant: staticTenant }
  }
  
  // 2. Buscar da API (sempre fresco, sem cache)
  return await fetchTenantFromAPI(slug)
}

/**
 * Resolve tenant com tema - versão assíncrona
 */
export async function resolveDynamicTenant(slug: string): Promise<{
  tenant: TenantConfig
  theme: ThemeConfig
  suspended?: boolean
  message?: string
} | null> {
  const result = await getDynamicTenantBySlug(slug)
  
  if (!result.tenant) {
    return null
  }
  
  return {
    tenant: result.tenant,
    theme: getTheme(result.tenant.themeSlug),
    suspended: result.suspended,
    message: result.message,
  }
}

/**
 * Limpa o cache de tenants dinâmicos
 */
export function clearDynamicTenantCache(): void {
  dynamicTenantCache.clear()
}

/**
 * Schemas Zod para validação de configs
 * 
 * Garante que tenants e themes estão corretos antes de usar
 * Evita quebrar produção com configs inválidas
 */

import { z } from 'zod'

// ============================================
// THEME SCHEMAS
// ============================================

export const ThemeTokensSchema = z.object({
  background: z.string().min(1),
  foreground: z.string().min(1),
  muted: z.string().min(1),
  mutedForeground: z.string().min(1),
  card: z.string().min(1),
  cardForeground: z.string().min(1),
  popover: z.string().min(1),
  popoverForeground: z.string().min(1),
  border: z.string().min(1),
  input: z.string().min(1),
  primary: z.string().min(1),
  primaryForeground: z.string().min(1),
  secondary: z.string().min(1),
  secondaryForeground: z.string().min(1),
  accent: z.string().min(1),
  accentForeground: z.string().min(1),
  destructive: z.string().min(1),
  destructiveForeground: z.string().min(1),
  ring: z.string().min(1),
  radius: z.string().min(1),
})

export const ThemeConfigSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  mode: z.enum(['dark', 'light']),
  tokens: ThemeTokensSchema,
})

// ============================================
// TENANT SCHEMAS
// ============================================

export const PlanConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  features: z.array(z.string()).min(1),
  highlighted: z.boolean().optional(),
  badge: z.string().optional(),
})

export const FeatureItemSchema = z.object({
  icon: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
})

export const HowItWorksStepSchema = z.object({
  number: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
})

export const NavLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
})

export const SubscriptionConfigSchema = z.object({
  checkoutMode: z.enum(['link', 'embedded']),
  checkoutUrl: z.string().optional(),
  planCheckoutUrls: z.record(z.string(), z.string()).optional(),
  ctaLabel: z.string().optional(),
})

export const TenantConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  
  domains: z.array(z.string()).optional(),
  
  logo: z.string().min(1),
  logoAlt: z.string().optional(),
  brandText: z.object({
    line1: z.string().min(1),
    line2: z.string().min(1),
  }),
  tagline: z.string().min(1),
  description: z.string().min(1),
  
  themeSlug: z.string().min(1),
  
  featureFlags: z.record(z.string(), z.boolean()).optional(),
  
  hero: z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1),
    cta: z.string().min(1),
    images: z.array(z.string()).optional(),
  }),
  
  plans: z.array(PlanConfigSchema).min(1),
  
  sections: z.object({
    features: z.object({
      title: z.string().min(1),
      subtitle: z.string().min(1),
      items: z.array(FeatureItemSchema).min(1),
    }),
    howItWorks: z.object({
      title: z.string().min(1),
      steps: z.array(HowItWorksStepSchema).min(1),
    }),
  }),
  
  navigation: z.array(NavLinkSchema).optional(),
  footerLinks: z.array(NavLinkSchema).optional(),
  
  contact: z.object({
    email: z.string().email(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    address: z.string().optional(),
  }),
  
  legal: z.object({
    companyName: z.string().min(1),
    cnpj: z.string().min(1),
    address: z.string().min(1),
  }),
  
  seo: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    keywords: z.array(z.string()).min(1),
  }),
  
  subscription: SubscriptionConfigSchema.optional(),
})

// ============================================
// VALIDATION FUNCTIONS
// ============================================

import { THEMES, ThemeConfig } from './themes'
import { TENANTS, TenantConfig } from './tenants'

export type ValidationResult = {
  valid: boolean
  errors: string[]
}

/**
 * Formata erros do Zod v4
 */
function formatZodErrors(error: z.ZodError): string[] {
  return error.issues.map(issue => {
    const path = issue.path.join('.')
    return path ? `${path}: ${issue.message}` : issue.message
  })
}

/**
 * Valida um tema
 */
export function validateTheme(theme: unknown): ValidationResult {
  const result = ThemeConfigSchema.safeParse(theme)
  if (result.success) {
    return { valid: true, errors: [] }
  }
  return {
    valid: false,
    errors: formatZodErrors(result.error),
  }
}

/**
 * Valida um tenant
 */
export function validateTenant(tenant: unknown): ValidationResult {
  const result = TenantConfigSchema.safeParse(tenant)
  if (result.success) {
    return { valid: true, errors: [] }
  }
  return {
    valid: false,
    errors: formatZodErrors(result.error),
  }
}

/**
 * Valida todos os temas registrados
 */
export function validateAllThemes(): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {}
  for (const [slug, theme] of Object.entries(THEMES)) {
    results[slug] = validateTheme(theme)
  }
  return results
}

/**
 * Valida todos os tenants registrados
 */
export function validateAllTenants(): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {}
  for (const [id, tenant] of Object.entries(TENANTS)) {
    results[id] = validateTenant(tenant)
  }
  return results
}

/**
 * Valida todas as configs e lança erro se houver problemas
 * Chamar no build ou startup
 */
export function validateAllConfigs(): void {
  const themeResults = validateAllThemes()
  const tenantResults = validateAllTenants()
  
  const errors: string[] = []
  
  for (const [slug, result] of Object.entries(themeResults)) {
    if (!result.valid) {
      errors.push(`Theme "${slug}": ${result.errors.join(', ')}`)
    }
  }
  
  for (const [id, result] of Object.entries(tenantResults)) {
    if (!result.valid) {
      errors.push(`Tenant "${id}": ${result.errors.join(', ')}`)
    }
  }
  
  // Validar que themeSlug de cada tenant existe
  for (const [id, tenant] of Object.entries(TENANTS)) {
    if (!THEMES[tenant.themeSlug]) {
      errors.push(`Tenant "${id}": themeSlug "${tenant.themeSlug}" não existe em THEMES`)
    }
  }
  
  if (errors.length > 0) {
    console.error('❌ Config validation failed:')
    errors.forEach(e => console.error(`  - ${e}`))
    throw new Error(`Config validation failed with ${errors.length} error(s)`)
  }
  
  console.log('✅ All configs validated successfully')
}

// Tipos inferidos dos schemas (para type-safety extra)
export type ValidatedThemeConfig = z.infer<typeof ThemeConfigSchema>
export type ValidatedTenantConfig = z.infer<typeof TenantConfigSchema>

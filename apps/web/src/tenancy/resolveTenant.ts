/**
 * Tenant Resolver
 * 
 * Resolve o tenant baseado em:
 * 1. Hostname (domínio/subdomínio) - prioridade máxima
 * 2. Slug na URL (ex: /t/brewjaria ou query param)
 * 3. Fallback para DEFAULT_TENANT_SLUG (apenas em dev/localhost)
 */

import { 
  TenantConfig, 
  TENANTS,
  DEFAULT_TENANT_SLUG,
  getTenantByDomain,
  getTenantBySlug,
} from '@/config/tenants'
import { getTheme, ThemeConfig, DEFAULT_THEME_SLUG } from '@/config/themes'

export interface ResolvedTenant {
  tenant: TenantConfig
  theme: ThemeConfig
  resolvedBy: 'domain' | 'slug' | 'fallback'
}

export interface TenantNotFound {
  notFound: true
  hostname: string
}

/**
 * Lista de hostnames considerados "localhost" para fallback
 */
const LOCALHOST_HOSTS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
]

/**
 * Verifica se o hostname é localhost/desenvolvimento
 */
export function isLocalhost(hostname: string): boolean {
  const host = hostname.split(':')[0].toLowerCase()
  return LOCALHOST_HOSTS.includes(host) || host.endsWith('.localhost')
}

/**
 * Extrai slug do pathname (ex: /t/brewjaria -> brewjaria)
 */
export function extractSlugFromPath(pathname: string): string | null {
  // Padrão: /t/:slug
  const match = pathname.match(/^\/t\/([^\/]+)/)
  if (match) {
    return match[1]
  }
  return null
}

/**
 * Resolve tenant por hostname
 * Prioridade: domain > slug > fallback
 */
export function resolveTenant(
  hostname: string,
  pathname?: string,
  slugParam?: string
): ResolvedTenant {
  // 1. Tentar resolver por domínio
  const tenantByDomain = getTenantByDomain(hostname)
  if (tenantByDomain) {
    return {
      tenant: tenantByDomain,
      theme: getTheme(tenantByDomain.themeSlug),
      resolvedBy: 'domain',
    }
  }

  // 2. Tentar resolver por slug na URL
  const slug = slugParam || (pathname ? extractSlugFromPath(pathname) : null)
  if (slug) {
    const tenantBySlug = getTenantBySlug(slug)
    if (tenantBySlug) {
      return {
        tenant: tenantBySlug,
        theme: getTheme(tenantBySlug.themeSlug),
        resolvedBy: 'slug',
      }
    }
  }

  // 3. Fallback para tenant padrão (APENAS em localhost/dev)
  if (isLocalhost(hostname)) {
    const defaultTenant = getTenantBySlug(DEFAULT_TENANT_SLUG)
    if (defaultTenant) {
      return {
        tenant: defaultTenant,
        theme: getTheme(defaultTenant.themeSlug),
        resolvedBy: 'fallback',
      }
    }
  }

  // 4. Em PRODUÇÃO: se hostname/slug não resolver, retorna null
  // O caller deve tratar isso (404, redirect, etc.)
  return null
}

/**
 * Resolve tenant com fallback obrigatório
 * Usado quando você PRECISA de um tenant (ex: para não quebrar o app)
 */
export function resolveTenantOrDefault(
  hostname: string,
  pathname?: string,
  slugParam?: string
): ResolvedTenant {
  const result = resolveTenant(hostname, pathname, slugParam)
  
  if (result) {
    return result
  }
  
  // Fallback final (apenas para não quebrar)
  const defaultTenant = getTenantBySlug(DEFAULT_TENANT_SLUG)!
  return {
    tenant: defaultTenant,
    theme: getTheme(defaultTenant.themeSlug),
    resolvedBy: 'fallback',
  }
}

/**
 * Resolve tenant a partir de headers do Next.js (server-side)
 * Usado no layout.tsx para SSR
 * 
 * IMPORTANTE: Em produção, se não encontrar tenant, retorna null
 * O layout deve tratar isso (404, redirect, etc.)
 */
export function resolveTenantFromHeaders(
  host: string | null,
  pathname?: string
): ResolvedTenant | null {
  const hostname = host || 'localhost'
  return resolveTenant(hostname, pathname)
}

/**
 * Resolve tenant a partir de headers COM fallback garantido
 * Usado quando você precisa de um tenant válido sempre
 */
export function resolveTenantFromHeadersOrDefault(
  host: string | null,
  pathname?: string
): ResolvedTenant {
  const hostname = host || 'localhost'
  return resolveTenantOrDefault(hostname, pathname)
}

/**
 * Resolve tenant no client-side
 * Usa window.location
 */
export function resolveTenantClient(): ResolvedTenant | null {
  if (typeof window === 'undefined') {
    throw new Error('resolveTenantClient can only be called on client-side')
  }
  
  const { hostname, pathname } = new URL(window.location.href)
  const slugParam = new URLSearchParams(window.location.search).get('tenant')
  
  return resolveTenant(hostname, pathname, slugParam || undefined)
}

/**
 * Gera URL para um tenant específico
 * Útil para links entre tenants
 */
export function getTenantUrl(tenant: TenantConfig, path: string = '/'): string {
  // Se o tenant tem domínio, usar o primeiro
  if (tenant.domains && tenant.domains.length > 0) {
    const domain = tenant.domains[0]
    return `https://${domain}${path}`
  }
  
  // Senão, usar slug
  return `/t/${tenant.slug}${path}`
}

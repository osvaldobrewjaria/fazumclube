import { notFound } from 'next/navigation'
import { getTenantBySlug } from '@/config/tenants'
import { getDynamicTenantBySlug } from '@/lib/dynamicTenant'
import { getTheme, getThemeVars, applyCustomColors } from '@/config/themes'
import { TenantProvider } from '@/contexts/TenantContext'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

/**
 * Busca tenant - primeiro estático, depois API
 */
async function resolveTenant(slug: string) {
  // 1. Tentar configuração estática
  const staticTenant = getTenantBySlug(slug)
  if (staticTenant) {
    return staticTenant
  }
  
  // 2. Buscar da API (tenants criados via onboarding)
  const dynamicTenant = await getDynamicTenantBySlug(slug)
  return dynamicTenant
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tenant = await resolveTenant(slug)
  
  if (!tenant) {
    return { title: 'Não encontrado' }
  }
  
  return {
    title: tenant.seo.title,
    description: tenant.seo.description,
    keywords: tenant.seo.keywords,
  }
}

export default async function TenantLayout({ children, params }: LayoutProps) {
  const { slug } = await params
  const tenant = await resolveTenant(slug)
  
  if (!tenant) {
    notFound()
  }
  
  const theme = getTheme(tenant.themeSlug)
  const baseThemeVars = getThemeVars(theme)
  const themeVars = applyCustomColors(baseThemeVars, tenant.customColors)
  
  return (
    <div style={themeVars as React.CSSProperties}>
      <TenantProvider initialTenant={tenant} initialTheme={theme}>
        {children}
      </TenantProvider>
    </div>
  )
}

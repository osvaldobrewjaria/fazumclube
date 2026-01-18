'use client'

import { createContext, useContext, ReactNode, useMemo, useEffect } from 'react'
import { TenantConfig } from '@/config/tenants'
import { ThemeConfig } from '@/config/themes'
import { useTenantStore } from '@/stores/tenantStore'

/**
 * TenantContext - Responsabilidade Reduzida
 * 
 * Este context agora serve apenas para:
 * 1. Disponibilizar dados do tenant (textos, planos, etc.)
 * 2. Disponibilizar informações do tema (modo, nome)
 * 3. Disponibilizar feature flags
 * 
 * NÃO é responsável por aplicar cores - isso é feito via CSS variables no SSR
 * Componentes devem usar classes Tailwind com tokens (bg-background, text-foreground, etc.)
 */

interface TenantContextType {
  // Dados do tenant
  tenant: TenantConfig
  
  // Dados do tema
  theme: ThemeConfig
  isDark: boolean
  isLight: boolean
  
  // Feature flags helper
  hasFeature: (feature: string) => boolean
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

interface TenantProviderProps {
  children: ReactNode
  initialTenant: TenantConfig
  initialTheme: ThemeConfig
}

/**
 * TenantProvider
 * 
 * Recebe tenant e theme já resolvidos do server-side (layout.tsx)
 * Não faz resolução própria - apenas disponibiliza os dados
 * 
 * Também sincroniza o slug do tenant com o tenantStore para uso no interceptor HTTP
 */
export function TenantProvider({ 
  children, 
  initialTenant,
  initialTheme,
}: TenantProviderProps) {
  const setSlug = useTenantStore((state) => state.setSlug)
  
  // Sincronizar slug do tenant com o store IMEDIATAMENTE
  // Isso garante que o interceptor HTTP tenha o tenant antes de qualquer request
  if (initialTenant?.slug && useTenantStore.getState().slug !== initialTenant.slug) {
    setSlug(initialTenant.slug)
  }
  
  // Também manter o useEffect para casos de mudança de tenant
  useEffect(() => {
    if (initialTenant?.slug) {
      setSlug(initialTenant.slug)
    }
  }, [initialTenant?.slug, setSlug])
  
  const value = useMemo(() => ({
    tenant: initialTenant,
    theme: initialTheme,
    isDark: initialTheme.mode === 'dark',
    isLight: initialTheme.mode === 'light',
    hasFeature: (flag: string) => {
      return initialTenant.featureFlags?.[flag] ?? false
    },
  }), [initialTenant, initialTheme])

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  )
}

/**
 * Hook principal para acessar dados do tenant
 */
export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}

/**
 * Hook para verificar feature flags
 * 
 * Uso:
 * const showCarousel = useFeature('showCarousel')
 */
export function useFeature(feature: string): boolean {
  const { hasFeature } = useTenant()
  return hasFeature(feature)
}

/**
 * Hook para verificar o modo do tema
 * 
 * Uso:
 * const { isDark, isLight, mode } = useThemeMode()
 */
export function useThemeMode() {
  const { theme, isDark, isLight } = useTenant()
  return {
    mode: theme.mode,
    isDark,
    isLight,
  }
}

/**
 * Hook para acessar dados de navegação
 */
export function useNavigation() {
  const { tenant } = useTenant()
  return {
    items: tenant.navigation || [],
    footerLinks: tenant.footerLinks || [],
  }
}

/**
 * Hook para acessar dados de branding
 */
export function useBranding() {
  const { tenant } = useTenant()
  return {
    name: tenant.name,
    logo: tenant.logo,
    brandText: tenant.brandText,
    tagline: tenant.tagline,
    description: tenant.description,
  }
}

/**
 * Hook para acessar planos
 */
export function usePlans() {
  const { tenant } = useTenant()
  return tenant.plans
}

/**
 * Hook para acessar dados de contato
 */
export function useContact() {
  const { tenant } = useTenant()
  return tenant.contact
}

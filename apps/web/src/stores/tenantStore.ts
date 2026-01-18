import { create } from 'zustand'

/**
 * TenantStore - Armazena o slug do tenant atual para uso em API calls
 * 
 * Este store é necessário porque:
 * 1. O interceptor do axios roda fora do contexto React
 * 2. Precisamos enviar o header X-Tenant em todas as requests
 * 3. O TenantContext (React) não é acessível no interceptor
 * 
 * O slug é setado pelo TenantProvider quando o tenant é resolvido
 */

interface TenantStoreState {
  slug: string | null
  setSlug: (slug: string) => void
  clearSlug: () => void
}

export const useTenantStore = create<TenantStoreState>((set) => ({
  slug: null,
  setSlug: (slug) => set({ slug }),
  clearSlug: () => set({ slug: null }),
}))

/**
 * Função helper para obter o slug fora do React
 * Usada pelo interceptor do axios
 */
export function getTenantSlug(): string | null {
  return useTenantStore.getState().slug
}

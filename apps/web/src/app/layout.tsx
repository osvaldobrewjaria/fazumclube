import type { Metadata } from 'next'
import { Inter, Playfair_Display, Sora } from 'next/font/google'
import { headers } from 'next/headers'
import '../styles/globals.css'
import { AuthProvider } from '@/providers/AuthProvider'
import { TenantProvider } from '@/contexts/TenantContext'
import { resolveTenantFromHeadersOrDefault } from '@/tenancy/resolveTenant'
import { getThemeVars } from '@/config/themes'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
const sora = Sora({ subsets: ['latin'], variable: '--font-sora' })

// Metadata dinâmica baseada no tenant
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const host = headersList.get('host')
  const { tenant } = resolveTenantFromHeadersOrDefault(host)
  
  return {
    title: tenant.seo.title,
    description: tenant.seo.description,
    keywords: tenant.seo.keywords.join(', '),
    icons: {
      icon: tenant.favicon || '/favicon.svg',  // Favicon por tenant, fallback para global
    },
    openGraph: {
      title: tenant.seo.title,
      description: tenant.seo.description,
      type: 'website',
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Resolver tenant no server-side (com fallback garantido)
  const headersList = await headers()
  const host = headersList.get('host')
  const { tenant, theme } = resolveTenantFromHeadersOrDefault(host)
  
  // Gerar CSS variables do tema
  const themeVars = getThemeVars(theme)
  const themeStyle = Object.entries(themeVars)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')

  return (
    <html 
      lang="pt-BR" 
      data-theme={theme.mode}
      style={themeVars as React.CSSProperties}
    >
      <body className={`${inter.variable} ${playfair.variable} ${sora.variable} font-sans`}>
        <TenantProvider initialTenant={tenant} initialTheme={theme}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </TenantProvider>
      </body>
    </html>
  )
}

// Sistema de Temas Multi-Tenant com CSS Variables/Tokens
// Baseado no padrão shadcn/ui para máxima compatibilidade

export interface ThemeTokens {
  // Backgrounds
  background: string
  foreground: string
  
  // Muted (textos secundários, backgrounds sutis)
  muted: string
  mutedForeground: string
  
  // Cards e superfícies elevadas
  card: string
  cardForeground: string
  
  // Popover (menus, dropdowns) - shadcn/ui compatibility
  popover: string
  popoverForeground: string
  
  // Bordas
  border: string
  input: string
  
  // Primary (ações principais, CTAs)
  primary: string
  primaryForeground: string
  
  // Secondary (ações secundárias)
  secondary: string
  secondaryForeground: string
  
  // Accent (destaques, hover states)
  accent: string
  accentForeground: string
  
  // Destructive (erros, ações perigosas)
  destructive: string
  destructiveForeground: string
  
  // Ring (focus states)
  ring: string
  
  // Radius padrão
  radius: string
}

export interface ThemeConfig {
  name: string
  slug: string
  mode: 'dark' | 'light'
  tokens: ThemeTokens
}

/**
 * Converte ThemeConfig em objeto de CSS variables
 * para aplicar no SSR via style attribute
 */
export function getThemeVars(theme: ThemeConfig): Record<string, string> {
  const { tokens } = theme
  return {
    '--background': tokens.background,
    '--foreground': tokens.foreground,
    '--muted': tokens.muted,
    '--muted-foreground': tokens.mutedForeground,
    '--card': tokens.card,
    '--card-foreground': tokens.cardForeground,
    '--popover': tokens.popover,
    '--popover-foreground': tokens.popoverForeground,
    '--border': tokens.border,
    '--input': tokens.input,
    '--primary': tokens.primary,
    '--primary-foreground': tokens.primaryForeground,
    '--secondary': tokens.secondary,
    '--secondary-foreground': tokens.secondaryForeground,
    '--accent': tokens.accent,
    '--accent-foreground': tokens.accentForeground,
    '--destructive': tokens.destructive,
    '--destructive-foreground': tokens.destructiveForeground,
    '--ring': tokens.ring,
    '--radius': tokens.radius,
  }
}

/**
 * Converte CSS vars para string inline
 */
export function getThemeStyleString(theme: ThemeConfig): string {
  const vars = getThemeVars(theme)
  return Object.entries(vars)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')
}

/**
 * Aplica cores personalizadas sobre o tema base
 */
export function applyCustomColors(
  themeVars: Record<string, string>,
  customColors?: {
    primary?: string
    secondary?: string
    background?: string
    foreground?: string
  }
): Record<string, string> {
  if (!customColors) return themeVars

  const result = { ...themeVars }

  if (customColors.primary) {
    result['--primary'] = customColors.primary
    result['--ring'] = customColors.primary
  }
  if (customColors.secondary) {
    result['--secondary'] = customColors.secondary
    result['--accent'] = customColors.secondary
  }
  if (customColors.background) {
    result['--background'] = customColors.background
    result['--card'] = customColors.background
    result['--popover'] = customColors.background
    // Muted é uma versão mais clara/escura do background
    result['--muted'] = customColors.background
  }
  if (customColors.foreground) {
    result['--foreground'] = customColors.foreground
    result['--card-foreground'] = customColors.foreground
    result['--popover-foreground'] = customColors.foreground
    result['--muted-foreground'] = customColors.foreground
  }

  return result
}

// ============================================
// TEMAS DISPONÍVEIS
// ============================================

export const THEMES: Record<string, ThemeConfig> = {
  // Brewjaria - Dark Premium com Dourado
  'brewjaria-dark': {
    name: 'Brewjaria Dark',
    slug: 'brewjaria-dark',
    mode: 'dark',
    tokens: {
      background: '#1A1A1A',
      foreground: '#FFFFFF',
      muted: '#2A2A2A',
      mutedForeground: 'rgba(255,255,255,0.6)',
      card: '#242424',
      cardForeground: '#FFFFFF',
      popover: '#242424',
      popoverForeground: '#FFFFFF',
      border: 'rgba(242,201,76,0.2)',
      input: 'rgba(242,201,76,0.1)',
      primary: '#F2C94C',
      primaryForeground: '#1A1A1A',
      secondary: '#1A1A1A',
      secondaryForeground: '#F2C94C',
      accent: 'rgba(242,201,76,0.1)',
      accentForeground: '#F2C94C',
      destructive: '#EF4444',
      destructiveForeground: '#FFFFFF',
      ring: '#F2C94C',
      radius: '0.5rem',
    },
  },

  // Light Default - Azul corporativo (TEMA PADRÃO NEUTRO)
  'light-blue': {
    name: 'Light Blue',
    slug: 'light-blue',
    mode: 'light',
    tokens: {
      background: '#FFFFFF',
      foreground: '#0F172A',
      muted: '#F1F5F9',
      mutedForeground: '#64748B',
      card: '#FFFFFF',
      cardForeground: '#0F172A',
      popover: '#FFFFFF',
      popoverForeground: '#0F172A',
      border: '#E2E8F0',
      input: '#E2E8F0',
      primary: '#2563EB',
      primaryForeground: '#FFFFFF',
      secondary: '#F1F5F9',
      secondaryForeground: '#0F172A',
      accent: '#F1F5F9',
      accentForeground: '#2563EB',
      destructive: '#EF4444',
      destructiveForeground: '#FFFFFF',
      ring: '#2563EB',
      radius: '0.5rem',
    },
  },

  // Coffee - Tons terrosos
  'coffee': {
    name: 'Coffee',
    slug: 'coffee',
    mode: 'light',
    tokens: {
      background: '#FDF6E3',
      foreground: '#2D1810',
      muted: '#F5E6D3',
      mutedForeground: '#6B4423',
      card: '#FFFFFF',
      cardForeground: '#2D1810',
      popover: '#FFFFFF',
      popoverForeground: '#2D1810',
      border: '#D4B896',
      input: '#D4B896',
      primary: '#8B4513',
      primaryForeground: '#FFFFFF',
      secondary: '#F5E6D3',
      secondaryForeground: '#2D1810',
      accent: '#F5E6D3',
      accentForeground: '#8B4513',
      destructive: '#DC2626',
      destructiveForeground: '#FFFFFF',
      ring: '#8B4513',
      radius: '0.5rem',
    },
  },

  // Nature - Verde orgânico
  'nature': {
    name: 'Nature',
    slug: 'nature',
    mode: 'light',
    tokens: {
      background: '#F0F7F4',
      foreground: '#1B4332',
      muted: '#D8E9E0',
      mutedForeground: '#3D6B52',
      card: '#FFFFFF',
      cardForeground: '#1B4332',
      popover: '#FFFFFF',
      popoverForeground: '#1B4332',
      border: '#B7D4C4',
      input: '#B7D4C4',
      primary: '#2E7D32',
      primaryForeground: '#FFFFFF',
      secondary: '#D8E9E0',
      secondaryForeground: '#1B4332',
      accent: '#D8E9E0',
      accentForeground: '#2E7D32',
      destructive: '#DC2626',
      destructiveForeground: '#FFFFFF',
      ring: '#2E7D32',
      radius: '0.5rem',
    },
  },

  // Wine - Vinho elegante
  'wine': {
    name: 'Wine',
    slug: 'wine',
    mode: 'dark',
    tokens: {
      background: '#1C1017',
      foreground: '#F5F0F1',
      muted: '#2D1F24',
      mutedForeground: 'rgba(245,240,241,0.6)',
      card: '#251A1F',
      cardForeground: '#F5F0F1',
      popover: '#251A1F',
      popoverForeground: '#F5F0F1',
      border: 'rgba(155,44,44,0.3)',
      input: 'rgba(155,44,44,0.2)',
      primary: '#9B2C2C',
      primaryForeground: '#FFFFFF',
      secondary: '#2D1F24',
      secondaryForeground: '#C53030',
      accent: 'rgba(155,44,44,0.2)',
      accentForeground: '#C53030',
      destructive: '#EF4444',
      destructiveForeground: '#FFFFFF',
      ring: '#9B2C2C',
      radius: '0.5rem',
    },
  },
}

// ============================================
// TEMA PADRÃO (neutro, não vinculado a nenhuma marca)
// ============================================
export const DEFAULT_THEME_SLUG = 'light-blue'

/**
 * Retorna o tema pelo slug.
 * Se o slug não existir ou for inválido, retorna o tema padrão.
 * Função segura para multi-tenant - nunca lança erro.
 */
export function getTheme(slug?: string): ThemeConfig {
  const key = (slug || '').trim().toLowerCase()
  return THEMES[key] ?? THEMES[DEFAULT_THEME_SLUG]
}

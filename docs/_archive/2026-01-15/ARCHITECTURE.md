# Arquitetura do SaaS Multi-Segmento

## Visão Geral

O Brewjaria SaaS é uma plataforma multi-tenant que permite criar e gerenciar múltiplos clubes de assinatura (cervejas, vinhos, cafés, etc.) a partir de uma única base de código. Cada "tenant" (cliente/marca) possui sua própria identidade visual, conteúdo e configurações, mas compartilha a infraestrutura e componentes.

```
┌─────────────────────────────────────────────────────────────────┐
│                        BREWJARIA SAAS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Brewjaria│  │Wine Club │  │Coffee    │  │ Novo     │        │
│  │ (cerveja)│  │ (vinhos) │  │Club      │  │ Tenant   │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │             │             │             │               │
│       └─────────────┴─────────────┴─────────────┘               │
│                           │                                     │
│              ┌────────────┴────────────┐                        │
│              │   COMPONENTES SHARED    │                        │
│              │  (Header, Hero, Footer) │                        │
│              └────────────┬────────────┘                        │
│                           │                                     │
│              ┌────────────┴────────────┐                        │
│              │    SISTEMA DE TEMAS     │                        │
│              │   (CSS Variables/SSR)   │                        │
│              └────────────┬────────────┘                        │
│                           │                                     │
│              ┌────────────┴────────────┐                        │
│              │   TENANT RESOLUTION     │                        │
│              │  (hostname → config)    │                        │
│              └─────────────────────────┘                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Estrutura de Diretórios

```
apps/web/
├── public/
│   └── tenants/                    # Assets por tenant
│       ├── brewjaria/
│       │   └── logo.png
│       ├── wine-club/
│       │   └── logo.svg
│       └── coffee-club/
│           └── logo.svg
│
├── scripts/
│   └── create-tenant.js           # Script para criar novos tenants
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── page.tsx               # Home (Brewjaria default)
│   │   ├── layout.tsx             # Root layout com SSR theming
│   │   ├── privacidade/           # Páginas globais (Brewjaria)
│   │   ├── termos/
│   │   └── t/[slug]/              # ⭐ ROTAS DINÂMICAS POR TENANT
│   │       ├── page.tsx           # Home do tenant
│   │       ├── layout.tsx         # Layout com tema do tenant
│   │       ├── privacidade/       # Privacidade do tenant
│   │       └── termos/            # Termos do tenant
│   │
│   ├── components/
│   │   ├── shared/                # ⭐ COMPONENTES MULTI-TENANT
│   │   │   ├── HeaderShared.tsx
│   │   │   ├── HeroShared.tsx
│   │   │   ├── FeaturesShared.tsx
│   │   │   ├── HowItWorksShared.tsx
│   │   │   ├── PricingShared.tsx
│   │   │   ├── FooterShared.tsx
│   │   │   ├── SubscriptionFlowShared.tsx
│   │   │   └── steps/
│   │   │       ├── AccountStepShared.tsx
│   │   │       ├── AddressStepShared.tsx
│   │   │       ├── PaymentStepShared.tsx
│   │   │       └── SubscriptionStepsShared.tsx
│   │   │
│   │   ├── steps/                 # Steps originais (Brewjaria)
│   │   └── ui/                    # Componentes UI base
│   │
│   ├── config/
│   │   ├── tenants.ts             # ⭐ CONFIGURAÇÕES DE TENANTS
│   │   ├── tenants/               # Tenants externos
│   │   │   ├── _template.ts       # Template para novos tenants
│   │   │   └── coffee-club.ts     # Exemplo de tenant externo
│   │   ├── themes.ts              # ⭐ SISTEMA DE TEMAS
│   │   └── schemas.ts             # Validação Zod
│   │
│   ├── contexts/
│   │   └── TenantContext.tsx      # Context do tenant atual
│   │
│   └── tenancy/
│       └── resolveTenant.ts       # Resolução de tenant por hostname/slug
```

---

## Fluxo de Resolução de Tenant

```
┌─────────────────────────────────────────────────────────────────┐
│                    REQUISIÇÃO HTTP                              │
│                                                                 │
│  URL: https://wineclub.com.br/                                  │
│  ou:  https://brewjaria.com.br/t/wine-club                      │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                 1. TENANT RESOLUTION                            │
│                                                                 │
│  resolveTenant.ts:                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. Verifica hostname (wineclub.com.br)                  │   │
│  │    → Busca em tenant.domains[]                          │   │
│  │                                                         │   │
│  │ 2. Se não encontrou, verifica slug na URL (/t/wine-club)│   │
│  │    → Busca por tenant.slug                              │   │
│  │                                                         │   │
│  │ 3. Fallback: DEFAULT_TENANT_ID (brewjaria)              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                 2. THEME APPLICATION (SSR)                      │
│                                                                 │
│  layout.tsx:                                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ const tenant = resolveTenant(headers)                   │   │
│  │ const theme = getTheme(tenant.themeSlug)                │   │
│  │ const cssVars = getThemeVars(theme)                     │   │
│  │                                                         │   │
│  │ <html style={cssVars}>                                  │   │
│  │   <!-- CSS variables aplicadas no SSR -->               │   │
│  │   <!-- Sem flash de tema errado! -->                    │   │
│  │ </html>                                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                 3. TENANT CONTEXT                               │
│                                                                 │
│  TenantProvider:                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ <TenantProvider tenant={tenant}>                        │   │
│  │   {children}                                            │   │
│  │ </TenantProvider>                                       │   │
│  │                                                         │   │
│  │ // Componentes usam:                                    │   │
│  │ const { tenant, hasFeature } = useTenant()              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                 4. RENDER COMPONENTS                            │
│                                                                 │
│  Componentes Shared:                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ function HeroShared() {                                 │   │
│  │   const { tenant } = useTenant()                        │   │
│  │                                                         │   │
│  │   return (                                              │   │
│  │     <section className="bg-background">                 │   │
│  │       <h1>{tenant.hero.title}</h1>                      │   │
│  │       <p>{tenant.hero.subtitle}</p>                     │   │
│  │       <button className="bg-primary">                   │   │
│  │         {tenant.hero.cta}                               │   │
│  │       </button>                                         │   │
│  │     </section>                                          │   │
│  │   )                                                     │   │
│  │ }                                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Sistema de Temas

### Tokens Disponíveis (shadcn/ui compatible)

| Token | CSS Variable | Uso |
|-------|--------------|-----|
| `background` | `--background` | Fundo principal |
| `foreground` | `--foreground` | Texto principal |
| `muted` | `--muted` | Fundo secundário |
| `mutedForeground` | `--muted-foreground` | Texto secundário |
| `card` | `--card` | Fundo de cards |
| `cardForeground` | `--card-foreground` | Texto em cards |
| `popover` | `--popover` | Fundo de popovers |
| `popoverForeground` | `--popover-foreground` | Texto em popovers |
| `border` | `--border` | Bordas |
| `input` | `--input` | Bordas de inputs |
| `primary` | `--primary` | Cor principal (CTAs) |
| `primaryForeground` | `--primary-foreground` | Texto sobre primary |
| `secondary` | `--secondary` | Cor secundária |
| `secondaryForeground` | `--secondary-foreground` | Texto sobre secondary |
| `accent` | `--accent` | Destaques |
| `accentForeground` | `--accent-foreground` | Texto sobre accent |
| `destructive` | `--destructive` | Erros/perigo |
| `destructiveForeground` | `--destructive-foreground` | Texto sobre destructive |
| `ring` | `--ring` | Focus ring |
| `radius` | `--radius` | Border radius padrão |

### Temas Disponíveis

| Slug | Nome | Modo | Cor Principal |
|------|------|------|---------------|
| `brewjaria-dark` | Brewjaria Dark | dark | Dourado (#F2C94C) |
| `light-blue` | Light Blue | light | Azul (#3B82F6) |
| `coffee` | Coffee | dark | Marrom (#8B4513) |
| `nature` | Nature | light | Verde (#2E7D32) |
| `wine` | Wine | dark | Vinho (#9B2C2C) |

### Uso em Componentes

```tsx
// ✅ CORRETO - Usa tokens CSS variables
<div className="bg-background text-foreground">
  <h1 className="text-primary">Título</h1>
  <p className="text-muted-foreground">Descrição</p>
  <button className="bg-primary text-primary-foreground">
    CTA
  </button>
</div>

// ❌ ERRADO - Hardcoded colors
<div className="bg-black text-white">
  <h1 className="text-yellow-500">Título</h1>
</div>
```

---

## Estrutura do TenantConfig

```typescript
interface TenantConfig {
  // ═══════════════════════════════════════════
  // IDENTIFICAÇÃO (OBRIGATÓRIO)
  // ═══════════════════════════════════════════
  id: string           // 'wine-club'
  slug: string         // 'wine-club' (URL: /t/wine-club)
  name: string         // 'Wine Club'
  domains?: string[]   // ['wineclub.com.br', 'www.wineclub.com.br']

  // ═══════════════════════════════════════════
  // BRANDING (OBRIGATÓRIO)
  // ═══════════════════════════════════════════
  logo: string         // '/tenants/wine-club/logo.png'
  brandText: {
    line1: string      // 'WINE'
    line2: string      // 'CLUB.'
  }
  tagline: string      // 'Vinhos selecionados para você'
  description: string  // Descrição para SEO

  // ═══════════════════════════════════════════
  // TEMA (OBRIGATÓRIO)
  // ═══════════════════════════════════════════
  themeSlug: string    // 'wine' | 'coffee' | 'light-blue' | etc.

  // ═══════════════════════════════════════════
  // FEATURE FLAGS (OPCIONAL)
  // ═══════════════════════════════════════════
  featureFlags?: {
    showCarousel?: boolean      // Carrossel no hero
    showHowItWorks?: boolean    // Seção "Como Funciona"
    showFeatures?: boolean      // Seção "Por que escolher"
    enableSubscription?: boolean // Fluxo de assinatura
    enableLogin?: boolean        // Login de usuários
  }

  // ═══════════════════════════════════════════
  // HERO (OBRIGATÓRIO)
  // ═══════════════════════════════════════════
  hero: {
    title: string      // 'Descubra vinhos excepcionais'
    subtitle: string   // 'Receba em casa uma seleção...'
    cta: string        // 'Começar Minha Jornada'
    images?: string[]  // Imagens do carrossel (opcional)
  }

  // ═══════════════════════════════════════════
  // PLANOS (OBRIGATÓRIO - mínimo 1)
  // ═══════════════════════════════════════════
  plans: Array<{
    id: string         // 'basico'
    name: string       // 'Básico'
    price: number      // 49.90
    originalPrice?: number  // 59.90 (preço riscado)
    features: string[] // ['Benefício 1', 'Benefício 2']
    highlighted?: boolean   // Destaca o card
    badge?: string     // 'Mais Popular'
  }>

  // ═══════════════════════════════════════════
  // SEÇÕES DE CONTEÚDO (OBRIGATÓRIO)
  // ═══════════════════════════════════════════
  sections: {
    features: {
      title: string
      subtitle: string
      items: Array<{
        icon: string       // Nome do ícone lucide-react
        title: string
        description: string
      }>
    }
    howItWorks: {
      title: string
      steps: Array<{
        number: string     // '01'
        title: string
        description: string
      }>
    }
  }

  // ═══════════════════════════════════════════
  // CONTATO (OBRIGATÓRIO)
  // ═══════════════════════════════════════════
  contact: {
    email: string
    phone?: string
    whatsapp?: string
  }

  // ═══════════════════════════════════════════
  // DADOS LEGAIS (OBRIGATÓRIO)
  // ═══════════════════════════════════════════
  legal: {
    companyName: string  // Razão social
    cnpj: string
    address: string
  }

  // ═══════════════════════════════════════════
  // SEO (OBRIGATÓRIO)
  // ═══════════════════════════════════════════
  seo: {
    title: string
    description: string
    keywords: string[]
  }

  // ═══════════════════════════════════════════
  // ASSINATURA (OPCIONAL)
  // ═══════════════════════════════════════════
  subscription?: {
    checkoutMode: 'link' | 'embedded'
    checkoutUrl?: string           // URL genérica
    planCheckoutUrls?: Record<string, string>  // URLs por plano
    ctaLabel?: string              // 'Assinar Agora'
  }
}
```

---

## Tenants Registrados

| ID | Slug | Nome | Tema | Status |
|----|------|------|------|--------|
| `brewjaria` | `brewjaria` | Brewjaria | `brewjaria-dark` | ✅ Produção |
| `wine-club` | `wine-club` | Wine Club | `wine` | ✅ Funcional |
| `coffee-club` | `coffee-club` | Coffee Club | `coffee` | 🔧 Template |
| `template-light` | `template-light` | Template Light | `light-blue` | 📋 Exemplo |

---

## Componentes Shared

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| Header | `HeaderShared.tsx` | Navegação com logo e menu |
| Hero | `HeroShared.tsx` | Seção principal com CTA |
| Features | `FeaturesShared.tsx` | "Por que nos escolher" |
| How It Works | `HowItWorksShared.tsx` | Passos do processo |
| Pricing | `PricingShared.tsx` | Cards de planos |
| Footer | `FooterShared.tsx` | Rodapé com links |
| Subscription Flow | `SubscriptionFlowShared.tsx` | Fluxo de checkout |
| Account Step | `AccountStepShared.tsx` | Formulário de conta |
| Address Step | `AddressStepShared.tsx` | Formulário de endereço |
| Payment Step | `PaymentStepShared.tsx` | Formulário de pagamento |

---

## URLs e Rotas

### Rotas Dinâmicas (Multi-tenant)

| Rota | Descrição |
|------|-----------|
| `/t/[slug]` | Home do tenant |
| `/t/[slug]/privacidade` | Política de privacidade |
| `/t/[slug]/termos` | Termos de serviço |

### Rotas Globais (Brewjaria)

| Rota | Descrição |
|------|-----------|
| `/` | Home Brewjaria |
| `/privacidade` | Privacidade (redireciona se outro tenant) |
| `/termos` | Termos (redireciona se outro tenant) |
| `/login` | Login |
| `/minha-conta` | Área do cliente |

---

## Validação com Zod

Todas as configurações são validadas com Zod schemas:

```typescript
// Validar tenant
const result = TenantConfigSchema.safeParse(tenantConfig)
if (!result.success) {
  console.error(result.error.issues)
}

// Validar tema
const themeResult = ThemeConfigSchema.safeParse(themeConfig)

// Validar tudo no build
validateAllConfigs() // Lança erro se inválido
```

---

## Próximos Passos Sugeridos

1. **Integração Stripe** - Configurar `planCheckoutUrls` com links reais
2. **Autenticação** - Integrar com backend de auth
3. **Dashboard Admin** - Painel para gerenciar tenants
4. **Analytics** - Métricas por tenant
5. **Domínios Customizados** - Configurar DNS e SSL por tenant

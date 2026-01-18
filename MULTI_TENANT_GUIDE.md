# Guia Multi-Tenant SaaS

Sistema modular para criar sites de assinatura para diferentes nichos/marcas.
**Nenhuma marca é "principal"** - todas são tenants iguais.

> **Última atualização**: Dezembro 2024 - Adicionado multi-tenancy real no backend

---

## Índice

1. [Arquitetura Geral](#arquitetura)
2. [Criar Novo Tenant (Passo a Passo)](#criar-novo-tenant-completo)
3. [Frontend - Configuração](#frontend---configuração)
4. [Backend - Configuração](#backend---configuração)
5. [Banco de Dados](#banco-de-dados)
6. [Temas e Tokens CSS](#tokens-css-padrão-shadcnui)
7. [Hooks e Componentes](#hooks-disponíveis)
8. [Deploy e Domínios](#deploy-e-domínios)
9. [Troubleshooting](#troubleshooting)

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ARQUITETURA MULTI-TENANT                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐               │
│  │  Frontend   │     │   Backend   │     │  Database   │               │
│  │  (Next.js)  │────▶│  (NestJS)   │────▶│ (PostgreSQL)│               │
│  └─────────────┘     └─────────────┘     └─────────────┘               │
│        │                    │                   │                       │
│        │                    │                   │                       │
│  ┌─────▼─────┐        ┌─────▼─────┐       ┌─────▼─────┐                │
│  │ Resolve   │        │ Tenant    │       │  Tenant   │                │
│  │ by Domain │        │ Middleware│       │  Table    │                │
│  │ or Slug   │        │ X-Tenant  │       │           │                │
│  └───────────┘        └───────────┘       └───────────┘                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

FLUXO DE RESOLUÇÃO:

1. Usuário acessa domínio/subdomínio
           ↓
2. Frontend resolve tenant por hostname ou slug (/t/:slug)
           ↓
3. Frontend envia header X-Tenant para o backend
           ↓
4. Backend valida tenant no banco de dados
           ↓
5. Dados são filtrados por tenantId
```

## Estrutura de Arquivos

```
/src
  /config
    themes.ts      # Temas com tokens CSS (cores, radius)
    tenants.ts     # Configuração de cada marca
    schemas.ts     # Validação Zod das configs
  /tenancy
    resolveTenant.ts  # Resolver tenant por hostname/slug
  /contexts
    TenantContext.tsx  # Provider para dados do tenant
  /app
    layout.tsx     # Aplica tema via SSR (sem flash)
```

---

## Criar Novo Tenant (Completo)

Este é o guia passo a passo para criar um novo tenant do zero, incluindo frontend, backend e banco de dados.

### Pré-requisitos

- Node.js 18+
- pnpm instalado
- Acesso ao banco de dados PostgreSQL
- Stripe configurado (para pagamentos)

### Passo 1: Criar Configuração do Frontend

Use o script automatizado:

```bash
cd apps/web
pnpm tenant:new meu-tenant
```

Isso cria:
- `src/config/tenants/meu-tenant.ts` - Configuração do tenant
- `public/tenants/meu-tenant/` - Pasta para assets (logo, imagens)

### Passo 2: Editar Configuração do Tenant

Edite `apps/web/src/config/tenants/meu-tenant.ts`:

```typescript
import { TenantConfig } from '../tenants'

export const meuTenantTenant: TenantConfig = {
  // Identificação
  id: 'meu-tenant',
  name: 'Meu Tenant',
  slug: 'meu-tenant',
  
  // Domínios que resolvem para este tenant (produção)
  domains: [
    'meutenant.com.br',
    'www.meutenant.com.br',
  ],
  
  // Branding
  logo: '/tenants/meu-tenant/logo.png',
  brandText: { line1: 'MEU', line2: 'TENANT.' },
  tagline: 'Sua tagline aqui',
  description: 'Descrição do seu negócio',
  
  // Tema (referência a themes.ts)
  themeSlug: 'light-blue', // ou crie um tema customizado
  
  // Feature flags
  featureFlags: {
    showCarousel: true,
    showHowItWorks: true,
    showFeatures: true,
    enableSubscription: true,
    enableLogin: true,
  },
  
  // Hero section
  hero: {
    title: 'Título principal do seu negócio',
    subtitle: 'Subtítulo explicando o valor do seu serviço.',
    cta: 'Começar Agora',
    images: ['/tenants/meu-tenant/hero1.jpg'],
  },
  
  // Planos de assinatura
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
      features: ['Tudo do Básico', 'Feature 4', 'Feature 5'],
      highlighted: true,
      badge: 'Mais Popular',
    },
  ],
  
  // Seções de conteúdo
  sections: {
    features: {
      title: 'Por que nos escolher?',
      subtitle: 'Nossos diferenciais',
      items: [
        { icon: 'Star', title: 'Qualidade', description: 'Descrição' },
        { icon: 'Truck', title: 'Entrega', description: 'Descrição' },
      ],
    },
    howItWorks: {
      title: 'Como Funciona',
      steps: [
        { number: '01', title: 'Escolha', description: 'Descrição' },
        { number: '02', title: 'Receba', description: 'Descrição' },
        { number: '03', title: 'Aproveite', description: 'Descrição' },
      ],
    },
  },
  
  // Contato
  contact: {
    email: 'contato@meutenant.com.br',
    whatsapp: '5511999999999',
    instagram: 'https://instagram.com/meutenant',
  },
  
  // Dados legais
  legal: {
    companyName: 'Meu Tenant Ltda',
    cnpj: '00.000.000/0001-00',
    address: 'Rua Exemplo, 123 - São Paulo, SP',
  },
  
  // SEO
  seo: {
    title: 'Meu Tenant | Descrição curta',
    description: 'Meta description para SEO',
    keywords: ['keyword1', 'keyword2'],
  },
}
```

### Passo 3: Registrar o Tenant

Edite `apps/web/src/config/tenants.ts`:

```typescript
// Importar o novo tenant
import { meuTenantTenant } from './tenants/meu-tenant'

// Adicionar ao registro
export const TENANTS: Record<string, TenantConfig> = {
  brewjaria,
  'wine-club': wineClub,
  'meu-tenant': meuTenantTenant,  // ← Adicionar aqui
}
```

### Passo 4: Criar Tenant no Banco de Dados (Backend)

#### Opção A: Via Seed (Recomendado para novos tenants)

Edite `apps/api/prisma/seed.ts`:

```typescript
// Criar tenant
const meuTenant = await prisma.tenant.upsert({
  where: { slug: 'meu-tenant' },
  update: {},
  create: {
    name: 'Meu Tenant',
    slug: 'meu-tenant',
  },
});
console.log('✅ Tenant created:', meuTenant.slug);

// Criar plano para o tenant
const planoMeuTenant = await prisma.plan.upsert({
  where: { slug: 'plano-meu-tenant' },
  update: {},
  create: {
    tenantId: meuTenant.id,
    name: 'Plano Meu Tenant',
    slug: 'plano-meu-tenant',
    description: 'Descrição do plano',
    active: true,
  },
});

// Criar preços
await prisma.planPrice.create({
  data: {
    planId: planoMeuTenant.id,
    interval: 'MONTHLY',
    amountCents: 4990, // R$ 49,90
    stripePriceId: 'price_XXXXXXXX', // ID do Stripe
    active: true,
  },
});

await prisma.planPrice.create({
  data: {
    planId: planoMeuTenant.id,
    interval: 'YEARLY',
    amountCents: 49900, // R$ 499,00
    stripePriceId: 'price_YYYYYYYY', // ID do Stripe
    active: true,
  },
});
```

Execute o seed:

```bash
cd apps/api
pnpm prisma db seed
```

#### Opção B: Via SQL Direto

```sql
-- Criar tenant
INSERT INTO "Tenant" (id, name, slug, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Meu Tenant',
  'meu-tenant',
  NOW(),
  NOW()
);

-- Pegar o ID do tenant criado
-- SELECT id FROM "Tenant" WHERE slug = 'meu-tenant';

-- Criar plano (substitua TENANT_ID pelo ID real)
INSERT INTO "Plan" (id, "tenantId", name, slug, description, active, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'TENANT_ID',
  'Plano Meu Tenant',
  'plano-meu-tenant',
  'Descrição do plano',
  true,
  NOW(),
  NOW()
);

-- Criar preços (substitua PLAN_ID pelo ID real)
INSERT INTO "PlanPrice" (id, "planId", interval, "amountCents", "stripePriceId", active, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'PLAN_ID', 'MONTHLY', 4990, 'price_XXXXXXXX', true, NOW(), NOW()),
  (gen_random_uuid(), 'PLAN_ID', 'YEARLY', 49900, 'price_YYYYYYYY', true, NOW(), NOW());
```

### Passo 5: Configurar Mapeamento de Domínio no Backend

Edite `apps/api/src/tenant/tenant.middleware.ts`:

```typescript
const DOMAIN_TO_TENANT: Record<string, string> = {
  // Tenants existentes
  'brewjaria.com.br': 'brew',
  'www.brewjaria.com.br': 'brew',
  
  // Novo tenant
  'meutenant.com.br': 'meu-tenant',
  'www.meutenant.com.br': 'meu-tenant',
};
```

### Passo 6: Criar Produtos no Stripe

1. Acesse o [Dashboard do Stripe](https://dashboard.stripe.com)
2. Vá em **Products** → **Add product**
3. Crie o produto com os preços (mensal e anual)
4. Copie os `price_id` de cada preço
5. Atualize o seed ou banco com os IDs corretos

### Passo 7: Testar Localmente

```bash
# Terminal 1: Backend
cd apps/api
pnpm dev

# Terminal 2: Frontend
cd apps/web
pnpm dev
```

Acesse:
- `http://localhost:3000/t/meu-tenant` - Via slug
- Ou configure `/etc/hosts` para testar domínio:
  ```
  127.0.0.1 meutenant.local
  ```
  E acesse `http://meutenant.local:3000`

### Passo 8: Testar Registro de Usuário

```bash
# Testar registro com o novo tenant
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Tenant: meu-tenant" \
  -d '{"name":"Teste","email":"teste@meutenant.com","password":"123456"}'
```

### Passo 9: Deploy

1. **Frontend (Vercel/Netlify)**:
   - Deploy automático via Git
   - Configurar domínio customizado

2. **Backend (Railway/Render)**:
   - Deploy automático via Git
   - Configurar variáveis de ambiente

3. **DNS**:
   - Apontar domínio para o frontend
   - Configurar SSL

---

## Checklist de Novo Tenant

- [ ] Criar config frontend (`pnpm tenant:new`)
- [ ] Editar configuração do tenant
- [ ] Registrar em `tenants.ts`
- [ ] Adicionar logo e assets
- [ ] Criar tenant no banco (seed ou SQL)
- [ ] Criar plano e preços
- [ ] Configurar Stripe (produtos e preços)
- [ ] Mapear domínio no middleware
- [ ] Testar localmente
- [ ] Deploy
- [ ] Configurar DNS

---

## Tokens CSS (Padrão shadcn/ui)

O sistema usa CSS variables para theming:

| Token | Uso |
|-------|-----|
| `--background` | Fundo principal |
| `--foreground` | Texto principal |
| `--muted` | Fundo secundário |
| `--muted-foreground` | Texto secundário |
| `--card` | Fundo de cards |
| `--card-foreground` | Texto em cards |
| `--primary` | Cor de destaque (CTAs) |
| `--primary-foreground` | Texto sobre primary |
| `--secondary` | Cor secundária |
| `--secondary-foreground` | Texto sobre secondary |
| `--accent` | Cor de hover/destaque sutil |
| `--accent-foreground` | Texto sobre accent |
| `--destructive` | Cor de erro/perigo |
| `--destructive-foreground` | Texto sobre destructive |
| `--border` | Cor de bordas |
| `--input` | Cor de inputs |
| `--ring` | Cor de focus ring |
| `--radius` | Border radius padrão |

## Como Criar uma Nova Marca

### 1. Definir o Tema

Edite `/src/config/themes.ts`:

```typescript
export const THEMES = {
  // ... temas existentes ...
  
  'minha-marca': {
    name: 'Minha Marca',
    slug: 'minha-marca',
    mode: 'light',
    tokens: {
      background: '#FFFFFF',
      foreground: '#1A1A1A',
      muted: '#F5F5F5',
      mutedForeground: '#666666',
      card: '#FFFFFF',
      cardForeground: '#1A1A1A',
      border: '#E5E5E5',
      input: '#E5E5E5',
      primary: '#E91E63',
      primaryForeground: '#FFFFFF',
      secondary: '#F5F5F5',
      secondaryForeground: '#1A1A1A',
      accent: '#FCE4EC',
      accentForeground: '#E91E63',
      destructive: '#EF4444',
      destructiveForeground: '#FFFFFF',
      ring: '#E91E63',
      radius: '0.5rem',
    },
  },
}
```

### 2. Configurar o Tenant

Edite `/src/config/tenants.ts`:

```typescript
const minhaMarca: TenantConfig = {
  id: 'minha-marca',
  name: 'Minha Marca',
  slug: 'minha-marca',
  
  // Domínios que resolvem para este tenant
  domains: ['minhamarca.com.br', 'www.minhamarca.com.br'],
  
  logo: '/logos/minha-marca.png',
  brandText: { line1: 'MINHA', line2: 'MARCA.' },
  tagline: 'Sua tagline aqui',
  description: 'Descrição da marca',
  
  // Referência ao tema (não embute o objeto)
  themeSlug: 'minha-marca',
  
  // Feature flags (controle de funcionalidades)
  featureFlags: {
    showCarousel: true,
    showHowItWorks: true,
    showFeatures: true,
    enableSubscription: true,
  },
  
  hero: { ... },
  plans: [ ... ],
  
  // Seções de conteúdo
  sections: {
    features: { title, subtitle, items },
    howItWorks: { title, steps },
  },
  
  contact: { ... },
  legal: { ... },
  seo: { ... },
}

// Registrar no TENANTS
export const TENANTS = {
  brewjaria,
  'minha-marca': minhaMarca,
}
```

### 3. Usar nos Componentes (SEM inline styles)

```tsx
import { useTenant, useFeature } from '@/contexts/TenantContext'

function Features() {
  const { tenant } = useTenant()
  const showFeatures = useFeature('showFeatures') // usa featureFlags
  
  if (!showFeatures) return null
  
  return (
    // Use classes Tailwind com tokens - NÃO use style={{}}
    <section className="bg-background py-16">
      <h2 className="text-primary text-4xl font-bold">
        {tenant.sections.features.title}
      </h2>
      <p className="text-muted-foreground">
        {tenant.sections.features.subtitle}
      </p>
    </section>
  )
}
```

## Temas Pré-definidos

| Slug | Modo | Background | Primary | Uso |
|------|------|------------|---------|-----|
| `brewjaria-dark` | dark | #1A1A1A | #F2C94C | Cervejas |
| `light-blue` | light | #FFFFFF | #2563EB | Corporativo |
| `coffee` | light | #FDF6E3 | #8B4513 | Café |
| `nature` | light | #F0F7F4 | #2E7D32 | Orgânicos |
| `wine` | dark | #1C1017 | #9B2C2C | Vinhos |

## Resolução de Tenant

Prioridade:
1. **Hostname** - `brewjaria.com.br` → tenant brewjaria
2. **Slug na URL** - `/t/brewjaria` → tenant brewjaria
3. **Fallback** - **APENAS em localhost/dev** → DEFAULT_TENANT_ID
4. **Produção** - Se não encontrar → retorna `null` (tratar como 404)

```typescript
import { 
  resolveTenantFromHeaders,           // Pode retornar null
  resolveTenantFromHeadersOrDefault,  // Sempre retorna tenant
} from '@/tenancy/resolveTenant'

// No server (layout.tsx) - com fallback garantido
const { tenant, theme, resolvedBy } = resolveTenantFromHeadersOrDefault(host)

// Para tratar 404 em produção
const result = resolveTenantFromHeaders(host)
if (!result) {
  // Redirecionar para landing ou mostrar 404
  notFound()
}
```

**Regra importante:**
- Em **localhost/dev**: fallback para DEFAULT_TENANT_ID
- Em **produção**: se hostname/slug não resolver → 404 ou redirect para landing institucional

## Validação com Zod

Todas as configs são validadas:

```typescript
import { validateAllConfigs } from '@/config/schemas'

// No build ou startup
validateAllConfigs() // Lança erro se houver problemas
```

## Hooks Disponíveis

| Hook | Retorno |
|------|---------|
| `useTenant()` | `{ tenant, theme, isDark, isLight, hasFeature }` |
| `useFeature(name)` | `boolean` |
| `useThemeMode()` | `{ mode, isDark, isLight }` |
| `useNavigation()` | `{ items, footerLinks }` |
| `useBranding()` | `{ name, logo, brandText, tagline }` |
| `usePlans()` | `PlanConfig[]` |
| `useContact()` | `{ email, phone, whatsapp }` |

## Estrutura de Pastas

```
src/
├── tenants/
│   └── brewjaria/
│       └── components/    # Componentes EXCLUSIVOS do Brewjaria (NÃO ALTERAR)
│
├── components/
│   └── shared/            # Componentes multi-tenant (usam tokens shadcn)
│
└── app/                   # Páginas (usam componentes de acordo com tenant)
```

## Convenção de Cores

### Cores do Brewjaria (namespace `brew-`)
Usadas APENAS em `src/tenants/brewjaria/` - **NÃO COLIDEM** com tokens shadcn:

```tsx
// Componentes Brewjaria - usar namespace brew-
<section className="bg-brew-black text-white">
  <h2 className="text-brew-gold">Benefícios</h2>
  <button className="bg-brew-gold hover:bg-brew-gold-dark">CTA</button>
</section>
```

| Classe | Valor | Uso |
|--------|-------|-----|
| `bg-brew-black` | #1A1A1A | Fundo escuro Brewjaria |
| `text-brew-gold` | #F2C94C | Dourado Brewjaria |
| `bg-brew-gold` | #F2C94C | Fundo dourado |
| `border-brew-gold` | #F2C94C | Borda dourada |

### Tokens shadcn/ui (padrão CSS variables)
Usadas em `src/components/shared/` - funcionam com qualquer tema:

```tsx
// Componentes shared - usar tokens shadcn padrão
import { useTenant } from '@/contexts/TenantContext'

function Features() {
  const { tenant } = useTenant()
  
  return (
    <section className="bg-background text-foreground">
      <h2 className="text-primary">
        {tenant.sections.features.title}
      </h2>
      <p className="text-muted-foreground">
        {tenant.sections.features.subtitle}
      </p>
    </section>
  )
}
```

| Classe | CSS Variable | Uso |
|--------|--------------|-----|
| `bg-background` | var(--background) | Fundo principal |
| `text-foreground` | var(--foreground) | Texto principal |
| `text-primary` | var(--primary) | Cor de destaque |
| `text-muted-foreground` | var(--muted-foreground) | Texto secundário |
| `bg-card` | var(--card) | Fundo de cards |
| `border-border` | var(--border) | Bordas |

## Nomenclatura

| Termo | Significado |
|-------|-------------|
| `featureFlags` | Flags booleanos para controlar funcionalidades |
| `sections.features` | Conteúdo da seção "Por que escolher" |
| `sections.howItWorks` | Conteúdo da seção "Como Funciona" |
| `themeSlug` | Referência ao tema (ex: `brewjaria-dark`) |
| `tenant.slug` | Identificador do tenant (ex: `brewjaria`) |

## Nichos Sugeridos

- 🍺 **Cervejas** (Brewjaria)
- ☕ **Cafés** - Clube de cafés especiais
- 🍷 **Vinhos** - Assinatura de vinhos
- 📚 **Livros** - Clube do livro
- 🧴 **Cosméticos** - Box de beleza
- 🐕 **Pet** - Produtos para pets
- 🍫 **Snacks** - Caixas de snacks
- 🎮 **Geek** - Produtos geek/nerd

## Status dos Componentes

| Componente | Status | Arquivo |
|------------|--------|---------|
| Home (Hero, Features, Pricing, Footer) | ✅ Shared | `components/shared/*Shared.tsx` |
| Header | ✅ Shared | `HeaderShared.tsx` |
| SubscriptionFlow | ✅ Shared | `SubscriptionFlowShared.tsx` |
| /privacidade, /termos | ✅ Shared | `app/t/[slug]/privacidade/`, `app/t/[slug]/termos/` |
| Steps (Account, Address, Payment) | ✅ Shared | `components/shared/steps/*Shared.tsx` |

## Estrutura de Arquivos Shared

```
src/components/shared/
├── HeaderShared.tsx
├── HeroShared.tsx
├── HowItWorksShared.tsx
├── FeaturesShared.tsx
├── PricingShared.tsx
├── FooterShared.tsx
├── SubscriptionFlowShared.tsx
└── steps/
    ├── AccountStepShared.tsx
    ├── AddressStepShared.tsx
    ├── PaymentStepShared.tsx
    └── SubscriptionStepsShared.tsx
```

---

## Backend - Configuração

### Arquitetura do Backend

O backend NestJS é **único** para todos os tenants. A separação de dados é feita via:

1. **TenantMiddleware** - Resolve tenant por header ou domínio
2. **tenantId** - Todas as entidades principais têm relação com Tenant
3. **Filtros por tenant** - Queries filtram dados por tenantId

### Estrutura de Arquivos do Backend

```
apps/api/src/
├── tenant/
│   ├── tenant.middleware.ts   # Middleware de resolução
│   ├── tenant.module.ts       # Módulo NestJS
│   └── tenant.types.ts        # Tipos TypeScript
├── auth/
│   ├── auth.controller.ts     # Endpoints de autenticação
│   └── auth.service.ts        # Lógica de auth (usa tenant)
├── admin/
│   └── admin.service.ts       # Endpoints admin (filtro por tenant)
├── subscriptions/
│   └── subscriptions.service.ts
├── health/
│   └── health.controller.ts   # Health check (sem tenant)
└── prisma/
    └── schema.prisma          # Schema do banco
```

### TenantMiddleware

O middleware resolve o tenant em cada requisição:

```typescript
// apps/api/src/tenant/tenant.middleware.ts

// Prioridade de resolução:
// 1. Header X-Tenant (enviado pelo frontend)
// 2. Mapeamento de domínio (Host header)
// 3. DEFAULT_TENANT_SLUG (env var, apenas dev)

const DOMAIN_TO_TENANT: Record<string, string> = {
  'brewjaria.com.br': 'brew',
  'coffee-club.com.br': 'coffee-club',
  // Adicione novos mapeamentos aqui
};

// Resultado: req.tenant = { id, slug, name }
```

### Rotas Excluídas do Middleware

Algumas rotas não precisam de tenant:

```typescript
// apps/api/src/tenant/tenant.module.ts
consumer
  .apply(TenantMiddleware)
  .exclude(
    { path: 'health', method: RequestMethod.ALL },      // Health check
    { path: 'stripe/webhook', method: RequestMethod.POST }, // Webhook Stripe
  )
  .forRoutes('*');
```

### Usando Tenant nos Services

```typescript
// Exemplo: auth.service.ts
async register(dto: RegisterDto, tenant: TenantContext) {
  // Validar tenant
  if (!tenant || !tenant.id) {
    throw new BadRequestException('Tenant context is required');
  }

  // Criar usuário com tenantId
  const user = await this.prisma.user.create({
    data: {
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      tenantId: tenant.id, // ← Associa ao tenant
    },
  });
}
```

### Filtros por Tenant no Admin

```typescript
// admin.service.ts
async getUsers(page = 1, limit = 20, search?: string, tenant?: TenantContext) {
  const tenantFilter = tenant ? { tenantId: tenant.id } : {};
  
  const users = await this.prisma.user.findMany({
    where: {
      ...tenantFilter,
      // outros filtros
    },
  });
}
```

> **Nota**: O admin atualmente é GLOBAL (superadmin). Para habilitar filtro por tenant, passe o parâmetro `tenant` nos métodos.

### Health Check com Versão

```typescript
// health.controller.ts
@Get()
check() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    commit: process.env.GIT_COMMIT || 'unknown',
    environment: process.env.NODE_ENV || 'development',
  };
}
```

### Variáveis de Ambiente do Backend

```env
# .env
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
WEB_URL="https://brewjaria.com.br"

# Multi-tenant
DEFAULT_TENANT_SLUG="brew"  # Fallback para dev
GIT_COMMIT="abc123"         # Para health check
```

---

## Banco de Dados

### Schema Prisma (Entidades Principais)

```prisma
// apps/api/prisma/schema.prisma

model Tenant {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users         User[]
  plans         Plan[]
  subscriptions Subscription[]
}

model User {
  id       String @id @default(cuid())
  tenantId String
  tenant   Tenant @relation(fields: [tenantId], references: [id])
  
  name     String
  email    String @unique
  password String
  role     UserRole @default(CUSTOMER)
  // ...
}

model Plan {
  id       String @id @default(cuid())
  tenantId String
  tenant   Tenant @relation(fields: [tenantId], references: [id])
  
  name        String
  slug        String @unique
  description String
  active      Boolean @default(true)
  // ...
}

model Subscription {
  id       String @id @default(cuid())
  userId   String
  planId   String
  tenantId String
  tenant   Tenant @relation(fields: [tenantId], references: [id])
  
  status   SubscriptionStatus @default(PENDING)
  // ...
}
```

### Comandos Úteis

```bash
# Gerar cliente Prisma
cd apps/api
pnpm prisma generate

# Criar migration
pnpm prisma migrate dev --name nome_da_migration

# Executar seed
pnpm prisma db seed

# Abrir Prisma Studio
pnpm prisma studio
```

---

## Deploy e Domínios

### Configuração de Domínios

Para cada tenant, você precisa:

1. **Frontend**: Configurar domínio no Vercel/Netlify
2. **Backend**: Adicionar mapeamento no middleware
3. **DNS**: Apontar domínio para o frontend

### Exemplo de Configuração

| Tenant | Domínio | Frontend | Backend Header |
|--------|---------|----------|----------------|
| Brewjaria | brewjaria.com.br | Vercel | X-Tenant: brew |
| Coffee Club | coffee-club.com.br | Vercel | X-Tenant: coffee-club |
| Pet Box | pet-box.com.br | Vercel | X-Tenant: pet-box |

### Frontend Enviando Header

```typescript
// apps/web/src/lib/api.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  // Pegar tenant do contexto
  const tenant = getTenantFromContext();
  if (tenant) {
    config.headers['X-Tenant'] = tenant.slug;
  }
  return config;
});
```

---

## Troubleshooting

### Erro: "Invalid tenant"

**Causa**: Header X-Tenant não enviado ou tenant não existe no banco.

**Solução**:
1. Verificar se o frontend está enviando o header
2. Verificar se o tenant existe no banco: `SELECT * FROM "Tenant" WHERE slug = 'xxx'`
3. Verificar mapeamento de domínio no middleware

### Erro: "Tenant context is required"

**Causa**: Tentando registrar usuário sem tenant.

**Solução**:
1. Verificar se o middleware está rodando
2. Verificar se a rota não está excluída do middleware
3. Adicionar `DEFAULT_TENANT_SLUG` no .env para dev

### Usuários misturados entre tenants

**Causa**: Queries não estão filtrando por tenantId.

**Solução**:
1. Adicionar `tenantFilter` em todas as queries
2. Verificar se o tenant está sendo passado para os services

### Health check retornando erro de tenant

**Causa**: Rota /health não está excluída do middleware.

**Solução**:
```typescript
// tenant.module.ts
.exclude({ path: 'health', method: RequestMethod.ALL })
```

---

## Critérios de Aceite

- [x] Brewjaria funciona como tenant normal
- [x] Trocar hostname (ou slug) muda tenant
- [x] Wine Club funciona em /t/wine-club
- [x] Tema wine aplica corretamente
- [x] Componentes shared usam tokens shadcn
- [x] Tema muda sem flash (SSR)
- [x] Componentes não precisam de inline color
- [x] Configs validadas com Zod
- [x] Estrutura pronta para múltiplos domínios
- [x] Backend com TenantMiddleware
- [x] Registro de usuário usa tenant do contexto
- [x] Admin com filtros por tenant
- [x] Health check com versão/commit

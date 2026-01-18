# Criação de Tenant - Documentação Completa

> **Gerado em**: 22/12/2025  
> **Baseado em**: Código do repositório Brewjaria  
> **Versão**: Multi-tenant Go Live

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Modelo de Dados (Prisma)](#2-modelo-de-dados-prisma)
3. [Criação via CLI (Frontend)](#3-criação-via-cli-frontend)
4. [Criação via Seed/Migration (Backend)](#4-criação-via-seedmigration-backend)
5. [Criação via API/Admin](#5-criação-via-apiadmin)
6. [Resolução de Tenant em Runtime](#6-resolução-de-tenant-em-runtime)
7. [Tema/Branding por Tenant](#7-temabranding-por-tenant)
8. [Guia Operacional (Passo a Passo)](#8-guia-operacional-passo-a-passo)
9. [Checklist de Validação](#9-checklist-de-validação)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Visão Geral

### O que é Tenant no Brewjaria?

Tenant é uma **entidade que representa uma marca/empresa** dentro da plataforma multi-tenant. Cada tenant possui:

- **Identidade própria**: nome, slug, logo, cores
- **Dados isolados**: usuários, planos, assinaturas, entregas
- **Configuração visual**: tema, hero, seções de conteúdo
- **Domínio(s)**: pode ter domínio próprio ou usar `/t/{slug}`

### Arquitetura Multi-Tenant

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  apps/web/src/config/tenants.ts  ← Configuração visual      │
│  apps/web/src/config/themes.ts   ← Temas de cores           │
│  apps/web/src/tenancy/           ← Resolução de tenant      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ X-Tenant header
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│  apps/api/src/tenant/tenant.middleware.ts ← Valida tenant   │
│  apps/api/prisma/schema.prisma            ← Model Tenant    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        DATABASE                              │
│  Tenant → User, Plan, Subscription (tenantId)               │
└─────────────────────────────────────────────────────────────┘
```

### Onde o Tenant é Definido

| Camada | Arquivo | Propósito |
|--------|---------|-----------|
| **DB** | `apps/api/prisma/schema.prisma` | Model Tenant e relações |
| **Backend** | `apps/api/src/tenant/tenant.middleware.ts` | Validação e injeção no request |
| **Frontend** | `apps/web/src/config/tenants.ts` | Configuração visual completa |
| **Frontend** | `apps/web/src/config/themes.ts` | Temas de cores |

---

## 2. Modelo de Dados (Prisma)

### Arquivo: `apps/api/prisma/schema.prisma`

```prisma
model Tenant {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users         User[]
  plans         Plan[]
  subscriptions Subscription[]

  @@index([slug])
}
```

**Linhas**: 55-67

### Relações

| Model | Campo | Relação |
|-------|-------|---------|
| `User` | `tenantId` | Cada usuário pertence a um tenant |
| `Plan` | `tenantId` | Cada plano pertence a um tenant |
| `Subscription` | `tenantId` | Cada assinatura pertence a um tenant |

### Exemplo de User com Tenant

```prisma
model User {
  id       String   @id @default(cuid())
  tenantId String
  tenant   Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  // ...
}
```

**Linhas**: 69-81

---

## 3. Criação via CLI (Frontend)

### Comando

```bash
# Da raiz do monorepo
pnpm tenant:new <slug>

# Exemplos
pnpm tenant:new coffee-club
pnpm tenant:new pet-box
pnpm tenant:new book-club
```

### Arquivo do Script

**Caminho**: `apps/web/scripts/create-tenant.js`

### O que o Script Faz

1. **Valida slug** - normaliza para lowercase e kebab-case
2. **Verifica duplicidade** - erro se já existir
3. **Cria arquivo de configuração** - `apps/web/src/config/tenants/{slug}.ts`
4. **Cria pasta de assets** - `apps/web/public/tenants/{slug}/`
5. **Cria logo placeholder** - SVG básico

### Código Relevante

```javascript
// apps/web/scripts/create-tenant.js (linhas 34-66)

function createTenant(slug) {
  const normalizedSlug = slugify(slug)
  const pascalName = toPascalCase(normalizedSlug)
  
  console.log(`\n🚀 Criando tenant: ${normalizedSlug}\n`)
  
  // 1. Verificar se já existe
  const tenantFile = path.join(TENANTS_DIR, `${normalizedSlug}.ts`)
  if (fs.existsSync(tenantFile)) {
    console.error(`❌ Erro: Tenant "${normalizedSlug}" já existe em ${tenantFile}`)
    process.exit(1)
  }
  
  // 2. Ler template
  let template = fs.readFileSync(TEMPLATE_PATH, 'utf-8')
  
  // 3. Substituir placeholders
  template = template
    .replace(/templateTenant/g, `${varName}Tenant`)
    .replace(/\[SUBSTITUIR\]/g, normalizedSlug)
    // ...
  
  // 4. Criar arquivo do tenant
  fs.writeFileSync(tenantFile, template)
  
  // 5. Criar pasta de assets
  const assetsDir = path.join(PUBLIC_TENANTS_DIR, normalizedSlug)
  fs.mkdirSync(assetsDir, { recursive: true })
}
```

### Output Esperado

```
🚀 Criando tenant: coffee-club

✅ Criado: apps/web/src/config/tenants/coffee-club.ts
✅ Criado: apps/web/public/tenants/coffee-club/
✅ Criado: apps/web/public/tenants/coffee-club/logo.svg (placeholder)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Tenant "coffee-club" criado com sucesso!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Próximos passos:

1. Edite o arquivo de configuração:
   apps/web/src/config/tenants/coffee-club.ts

2. Substitua os valores marcados com [SUBSTITUIR]

3. Registre o tenant em src/config/tenants.ts:
   import { coffeeClubTenant } from './tenants/coffee-club'
   
   export const TENANTS = {
     ...
     'coffee-club': coffeeClubTenant,
   }

4. Adicione um logo real em:
   apps/web/public/tenants/coffee-club/logo.png

5. Teste em:
   http://localhost:3000/t/coffee-club
```

### Template Usado

**Caminho**: `apps/web/src/config/tenants/_template.ts`

```typescript
// apps/web/src/config/tenants/_template.ts (linhas 19-50)

export const templateTenant: TenantConfig = {
  // IDENTIFICAÇÃO (OBRIGATÓRIO)
  id: '[SUBSTITUIR]',           // Ex: 'meu-clube'
  slug: '[SUBSTITUIR]',         // Ex: 'meu-clube' (usado na URL /t/meu-clube)
  name: '[SUBSTITUIR]',         // Ex: 'Meu Clube'
  
  // Domínios que resolvem para este tenant (OPCIONAL)
  domains: [],
  
  // BRANDING (OBRIGATÓRIO)
  logo: '/tenants/[SLUG]/logo.png',
  brandText: {
    line1: '[LINHA1]',
    line2: '[LINHA2].',
  },
  tagline: '[SUBSTITUIR]',
  description: '[SUBSTITUIR]',
  
  // TEMA (OBRIGATÓRIO)
  themeSlug: 'light-blue',
  
  // ...resto da configuração
}
```

### Registrar o Tenant (Manual)

Após criar via CLI, é necessário registrar manualmente:

**Arquivo**: `apps/web/src/config/tenants.ts`

```typescript
// 1. Adicionar import (linha ~6)
import { coffeeClubTenant } from './tenants/coffee-club'

// 2. Registrar no objeto TENANTS (linha ~537)
export const TENANTS: Record<string, TenantConfig> = {
  brewjaria,
  'template-light': templateLight,
  'wine-club': wineClub,
  'coffee-club': coffeeClubTenant,  // ← Adicionar aqui
}
```

---

## 4. Criação via Seed/Migration (Backend)

### ⚠️ IMPORTANTE

O script CLI cria apenas a **configuração visual** no frontend. Para o tenant existir no **banco de dados**, é necessário:

1. Usar o **seed** (desenvolvimento)
2. Usar o **script de migração** (produção)
3. Criar manualmente via SQL

### Seed Padrão

**Arquivo**: `apps/api/prisma/seed.ts`

```typescript
// apps/api/prisma/seed.ts (linhas 8-17)

// Criar tenant (slug deve ser igual ao frontend: 'brewjaria')
const tenant = await prisma.tenant.upsert({
  where: { slug: 'brewjaria' },
  update: {},
  create: {
    name: 'Brewjaria',
    slug: 'brewjaria',
  },
});
console.log('✅ Tenant created:', tenant.slug);
```

### Executar Seed

```bash
cd apps/api
npx prisma db seed
```

### Script de Migração (Múltiplos Tenants)

**Arquivo**: `apps/api/prisma/migrate-tenants.ts`

```typescript
// apps/api/prisma/migrate-tenants.ts (linhas 17-24)

const TENANTS_TO_CREATE = [
  { slug: 'brewjaria', name: 'Brewjaria' },
  { slug: 'template-light', name: 'Template Light' },
  { slug: 'wine-club', name: 'Wine Club' },
  { slug: 'coffee-club', name: 'Coffee Club' },
  { slug: 'pet-box', name: 'Pet Box' },
];
```

### Executar Migração

```bash
cd apps/api
npx ts-node prisma/migrate-tenants.ts
```

### Output Esperado

```
🚀 Iniciando migração de tenants...

✅ Tenant "brewjaria" já existe. Nenhuma migração necessária.

📦 Criando tenants faltantes...

   ⏭️  brewjaria - já existe
   ✅ template-light - criado (id: clxxx...)
   ✅ wine-club - criado (id: clxxx...)
   ✅ coffee-club - criado (id: clxxx...)
   ✅ pet-box - criado (id: clxxx...)

📋 Tenants no banco após migração:
   - brewjaria (Brewjaria)
   - coffee-club (Coffee Club)
   - pet-box (Pet Box)
   - template-light (Template Light)
   - wine-club (Wine Club)

🎉 Migração concluída!
```

### Criar Tenant Manualmente (SQL)

```sql
INSERT INTO "Tenant" (id, name, slug, "createdAt", "updatedAt")
VALUES (
  'tenant_meu_tenant',
  'Meu Tenant',
  'meu-tenant',
  NOW(),
  NOW()
);
```

---

## 5. Criação via API/Admin

### ❌ Não Encontrado no Repositório

**Não existe endpoint de API para criar tenants.**

O sistema atual não possui:
- `POST /admin/tenants` - endpoint para criar tenant
- `TenantController` - controller dedicado
- `TenantService` - service com CRUD

### Alternativas Existentes

| Método | Onde | Uso |
|--------|------|-----|
| CLI | `pnpm tenant:new` | Cria config frontend |
| Seed | `npx prisma db seed` | Cria tenant padrão no DB |
| Migration | `npx ts-node prisma/migrate-tenants.ts` | Cria múltiplos tenants |
| SQL direto | Console do banco | Produção/emergência |

### Sugestão de Implementação (Futuro)

Se precisar de endpoint, criar:

```typescript
// apps/api/src/tenant/tenant.controller.ts (NÃO EXISTE)
@Controller('admin/tenants')
@UseGuards(JwtAuthGuard, AdminGuard)
export class TenantController {
  @Post()
  async create(@Body() dto: CreateTenantDto) {
    return this.tenantService.create(dto);
  }
}
```

---

## 6. Resolução de Tenant em Runtime

### Frontend - Resolução

**Arquivo**: `apps/web/src/tenancy/resolveTenant.ts`

```typescript
// apps/web/src/tenancy/resolveTenant.ts (linhas 64-107)

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

  // 2. Tentar resolver por slug na URL (/t/brewjaria)
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

  // 4. Em PRODUÇÃO: retorna null (404)
  return null
}
```

### Prioridade de Resolução

```
1. DOMÍNIO    → brewjaria.com.br → tenant: brewjaria
2. URL SLUG   → /t/wine-club     → tenant: wine-club
3. FALLBACK   → localhost        → tenant: brewjaria (apenas dev)
4. ERRO       → produção         → null (404)
```

### Frontend - Envio do Header X-Tenant

**Arquivo**: `apps/web/src/lib/api.ts`

```typescript
// apps/web/src/lib/api.ts (linhas 14-31)

// Fallback tenant para produção (domínio principal)
const DEFAULT_TENANT_SLUG = 'brewjaria'

// Add token and tenant to requests
api.interceptors.request.use((config) => {
  // Auth token
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  
  // Tenant header (multi-tenancy)
  // Prioridade: store > fallback
  const tenantSlug = getTenantSlug() || DEFAULT_TENANT_SLUG
  config.headers['X-Tenant'] = tenantSlug
  
  return config
})
```

### Frontend - Store do Tenant

**Arquivo**: `apps/web/src/stores/tenantStore.ts`

```typescript
// apps/web/src/stores/tenantStore.ts (linhas 20-32)

export const useTenantStore = create<TenantStoreState>((set) => ({
  slug: null,
  setSlug: (slug) => set({ slug }),
  clearSlug: () => set({ slug: null }),
}))

export function getTenantSlug(): string | null {
  return useTenantStore.getState().slug
}
```

### Backend - Middleware de Validação

**Arquivo**: `apps/api/src/tenant/tenant.middleware.ts`

```typescript
// apps/api/src/tenant/tenant.middleware.ts (linhas 43-88)

async use(req: Request, res: Response, next: NextFunction) {
  // 1. Tentar resolver por header X-Tenant (prioridade máxima)
  let tenantSlug = req.headers['x-tenant'] as string;

  // 2. Se não tiver header, tentar resolver por Host
  if (!tenantSlug) {
    const host = req.headers.host?.split(':')[0]?.toLowerCase();
    if (host && DOMAIN_TO_TENANT[host]) {
      tenantSlug = DOMAIN_TO_TENANT[host];
    }
  }

  // 3. Fallback para tenant padrão em desenvolvimento
  if (!tenantSlug) {
    const defaultTenant = process.env.DEFAULT_TENANT_SLUG;
    if (defaultTenant) {
      tenantSlug = defaultTenant;
    }
  }

  // Se ainda não tiver tenant, retornar erro
  if (!tenantSlug) {
    throw new BadRequestException(
      'Invalid tenant. Please provide X-Tenant header or use a valid domain.',
    );
  }

  // Validar tenant no banco
  const tenant = await this.prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true, slug: true, name: true },
  });

  if (!tenant) {
    throw new BadRequestException(`Invalid tenant: ${tenantSlug}`);
  }

  // Injetar tenant no request
  req.tenant = {
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
  };

  next();
}
```

### Backend - Mapeamento de Domínios

**Arquivo**: `apps/api/src/tenant/tenant.middleware.ts`

```typescript
// apps/api/src/tenant/tenant.middleware.ts (linhas 18-37)

const DOMAIN_TO_TENANT: Record<string, string> = {
  // Brewjaria (produção)
  'brewjaria.com.br': 'brewjaria',
  'www.brewjaria.com.br': 'brewjaria',
  'brewjaria-web.vercel.app': 'brewjaria',
  
  // Wine Club
  'wineclub.com.br': 'wine-club',
  'www.wineclub.com.br': 'wine-club',
  
  // Coffee Club
  'coffee-club.com.br': 'coffee-club',
  'www.coffee-club.com.br': 'coffee-club',
  
  // Pet Box
  'pet-box.com.br': 'pet-box',
  'www.pet-box.com.br': 'pet-box',
};
```

### Backend - Uso do Tenant nas Queries

**Arquivo**: `apps/api/src/auth/auth.service.ts`

```typescript
// apps/api/src/auth/auth.service.ts (linhas 44-51)

// Cria usuário usando o tenant do contexto
const user = await this.prisma.user.create({
  data: {
    name,
    email,
    password: hashedPassword,
    tenantId: tenant.id, // Usa tenant do contexto
    // ...
  },
});
```

---

## 7. Tema/Branding por Tenant

### Arquivo de Temas

**Caminho**: `apps/web/src/config/themes.ts`

### Temas Disponíveis

```typescript
// apps/web/src/config/themes.ts (linhas 99-244)

export const THEMES: Record<string, ThemeConfig> = {
  'brewjaria-dark': { /* Dark Premium com Dourado */ },
  'light-blue':     { /* Light Default - Azul corporativo */ },
  'coffee':         { /* Tons terrosos */ },
  'nature':         { /* Verde orgânico */ },
  'wine':           { /* Vinho elegante */ },
}
```

| Slug | Modo | Cor Principal | Ideal para |
|------|------|---------------|------------|
| `brewjaria-dark` | Dark | Dourado (#F2C94C) | Cervejas |
| `light-blue` | Light | Azul (#2563EB) | Genérico, tech |
| `coffee` | Light | Marrom (#8B4513) | Cafés, chocolates |
| `nature` | Light | Verde (#2E7D32) | Orgânicos |
| `wine` | Dark | Vinho (#9B2C2C) | Vinhos, premium |

### Estrutura de um Tema

```typescript
// apps/web/src/config/themes.ts (linhas 101-127)

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
    primary: '#F2C94C',           // COR PRINCIPAL
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
```

### Vincular Tenant ao Tema

No arquivo de configuração do tenant:

```typescript
// apps/web/src/config/tenants.ts (linha 148)

const brewjaria: TenantConfig = {
  // ...
  themeSlug: 'brewjaria-dark',  // ← Referência ao tema
  // ...
}
```

### Criar Novo Tema

1. Abra `apps/web/src/config/themes.ts`
2. Adicione ao objeto `THEMES`:

```typescript
'meu-tema': {
  name: 'Meu Tema',
  slug: 'meu-tema',
  mode: 'dark',  // ou 'light'
  tokens: {
    background: '#1A1A2E',
    foreground: '#EAEAEA',
    // ... todos os tokens
    primary: '#E94560',  // COR PRINCIPAL
    // ...
  },
},
```

3. Use no tenant:

```typescript
themeSlug: 'meu-tema',
```

### Fallback de Tema

```typescript
// apps/web/src/config/themes.ts (linhas 249-259)

export const DEFAULT_THEME_SLUG = 'light-blue'

export function getTheme(slug?: string): ThemeConfig {
  const key = (slug || '').trim().toLowerCase()
  return THEMES[key] ?? THEMES[DEFAULT_THEME_SLUG]
}
```

---

## 8. Guia Operacional (Passo a Passo)

### Pré-requisitos

```bash
# Verificar versões
node -v  # >= 18
pnpm -v  # >= 8
```

### 1. Instalar Dependências

```bash
cd ~/BREWJARIA
pnpm install
```

### 2. Configurar Banco de Dados

```bash
# Copiar env de exemplo
cp apps/api/.env.example apps/api/.env

# Editar com sua DATABASE_URL
# DATABASE_URL="postgresql://user:pass@localhost:5432/brewjaria"
```

### 3. Rodar Migrations

```bash
cd apps/api
npx prisma migrate dev
```

### 4. Rodar Seed

```bash
cd apps/api
npx prisma db seed
```

### 5. Criar Tenant (Frontend)

```bash
# Da raiz do monorepo
pnpm tenant:new meu-cliente
```

### 6. Configurar o Tenant

Edite `apps/web/src/config/tenants/meu-cliente.ts`:

```typescript
export const meuClienteTenant: TenantConfig = {
  id: 'meu-cliente',
  slug: 'meu-cliente',
  name: 'Meu Cliente',
  themeSlug: 'light-blue',
  // ... preencher todos os campos
}
```

### 7. Registrar o Tenant

Edite `apps/web/src/config/tenants.ts`:

```typescript
// Import
import { meuClienteTenant } from './tenants/meu-cliente'

// Registro
export const TENANTS: Record<string, TenantConfig> = {
  // ...existentes
  'meu-cliente': meuClienteTenant,
}
```

### 8. Criar Tenant no Banco

Adicione ao `apps/api/prisma/migrate-tenants.ts`:

```typescript
const TENANTS_TO_CREATE = [
  // ...existentes
  { slug: 'meu-cliente', name: 'Meu Cliente' },
];
```

Execute:

```bash
cd apps/api
npx ts-node prisma/migrate-tenants.ts
```

### 9. Iniciar Servidores

```bash
# Terminal 1 - API
cd apps/api
pnpm dev

# Terminal 2 - Web
cd apps/web
pnpm dev
```

### 10. Testar

```
http://localhost:3000/t/meu-cliente
```

### 11. Validar no Banco

```sql
-- Verificar tenant criado
SELECT id, slug, name FROM "Tenant" WHERE slug = 'meu-cliente';

-- Verificar todos os tenants
SELECT id, slug, name FROM "Tenant" ORDER BY slug;
```

---

## 9. Checklist de Validação

### Checklist Completo (10 itens)

- [ ] **1. Arquivo de config criado**: `apps/web/src/config/tenants/{slug}.ts`
- [ ] **2. Tenant registrado**: Adicionado ao objeto `TENANTS` em `tenants.ts`
- [ ] **3. Tenant no banco**: Existe registro na tabela `Tenant`
- [ ] **4. Tema válido**: `themeSlug` aponta para tema existente
- [ ] **5. Assets**:
  - [ ] Logo em `public/tenants/<slug>/logo.png`
  - [ ] Favicon em `public/tenants/<slug>/favicon.svg` (opcional, fallback para global)
  - [ ] Imagens do hero (se usar carrossel)
- [ ] **6. Página carrega**: `http://localhost:3000/t/{slug}` funciona
- [ ] **7. Cores aplicadas**: Tema visual correto
- [ ] **8. Registro funciona**: Novo usuário é criado com `tenantId` correto
- [ ] **9. Login funciona**: Usuário consegue autenticar
- [ ] **10. Domínio mapeado** (produção): Adicionado ao `DOMAIN_TO_TENANT`

### Queries de Validação

```sql
-- 1. Verificar tenant existe
SELECT * FROM "Tenant" WHERE slug = 'meu-cliente';

-- 2. Verificar usuários do tenant
SELECT u.email, t.slug 
FROM "User" u 
JOIN "Tenant" t ON t.id = u."tenantId" 
WHERE t.slug = 'meu-cliente';

-- 3. Verificar planos do tenant
SELECT p.name, p.slug, t.slug as tenant
FROM "Plan" p
JOIN "Tenant" t ON t.id = p."tenantId"
WHERE t.slug = 'meu-cliente';

-- 4. Contar usuários por tenant
SELECT t.slug, COUNT(u.id) as users
FROM "Tenant" t
LEFT JOIN "User" u ON u."tenantId" = t.id
GROUP BY t.slug
ORDER BY t.slug;
```

---

## 10. Troubleshooting

### Erro: "Tenant not found"

**Causa**: Tenant não está registrado no frontend.

**Solução**:
1. Verifique se o tenant está no objeto `TENANTS` em `apps/web/src/config/tenants.ts`
2. Verifique se o slug na URL corresponde ao slug do tenant

```typescript
// Verificar
console.log(Object.keys(TENANTS))
```

### Erro: "Invalid tenant: xxx"

**Causa**: Tenant não existe no banco de dados.

**Solução**:
```bash
# Verificar no banco
SELECT * FROM "Tenant" WHERE slug = 'xxx';

# Se não existir, criar
cd apps/api
npx ts-node prisma/migrate-tenants.ts
```

### Erro: "Theme not found"

**Causa**: `themeSlug` inválido na config do tenant.

**Solução**:
1. Verifique se o `themeSlug` existe em `apps/web/src/config/themes.ts`
2. Use um tema existente: `brewjaria-dark`, `light-blue`, `coffee`, `nature`, `wine`

### Cores erradas / Tema não aplicado

**Causa**: Classes Tailwind incorretas ou tema não carregado.

**Solução**:
1. Use classes Tailwind com tokens: `bg-background`, `text-foreground`, `bg-primary`
2. NÃO use cores hardcoded: `bg-black`, `text-white`
3. Verifique se o tema tem todos os tokens definidos

### Logo não aparece

**Causa**: Caminho incorreto ou arquivo não existe.

**Solução**:
1. Verifique o caminho em `tenant.logo`
2. Confirme que o arquivo existe em `apps/web/public/tenants/{slug}/`
3. Use caminho relativo: `/tenants/meu-cliente/logo.png`

### Usuário criado no tenant errado

**Causa**: Header `X-Tenant` não está sendo enviado.

**Solução**:
1. Verifique se o interceptor está configurado em `apps/web/src/lib/api.ts`
2. Verifique se o `tenantStore` está sendo setado pelo `TenantProvider`
3. Use DevTools (F12) → Network → verifique header `X-Tenant`

### Erro CORS com X-Tenant

**Causa**: Header não está na lista de `allowedHeaders`.

**Solução**:
Verifique `apps/api/src/main.ts`:

```typescript
app.enableCors({
  // ...
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Tenant'],
});
```

### Prisma: "Record not found"

**Causa**: Tenant existe no frontend mas não no banco.

**Solução**:
```bash
# Sincronizar banco
cd apps/api
npx ts-node prisma/migrate-tenants.ts
```

### Como debugar resolução de tenant

```typescript
// No frontend, adicione temporariamente:
console.log('Tenant resolvido:', useTenant())

// No backend, verifique logs:
console.log('Request tenant:', req.tenant)
```

---

## Referências de Arquivos

| Arquivo | Propósito |
|---------|-----------|
| `apps/api/prisma/schema.prisma` | Model Tenant (linhas 55-67) |
| `apps/api/prisma/seed.ts` | Seed do tenant padrão |
| `apps/api/prisma/migrate-tenants.ts` | Script de migração |
| `apps/api/src/tenant/tenant.middleware.ts` | Middleware de validação |
| `apps/api/src/tenant/tenant.module.ts` | Módulo NestJS |
| `apps/api/src/tenant/tenant.types.ts` | Tipos TypeScript |
| `apps/web/scripts/create-tenant.js` | CLI para criar tenant |
| `apps/web/src/config/tenants.ts` | Registro de tenants |
| `apps/web/src/config/tenants/_template.ts` | Template de tenant |
| `apps/web/src/config/themes.ts` | Temas de cores |
| `apps/web/src/tenancy/resolveTenant.ts` | Resolução de tenant |
| `apps/web/src/stores/tenantStore.ts` | Store Zustand |
| `apps/web/src/lib/api.ts` | Interceptor com X-Tenant |
| `docs/CRIAR_NOVO_CLIENTE.md` | Guia existente |

---

## Histórico de Alterações

| Data | Alteração |
|------|-----------|
| 22/12/2024 | Documentação inicial criada |

---

*Documentação gerada automaticamente a partir do código do repositório Brewjaria.*

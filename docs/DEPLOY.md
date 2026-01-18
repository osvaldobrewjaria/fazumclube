# Deploy - Documentação Oficial

> **Atualizado**: 22/12/2025  
> **Stack**: NestJS (Render) + Next.js (Vercel) + PostgreSQL (Render)

## Arquivos de Configuração no Repositório

| Arquivo | Propósito | Status |
|---------|-----------|--------|
| `apps/web/vercel.json` | Config Vercel (frontend) | ✅ Usado em produção |
| `apps/web/netlify.toml` | Config Netlify (alternativa) | ⚠️ Backup, não usado |
| `render.yaml` | Config Render (backend) | ❌ Não existe (config via dashboard) |

> **Nota**: O backend no Render é configurado via dashboard, não via arquivo YAML.

---

## 1. Arquitetura de Deploy

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Vercel      │     │     Render      │     │     Render      │
│   (Frontend)    │────▶│    (Backend)    │────▶│  (PostgreSQL)   │
│   Next.js       │     │    NestJS       │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │    X-Tenant header    │
        └───────────────────────┘
```

### URLs de Produção

| Serviço | URL |
|---------|-----|
| Frontend | https://brewjaria.vercel.app |
| Backend | https://brewjaria-api.onrender.com |
| Health Check | https://brewjaria-api.onrender.com/health |

---

## 2. Deploy Backend (Render)

### 2.1 Configuração do Serviço

| Campo | Valor |
|-------|-------|
| **Name** | brewjaria-api |
| **Environment** | Node |
| **Region** | Oregon (US West) |
| **Branch** | main |
| **Root Directory** | apps/api |
| **Build Command** | `pnpm install && pnpm build` |
| **Start Command** | `pnpm start:prod` |

### 2.2 Variáveis de Ambiente (Render)

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:5432/brewjaria
JWT_SECRET=<gerar: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<gerar outro>
JWT_REFRESH_EXPIRES_IN=30d
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
WEB_URL=https://brewjaria.vercel.app
# DEFAULT_TENANT_SLUG=  ← NÃO DEFINIR EM PRODUÇÃO!
```

### 2.3 Prisma Migrate (Produção)

```bash
# No Render, adicionar ao Build Command:
pnpm install && npx prisma migrate deploy && pnpm build
```

Ou executar manualmente via Render Shell:
```bash
cd apps/api
npx prisma migrate deploy
```

### 2.4 Health Check

**Arquivo**: `apps/api/src/health/health.controller.ts`

```typescript
@Controller('health')
export class HealthController {
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
}
```

**Teste**:
```bash
curl https://brewjaria-api.onrender.com/health
```

**Resposta esperada**:
```json
{
  "status": "ok",
  "timestamp": "2025-12-22T12:00:00.000Z",
  "version": "1.0.0",
  "commit": "abc123",
  "environment": "production"
}
```

---

## 3. Deploy Frontend (Vercel)

### 3.1 Configuração do Projeto

| Campo | Valor |
|-------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | apps/web |
| **Build Command** | `pnpm build` |
| **Output Directory** | .next |
| **Install Command** | `pnpm install` |

### 3.2 Variáveis de Ambiente (Vercel)

```env
NEXT_PUBLIC_API_URL=https://brewjaria-api.onrender.com
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_xxx
```

### 3.3 Domínio Customizado

1. Acessar Vercel → Settings → Domains
2. Adicionar: `brewjaria.com.br`
3. Configurar DNS:
   ```
   Tipo: A
   Nome: @
   Valor: 76.76.21.21

   Tipo: CNAME
   Nome: www
   Valor: cname.vercel-dns.com
   ```

---

## 4. Configuração Multi-Tenant

### 4.1 CORS (Backend)

**Arquivo**: `apps/api/src/main.ts` (linhas 26-39)

```typescript
app.enableCors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://brewjaria.vercel.app',
      'https://brewjaria.com.br',
      'https://www.brewjaria.com.br',
      // Adicionar domínios de outros tenants
    ];
    // ...
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Tenant'],
});
```

### 4.2 Rotas Excluídas do TenantMiddleware

**Arquivo**: `apps/api/src/tenant/tenant.module.ts` (linhas 14-18)

```typescript
consumer
  .apply(TenantMiddleware)
  .exclude(
    { path: 'health', method: RequestMethod.ALL },
    { path: 'stripe/webhook', method: RequestMethod.POST },
  )
  .forRoutes('*');
```

### 4.3 Mapeamento de Domínios

**Arquivo**: `apps/api/src/tenant/tenant.middleware.ts` (linhas 20-37)

```typescript
const DOMAIN_TO_TENANT: Record<string, string> = {
  'brewjaria.com.br': 'brewjaria',
  'www.brewjaria.com.br': 'brewjaria',
  'brewjaria-web.vercel.app': 'brewjaria',
  'wineclub.com.br': 'wine-club',
  'coffee-club.com.br': 'coffee-club',
  'pet-box.com.br': 'pet-box',
};
```

**Para adicionar novo domínio**:
1. Editar `DOMAIN_TO_TENANT` no middleware
2. Adicionar ao CORS em `main.ts`
3. Fazer deploy

---

## 5. Stripe Webhook

### 5.1 Configurar no Stripe Dashboard

1. Acessar https://dashboard.stripe.com/webhooks
2. Adicionar endpoint:
   - URL: `https://brewjaria-api.onrender.com/stripe/webhook`
   - Eventos:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.deleted`
     - `customer.subscription.updated`
3. Copiar Signing Secret (whsec_xxx)
4. Adicionar ao Render como `STRIPE_WEBHOOK_SECRET`

### 5.2 Testar Webhook Local

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3001/stripe/webhook

# Em outro terminal, disparar evento
stripe trigger checkout.session.completed
```

---

## 6. Checklist de Deploy

### Pré-Deploy

- [ ] Código commitado e pushed
- [ ] Migrations testadas localmente
- [ ] Variáveis de ambiente configuradas
- [ ] Stripe webhook configurado

### Backend (Render)

- [ ] Build passando
- [ ] Migrations executadas
- [ ] Health check respondendo
- [ ] Logs sem erros

### Frontend (Vercel)

- [ ] Build passando
- [ ] Variáveis de ambiente corretas
- [ ] Site acessível
- [ ] API conectando

### Pós-Deploy

- [ ] Testar registro de usuário
- [ ] Testar login
- [ ] Testar checkout Stripe
- [ ] Verificar webhook recebendo eventos

---

## 7. Comandos Úteis

### Build Local

```bash
# Backend
cd apps/api
pnpm build
pnpm start:prod

# Frontend
cd apps/web
pnpm build
pnpm start
```

### Logs (Render)

```bash
# Via Dashboard
Render → brewjaria-api → Logs

# Via CLI (se configurado)
render logs brewjaria-api
```

### Rollback

```bash
# Vercel
vercel rollback

# Render
# Via Dashboard → Deploys → Selecionar deploy anterior → Rollback
```

---

## 8. Troubleshooting

### Erro 502 Bad Gateway

**Causa**: Backend não iniciou ou crashou.

**Verificar**:
1. Logs no Render
2. Health check: `curl https://brewjaria-api.onrender.com/health`
3. Variáveis de ambiente

### Erro CORS

**Causa**: Domínio não está na lista de origens permitidas.

**Solução**:
1. Adicionar domínio em `main.ts`
2. Fazer deploy

### Webhook não recebe eventos

**Causa**: URL incorreta ou secret errado.

**Verificar**:
1. URL no Stripe Dashboard
2. `STRIPE_WEBHOOK_SECRET` no Render
3. Rota `/stripe/webhook` não está no TenantMiddleware

### Erro "Invalid tenant"

**Causa**: Header X-Tenant não enviado ou tenant não existe no banco.

**Verificar**:
```bash
# Testar com header
curl -H "X-Tenant: brewjaria" https://brewjaria-api.onrender.com/health

# Verificar tenant no banco
psql -c "SELECT slug FROM \"Tenant\";"
```

### Build falha no Render

**Causa comum**: Dependências ou Prisma.

**Solução**:
```bash
# Build command completo
pnpm install && npx prisma generate && npx prisma migrate deploy && pnpm build
```

---

## 9. Monitoramento

### Health Check Automático

Configurar no Render:
- Health Check Path: `/health`
- Health Check Timeout: 30s

### Alertas Recomendados

| Métrica | Alerta |
|---------|--------|
| Health check falha | Imediato |
| Latência > 2s | Warning |
| Erros 5xx > 10/min | Critical |
| CPU > 80% | Warning |

---

## 10. Arquivos Relevantes

| Arquivo | Propósito |
|---------|-----------|
| `apps/api/src/main.ts` | Bootstrap, CORS |
| `apps/api/src/tenant/tenant.middleware.ts` | Resolução de tenant |
| `apps/api/src/tenant/tenant.module.ts` | Rotas excluídas |
| `apps/api/src/health/health.controller.ts` | Health check |
| `apps/api/src/stripe/stripe.controller.ts` | Webhook |
| `apps/web/next.config.js` | Config Next.js |

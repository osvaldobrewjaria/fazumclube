# 🚀 GO LIVE FINAL - Multi-Tenancy BrewJaria

> Documento gerado em: 20/12/2024
> Status: **PRONTO PARA TESTES**

---

## ✅ FASE 0 — Banco de Dados (CONCLUÍDA)

### Migração Executada

```
🚀 Iniciando migração de tenants...

🔄 Migrando tenant "brew" → "brewjaria"...
✅ Tenant renomeado: brew → brewjaria
   ID mantido: cmifblb7d0000cs8aoop7bb29
   Todos os usuários e assinaturas permanecem vinculados.

📦 Criando tenants faltantes...

   ⏭️  brewjaria - já existe
   ✅ template-light - criado
   ✅ wine-club - criado
   ✅ coffee-club - criado
   ✅ pet-box - criado

🎉 Migração concluída!
```

### Tenants no Banco

| Slug | Nome | Status |
|------|------|--------|
| `brewjaria` | Brewjaria | ✅ Produção |
| `template-light` | Template Light | ✅ Demo |
| `wine-club` | Wine Club | ✅ Demo |
| `coffee-club` | Coffee Club | ✅ Demo |
| `pet-box` | Pet Box | ✅ Demo |

### Planos Brewjaria

| Plano | Mensal | Anual |
|-------|--------|-------|
| `clube-brewjaria` | R$ 115,00 | R$ 1.179,00 |

### Arquivos Corrigidos

- `apps/api/prisma/seed.ts` - Slug corrigido para `brewjaria`
- `apps/api/src/tenant/tenant.middleware.ts` - Mapeamento de domínios atualizado

---

## 🔧 FASE 4 — Variáveis de Ambiente

### Checklist por Ambiente

#### Local (Development)

```env
NODE_ENV=development
DEFAULT_TENANT_SLUG=brewjaria
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
WEB_URL=http://localhost:3000
```

#### Staging

```env
NODE_ENV=staging
DEFAULT_TENANT_SLUG=brewjaria
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
WEB_URL=https://staging.brewjaria.com.br
GIT_COMMIT=${RAILWAY_GIT_COMMIT_SHA}
```

#### Production ⚠️

```env
NODE_ENV=production
# DEFAULT_TENANT_SLUG=  ← NÃO DEFINIR EM PRODUÇÃO!
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
WEB_URL=https://brewjaria.com.br
GIT_COMMIT=${RAILWAY_GIT_COMMIT_SHA}
```

### ⚠️ Regras Críticas

| Variável | Dev | Staging | Prod |
|----------|-----|---------|------|
| `NODE_ENV` | development | staging | **production** |
| `DEFAULT_TENANT_SLUG` | brewjaria | brewjaria | **NÃO DEFINIR** |
| `GIT_COMMIT` | opcional | sim | **sim** |
| `STRIPE_SECRET_KEY` | sk_test_* | sk_test_* | **sk_live_*** |

### Alertas de Risco

1. **DEFAULT_TENANT_SLUG em produção**: Se definido, requests sem X-Tenant vão para o tenant padrão silenciosamente. **REMOVA em produção!**

2. **STRIPE_SECRET_KEY**: Nunca use chave de teste em produção.

3. **GIT_COMMIT**: Necessário para rastreabilidade no /health.

---

## 🧪 FASE 5 — Testes Manuais

### 5.1 Backend - Health Check

```bash
# Teste: Health sem X-Tenant (deve funcionar)
curl http://localhost:3001/health

# Esperado:
{
  "status": "ok",
  "timestamp": "2024-12-20T...",
  "version": "0.1.0",
  "commit": "...",
  "environment": "development"
}
```

### 5.2 Backend - Register com Tenant Válido

```bash
# Teste: Register com brewjaria
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Tenant: brewjaria" \
  -d '{
    "name": "Teste Brewjaria",
    "email": "teste-brew@example.com",
    "password": "123456"
  }'

# Esperado: 201 Created
{
  "user": { "id": "...", "email": "teste-brew@example.com" },
  "accessToken": "...",
  "refreshToken": "..."
}
```

### 5.3 Backend - Register com Outro Tenant

```bash
# Teste: Register com wine-club
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Tenant: wine-club" \
  -d '{
    "name": "Teste Wine",
    "email": "teste-wine@example.com",
    "password": "123456"
  }'

# Esperado: 201 Created (usuário no tenant wine-club)
```

### 5.4 Backend - Register SEM Tenant

```bash
# Teste: Register sem X-Tenant (deve falhar em produção)
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Sem Tenant",
    "email": "notenant@example.com",
    "password": "123456"
  }'

# Esperado (sem DEFAULT_TENANT_SLUG): 400 Bad Request
{
  "statusCode": 400,
  "message": "Invalid tenant. Please provide X-Tenant header or use a valid domain."
}

# Esperado (com DEFAULT_TENANT_SLUG): 201 Created (vai para tenant padrão)
```

### 5.5 Backend - Register com Tenant Inválido

```bash
# Teste: Register com tenant inexistente
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Tenant: tenant-fake" \
  -d '{
    "name": "Teste Fake",
    "email": "fake@example.com",
    "password": "123456"
  }'

# Esperado: 400 Bad Request
{
  "statusCode": 400,
  "message": "Invalid tenant: tenant-fake"
}
```

### 5.6 Validação no Banco

```sql
-- Verificar usuários criados por tenant
SELECT 
  u.email,
  u."tenantId",
  t.slug as tenant_slug,
  u."createdAt"
FROM "User" u
JOIN "Tenant" t ON u."tenantId" = t.id
ORDER BY u."createdAt" DESC
LIMIT 10;
```

### 5.7 Stripe - Checkout Session

```bash
# 1. Fazer login para obter token
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant: brewjaria" \
  -d '{"email": "teste-brew@example.com", "password": "123456"}' \
  | jq -r '.accessToken')

# 2. Criar checkout session
curl -X POST http://localhost:3001/subscriptions/checkout-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant: brewjaria" \
  -d '{
    "planSlug": "clube-brewjaria",
    "billingInterval": "MONTHLY"
  }'

# Esperado: 201 Created
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### 5.8 Verificar Metadata no Stripe

1. Acesse: https://dashboard.stripe.com/test/checkout/sessions
2. Encontre a sessão criada
3. Verifique metadata:
   - `subscriptionId`: ID da assinatura
   - `tenantId`: ID do tenant
   - `tenantSlug`: brewjaria

---

## 📊 FASE 6 — Monitoramento Pós-Deploy

### 6.1 O que Monitorar nos Logs

```
# Erros críticos a observar:
"Invalid tenant"           → Request sem tenant válido
"Invalid tenant: xxx"      → Tenant não existe no banco
"Tenant context required"  → Middleware não rodou
"STRIPE_WEBHOOK"           → Falha em webhook
```

### 6.2 Queries de Monitoramento

```sql
-- Cadastros por tenant (últimas 24h)
SELECT 
  t.slug as tenant,
  COUNT(*) as novos_usuarios
FROM "User" u
JOIN "Tenant" t ON u."tenantId" = t.id
WHERE u."createdAt" > NOW() - INTERVAL '24 hours'
GROUP BY t.slug
ORDER BY novos_usuarios DESC;

-- Assinaturas por tenant e status
SELECT 
  t.slug as tenant,
  s.status,
  COUNT(*) as total
FROM "Subscription" s
JOIN "Tenant" t ON s."tenantId" = t.id
GROUP BY t.slug, s.status
ORDER BY t.slug, s.status;

-- Erros de tenant (se logado)
-- Verificar logs do Railway/Vercel
```

### 6.3 Checklist Primeiras 24h

- [ ] Health check retorna versão correta
- [ ] Nenhum erro "Invalid tenant" nos logs
- [ ] Cadastros estão indo para tenant correto
- [ ] Login funciona para usuários existentes
- [ ] Admin dashboard carrega dados
- [ ] Checkout Stripe funciona
- [ ] Webhook Stripe processa eventos

### 6.4 Alertas Críticos

| Alerta | Ação |
|--------|------|
| Muitos 400 em /auth/register | Verificar se frontend está enviando X-Tenant |
| Webhook Stripe falhando | Verificar STRIPE_WEBHOOK_SECRET |
| Usuários sem tenantId | Bug crítico - rollback |
| Health sem commit | Configurar GIT_COMMIT |

---

## 🟢 CONCLUSÃO FINAL

### O sistema está pronto para Go Live?

**SIM** ✅

### Checklist Final

- [x] FASE 0: Banco de dados migrado (brew → brewjaria)
- [x] FASE 1: Backend com TenantMiddleware
- [x] FASE 2: Frontend com interceptor X-Tenant
- [x] FASE 3: Stripe com metadata de tenant
- [x] FASE 4: Documentação de env vars criada
- [x] FASE 5: Testes manuais executados ✅
- [ ] FASE 6: Monitorar após deploy

### Resultados dos Testes (20/12/2024)

| Teste | Resultado |
|-------|-----------|
| Health sem X-Tenant | ✅ 200 OK |
| Register com brewjaria | ✅ 201 Created |
| Register com wine-club | ✅ 201 Created |
| Register sem tenant | ✅ 400 Bad Request |
| Register tenant inválido | ✅ 400 Bad Request |
| Isolamento no banco | ✅ Usuários em tenants corretos |

### Riscos Residuais

1. **Baixo**: Tenants demo (wine-club, coffee-club, pet-box) não têm planos configurados
   - Mitigação: Criar planos quando necessário

2. **Baixo**: SSR no Next.js pode não ter tenant em algumas rotas
   - Mitigação: Testar fluxos críticos

3. **Médio**: DEFAULT_TENANT_SLUG pode mascarar erros em dev
   - Mitigação: Remover em produção

### Comandos de Deploy

```bash
# 1. Commit das mudanças
git add -A
git commit -m "fix: migrate tenant slug brew → brewjaria"
git push origin main

# 2. Verificar deploy automático (Vercel/Railway)

# 3. Após deploy, testar:
curl https://api.brewjaria.com.br/health
```

---

*Documento gerado automaticamente para Go Live Multi-Tenancy*

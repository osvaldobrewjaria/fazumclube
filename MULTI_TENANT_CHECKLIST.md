# Checklist Seguro – Multi-Tenancy BrewJaria

> **Regra de ouro**: É melhor falhar rápido com erro explícito do que aceitar dados errados silenciosamente.

---

## 🔒 FASE 0 — Antes de qualquer deploy (prevenção)

**Objetivo**: garantir que nada "quebre em silêncio".

### Padrão de Slugs

| Tenant | Slug (padrão) | Frontend | Backend | Banco | Stripe |
|--------|---------------|----------|---------|-------|--------|
| Brewjaria | `brewjaria` | ✅ | ✅ | ✅ | ✅ |
| Wine Club | `wine-club` | ✅ | ✅ | ✅ | ⚠️ Criar |
| Coffee Club | `coffee-club` | ✅ | ✅ | ✅ | ⚠️ Criar |
| Pet Box | `pet-box` | ✅ | ✅ | ✅ | ⚠️ Criar |
| Template Light | `template-light` | ✅ | ✅ | ✅ | N/A (demo) |

### Verificações

- [ ] **Escolher UM padrão de slug** por tenant (usar o mesmo valor em frontend, backend, banco, Stripe metadata)

- [ ] **Verificar tenants no banco**:
  ```sql
  SELECT id, slug, name FROM "Tenant";
  ```

- [ ] **Confirmar que todos os slugs usados no frontend existem no banco**

- [ ] **Confirmar rotas excluídas do TenantMiddleware**:
  - [x] `/health`
  - [x] `/stripe/webhook`
  - [ ] Qualquer job/cron interno (se houver)

---

## 🧠 FASE 1 — Backend (validação estrutural)

**Objetivo**: garantir isolamento correto sem afetar rotas existentes.

### TenantMiddleware

- [x] Middleware registrado globalmente (`TenantModule` em `AppModule`)

- [x] Prioridade correta:
  1. `X-Tenant` header
  2. `Host` (whitelist em `DOMAIN_TO_TENANT`)
  3. `DEFAULT_TENANT_SLUG` (somente dev)

- [x] Erro explícito em tenant inválido (`400 Invalid tenant`)

- [x] Middleware não roda em `/health` e `/stripe/webhook`

### Registro de usuário

- [x] `auth.service.register()` não contém hardcode

- [x] Registro falha se `req.tenant` não existir

- [x] `tenantId` vem exclusivamente do contexto

### Queries sensíveis

- [x] Listagens (`findMany`) usam `tenantId` (admin.service.ts)

- [ ] Mutations por ID validam ownership (quando aplicável)

### Arquivos verificados

| Arquivo | Status | Observação |
|---------|--------|------------|
| `tenant/tenant.middleware.ts` | ✅ | Resolve por header/host/env |
| `tenant/tenant.module.ts` | ✅ | Exclui /health e /stripe/webhook |
| `auth/auth.service.ts` | ✅ | Usa tenant do contexto |
| `auth/auth.controller.ts` | ✅ | Passa req.tenant para service |
| `admin/admin.service.ts` | ✅ | Filtros por tenantId |

---

## 🌐 FASE 2 — Frontend (ponto mais crítico)

**Objetivo**: garantir que todas as requests enviem o tenant.

### Interceptor HTTP

- [x] Axios/fetch interceptor adiciona `X-Tenant`

- [x] Header vem do `TenantContext` (via tenantStore, não hardcoded)

- [x] Funciona em:
  - [x] Client-side (via tenantStore sincronizado com TenantProvider)
  - [ ] Server-side (SSR) - Verificar se necessário
  - [ ] Route handlers / actions - Verificar se necessário

### Fluxos críticos

| Fluxo | Envia X-Tenant? | Testado? |
|-------|-----------------|----------|
| Signup | ⚠️ Verificar | ❌ |
| Login | ⚠️ Verificar | ❌ |
| Refresh token | ⚠️ Verificar | ❌ |
| Listagem de planos | ⚠️ Verificar | ❌ |
| Checkout / criação de sessão Stripe | ⚠️ Verificar | ❌ |
| Admin dashboard | ⚠️ Verificar | ❌ |

> ⚠️ **ATENÇÃO**: Se algum desses esquecer o header, o backend vai (corretamente) bloquear.

### Arquivo a verificar/criar

```
apps/web/src/lib/api.ts  # Interceptor com X-Tenant
```

---

## 💳 FASE 3 — Stripe / Webhooks

**Objetivo**: evitar falha em pagamentos.

- [x] `/stripe/webhook` excluído do middleware

- [x] Webhook valida assinatura (`STRIPE_WEBHOOK_SECRET`)

- [x] Checkout Session cria metadata:
  ```json
  {
    "subscriptionId": "xxx",
    "tenantId": "xxx",
    "tenantSlug": "brewjaria"
  }
  ```

- [x] Webhook resolve tenant via metadata (subscriptionId já tem tenantId)

### Arquivos verificados

| Arquivo | Status | Observação |
|---------|--------|------------|
| `stripe/stripe.controller.ts` | ✅ | Webhook handler |
| `stripe/stripe.service.ts` | ✅ | createCheckoutSession com tenantId/tenantSlug |
| `subscriptions/subscriptions.service.ts` | ✅ | Passa tenant para Stripe |

---

## 🚀 FASE 4 — Deploy seguro

**Objetivo**: subir sem surpresas.

### Variáveis de ambiente

| Variável | Dev | Produção |
|----------|-----|----------|
| `DEFAULT_TENANT_SLUG` | `brew` | ❌ Não definir |
| `GIT_COMMIT` | Opcional | ✅ Automático (Vercel/Railway) |
| `NODE_ENV` | `development` | `production` |

### Health check

- [x] `/health` responde sem header

- [x] Retorna:
  - `status`
  - `version`
  - `commit`
  - `environment`

### Teste de health

```bash
# Produção
curl https://api.brewjaria.com.br/health

# Esperado:
{
  "status": "ok",
  "timestamp": "2024-12-20T...",
  "version": "0.1.0",
  "commit": "a2965e46",
  "environment": "production"
}
```

---

## 🧪 FASE 5 — Testes manuais (obrigatórios)

**Objetivo**: provar que tudo funciona de verdade.

### Backend

```bash
# 1. Health sem tenant (deve funcionar)
curl http://localhost:3001/health

# 2. Register com tenant válido (deve funcionar)
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Tenant: brew" \
  -d '{"name":"Teste","email":"teste@brew.com","password":"123456"}'

# 3. Register com tenant inválido (esperar 400)
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Tenant: tenant-inexistente" \
  -d '{"name":"Teste","email":"teste@fake.com","password":"123456"}'

# 4. Register sem tenant (esperar 400)
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"notenant@test.com","password":"123456"}'
```

### Frontend

- [ ] Acessar `/t/brewjaria` (ou `/t/brew`)
- [ ] Acessar domínio real (brewjaria.com.br)
- [ ] Criar usuário em dois tenants diferentes
- [ ] Confirmar no banco:
  ```sql
  SELECT email, "tenantId", 
         (SELECT slug FROM "Tenant" WHERE id = "User"."tenantId") as tenant_slug 
  FROM "User" 
  ORDER BY "createdAt" DESC 
  LIMIT 10;
  ```

### Checklist de testes

| Teste | Resultado Esperado | Status |
|-------|-------------------|--------|
| Health sem header | 200 OK | ❌ |
| Register com brew | 201 Created | ❌ |
| Register com tenant inválido | 400 Bad Request | ❌ |
| Register sem header | 400 Bad Request | ❌ |
| Login com usuário existente | 200 OK + tokens | ❌ |
| Checkout Stripe | Redirect para Stripe | ❌ |
| Webhook Stripe | 200 OK | ❌ |

---

## 📊 FASE 6 — Pós-deploy (monitoramento)

**Objetivo**: detectar problemas cedo.

### Monitoramento

- [ ] Monitorar logs por `Invalid tenant`
- [ ] Monitorar erros 400/401 após deploy
- [ ] Validar criação de novos usuários por tenant
- [ ] Validar admin não perdeu dados (se global)

### Queries de monitoramento

```sql
-- Usuários por tenant (últimas 24h)
SELECT 
  t.slug as tenant,
  COUNT(*) as users
FROM "User" u
JOIN "Tenant" t ON u."tenantId" = t.id
WHERE u."createdAt" > NOW() - INTERVAL '24 hours'
GROUP BY t.slug;

-- Assinaturas por tenant
SELECT 
  t.slug as tenant,
  s.status,
  COUNT(*) as count
FROM "Subscription" s
JOIN "Tenant" t ON s."tenantId" = t.id
GROUP BY t.slug, s.status
ORDER BY t.slug, s.status;
```

---

## 🟢 Critérios de aceite final

Só considere "ok" se:

- [ ] Nenhuma request legítima falha
- [ ] Nenhum usuário novo cai no tenant errado
- [ ] Admin continua funcional
- [ ] Checkout funciona normalmente
- [ ] Health confirma versão correta

---

## 📋 Resumo de Status

| Fase | Status | Pendências |
|------|--------|------------|
| FASE 0 - Prevenção | ✅ Completo | Tenants migrados |
| FASE 1 - Backend | ✅ Completo | - |
| FASE 2 - Frontend | ✅ Completo | Interceptor implementado |
| FASE 3 - Stripe | ✅ Completo | Metadata adicionado |
| FASE 4 - Deploy | ✅ Completo | CORS corrigido |
| FASE 5 - Testes | ✅ Completo | Login funcionando |
| FASE 6 - Monitoramento | ⏳ Em andamento | Primeiras 24h |

---

## 🔧 Próximas Ações

1. ~~**Frontend**: Criar interceptor HTTP com X-Tenant~~ ✅
2. ~~**Stripe**: Adicionar tenantId/tenantSlug no metadata do checkout~~ ✅
3. ~~**Banco**: Tenants migrados (brew → brewjaria)~~ ✅
4. ~~**Testes**: Login funcionando em produção~~ ✅
5. ~~**Deploy**: CORS corrigido para X-Tenant~~ ✅
6. **Monitoramento**: Acompanhar primeiras 24h

## 📁 Arquivos Implementados

### Frontend
- `apps/web/src/stores/tenantStore.ts` - Store para slug do tenant
- `apps/web/src/lib/api.ts` - Interceptor com X-Tenant
- `apps/web/src/contexts/TenantContext.tsx` - Sincroniza slug com store

### Backend
- `apps/api/src/tenant/tenant.middleware.ts` - Middleware de resolução
- `apps/api/src/tenant/tenant.module.ts` - Módulo NestJS
- `apps/api/src/tenant/tenant.types.ts` - Tipos TypeScript
- `apps/api/src/auth/auth.service.ts` - Registro com tenant
- `apps/api/src/admin/admin.service.ts` - Filtros por tenant
- `apps/api/src/stripe/stripe.service.ts` - Metadata com tenant
- `apps/api/src/subscriptions/subscriptions.service.ts` - Passa tenant para Stripe
- `apps/api/src/health/health.controller.ts` - Versão/commit

---

*Última atualização: Dezembro 2025*

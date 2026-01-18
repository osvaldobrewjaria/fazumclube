# Changelog — FAZUMCLUBE

> Registro de alterações significativas do projeto

---

## [2026-01-16] — Correção de Bugs P0

### Corrigido
- **BUG-001**: `/app/login` não exige mais tenant
  - Adicionado bypass no middleware para rotas `/auth/*`
  - Rotas de plataforma funcionam sem `X-Tenant`
  
- **BUG-002**: Sessão global entre tenants bloqueada
  - JWT agora inclui `tenantId` no payload
  - Criado `TenantGuard` para validar autorização
  - Admin controller protegido com `TenantGuard`
  - Usuário de tenant A não acessa admin de tenant B

### Arquivos modificados
- `apps/api/src/tenant/tenant.module.ts`
- `apps/api/src/auth/auth.service.ts`
- `apps/api/src/auth/strategies/jwt.strategy.ts`
- `apps/api/src/auth/guards/tenant.guard.ts` (novo)
- `apps/api/src/admin/admin.controller.ts`

---

## [2026-01-15] — Consolidação de Arquitetura

### Adicionado
- **Middleware `/admin`**: Redirect inteligente baseado em contexto do usuário
- **Endpoint `GET /tenants/my`**: Lista tenants do usuário logado com métricas
- **Dashboard conectado à API**: `/app/dashboard` exibe dados reais
- **Documentação oficial**:
  - `docs/FAZUMCLUBE-ARCHITECTURE.md` — Fonte de verdade
  - `docs/ROUTES.md` — Mapa completo de rotas
  - `docs/TESTING-CHECKLIST.md` — Testes manuais reproduzíveis
  - `docs/STATUS.md` — Estado atual vs backlog

### Alterado
- **Fallback do `/admin`**: Agora vai para `/app/dashboard` (nunca para tenant específico)
- **AuthStore**: Corrigido uso de `setAuth` em vez de `setToken`/`setUser` separados
- **next.config.js**: Removido redirect hardcoded de `/admin` para Brewjaria

### Removido
- Referências a Brewjaria como "produto" ou "default tenant"
- Redirect `/admin` → `/t/brewjaria/admin` (substituído por lógica inteligente)

### Regras estabelecidas
- Nenhum tenant é especial
- `/admin` nunca redireciona para tenant específico em fallback
- Brewjaria é apenas um tenant piloto

---

## [2026-01-14] — Implementação Conta SaaS

### Adicionado
- `/app/login` — Login do dono do clube
- `/app/signup` — Criar conta + tenant em 2 etapas
- `/app/dashboard` — HUB da conta SaaS
- Endpoint `POST /tenants/provision` — Cria tenant + owner atomicamente
- Proteção de rotas `/app/*`

### Alterado
- Fluxo de signup agora cria User e Tenant em uma operação

---

## [2026-01] — Refatoração ClubSaaS

### Adicionado
- Modelo `Tenant` com campos: `ownerId`, `status`, `businessType`, `stripeAccountId`
- Relação `User.ownedTenant` para identificar owner
- Índices otimizados no Prisma

### Alterado
- Projeto renomeado de "brewjaria-saas" para "clubsaas"
- Payment e Delivery agora têm `tenantId` obrigatório
- Email service usa config por tenant (fallback: "ClubSaaS")
- Stripe service usa URLs dinâmicas `/t/${tenantSlug}/...`

### Regras estabelecidas
- Nada hardcoded por tenant no código
- Sempre usar fallbacks genéricos da plataforma
- Testar com 2+ tenants antes de deploy

---

## [2025-12] — Multi-Tenant Go Live

### Adicionado
- Estrutura multi-tenant completa
- Rotas `/t/[slug]/*` para cada tenant
- Sistema de temas por tenant
- Middleware `X-Tenant` no backend
- Script `pnpm tenant:new` para criar tenants

### Alterado
- Todas as queries filtram por `tenantId`
- Frontend envia header `X-Tenant` em todas requisições

---

## [2025-11] — MVP Inicial

### Adicionado
- Landing page Brewjaria
- Fluxo de assinatura com Stripe
- Painel admin básico
- Área do assinante

---

## Convenções

- **Adicionado**: Novas funcionalidades
- **Alterado**: Mudanças em funcionalidades existentes
- **Removido**: Funcionalidades removidas
- **Corrigido**: Correções de bugs
- **Segurança**: Correções de segurança

---

*Changelog do FAZUMCLUBE*

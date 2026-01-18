# Mapa de Rotas — FAZUMCLUBE

> **Fonte de verdade:** Este documento define todas as rotas do sistema.  
> **Última atualização:** 15 Janeiro 2026

---

## Legenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Implementado e funcional |
| 🔄 | Em transição / legado |
| ⏳ | Planejado / não implementado |
| 🔒 | Requer autenticação |
| 🌐 | Público |

---

## 1. MARKETING — FAZUMCLUBE (Plataforma)

| Rota | Status | Acesso | Descrição |
|------|--------|--------|-----------|
| `/` | ✅ | 🌐 | Landing page institucional FAZUMCLUBE |

**Objetivo:** Apresentar a plataforma e converter visitantes em donos de clube.

---

## 2. CONTA SAAS — Dono do Clube (`/app/*`)

| Rota | Status | Acesso | Descrição |
|------|--------|--------|-----------|
| `/app/login` | ✅ | 🌐 | Login do dono do clube |
| `/app/signup` | ✅ | 🌐 | Criar conta + criar primeiro tenant |
| `/app/dashboard` | ✅ | 🔒 | HUB da conta (lista clubes, status Stripe) |
| `/app/settings` | ⏳ | 🔒 | Configurações da conta SaaS |

### Regras importantes:
- `/app/*` **NÃO** é painel operacional
- `/app/*` **NÃO** gerencia assinantes, entregas ou planos do clube
- `/app/dashboard` serve apenas como HUB para acessar os tenants

---

## 3. TENANT — Cada Clube (`/t/[slug]/*`)

### 3.1 Área Pública do Tenant

| Rota | Status | Acesso | Descrição |
|------|--------|--------|-----------|
| `/t/[slug]` | ✅ | 🌐 | Landing page do clube |
| `/t/[slug]/privacidade` | ✅ | 🌐 | Política de privacidade |
| `/t/[slug]/termos` | ✅ | 🌐 | Termos de uso |

### 3.2 Área do Assinante (Cliente do Clube)

| Rota | Status | Acesso | Descrição |
|------|--------|--------|-----------|
| `/t/[slug]/login` | ✅ | 🌐 | Login do assinante |
| `/t/[slug]/assinatura` | ⏳ | 🌐 | Checkout de assinatura |
| `/t/[slug]/minha-conta` | ✅ | 🔒 | Área do assinante |
| `/t/[slug]/minha-assinatura` | ✅ | 🔒 | Detalhes da assinatura |

### 3.3 Admin do Clube (Dono/Operador)

| Rota | Status | Acesso | Descrição |
|------|--------|--------|-----------|
| `/t/[slug]/admin` | ✅ | 🔒 | Dashboard admin do clube |
| `/t/[slug]/admin/assinantes` | ✅ | 🔒 | Lista de assinantes |
| `/t/[slug]/admin/assinantes/[id]` | ✅ | 🔒 | Detalhes do assinante |
| `/t/[slug]/admin/planos` | ✅ | 🔒 | Gerenciar planos |
| `/t/[slug]/admin/entregas` | ✅ | 🔒 | Gerenciar entregas |
| `/t/[slug]/admin/pagamentos` | ✅ | 🔒 | Histórico de pagamentos |
| `/t/[slug]/admin/configuracoes` | ⏳ | 🔒 | Configurações do clube |

### Exemplos de URLs:
```
/t/brewjaria
/t/brewjaria/admin
/t/demo/admin
```

---

## 4. ROTAS LEGADAS (Transição)

| Rota | Status | Comportamento | Destino |
|------|--------|---------------|---------|
| `/admin` | 🔄 | Redirect inteligente | Ver regras abaixo |
| `/admin/*` | 🔄 | Redirect inteligente | Ver regras abaixo |
| `/onboarding` | 🔄 | Temporário | Futuro: `/t/[slug]/assinatura` |
| `/login` | 🔄 | Redirect | `/t/[tenant]/login` |
| `/minha-conta` | 🔄 | Redirect | `/t/[tenant]/minha-conta` |

### Regras de redirect do `/admin`:

| Contexto | Destino |
|----------|---------|
| Usuário não logado | `/app/login` |
| Usuário com 1 tenant | `/t/[slug]/admin` |
| Usuário com múltiplos tenants | `/app/dashboard` |
| Usuário sem tenants | `/app/dashboard` |
| Fallback (erro/sem contexto) | `/app/dashboard` |

**IMPORTANTE:** 
- Nunca redireciona para um tenant específico como fallback
- Nenhum tenant é "default" (nem Brewjaria)
- Requests sem JavaScript (curl/crawlers) vão para `/app/dashboard`

---

## 5. API Backend (`:3001`)

### 5.1 Autenticação

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `POST /auth/login` | 🌐 | Login (retorna tokens) |
| `POST /auth/register` | 🌐 | Registro de usuário |
| `POST /auth/refresh` | 🌐 | Renovar access token |

### 5.2 Tenants

| Endpoint | Método | Acesso | Descrição |
|----------|--------|--------|-----------|
| `POST /tenants/provision` | 🌐 | Criar tenant + owner |
| `GET /tenants/my` | 🔒 | Listar tenants do usuário logado |
| `GET /tenants/check-slug/:slug` | 🌐 | Verificar disponibilidade de slug |

### 5.3 Admin do Tenant

| Endpoint | Acesso | Descrição |
|----------|--------|-----------|
| `GET /admin/stats` | 🔒 | Estatísticas do tenant |
| `GET /admin/users` | 🔒 | Listar usuários/assinantes |
| `GET /admin/subscriptions` | 🔒 | Listar assinaturas |
| `GET /admin/deliveries` | 🔒 | Listar entregas |

---

## 6. Header `X-Tenant`

Todas as requisições à API devem incluir o header `X-Tenant` com o slug do tenant:

```
X-Tenant: brewjaria
X-Tenant: demo
```

O middleware valida o tenant no banco antes de processar a requisição.

---

## 7. Diagrama de Fluxo

```
┌─────────────────────────────────────────────────────────────┐
│                        VISITANTE                             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    / (Landing FAZUMCLUBE)                    │
│                                                              │
│  "Criar meu clube" ──────────────────────────────────────►  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     /app/signup                              │
│                                                              │
│  1. Criar conta (User)                                       │
│  2. Criar tenant (nome + slug)                               │
│  3. Associar User ↔ Tenant como OWNER                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  /t/[slug]/admin                             │
│                                                              │
│  Admin COMPLETO do clube:                                    │
│  - Assinantes                                                │
│  - Planos                                                    │
│  - Entregas                                                  │
│  - Pagamentos                                                │
└─────────────────────────────────────────────────────────────┘
```

---

*Documento oficial de rotas do FAZUMCLUBE*

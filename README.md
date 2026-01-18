# FAZUMCLUBE

Plataforma SaaS multi-tenant para clubes de assinatura. Cada cliente (tenant) opera seu próprio clube com identidade visual, planos, assinantes e operação independentes.

> **Nota:** FAZUMCLUBE é o nome da plataforma. Tenants como "Brewjaria" são apenas clientes/exemplos.

## Quick Start

```bash
# Instalar dependências
pnpm install

# Iniciar desenvolvimento
pnpm dev

# URLs
# Frontend: http://localhost:3000
# Backend:  http://localhost:3001
```

## Arquitetura

- **Multi-tenancy**: Isolamento completo por tenant
- **Self-service**: Donos criam e gerenciam clubes via `/app/dashboard`
- **White-label**: Personalização completa de marca, cores e conteúdo

## Stack

| Camada | Tecnologia |
|--------|------------|
| **Monorepo** | pnpm workspaces |
| **Frontend** | Next.js 14 (App Router) + React + TypeScript + Tailwind CSS |
| **Backend** | NestJS + Prisma ORM + PostgreSQL |
| **Payments** | Stripe Connect (cada tenant com sua conta) |
| **Auth** | JWT (access + refresh tokens) |

## Estrutura de Rotas

| Área | Rota | Descrição |
|------|------|-----------|
| **Marketing** | `/` | Landing FAZUMCLUBE |
| **Conta SaaS** | `/app/login` | Login do dono do clube |
| **Conta SaaS** | `/app/signup` | Criar conta + tenant |
| **Conta SaaS** | `/app/dashboard` | HUB (lista clubes) |
| **Tenant** | `/t/[slug]` | Landing do clube |
| **Tenant** | `/t/[slug]/admin` | Admin do clube |

> Ver documentação completa em `docs/ROUTES.md`

## Documentação Oficial

| Documento | Descrição |
|-----------|-----------|
| [docs/FAZUMCLUBE-ARCHITECTURE.md](./docs/FAZUMCLUBE-ARCHITECTURE.md) | **Fonte de verdade** — Arquitetura e regras |
| [docs/ROUTES.md](./docs/ROUTES.md) | Mapa completo de rotas |
| [docs/TESTING-CHECKLIST.md](./docs/TESTING-CHECKLIST.md) | Testes manuais reproduzíveis |
| [docs/STATUS.md](./docs/STATUS.md) | Estado atual vs backlog |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | Histórico de alterações |

## Regras do Projeto

1. **Nenhum tenant é especial** — Brewjaria é apenas um tenant piloto
2. **Admin sempre em `/t/[slug]/admin`** — Nunca em `/admin` raiz
3. **`/app/*` é conta, não operação** — Dashboard é HUB, não admin
4. **Fallbacks neutros** — Nunca redirecionar para tenant específico

## Environment Variables

### Backend (`apps/api/.env`)

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/fazumclube
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
STRIPE_SECRET_KEY=sk_test_...
FRONTEND_URL=http://localhost:3000
```

### Frontend (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
```

## Status Atual

### ✅ Funcional
- Marketing site FAZUMCLUBE
- Login/Signup do dono do clube
- Dashboard com lista de tenants
- Admin completo do tenant (`/t/[slug]/admin`)
- Área do assinante
- API com autenticação JWT

### ⏳ Backlog
- Stripe Connect onboarding
- Checkout de assinatura por tenant
- Emails transacionais
- Configurações do clube

> Ver detalhes em `docs/STATUS.md`

---

*FAZUMCLUBE — Plataforma SaaS para Clubes de Assinatura*

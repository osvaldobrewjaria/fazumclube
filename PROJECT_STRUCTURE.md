# Brewjaria SaaS - Estrutura do Projeto

## 📁 Árvore de Diretórios

```
brewjaria-saas/
│
├── 📄 README.md                          # Documentação principal
├── 📄 SETUP.md                           # Guia de instalação e setup
├── 📄 PROJECT_STRUCTURE.md               # Este arquivo
├── 📄 package.json                       # Root package (scripts monorepo)
├── 📄 pnpm-workspace.yaml                # Configuração do monorepo
├── 📄 tsconfig.json                      # TypeScript config raiz
│
├── 📂 apps/
│   │
│   ├── 📂 api/                           # Backend NestJS
│   │   ├── 📄 package.json               # Dependências backend
│   │   ├── 📄 tsconfig.json              # TypeScript config
│   │   ├── 📄 .env.example               # Variáveis de ambiente
│   │   ├── 📄 nest-cli.json              # Configuração NestJS
│   │   │
│   │   ├── 📂 src/
│   │   │   ├── 📄 main.ts                # Entry point (bootstrap)
│   │   │   ├── 📄 app.module.ts          # Root module
│   │   │   │
│   │   │   ├── 📂 auth/                  # Autenticação & JWT
│   │   │   │   ├── 📄 auth.module.ts
│   │   │   │   ├── 📄 auth.service.ts    # Lógica: register, login, refresh
│   │   │   │   ├── 📄 auth.controller.ts # Endpoints: /auth/*
│   │   │   │   ├── 📂 dto/
│   │   │   │   │   ├── 📄 register.dto.ts
│   │   │   │   │   └── 📄 login.dto.ts
│   │   │   │   ├── 📂 strategies/
│   │   │   │   │   └── 📄 jwt.strategy.ts
│   │   │   │   └── 📂 guards/
│   │   │   │       └── 📄 jwt-auth.guard.ts
│   │   │   │
│   │   │   ├── 📂 users/                 # Gerenciamento de usuários
│   │   │   │   ├── 📄 users.module.ts
│   │   │   │   ├── 📄 users.service.ts   # Lógica: getProfile, updateProfile
│   │   │   │   ├── 📄 users.controller.ts # Endpoints: /users/*
│   │   │   │   └── 📂 dto/
│   │   │   │       └── 📄 update-profile.dto.ts
│   │   │   │
│   │   │   ├── 📂 subscriptions/         # Lógica de assinaturas
│   │   │   │   ├── 📄 subscriptions.module.ts
│   │   │   │   ├── 📄 subscriptions.service.ts # Checkout, webhook handling
│   │   │   │   ├── 📄 subscriptions.controller.ts # Endpoints: /subscriptions/*
│   │   │   │   └── 📂 dto/
│   │   │   │       └── 📄 create-checkout-session.dto.ts
│   │   │   │
│   │   │   ├── 📂 stripe/                # Integração Stripe
│   │   │   │   ├── 📄 stripe.module.ts
│   │   │   │   ├── 📄 stripe.service.ts  # SDK Stripe, customer creation
│   │   │   │   └── 📄 stripe.controller.ts # Webhook endpoint
│   │   │   │
│   │   │   ├── 📂 prisma/                # ORM Prisma
│   │   │   │   ├── 📄 prisma.module.ts
│   │   │   │   └── 📄 prisma.service.ts  # PrismaClient wrapper
│   │   │   │
│   │   │   └── 📂 health/                # Health check
│   │   │       ├── 📄 health.module.ts
│   │   │       └── 📄 health.controller.ts
│   │   │
│   │   ├── 📂 prisma/
│   │   │   ├── 📄 schema.prisma          # Data models & enums
│   │   │   ├── 📂 migrations/            # Database migrations
│   │   │   └── 📄 seed.ts                # (Opcional) Seed data
│   │   │
│   │   └── 📂 dist/                      # Build output (gerado)
│   │
│   └── 📂 web/                           # Frontend Next.js
│       ├── 📄 package.json               # Dependências frontend
│       ├── 📄 tsconfig.json              # TypeScript config
│       ├── 📄 next.config.js             # Configuração Next.js
│       ├── 📄 tailwind.config.js         # Tailwind CSS config
│       ├── 📄 postcss.config.js          # PostCSS config
│       ├── 📄 .env.example               # Variáveis de ambiente
│       │
│       ├── 📂 src/
│       │   ├── 📂 app/                   # App Router (Next.js 13+)
│       │   │   ├── 📄 layout.tsx         # Root layout
│       │   │   ├── 📄 page.tsx           # Home page (landing + flow)
│       │   │   └── 📂 confirmacao/
│       │   │       └── 📄 page.tsx       # Confirmation page
│       │   │
│       │   ├── 📂 components/            # React components
│       │   │   ├── 📄 Hero.tsx           # Landing hero section
│       │   │   ├── 📄 SubscriptionFlow.tsx # Multi-step form
│       │   │   └── 📂 steps/
│       │   │       ├── 📄 AccountStep.tsx # Step 1: Create account
│       │   │       ├── 📄 AddressStep.tsx # Step 2: Delivery address
│       │   │       └── 📄 PaymentStep.tsx # Step 3: Payment summary
│       │   │
│       │   ├── 📂 stores/                # Zustand state management
│       │   │   └── 📄 authStore.ts       # Auth state (user, tokens)
│       │   │
│       │   ├── 📂 lib/                   # Utilities & helpers
│       │   │   └── 📄 api.ts             # Axios API client
│       │   │
│       │   ├── 📂 providers/             # Context providers
│       │   │   └── 📄 AuthProvider.tsx   # Auth context wrapper
│       │   │
│       │   └── 📂 styles/
│       │       └── 📄 globals.css        # Global styles + Tailwind
│       │
│       └── 📂 public/                    # Static assets
│
└── 📂 packages/                          # Shared code (futuro)
    └── 📂 shared/                        # Shared types & utilities
        └── 📄 package.json
```

## 🔄 Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Landing Page (Hero + SubscriptionFlow)              │   │
│  │  ├─ Step 1: Account (Register)                       │   │
│  │  ├─ Step 2: Address                                  │   │
│  │  └─ Step 3: Payment (Stripe Checkout)                │   │
│  └──────────────────────────────────────────────────────┘   │
│           │                                                   │
│           │ API Calls (axios)                                │
│           ▼                                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Auth Store (Zustand)                                │   │
│  │  ├─ user                                             │   │
│  │  ├─ accessToken                                      │   │
│  │  └─ refreshToken                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTP/REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (NestJS)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Auth Controller                                     │   │
│  │  ├─ POST /auth/register                             │   │
│  │  ├─ POST /auth/login                                │   │
│  │  └─ POST /auth/refresh                              │   │
│  └──────────────────────────────────────────────────────┘   │
│           │                                                   │
│           ▼                                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Auth Service (JWT)                                  │   │
│  │  ├─ Hash password (bcrypt)                           │   │
│  │  ├─ Generate tokens                                  │   │
│  │  └─ Validate tokens                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│           │                                                   │
│           ▼                                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Subscriptions Controller                            │   │
│  │  ├─ POST /subscriptions/checkout-session            │   │
│  │  ├─ GET /subscriptions/me                            │   │
│  │  └─ DELETE /subscriptions/cancel                     │   │
│  └──────────────────────────────────────────────────────┘   │
│           │                                                   │
│           ▼                                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Stripe Service                                      │   │
│  │  ├─ Create customer                                  │   │
│  │  ├─ Create checkout session                          │   │
│  │  └─ Webhook verification                            │   │
│  └──────────────────────────────────────────────────────┘   │
│           │                                                   │
│           ▼                                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Prisma Service (ORM)                                │   │
│  │  └─ Database queries                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ SQL
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                         │
│  ├─ Tenants                                                 │
│  ├─ Users                                                   │
│  ├─ CustomerProfiles                                        │
│  ├─ Addresses                                               │
│  ├─ Plans                                                   │
│  ├─ PlanPrices                                              │
│  ├─ Subscriptions                                           │
│  ├─ Payments                                                │
│  ├─ RefreshTokens                                           │
│  └─ PasswordResetTokens                                     │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Modelos de Dados

### Tenant
```
├─ id (UUID)
├─ name (String)
├─ slug (String, unique)
└─ createdAt, updatedAt
```

### User
```
├─ id (UUID)
├─ tenantId (FK)
├─ email (String, unique)
├─ password (String, hashed)
├─ name (String)
└─ createdAt, updatedAt
```

### CustomerProfile
```
├─ id (UUID)
├─ userId (FK)
├─ phone (String)
├─ birthDate (DateTime)
├─ addressId (FK)
└─ createdAt, updatedAt
```

### Address
```
├─ id (UUID)
├─ street (String)
├─ number (String)
├─ complement (String, optional)
├─ district (String)
├─ city (String)
├─ state (String)
├─ zipCode (String)
└─ createdAt, updatedAt
```

### Plan
```
├─ id (UUID)
├─ tenantId (FK)
├─ name (String)
├─ description (String)
├─ slug (String)
├─ active (Boolean)
└─ createdAt, updatedAt
```

### PlanPrice
```
├─ id (UUID)
├─ planId (FK)
├─ interval (MONTHLY | YEARLY)
├─ amountCents (Int)
├─ currency (String)
├─ stripePriceId (String)
├─ active (Boolean)
└─ createdAt, updatedAt
```

### Subscription
```
├─ id (UUID)
├─ userId (FK)
├─ planId (FK)
├─ stripeSubscriptionId (String)
├─ status (PENDING | ACTIVE | PAST_DUE | CANCELED)
├─ currentPeriodStart (DateTime)
├─ currentPeriodEnd (DateTime)
├─ canceledAt (DateTime, optional)
└─ createdAt, updatedAt
```

### Payment
```
├─ id (UUID)
├─ subscriptionId (FK)
├─ stripePaymentIntentId (String)
├─ amountCents (Int)
├─ currency (String)
├─ status (PENDING | PAID | FAILED | REFUNDED)
└─ createdAt, updatedAt
```

## 🚀 Scripts Disponíveis

### Root (Monorepo)
```bash
pnpm install          # Instalar dependências
pnpm dev              # Iniciar dev (frontend + backend)
pnpm build            # Build de ambos
pnpm start            # Iniciar produção
```

### Backend
```bash
cd apps/api
pnpm dev              # Dev server
pnpm build            # Build
pnpm start            # Produção
pnpm prisma migrate   # Rodar migrations
pnpm prisma studio   # UI do banco
```

### Frontend
```bash
cd apps/web
pnpm dev              # Dev server
pnpm build            # Build
pnpm start            # Produção
```

## 📦 Dependências Principais

### Backend
- **@nestjs/core** - Framework
- **@nestjs/jwt** - JWT authentication
- **@nestjs/passport** - Passport integration
- **@prisma/client** - ORM
- **stripe** - Stripe SDK
- **bcrypt** - Password hashing
- **class-validator** - DTO validation

### Frontend
- **next** - React framework
- **react** - UI library
- **zustand** - State management
- **framer-motion** - Animations
- **axios** - HTTP client
- **tailwindcss** - Styling

## 🔗 Integração Stripe

### Fluxo de Checkout
1. Frontend: Usuário clica "Ir para Pagamento"
2. Backend: Cria sessão de checkout Stripe
3. Frontend: Redireciona para Stripe Checkout
4. Stripe: Processa pagamento
5. Stripe: Envia webhook para backend
6. Backend: Atualiza status da assinatura
7. Frontend: Redireciona para /confirmacao

### Webhooks Tratados
- `checkout.session.completed` - Assinatura criada
- `invoice.payment_succeeded` - Pagamento bem-sucedido
- `invoice.payment_failed` - Pagamento falhou
- `customer.subscription.deleted` - Assinatura cancelada

## 🔐 Autenticação

### Fluxo JWT
1. User registra/faz login
2. Backend gera `accessToken` (15min) e `refreshToken` (30d)
3. Frontend armazena tokens em localStorage (Zustand persist)
4. Cada request inclui `Authorization: Bearer <accessToken>`
5. Quando expira, frontend usa `refreshToken` para renovar

## 📝 Próximas Implementações

- [ ] Email notifications (registro, pagamento, cancelamento)
- [ ] Testes unitários (Jest)
- [ ] Testes E2E (Playwright)
- [ ] CI/CD (GitHub Actions)
- [ ] Logging centralizado (Winston/Pino)
- [ ] Rate limiting
- [ ] Observabilidade (Sentry)
- [ ] Admin dashboard
- [ ] Multi-tenant completo
- [ ] Suporte a múltiplas moedas

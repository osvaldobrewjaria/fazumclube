# Brewjaria SaaS - Setup Guide

## Pré-requisitos

- Node.js 18+
- pnpm 8+
- PostgreSQL 14+
- Conta Stripe (para testes use modo teste)

## Instalação Rápida

### 1. Instalar dependências

```bash
cd /home/osvaldo-gonzalez/BREWJARIA
pnpm install
```

### 2. Configurar variáveis de ambiente

#### Backend (`apps/api/.env`)

```bash
cp apps/api/.env.example apps/api/.env
```

Editar com seus valores:
```
DATABASE_URL=postgresql://user:password@localhost:5432/brewjaria
JWT_SECRET=seu-secret-key-super-seguro
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=seu-refresh-secret-super-seguro
JWT_REFRESH_EXPIRES_IN=30d
STRIPE_SECRET_KEY=sk_test_seu_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret
FRONTEND_URL=http://localhost:3000
PORT=3001
NODE_ENV=development
```

#### Frontend (`apps/web/.env.local`)

```bash
cp apps/web/.env.example apps/web/.env.local
```

Editar com seus valores:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_seu_stripe_key
```

### 3. Setup do banco de dados

```bash
cd apps/api
pnpm prisma migrate dev --name init
```

Isso vai:
- Criar o banco de dados
- Rodar as migrations
- Gerar o Prisma Client

### 4. Seed do banco (opcional)

Para popular com dados de teste, crie um arquivo `apps/api/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Criar tenant padrão
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'brewjaria' },
    update: {},
    create: {
      name: 'Brewjaria',
      slug: 'brewjaria',
    },
  })

  // Criar plano
  const plan = await prisma.plan.upsert({
    where: { slug: 'clube-brewjaria' },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Clube Brewjaria',
      description: 'Assinatura mensal de cervejas artesanais',
      slug: 'clube-brewjaria',
      active: true,
    },
  })

  // Criar preços
  await prisma.planPrice.createMany({
    data: [
      {
        planId: plan.id,
        interval: 'MONTHLY',
        amountCents: 9990,
        currency: 'BRL',
        stripePriceId: 'price_test_monthly',
        active: true,
      },
      {
        planId: plan.id,
        interval: 'YEARLY',
        amountCents: 99900,
        currency: 'BRL',
        stripePriceId: 'price_test_yearly',
        active: true,
      },
    ],
  })

  console.log('✓ Seed completed')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Depois rodar:
```bash
pnpm prisma db seed
```

## Desenvolvimento

### Iniciar todos os serviços

```bash
pnpm dev
```

Isso vai iniciar em paralelo:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Acessar o banco de dados

```bash
cd apps/api
pnpm prisma studio
```

Abre uma interface visual em http://localhost:5555

## Estrutura de Pastas

```
brewjaria-saas/
├── apps/
│   ├── web/                    # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/           # Rotas (App Router)
│   │   │   ├── components/    # Componentes React
│   │   │   ├── stores/        # Zustand stores
│   │   │   ├── lib/           # Utilitários (API client)
│   │   │   └── styles/        # CSS global
│   │   └── package.json
│   │
│   └── api/                    # NestJS Backend
│       ├── src/
│       │   ├── auth/          # Autenticação (JWT)
│       │   ├── users/         # Gerenciamento de usuários
│       │   ├── subscriptions/ # Lógica de assinaturas
│       │   ├── stripe/        # Integração Stripe
│       │   ├── prisma/        # Serviço Prisma
│       │   └── main.ts        # Entry point
│       ├── prisma/
│       │   └── schema.prisma  # Schema do banco
│       └── package.json
│
├── packages/
│   └── shared/                # Tipos compartilhados (futuro)
│
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

## Fluxo de Desenvolvimento

### 1. Criar nova feature

```bash
git checkout -b feature/nome-da-feature
```

### 2. Fazer alterações

- Backend: `apps/api/src/**`
- Frontend: `apps/web/src/**`

### 3. Testar localmente

```bash
pnpm dev
```

### 4. Commit e push

```bash
git add .
git commit -m "feat: descrição da feature"
git push origin feature/nome-da-feature
```

## Endpoints da API

### Autenticação

- `POST /auth/register` - Criar conta
- `POST /auth/login` - Login
- `POST /auth/refresh` - Renovar token

### Usuários

- `GET /users/me` - Perfil do usuário logado
- `PATCH /users/me` - Atualizar perfil

### Assinaturas

- `POST /subscriptions/checkout-session` - Criar sessão de checkout
- `GET /subscriptions/me` - Informações da assinatura
- `DELETE /subscriptions/cancel` - Cancelar assinatura

### Stripe

- `POST /stripe/webhook` - Webhook do Stripe

## Variáveis de Ambiente Necessárias

### Stripe

1. Acessar https://dashboard.stripe.com
2. Ir em "Developers" > "API keys"
3. Copiar `Publishable key` (pk_test_...)
4. Copiar `Secret key` (sk_test_...)
5. Ir em "Webhooks" e criar novo endpoint
6. Copiar `Signing secret` (whsec_...)

### JWT

Gerar secrets seguros:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Troubleshooting

### Erro de conexão com banco

```bash
# Verificar se PostgreSQL está rodando
psql -U postgres -d brewjaria
```

### Erro de módulos não encontrados

```bash
# Reinstalar dependências
pnpm install
pnpm prisma generate
```

### Porta já em uso

```bash
# Mudar porta no .env
PORT=3002
```

## Deploy

### Preparar para produção

1. Build do frontend:
```bash
cd apps/web
pnpm build
```

2. Build do backend:
```bash
cd apps/api
pnpm build
```

3. Configurar variáveis de produção no servidor

4. Rodar migrations:
```bash
pnpm prisma migrate deploy
```

5. Iniciar aplicação:
```bash
pnpm start
```

## Próximos Passos

- [ ] Implementar email notifications
- [ ] Adicionar testes unitários
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Adicionar logging centralizado
- [ ] Implementar rate limiting
- [ ] Adicionar observabilidade (Sentry)
- [ ] Preparar para multi-tenant
- [ ] Adicionar admin dashboard

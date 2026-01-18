# 🚀 BREWJARIA - Guia de Deploy

## 📋 Pré-requisitos

1. Conta no [Vercel](https://vercel.com) (Frontend)
2. Conta no [Railway](https://railway.app) ou [Render](https://render.com) (Backend)
3. Conta no [Stripe](https://stripe.com) (Pagamentos)
4. Banco PostgreSQL (Railway, Supabase, ou Neon)

---

## 🎨 DEPLOY FRONTEND (Vercel)

### Opção 1: Deploy via GitHub

1. **Push do código para GitHub:**
```bash
cd /home/osvaldo-gonzalez/BREWJARIA
git init
git add .
git commit -m "Initial commit - Brewjaria SaaS"
git remote add origin https://github.com/SEU_USUARIO/brewjaria.git
git push -u origin main
```

2. **Conectar ao Vercel:**
   - Acesse [vercel.com/new](https://vercel.com/new)
   - Importe o repositório do GitHub
   - Selecione a pasta `apps/web`
   - Configure as variáveis de ambiente:
     - `NEXT_PUBLIC_API_URL` = URL do backend (ex: https://brewjaria-api.railway.app)
     - `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` = Sua chave pública do Stripe

3. **Deploy automático!**

### Opção 2: Deploy via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd apps/web
vercel --prod
```

---

## 🔧 DEPLOY BACKEND (Railway)

### 1. Criar conta no Railway
- Acesse [railway.app](https://railway.app)
- Faça login com GitHub

### 2. Criar novo projeto
- Clique em "New Project"
- Selecione "Deploy from GitHub repo"
- Escolha o repositório brewjaria

### 3. Configurar o serviço
- Root Directory: `apps/api`
- Build Command: `pnpm build`
- Start Command: `pnpm start:prod`

### 4. Adicionar PostgreSQL
- Clique em "New" → "Database" → "PostgreSQL"
- Railway criará automaticamente a variável `DATABASE_URL`

### 5. Configurar variáveis de ambiente
```env
DATABASE_URL=postgresql://... (automático)
JWT_SECRET=sua_chave_secreta_super_segura_aqui_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=outra_chave_secreta_para_refresh_token
JWT_REFRESH_EXPIRES_IN=30d
STRIPE_SECRET_KEY=sk_live_... (ou sk_test_...)
STRIPE_WEBHOOK_SECRET=whsec_...
WEB_URL=https://brewjaria.vercel.app
PORT=3001
```

### 6. Deploy!
- Railway fará o deploy automaticamente

---

## 💳 CONFIGURAR STRIPE

### 1. Criar conta Stripe
- Acesse [dashboard.stripe.com](https://dashboard.stripe.com)

### 2. Obter chaves API
- Developers → API Keys
- Copie `Publishable key` (pk_test_...) → Frontend
- Copie `Secret key` (sk_test_...) → Backend

### 3. Criar produtos e preços
```bash
# No Stripe Dashboard:
# Products → Add Product

# Plano Mensal:
# - Nome: Brewjaria Mensal
# - Preço: R$ 99,90/mês
# - Copie o Price ID (price_...)

# Plano Anual:
# - Nome: Brewjaria Anual
# - Preço: R$ 999,00/ano
# - Copie o Price ID (price_...)
```

### 4. Configurar Webhooks
- Developers → Webhooks → Add endpoint
- URL: `https://sua-api.railway.app/stripe/webhook`
- Eventos:
  - `checkout.session.completed`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
  - `customer.subscription.deleted`
- Copie o Webhook Secret (whsec_...)

### 5. Seed dos planos no banco
```sql
-- Conectar ao PostgreSQL e executar:

-- Criar tenant (slug DEVE ser 'brewjaria', não 'brew')
INSERT INTO "Tenant" (id, name, slug, "createdAt", "updatedAt")
VALUES ('tenant_brewjaria', 'Brewjaria', 'brewjaria', NOW(), NOW());

-- Criar plano
INSERT INTO "Plan" (id, "tenantId", name, description, slug, active, "stripeProductId", "createdAt", "updatedAt")
VALUES ('plan_premium', 'tenant_brewjaria', 'Premium', 'Acesso completo ao clube', 'premium', true, 'prod_SEU_PRODUCT_ID', NOW(), NOW());

-- Criar preços
INSERT INTO "PlanPrice" (id, "planId", interval, "amountCents", currency, "stripePriceId", active, "createdAt", "updatedAt")
VALUES 
  ('price_monthly', 'plan_premium', 'MONTHLY', 9990, 'BRL', 'price_SEU_PRICE_ID_MENSAL', true, NOW(), NOW()),
  ('price_yearly', 'plan_premium', 'YEARLY', 99900, 'BRL', 'price_SEU_PRICE_ID_ANUAL', true, NOW(), NOW());
```

---

## ✅ CHECKLIST DE DEPLOY

### Frontend (Vercel)
- [ ] Código no GitHub
- [ ] Projeto criado no Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Build passando
- [ ] Site acessível

### Backend (Railway)
- [ ] Código no GitHub
- [ ] Projeto criado no Railway
- [ ] PostgreSQL adicionado
- [ ] Variáveis de ambiente configuradas
- [ ] Migrations executadas
- [ ] API respondendo

### Stripe
- [ ] Conta criada
- [ ] Produtos e preços criados
- [ ] Webhook configurado
- [ ] Seed dos planos no banco

### Testes Finais
- [ ] Landing page carregando
- [ ] Signup funcionando
- [ ] Login funcionando
- [ ] Checkout redirecionando para Stripe
- [ ] Webhook recebendo eventos

---

## 🔗 URLs Finais

| Serviço | URL |
|---------|-----|
| Frontend | https://brewjaria.vercel.app |
| Backend | https://brewjaria-api.railway.app |
| Stripe Dashboard | https://dashboard.stripe.com |

---

## 🆘 Troubleshooting

### Erro de CORS
Adicione a URL do frontend no backend:
```typescript
// main.ts
app.enableCors({
  origin: ['https://brewjaria.vercel.app'],
  credentials: true,
});
```

### Erro de conexão com banco
Verifique se a `DATABASE_URL` está correta e se o banco está acessível.

### Webhook não recebendo eventos
- Verifique se a URL está correta
- Verifique se o `STRIPE_WEBHOOK_SECRET` está configurado
- Teste com `stripe listen --forward-to localhost:3001/stripe/webhook`

---

**Última atualização:** 02/12/2025

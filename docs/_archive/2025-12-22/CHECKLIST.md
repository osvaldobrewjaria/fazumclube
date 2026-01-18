# Brewjaria SaaS - Checklist de Implementação

## ✅ Concluído

### Estrutura do Monorepo
- [x] pnpm-workspace.yaml configurado
- [x] Root package.json com scripts
- [x] Estrutura de pastas apps/api e apps/web

### Backend (NestJS)
- [x] Configuração inicial do NestJS
- [x] Prisma ORM integrado
- [x] Schema Prisma com todos os modelos
- [x] AuthModule (register, login, refresh)
- [x] JWT strategy e guards
- [x] UsersModule (getProfile, updateProfile)
- [x] SubscriptionsModule (checkout, get, cancel)
- [x] StripeModule (integração Stripe)
- [x] HealthModule (health check)
- [x] CORS configurado
- [x] Global validation pipe

### Frontend (Next.js)
- [x] Configuração inicial Next.js
- [x] Tailwind CSS integrado
- [x] Framer Motion para animações
- [x] Zustand para state management
- [x] Axios API client
- [x] Layout raiz com AuthProvider
- [x] Landing page (Hero)
- [x] SubscriptionFlow (3 steps)
- [x] AccountStep (registro)
- [x] AddressStep (endereço)
- [x] PaymentStep (resumo + Stripe)
- [x] Confirmation page

### Documentação
- [x] README.md principal
- [x] SETUP.md com instruções
- [x] PROJECT_STRUCTURE.md com arquitetura
- [x] Este CHECKLIST.md

## 🔄 Próximos Passos

### 1. Instalação e Setup (15-30 min)
- [ ] Instalar dependências: `pnpm install`
- [ ] Configurar PostgreSQL localmente
- [ ] Copiar .env.example para .env em ambas as apps
- [ ] Preencher variáveis de ambiente (DATABASE_URL, JWT_SECRET, STRIPE_KEYS)
- [ ] Rodar migrations: `pnpm prisma migrate dev --name init`
- [ ] (Opcional) Seed do banco: `pnpm prisma db seed`

### 2. Testes Locais (30-45 min)
- [ ] Iniciar dev server: `pnpm dev`
- [ ] Verificar se frontend roda em localhost:3000
- [ ] Verificar se backend roda em localhost:3001
- [ ] Testar health check: `curl http://localhost:3001/health`
- [ ] Testar registro de usuário via frontend
- [ ] Verificar dados no banco (Prisma Studio: `pnpm prisma studio`)

### 3. Integração Stripe (30-60 min)
- [ ] Criar conta Stripe (https://stripe.com)
- [ ] Copiar chaves de teste (pk_test_*, sk_test_*)
- [ ] Copiar webhook secret (whsec_*)
- [ ] Configurar .env com chaves Stripe
- [ ] Testar checkout flow completo
- [ ] Configurar webhook local (usar ngrok ou similar)
- [ ] Testar webhook events

### 4. Melhorias de UX (1-2 horas)
- [ ] Adicionar loading states em todos os forms
- [ ] Adicionar error handling e mensagens de erro
- [ ] Adicionar validação de formulários no frontend
- [ ] Adicionar toast notifications (react-hot-toast)
- [ ] Melhorar animações de transição entre steps
- [ ] Adicionar skeleton loaders

### 5. Segurança (1 hora)
- [ ] Implementar rate limiting no backend
- [ ] Adicionar CSRF protection
- [ ] Validar inputs no backend (class-validator)
- [ ] Hash de senhas com bcrypt
- [ ] Refresh token rotation
- [ ] Logout endpoint

### 6. Email Notifications (1-2 horas)
- [ ] Integrar Resend ou SendGrid
- [ ] Email de confirmação de registro
- [ ] Email de confirmação de pagamento
- [ ] Email de cancelamento de assinatura
- [ ] Email de renovação de assinatura

### 7. Testes (2-3 horas)
- [ ] Testes unitários do backend (Jest)
- [ ] Testes de integração (Supertest)
- [ ] Testes E2E do frontend (Playwright)
- [ ] Cobertura mínima de 70%

### 8. Logging e Monitoring (1-2 horas)
- [ ] Configurar Winston ou Pino para logs
- [ ] Integrar Sentry para error tracking
- [ ] Adicionar request logging
- [ ] Adicionar performance monitoring

### 9. CI/CD (1-2 horas)
- [ ] Configurar GitHub Actions
- [ ] Build pipeline
- [ ] Test pipeline
- [ ] Deploy pipeline (staging/production)

### 10. Deploy (2-4 horas)
- [ ] Escolher plataforma (Vercel, Railway, Render, etc)
- [ ] Configurar variáveis de produção
- [ ] Deploy do frontend
- [ ] Deploy do backend
- [ ] Configurar domínio customizado
- [ ] Testar em produção

### 11. Funcionalidades Adicionais (futuro)
- [ ] Minha Conta page (/minha-conta)
- [ ] Histórico de pagamentos
- [ ] Gerenciamento de assinatura
- [ ] Cancelamento de assinatura
- [ ] Atualização de método de pagamento
- [ ] Página de privacidade (/privacidade)
- [ ] Página de termos (/termos)
- [ ] Admin dashboard
- [ ] Multi-tenant completo
- [ ] Suporte a múltiplas moedas

## 📋 Verificação de Qualidade

### Backend
- [ ] Todos os endpoints retornam status HTTP correto
- [ ] Validação de inputs funcionando
- [ ] Erros são tratados e retornam mensagens claras
- [ ] JWT tokens são gerados e validados
- [ ] Stripe integration funcionando
- [ ] Banco de dados sincronizado com schema

### Frontend
- [ ] Responsivo em mobile/tablet/desktop
- [ ] Animações suaves
- [ ] Loading states visíveis
- [ ] Mensagens de erro claras
- [ ] Tokens armazenados corretamente
- [ ] Redirecionamentos funcionando

### Segurança
- [ ] Senhas hasheadas no banco
- [ ] JWT tokens com expiração
- [ ] CORS configurado corretamente
- [ ] Inputs validados
- [ ] Variáveis sensíveis em .env
- [ ] Webhook Stripe verificado

## 🎯 Métricas de Sucesso

- [ ] Usuário consegue se registrar
- [ ] Usuário consegue fazer login
- [ ] Usuário consegue preencher endereço
- [ ] Usuário consegue ir para checkout Stripe
- [ ] Pagamento é processado
- [ ] Assinatura é criada no banco
- [ ] Usuário recebe confirmação
- [ ] Webhook Stripe atualiza status

## 📞 Suporte e Recursos

### Documentação
- NestJS: https://docs.nestjs.com
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- Stripe: https://stripe.com/docs
- Tailwind: https://tailwindcss.com/docs
- Framer Motion: https://www.framer.com/motion

### Ferramentas Úteis
- Prisma Studio: `pnpm prisma studio`
- Stripe Dashboard: https://dashboard.stripe.com
- ngrok (para webhooks locais): https://ngrok.com
- Postman (para testar APIs)

## 📝 Notas Importantes

1. **Variáveis de Ambiente**: Nunca commitar .env files, sempre usar .env.example
2. **Banco de Dados**: Usar migrations para mudanças no schema
3. **Secrets**: Gerar secrets seguros com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
4. **Stripe Webhook**: Usar ngrok ou similar para testar localmente
5. **CORS**: Configurar apenas domínios necessários em produção
6. **Rate Limiting**: Implementar para evitar abuso
7. **Logs**: Manter logs de todas as transações Stripe
8. **Backups**: Configurar backups automáticos do banco

## 🚨 Troubleshooting Comum

### Erro: "Cannot find module"
```bash
pnpm install
pnpm prisma generate
```

### Erro: "Port already in use"
```bash
# Mudar porta no .env
PORT=3002
```

### Erro: "Database connection refused"
```bash
# Verificar se PostgreSQL está rodando
psql -U postgres
```

### Erro: "Stripe key invalid"
```bash
# Verificar se as chaves estão corretas em .env
# Usar chaves de teste (sk_test_*, pk_test_*)
```

---

**Última atualização**: Nov 25, 2025
**Status**: Scaffolding completo, pronto para instalação

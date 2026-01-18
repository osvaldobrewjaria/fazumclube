# Checklist de Testes Manuais — FAZUMCLUBE

> **Objetivo:** Guia para testes manuais reproduzíveis  
> **Última atualização:** 15 Janeiro 2026

---

## Pré-requisitos

```bash
# 1. Servidor rodando
cd ~/BREWJARIA
pnpm dev

# 2. URLs disponíveis
# Frontend: http://localhost:3000
# Backend:  http://localhost:3001

# 3. Banco de dados com seed
cd apps/api
npx prisma db seed
```

---

## A) FUNCIONAL AGORA (TESTÁVEL)

### 1. Marketing — Landing Page

| # | URL | Pré-requisito | Passos | Resultado Esperado |
|---|-----|---------------|--------|-------------------|
| 1.1 | `/` | Nenhum | 1. Acessar http://localhost:3000 | Landing FAZUMCLUBE carrega com CTA "Criar meu clube" |
| 1.2 | `/` | Nenhum | 1. Clicar em "Criar meu clube" | Redireciona para `/app/signup` |

---

### 2. Conta SaaS — Signup

| # | URL | Pré-requisito | Passos | Resultado Esperado |
|---|-----|---------------|--------|-------------------|
| 2.1 | `/app/signup` | Nenhum | 1. Acessar `/app/signup` | Formulário de signup em 2 etapas |
| 2.2 | `/app/signup` | Nenhum | 1. Preencher nome, email, senha<br>2. Clicar "Continuar" | Avança para etapa 2 (dados do clube) |
| 2.3 | `/app/signup` | Etapa 1 completa | 1. Preencher nome do clube<br>2. Verificar slug gerado<br>3. Clicar "Criar Clube" | Tenant criado, redireciona para `/t/[slug]/admin` |
| 2.4 | `/app/signup` | Nenhum | 1. Tentar criar com email já existente | Exibe erro "Email já cadastrado" |
| 2.5 | `/app/signup` | Nenhum | 1. Tentar criar com slug já existente | Exibe erro "Slug não disponível" |

**Observações:**
- O signup usa o endpoint `POST /tenants/provision`
- Cria User + Tenant em uma única operação
- User é automaticamente owner do tenant

---

### 3. Conta SaaS — Login

| # | URL | Pré-requisito | Passos | Resultado Esperado |
|---|-----|---------------|--------|-------------------|
| 3.1 | `/app/login` | Nenhum | 1. Acessar `/app/login` | Formulário de login |
| 3.2 | `/app/login` | Conta existente | 1. Preencher email/senha válidos<br>2. Clicar "Entrar" | Redireciona para `/app/dashboard` |
| 3.3 | `/app/login` | Nenhum | 1. Preencher credenciais inválidas | Exibe erro "Credenciais inválidas" |

---

### 4. Conta SaaS — Dashboard (HUB)

| # | URL | Pré-requisito | Passos | Resultado Esperado |
|---|-----|---------------|--------|-------------------|
| 4.1 | `/app/dashboard` | Logado | 1. Acessar `/app/dashboard` | Lista de clubes do usuário |
| 4.2 | `/app/dashboard` | Logado, 1+ tenant | 1. Ver card do clube | Exibe nome, status, assinantes, MRR |
| 4.3 | `/app/dashboard` | Logado | 1. Clicar "Acessar Admin" no card | Redireciona para `/t/[slug]/admin` |
| 4.4 | `/app/dashboard` | Logado | 1. Clicar "Criar novo clube" | Redireciona para `/app/signup` |
| 4.5 | `/app/dashboard` | Não logado | 1. Acessar `/app/dashboard` diretamente | Redireciona para `/app/login` |
| 4.6 | `/app/dashboard` | Logado | 1. Clicar "Sair" | Logout, redireciona para `/app/login` |

**Observações:**
- Dashboard busca dados via `GET /tenants/my`
- Exibe métricas reais: subscribersCount, mrr
- Status do Stripe Connect (conectado/pendente)

---

### 5. Tenant — Landing Pública

| # | URL | Pré-requisito | Passos | Resultado Esperado |
|---|-----|---------------|--------|-------------------|
| 5.1 | `/t/brewjaria` | Tenant existe | 1. Acessar `/t/brewjaria` | Landing do clube Brewjaria |
| 5.2 | `/t/demo` | Tenant existe | 1. Acessar `/t/demo` | Landing do tenant demo |
| 5.3 | `/t/inexistente` | - | 1. Acessar slug inexistente | Página 404 ou erro |

---

### 6. Tenant — Admin do Clube

| # | URL | Pré-requisito | Passos | Resultado Esperado |
|---|-----|---------------|--------|-------------------|
| 6.1 | `/t/[slug]/admin` | Logado como owner | 1. Acessar admin do tenant | Dashboard com métricas |
| 6.2 | `/t/[slug]/admin/assinantes` | Logado | 1. Acessar lista de assinantes | Lista de usuários do tenant |
| 6.3 | `/t/[slug]/admin/entregas` | Logado | 1. Acessar entregas | Lista de entregas do mês |
| 6.4 | `/t/[slug]/admin/planos` | Logado | 1. Acessar planos | Lista de planos do clube |

---

### 7. Rotas Legadas — Redirect `/admin`

| # | URL | Pré-requisito | Passos | Resultado Esperado | Obs |
|---|-----|---------------|--------|-------------------|-----|
| 7.1 | `/admin` | Não logado | 1. Acessar `/admin` | Redireciona para `/app/login` | Client-side |
| 7.2 | `/admin` | Logado, 1 tenant | 1. Acessar `/admin` | Redireciona para `/t/[slug]/admin` | Client-side |
| 7.3 | `/admin` | Logado, 2+ tenants | 1. Acessar `/admin` | Redireciona para `/app/dashboard` | Client-side |
| 7.4 | `/admin` | curl (sem JS) | 1. `curl -I http://localhost:3000/admin` | Location: `/app/dashboard` | Server-side |

**Teste via curl (critério de aceitação):**
```bash
# Deve retornar Location: /app/dashboard (NUNCA um tenant específico)
curl -sI http://localhost:3000/admin | grep -i location
```

---

### 8. Autenticação — API

| # | Endpoint | Passos | Resultado Esperado |
|---|----------|--------|-------------------|
| 8.1 | `POST /auth/login` | 1. Enviar email/senha válidos | Retorna `access_token` e `user` |
| 8.2 | `GET /tenants/my` | 1. Enviar com Bearer token válido | Retorna lista de tenants |
| 8.3 | `GET /tenants/my` | 1. Enviar sem token | Retorna 401 Unauthorized |

**Teste via curl:**
```bash
# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","password":"suasenha"}'

# Listar tenants (substituir TOKEN)
curl http://localhost:3001/tenants/my \
  -H "Authorization: Bearer TOKEN"
```

---

### 9. Middleware — Header X-Tenant

| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|-------------------|
| 9.1 | Com header válido | 1. Requisição com `X-Tenant: brewjaria` | Requisição processada |
| 9.2 | Com header inválido | 1. Requisição com `X-Tenant: inexistente` | Erro 400: Invalid tenant |
| 9.3 | Sem header | 1. Requisição sem X-Tenant | Usa fallback ou erro |

---

## B) NÃO IMPLEMENTADO AINDA (BACKLOG)

| # | Funcionalidade | Rota/Local | Dependências | Critério de Aceitação |
|---|----------------|------------|--------------|----------------------|
| B.1 | Stripe Connect onboarding | `/app/dashboard` | Stripe Connect API | Dono conecta conta Stripe, recebe pagamentos |
| B.2 | Checkout de assinatura | `/t/[slug]/assinatura` | Stripe Connect | Assinante completa checkout, pagamento vai para tenant |
| B.3 | Configurações do clube | `/t/[slug]/admin/configuracoes` | - | Dono edita nome, logo, cores do clube |
| B.4 | Configurações da conta SaaS | `/app/settings` | - | Dono edita email, senha, dados pessoais |
| B.5 | Múltiplos admins por clube | `/t/[slug]/admin/equipe` | Schema update | Owner convida outros admins |
| B.6 | Emails transacionais | Backend | Email service | Boas-vindas, confirmação, cobrança |
| B.7 | Exportar entregas CSV | `/t/[slug]/admin/entregas` | - | Botão exporta lista em CSV |
| B.8 | Pausar/reativar assinatura | `/t/[slug]/minha-assinatura` | Stripe API | Assinante pausa temporariamente |
| B.9 | Domínio customizado | Infra | DNS, SSL | Tenant usa próprio domínio |
| B.10 | Analytics por tenant | `/t/[slug]/admin/analytics` | - | Gráficos de crescimento, churn, MRR |

---

## C) FLUXO COMPLETO DE TESTE (E2E Manual)

### Cenário: Novo dono cria clube e acessa admin

```
1. Acessar http://localhost:3000
2. Clicar "Criar meu clube"
3. Preencher: Nome, Email (novo), Senha
4. Clicar "Continuar"
5. Preencher: Nome do clube (ex: "Meu Teste")
6. Verificar slug gerado (ex: "meu-teste")
7. Clicar "Criar Clube"
8. Verificar: Redirecionou para /t/meu-teste/admin
9. Verificar: Dashboard admin carrega
10. Clicar em "Assinantes" no menu
11. Verificar: Lista vazia (novo clube)
12. Voltar para /app/dashboard
13. Verificar: Clube "Meu Teste" aparece na lista
14. Clicar "Sair"
15. Verificar: Redirecionou para /app/login
```

### Cenário: Redirect inteligente do /admin

```
1. Fazer logout (limpar localStorage)
2. Acessar /admin
3. Verificar: Redirecionou para /app/login

4. Fazer login com conta que tem 1 tenant
5. Acessar /admin
6. Verificar: Redirecionou para /t/[slug]/admin

7. Criar segundo tenant via /app/signup
8. Acessar /admin
9. Verificar: Redirecionou para /app/dashboard
```

---

## D) COMANDOS ÚTEIS PARA TESTES

```bash
# Verificar servidor rodando
curl http://localhost:3000 -o /dev/null -w "%{http_code}"
curl http://localhost:3001/health -o /dev/null -w "%{http_code}"

# Testar redirect do /admin (deve ser /app/dashboard)
curl -sI http://localhost:3000/admin | grep -i location

# Verificar tenants no banco
cd apps/api
npx prisma studio
# Ou via SQL:
# SELECT id, slug, name FROM "Tenant";

# Limpar dados de teste
npx prisma migrate reset
npx prisma db seed
```

---

## E) CHECKLIST RÁPIDO (SMOKE TEST)

- [ ] `/` carrega landing FAZUMCLUBE
- [ ] `/app/login` carrega formulário
- [ ] `/app/signup` carrega formulário em 2 etapas
- [ ] `/app/dashboard` redireciona para login se não autenticado
- [ ] `/t/brewjaria` carrega landing do tenant
- [ ] `/t/brewjaria/admin` carrega admin (se logado)
- [ ] `/admin` redireciona para `/app/dashboard` (curl)
- [ ] API `/auth/login` retorna token
- [ ] API `/tenants/my` retorna lista com token válido

---

*Documento de testes manuais do FAZUMCLUBE*

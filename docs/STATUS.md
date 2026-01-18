# Status do Projeto — FAZUMCLUBE

> **Última atualização:** 16 Janeiro 2026  
> **Ciclo de QA:** Completo (16/01/2026)

---

## Resumo Executivo

| Categoria | Status |
|-----------|--------|
| **Marketing Site** | ✅ Funcional |
| **Conta SaaS (Login/Signup/Dashboard)** | ⚠️ Login bloqueado (BUG-001) |
| **Admin do Tenant** | ⚠️ Autorização falha (BUG-002) |
| **Isolamento de Dados** | ✅ Funcional |
| **Área do Assinante** | ✅ Parcial |
| **Stripe Connect** | ⏳ Não implementado |
| **Rotas Legadas** | 🔄 Em transição |

---

## BUGS ATIVOS (P0 — Bloqueadores)

| ID | Severidade | Título | Impacto |
|----|------------|--------|---------|
| [BUG-001](./BUGS.md#bug-001) | 🟠 Médio | `/app/login` exige tenant | Bloqueia login do dono |
| [BUG-002](./BUGS.md#bug-002) | 🔴 Alto | Sessão global entre tenants | Risco de segurança |

> **Ação:** Corrigir BUG-002 e BUG-001 antes de qualquer feature nova.

---

## A) FUNCIONAL AGORA

### Marketing
| Item | Status | Observação |
|------|--------|------------|
| Landing page `/` | ✅ | FAZUMCLUBE institucional |
| CTA "Criar meu clube" | ✅ | Aponta para `/app/signup` |

### Conta SaaS (`/app/*`)
| Item | Status | Observação |
|------|--------|------------|
| `/app/login` | ✅ | Login funcional com JWT |
| `/app/signup` | ✅ | Cria User + Tenant em uma operação |
| `/app/dashboard` | ✅ | Lista tenants reais da API |
| Proteção de rotas | ✅ | Redireciona para login se não autenticado |
| Logout | ✅ | Limpa tokens e redireciona |

### Tenant (`/t/[slug]/*`)
| Item | Status | Observação |
|------|--------|------------|
| Landing pública `/t/[slug]` | ✅ | Carrega config do tenant |
| Admin `/t/[slug]/admin` | ✅ | Dashboard com métricas |
| Admin - Assinantes | ✅ | Lista e detalhes |
| Admin - Entregas | ✅ | Lista e atualização de status |
| Admin - Planos | ✅ | Visualização |
| Admin - Pagamentos | ✅ | Histórico |
| Área do assinante | ✅ | `/t/[slug]/minha-conta` |

### API Backend
| Item | Status | Observação |
|------|--------|------------|
| `POST /auth/login` | ✅ | Retorna access_token + refresh_token |
| `POST /auth/register` | ✅ | Registro de usuário |
| `POST /tenants/provision` | ✅ | Cria tenant + owner |
| `GET /tenants/my` | ✅ | Lista tenants do usuário logado |
| `GET /tenants/check-slug/:slug` | ✅ | Verifica disponibilidade |
| `GET /admin/*` | ✅ | Endpoints admin do tenant |
| Middleware X-Tenant | ✅ | Valida tenant em todas requisições |

### Rotas Legadas
| Item | Status | Observação |
|------|--------|------------|
| `/admin` redirect inteligente | ✅ | Baseado em contexto do usuário |
| Middleware fallback neutro | ✅ | Nunca redireciona para tenant específico |

---

## B) ROADMAP PRIORIZADO

### P0 — Bloqueadores (ANTES de tudo)
| Item | Tipo | Impacto |
|------|------|---------|
| BUG-002: Autorização por tenant | 🐛 Bug | Segurança crítica |
| BUG-001: `/app/login` exige tenant | 🐛 Bug | Bloqueia dono do clube |

### P1 — Monetização (MVP Pagável)
| Item | Dependência | Impacto |
|------|-------------|---------|
| Stripe Connect onboarding (Standard) | Stripe API | Destrava receita |
| Checkout de assinatura por tenant | Stripe Connect | Vendas |
| **Webhooks de pagamento** | Stripe | Fecha ciclo de assinatura |
| Pausar/reativar assinatura | Stripe | Operação básica |

### P2 — Retenção/UX (Reduz churn e suporte)
| Item | Dependência | Impacto |
|------|-------------|---------|
| Emails transacionais | Email service | Boas-vindas, cobrança, cancelamento |
| Configurações do clube | - | Personalização |
| Configurações da conta SaaS | - | Plano, billing, Stripe status |
| Playwright E2E | - | Automatizar testes de checkout |

### P3 — Operação e Escala
| Item | Dependência | Impacto |
|------|-------------|---------|
| Múltiplos admins por clube | Schema | Escala de operação |
| Exportar entregas CSV | - | Operação manual |
| Analytics por tenant | - | Insights |
| Domínio customizado | Infra | Branding avançado |
| CI/CD automatizado | GitHub Actions | Deploy |
| Logs estruturados por tenant | - | Monitoramento |

---

## C) INCONSISTÊNCIAS ENCONTRADAS

### Documentação vs Código

| Esperado (Doc antiga) | Encontrado (Código atual) | Status |
|-----------------------|---------------------------|--------|
| `/admin` como admin real | `/admin` é redirect para `/t/[slug]/admin` | ✅ Corrigido |
| Brewjaria como produto | Brewjaria é apenas um tenant | ✅ Corrigido |
| `setToken` no authStore | `setAuth` (token + refreshToken + user) | ✅ Corrigido |
| Fallback para `/t/brewjaria/admin` | Fallback para `/app/dashboard` | ✅ Corrigido |

### Arquivos Obsoletos

| Arquivo | Problema | Ação |
|---------|----------|------|
| `docs/ARCHITECTURE.md` | Referencia "Brewjaria SaaS" como produto | Mover para `_archive` |
| `docs/CRIAR_NOVO_CLIENTE.md` | Processo antigo de criação | Mover para `_archive` |
| `DOCS/TENANTS/CRIACAO_DE_TENANT.md` | Referencia "Brewjaria" como produto | Mover para `_archive` |
| `README.md` | Rotas desatualizadas | Atualizar |

---

## D) TENANTS DE TESTE DISPONÍVEIS

| Slug | Nome | Status | Uso |
|------|------|--------|-----|
| `brewjaria` | Brewjaria | ✅ Seed | Tenant piloto/produção |
| `demo` | Demo Club | ✅ Seed | Demonstração |
| `wine-club` | Wine Club | ✅ Config | Template vinho |
| `coffee-club` | Coffee Club | ✅ Config | Template café |

**Nota:** Para testar, use qualquer tenant. Nenhum é especial.

---

## E) AMBIENTE DE DESENVOLVIMENTO

```bash
# Iniciar servidores
pnpm dev

# URLs
Frontend: http://localhost:3000
Backend:  http://localhost:3001

# Banco de dados
cd apps/api
npx prisma studio
```

---

## F) PRÓXIMOS MARCOS

### Marco 1: Monetização (Stripe Connect)
- [ ] Onboarding Stripe Connect no dashboard
- [ ] Checkout de assinatura por tenant
- [ ] Webhooks de pagamento
- [ ] Split de pagamentos (plataforma + tenant)

### Marco 2: Operação Completa
- [ ] Emails transacionais
- [ ] Exportação de dados
- [ ] Configurações do clube

### Marco 3: Escala
- [ ] Múltiplos admins
- [ ] Domínios customizados
- [ ] Analytics

---

## G) MÉTRICAS DO CÓDIGO

| Métrica | Valor |
|---------|-------|
| Rotas frontend | ~25 |
| Endpoints API | ~20 |
| Models Prisma | 8 |
| Tenants seed | 2 |

---

*Status atualizado em 15 Janeiro 2026*

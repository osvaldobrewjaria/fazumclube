# Projeto: FAZUMCLUBE (Plataforma SaaS de Clubes de Assinatura)

**Status:** Consolidação de Arquitetura e Fluxos

---

## 1. CONTEXTO GERAL DO PROJETO

Este repositório contém um sistema SaaS multi-tenant cujo produto se chama **FAZUMCLUBE**.

- O **FAZUMCLUBE** é a PLATAFORMA.
- Os clubes (ex: Brewjaria) são **CLIENTES** da plataforma (tenants).

> **Regra:** Nenhum tenant deve ser tratado como especial. Brewjaria é apenas um tenant de produção/piloto.

---

## 2. PAPÉIS NO SISTEMA

Existem 4 tipos de usuários claramente distintos:

### 1) Visitante
- Pessoa que acessa o site institucional
- Ainda não criou clube
- Não possui conta

### 2) Dono do Clube (Cliente SaaS)
- Cria um ou mais clubes (tenants)
- Configura o clube
- Gerencia assinaturas, entregas, planos
- Acessa o admin do clube

### 3) Operador/Admin do Clube
- Atua dentro de um clube específico
- Gerencia assinantes, entregas, dados operacionais
- Sempre atua dentro de `/t/[slug]/admin`

### 4) Assinante Final
- Cliente do clube
- Assina planos
- Acompanha pagamentos e entregas
- **Nunca acessa `/app` ou `/admin` do SaaS**

---

## 3. ESTRUTURA FINAL DE ROTAS (OFICIAL)

### MARKETING — FAZUMCLUBE (PÚBLICO)

| Rota | Descrição |
|------|-----------|
| `/` | Landing page institucional FAZUMCLUBE |

**Objetivo:**
- Apresentar o produto
- Converter visitantes em donos de clube
- CTA sempre aponta para `/app/signup`

---

### ÁREA DO DONO DO CLUBE (CONTA SAAS)

| Rota | Descrição |
|------|-----------|
| `/app/login` | Login do dono do clube |
| `/app/signup` | Criar conta + criar tenant |
| `/app/dashboard` | HUB da conta (não é admin do clube) |

**IMPORTANTE:**
- `/app/*` **NÃO** é painel operacional
- `/app/*` **NÃO** gerencia assinantes nem entregas
- `/app/dashboard` serve apenas para:
  - Listar clubes do usuário
  - Criar novo clube
  - Redirecionar para o admin do tenant
  - Mostrar status do plano SaaS e Stripe

---

### ÁREA DO TENANT (CADA CLUBE)

| Rota | Descrição |
|------|-----------|
| `/t/[slug]` | Landing pública do clube |
| `/t/[slug]/admin` | Admin COMPLETO do clube |
| `/t/[slug]/assinatura` | Checkout do assinante |
| `/t/[slug]/minha-conta` | Área do assinante |
| `/t/[slug]/login` | Login do assinante (se aplicável) |

**Exemplos:**
- `/t/brewjaria`
- `/t/brewjaria/admin`
- `/t/clubedograo/admin`

> **REGRA ABSOLUTA:** Todo admin operacional de clube SEMPRE é acessado via `/t/[slug]/admin`

---

## 4. FLUXOS PRINCIPAIS

### FLUXO A — VISITANTE → DONO DO CLUBE

```
1. Visitante acessa /
2. Clica em "Criar meu clube"
3. Vai para /app/signup
4. Cria conta (User)
5. Cria um tenant (nome + slug)
6. Sistema associa User ↔ Tenant como OWNER
7. Redireciona para /t/[slug]/admin
```

### FLUXO B — LOGIN DO DONO DO CLUBE

```
1. Usuário acessa /app/login
2. Autenticação
3. Sistema verifica quantos tenants o usuário possui

- Se tiver 1 tenant:
    → redirecionar direto para /t/[slug]/admin

- Se tiver mais de 1 tenant:
    → redirecionar para /app/dashboard
```

### FLUXO C — /app/dashboard (HUB)

**Conteúdo mínimo do dashboard:**
- Lista de clubes do usuário
- Botão "Acessar admin" → `/t/[slug]/admin`
- Botão "Criar novo clube" → `/app/signup`
- Status do Stripe Connect (conectado / pendente)
- Plano do SaaS (Starter / Pro / Scale)

**NÃO ENTRA AQUI:**
- Assinantes
- Entregas
- Planos do clube
- Métricas operacionais

---

## 5. SOBRE ROTAS LEGADAS (TRANSIÇÃO)

### `/admin` (RAIZ)
- **NÃO** faz parte da arquitetura final
- É uma rota antiga, sem slug, não multi-tenant

**DECISÃO (transição inteligente):**
- `/admin` redireciona conforme contexto:
  - Usuário **não logado** → `/app/login`
  - Usuário logado com **1 tenant** → `/t/[slug]/admin`
  - Usuário logado com **múltiplos tenants** → `/app/dashboard`
  - Usuário **sem tenants** → `/app/dashboard`
  - Fallback (erro/sem contexto) → `/app/dashboard`
- **IMPORTANTE:** Nunca redireciona para um tenant específico como fallback
- Brewjaria é apenas um tenant, não um "default"
- Essa rota será **REMOVIDA** após a migração completa

**Nota técnica:**
- Redirect inteligente ocorre no browser (JavaScript)
- Para requests sem JS (curl/crawlers), middleware aplica fallback neutro `/app/dashboard`

### `/onboarding`
- Refere-se ao onboarding do **ASSINANTE FINAL**
- **NÃO** é onboarding do dono do clube

**DECISÃO:**
- Manter funcionando temporariamente
- Migrar futuramente para: `/t/[slug]/assinatura`

---

## 6. PRINCÍPIOS DE ARQUITETURA (REGRAS DO PROJETO)

1. Nenhum tenant é especial
2. Nenhum admin existe fora de `/t/[slug]`
3. `/app` é camada de **CONTA**, não de **OPERAÇÃO**
4. Tudo que é operacional pertence ao tenant
5. Brewjaria é apenas um tenant (piloto)
6. Nunca duplicar painel administrativo
7. Todo fluxo deve ser multi-tenant desde a URL

---

## 7. DECISÕES CONFIRMADAS

- [x] Marketing FAZUMCLUBE fica em `/`
- [x] Dono do clube entra por `/app/login`
- [x] Onboarding do dono fica em `/app/signup`
- [x] Admin real do clube fica em `/t/[slug]/admin`
- [x] `/app/dashboard` é apenas HUB
- [x] `/admin` (raiz) será removido após transição
- [x] Brewjaria não recebe tratamento especial

---

## 8. PRÓXIMOS PASSOS

1. [x] Implementar `/app/login` (funcional)
2. [x] Implementar `/app/signup` (criar tenant)
3. [x] Implementar `/app/dashboard` (HUB simples)
4. [x] Criar tenant `/t/demo` para demonstração
5. [x] Criar redirect de `/admin` → `/t/brewjaria/admin`
6. [x] Documentar este arquivo como regra oficial do projeto

### Melhorias Futuras

- [x] Conectar `/app/dashboard` com dados reais da API
- [x] Proteção de rotas `/app/*` (verificar autenticação)
- [ ] Stripe Connect no onboarding
- [ ] Remover pasta `admin.legacy` após validação

---

*Última atualização: 15 Janeiro 2026*

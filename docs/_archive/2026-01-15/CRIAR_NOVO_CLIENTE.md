# Guia: Criar Novo Cliente (Tenant)

> ⚠️ **DOCUMENTO RESUMIDO**  
> Este é um guia rápido. Para documentação completa e detalhada, consulte:  
> **[DOCS/TENANTS/CRIACAO_DE_TENANT.md](../DOCS/TENANTS/CRIACAO_DE_TENANT.md)** ← Fonte oficial

Este guia explica passo a passo como adicionar um novo cliente/marca ao sistema multi-tenant.

---

## Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Método Rápido (Script)](#2-método-rápido-script)
3. [Método Manual](#3-método-manual)
4. [Configurar o Tenant](#4-configurar-o-tenant)
5. [Escolher ou Criar Tema](#5-escolher-ou-criar-tema)
6. [Adicionar Assets](#6-adicionar-assets)
7. [Criar Tenant no Banco de Dados](#7-criar-tenant-no-banco-de-dados) ⚠️ **OBRIGATÓRIO**
8. [Registrar o Tenant no Frontend](#8-registrar-o-tenant-no-frontend)
9. [Testar](#9-testar)
10. [Configurar Domínio (Produção)](#10-configurar-domínio-produção)
11. [Checklist Final](#11-checklist-final)

---

## 1. Pré-requisitos

- Node.js 18+
- pnpm instalado
- Repositório clonado e dependências instaladas

```bash
cd ~/BREWJARIA
pnpm install
```

---

## 2. Método Rápido (Script)

O jeito mais fácil de criar um novo tenant:

```bash
# Da raiz do monorepo
pnpm tenant:new <slug>

# Exemplos:
pnpm tenant:new coffee-club
pnpm tenant:new pet-box
pnpm tenant:new book-club
pnpm tenant:new snack-box
```

O script cria automaticamente:
- ✅ Arquivo de configuração em `src/config/tenants/<slug>.ts`
- ✅ Pasta de assets em `public/tenants/<slug>/`
- ✅ Logo placeholder (SVG)

**Após executar o script, siga para o [passo 4](#4-configurar-o-tenant).**

---

## 3. Método Manual

Se preferir criar manualmente:

### 3.1 Copiar o Template

```bash
cp apps/web/src/config/tenants/_template.ts \
   apps/web/src/config/tenants/meu-cliente.ts
```

### 3.2 Criar Pasta de Assets

```bash
mkdir -p apps/web/public/tenants/meu-cliente
```

---

## 4. Configurar o Tenant

Abra o arquivo criado e substitua todos os valores:

### 4.1 Identificação

```typescript
export const meuClienteTenant: TenantConfig = {
  id: 'meu-cliente',           // ID único (sem espaços, lowercase)
  slug: 'meu-cliente',         // Usado na URL: /t/meu-cliente
  name: 'Meu Cliente',         // Nome de exibição
  
  domains: [                   // Domínios em produção (opcional)
    'meucliente.com.br',
    'www.meucliente.com.br',
  ],
```

### 4.2 Branding

```typescript
  logo: '/tenants/meu-cliente/logo.png',
  brandText: {
    line1: 'MEU',              // Primeira linha do logo texto
    line2: 'CLIENTE.',         // Segunda linha
  },
  tagline: 'Sua tagline aqui',
  description: 'Descrição completa para SEO',
```

### 4.3 Tema

```typescript
  // Escolha um tema existente ou crie um novo
  themeSlug: 'light-blue',     // Opções: light-blue, coffee, nature, wine, brewjaria-dark
```

### 4.4 Feature Flags

```typescript
  featureFlags: {
    showCarousel: false,       // Carrossel de imagens no hero
    showHowItWorks: true,      // Seção "Como Funciona"
    showFeatures: true,        // Seção "Por que escolher"
    enableSubscription: true,  // Habilita checkout
    enableLogin: true,         // Habilita login
  },
```

### 4.5 Hero (Seção Principal)

```typescript
  hero: {
    title: 'Título Principal Impactante',
    subtitle: 'Subtítulo explicando o valor do serviço em uma ou duas frases.',
    cta: 'Começar Agora',
    // images: ['/tenants/meu-cliente/hero-1.jpg'],  // Opcional
  },
```

### 4.6 Planos

```typescript
  plans: [
    {
      id: 'basico',
      name: 'Básico',
      price: 49.90,
      features: [
        'Benefício 1',
        'Benefício 2',
        'Benefício 3',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 99.90,
      originalPrice: 119.90,   // Preço riscado (opcional)
      highlighted: true,        // Destaca este plano
      badge: 'Mais Popular',    // Badge no topo
      features: [
        'Tudo do Básico',
        'Benefício extra 1',
        'Benefício extra 2',
        'Benefício extra 3',
      ],
    },
    {
      id: 'vip',
      name: 'VIP',
      price: 199.90,
      features: [
        'Tudo do Premium',
        'Benefício exclusivo 1',
        'Benefício exclusivo 2',
        'Atendimento prioritário',
      ],
    },
  ],
```

### 4.7 Seções de Conteúdo

```typescript
  sections: {
    features: {
      title: 'Por que nos escolher?',
      subtitle: 'Nossos diferenciais',
      items: [
        {
          icon: 'Star',           // Ícone do lucide-react
          title: 'Qualidade',
          description: 'Produtos selecionados com rigor',
        },
        {
          icon: 'Truck',
          title: 'Entrega Rápida',
          description: 'Receba em até 3 dias úteis',
        },
        {
          icon: 'Shield',
          title: 'Garantia',
          description: 'Satisfação garantida ou devolvemos',
        },
        {
          icon: 'Heart',
          title: 'Curadoria',
          description: 'Especialistas escolhem para você',
        },
      ],
    },
    howItWorks: {
      title: 'Como Funciona',
      steps: [
        {
          number: '01',
          title: 'Escolha seu plano',
          description: 'Selecione o plano ideal para você',
        },
        {
          number: '02',
          title: 'Receba em casa',
          description: 'Entregamos no conforto da sua casa',
        },
        {
          number: '03',
          title: 'Aproveite',
          description: 'Desfrute dos produtos selecionados',
        },
      ],
    },
  },
```

### 4.8 Contato e Legal

```typescript
  contact: {
    email: 'contato@meucliente.com.br',
    phone: '(11) 1234-5678',
    whatsapp: '5511912345678',
  },
  
  legal: {
    companyName: 'Meu Cliente Comércio Ltda',
    cnpj: '12.345.678/0001-90',
    address: 'Rua Exemplo, 123 - São Paulo, SP',
  },
```

### 4.9 SEO

```typescript
  seo: {
    title: 'Meu Cliente | Clube de Assinatura',
    description: 'Receba produtos selecionados todo mês. Assine agora!',
    keywords: ['assinatura', 'clube', 'produtos'],
  },
```

### 4.10 Checkout

```typescript
  subscription: {
    checkoutMode: 'link',      // 'link' ou 'embedded'
    checkoutUrl: '#pricing',   // URL padrão ou link Stripe
    ctaLabel: 'Assinar Agora',
    
    // URLs específicas por plano (Stripe)
    planCheckoutUrls: {
      'basico': 'https://checkout.stripe.com/pay/cs_xxx_basico',
      'premium': 'https://checkout.stripe.com/pay/cs_xxx_premium',
      'vip': 'https://checkout.stripe.com/pay/cs_xxx_vip',
    },
  },
}
```

---

## 5. Escolher ou Criar Tema

### Temas Disponíveis

| Slug | Modo | Cor Principal | Ideal para |
|------|------|---------------|------------|
| `light-blue` | Light | Azul | Genérico, tech |
| `coffee` | Dark | Marrom | Cafés, chocolates |
| `nature` | Light | Verde | Orgânicos, naturais |
| `wine` | Dark | Vinho | Vinhos, premium |
| `brewjaria-dark` | Dark | Dourado | Cervejas |

### Criar Tema Customizado

Se nenhum tema existente serve, crie um novo em `src/config/themes.ts`:

```typescript
// Adicione ao objeto THEMES:
'meu-tema': {
  name: 'Meu Tema',
  slug: 'meu-tema',
  mode: 'dark',  // ou 'light'
  tokens: {
    background: '#1A1A2E',      // Fundo principal
    foreground: '#EAEAEA',      // Texto principal
    muted: '#16213E',           // Fundo secundário
    mutedForeground: 'rgba(234,234,234,0.6)',
    card: '#0F3460',            // Fundo de cards
    cardForeground: '#EAEAEA',
    popover: '#0F3460',
    popoverForeground: '#EAEAEA',
    border: 'rgba(233,69,96,0.3)',
    input: 'rgba(233,69,96,0.2)',
    primary: '#E94560',         // COR PRINCIPAL (CTAs)
    primaryForeground: '#FFFFFF',
    secondary: '#16213E',
    secondaryForeground: '#E94560',
    accent: 'rgba(233,69,96,0.2)',
    accentForeground: '#E94560',
    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',
    ring: '#E94560',
    radius: '0.5rem',
  },
},
```

---

## 6. Adicionar Assets

### Logo

Adicione o logo em:
```
apps/web/public/tenants/meu-cliente/logo.png
```

**Especificações recomendadas:**
- Formato: PNG com transparência ou SVG
- Tamanho: 200x60px (ou proporcional)
- Fundo: Transparente

### Imagens do Hero (Opcional)

Se usar carrossel:
```
apps/web/public/tenants/meu-cliente/hero-1.jpg
apps/web/public/tenants/meu-cliente/hero-2.jpg
```

**Especificações:**
- Formato: JPG ou WebP
- Tamanho: 800x600px mínimo
- Otimizado para web

---

## 7. Criar Tenant no Banco de Dados

> ⚠️ **IMPORTANTE**: O tenant DEVE existir no banco para funcionar. O script `pnpm tenant:new` cria apenas a configuração visual.

### 7.1 Opção A: Via Script de Migração (Recomendado)

Edite `apps/api/prisma/migrate-tenants.ts`:

```typescript
const TENANTS_TO_CREATE = [
  // ... tenants existentes
  { slug: 'meu-cliente', name: 'Meu Cliente' },  // ← Adicionar
];
```

Execute:
```bash
cd apps/api
npx ts-node prisma/migrate-tenants.ts
```

### 7.2 Opção B: Via SQL Direto

```sql
INSERT INTO "Tenant" (id, name, slug, "createdAt", "updatedAt")
VALUES (
  'tenant_' || substr(md5(random()::text), 1, 12),
  'Meu Cliente',
  'meu-cliente',
  NOW(),
  NOW()
);
```

### 7.3 Verificar Criação

```sql
SELECT id, slug, name FROM "Tenant" WHERE slug = 'meu-cliente';
```

---

## 8. Registrar o Tenant no Frontend

Abra `apps/web/src/config/tenants.ts` e adicione:

### 8.1 Import (no topo do arquivo)

```typescript
// Importar tenants externos (criados via pnpm tenant:new)
import { coffeeClubTenant } from './tenants/coffee-club'
import { meuClienteTenant } from './tenants/meu-cliente'  // ← Adicionar
```

### 8.2 Registro (no objeto TENANTS)

```typescript
export const TENANTS: Record<string, TenantConfig> = {
  brewjaria,
  'template-light': templateLight,
  'wine-club': wineClub,
  'coffee-club': coffeeClubTenant,
  'meu-cliente': meuClienteTenant,  // ← Adicionar
}
```

---

## 9. Testar

### 9.1 Iniciar o Servidor

```bash
pnpm dev
```

### 9.2 Acessar o Tenant

```
http://localhost:3000/t/meu-cliente
```

### 9.3 Verificar

- [ ] Logo aparece corretamente
- [ ] Cores do tema estão aplicadas
- [ ] Hero mostra título e subtítulo corretos
- [ ] Planos aparecem com preços certos
- [ ] Seções Features e How It Works funcionam
- [ ] Footer mostra dados corretos
- [ ] Páginas /privacidade e /termos funcionam
- [ ] Fluxo de assinatura abre

### 9.4 Validar Configuração

```bash
# Verificar tipos
cd apps/web && pnpm type-check
```

---

## 10. Configurar Domínio (Produção)

### 10.1 Adicionar Domínio ao Tenant

```typescript
domains: [
  'meucliente.com.br',
  'www.meucliente.com.br',
],
```

### 10.2 Configurar DNS

Aponte o domínio para o servidor:

```
Tipo: A
Nome: @
Valor: <IP_DO_SERVIDOR>

Tipo: CNAME
Nome: www
Valor: meucliente.com.br
```

### 10.3 Configurar SSL

Se usando Vercel/Netlify, o SSL é automático.

Para outros hosts, configure Let's Encrypt ou similar.

---

## 11. Checklist Final

### Configuração

- [ ] `id` e `slug` únicos
- [ ] `name` correto
- [ ] `themeSlug` válido
- [ ] `brandText` preenchido
- [ ] `tagline` e `description` preenchidos
- [ ] `hero` com título, subtítulo e CTA
- [ ] Pelo menos 1 plano configurado
- [ ] `sections.features` com 4 itens
- [ ] `sections.howItWorks` com 3 steps
- [ ] `contact.email` válido
- [ ] `legal` com dados reais
- [ ] `seo` preenchido

### Assets

- [ ] Logo em `public/tenants/<slug>/logo.png`
- [ ] Imagens do hero (se usar carrossel)

### Banco de Dados

- [ ] Tenant criado no banco (`migrate-tenants.ts` ou SQL)
- [ ] Verificado com `SELECT * FROM "Tenant" WHERE slug = 'xxx'`

### Registro (Frontend)

- [ ] Import adicionado em `tenants.ts`
- [ ] Tenant registrado em `TENANTS`

### Testes

- [ ] Página carrega sem erros
- [ ] Tema aplicado corretamente
- [ ] Conteúdo exibido corretamente
- [ ] Links funcionam
- [ ] Responsivo (mobile)

### Produção

- [ ] Domínio configurado (se aplicável)
- [ ] SSL ativo
- [ ] Links de checkout Stripe configurados

---

## Exemplo Completo

Veja um exemplo funcional em:
```
apps/web/src/config/tenants/coffee-club.ts
```

Ou o tenant Wine Club inline em:
```
apps/web/src/config/tenants.ts (procure por wineClub)
```

---

## Troubleshooting

### Erro: "Tenant not found"

- Verifique se o tenant está registrado em `TENANTS`
- Verifique se o `slug` está correto na URL

### Erro: "Theme not found"

- Verifique se o `themeSlug` existe em `themes.ts`
- Use um tema existente ou crie um novo

### Cores erradas

- Verifique se está usando classes Tailwind corretas (`bg-background`, não `bg-black`)
- Verifique se o tema tem todos os tokens definidos

### Logo não aparece

- Verifique o caminho em `tenant.logo`
- Verifique se o arquivo existe em `public/tenants/<slug>/`

---

## Suporte

Para dúvidas ou problemas:
1. Consulte `docs/ARCHITECTURE.md`
2. Verifique `MULTI_TENANT_GUIDE.md`
3. Abra uma issue no repositório

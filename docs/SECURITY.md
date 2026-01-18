# Segurança — FAZUMCLUBE

> **Última atualização:** 16 Janeiro 2026

---

## Modelo de Autenticação e Autorização

### Autenticação (AuthN)
- **Método:** JWT (JSON Web Tokens)
- **Tokens:** Access Token (15min) + Refresh Token (30 dias)
- **Armazenamento:** localStorage no frontend
- **Validação:** `JwtAuthGuard` via Passport.js

### Autorização (AuthZ)
- **Método:** Guards em cadeia
- **Guards aplicados:**
  1. `JwtAuthGuard` — Valida token JWT
  2. `TenantGuard` — Valida que usuário pertence ao tenant
  3. `AdminGuard` — Valida role ADMIN/OWNER (onde aplicável)

---

## Modelo de Tenant Atual (1:1)

### Descrição
Cada usuário pertence a **exatamente um tenant**. O `tenantId` é armazenado no JWT.

### Estrutura do JWT Payload
```typescript
{
  sub: string;      // userId
  tenantId: string; // tenant do usuário
  role: string;     // CUSTOMER | ADMIN | OWNER
  iat: number;      // issued at
  exp: number;      // expiration
}
```

### Validação no TenantGuard
```typescript
// apps/api/src/auth/guards/tenant.guard.ts
if (user.tenantId !== request.tenant.id) {
  throw new ForbiddenException('Access denied to this tenant');
}
```

### Endpoints Protegidos
| Controller | Guards | Descrição |
|------------|--------|-----------|
| `AdminController` | JWT + Tenant + Admin | Operações admin do tenant |
| `UsersController` | JWT + Tenant | Perfil do usuário |
| `SubscriptionsController` | JWT + Tenant | Assinaturas do usuário |
| `TenantController` (CRUD) | JWT + Tenant | Settings e planos |

### Endpoints Públicos (sem tenant)
| Endpoint | Descrição |
|----------|-----------|
| `POST /auth/login` | Login plataforma |
| `POST /auth/register` | Registro plataforma |
| `POST /auth/refresh` | Renovar token |
| `POST /tenants/provision` | Criar tenant + owner |
| `GET /tenants/check-slug/:slug` | Verificar disponibilidade |
| `GET /tenants/my` | Listar meus tenants (requer JWT) |
| `GET /health` | Health check |

---

## Upgrade Path: Multi-Tenant por Usuário (N:N)

> **Status:** Documentado para implementação futura  
> **Quando:** Quando for necessário que 1 usuário gerencie múltiplos tenants

### Situação Atual (1:1)
```
User ──────────────── Tenant
     tenantId no User
     tenantId no JWT (fixo)
```

### Situação Futura (N:N)
```
User ──── UserTenant ──── Tenant
          role por vínculo
          tenant SELECIONADO no JWT
```

### Mudanças Necessárias

#### 1. Schema Prisma
```prisma
// NOVO: Tabela de vínculo
model UserTenant {
  id        String   @id @default(cuid())
  userId    String
  tenantId  String
  role      UserRole @default(CUSTOMER)
  createdAt DateTime @default(now())
  
  user   User   @relation(fields: [userId], references: [id])
  tenant Tenant @relation(fields: [tenantId], references: [id])
  
  @@unique([userId, tenantId])
  @@index([userId])
  @@index([tenantId])
}
```

#### 2. Geração de Token
```typescript
// auth.service.ts — FUTURO
async generateTokens(userId: string, selectedTenantId?: string) {
  const userTenants = await this.prisma.userTenant.findMany({
    where: { userId },
  });
  
  // Usar tenant selecionado ou primeiro disponível
  const tenantId = selectedTenantId || userTenants[0]?.tenantId;
  const role = userTenants.find(ut => ut.tenantId === tenantId)?.role;
  
  const payload = { sub: userId, tenantId, role };
  // ...
}
```

#### 3. Endpoint de Troca de Tenant
```typescript
// NOVO: POST /auth/switch-tenant
@Post('switch-tenant')
@UseGuards(JwtAuthGuard)
async switchTenant(@Req() req, @Body() dto: { tenantId: string }) {
  // Validar que usuário tem acesso ao tenant
  const hasAccess = await this.authService.userHasAccessToTenant(
    req.user.sub,
    dto.tenantId
  );
  if (!hasAccess) throw new ForbiddenException();
  
  // Gerar novo token com tenant selecionado
  return this.authService.generateTokens(req.user.sub, dto.tenantId);
}
```

#### 4. TenantGuard Atualizado
```typescript
// FUTURO: Validar via UserTenant, não via user.tenantId
async canActivate(context: ExecutionContext): Promise<boolean> {
  const user = request.user;
  const tenant = request.tenant;
  
  const hasAccess = await this.prisma.userTenant.findUnique({
    where: { userId_tenantId: { userId: user.sub, tenantId: tenant.id } },
  });
  
  if (!hasAccess) throw new ForbiddenException();
  return true;
}
```

### Migração de Dados
```sql
-- Criar vínculos a partir do tenantId atual
INSERT INTO "UserTenant" (id, "userId", "tenantId", role, "createdAt")
SELECT 
  gen_random_uuid(),
  id,
  "tenantId",
  role,
  NOW()
FROM "User"
WHERE "tenantId" IS NOT NULL;
```

---

## Checklist de Segurança

### Implementado ✅
- [x] JWT com expiração curta (15min)
- [x] Refresh token com expiração longa (30d)
- [x] Hash de senha com bcrypt (10 rounds)
- [x] TenantGuard em endpoints tenant-scoped
- [x] Bypass de tenant para rotas de plataforma
- [x] CORS configurado
- [x] Helmet para headers de segurança

### Pendente ⏳
- [ ] Rate limiting por IP/usuário
- [ ] Logs de auditoria (login, ações admin)
- [ ] 2FA (autenticação de dois fatores)
- [ ] Rotação de refresh tokens
- [ ] Blacklist de tokens revogados

---

## Arquivos Relevantes

| Arquivo | Descrição |
|---------|-----------|
| `apps/api/src/auth/auth.service.ts` | Geração de tokens |
| `apps/api/src/auth/strategies/jwt.strategy.ts` | Validação de JWT |
| `apps/api/src/auth/guards/jwt-auth.guard.ts` | Guard de autenticação |
| `apps/api/src/auth/guards/tenant.guard.ts` | Guard de autorização por tenant |
| `apps/api/src/admin/admin.guard.ts` | Guard de role admin |
| `apps/api/src/tenant/tenant.middleware.ts` | Resolução de tenant |
| `apps/api/src/tenant/tenant.module.ts` | Configuração de bypass |

---

*Documento de segurança do FAZUMCLUBE*

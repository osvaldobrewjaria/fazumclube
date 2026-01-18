# Bugs Conhecidos — FAZUMCLUBE

> **Última atualização:** 16 Janeiro 2026  
> **Ciclo de QA:** Manual completo

---

## Resumo

| ID | Severidade | Status | Título |
|----|------------|--------|--------|
| BUG-001 | 🟠 Médio | 🟢 Corrigido | `/app/login` falha por exigir tenant |
| BUG-002 | 🔴 Alto | 🟢 Corrigido | Sessão global permite acesso admin entre tenants |

---

## BUG-001 — `/app/login` falha por exigir tenant

### Severidade: 🟠 Médio (P0 — Bloqueador)

### Sintoma
Ao acessar `/app/login` e tentar fazer login, retorna erro:
```
Invalid tenant. Please provide X-Tenant header or use a valid domain.
```

### Impacto
- **Bloqueia** login do dono do clube (conta SaaS)
- Impede acesso ao `/app/dashboard`
- Quebra fluxo de retorno de usuários existentes

### Reprodução
1. Acessar `http://localhost:3000/app/login`
2. Preencher email e senha válidos
3. Clicar "Entrar"
4. **Resultado:** Erro "Invalid tenant..."

### Causa Provável
- Middleware do backend exige `X-Tenant` para **todas** as rotas
- Frontend está chamando `/auth/login` sem header `X-Tenant`
- Rotas `/app/*` deveriam ser **platform-level** (sem tenant)

### Arquivos Envolvidos
- `apps/api/src/tenant/tenant.middleware.ts` — Middleware que exige tenant
- `apps/web/src/lib/api.ts` — Interceptor que adiciona `X-Tenant`
- `apps/web/src/app/app/login/page.tsx` — Página de login

### Correção Esperada

**Opção A — Bypass no Middleware (Backend)**
```typescript
// apps/api/src/tenant/tenant.middleware.ts
const TENANT_EXEMPT_PATHS = [
  '/auth/login',      // Login plataforma
  '/auth/register',   // Registro plataforma  
  '/tenants/provision', // Criar tenant
  '/tenants/my',      // Listar meus tenants
  '/tenants/check-slug',
  '/health',
];

async use(req: Request, res: Response, next: NextFunction) {
  // Bypass para rotas de plataforma
  if (TENANT_EXEMPT_PATHS.some(path => req.path.startsWith(path))) {
    return next();
  }
  // ... resto do middleware
}
```

**Opção B — Separar Auth (Backend)**
- Criar `PlatformAuthController` para login/registro sem tenant
- Manter `TenantAuthController` para login de assinantes

### Critério de Aceitação
- [ ] `/app/login` funciona sem erro de tenant
- [ ] Login retorna tokens e redireciona para `/app/dashboard`
- [ ] `GET /tenants/my` funciona com token (sem `X-Tenant`)

---

## BUG-002 — Sessão global permite acesso admin entre tenants

### Severidade: 🔴 Alto (P0 — Bloqueador de Segurança)

### Sintoma
Usuário logado no Tenant A consegue acessar `/t/tenant-b/admin` sem autenticação adicional.

### Impacto
- **Risco de segurança** — acesso não autorizado a admin de outro tenant
- Quebra isolamento de **autorização** (dados estão isolados, mas acesso não)
- Confiança do produto comprometida

### Reprodução
1. Fazer login em `/t/clube-do-vinho/admin`
2. Em nova aba, acessar `/t/demo/admin`
3. **Resultado:** Admin do Demo abre sem pedir login

### Causa Provável
- Token JWT é **global** (não contém `tenantId`)
- Verificação de autorização não valida se usuário pertence ao tenant
- Cookie/localStorage compartilhado entre tenants

### Arquivos Envolvidos
- `apps/api/src/auth/auth.service.ts` — Geração de token
- `apps/api/src/auth/jwt.strategy.ts` — Validação de token
- `apps/web/src/stores/authStore.ts` — Store de autenticação
- `apps/web/src/app/t/[slug]/admin/*` — Páginas admin

### Correção Esperada

**1. Incluir `tenantId` no JWT (Backend)**
```typescript
// apps/api/src/auth/auth.service.ts
async generateTokens(user: User) {
  const payload = {
    sub: user.id,
    email: user.email,
    tenantId: user.tenantId, // ← ADICIONAR
    role: user.role,
  };
  // ...
}
```

**2. Validar tenant no Guard (Backend)**
```typescript
// apps/api/src/auth/guards/tenant.guard.ts (NOVO)
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tenant = request.tenant;
    
    // Usuário deve pertencer ao tenant da requisição
    if (user.tenantId !== tenant.id) {
      throw new ForbiddenException('Access denied to this tenant');
    }
    return true;
  }
}
```

**3. Aplicar Guard nas rotas admin (Backend)**
```typescript
// apps/api/src/admin/admin.controller.ts
@Controller('admin')
@UseGuards(JwtAuthGuard, TenantGuard) // ← ADICIONAR TenantGuard
export class AdminController {
  // ...
}
```

**4. Validar no Frontend (Opcional, defesa em profundidade)**
```typescript
// apps/web/src/app/t/[slug]/admin/layout.tsx
useEffect(() => {
  const userTenantId = user?.tenantId;
  const currentTenantId = tenant?.id;
  
  if (userTenantId && currentTenantId && userTenantId !== currentTenantId) {
    router.push(`/t/${slug}/login`);
  }
}, [user, tenant]);
```

### Critério de Aceitação
- [ ] Logado no Tenant A, acessar `/t/tenant-b/admin` redireciona para login
- [ ] Token JWT contém `tenantId`
- [ ] API retorna 403 se `user.tenantId !== request.tenant.id`
- [ ] Logout em um tenant não afeta sessão de outro tenant (se aplicável)

---

## Notas de Implementação

### Ordem de Correção Recomendada

1. **BUG-002 primeiro** — Segurança é prioridade máxima
2. **BUG-001 depois** — Desbloqueia fluxo do dono

### Testes de Regressão

Após correções, executar:

```bash
# BUG-001 — Login plataforma
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dono@teste.com","password":"senha123"}'
# Esperado: 200 OK com tokens

# BUG-002 — Acesso cruzado bloqueado
# 1. Login no tenant A, obter token
# 2. Tentar acessar admin do tenant B com mesmo token
curl http://localhost:3001/admin/stats \
  -H "Authorization: Bearer TOKEN_TENANT_A" \
  -H "X-Tenant: tenant-b"
# Esperado: 403 Forbidden
```

---

## Histórico

| Data | Bug | Ação |
|------|-----|------|
| 16/01/2026 | BUG-001 | Identificado no QA manual |
| 16/01/2026 | BUG-002 | Identificado no QA manual |
| 16/01/2026 | BUG-001 | ✅ Corrigido — Adicionado bypass de tenant para `/auth/*` no middleware |
| 16/01/2026 | BUG-002 | ✅ Corrigido — JWT inclui `tenantId`, criado `TenantGuard` |

---

## Correções Aplicadas

### BUG-001 — Correção
**Arquivo:** `apps/api/src/tenant/tenant.module.ts`

Adicionado bypass no middleware para rotas de autenticação:
```typescript
{ path: 'auth/login', method: RequestMethod.POST },
{ path: 'auth/register', method: RequestMethod.POST },
{ path: 'auth/refresh', method: RequestMethod.POST },
{ path: 'tenants/my', method: RequestMethod.GET },
```

### BUG-002 — Correção
**Arquivos modificados:**
- `apps/api/src/auth/auth.service.ts` — JWT agora inclui `tenantId` e `role`
- `apps/api/src/auth/strategies/jwt.strategy.ts` — Retorna dados completos no validate
- `apps/api/src/auth/guards/tenant.guard.ts` — **NOVO** — Valida se usuário pertence ao tenant
- `apps/api/src/admin/admin.controller.ts` — Aplicado `TenantGuard`

---

*Documento de bugs do FAZUMCLUBE*

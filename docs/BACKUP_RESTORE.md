# Backup e Restauração - Documentação Oficial

> **Atualizado**: 22/12/2025  
> **Estrutura**: Monorepo pnpm (apps/api + apps/web)

---

## 1. Componentes do Projeto

| Componente | Backup | Método |
|------------|--------|--------|
| Código-fonte | Git + GitHub | `git push` |
| Variáveis de ambiente | Manual | Cópia segura |
| Banco de dados | pg_dump | Dump SQL |
| node_modules, .next, dist | Não versionar | Regenerados via `pnpm install` |

---

## 2. Backup do Código (Git)

### 2.1 Repositório Oficial

```
https://github.com/osvaldobrewjaria/brewjaria.git
```

### 2.2 Sincronizar Alterações

```bash
cd ~/BREWJARIA

# 1. Verificar status
git status

# 2. Adicionar alterações
git add .

# 3. Commit
git commit -m "descrição das alterações"

# 4. Push
git push origin main
```

### 2.3 Restaurar Código (Clone Completo)

```bash
cd ~
git clone https://github.com/osvaldobrewjaria/brewjaria.git BREWJARIA
cd BREWJARIA
pnpm install
```

### 2.4 Restaurar Arquivo Específico

```bash
git checkout main -- caminho/do/arquivo
```

### 2.5 Voltar para Commit Anterior

```bash
# Ver histórico
git log --oneline -20

# Checkout temporário
git checkout <commit_hash>

# Voltar para main
git checkout main
```

---

## 3. Backup das Variáveis de Ambiente

### 3.1 Arquivos Sensíveis (NÃO vão para Git)

| Arquivo | Conteúdo |
|---------|----------|
| `apps/api/.env` | DATABASE_URL, JWT_SECRET, STRIPE_SECRET_KEY, etc |
| `apps/web/.env.local` | NEXT_PUBLIC_API_URL, NEXT_PUBLIC_STRIPE_PUBLIC_KEY |

### 3.2 Estrutura de Backup Local

```bash
# Criar pasta de backup
mkdir -p ~/brewjaria-backups/env

# Copiar arquivos
cp ~/BREWJARIA/apps/api/.env ~/brewjaria-backups/env/api.env
cp ~/BREWJARIA/apps/web/.env.local ~/brewjaria-backups/env/web.env.local
```

### 3.3 Restaurar Variáveis

```bash
cp ~/brewjaria-backups/env/api.env ~/BREWJARIA/apps/api/.env
cp ~/brewjaria-backups/env/web.env.local ~/BREWJARIA/apps/web/.env.local
```

### 3.4 Variáveis Necessárias

**Backend (`apps/api/.env`)**:
```env
DATABASE_URL=postgresql://user:pass@host:5432/brewjaria
JWT_SECRET=<32+ caracteres>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<32+ caracteres>
JWT_REFRESH_EXPIRES_IN=30d
STRIPE_SECRET_KEY=sk_live_xxx ou sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
WEB_URL=https://brewjaria.vercel.app
PORT=3001
NODE_ENV=production
# DEFAULT_TENANT_SLUG=brewjaria  # Apenas em dev!
```

**Frontend (`apps/web/.env.local`)**:
```env
NEXT_PUBLIC_API_URL=https://brewjaria-api.onrender.com
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_xxx ou pk_test_xxx
```

---

## 4. Backup do Banco de Dados

### 4.1 Criar Backup (pg_dump)

```bash
# Local
pg_dump -U postgres -d brewjaria > ~/brewjaria-backups/db/brewjaria_$(date +%Y%m%d).sql

# Remoto (Render/Railway)
pg_dump "postgresql://user:pass@host:5432/brewjaria" > ~/brewjaria-backups/db/brewjaria_$(date +%Y%m%d).sql
```

### 4.2 Restaurar Backup

```bash
# Criar banco se não existir
createdb -U postgres brewjaria

# Restaurar
psql -U postgres -d brewjaria < ~/brewjaria-backups/db/brewjaria_20251222.sql
```

### 4.3 Backup Automático (Cron)

```bash
# Editar crontab
crontab -e

# Adicionar (backup diário às 3h)
0 3 * * * pg_dump -U postgres -d brewjaria > ~/brewjaria-backups/db/brewjaria_$(date +\%Y\%m\%d).sql
```

---

## 5. O que NÃO Versionar

### 5.1 Arquivos Ignorados (.gitignore)

```
# Dependências (regenerados)
node_modules/
.pnpm-store/

# Build (regenerados)
.next/
dist/
.turbo/

# Sensíveis (backup manual)
.env
.env.local
.env.production

# IDE
.vscode/
.idea/

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db
```

### 5.2 Por que não versionar?

| Pasta/Arquivo | Motivo | Como regenerar |
|---------------|--------|----------------|
| `node_modules/` | ~500MB, regenerável | `pnpm install` |
| `.next/` | Build cache | `pnpm build` |
| `dist/` | Build output | `pnpm build` |
| `.env` | Dados sensíveis | Backup manual |

---

## 6. Snapshot Completo (Opcional)

### 6.1 Criar Snapshot

```bash
cd ~
tar -czvf brewjaria-snapshot-$(date +%Y%m%d).tar.gz \
  --exclude='BREWJARIA/node_modules' \
  --exclude='BREWJARIA/apps/*/node_modules' \
  --exclude='BREWJARIA/.next' \
  --exclude='BREWJARIA/apps/web/.next' \
  --exclude='BREWJARIA/apps/api/dist' \
  BREWJARIA
```

### 6.2 Restaurar Snapshot

```bash
cd ~
tar -xzvf brewjaria-snapshot-20251222.tar.gz
cd BREWJARIA
pnpm install
```

---

## 7. Restauração Completa (Servidor Limpo)

### 7.1 Pré-requisitos

```bash
# Node.js 18+
node -v

# pnpm 8+
npm install -g pnpm
pnpm -v

# PostgreSQL 14+
psql --version
```

### 7.2 Passo a Passo

```bash
# 1. Clonar repositório
cd ~
git clone https://github.com/osvaldobrewjaria/brewjaria.git BREWJARIA
cd BREWJARIA

# 2. Instalar dependências
pnpm install

# 3. Restaurar variáveis de ambiente
cp ~/brewjaria-backups/env/api.env apps/api/.env
cp ~/brewjaria-backups/env/web.env.local apps/web/.env.local

# 4. Criar banco de dados
createdb -U postgres brewjaria

# 5. Restaurar banco (se tiver backup)
psql -U postgres -d brewjaria < ~/brewjaria-backups/db/brewjaria_latest.sql

# OU rodar migrations + seed (banco novo)
cd apps/api
npx prisma migrate deploy
npx prisma db seed

# 6. Testar
cd ~/BREWJARIA
pnpm dev
```

### 7.3 Verificar Restauração

```bash
# Health check
curl http://localhost:3001/health

# Verificar tenants
psql -U postgres -d brewjaria -c "SELECT slug, name FROM \"Tenant\";"

# Verificar usuários
psql -U postgres -d brewjaria -c "SELECT COUNT(*) FROM \"User\";"
```

---

## 8. Estrutura de Backup Recomendada

```
~/brewjaria-backups/
├── env/
│   ├── api.env
│   └── web.env.local
├── db/
│   ├── brewjaria_20251220.sql
│   ├── brewjaria_20251221.sql
│   └── brewjaria_20251222.sql
└── snapshots/
    └── brewjaria-snapshot-20251222.tar.gz
```

---

## 9. Checklist de Backup

### Diário
- [ ] Commit e push do código
- [ ] Backup do banco (produção)

### Semanal
- [ ] Verificar integridade dos backups
- [ ] Limpar backups antigos (manter últimos 7 dias)

### Mensal
- [ ] Snapshot completo
- [ ] Testar restauração em ambiente de teste
- [ ] Atualizar documentação se necessário

---

## 10. Troubleshooting

### Erro: "relation does not exist"

**Causa**: Migrations não foram executadas.

**Solução**:
```bash
cd apps/api
npx prisma migrate deploy
```

### Erro: "permission denied"

**Causa**: Usuário PostgreSQL sem permissão.

**Solução**:
```bash
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE brewjaria TO seu_usuario;"
```

### Erro: "pnpm: command not found"

**Solução**:
```bash
npm install -g pnpm
```

### Backup muito grande

**Causa**: node_modules incluído.

**Solução**: Usar exclusões no tar (ver seção 6.1).

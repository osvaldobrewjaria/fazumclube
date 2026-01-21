# BACKUP RUNBOOK — ClubSaaS

> **Checklist rápido para incidentes e operações de backup/restore**

---

## 🚨 INCIDENTE: Servidor caiu / precisa restaurar

### 1. Verificar status atual

```bash
# SSH no servidor
ssh fazumclube@IP_DO_SERVIDOR

# Status dos serviços
sudo systemctl status clubsaas-api clubsaas-web

# Portas em uso
ss -lntp | grep -E ':3000|:3001'

# Logs de erro
journalctl -u clubsaas-api -n 50 --no-pager
journalctl -u clubsaas-web -n 50 --no-pager
```

### 2. Tentar reiniciar serviços

```bash
sudo systemctl restart clubsaas-api clubsaas-web
sleep 5
curl http://127.0.0.1:3001/health
curl -I http://127.0.0.1:3000
```

### 3. Se não resolver → Restore completo

Ver seção **RESTORE DO ZERO** abaixo.

---

## 📦 BACKUP RÁPIDO (antes de qualquer mudança)

```bash
# 1. Backup do banco
pg_dump clubesaas > ~/backups/db/backup_db_$(date +%F_%H%M).sql

# 2. Backup dos envs
cp ~/clubesaas/apps/api/.env ~/backups/config/api.env.$(date +%F)
cp ~/clubesaas/apps/web/.env.local ~/backups/config/web.env.$(date +%F)

# 3. Verificar
ls -la ~/backups/db/ | tail -3
ls -la ~/backups/config/ | tail -3
```

---

## 🔄 RESTORE DO ZERO (VPS limpa)

### Pré-requisitos

```bash
# Verificar Node.js v20
node -v

# Instalar pnpm se necessário
npm install -g pnpm

# Verificar PostgreSQL
sudo systemctl status postgresql
```

### Passo a passo

```bash
# 1. Clonar código
cd /home/fazumclube
git clone git@github.com:osvaldobrewjaria/fazumclube.git clubesaas
cd clubesaas

# 2. Instalar dependências
pnpm install

# 3. Restaurar envs
cp ~/backups/config/api.env ~/clubesaas/apps/api/.env
cp ~/backups/config/web.env.local ~/clubesaas/apps/web/.env.local

# 4. Restaurar banco
sudo -u postgres createdb clubesaas
psql -U clubesaas -d clubesaas < ~/backups/db/backup_db_YYYY-MM-DD.sql

# 5. Build
pnpm --filter @clubsaas/api prisma:generate
pnpm --filter @clubsaas/api build
pnpm --filter @clubsaas/web build

# 6. Restaurar services systemd
sudo cp ~/backups/config/clubsaas-api.service /etc/systemd/system/
sudo cp ~/backups/config/clubsaas-web.service /etc/systemd/system/
sudo cp ~/backups/config/clubsaas-api.env /etc/
sudo chmod 600 /etc/clubsaas-api.env
sudo systemctl daemon-reload

# 7. Iniciar
sudo systemctl enable --now clubsaas-api clubsaas-web

# 8. Validar
curl http://127.0.0.1:3001/health
curl -I http://127.0.0.1:3000
```

---

## 🚀 DEPLOY RÁPIDO

```bash
cd ~/clubesaas
git fetch origin && git reset --hard origin/main
pnpm install
pnpm --filter @clubsaas/api prisma:generate
pnpm --filter @clubsaas/api prisma:migrate:deploy
pnpm --filter @clubsaas/api build
pnpm --filter @clubsaas/web build
sudo systemctl restart clubsaas-api clubsaas-web
```

---

## 📁 ARQUIVOS CRÍTICOS

| Arquivo | Caminho |
|---------|---------|
| Service API | `/etc/systemd/system/clubsaas-api.service` |
| Service WEB | `/etc/systemd/system/clubsaas-web.service` |
| Env systemd | `/etc/clubsaas-api.env` |
| Env API | `~/clubesaas/apps/api/.env` |
| Env WEB | `~/clubesaas/apps/web/.env.local` |
| Código | `~/clubesaas/` |

---

## 🔍 COMANDOS DE DIAGNÓSTICO

```bash
# Status completo
sudo systemctl status clubsaas-api clubsaas-web

# Logs em tempo real
journalctl -u clubsaas-api -f
journalctl -u clubsaas-web -f

# Processos Node
ps aux | grep node

# Uso de disco
df -h

# Conexões do banco
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## ⚠️ PROBLEMAS COMUNS

| Problema | Solução |
|----------|---------|
| Porta em uso | `sudo kill -9 $(lsof -t -i:3001)` |
| Service não inicia | `journalctl -u clubsaas-api -n 100` |
| Banco não conecta | `sudo systemctl restart postgresql` |
| Permissão negada | `sudo chown -R fazumclube:fazumclube ~/clubesaas/` |

---

## 📞 CONTATOS

| Responsável | Contato |
|-------------|---------|
| Infraestrutura | [preencher] |
| Desenvolvimento | [preencher] |

---

**Documentação completa:** [INFRAESTRUTURA.md](./INFRAESTRUTURA.md)

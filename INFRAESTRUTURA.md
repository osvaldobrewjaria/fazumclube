# ClubSaaS — Documentação Oficial de Infraestrutura, Backup e Restore

> **Versão:** 1.0  
> **Atualizado:** 18/01/2026  
> **Status:** Documento definitivo e oficial

Este documento é a **base oficial do projeto ClubSaaS (FazUmClube)**. Descreve a infraestrutura real em VPS, modelo de serviços, estratégia de backup e procedimentos de restore.

---

## Índice

1. [Estrutura da Infraestrutura](#1-estrutura-da-infraestrutura)
2. [Modelo de Execução dos Serviços (systemd)](#2-modelo-de-execução-dos-serviços-systemd)
3. [Variáveis de Ambiente](#3-variáveis-de-ambiente)
4. [Modelo de Backup](#4-modelo-de-backup)
5. [Procedimento de Backup](#5-procedimento-de-backup)
6. [Procedimento de Restore](#6-procedimento-de-restore)
7. [Deploy Manual](#7-deploy-manual)
8. [Validação e Troubleshooting](#8-validação-e-troubleshooting)
9. [Checklist Operacional](#9-checklist-operacional)

---

## 1. Estrutura da Infraestrutura

### 1.1 Ambiente

| Item | Valor |
|------|-------|
| **Tipo** | VPS Linux (Ubuntu 22.04 LTS) |
| **Painel** | CloudPanel |
| **Usuário do sistema** | `fazumclube` |
| **Diretório base** | `/home/fazumclube/clubesaas` |
| **Node.js** | v20.x (via NodeSource) |
| **Gerenciador de pacotes** | pnpm |
| **Banco de dados** | PostgreSQL (local no VPS) |
| **SSL** | Cloudflare |
| **Proxy reverso** | Nginx (via CloudPanel) |

### 1.2 Estrutura de Diretórios

```
/home/fazumclube/clubesaas
├── apps/
│   ├── api/          # NestJS (Backend)
│   └── web/          # Next.js (Frontend)
├── node_modules/
├── package.json
├── pnpm-lock.yaml
└── pnpm-workspace.yaml
```

### 1.3 Portas

| Serviço | Porta | Acesso externo |
|---------|-------|----------------|
| **API (NestJS)** | 3001 | https://api.fazumclube.com.br |
| **WEB (Next.js)** | 3000 | https://fazumclube.com.br |
| **PostgreSQL** | 5432 | Apenas localhost |

### 1.4 Fluxo de Rede

```
Internet
    │
    ▼
Cloudflare (SSL)
    │
    ▼
Nginx (CloudPanel)
    ├── fazumclube.com.br     → 127.0.0.1:3000 (WEB)
    └── api.fazumclube.com.br → 127.0.0.1:3001 (API)
```

---

## 2. Modelo de Execução dos Serviços (systemd)

### 2.1 Decisão Arquitetural

| Decisão | Justificativa |
|---------|---------------|
| ❌ Não usamos PM2 | Adiciona camada desnecessária; systemd é nativo e suficiente |
| ❌ Não usamos scripts versionados | Menos abstração, restore mais simples |
| ✅ Services vivem no systemd | Maior previsibilidade, controle nativo do SO |
| ✅ EnvironmentFile separado | Segurança: variáveis sensíveis fora do service |

### 2.2 Serviço da API (NestJS)

**Arquivo:** `/etc/systemd/system/clubsaas-api.service`

```ini
[Unit]
Description=ClubSaaS API (NestJS)
After=network.target

[Service]
Type=simple
User=fazumclube
WorkingDirectory=/home/fazumclube/clubesaas/apps/api
EnvironmentFile=/etc/clubsaas-api.env
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=3
KillMode=control-group

[Install]
WantedBy=multi-user.target
```

**Explicação dos parâmetros:**

| Parâmetro | Função |
|-----------|--------|
| `WorkingDirectory` | Diretório onde o pnpm será executado |
| `EnvironmentFile` | Arquivo externo com variáveis sensíveis |
| `ExecStart` | Comando para iniciar o serviço |
| `Restart=always` | Reinicia automaticamente em caso de falha |
| `RestartSec=3` | Aguarda 3 segundos antes de reiniciar |
| `KillMode=control-group` | Mata todos os processos filhos ao parar |

### 2.3 Serviço do WEB (Next.js)

**Arquivo:** `/etc/systemd/system/clubsaas-web.service`

```ini
[Unit]
Description=ClubSaaS Web (Next.js)
After=network.target

[Service]
Type=simple
User=fazumclube
WorkingDirectory=/home/fazumclube/clubesaas/apps/web
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/pnpm start
Restart=on-failure
RestartSec=3
KillMode=control-group

[Install]
WantedBy=multi-user.target
```

### 2.4 Comandos de Gerenciamento

```bash
# Recarregar configurações do systemd
sudo systemctl daemon-reload

# Habilitar serviços para iniciar no boot
sudo systemctl enable clubsaas-api clubsaas-web

# Iniciar serviços
sudo systemctl start clubsaas-api clubsaas-web

# Parar serviços
sudo systemctl stop clubsaas-api clubsaas-web

# Reiniciar serviços
sudo systemctl restart clubsaas-api clubsaas-web

# Verificar status
sudo systemctl status clubsaas-api clubsaas-web

# Ver logs em tempo real
journalctl -u clubsaas-api -f
journalctl -u clubsaas-web -f

# Ver últimas 100 linhas de log
journalctl -u clubsaas-api -n 100
```

---

## 3. Variáveis de Ambiente

### 3.1 Separação de Responsabilidades

| Arquivo | Propósito | Quem usa |
|---------|-----------|----------|
| `/etc/clubsaas-api.env` | Variáveis do systemd (NODE_ENV, PORT) | Service systemd |
| `apps/api/.env` | Variáveis da aplicação (DATABASE_URL, JWT, Stripe) | Aplicação NestJS |
| `apps/web/.env.local` | Variáveis do frontend (URLs públicas) | Aplicação Next.js |

### 3.2 Arquivo do systemd

**Arquivo:** `/etc/clubsaas-api.env`

```env
NODE_ENV=production
PORT=3001
```

**Permissões obrigatórias:**

```bash
sudo chown root:root /etc/clubsaas-api.env
sudo chmod 600 /etc/clubsaas-api.env
```

> **Segurança:** Arquivo legível apenas pelo root. O systemd carrega as variáveis antes de trocar para o usuário `fazumclube`.

### 3.3 Variáveis da API

**Arquivo:** `/home/fazumclube/clubesaas/apps/api/.env`

```env
DATABASE_URL=postgresql://clubesaas:SENHA_FORTE@localhost:5432/clubesaas
JWT_SECRET=<chave_secreta_32_caracteres_minimo>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<outra_chave_secreta_32_caracteres>
JWT_REFRESH_EXPIRES_IN=30d
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
WEB_URL=https://fazumclube.com.br
PORT=3001
```

**Gerar chaves seguras:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3.4 Variáveis do WEB

**Arquivo:** `/home/fazumclube/clubesaas/apps/web/.env.local`

```env
NEXT_PUBLIC_API_URL=https://api.fazumclube.com.br
NEXT_PUBLIC_APP_URL=https://fazumclube.com.br
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_xxx
```

### 3.5 Validar Carregamento

```bash
# Verificar se o processo está usando as variáveis corretas
sudo systemctl show clubsaas-api --property=Environment
sudo systemctl show clubsaas-api --property=EnvironmentFiles

# Verificar porta em uso
ss -lntp | grep -E ':3000|:3001'
```

---

## 4. Modelo de Backup

### 4.1 O que DEVE ser incluído no backup

| Item | Caminho | Motivo |
|------|---------|--------|
| **Código fonte** | `/home/fazumclube/clubesaas` | Aplicação completa |
| **Service API** | `/etc/systemd/system/clubsaas-api.service` | Configuração do serviço |
| **Service WEB** | `/etc/systemd/system/clubsaas-web.service` | Configuração do serviço |
| **Env systemd** | `/etc/clubsaas-api.env` | Variáveis do service |
| **Env API** | `apps/api/.env` | Variáveis da aplicação |
| **Env WEB** | `apps/web/.env.local` | Variáveis do frontend |
| **Banco de dados** | Dump PostgreSQL | Dados persistentes |

### 4.2 O que NÃO deve ser incluído

| Item | Motivo |
|------|--------|
| `node_modules/` | Regenerado via `pnpm install` |
| `.next/` | Regenerado via `pnpm build` |
| `dist/` | Regenerado via `pnpm build` |
| `.pnpm-store/` | Cache do pnpm |
| Logs temporários | Não essenciais |
| Processos em runtime | Estado volátil |

### 4.3 Resumo dos Arquivos Críticos

```
# Arquivos obrigatórios para restore completo:

/home/fazumclube/clubesaas/                    # Código (ou GitHub)
/etc/systemd/system/clubsaas-api.service       # Service API
/etc/systemd/system/clubsaas-web.service       # Service WEB
/etc/clubsaas-api.env                          # Env do systemd
/home/fazumclube/clubesaas/apps/api/.env       # Env da API
/home/fazumclube/clubesaas/apps/web/.env.local # Env do WEB
backup_db_YYYY-MM-DD.sql                       # Dump do banco
```

---

## 5. Procedimento de Backup

### 5.1 Backup do Banco de Dados

```bash
# Criar diretório de backups
mkdir -p ~/backups/db

# Executar backup
pg_dump clubesaas > ~/backups/db/backup_db_$(date +%F).sql

# Verificar integridade (tamanho > 0)
ls -lh ~/backups/db/
```

### 5.2 Backup dos Arquivos de Configuração

```bash
# Criar diretório
mkdir -p ~/backups/config

# Copiar services
sudo cp /etc/systemd/system/clubsaas-api.service ~/backups/config/
sudo cp /etc/systemd/system/clubsaas-web.service ~/backups/config/

# Copiar env do systemd
sudo cp /etc/clubsaas-api.env ~/backups/config/

# Copiar envs da aplicação
cp ~/clubesaas/apps/api/.env ~/backups/config/api.env
cp ~/clubesaas/apps/web/.env.local ~/backups/config/web.env.local

# Ajustar permissões
sudo chown -R fazumclube:fazumclube ~/backups/
```

### 5.3 Backup do Código (via GitHub)

O código é versionado no GitHub. Para backup adicional:

```bash
# Verificar se está sincronizado
cd ~/clubesaas
git status
git log --oneline -n 3

# Se houver alterações locais não commitadas (não deveria haver)
# O VPS nunca faz commit, apenas pull
```

### 5.4 Backup Completo (Snapshot)

```bash
# Parar serviços (opcional, para consistência)
sudo systemctl stop clubsaas-api clubsaas-web

# Criar snapshot
cd ~
tar -czvf backup_full_$(date +%F).tar.gz \
  --exclude='clubesaas/node_modules' \
  --exclude='clubesaas/apps/*/node_modules' \
  --exclude='clubesaas/apps/web/.next' \
  --exclude='clubesaas/apps/api/dist' \
  clubesaas \
  backups/

# Reiniciar serviços
sudo systemctl start clubsaas-api clubsaas-web
```

### 5.5 Rotina de Backup Recomendada

| Frequência | Ação |
|------------|------|
| **Diário** | Backup do banco de dados |
| **Semanal** | Backup dos arquivos de configuração |
| **Antes de deploy** | Backup completo (banco + config) |
| **Mensal** | Snapshot completo + teste de restore |

---

## 6. Procedimento de Restore

### 6.1 Pré-requisitos (VPS Limpa)

```bash
# 1. Verificar Node.js
node -v  # Deve ser v20.x

# 2. Instalar pnpm se necessário
npm install -g pnpm
pnpm -v

# 3. Verificar PostgreSQL
psql --version
sudo systemctl status postgresql
```

### 6.2 Restore do Código

**Opção A: Via GitHub (recomendado)**

```bash
cd /home/fazumclube
git clone git@github.com:osvaldobrewjaria/fazumclube.git clubesaas
cd clubesaas
git checkout main
```

**Opção B: Via backup local**

```bash
cd /home/fazumclube
tar -xzvf backup_full_YYYY-MM-DD.tar.gz
```

### 6.3 Restore das Dependências

```bash
cd /home/fazumclube/clubesaas
pnpm install
```

### 6.4 Restore das Variáveis de Ambiente

```bash
# Restaurar env da API
cp ~/backups/config/api.env ~/clubesaas/apps/api/.env

# Restaurar env do WEB
cp ~/backups/config/web.env.local ~/clubesaas/apps/web/.env.local
```

### 6.5 Restore do Banco de Dados

```bash
# Criar banco se não existir
sudo -u postgres createdb clubesaas

# Criar usuário se não existir
sudo -u postgres psql -c "CREATE USER clubesaas WITH ENCRYPTED PASSWORD 'SENHA_FORTE';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE clubesaas TO clubesaas;"
sudo -u postgres psql -c "ALTER USER clubesaas CREATEDB;"

# Restaurar dados
psql -U clubesaas -d clubesaas < ~/backups/db/backup_db_YYYY-MM-DD.sql
```

### 6.6 Restore dos Services systemd

```bash
# Copiar services
sudo cp ~/backups/config/clubsaas-api.service /etc/systemd/system/
sudo cp ~/backups/config/clubsaas-web.service /etc/systemd/system/

# Copiar env do systemd
sudo cp ~/backups/config/clubsaas-api.env /etc/
sudo chown root:root /etc/clubsaas-api.env
sudo chmod 600 /etc/clubsaas-api.env

# Recarregar systemd
sudo systemctl daemon-reload
```

### 6.7 Build das Aplicações

```bash
cd ~/clubesaas

# Gerar cliente Prisma
pnpm --filter @clubsaas/api prisma:generate

# Build da API
pnpm --filter @clubsaas/api build

# Build do WEB
pnpm --filter @clubsaas/web build
```

### 6.8 Iniciar Serviços

```bash
# Habilitar e iniciar
sudo systemctl enable clubsaas-api clubsaas-web
sudo systemctl start clubsaas-api clubsaas-web

# Verificar status
sudo systemctl status clubsaas-api clubsaas-web
```

### 6.9 Validação Final

```bash
# Aguardar inicialização
sleep 5

# Health check API
curl http://127.0.0.1:3001/health

# Health check WEB
curl -I http://127.0.0.1:3000

# Verificar portas
ss -lntp | grep -E ':3000|:3001'

# Verificar logs
journalctl -u clubsaas-api -n 20
journalctl -u clubsaas-web -n 20
```

---

## 7. Deploy Manual

### 7.1 Procedimento Padrão

```bash
cd ~/clubesaas

# 1. Sincronizar código do GitHub
git fetch origin
git reset --hard origin/main

# 2. Instalar dependências
pnpm install

# 3. Gerar cliente Prisma
pnpm --filter @clubsaas/api prisma:generate

# 4. Aplicar migrations (produção)
pnpm --filter @clubsaas/api prisma:migrate:deploy

# 5. Build da API
pnpm --filter @clubsaas/api build

# 6. Build do WEB
pnpm --filter @clubsaas/web build

# 7. Reiniciar serviços
sudo systemctl restart clubsaas-api clubsaas-web

# 8. Validar
curl http://127.0.0.1:3001/health
curl -I http://127.0.0.1:3000
```

### 7.2 Ordem Crítica

1. **git reset** — Sincroniza código
2. **pnpm install** — Atualiza dependências
3. **prisma:generate** — Gera cliente do banco
4. **prisma:migrate:deploy** — Aplica migrations pendentes
5. **build api** — Compila backend
6. **build web** — Compila frontend
7. **restart services** — Aplica mudanças

> ⚠️ **Importante:** Nunca pule o `prisma:migrate:deploy` em produção.

---

## 8. Validação e Troubleshooting

### 8.1 Comandos de Validação

```bash
# Status dos serviços
sudo systemctl status clubsaas-api clubsaas-web

# Portas em uso
ss -lntp | grep -E ':3000|:3001'

# Health checks
curl http://127.0.0.1:3001/health
curl -I http://127.0.0.1:3000

# Logs recentes
journalctl -u clubsaas-api -n 50
journalctl -u clubsaas-web -n 50

# Verificar processos
ps aux | grep -E 'node|pnpm'
```

### 8.2 Problemas Comuns

#### Porta já em uso

```bash
# Identificar processo
ss -lntp | grep :3001
# ou
lsof -i :3001

# Matar processo órfão
sudo kill -9 <PID>

# Reiniciar serviço
sudo systemctl restart clubsaas-api
```

#### Serviço não inicia

```bash
# Ver erro detalhado
journalctl -u clubsaas-api -n 100 --no-pager

# Verificar sintaxe do service
sudo systemd-analyze verify /etc/systemd/system/clubsaas-api.service
```

#### Erro de permissão

```bash
# Verificar dono dos arquivos
ls -la ~/clubesaas/apps/api/

# Corrigir se necessário
sudo chown -R fazumclube:fazumclube ~/clubesaas/
```

#### Banco não conecta

```bash
# Testar conexão
psql -U clubesaas -d clubesaas -c "SELECT 1;"

# Verificar PostgreSQL
sudo systemctl status postgresql
```

---

## 9. Checklist Operacional

### 9.1 Antes de Deploy

- [ ] Backup do banco de dados
- [ ] Backup dos arquivos .env
- [ ] Verificar status atual dos serviços
- [ ] Verificar espaço em disco

### 9.2 Após Deploy

- [ ] Health check API respondendo
- [ ] Health check WEB respondendo
- [ ] Logs sem erros críticos
- [ ] Testar funcionalidade principal

### 9.3 Verificação Semanal

- [ ] Backup do banco executado
- [ ] Backups antigos limpos (manter últimos 7)
- [ ] Espaço em disco adequado
- [ ] Logs sem erros recorrentes

### 9.4 Verificação Mensal

- [ ] Teste de restore em ambiente isolado
- [ ] Atualização de dependências (se necessário)
- [ ] Revisão de segurança
- [ ] Documentação atualizada

---

## Histórico de Alterações

| Data | Versão | Descrição |
|------|--------|-----------|
| 18/01/2026 | 1.0 | Documento inicial — modelo oficial VPS |

---

**Este documento é a fonte oficial da infraestrutura ClubSaaS.**

Se você sair do projeto hoje, qualquer pessoa consegue restaurar tudo apenas lendo esta documentação.

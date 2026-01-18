# BREWJARIA — Guia Completo de Backup e Restauração

Este guia descreve **todas as práticas recomendadas** para realizar backup e restauração segura do projeto Brewjaria. O objetivo é garantir que, em qualquer cenário, seja possível recuperar o estado completo do sistema com segurança, eficiência e sem perda de dados.

---

# 📌 1. COMPONENTES DO PROJETO

O projeto Brewjaria é composto por:

- **Código-fonte** (frontend, backend, scripts, configurações)
- **Dependências** gerenciadas por pnpm
- **Variáveis de ambiente (.env)**
- **Banco de dados PostgreSQL**
- **Arquivos gerados automaticamente** (node_modules, .next, dist)

Cada componente exige um método de backup/restauração diferente.

---

# 🟩 2. BACKUP DO CÓDIGO (GIT + GITHUB) — Método Oficial

Este é o backup principal do Brewjaria. Ele inclui:

Todo o código-fonte

Estrutura completa do monorepo

Configurações de frontend e backend

Arquivos Markdown importantes (README, ROADMAP, CHECKLIST, SETUP, etc.)

✔️ Como atualizar o backup (sincronizar alterações)

Todos os comandos abaixo devem ser executados na pasta brewjaria-clean.

1️⃣ Sincronizar com o repositório remoto (obrigatório)

Antes de qualquer backup, garanta que sua cópia local esteja alinhada com o GitHub:

git pull --rebase origin main

2️⃣ Verificar alterações locais

Confira se existem arquivos modificados, novos ou removidos:

git status

3️⃣ Atualizar o backup (quando houver alterações)

Se houver mudanças no projeto, execute:
git add .
git commit -m "descrição das alterações"
git push origin main

O GitHub receberá um novo snapshot do projeto.

### Restauração completa:
```
rm -rf BREWJARIA
cd ~
git clone https://github.com/osvaldobrewjaria/brewjaria.git BREWJARIA
cd BREWJARIA
pnpm install
```

### Restauração de arquivo específico:
```
git checkout main -- caminho/do/arquivo
```

### Restauração de commit anterior:
```
git log --oneline
git checkout <commit>
```

---

# 🟦 3. BACKUP DAS VARIÁVEIS DE AMBIENTE (.env)

Os arquivos `.env` **não vão para o GitHub**, pois contêm dados sensíveis:

- STRIPE_SECRET_KEY
- JWT_SECRET
- DATABASE_URL
- STRIPE_WEBHOOK_SECRET
- API URLs

Esses arquivos são **essenciais para rodar o projeto** e devem ser salvos manualmente.

## ✔️ Onde armazenar
Crie uma estrutura segura local:

```
~/brewjaria-backups/env/
```

E salve:

```
apps/api/.env
apps/web/.env.local
```

## ✔️ Como restaurar
Copie novamente para:

```
BREWJARIA/apps/api/.env
BREWJARIA/apps/web/.env.local
```

---

# 🟧 4. BACKUP DO BANCO DE DADOS (PostgreSQL)

Assim que o PostgreSQL estiver configurado, o backup deve ser feito regularmente.

## ✔️ Criar backup do banco
```
pg_dump -U postgres -d brewjaria > backup_brewjaria.sql
```

## ✔️ Restaurar backup
```
psql -U postgres -d brewjaria < backup_brewjaria.sql
```

Recomenda-se salvar o arquivo `.sql` em:
```
~/brewjaria-backups/db/
```

---

# 🟥 5. ARQUIVOS QUE NÃO DEVEM IR PARA O GITHUB (E POR QUÊ)

Os seguintes arquivos são ignorados pelo `.gitignore`:

### ❌ Não essenciais (regerados automaticamente)
- `node_modules/`
- `.next/`
- `dist/`
- `.turbo/`
- `.pnpm-store/`

São reconstruídos via:
```
pnpm install
pnpm build
```

### ❌ Sensíveis (NUNCA podem ir para GitHub)
- `.env`
- `.env.local`

Devem ser salvos apenas em backup local.

### ❌ Lixo / arquivos da máquina
- `.vscode/`
- `.idea/`
- `*.log`
- `Thumbs.db`

---

# 🟨 6. SNAPSHOT COMPLETO DO PROJETO (Opcional, recomendado)

Cria um arquivo único com todo o projeto.

```
cd ~
tar -czvf brewjaria-full-backup.tar.gz BREWJARIA
```

Restaurar:
```
tar -xzvf brewjaria-full-backup.tar.gz
```

---

# 🟩 7. FLUXO COMPLETO DE RESTAURAÇÃO

### ✔️ 1. Restaurar código (GitHub)
```
git clone https://github.com/osvaldobrewjaria/brewjaria.git
pnpm install
```

### ✔️ 2. Restaurar dependências
```
pnpm install
```

### ✔️ 3. Restaurar variáveis de ambiente
Copiar novamente `.env` e `.env.local`.

### ✔️ 4. Restaurar banco de dados
```
psql -U postgres -d brewjaria < backup_brewjaria.sql
```

### ✔️ 5. Rodar projeto
```
pnpm dev
```

---

# 🟦 8. BOAS PRÁTICAS DE BACKUP

- Nunca versionar `.env` no GitHub
- Criar commits pequenos e frequentes
- Salvar backup do banco após mudanças estruturais
- Manter uma pasta `~/brewjaria-backups/`
- Criar `restore-points` periódicos:

```
git checkout -b restore-points
git add .
git commit -m "restore point - data X"
git push
```

---

# 🟩 9. O QUE ESTÁ COBERTO COM ESSE GUIA

✔️ Código 100% seguro no GitHub
✔️ Ambiente preparado para salvar .env
✔️ Orientação para backup do banco
✔️ Método oficial de restauração
✔️ Fluxo recomendado para desenvolvimento
✔️ Estrutura profissional para um projeto SaaS

---

# 🎯 CONCLUSÃO

Com esse guia, seu projeto Brewjaria agora possui uma base sólida para:

- Backup seguro
- Restauração confiável
- Evolução contínua do sistema
- Ponto de recuperação a qualquer momento

Se quiser, posso gerar também um **script automático de backup** para rodar sempre que quiser.

Basta pedir:

👉 "Criar script de backup automático"


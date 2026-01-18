#!/usr/bin/env node

/**
 * Script para criar novo tenant
 * 
 * Uso:
 *   pnpm tenant:new <slug>
 * 
 * Exemplo:
 *   pnpm tenant:new coffee-club
 */

const fs = require('fs')
const path = require('path')

const TEMPLATE_PATH = path.join(__dirname, '../src/config/tenants/_template.ts')
const TENANTS_DIR = path.join(__dirname, '../src/config/tenants')
const PUBLIC_TENANTS_DIR = path.join(__dirname, '../public/tenants')

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function toPascalCase(slug) {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

function createTenant(slug) {
  const normalizedSlug = slugify(slug)
  const pascalName = toPascalCase(normalizedSlug)
  
  console.log(`\n🚀 Criando tenant: ${normalizedSlug}\n`)
  
  // 1. Verificar se já existe
  const tenantFile = path.join(TENANTS_DIR, `${normalizedSlug}.ts`)
  if (fs.existsSync(tenantFile)) {
    console.error(`❌ Erro: Tenant "${normalizedSlug}" já existe em ${tenantFile}`)
    process.exit(1)
  }
  
  // 2. Ler template
  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error(`❌ Erro: Template não encontrado em ${TEMPLATE_PATH}`)
    process.exit(1)
  }
  
  let template = fs.readFileSync(TEMPLATE_PATH, 'utf-8')
  
  // 3. Substituir placeholders básicos
  const varName = pascalName.charAt(0).toLowerCase() + pascalName.slice(1)
  template = template
    .replace(/templateTenant/g, `${varName}Tenant`)
    .replace(/\[SUBSTITUIR\]/g, normalizedSlug)
    .replace(/\[SLUG\]/g, normalizedSlug)
    .replace(/\[LINHA1\]/g, pascalName.toUpperCase().slice(0, Math.ceil(pascalName.length / 2)))
    .replace(/\[LINHA2\]/g, pascalName.toUpperCase().slice(Math.ceil(pascalName.length / 2)) + '.')
  
  // 4. Criar arquivo do tenant
  fs.writeFileSync(tenantFile, template)
  console.log(`✅ Criado: ${tenantFile}`)
  
  // 5. Criar pasta de assets
  const assetsDir = path.join(PUBLIC_TENANTS_DIR, normalizedSlug)
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true })
    console.log(`✅ Criado: ${assetsDir}/`)
  }
  
  // 6. Criar logo placeholder (SVG simples)
  const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60">
  <rect width="200" height="60" fill="#1a1a1a"/>
  <text x="100" y="35" text-anchor="middle" fill="#f2c94c" font-family="Arial" font-size="16" font-weight="bold">${pascalName.toUpperCase()}</text>
</svg>`
  
  const svgPath = path.join(assetsDir, 'logo.svg')
  fs.writeFileSync(svgPath, placeholderSvg)
  console.log(`✅ Criado: ${svgPath} (placeholder)`)
  
  // 7. Instruções finais
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Tenant "${normalizedSlug}" criado com sucesso!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Próximos passos:

1. Edite o arquivo de configuração:
   ${tenantFile}

2. Substitua os valores marcados com [SUBSTITUIR]

3. Registre o tenant em src/config/tenants.ts:
   import { ${varName}Tenant } from './tenants/${normalizedSlug}'
   
   export const TENANTS = {
     ...
     '${normalizedSlug}': ${varName}Tenant,
   }

4. Adicione um logo real em:
   ${assetsDir}/logo.png

5. (Opcional) Crie um tema customizado em src/config/themes.ts

6. Teste em:
   http://localhost:3000/t/${normalizedSlug}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
}

// Main
const args = process.argv.slice(2)
if (args.length === 0) {
  console.log(`
Uso: pnpm tenant:new <slug>

Exemplo:
  pnpm tenant:new coffee-club
  pnpm tenant:new pet-box
  pnpm tenant:new book-club
`)
  process.exit(1)
}

createTenant(args[0])

-- ============================================
-- SCRIPT DE CORREÇÃO PARA PRODUÇÃO
-- Problema: tenant 'brew' precisa ser 'brewjaria'
-- ============================================

-- 1. Verificar estado atual
SELECT id, slug, name FROM "Tenant" WHERE slug IN ('brew', 'brewjaria');

-- 2. Renomear brew → brewjaria (APENAS SE brew existir e brewjaria NÃO existir)
UPDATE "Tenant" 
SET slug = 'brewjaria' 
WHERE slug = 'brew' 
  AND NOT EXISTS (SELECT 1 FROM "Tenant" WHERE slug = 'brewjaria');

-- 3. Verificar resultado
SELECT id, slug, name FROM "Tenant" ORDER BY slug;

-- 4. Verificar usuários afetados
SELECT 
  u.email,
  t.slug as tenant_slug
FROM "User" u
JOIN "Tenant" t ON t.id = u."tenantId"
WHERE u.email = 'osvaldo@valuehost.com.br';

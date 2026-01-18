-- Migration: Adicionar tenantId em Payment e Delivery
-- Executar ANTES da migration do Prisma para preencher dados existentes

-- 1. Adicionar coluna tenantId (nullable temporariamente)
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "Delivery" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;

-- 2. Preencher tenantId a partir da Subscription
UPDATE "Payment" p
SET "tenantId" = s."tenantId"
FROM "Subscription" s
WHERE p."subscriptionId" = s."id"
AND p."tenantId" IS NULL;

UPDATE "Delivery" d
SET "tenantId" = s."tenantId"
FROM "Subscription" s
WHERE d."subscriptionId" = s."id"
AND d."tenantId" IS NULL;

-- 3. Verificar se há registros sem tenantId (não deveria haver)
-- SELECT COUNT(*) FROM "Payment" WHERE "tenantId" IS NULL;
-- SELECT COUNT(*) FROM "Delivery" WHERE "tenantId" IS NULL;

-- 4. Tornar coluna NOT NULL (após confirmar que todos têm valor)
-- ALTER TABLE "Payment" ALTER COLUMN "tenantId" SET NOT NULL;
-- ALTER TABLE "Delivery" ALTER COLUMN "tenantId" SET NOT NULL;

-- 5. Adicionar foreign key e índices (Prisma fará isso automaticamente)

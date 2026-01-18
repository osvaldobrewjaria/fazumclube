/*
  Warnings:

  - A unique constraint covering the columns `[ownerId]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELED');

-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('BEER', 'WINE', 'COFFEE', 'SPIRITS', 'TEA', 'OTHER');

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "businessType" "BusinessType" NOT NULL DEFAULT 'BEER',
ADD COLUMN     "ownerId" TEXT,
ADD COLUMN     "settings" JSONB,
ADD COLUMN     "status" "TenantStatus" NOT NULL DEFAULT 'TRIAL',
ADD COLUMN     "stripeAccountId" TEXT,
ADD COLUMN     "stripeConnected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeOnboardingComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trialEndsAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_ownerId_key" ON "Tenant"("ownerId");

-- CreateIndex
CREATE INDEX "Tenant_ownerId_idx" ON "Tenant"("ownerId");

-- CreateIndex
CREATE INDEX "Tenant_status_idx" ON "Tenant"("status");

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
